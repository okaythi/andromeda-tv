import { sql } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { movies, series, channels } from '../schema';
import { TMDBService } from './tmdb.service';
import { BrazucaParser } from './parsers/brazuca.parser';
import { OnePlayParser } from './parsers/oneplay.parser';
import { findBestTmdbMatch } from './tmdb-match.service';

export class SyncService {
  private brazuca = new BrazucaParser();
  private oneplay = new OnePlayParser();

  constructor(
    private readonly db: DrizzleD1Database,
    private readonly tmdb: TMDBService
  ) {}

  public async runGlobalSync(): Promise<void> {
    console.log('Starting global background sync...');

    // 1. Fetch OnePlay Accounts
    const accounts = await this.oneplay.syncOnePlayAccounts();

    // 2. Parallel Fetch All XMLs & APIs
    const gistBase = "https://gist.githubusercontent.com/skyrisk/16070347f20c87c72540f9f805b57a66/raw/";
    const moviesGist = "https://gist.githubusercontent.com/skyrisk/5b87797329c7b46422565ffbaab3be7e/raw/";

    console.log('Fetching catalogs...');
    const [
      chRes, lancamentosRes, pageRes,
      animesRes, doramasRes, seriesRes, opVodRes
    ] = await Promise.allSettled([
      this.brazuca.fetchChannels(`${gistBase}channels.xml`),
      this.brazuca.fetchVod(`${moviesGist}lancamentos.xml`, 'Lançamentos', 'movie', 0),
      this.brazuca.fetchVod(`${moviesGist}page.xml`, 'Filmes', 'movie', 1000),
      this.brazuca.fetchVod(`${gistBase}AnimesBase`, 'Animes', 'tv', 0),
      this.brazuca.fetchVod(`${gistBase}DoramasBase`, 'Doramas', 'tv', 0),
      this.brazuca.fetchVod(`${gistBase}SeriesBase`, 'Séries', 'tv', 0),
      this.oneplay.fetchVod(accounts)
    ]);

    const rawChannels = chRes.status === 'fulfilled' ? chRes.value : [];
    const lancamentos = lancamentosRes.status === 'fulfilled' ? lancamentosRes.value : [];
    const filmes = pageRes.status === 'fulfilled' ? pageRes.value : [];
    const animes = animesRes.status === 'fulfilled' ? animesRes.value : [];
    const doramas = doramasRes.status === 'fulfilled' ? doramasRes.value : [];
    const brazucaSeries = seriesRes.status === 'fulfilled' ? seriesRes.value : [];
    const { movies: opMovies, series: opSeries } = opVodRes.status === 'fulfilled' ? opVodRes.value : { movies: [], series: [] };

    // 3. Insert Channels
    console.log(`Inserting ${rawChannels.length} channels...`);
    for (const ch of rawChannels) {
      await this.db.insert(channels).values({
        id: ch.id,
        internalId: ch.internalId,
        name: ch.name,
        logoUrl: ch.thumb,
        category: ch.category,
        source: 'Brazuca',
        links: JSON.stringify([{ url: ch.internalId, ua: 'XC-IPTV' }])
      }).onConflictDoUpdate({
        target: channels.id,
        set: {
          internalId: ch.internalId,
          name: ch.name,
          logoUrl: ch.thumb,
          category: ch.category
        }
      });
    }

    // 4. Insert Movies (Lancamentos + Filmes + OnePlay Movies)
    const allMovies = [...lancamentos, ...filmes, ...opMovies];
    console.log(`Processing ${allMovies.length} movies...`);
    for (const movie of allMovies) {
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      const searchResult = await this.tmdb.searchMovies(movie.name);
      const match = searchResult.kind === 'success'
        ? findBestTmdbMatch(movie.name, 'movie', searchResult.data)
        : null;
      const candidate = match?.candidate;
      const tmdbId = searchResult.kind === 'success' ? match?.tmdbId ?? -1 : null;

      await this.db.insert(movies).values({
        id: movie.id,
        internalId: movie.internalId,
        title: movie.name,
        overview: candidate?.overview || movie.info || '',
        posterUrl: candidate?.poster_path ? `https://image.tmdb.org/t/p/w500${candidate.poster_path}` : movie.thumb || '',
        backdropUrl: candidate?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${candidate.backdrop_path}` : movie.fanart || '',
        rating: candidate?.vote_average?.toString() || '0',
        tmdbId,
        category: movie.category || 'Movies'
      }).onConflictDoUpdate({
        target: movies.id,
        set: {
          internalId: movie.internalId,
          title: movie.name,
          overview: candidate?.overview || movie.info || '',
          posterUrl: candidate?.poster_path ? `https://image.tmdb.org/t/p/w500${candidate.poster_path}` : movie.thumb || '',
          backdropUrl: candidate?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${candidate.backdrop_path}` : movie.fanart || '',
          rating: candidate?.vote_average?.toString() || '0',
          tmdbId: searchResult.kind === 'success' ? tmdbId : sql`tmdb_id`,
        }
      });
    }

    // 5. Insert Series (Animes + Doramas + BrazucaSeries + OnePlaySeries)
    const allSeries = [...animes, ...doramas, ...brazucaSeries, ...opSeries];
    console.log(`Processing ${allSeries.length} series...`);
    for (const seriesTitle of allSeries) {
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      const searchResult = await this.tmdb.searchSeriesCandidates(seriesTitle.name);
      const match = searchResult.kind === 'success'
        ? findBestTmdbMatch(seriesTitle.name, 'series', searchResult.data)
        : null;
      const candidate = match?.candidate;
      const tmdbId = searchResult.kind === 'success' ? match?.tmdbId ?? -1 : null;

      await this.db.insert(series).values({
        id: seriesTitle.id,
        internalId: seriesTitle.internalId,
        title: seriesTitle.name,
        overview: candidate?.overview || seriesTitle.info || '',
        posterUrl: candidate?.poster_path ? `https://image.tmdb.org/t/p/w500${candidate.poster_path}` : seriesTitle.thumb || '',
        backdropUrl: candidate?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${candidate.backdrop_path}` : seriesTitle.fanart || '',
        rating: candidate?.vote_average?.toString() || '0',
        tmdbId,
        category: seriesTitle.category || 'Series'
      }).onConflictDoUpdate({
        target: series.id,
        set: {
          internalId: seriesTitle.internalId,
          title: seriesTitle.name,
          overview: candidate?.overview || seriesTitle.info || '',
          posterUrl: candidate?.poster_path ? `https://image.tmdb.org/t/p/w500${candidate.poster_path}` : seriesTitle.thumb || '',
          backdropUrl: candidate?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${candidate.backdrop_path}` : seriesTitle.fanart || '',
          rating: candidate?.vote_average?.toString() || '0',
          tmdbId: searchResult.kind === 'success' ? tmdbId : sql`tmdb_id`,
        }
      });
    }

    console.log('Global sync completed successfully.');
  }
}
