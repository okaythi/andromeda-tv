import { z } from 'zod';

export const RawChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  links: z.array(z.object({
    url: z.string(),
    ua: z.string().optional()
  })),
  thumb: z.string().optional(),
  category: z.string(),
  source: z.string()
});

export const RawEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  poster: z.string().optional(),
  category: z.string(),
  startTime: z.string(),
  status: z.string(),
  embeds: z.array(z.object({
    provider: z.string(),
    quality: z.string(),
    embed_url: z.string()
  }))
});

export type RawChannel = z.infer<typeof RawChannelSchema>;
export type RawEvent = z.infer<typeof RawEventSchema>;
