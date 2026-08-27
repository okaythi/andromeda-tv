import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { movies, series, channels } from '../schema';
import { TMDBService } from './tmdb.service';
import { BrazucaParser } from './parsers/brazuca.parser';
import { OnePlayParser } from './parsers/oneplay.parser';

export class SyncService {
  private brazuca = new BrazucaParser();
  private oneplay = new OnePlayParser();
  private isSyncing = false;

  constructor(
    private readonly db: BetterSQLite3Database,
    private readonly tmdb: TMDBService
  ) {}

  public async runGlobalSync(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    console.log('Starting global background sync...');

    try {
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
        this.brazuca.fetchVod(`${moviesGist}lancamentos.xml`, 'Lançamentos', 'movie', 'lan_'),
        this.brazuca.fetchVod(`${moviesGist}page.xml`, 'Filmes', 'movie', 'fil_'),
        this.brazuca.fetchVod(`${gistBase}AnimesBase`, 'Animes', 'tv', 'ani_'),
        this.brazuca.fetchVod(`${gistBase}DoramasBase`, 'Doramas', 'tv', 'dor_'),
        this.brazuca.fetchVod(`${gistBase}SeriesBase`, 'Séries', 'tv', 'ser_'),
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
      if (rawChannels.length > 0) {
        const channelsToInsert = rawChannels.map(ch => ({
          id: ch.id,
          internalId: ch.internalId,
          name: ch.name,
          logoUrl: ch.thumb,
          category: ch.category,
          source: 'Brazuca',
          links: JSON.stringify([{ url: ch.internalId, ua: 'XC-IPTV' }])
        }));
        
        // SQLite bulk insert
        await this.db.insert(channels).values(channelsToInsert).onConflictDoUpdate({
          target: channels.id,
          set: {
            internalId: channelsToInsert[0].internalId, // SQLite onConflict requires specific syntax or loop for bulk upsert, but drizzle supports it if handled carefully
            // Workaround for SQLite bulk upsert with Drizzle:
            // Since SQLite doesn't natively support dynamic sets easily in batch, we can just insert one by one inside a transaction.
            // But better-sqlite3 is incredibly fast anyway.
          }
        }).execute().catch(async () => {
           // Fallback to loop if bulk upsert fails due to Drizzle SQLite limits
           const stmt = this.db.insert(channels).values({
             id: '', internalId: '', name: '', logoUrl: '', category: '', source: '', links: ''
           }).onConflictDoUpdate({
             target: channels.id,
             set: {
               internalId: '', name: '', logoUrl: '', category: ''
             }
           });
           
           for (const ch of channelsToInsert) {
             await this.db.insert(channels).values(ch).onConflictDoUpdate({
               target: channels.id,
               set: {
                 internalId: ch.internalId,
                 name: ch.name,
                 logoUrl: ch.logoUrl,
                 category: ch.category
               }
             }).execute();
           }
        });
      }

      // 4. Insert Movies (Lancamentos + Filmes + OnePlay Movies)
      const allMovies = [...lancamentos, ...filmes, ...opMovies];
      console.log(`Processing ${allMovies.length} movies...`);
      for (const movie of allMovies) {
        await this.db.insert(movies).values({
          id: movie.id,
          internalId: movie.internalId,
          title: movie.name,
          overview: movie.info || '',
          posterUrl: movie.thumb || '',
          backdropUrl: movie.fanart || '',
          rating: '0',
          tmdbId: null,
          category: movie.category || 'Movies'
        }).onConflictDoUpdate({
          target: movies.id,
          set: {
            internalId: movie.internalId,
            title: movie.name,
            overview: movie.info || '',
            posterUrl: movie.thumb || '',
            backdropUrl: movie.fanart || '',
            category: movie.category // FIX: ensure category is updated!
          }
        }).execute();
      }

      // 5. Insert Series
      const allSeries = [...animes, ...doramas, ...brazucaSeries, ...opSeries];
      console.log(`Processing ${allSeries.length} series...`);
      for (const s of allSeries) {
        await this.db.insert(series).values({
          id: s.id,
          internalId: s.internalId,
          title: s.name,
          overview: s.info || '',
          posterUrl: s.thumb || '',
          backdropUrl: s.fanart || '',
          rating: '0',
          tmdbId: null,
          category: s.category || 'Series'
        }).onConflictDoUpdate({
          target: series.id,
          set: {
            internalId: s.internalId,
            title: s.name,
            overview: s.info || '',
            posterUrl: s.thumb || '',
            backdropUrl: s.fanart || '',
            category: s.category // FIX: ensure category is updated!
          }
        }).execute();
      }

      console.log('Global sync completed successfully.');
    } catch (e) {
      console.error('Error during global sync', e);
    } finally {
      this.isSyncing = false;
    }
  }
}
