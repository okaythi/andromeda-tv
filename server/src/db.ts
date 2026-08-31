import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const dbPath = process.env['DATABASE_URL'] ? process.env['DATABASE_URL'].replace('file:', '') : 'sqlite.db';
const sqlite = new Database(dbPath);

sqlite.pragma('journal_mode = WAL');
sqlite.exec(`
CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  internal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  overview TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  rating TEXT,
  tmdb_id INTEGER,
  category TEXT NOT NULL DEFAULT 'Movies'
);
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY,
  internal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  overview TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  rating TEXT,
  tmdb_id INTEGER,
  category TEXT NOT NULL DEFAULT 'Series'
);
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  internal_id TEXT NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  links TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  category TEXT NOT NULL,
  start_time TEXT NOT NULL,
  status TEXT NOT NULL,
  embeds TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tmdb_metadata_cache (
  cache_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS channel_programmes (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  poster_url TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_channel_programmes_window
  ON channel_programmes (channel_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_tmdb_metadata_cache_expiry
  ON tmdb_metadata_cache (expires_at);
`);

export const db = drizzle(sqlite, { schema });
