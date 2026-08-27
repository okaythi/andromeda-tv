import { DrizzleD1Database } from 'drizzle-orm/d1';
import { movies, series, channels, events } from '../schema';
import { TMDBService } from './tmdb.service';
import { RawMovieSchema, RawSeriesSchema } from '../schemas/vod.schema';

export class SyncService {
  constructor(
    private readonly db: DrizzleD1Database,
    private readonly tmdb: TMDBService
  ) {}

  public async runGlobalSync(): Promise<void> {
    console.log('Starting global background sync...');
    
    // 1. Fetch raw data from providers (mocking the HTTP calls to OnePlay/Brazuca here for scaffolding)
    const rawMovies = [
      { id: '1', name: 'Inception', internal_id: 'opmovie#xyz' },
      { id: '2', name: 'The Matrix', internal_id: 'opmovie#abc' }
    ];

    // 2. Process and enrich Movies
    for (const raw of rawMovies) {
      const parsed = RawMovieSchema.safeParse(raw);
      if (!parsed.success) continue;

      const movie = parsed.data;
      
      // Throttle TMDB to respect 40 req/sec limit
      await new Promise(resolve => setTimeout(resolve, 50));
      const tmdbData = await this.tmdb.searchMovie(movie.name);

      await this.db.insert(movies).values({
        id: movie.id,
        internalId: movie.internal_id,
        title: movie.name,
        overview: tmdbData?.overview || movie.info || '',
        posterUrl: tmdbData?.poster_path ? \`https://image.tmdb.org/t/p/w500\${tmdbData.poster_path}\` : movie.thumb || '',
        backdropUrl: tmdbData?.backdrop_path ? \`https://image.tmdb.org/t/p/w1280\${tmdbData.backdrop_path}\` : movie.fanart || '',
        rating: tmdbData?.vote_average?.toString() || '0',
        tmdbId: tmdbData?.id || null,
        category: movie.category || 'Movies'
      }).onConflictDoUpdate({
        target: movies.id,
        set: {
          internalId: movie.internal_id,
          title: movie.name,
          overview: tmdbData?.overview || movie.info || '',
          posterUrl: tmdbData?.poster_path ? \`https://image.tmdb.org/t/p/w500\${tmdbData.poster_path}\` : movie.thumb || '',
          backdropUrl: tmdbData?.backdrop_path ? \`https://image.tmdb.org/t/p/w1280\${tmdbData.backdrop_path}\` : movie.fanart || '',
          rating: tmdbData?.vote_average?.toString() || '0'
        }
      });
    }

    console.log('Global sync completed successfully.');
  }
}
