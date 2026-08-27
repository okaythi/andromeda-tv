import { DrizzleD1Database } from 'drizzle-orm/d1';
import { movies } from '../schema';
import { TMDBService } from './tmdb.service';

function cleanTitle(raw: string): string {
  if (!raw) return '';
  let t = raw;
  t = t.replace(/\[\/?COLOR[^\]]*\]/gi, '');
  t = t.replace(/\[\/?B\]/gi, '');
  t = t.replace(/\[\/?I\]/gi, '');
  t = t.replace(/\[OnePlay\]/gi, '');
  t = t.replace(/\[Brazuca\]/gi, '');
  t = t.replace(/\|\|\|/g, '').replace(/\[CR\]/g, '\n').trim();
  return t;
}

function decodePoster(url: string | undefined): string {
  if (!url) return '';
  const clean = url.trim();
  if (!clean || clean === '[object Object]') return '';
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  try {
    const dec = atob(clean);
    if (dec.startsWith('http')) return dec;
  } catch (e) {
    // Ignore error
  }
  return clean;
}

export class SyncService {
  constructor(
    private readonly db: DrizzleD1Database,
    private readonly tmdb: TMDBService
  ) {}

  public async runGlobalSync(): Promise<void> {
    console.log('Starting global background sync...');
    
    // Fetch Brazuca VOD (Lancamentos)
    const moviesUrl = "https://gist.githubusercontent.com/skyrisk/5b87797329c7b46422565ffbaab3be7e/raw/lancamentos.xml";
    const rawMovies = await this.fetchBrazucaVod(moviesUrl, 'Lançamentos', 'movie');

    // Process and enrich Movies
    for (const movie of rawMovies) {
      // Throttle TMDB to respect 40 req/sec limit
      await new Promise(resolve => setTimeout(resolve, 50));
      const tmdbData = await this.tmdb.searchMovie(movie.name);

      await this.db.insert(movies).values({
        id: movie.id,
        internalId: movie.internalId,
        title: movie.name,
        overview: tmdbData?.overview || movie.info || '',
        posterUrl: tmdbData?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : movie.thumb || '',
        backdropUrl: tmdbData?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}` : movie.fanart || '',
        rating: tmdbData?.vote_average?.toString() || '0',
        tmdbId: tmdbData?.id || null,
        category: movie.category || 'Movies'
      }).onConflictDoUpdate({
        target: movies.id,
        set: {
          internalId: movie.internalId,
          title: movie.name,
          overview: tmdbData?.overview || movie.info || '',
          posterUrl: tmdbData?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : movie.thumb || '',
          backdropUrl: tmdbData?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}` : movie.fanart || '',
          rating: tmdbData?.vote_average?.toString() || '0'
        }
      });
    }

    console.log('Global sync completed successfully.');
  }

  private async fetchBrazucaVod(url: string, category: string, contentType: string) {
    const itemsOut: Array<{id: string, name: string, thumb: string, fanart: string, category: string, contentType: string, info: string, internalId: string}> = [];
    try {
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const rawText = await resp.text();
      
      const itemRegex = /<(?:channel|item)>([\s\S]*?)<\/(?:channel|item)>/g;
      let match;
      while ((match = itemRegex.exec(rawText)) !== null) {
        const itemStr = match[1];
        if (!itemStr) continue;
        
        const nameM = itemStr.match(/<(?:name|title)>([\s\S]*?)<\/(?:name|title)>/);
        if (!nameM || !nameM[1]) continue;
        const rawName = cleanTitle(nameM[1]);
        if (!rawName || rawName.toUpperCase().includes('PRÓXIMA PÁGINA')) continue;

        const linkM = itemStr.match(/<(?:externallink|link)>([\s\S]*?)<\/(?:externallink|link)>/);
        const linkVal = (linkM && linkM[1]) ? linkM[1].trim() : '';
        
        const thumbM = itemStr.match(/<(?:thumbnail|poster|img)>([\s\S]*?)<\/(?:thumbnail|poster|img)>/);
        const thumbVal = decodePoster((thumbM && thumbM[1]) ? thumbM[1].trim() : '');
        
        const fanartM = itemStr.match(/<(?:fanart|backdrop|cover)>([\s\S]*?)<\/(?:fanart|backdrop|cover)>/);
        const fanartVal = decodePoster((fanartM && fanartM[1]) ? fanartM[1].trim() : '') || thumbVal;
        
        const infoM = itemStr.match(/<info>([\s\S]*?)<\/info>/);
        const infoVal = cleanTitle((infoM && infoM[1]) ? infoM[1] : '');

        let finalId = linkVal;
        if (linkVal.startsWith('#')) {
          const parts = linkVal.split('=');
          if (parts.length > 1 && parts[1]) {
            finalId = parts[1];
          }
        }

        itemsOut.push({
          id: `vod_${itemsOut.length + 1}`,
          name: rawName,
          thumb: thumbVal,
          fanart: fanartVal,
          category,
          contentType,
          info: infoVal,
          internalId: finalId
        });
      }
    } catch (e) {
      console.error(`[VOD] Error downloading ${category}: `, e);
    }
    return itemsOut;
  }
}
