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

// In development, this points to our local wrangler dev server. 
// In production, this will point to our deployed Cloudflare Worker URL.
const BACKEND_URL = 'http://127.0.0.1:8787';

export const fetchMovies = async (page = 1, limit = 50): Promise<Movie[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/vod/movies?page=${page}&limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.movies || [];
  } catch {
    return [];
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
