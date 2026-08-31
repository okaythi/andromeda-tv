import type {
  MediaType,
  RelatedTitle,
  SeasonDetail,
  TitleDetail,
  TitleMetadata,
  TitleSummary,
} from '../../../shared/catalog';
import { CatalogRepository, type TmdbMatchState } from '../repositories/catalog.repository';
import { TmdbCacheRepository } from '../repositories/tmdb-cache.repository';
import {
  parseMatchCache,
  parseMovieCache,
  parseSeasonCache,
  parseSeriesCache,
  type TmdbMatchCacheValue,
} from './tmdb-cache.parsers';
import { findBestTmdbMatch } from './tmdb-match.service';
import {
  createCatalogFallbackMetadata,
  mapMovieMetadata,
  mapSeasonDetail,
  mapSeriesMetadata,
  type TmdbRecommendationSummary,
} from './tmdb-mapper';
import { TMDBService } from './tmdb.service';
import type { TmdbApiResult } from './tmdb.service';
import type { TmdbMovieDetail, TmdbSeriesDetail } from './tmdb.types';

const METADATA_CACHE_TTL_MS = 3 * 24 * 60 * 60 * 1000;

type MetadataResolution = {
  metadata: TitleMetadata;
  recommendations: TmdbRecommendationSummary[];
};

type TmdbIdResolution =
  | { status: 'ready'; tmdbId: number; title: TitleSummary }
  | { status: 'unmatched'; title: TitleSummary }
  | { status: 'unavailable'; title: TitleSummary };

export class TitleDetailService {
  public constructor(
    private readonly catalog: CatalogRepository,
    private readonly cache: TmdbCacheRepository,
    private readonly tmdb: TMDBService,
  ) {}

  public async getTitleDetail(mediaType: MediaType, id: string): Promise<TitleDetail | null> {
    const catalogRecord = await this.catalog.findTitleForDetail(mediaType, id);
    if (!catalogRecord) return null;

    const resolution = await this.resolveTmdbId(
      catalogRecord.title,
      catalogRecord.tmdbMatchState,
    );
    if (resolution.status !== 'ready') {
      return {
        catalog: resolution.title,
        metadata: createCatalogFallbackMetadata(resolution.title, resolution.status),
        related: [],
      };
    }

    const metadataResolution = await this.getMetadata(resolution.title, resolution.tmdbId);
    const related = await this.attachCatalogAvailability(
      resolution.title.mediaType,
      metadataResolution.recommendations,
    );

    return {
      catalog: resolution.title,
      metadata: metadataResolution.metadata,
      related,
    };
  }

  public async getSeasonDetail(seriesId: string, seasonNumber: number): Promise<SeasonDetail | null> {
    const catalogRecord = await this.catalog.findTitleForDetail('series', seriesId);
    if (!catalogRecord) return null;

    const resolution = await this.resolveTmdbId(
      catalogRecord.title,
      catalogRecord.tmdbMatchState,
    );
    if (resolution.status !== 'ready') {
      return {
        status: resolution.status,
        seriesId,
        tmdbId: null,
        season: null,
        episodes: [],
      };
    }

    const cacheKey = `season:series:${resolution.tmdbId}:${seasonNumber}`;
    const cached = await this.cache.read(cacheKey, parseSeasonCache);
    if (cached) return mapSeasonDetail(seriesId, resolution.tmdbId, cached);

    const result = await this.tmdb.getSeasonDetail(resolution.tmdbId, seasonNumber);
    if (result.kind !== 'success') {
      return {
        status: result.kind === 'not-found' ? 'unmatched' : 'unavailable',
        seriesId,
        tmdbId: resolution.tmdbId,
        season: null,
        episodes: [],
      };
    }

    await this.cache.write(cacheKey, result.data, METADATA_CACHE_TTL_MS);
    return mapSeasonDetail(seriesId, resolution.tmdbId, result.data);
  }

