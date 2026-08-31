export type MediaType = 'movie' | 'series';

export type MetadataStatus = 'ready' | 'unmatched' | 'unavailable';

export interface TitleSummary {
  id: string;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: string | null;
  tmdbId: number | null;
  category: string;
}

export interface ChannelSummary {
  id: string;
  name: string;
  logoUrl: string | null;
  category: string;
  source: string;
  isPlayable: boolean;
}

export interface HomeData {
  popularMovies: TitleSummary[];
  popularSeries: TitleSummary[];
  animes: TitleSummary[];
  doramas: TitleSummary[];
}

export interface PaginatedTitles {
  page: number;
  limit: number;
  total: number;
  items: TitleSummary[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  role: string;
  profileUrl: string | null;
}

export interface Trailer {
  id: string;
  name: string;
  site: string;
  type: string;
  url: string;
}

export interface SeasonSummary {
  seasonNumber: number;
  name: string;
  overview: string;
  posterUrl: string | null;
  airDate: string | null;
  episodeCount: number;
}

export interface TitleMetadata {
  status: MetadataStatus;
  tmdbId: number | null;
  title: string;
  originalTitle: string | null;
  overview: string;
  tagline: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number | null;
  releaseDate: string | null;
  year: number | null;
  runtimeMinutes: number | null;
  genres: Genre[];
  cast: CastMember[];
  trailers: Trailer[];
  seasons: SeasonSummary[];
}

export interface RelatedTitle {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number | null;
  releaseDate: string | null;
  catalogId: string | null;
}

export interface TitleDetail {
  catalog: TitleSummary;
  metadata: TitleMetadata;
  related: RelatedTitle[];
}

export interface Episode {
  episodeNumber: number;
  name: string;
  overview: string;
  stillUrl: string | null;
  airDate: string | null;
  runtimeMinutes: number | null;
}

export interface SeasonDetail {
  status: MetadataStatus;
  seriesId: string;
  tmdbId: number | null;
  season: SeasonSummary | null;
  episodes: Episode[];
}

export interface GuideProgramme {
  id: string;
  channelId: string;
  title: string;
  description: string;
  posterUrl: string | null;
  startsAt: string;
  endsAt: string;
}

export interface ChannelGuide {
  channel: ChannelSummary;
  programmes: GuideProgramme[];
}

export interface SearchResults {
  query: string;
  titles: TitleSummary[];
  channels: ChannelSummary[];
}
