import { and, asc, count, eq, gte, inArray, like, lte, ne, or } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type {
  ChannelGuide,
  ChannelSummary,
  GuideProgramme,
  HomeData,
  MediaType,
  PaginatedTitles,
  SearchResults,
  TitleSummary,
} from '../../../shared/catalog';
import { channelProgrammes, channels, movies, series } from '../schema';

type Database = DrizzleD1Database;
type CatalogRow = typeof movies.$inferSelect;
type ChannelRow = typeof channels.$inferSelect;
type ProgrammeRow = typeof channelProgrammes.$inferSelect;

export type TmdbMatchState = 'matched' | 'unmatched' | 'unknown';

export interface TitleDetailCatalogRecord {
  title: TitleSummary;
  tmdbMatchState: TmdbMatchState;
}

const NON_PLAYABLE_INTERNAL_ID = 'here';

function toNullableString(value: string | null): string | null {
  return value && value.trim().length > 0 ? value : null;
}

function toTitleSummary(row: CatalogRow, mediaType: MediaType): TitleSummary {
  return {
    id: row.id,
    mediaType,
    title: row.title,
    overview: row.overview ?? '',
    posterUrl: toNullableString(row.posterUrl),
    backdropUrl: toNullableString(row.backdropUrl),
    rating: toNullableString(row.rating),
    tmdbId: row.tmdbId && row.tmdbId > 0 ? row.tmdbId : null,
    category: row.category,
  };
}

function toTitleDetailCatalogRecord(row: CatalogRow, mediaType: MediaType): TitleDetailCatalogRecord {
  return {
    title: toTitleSummary(row, mediaType),
    tmdbMatchState: row.tmdbId === -1
      ? 'unmatched'
      : row.tmdbId !== null && row.tmdbId > 0
        ? 'matched'
        : 'unknown',
  };
}

function toChannelSummary(row: ChannelRow): ChannelSummary {
  return {
    id: row.id,
    name: row.name,
    logoUrl: toNullableString(row.logoUrl),
    category: row.category,
    source: row.source,
    isPlayable: row.links.trim().length > 2,
  };
}

function toGuideProgramme(row: ProgrammeRow): GuideProgramme {
  return {
    id: row.id,
    channelId: row.channelId,
    title: row.title,
    description: row.description,
    posterUrl: toNullableString(row.posterUrl),
    startsAt: row.startsAt,
    endsAt: row.endsAt,
  };
}

export class CatalogRepository {
  public constructor(private readonly database: Database) {}

  public async getHome(): Promise<HomeData> {
    const [lancamentos, filmes, popularSeries, animes, doramas] = await Promise.all([
      this.database.select().from(movies)
        .where(and(eq(movies.category, 'Lançamentos'), ne(movies.internalId, NON_PLAYABLE_INTERNAL_ID)))
        .limit(20),
      this.database.select().from(movies)
        .where(and(eq(movies.category, 'Filmes'), ne(movies.internalId, NON_PLAYABLE_INTERNAL_ID)))
        .limit(20),
      this.database.select().from(series)
        .where(and(eq(series.category, 'Séries'), ne(series.internalId, NON_PLAYABLE_INTERNAL_ID)))
        .limit(20),
      this.database.select().from(series)
        .where(and(eq(series.category, 'Animes'), ne(series.internalId, NON_PLAYABLE_INTERNAL_ID)))
        .limit(20),
      this.database.select().from(series)
        .where(and(eq(series.category, 'Doramas'), ne(series.internalId, NON_PLAYABLE_INTERNAL_ID)))
        .limit(20),
    ]);

    const seenMovieIds = new Set<string>();
    const popularMovies = [...lancamentos, ...filmes]
      .filter((item) => {
        if (seenMovieIds.has(item.id)) return false;
        seenMovieIds.add(item.id);
        return true;
      })
      .map((item) => toTitleSummary(item, 'movie'));

    return {
      popularMovies,
      popularSeries: popularSeries.map((item) => toTitleSummary(item, 'series')),
      animes: animes.map((item) => toTitleSummary(item, 'series')),
      doramas: doramas.map((item) => toTitleSummary(item, 'series')),
    };
  }

  public async listTitles(
    mediaType: MediaType,
    page: number,
    limit: number,
    category: string | null,
  ): Promise<PaginatedTitles> {
    return mediaType === 'movie'
      ? this.listMovies(page, limit, category)
      : this.listSeries(page, limit, category);
  }

  public async findTitle(mediaType: MediaType, id: string): Promise<TitleSummary | null> {
    if (mediaType === 'movie') {
      const rows = await this.database.select().from(movies).where(eq(movies.id, id)).limit(1);
      const row = rows[0];
      return row && row.internalId !== NON_PLAYABLE_INTERNAL_ID ? toTitleSummary(row, 'movie') : null;
    }

    const rows = await this.database.select().from(series).where(eq(series.id, id)).limit(1);
    const row = rows[0];
    return row && row.internalId !== NON_PLAYABLE_INTERNAL_ID ? toTitleSummary(row, 'series') : null;
  }

