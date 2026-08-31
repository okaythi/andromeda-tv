import type {
  CastMember,
  Episode,
  Genre,
  MetadataStatus,
  RelatedTitle,
  SeasonDetail,
  SeasonSummary,
  TitleDetail,
  TitleMetadata,
  Trailer,
} from '../../shared/catalog';
import { parseMediaType, parseTitleSummary } from './catalog.parsers';
import {
  asArray,
  asRecord,
  nullableNumber,
  nullableString,
  requiredNumber,
  requiredString,
} from './json';

function parseMetadataStatus(value: unknown, context: string): MetadataStatus {
  if (value === 'ready' || value === 'unmatched' || value === 'unavailable') return value;
  throw new Error(`${context} must be ready, unmatched, or unavailable.`);
}

function parseGenre(value: unknown, context: string): Genre {
  const record = asRecord(value, context);
  return {
    id: requiredNumber(record, 'id', context),
    name: requiredString(record, 'name', context),
  };
}

function parseCastMember(value: unknown, context: string): CastMember {
  const record = asRecord(value, context);
  return {
    id: requiredNumber(record, 'id', context),
    name: requiredString(record, 'name', context),
    role: requiredString(record, 'role', context),
    profileUrl: nullableString(record, 'profileUrl', context),
  };
}

function parseTrailer(value: unknown, context: string): Trailer {
  const record = asRecord(value, context);
  return {
    id: requiredString(record, 'id', context),
    name: requiredString(record, 'name', context),
    site: requiredString(record, 'site', context),
    type: requiredString(record, 'type', context),
    url: requiredString(record, 'url', context),
  };
}

export function parseSeasonSummary(value: unknown, context: string): SeasonSummary {
  const record = asRecord(value, context);
  return {
    seasonNumber: requiredNumber(record, 'seasonNumber', context),
    name: requiredString(record, 'name', context),
    overview: requiredString(record, 'overview', context),
    posterUrl: nullableString(record, 'posterUrl', context),
    airDate: nullableString(record, 'airDate', context),
    episodeCount: requiredNumber(record, 'episodeCount', context),
  };
}

function parseMetadata(value: unknown): TitleMetadata {
  const record = asRecord(value, 'title detail.metadata');
  return {
    status: parseMetadataStatus(record['status'], 'title detail.metadata.status'),
    tmdbId: nullableNumber(record, 'tmdbId', 'title detail.metadata'),
    title: requiredString(record, 'title', 'title detail.metadata'),
    originalTitle: nullableString(record, 'originalTitle', 'title detail.metadata'),
    overview: requiredString(record, 'overview', 'title detail.metadata'),
    tagline: nullableString(record, 'tagline', 'title detail.metadata'),
    posterUrl: nullableString(record, 'posterUrl', 'title detail.metadata'),
    backdropUrl: nullableString(record, 'backdropUrl', 'title detail.metadata'),
    rating: nullableNumber(record, 'rating', 'title detail.metadata'),
    releaseDate: nullableString(record, 'releaseDate', 'title detail.metadata'),
    year: nullableNumber(record, 'year', 'title detail.metadata'),
    runtimeMinutes: nullableNumber(record, 'runtimeMinutes', 'title detail.metadata'),
    genres: asArray(record['genres'], 'title detail.metadata.genres')
      .map((item, index) => parseGenre(item, `title detail.metadata.genres[${index}]`)),
    cast: asArray(record['cast'], 'title detail.metadata.cast')
      .map((item, index) => parseCastMember(item, `title detail.metadata.cast[${index}]`)),
    trailers: asArray(record['trailers'], 'title detail.metadata.trailers')
      .map((item, index) => parseTrailer(item, `title detail.metadata.trailers[${index}]`)),
    seasons: asArray(record['seasons'], 'title detail.metadata.seasons')
      .map((item, index) => parseSeasonSummary(item, `title detail.metadata.seasons[${index}]`)),
  };
}

function parseRelatedTitle(value: unknown, context: string): RelatedTitle {
  const record = asRecord(value, context);
  return {
    tmdbId: requiredNumber(record, 'tmdbId', context),
    mediaType: parseMediaType(record['mediaType'], `${context}.mediaType`),
    title: requiredString(record, 'title', context),
    overview: requiredString(record, 'overview', context),
    posterUrl: nullableString(record, 'posterUrl', context),
    backdropUrl: nullableString(record, 'backdropUrl', context),
    rating: nullableNumber(record, 'rating', context),
    releaseDate: nullableString(record, 'releaseDate', context),
    catalogId: nullableString(record, 'catalogId', context),
  };
}

function parseEpisode(value: unknown, context: string): Episode {
  const record = asRecord(value, context);
  return {
    episodeNumber: requiredNumber(record, 'episodeNumber', context),
    name: requiredString(record, 'name', context),
    overview: requiredString(record, 'overview', context),
    stillUrl: nullableString(record, 'stillUrl', context),
    airDate: nullableString(record, 'airDate', context),
    runtimeMinutes: nullableNumber(record, 'runtimeMinutes', context),
  };
}

export function parseTitleDetail(value: unknown): TitleDetail {
  const record = asRecord(value, 'title detail');
  return {
    catalog: parseTitleSummary(record['catalog'], 'title detail.catalog'),
    metadata: parseMetadata(record['metadata']),
    related: asArray(record['related'], 'title detail.related')
      .map((item, index) => parseRelatedTitle(item, `title detail.related[${index}]`)),
  };
}

export function parseSeasonDetail(value: unknown): SeasonDetail {
  const record = asRecord(value, 'season detail');
  const season = record['season'];
  return {
    status: parseMetadataStatus(record['status'], 'season detail.status'),
    seriesId: requiredString(record, 'seriesId', 'season detail'),
    tmdbId: nullableNumber(record, 'tmdbId', 'season detail'),
    season: season === null ? null : parseSeasonSummary(season, 'season detail.season'),
    episodes: asArray(record['episodes'], 'season detail.episodes')
      .map((item, index) => parseEpisode(item, `season detail.episodes[${index}]`)),
  };
}
