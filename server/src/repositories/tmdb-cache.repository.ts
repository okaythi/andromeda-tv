import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { tmdbMetadataCache } from '../schema';
import type * as schema from '../schema';

type Database = BetterSQLite3Database<typeof schema>;

export type CacheValueParser<T> = (value: unknown) => T | null;

const MAX_CACHE_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export class TmdbCacheRepository {
  public constructor(private readonly database: Database) {}

  public async read<T>(cacheKey: string, parse: CacheValueParser<T>): Promise<T | null> {
    const rows = await this.database.select().from(tmdbMetadataCache)
      .where(eq(tmdbMetadataCache.cacheKey, cacheKey))
      .limit(1);
    const row = rows[0];
    if (!row) return null;

    const expiresAt = Date.parse(row.expiresAt);
    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      await this.database.delete(tmdbMetadataCache)
        .where(eq(tmdbMetadataCache.cacheKey, cacheKey))
        .run();
      return null;
    }

    try {
      const payload: unknown = JSON.parse(row.payload);
      return parse(payload);
    } catch {
      await this.database.delete(tmdbMetadataCache)
        .where(eq(tmdbMetadataCache.cacheKey, cacheKey))
        .run();
      return null;
    }
  }

  public async write(cacheKey: string, payload: unknown, ttlMs: number): Promise<void> {
    const expiresAt = new Date(Date.now() + Math.min(Math.max(ttlMs, 0), MAX_CACHE_TTL_MS)).toISOString();
    const updatedAt = new Date().toISOString();

    await this.database.insert(tmdbMetadataCache).values({
      cacheKey,
      payload: JSON.stringify(payload),
      expiresAt,
      updatedAt,
    }).onConflictDoUpdate({
      target: tmdbMetadataCache.cacheKey,
      set: {
        payload: JSON.stringify(payload),
        expiresAt,
        updatedAt,
      },
    }).run();
  }
}
