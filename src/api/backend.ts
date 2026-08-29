// Type-safe backend client
export interface Movie {
  id: string;
  internalId: string;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  rating: string;
  tmdbId: number | null;
  category: string;
}

export interface LiveStream {
  id: string;
  internalId: string;
  name: string;
  logoUrl: string;
  category: string;
  source: string;
  links: string; // JSON array of links
}

const BACKEND_URL = 'https://andromeda.nixlabs.tech';

export interface HomeData {
  popular_movies: Movie[];
  popular_series: Movie[];
  animes: Movie[];
  doramas: Movie[];
}

export const fetchHome = async (): Promise<HomeData> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/vod/home`);
    if (!res.ok) return { popular_movies: [], popular_series: [], animes: [], doramas: [] };
    const data = await res.json();
    return data as HomeData;
  } catch {
    return { popular_movies: [], popular_series: [], animes: [], doramas: [] };
  }
};

export interface PaginatedResult {
  total: number;
  items: Movie[];
}

export const fetchMovies = async (page = 1, limit = 50, category?: string): Promise<PaginatedResult> => {
  try {
    const url = new URL(`${BACKEND_URL}/api/vod/movies`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    if (category) url.searchParams.append('category', category);

    const res = await fetch(url.toString());
    if (!res.ok) return { total: 0, items: [] };
    const data = await res.json();
    return { total: data.total || 0, items: data.movies || [] };
  } catch {
    return { total: 0, items: [] };
  }
};

export const fetchSeries = async (page = 1, limit = 50, category?: string): Promise<PaginatedResult> => {
  try {
    const url = new URL(`${BACKEND_URL}/api/vod/series`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    if (category) url.searchParams.append('category', category);

    const res = await fetch(url.toString());
    if (!res.ok) return { total: 0, items: [] };
    const data = await res.json();
    return { total: data.total || 0, items: data.series || [] };
  } catch {
    return { total: 0, items: [] };
  }
};

export const fetchChannels = async (): Promise<LiveStream[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/live/channels`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.channels || [];
  } catch {
    return [];
  }
};
