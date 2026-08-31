import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { MediaType, TitleSummary } from '../../../shared/catalog';
import {
  fetchChannelGuide,
  fetchChannels,
  fetchHome,
  fetchMovies,
  fetchSeasonDetail,
  fetchSeries,
  fetchTitleDetail,
  searchCatalog,
} from '../../api/backend';

const CATALOG_STALE_TIME_MS = 60 * 1000;
const DETAIL_STALE_TIME_MS = 5 * 60 * 1000;
const PAGE_SIZE = 50;

export function useHomeQuery() {
  return useQuery({
    queryKey: ['catalog', 'home'] as const,
    queryFn: ({ signal }) => fetchHome(signal),
    staleTime: CATALOG_STALE_TIME_MS,
  });
}

export function useChannelsQuery(category?: string) {
  return useQuery({
    queryKey: ['catalog', 'channels', category ?? 'all'] as const,
    queryFn: ({ signal }) => fetchChannels(category, signal),
    staleTime: CATALOG_STALE_TIME_MS,
  });
}

export function useTitlePagesQuery(mediaType: MediaType, category?: string) {
  return useInfiniteQuery({
    queryKey: ['catalog', 'titles', mediaType, category ?? 'all'] as const,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => {
      const fetchPage = mediaType === 'movie' ? fetchMovies : fetchSeries;
      return fetchPage(pageParam, PAGE_SIZE, category, signal);
    },
    getNextPageParam: (lastPage) => (
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined
    ),
    staleTime: CATALOG_STALE_TIME_MS,
  });
}

export function useTitleDetailQuery(title: TitleSummary) {
  return useQuery({
    queryKey: ['catalog', 'title', title.mediaType, title.id] as const,
    queryFn: ({ signal }) => fetchTitleDetail(title.mediaType, title.id, signal),
    staleTime: DETAIL_STALE_TIME_MS,
  });
}

export function useSeasonDetailQuery(seriesId: string, seasonNumber: number | null) {
  return useQuery({
    queryKey: ['catalog', 'season', seriesId, seasonNumber] as const,
    queryFn: ({ signal }) => {
      if (seasonNumber === null) throw new Error('A season number is required.');
      return fetchSeasonDetail(seriesId, seasonNumber, signal);
    },
    enabled: seasonNumber !== null,
    staleTime: DETAIL_STALE_TIME_MS,
  });
}

export function useChannelGuideQuery(channelId: string, from: Date, to: Date) {
  return useQuery({
    queryKey: ['catalog', 'guide', channelId, from.toISOString(), to.toISOString()] as const,
    queryFn: ({ signal }) => fetchChannelGuide(channelId, from, to, signal),
    staleTime: CATALOG_STALE_TIME_MS,
  });
}

export function useSearchQuery(query: string) {
  const normalizedQuery = query.trim();
  return useQuery({
    queryKey: ['catalog', 'search', normalizedQuery] as const,
    queryFn: ({ signal }) => searchCatalog(normalizedQuery, signal),
    enabled: normalizedQuery.length >= 2,
    staleTime: 30 * 1000,
  });
}
