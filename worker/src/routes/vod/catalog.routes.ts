import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import type { Env } from '../../types';
import { CatalogRepository } from '../../repositories/catalog.repository';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

function parsePositiveInteger(value: string | undefined, fallback: number, maximum: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function normalizedCategory(value: string | undefined): string | null {
  const category = value?.trim();
  return category ? category : null;
}

function repository(env: Env): CatalogRepository {
  return new CatalogRepository(drizzle(env.DB));
}

export const vodCatalogRouter = new Hono<{ Bindings: Env }>();

vodCatalogRouter.get('/home', async (context) => context.json(await repository(context.env).getHome()));

vodCatalogRouter.get('/movies', async (context) => {
  const page = parsePositiveInteger(context.req.query('page'), 1, Number.MAX_SAFE_INTEGER);
  const limit = parsePositiveInteger(context.req.query('limit'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const result = await repository(context.env).listTitles('movie', page, limit, normalizedCategory(context.req.query('category')));
  return context.json(result);
});

vodCatalogRouter.get('/series', async (context) => {
  const page = parsePositiveInteger(context.req.query('page'), 1, Number.MAX_SAFE_INTEGER);
  const limit = parsePositiveInteger(context.req.query('limit'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const result = await repository(context.env).listTitles('series', page, limit, normalizedCategory(context.req.query('category')));
  return context.json(result);
});