  public async findTitleForDetail(
    mediaType: MediaType,
    id: string,
  ): Promise<TitleDetailCatalogRecord | null> {
    if (mediaType === 'movie') {
      const rows = await this.database.select().from(movies).where(eq(movies.id, id)).limit(1);
      const row = rows[0];
      return row && row.internalId !== NON_PLAYABLE_INTERNAL_ID
        ? toTitleDetailCatalogRecord(row, 'movie')
        : null;
    }

    const rows = await this.database.select().from(series).where(eq(series.id, id)).limit(1);
    const row = rows[0];
    return row && row.internalId !== NON_PLAYABLE_INTERNAL_ID
      ? toTitleDetailCatalogRecord(row, 'series')
      : null;
  }

  public async findTitlesByTmdbIds(
    mediaType: MediaType,
    tmdbIds: number[],
  ): Promise<Map<number, TitleSummary>> {
    const uniqueIds = [...new Set(tmdbIds.filter((id) => id > 0))];
    if (uniqueIds.length === 0) return new Map();

    if (mediaType === 'movie') {
      const rows = await this.database.select().from(movies)
        .where(and(inArray(movies.tmdbId, uniqueIds), ne(movies.internalId, NON_PLAYABLE_INTERNAL_ID)));
      return new Map(rows
        .filter((row) => row.tmdbId !== null && row.tmdbId > 0)
        .map((row) => [row.tmdbId as number, toTitleSummary(row, 'movie')]));
    }

    const rows = await this.database.select().from(series)
      .where(and(inArray(series.tmdbId, uniqueIds), ne(series.internalId, NON_PLAYABLE_INTERNAL_ID)));
    return new Map(rows
      .filter((row) => row.tmdbId !== null && row.tmdbId > 0)
      .map((row) => [row.tmdbId as number, toTitleSummary(row, 'series')]));
  }

  public async updateTmdbId(mediaType: MediaType, id: string, tmdbId: number): Promise<void> {
    if (mediaType === 'movie') {
      await this.database.update(movies).set({ tmdbId }).where(eq(movies.id, id));
      return;
    }

    await this.database.update(series).set({ tmdbId }).where(eq(series.id, id));
  }

  public async listChannels(category: string | null): Promise<ChannelSummary[]> {
    const rows = category
      ? await this.database.select().from(channels).where(eq(channels.category, category)).orderBy(asc(channels.name))
      : await this.database.select().from(channels).orderBy(asc(channels.name));
    return rows.map(toChannelSummary);
  }

  public async findChannel(id: string): Promise<ChannelSummary | null> {
    const rows = await this.database.select().from(channels).where(eq(channels.id, id)).limit(1);
    const row = rows[0];
    return row ? toChannelSummary(row) : null;
  }

  public async getChannelGuide(channelId: string, from: string, to: string): Promise<ChannelGuide | null> {
    const channel = await this.findChannel(channelId);
    if (!channel) return null;

    const programmes = await this.database.select().from(channelProgrammes)
      .where(and(
        eq(channelProgrammes.channelId, channelId),
        lte(channelProgrammes.startsAt, to),
        gte(channelProgrammes.endsAt, from),
      ))
      .orderBy(asc(channelProgrammes.startsAt));

    return {
      channel,
      programmes: programmes.map(toGuideProgramme),
    };
  }

  public async search(query: string): Promise<SearchResults> {
    const pattern = `%${query.trim()}%`;
    const [movieRows, seriesRows, channelRows] = await Promise.all([
      this.database.select().from(movies)
        .where(and(ne(movies.internalId, NON_PLAYABLE_INTERNAL_ID), like(movies.title, pattern)))
        .limit(20),
      this.database.select().from(series)
        .where(and(ne(series.internalId, NON_PLAYABLE_INTERNAL_ID), like(series.title, pattern)))
        .limit(20),
      this.database.select().from(channels)
        .where(or(like(channels.name, pattern), like(channels.category, pattern)))
        .limit(20),
    ]);

    return {
      query,
      titles: [
        ...movieRows.map((row) => toTitleSummary(row, 'movie')),
        ...seriesRows.map((row) => toTitleSummary(row, 'series')),
      ],
      channels: channelRows.map(toChannelSummary),
    };
  }

  private async listMovies(page: number, limit: number, category: string | null): Promise<PaginatedTitles> {
    const whereClause = category
      ? and(ne(movies.internalId, NON_PLAYABLE_INTERNAL_ID), eq(movies.category, category))
      : ne(movies.internalId, NON_PLAYABLE_INTERNAL_ID);
    const [rows, totalRows] = await Promise.all([
      this.database.select().from(movies).where(whereClause).limit(limit).offset((page - 1) * limit),
      this.database.select({ value: count() }).from(movies).where(whereClause),
    ]);

    return {
      page,
      limit,
      total: totalRows[0]?.value ?? 0,
      items: rows.map((row) => toTitleSummary(row, 'movie')),
    };
  }

  private async listSeries(page: number, limit: number, category: string | null): Promise<PaginatedTitles> {
    const whereClause = category
      ? and(ne(series.internalId, NON_PLAYABLE_INTERNAL_ID), eq(series.category, category))
      : ne(series.internalId, NON_PLAYABLE_INTERNAL_ID);
    const [rows, totalRows] = await Promise.all([
      this.database.select().from(series).where(whereClause).limit(limit).offset((page - 1) * limit),
      this.database.select({ value: count() }).from(series).where(whereClause),
    ]);

    return {
      page,
      limit,
      total: totalRows[0]?.value ?? 0,
      items: rows.map((row) => toTitleSummary(row, 'series')),
    };
  }
}