  private async resolveTmdbId(
    title: TitleSummary,
    matchState: TmdbMatchState,
  ): Promise<TmdbIdResolution> {
    if (matchState === 'unmatched') return { status: 'unmatched', title };

    if (title.tmdbId && title.tmdbId > 0) {
      return { status: 'ready', tmdbId: title.tmdbId, title };
    }

    if (!this.tmdb.isConfigured) return { status: 'unavailable', title };

    const cacheKey = `match:${title.mediaType}:${title.id}`;
    const cached = await this.cache.read(cacheKey, parseMatchCache);
    if (cached) return this.fromCachedMatch(title, cached);

    const searchResult = title.mediaType === 'movie'
      ? await this.tmdb.searchMovies(title.title)
      : await this.tmdb.searchSeriesCandidates(title.title);

    if (searchResult.kind !== 'success') {
      return { status: searchResult.kind === 'not-found' ? 'unmatched' : 'unavailable', title };
    }

    const match = findBestTmdbMatch(title.title, title.mediaType, searchResult.data);
    if (!match) {
      await this.cache.write(cacheKey, { status: 'unmatched' }, METADATA_CACHE_TTL_MS);
      return { status: 'unmatched', title };
    }

    const cachedMatch: TmdbMatchCacheValue = {
      status: 'matched',
      tmdbId: match.tmdbId,
      confidence: match.confidence,
    };
    await this.cache.write(cacheKey, cachedMatch, METADATA_CACHE_TTL_MS);
    await this.catalog.updateTmdbId(title.mediaType, title.id, match.tmdbId);

    return {
      status: 'ready',
      tmdbId: match.tmdbId,
      title: { ...title, tmdbId: match.tmdbId },
    };
  }

  private fromCachedMatch(title: TitleSummary, cached: TmdbMatchCacheValue): TmdbIdResolution {
    if (cached.status === 'unmatched') return { status: 'unmatched', title };

    return {
      status: 'ready',
      tmdbId: cached.tmdbId,
      title: { ...title, tmdbId: cached.tmdbId },
    };
  }

  private async getMetadata(title: TitleSummary, tmdbId: number): Promise<MetadataResolution> {
    if (title.mediaType === 'movie') {
      const result = await this.getMovieMetadata(tmdbId);
      if (result.kind !== 'success') {
        return {
          metadata: createCatalogFallbackMetadata(title, result.kind === 'not-found' ? 'unmatched' : 'unavailable'),
          recommendations: [],
        };
      }
      return mapMovieMetadata(result.data);
    }

    const result = await this.getSeriesMetadata(tmdbId);
    if (result.kind !== 'success') {
      return {
        metadata: createCatalogFallbackMetadata(title, result.kind === 'not-found' ? 'unmatched' : 'unavailable'),
        recommendations: [],
      };
    }
    return mapSeriesMetadata(result.data);
  }

  private async getMovieMetadata(tmdbId: number): Promise<TmdbApiResult<TmdbMovieDetail>> {
    const cacheKey = `detail:movie:${tmdbId}`;
    const cached = await this.cache.read(cacheKey, parseMovieCache);
    if (cached) return { kind: 'success', data: cached };

    const result = await this.tmdb.getMovieDetail(tmdbId);
    if (result.kind === 'success') await this.cache.write(cacheKey, result.data, METADATA_CACHE_TTL_MS);
    return result;
  }

  private async getSeriesMetadata(tmdbId: number): Promise<TmdbApiResult<TmdbSeriesDetail>> {
    const cacheKey = `detail:series:${tmdbId}`;
    const cached = await this.cache.read(cacheKey, parseSeriesCache);
    if (cached) return { kind: 'success', data: cached };

    const result = await this.tmdb.getSeriesDetail(tmdbId);
    if (result.kind === 'success') await this.cache.write(cacheKey, result.data, METADATA_CACHE_TTL_MS);
    return result;
  }

  private async attachCatalogAvailability(
    mediaType: MediaType,
    recommendations: TmdbRecommendationSummary[],
  ): Promise<RelatedTitle[]> {
    const catalogMatches = await this.catalog.findTitlesByTmdbIds(
      mediaType,
      recommendations.map((recommendation) => recommendation.tmdbId),
    );

    return recommendations.map((recommendation) => ({
      ...recommendation,
      catalogId: catalogMatches.get(recommendation.tmdbId)?.id ?? null,
    }));
  }
}
