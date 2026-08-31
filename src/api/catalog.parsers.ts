import type {
  ChannelGuide,
  ChannelSummary,
  GuideProgramme,
  HomeData,
  MediaType,
  PaginatedTitles,
  SearchResults,
  TitleSummary,
} from '../../shared/catalog';
import {
  asArray,
  asRecord,
  nullableNumber,
  nullableString,
  requiredBoolean,
  requiredNumber,
  requiredString,
} from './json';

export function parseMediaType(value: unknown, context: string): MediaType {
  if (value === 'movie' || value === 'series') return value;
  throw new Error(`${context} must be movie or series.`);
}

export function parseTitleSummary(value: unknown, context = 'title'): TitleSummary {
  const record = asRecord(value, context);
  return {
    id: requiredString(record, 'id', context),
    mediaType: parseMediaType(record['mediaType'], `${context}.mediaType`),
    title: requiredString(record, 'title', context),
    overview: requiredString(record, 'overview', context),
    posterUrl: nullableString(record, 'posterUrl', context),
    backdropUrl: nullableString(record, 'backdropUrl', context),
    rating: nullableString(record, 'rating', context),
    tmdbId: nullableNumber(record, 'tmdbId', context),
    category: requiredString(record, 'category', context),
  };
}

export function parseChannelSummary(value: unknown, context = 'channel'): ChannelSummary {
  const record = asRecord(value, context);
  return {
    id: requiredString(record, 'id', context),
    name: requiredString(record, 'name', context),
    logoUrl: nullableString(record, 'logoUrl', context),
    category: requiredString(record, 'category', context),
    source: requiredString(record, 'source', context),
    isPlayable: requiredBoolean(record, 'isPlayable', context),
  };
}

function parseGuideProgramme(value: unknown, context: string): GuideProgramme {
  const record = asRecord(value, context);
  return {
    id: requiredString(record, 'id', context),
    channelId: requiredString(record, 'channelId', context),
    title: requiredString(record, 'title', context),
    description: requiredString(record, 'description', context),
    posterUrl: nullableString(record, 'posterUrl', context),
    startsAt: requiredString(record, 'startsAt', context),
    endsAt: requiredString(record, 'endsAt', context),
  };
}

export function parseHomeData(value: unknown): HomeData {
  const record = asRecord(value, 'home');
  return {
    popularMovies: asArray(record['popularMovies'], 'home.popularMovies')
      .map((item, index) => parseTitleSummary(item, `home.popularMovies[${index}]`)),
    popularSeries: asArray(record['popularSeries'], 'home.popularSeries')
      .map((item, index) => parseTitleSummary(item, `home.popularSeries[${index}]`)),
    animes: asArray(record['animes'], 'home.animes')
      .map((item, index) => parseTitleSummary(item, `home.animes[${index}]`)),
    doramas: asArray(record['doramas'], 'home.doramas')
      .map((item, index) => parseTitleSummary(item, `home.doramas[${index}]`)),
  };
}

export function parsePaginatedTitles(value: unknown): PaginatedTitles {
  const record = asRecord(value, 'paginated titles');
  return {
    page: requiredNumber(record, 'page', 'paginated titles'),
    limit: requiredNumber(record, 'limit', 'paginated titles'),
    total: requiredNumber(record, 'total', 'paginated titles'),
    items: asArray(record['items'], 'paginated titles.items')
      .map((item, index) => parseTitleSummary(item, `paginated titles.items[${index}]`)),
  };
}

export function parseChannels(value: unknown): ChannelSummary[] {
  const record = asRecord(value, 'channels response');
  const total = requiredNumber(record, 'total', 'channels response');
  const channels = asArray(record['channels'], 'channels response.channels')
    .map((item, index) => parseChannelSummary(item, `channels response.channels[${index}]`));

  if (total < channels.length) throw new Error('channels response total cannot be smaller than items.');
  return channels;
}

export function parseChannelGuide(value: unknown): ChannelGuide {
  const record = asRecord(value, 'channel guide');
  return {
    channel: parseChannelSummary(record['channel'], 'channel guide.channel'),
    programmes: asArray(record['programmes'], 'channel guide.programmes')
      .map((item, index) => parseGuideProgramme(item, `channel guide.programmes[${index}]`)),
  };
}

export function parseSearchResults(value: unknown): SearchResults {
  const record = asRecord(value, 'search results');
  return {
    query: requiredString(record, 'query', 'search results'),
    titles: asArray(record['titles'], 'search results.titles')
      .map((item, index) => parseTitleSummary(item, `search results.titles[${index}]`)),
    channels: asArray(record['channels'], 'search results.channels')
      .map((item, index) => parseChannelSummary(item, `search results.channels[${index}]`)),
  };
}
