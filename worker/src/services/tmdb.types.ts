import { z } from 'zod';

const NullableImagePathSchema = z.string().nullable().optional();

export const TmdbGenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const TmdbCastSchema = z.object({
  id: z.number(),
  name: z.string(),
  character: z.string().optional(),
  profile_path: NullableImagePathSchema,
  order: z.number().optional(),
});

export const TmdbVideoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  site: z.string(),
  type: z.string(),
  official: z.boolean().optional(),
});

export const TmdbRecommendationSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  overview: z.string().optional(),
  poster_path: NullableImagePathSchema,
  backdrop_path: NullableImagePathSchema,
  vote_average: z.number().optional(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
});

export const TmdbSearchResultSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  original_title: z.string().optional(),
  original_name: z.string().optional(),
  overview: z.string().optional(),
  poster_path: NullableImagePathSchema,
  backdrop_path: NullableImagePathSchema,
  vote_average: z.number().optional(),
  popularity: z.number().optional(),
  vote_count: z.number().optional(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
});

export const TmdbSearchResponseSchema = z.object({
  results: z.array(TmdbSearchResultSchema).default([]),
});

const TmdbCreditsSchema = z.object({
  cast: z.array(TmdbCastSchema).default([]),
}).optional();

const TmdbVideosSchema = z.object({
  results: z.array(TmdbVideoSchema).default([]),
}).optional();

const TmdbRecommendationsSchema = z.object({
  results: z.array(TmdbRecommendationSchema).default([]),
}).optional();

export const TmdbSeasonSummarySchema = z.object({
  season_number: z.number(),
  name: z.string(),
  overview: z.string().optional(),
  poster_path: NullableImagePathSchema,
  air_date: z.string().nullable().optional(),
  episode_count: z.number().optional(),
});

export const TmdbMovieDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().optional(),
  overview: z.string().optional(),
  tagline: z.string().optional(),
  poster_path: NullableImagePathSchema,
  backdrop_path: NullableImagePathSchema,
  vote_average: z.number().optional(),
  release_date: z.string().optional(),
  runtime: z.number().nullable().optional(),
  genres: z.array(TmdbGenreSchema).default([]),
  credits: TmdbCreditsSchema,
  videos: TmdbVideosSchema,
  recommendations: TmdbRecommendationsSchema,
});

export const TmdbSeriesDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  original_name: z.string().optional(),
  overview: z.string().optional(),
  tagline: z.string().optional(),
  poster_path: NullableImagePathSchema,
  backdrop_path: NullableImagePathSchema,
  vote_average: z.number().optional(),
  first_air_date: z.string().optional(),
  episode_run_time: z.array(z.number()).default([]),
  genres: z.array(TmdbGenreSchema).default([]),
  seasons: z.array(TmdbSeasonSummarySchema).default([]),
  credits: TmdbCreditsSchema,
  videos: TmdbVideosSchema,
  recommendations: TmdbRecommendationsSchema,
});

export const TmdbEpisodeSchema = z.object({
  episode_number: z.number(),
  name: z.string(),
  overview: z.string().optional(),
  still_path: NullableImagePathSchema,
  air_date: z.string().nullable().optional(),
  runtime: z.number().nullable().optional(),
});

export const TmdbSeasonDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string().optional(),
  poster_path: NullableImagePathSchema,
  air_date: z.string().nullable().optional(),
  season_number: z.number(),
  episodes: z.array(TmdbEpisodeSchema).default([]),
});

export type TmdbMovieDetail = z.infer<typeof TmdbMovieDetailSchema>;
export type TmdbRecommendation = z.infer<typeof TmdbRecommendationSchema>;
export type TmdbSearchResult = z.infer<typeof TmdbSearchResultSchema>;
export type TmdbSeasonDetail = z.infer<typeof TmdbSeasonDetailSchema>;
export type TmdbSeriesDetail = z.infer<typeof TmdbSeriesDetailSchema>;
