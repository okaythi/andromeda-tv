import type {
  ChannelGuide,
  ChannelSummary,
  HomeData,
  MediaType,
  PaginatedTitles,
  SearchResults,
  SeasonDetail,
  TitleDetail,
  TitleSummary,
} from '../../shared/catalog';
import {
  parseChannelGuide,
  parseChannels,
  parseHomeData,
  parsePaginatedTitles,
  parseSearchResults,
} from './catalog.parsers';
import { getJson, createSearchParams } from './client';
import { parseSeasonDetail, parseTitleDetail } from './detail.parsers';

export type { ChannelSummary as LiveStream, HomeData, MediaType, PaginatedTitles, TitleDetail };
export type Movie = TitleSummary;

export function fetchHome(signal?: AbortSignal): Promise<HomeData> {
  return getJson('/api/vod/home', parseHomeData, signal);
}

export function fetchMovies(
  page = 1,
  limit = 50,
  category?: string,
  signal?: AbortSignal,
): Promise<PaginatedTitles> {
  return getJson(
    '/api/vod/movies',
    parsePaginatedTitles,
    signal,
    createSearchParams({ page, limit, category }),
  );
}

export function fetchSeries(
  page = 1,
  limit = 50,
  category?: string,
  signal?: AbortSignal,
): Promise<PaginatedTitles> {
  return getJson(
    '/api/vod/series',
    parsePaginatedTitles,
    signal,
    createSearchParams({ page, limit, category }),
  );
}

export function fetchChannels(category?: string, signal?: AbortSignal): Promise<ChannelSummary[]> {
  return getJson(
    '/api/live/channels',
    parseChannels,
    signal,
    createSearchParams({ category }),
  );
}

export function fetchTitleDetail(
  mediaType: MediaType,
  id: string,
  signal?: AbortSignal,
): Promise<TitleDetail> {
  return getJson(`/api/vod/titles/${mediaType}/${encodeURIComponent(id)}`, parseTitleDetail, signal);
}

export function fetchSeasonDetail(
  seriesId: string,
  seasonNumber: number,
  signal?: AbortSignal,
): Promise<SeasonDetail> {
  return getJson(
    `/api/vod/series/${encodeURIComponent(seriesId)}/seasons/${seasonNumber}`,
    parseSeasonDetail,
    signal,
  );
}

export function fetchChannelGuide(
  channelId: string,
  from: Date,
  to: Date,
  signal?: AbortSignal,
): Promise<ChannelGuide> {
  return getJson(
    `/api/live/channels/${encodeURIComponent(channelId)}/guide`,
    parseChannelGuide,
    signal,
    createSearchParams({ from: from.toISOString(), to: to.toISOString() }),
  );
}

export function searchCatalog(query: string, signal?: AbortSignal): Promise<SearchResults> {
  return getJson(
    '/api/search',
    parseSearchResults,
    signal,
    createSearchParams({ q: query }),
  );
}
