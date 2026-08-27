import { z } from 'zod';

export const RawMovieSchema = z.object({
  id: z.string(),
  name: z.string(),
  thumb: z.string().optional(),
  fanart: z.string().optional(),
  category: z.string().optional(),
  info: z.string().optional(),
  internal_id: z.string(),
});

export const RawSeriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  thumb: z.string().optional(),
  fanart: z.string().optional(),
  category: z.string().optional(),
  info: z.string().optional(),
  internal_id: z.string(),
});

export type RawMovie = z.infer<typeof RawMovieSchema>;
export type RawSeries = z.infer<typeof RawSeriesSchema>;
