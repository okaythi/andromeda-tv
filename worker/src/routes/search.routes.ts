import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import type { Env } from '../types';
import { CatalogRepository } from '../repositories/catalog.repository';

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

const searchRouter = new Hono<{ Bindings: Env }>();

searchRouter.get('/', async (context) => {
  const query = context.req.query('q')?.trim() ?? '';
  if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return context.json({ error: `Search query must contain ${MIN_QUERY_LENGTH}-${MAX_QUERY_LENGTH} characters.` }, 400);
  }

  const repository = new CatalogRepository(drizzle(context.env.DB));
  return context.json(await repository.search(query));
});

export { searchRouter };
