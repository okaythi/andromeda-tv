import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { Env } from '../types';
import { channels, events } from '../schema';

const liveRouter = new Hono<{ Bindings: Env }>();

liveRouter.get('/channels', async (c) => {
  const db = drizzle(c.env.DB);
  
  const results = await db.select().from(channels);
    
  return c.json({
    total: results.length,
    channels: results
  });
});

liveRouter.get('/events', async (c) => {
  const db = drizzle(c.env.DB);
  
  const results = await db.select().from(events);
    
  return c.json({
    total: results.length,
    events: results
  });
});

export { liveRouter };
