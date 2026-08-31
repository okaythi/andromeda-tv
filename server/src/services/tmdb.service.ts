import { z } from 'zod';
import {
  TmdbMovieDetailSchema,
  TmdbSearchResponseSchema,
  TmdbSeasonDetailSchema,
  TmdbSeriesDetailSchema,
  type TmdbMovieDetail,
  type TmdbSearchResult,
  type TmdbSeasonDetail,
  type TmdbSeriesDetail,
} from './tmdb.types';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const DETAIL_APPEND_FIELDS = 'credits,videos,recommendations';

export type TmdbApiResult<T> =
  | { kind: 'success'; data: T }
  | { kind: 'not-found' }
  | { kind: 'unavailable' };

export class TMDBService {
  private readonly readAccessToken: string;

  public constructor(readAccessToken?: string) {
    this.readAccessToken = readAccessToken?.trim() ?? '';
  }

  public get isConfigured(): boolean {
    return this.readAccessToken.length > 0;
  }

  public async searchMovie(title: string): Promise<TmdbSearchResult | null> {
    const result = await this.search('/search/movie', title);
    return result.kind === 'success' ? result.data[0] ?? null : null;
  }

  public async searchSeries(title: string): Promise<TmdbSearchResult | null> {
    const result = await this.search('/search/tv', title);
    return result.kind === 'success' ? result.data[0] ?? null : null;
  }

  public async searchMovies(title: string): Promise<TmdbApiResult<TmdbSearchResult[]>> {
    return this.search('/search/movie', title);
  }

  public async searchSeriesCandidates(title: string): Promise<TmdbApiResult<TmdbSearchResult[]>> {
    return this.search('/search/tv', title);
  }

  public async getMovieDetail(tmdbId: number): Promise<TmdbApiResult<TmdbMovieDetail>> {
    return this.request(
      `/movie/${tmdbId}`,
      new URLSearchParams({
        language: 'pt-BR',
        append_to_response: DETAIL_APPEND_FIELDS,
      }),
      TmdbMovieDetailSchema,
    );
  }

  public async getSeriesDetail(tmdbId: number): Promise<TmdbApiResult<TmdbSeriesDetail>> {
    return this.request(
      `/tv/${tmdbId}`,
      new URLSearchParams({
        language: 'pt-BR',
        append_to_response: DETAIL_APPEND_FIELDS,
      }),
      TmdbSeriesDetailSchema,
    );
  }

  public async getSeasonDetail(
    tmdbId: number,
    seasonNumber: number,
  ): Promise<TmdbApiResult<TmdbSeasonDetail>> {
    return this.request(
      `/tv/${tmdbId}/season/${seasonNumber}`,
      new URLSearchParams({ language: 'pt-BR' }),
      TmdbSeasonDetailSchema,
    );
  }

  private async search(
    endpoint: '/search/movie' | '/search/tv',
    title: string,
  ): Promise<TmdbApiResult<TmdbSearchResult[]>> {
    const result = await this.request(
      endpoint,
      new URLSearchParams({
        query: title,
        language: 'pt-BR',
        page: '1',
        include_adult: 'false',
      }),
      TmdbSearchResponseSchema,
    );

    if (result.kind !== 'success') return result;
    return { kind: 'success', data: result.data.results };
  }

  private async request<Schema extends z.ZodTypeAny>(
    endpoint: string,
    queryParams: URLSearchParams,
    schema: Schema,
  ): Promise<TmdbApiResult<z.infer<Schema>>> {
    if (!this.isConfigured) return { kind: 'unavailable' };

    const url = `${TMDB_API_BASE_URL}${endpoint}?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.readAccessToken}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 404) return { kind: 'not-found' };
      if (!response.ok) return { kind: 'unavailable' };

      const payload: unknown = await response.json();
      const parsed = schema.safeParse(payload);
      return parsed.success
        ? { kind: 'success', data: parsed.data }
        : { kind: 'unavailable' };
    } catch {
      return { kind: 'unavailable' };
    }
  }
}
