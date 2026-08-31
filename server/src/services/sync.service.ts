import { eq, isNull, sql } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { EventEmitter } from 'events';
import { channels, movies, series } from '../schema';
import * as schema from '../schema';
import { BrazucaParser, type ParsedChannel, type ParsedItem } from './parsers/brazuca.parser';
import { OnePlayParser, type OnePlayAccount } from './parsers/oneplay.parser';
import { findBestTmdbMatch } from './tmdb-match.service';
import { TMDBService } from './tmdb.service';

const GIST_BASE = 'https://gist.githubusercontent.com/skyrisk/16070347f20c87c72540f9f805b57a66/raw/';
const MOVIES_GIST = 'https://gist.githubusercontent.com/skyrisk/5b87797329c7b46422565ffbaab3be7e/raw/';
const UPSERT_CHUNK_SIZE = 250;

const BRAZUCA_FEEDS = [
  { url: `${MOVIES_GIST}lancamentos.xml`, category: 'Lançamentos', type: 'movie', prefix: 'lan_' },
  { url: `${MOVIES_GIST}page.xml`, category: 'Filmes', type: 'movie', prefix: 'fil_' },
  { url: `${GIST_BASE}AnimesBase`, category: 'Animes', type: 'tv', prefix: 'ani_' },
  { url: `${GIST_BASE}DoramasBase`, category: 'Doramas', type: 'tv', prefix: 'dor_' },
  { url: `${GIST_BASE}SeriesBase`, category: 'Séries', type: 'tv', prefix: 'ser_' },
] as const;

export interface SyncState {
  isSyncing: boolean;
  isEnriching: boolean;
  lastError: string | null;
  lastSuccess: string | null;
}

export class SyncService {
  public readonly events = new EventEmitter();
  private state: SyncState = {
    isSyncing: false,
    isEnriching: false,
    lastError: null,
    lastSuccess: null,
  };

  public constructor(
    private readonly database: BetterSQLite3Database<typeof schema>,
    private readonly tmdb: TMDBService,
    private readonly brazuca = new BrazucaParser(),
    private readonly oneplay = new OnePlayParser(),
  ) {}

  public getState(): SyncState {
    return this.state;
  }

