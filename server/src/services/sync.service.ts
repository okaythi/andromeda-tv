import { sql, eq, isNull } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { EventEmitter } from 'events';
import { channels, movies, series } from '../schema';
import * as schema from '../schema';
import { TMDBService } from './tmdb.service';
import { BrazucaParser } from './parsers/brazuca.parser';
import { OnePlayParser } from './parsers/oneplay.parser';

const GIST_BASE = 'https://gist.githubusercontent.com/skyrisk/16070347f20c87c72540f9f805b57a66/raw/';
const MOVIES_GIST = 'https://gist.githubusercontent.com/skyrisk/5b87797329c7b46422565ffbaab3be7e/raw/';

const BRAZUCA_FEEDS = [
  { url: `${MOVIES_GIST}lancamentos.xml`, category: 'Lançamentos', type: 'movie', prefix: 'lan_' },
  { url: `${MOVIES_GIST}page.xml`, category: 'Filmes', type: 'movie', prefix: 'fil_' },
  { url: `${GIST_BASE}AnimesBase`, category: 'Animes', type: 'tv', prefix: 'ani_' },
  { url: `${GIST_BASE}DoramasBase`, category: 'Doramas', type: 'tv', prefix: 'dor_' },
  { url: `${GIST_BASE}SeriesBase`, category: 'Séries', type: 'tv', prefix: 'ser_' },
] as const;

export type SyncState = {
  isSyncing: boolean;
  isEnriching: boolean;
  lastError: string | null;
  lastSuccess: string | null;
};

export class SyncService {
  public events = new EventEmitter();
  private state: SyncState = {
    isSyncing: false,
    isEnriching: false,
    lastError: null,
    lastSuccess: null,
  };

  constructor(
    private readonly db: BetterSQLite3Database<typeof schema>,
    private readonly tmdb: TMDBService,
    private readonly brazuca = new BrazucaParser(),
    private readonly oneplay = new OnePlayParser()
  ) {}

  public getState(): SyncState {
    return this.state;
  }

  private updateState(partial: Partial<SyncState>) {
    this.state = { ...this.state, ...partial };
    this.events.emit('status', this.state);
  }

  public async runGlobalSync(): Promise<void> {
    if (this.state.isSyncing) return;
    this.updateState({ isSyncing: true, lastError: null });

    try {
      const accounts = await this.oneplay.syncOnePlayAccounts().catch((e) => {
        console.warn('[SyncService] OnePlay account discovery warning:', e.message);
        return {} as Record<string, any>;
      });

      const [brazucaChannels, vodCatalogs, onePlayVod] = await Promise.all([
        this.brazuca.fetchChannels(`${GIST_BASE}channels.xml`),
        Promise.all(BRAZUCA_FEEDS.map(f => this.brazuca.fetchVod(f.url, f.category, f.type, f.prefix))),
        Object.keys(accounts).length > 0 ? this.oneplay.fetchVod(accounts) : Promise.resolve({ movies: [], series: [] })
      ]);

      const [lancamentos = [], filmes = [], animes = [], doramas = [], brazucaSeries = []] = vodCatalogs;
      const allMovies = [...lancamentos, ...filmes, ...onePlayVod.movies];
      const allSeries = [...animes, ...doramas, ...brazucaSeries, ...onePlayVod.series];

      this.db.transaction(() => {
        this.upsertChannels(brazucaChannels);
        this.upsertMovies(allMovies);
        this.upsertSeries(allSeries);
      });
      
      this.updateState({ lastSuccess: new Date().toISOString() });
      console.log(`Global sync completed: ${brazucaChannels.length} channels, ${allMovies.length} movies, ${allSeries.length} series.`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.updateState({ lastError: msg });
      console.error('[SyncService] Global sync failed:', error);
    } finally {
      this.updateState({ isSyncing: false });
    }
  }

  public async runTMDBEnrichment(batchSize = 50): Promise<void> {
    if (this.state.isEnriching) return;
    this.updateState({ isEnriching: true });

    try {
      const pendingMovies = await this.db.select().from(movies).where(isNull(movies.tmdbId)).limit(batchSize);
      
      for (const m of pendingMovies) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const data = await this.tmdb.searchMovie(m.title);
        
        await this.db.update(movies)
          .set({
            tmdbId: data?.id ?? -1,
            overview: data?.overview || m.overview,
            posterUrl: data?.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : m.posterUrl,
            backdropUrl: data?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : m.backdropUrl,
            rating: data?.vote_average?.toString() || m.rating
          })
          .where(eq(movies.id, m.id))
          .run();
      }

      const pendingSeries = await this.db.select().from(series).where(isNull(series.tmdbId)).limit(batchSize);
      
      for (const s of pendingSeries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const data = await this.tmdb.searchSeries(s.title);
        
        await this.db.update(series)
          .set({
            tmdbId: data?.id ?? -1, 
            overview: data?.overview || s.overview,
            posterUrl: data?.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : s.posterUrl,
            backdropUrl: data?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : s.backdropUrl,
            rating: data?.vote_average?.toString() || s.rating
          })
          .where(eq(series.id, s.id))
          .run();
      }
      
      if (pendingMovies.length > 0 || pendingSeries.length > 0) {
        console.log(`[TMDB] Enriched ${pendingMovies.length} movies and ${pendingSeries.length} series.`);
      }
    } catch (error) {
      console.error('[SyncService] TMDB Enrichment failed:', error);
    } finally {
      this.updateState({ isEnriching: false });
    }
  }

