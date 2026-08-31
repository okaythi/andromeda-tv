import { z } from 'zod';
import {
  TmdbMovieDetailSchema,
  TmdbSeasonDetailSchema,
  TmdbSeriesDetailSchema,
  type TmdbMovieDetail,
  type TmdbSeasonDetail,
  type TmdbSeriesDetail,
} from './tmdb.types';

const TmdbMatchCacheSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('matched'),
    tmdbId: z.number().int().positive(),
    confidence: z.number().min(0).max(1),
  }),
  z.object({ status: z.literal('unmatched') }),
]);

export type TmdbMatchCacheValue = z.infer<typeof TmdbMatchCacheSchema>;

export function parseMovieCache(value: unknown): TmdbMovieDetail | null {
  const parsed = TmdbMovieDetailSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function parseSeriesCache(value: unknown): TmdbSeriesDetail | null {
  const parsed = TmdbSeriesDetailSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function parseSeasonCache(value: unknown): TmdbSeasonDetail | null {
  const parsed = TmdbSeasonDetailSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function parseMatchCache(value: unknown): TmdbMatchCacheValue | null {
  const parsed = TmdbMatchCacheSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
