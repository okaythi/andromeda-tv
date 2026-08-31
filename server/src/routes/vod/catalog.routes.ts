import { Hono } from 'hono';
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

export function createVodCatalogRouter(repository: CatalogRepository): Hono {
  const router = new Hono();

  router.get('/home', async (context) => context.json(await repository.getHome()));

  router.get('/movies', async (context) => {
    const page = parsePositiveInteger(context.req.query('page'), 1, Number.MAX_SAFE_INTEGER);
    const limit = parsePositiveInteger(context.req.query('limit'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const result = await repository.listTitles('movie', page, limit, normalizedCategory(context.req.query('category')));
    return context.json(result);
  });

  router.get('/series', async (context) => {
    const page = parsePositiveInteger(context.req.query('page'), 1, Number.MAX_SAFE_INTEGER);
    const limit = parsePositiveInteger(context.req.query('limit'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const result = await repository.listTitles('series', page, limit, normalizedCategory(context.req.query('category')));
    return context.json(result);
  });

  return router;
}