  private upsertChannels(rawChannels: Awaited<ReturnType<BrazucaParser['fetchChannels']>>): void {
    if (!rawChannels.length) return;

    const rows = rawChannels.map(ch => ({
      id: ch.id,
      internalId: ch.internalId,
      name: ch.name,
      logoUrl: ch.thumb,
      category: ch.category,
      source: 'Brazuca',
      links: JSON.stringify([{ url: ch.internalId, ua: 'XC-IPTV' }]),
    }));

    this.batchInsert(channels, rows, {
      internalId: sql`excluded.internal_id`,
      name: sql`excluded.name`,
      logoUrl: sql`excluded.logo_url`,
      category: sql`excluded.category`,
    });
  }

  private upsertMovies(rawMovies: Array<{ id: string; internalId: string; name: string; info?: string; thumb?: string; fanart?: string; category?: string }>): void {
    if (!rawMovies.length) return;

    const rows = rawMovies.map(m => ({
      id: m.id,
      internalId: m.internalId,
      title: m.name,
      overview: m.info ?? '',
      posterUrl: m.thumb ?? '',
      backdropUrl: m.fanart ?? '',
      rating: '0',
      tmdbId: null, // Keep null to signify pending TMDB enrichment
      category: m.category ?? 'Movies',
    }));

    this.batchInsert(movies, rows, {
      internalId: sql`excluded.internal_id`,
      title: sql`excluded.title`,
      category: sql`excluded.category`,
      // Intentionally omitting TMDB fields from onConflictDoUpdate so we don't overwrite enriched data on next sync
    });
  }

  private upsertSeries(rawSeries: Array<{ id: string; internalId: string; name: string; info?: string; thumb?: string; fanart?: string; category?: string }>): void {
    if (!rawSeries.length) return;

    const rows = rawSeries.map(s => ({
      id: s.id,
      internalId: s.internalId,
      title: s.name,
      overview: s.info ?? '',
      posterUrl: s.thumb ?? '',
      backdropUrl: s.fanart ?? '',
      rating: '0',
      tmdbId: null,
      category: s.category ?? 'Series',
    }));

    this.batchInsert(series, rows, {
      internalId: sql`excluded.internal_id`,
      title: sql`excluded.title`,
      category: sql`excluded.category`,
    });
  }

  private batchInsert<TTable extends typeof channels | typeof movies | typeof series>(
    table: TTable,
    rows: any[],
    conflictSet: Record<string, any>,
    chunkSize = 250
  ): void {
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      this.db
        .insert(table)
        .values(chunk)
        .onConflictDoUpdate({
          target: (table as any).id,
          set: conflictSet,
        })
        .run(); // .run() for better-sqlite3
    }
  }
}
