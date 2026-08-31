import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const movies = sqliteTable('movies', {
  id: text('id').primaryKey(),
  internalId: text('internal_id').notNull(),
  title: text('title').notNull(),
  overview: text('overview'),
  posterUrl: text('poster_url'),
  backdropUrl: text('backdrop_url'),
  rating: text('rating'),
  tmdbId: integer('tmdb_id'),
  category: text('category').notNull().default('Movies'),
});

export const series = sqliteTable('series', {
  id: text('id').primaryKey(),
  internalId: text('internal_id').notNull(),
  title: text('title').notNull(),
  overview: text('overview'),
  posterUrl: text('poster_url'),
  backdropUrl: text('backdrop_url'),
  rating: text('rating'),
  tmdbId: integer('tmdb_id'),
  category: text('category').notNull().default('Series'),
});

export const channels = sqliteTable('channels', {
  id: text('id').primaryKey(),
  internalId: text('internal_id').notNull(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  category: text('category').notNull(),
  source: text('source').notNull(),
  links: text('links').notNull(),
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  posterUrl: text('poster_url'),
  category: text('category').notNull(),
  startTime: text('start_time').notNull(),
  status: text('status').notNull(),
  embeds: text('embeds').notNull(),
});

export const tmdbMetadataCache = sqliteTable(
  'tmdb_metadata_cache',
  {
    cacheKey: text('cache_key').primaryKey(),
    payload: text('payload').notNull(),
    expiresAt: text('expires_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('idx_tmdb_metadata_cache_expiry').on(table.expiresAt)],
);

export const channelProgrammes = sqliteTable(
  'channel_programmes',
  {
    id: text('id').primaryKey(),
    channelId: text('channel_id').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    posterUrl: text('poster_url'),
    startsAt: text('starts_at').notNull(),
    endsAt: text('ends_at').notNull(),
  },
  (table) => [index('idx_channel_programmes_window').on(table.channelId, table.startsAt, table.endsAt)],
);
