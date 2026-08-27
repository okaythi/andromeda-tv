import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

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
  // JSON array string of resolved links
  links: text('links').notNull(),
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  posterUrl: text('poster_url'),
  category: text('category').notNull(),
  startTime: text('start_time').notNull(),
  status: text('status').notNull(), // 'scheduled', 'live', 'finished'
  // JSON array string of embeds
  embeds: text('embeds').notNull(),
});
