import type {
  CastMember,
  Episode,
  Genre,
  MediaType,
  MetadataStatus,
  SeasonDetail,
  SeasonSummary,
  TitleMetadata,
  TitleSummary,
  Trailer,
} from '../../../shared/catalog';
import type {
  TmdbMovieDetail,
  TmdbRecommendation,
  TmdbSeasonDetail,
  TmdbSeriesDetail,
} from './tmdb.types';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const MAX_CAST_MEMBERS = 12;
const MAX_RECOMMENDATIONS = 12;
const MAX_TRAILERS = 3;

export interface TmdbRecommendationSummary {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number | null;
  releaseDate: string | null;
}

function imageUrl(path: string | null | undefined, size: 'w185' | 'w500' | 'w780' | 'w1280'): string | null {
  return path && path.trim().length > 0 ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;
}

function toYear(date: string | null | undefined): number | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

function toGenres(genres: Array<{ id: number; name: string }>): Genre[] {
  return genres.map((genre) => ({ id: genre.id, name: genre.name }));
}

function toCast(cast: Array<{
  id: number;
  name: string;
  character?: string | undefined;
  profile_path?: string | null | undefined;
  order?: number | undefined;
}>): CastMember[] {
  return [...cast]
    .sort((left, right) => (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER))
    .slice(0, MAX_CAST_MEMBERS)
    .map((person) => ({
      id: person.id,
      name: person.name,
      role: person.character?.trim() || 'Elenco',
      profileUrl: imageUrl(person.profile_path, 'w185'),
    }));
}

function toTrailers(videos: Array<{
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean | undefined;
}>): Trailer[] {
  return [...videos]
    .filter((video) => video.site === 'YouTube' && video.key.trim().length > 0)
    .filter((video) => ['Trailer', 'Teaser'].includes(video.type))
    .sort((left, right) => Number(Boolean(right.official)) - Number(Boolean(left.official)))
    .slice(0, MAX_TRAILERS)
    .map((video) => ({
      id: video.id,
      name: video.name,
      site: video.site,
      type: video.type,
      url: `https://www.youtube.com/watch?v=${encodeURIComponent(video.key)}`,
    }));
}

function toRecommendation(
  recommendation: TmdbRecommendation,
  mediaType: MediaType,
): TmdbRecommendationSummary | null {
  const title = (mediaType === 'movie' ? recommendation.title : recommendation.name)?.trim() ?? '';
  if (!title) return null;

  return {
    tmdbId: recommendation.id,
    mediaType,
    title,
    overview: recommendation.overview?.trim() ?? '',
    posterUrl: imageUrl(recommendation.poster_path, 'w500'),
    backdropUrl: imageUrl(recommendation.backdrop_path, 'w1280'),
    rating: recommendation.vote_average ?? null,
    releaseDate: mediaType === 'movie'
      ? recommendation.release_date ?? null
      : recommendation.first_air_date ?? null,
  };
}

function toRecommendations(
  recommendations: TmdbRecommendation[],
  mediaType: MediaType,
): TmdbRecommendationSummary[] {
  return recommendations
    .map((recommendation) => toRecommendation(recommendation, mediaType))
    .filter((recommendation): recommendation is TmdbRecommendationSummary => recommendation !== null)
    .slice(0, MAX_RECOMMENDATIONS);
}

export function toSeasonSummary(season: {
  season_number: number;
  name: string;
  overview?: string | undefined;
  poster_path?: string | null | undefined;
  air_date?: string | null | undefined;
  episode_count?: number | undefined;
}): SeasonSummary {
  return {
    seasonNumber: season.season_number,
    name: season.name,
    overview: season.overview?.trim() ?? '',
    posterUrl: imageUrl(season.poster_path, 'w500'),
    airDate: season.air_date ?? null,
    episodeCount: season.episode_count ?? 0,
  };
}

export function createCatalogFallbackMetadata(
  title: TitleSummary,
  status: Exclude<MetadataStatus, 'ready'>,
): TitleMetadata {
  const parsedRating = title.rating ? Number.parseFloat(title.rating) : Number.NaN;

  return {
    status,
    tmdbId: title.tmdbId,
    title: title.title,
    originalTitle: null,
    overview: title.overview,
    tagline: null,
    posterUrl: title.posterUrl,
    backdropUrl: title.backdropUrl,
    rating: Number.isFinite(parsedRating) ? parsedRating : null,
    releaseDate: null,
    year: null,
    runtimeMinutes: null,
    genres: [],
    cast: [],
    trailers: [],
    seasons: [],
  };
}

export function mapMovieMetadata(detail: TmdbMovieDetail): {
  metadata: TitleMetadata;
  recommendations: TmdbRecommendationSummary[];
} {
  return {
    metadata: {
      status: 'ready',
      tmdbId: detail.id,
      title: detail.title,
      originalTitle: detail.original_title?.trim() || null,
      overview: detail.overview?.trim() ?? '',
      tagline: detail.tagline?.trim() || null,
      posterUrl: imageUrl(detail.poster_path, 'w780'),
      backdropUrl: imageUrl(detail.backdrop_path, 'w1280'),
      rating: detail.vote_average ?? null,
      releaseDate: detail.release_date ?? null,
      year: toYear(detail.release_date),
      runtimeMinutes: detail.runtime ?? null,
      genres: toGenres(detail.genres),
      cast: toCast(detail.credits?.cast ?? []),
      trailers: toTrailers(detail.videos?.results ?? []),
      seasons: [],
    },
    recommendations: toRecommendations(detail.recommendations?.results ?? [], 'movie'),
  };
}

export function mapSeriesMetadata(detail: TmdbSeriesDetail): {
  metadata: TitleMetadata;
  recommendations: TmdbRecommendationSummary[];
} {
  return {
    metadata: {
      status: 'ready',
      tmdbId: detail.id,
      title: detail.name,
      originalTitle: detail.original_name?.trim() || null,
      overview: detail.overview?.trim() ?? '',
      tagline: detail.tagline?.trim() || null,
      posterUrl: imageUrl(detail.poster_path, 'w780'),
      backdropUrl: imageUrl(detail.backdrop_path, 'w1280'),
      rating: detail.vote_average ?? null,
      releaseDate: detail.first_air_date ?? null,
      year: toYear(detail.first_air_date),
      runtimeMinutes: detail.episode_run_time.find((runtime) => runtime > 0) ?? null,
      genres: toGenres(detail.genres),
      cast: toCast(detail.credits?.cast ?? []),
      trailers: toTrailers(detail.videos?.results ?? []),
      seasons: detail.seasons
        .filter((season) => season.season_number > 0)
        .map(toSeasonSummary),
    },
    recommendations: toRecommendations(detail.recommendations?.results ?? [], 'series'),
  };
}

export function mapSeasonDetail(
  seriesId: string,
  tmdbId: number,
  detail: TmdbSeasonDetail,
): SeasonDetail {
  const season = toSeasonSummary({
    season_number: detail.season_number,
    name: detail.name,
    overview: detail.overview,
    poster_path: detail.poster_path,
    air_date: detail.air_date,
    episode_count: detail.episodes.length,
  });

  const episodes: Episode[] = detail.episodes.map((episode) => ({
    episodeNumber: episode.episode_number,
    name: episode.name,
    overview: episode.overview?.trim() ?? '',
    stillUrl: imageUrl(episode.still_path, 'w780'),
    airDate: episode.air_date ?? null,
    runtimeMinutes: episode.runtime ?? null,
  }));

  return {
    status: 'ready',
    seriesId,
    tmdbId,
    season,
    episodes,
  };
}
