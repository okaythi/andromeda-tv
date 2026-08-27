import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { Env } from '../types';
import { movies, series } from '../schema';
import { desc, limit, offset } from 'drizzle-orm';

const vodRouter = new Hono<{ Bindings: Env }>();

vodRouter.get('/movies', async (c) => {
  const db = drizzle(c.env.DB);
  const page = Number(c.req.query('page')) || 1;
  const pageSize = Number(c.req.query('limit')) || 50;
  
  const results = await db.select()
    .from(movies)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
    
  return c.json({
    page,
    limit: pageSize,
    total: results.length, // Should use a count query for absolute total
    movies: results
  });
});

vodRouter.get('/series', async (c) => {
  const db = drizzle(c.env.DB);
  const page = Number(c.req.query('page')) || 1;
  const pageSize = Number(c.req.query('limit')) || 50;
  
  const results = await db.select()
    .from(series)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
    
  return c.json({
    page,
    limit: pageSize,
    total: results.length,
    series: results
  });
});

export { vodRouter };