  public async runGlobalSync(): Promise<void> {
    if (this.state.isSyncing) return;
    this.updateState({ isSyncing: true, lastError: null });

    try {
      const accounts = await this.loadOnePlayAccounts();
      const [brazucaChannels, vodCatalogs, onePlayVod] = await Promise.all([
        this.brazuca.fetchChannels(`${GIST_BASE}channels.xml`),
        Promise.all(BRAZUCA_FEEDS.map((feed) => this.brazuca.fetchVod(feed.url, feed.category, feed.type, feed.prefix))),
        Object.keys(accounts).length > 0 ? this.oneplay.fetchVod(accounts) : Promise.resolve({ movies: [], series: [] }),
      ]);

      const [lancamentos = [], filmes = [], animes = [], doramas = [], brazucaSeries = []] = vodCatalogs;
      const allMovies = [...lancamentos, ...filmes, ...onePlayVod.movies];
      const allSeries = [...animes, ...doramas, ...brazucaSeries, ...onePlayVod.series];

      this.database.transaction(() => {
        this.upsertChannels(brazucaChannels);
        this.upsertMovies(allMovies);
        this.upsertSeries(allSeries);
      });

      this.updateState({ lastSuccess: new Date().toISOString() });
      console.log(`Global sync completed: ${brazucaChannels.length} channels, ${allMovies.length} movies, ${allSeries.length} series.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.updateState({ lastError: message });
      console.error('[SyncService] Global sync failed:', error);
    } finally {
      this.updateState({ isSyncing: false });
    }
  }

  public async runTMDBEnrichment(batchSize = 50): Promise<void> {
    if (this.state.isEnriching || !this.tmdb.isConfigured) return;
    this.updateState({ isEnriching: true });

    try {
      const pendingMovies = await this.database.select().from(movies).where(isNull(movies.tmdbId)).limit(batchSize);
      for (const movie of pendingMovies) {
        await this.enrichMovie(movie);
      }

      const pendingSeries = await this.database.select().from(series).where(isNull(series.tmdbId)).limit(batchSize);
      for (const seriesTitle of pendingSeries) {
        await this.enrichSeries(seriesTitle);
      }

      if (pendingMovies.length > 0 || pendingSeries.length > 0) {
        console.log(`[TMDB] Enriched ${pendingMovies.length} movies and ${pendingSeries.length} series.`);
      }
    } catch (error: unknown) {
      console.error('[SyncService] TMDB enrichment failed:', error);
    } finally {
      this.updateState({ isEnriching: false });
    }
  }

  private updateState(partial: Partial<SyncState>): void {
    this.state = { ...this.state, ...partial };
    this.events.emit('status', this.state);
  }

  private async loadOnePlayAccounts(): Promise<Record<string, OnePlayAccount>> {
    try {
      return await this.oneplay.syncOnePlayAccounts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[SyncService] OnePlay account discovery warning:', message);
      return {};
    }
  }

  private async enrichMovie(movie: typeof movies.$inferSelect): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    const searchResult = await this.tmdb.searchMovies(movie.title);
    if (searchResult.kind !== 'success') return;

    const match = findBestTmdbMatch(movie.title, 'movie', searchResult.data);
    const candidate = match?.candidate;

    await this.database.update(movies).set({
      tmdbId: match?.tmdbId ?? -1,
      overview: candidate?.overview || movie.overview,
      posterUrl: candidate?.poster_path ? `https://image.tmdb.org/t/p/w500${candidate.poster_path}` : movie.posterUrl,
      backdropUrl: candidate?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${candidate.backdrop_path}` : movie.backdropUrl,
      rating: candidate?.vote_average?.toString() || movie.rating,
    }).where(eq(movies.id, movie.id)).run();
  }

  private async enrichSeries(seriesTitle: typeof series.$inferSelect): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    const searchResult = await this.tmdb.searchSeriesCandidates(seriesTitle.title);
    if (searchResult.kind !== 'success') return;

    const match = findBestTmdbMatch(seriesTitle.title, 'series', searchResult.data);
    const candidate = match?.candidate;

    await this.database.update(series).set({
      tmdbId: match?.tmdbId ?? -1,
      overview: candidate?.overview || seriesTitle.overview,
      posterUrl: candidate?.poster_path ? `https://image.tmdb.org/t/p/w500${candidate.poster_path}` : seriesTitle.posterUrl,
      backdropUrl: candidate?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${candidate.backdrop_path}` : seriesTitle.backdropUrl,
      rating: candidate?.vote_average?.toString() || seriesTitle.rating,
    }).where(eq(series.id, seriesTitle.id)).run();
  }

  private upsertChannels(rawChannels: ParsedChannel[]): void {
    if (rawChannels.length === 0) return;
    const rows = rawChannels.map((channel) => ({
      id: channel.id,
      internalId: channel.internalId,
      name: channel.name,
      logoUrl: channel.thumb,
      category: channel.category,
      source: 'Brazuca',
      links: JSON.stringify([{ url: channel.internalId, ua: 'XC-IPTV' }]),
    }));

    for (let index = 0; index < rows.length; index += UPSERT_CHUNK_SIZE) {
      this.database.insert(channels).values(rows.slice(index, index + UPSERT_CHUNK_SIZE)).onConflictDoUpdate({
        target: channels.id,
        set: {
          internalId: sql`excluded.internal_id`,
          name: sql`excluded.name`,
          logoUrl: sql`excluded.logo_url`,
          category: sql`excluded.category`,
        },
      }).run();
    }
  }

  private upsertMovies(rawMovies: ParsedItem[]): void {
    if (rawMovies.length === 0) return;
    const rows = rawMovies.map((movie) => ({
      id: movie.id,
      internalId: movie.internalId,
      title: movie.name,
      overview: movie.info,
      posterUrl: movie.thumb,
      backdropUrl: movie.fanart,
      rating: '0',
      tmdbId: null,
      category: movie.category,
    }));

    for (let index = 0; index < rows.length; index += UPSERT_CHUNK_SIZE) {
      this.database.insert(movies).values(rows.slice(index, index + UPSERT_CHUNK_SIZE)).onConflictDoUpdate({
        target: movies.id,
        set: {
          internalId: sql`excluded.internal_id`,
          title: sql`excluded.title`,
          category: sql`excluded.category`,
        },
      }).run();
    }
  }

  private upsertSeries(rawSeries: ParsedItem[]): void {
    if (rawSeries.length === 0) return;
    const rows = rawSeries.map((seriesTitle) => ({
      id: seriesTitle.id,
      internalId: seriesTitle.internalId,
      title: seriesTitle.name,
      overview: seriesTitle.info,
      posterUrl: seriesTitle.thumb,
      backdropUrl: seriesTitle.fanart,
      rating: '0',
      tmdbId: null,
      category: seriesTitle.category,
    }));

    for (let index = 0; index < rows.length; index += UPSERT_CHUNK_SIZE) {
      this.database.insert(series).values(rows.slice(index, index + UPSERT_CHUNK_SIZE)).onConflictDoUpdate({
        target: series.id,
        set: {
          internalId: sql`excluded.internal_id`,
          title: sql`excluded.title`,
          category: sql`excluded.category`,
        },
      }).run();
    }
  }
}
