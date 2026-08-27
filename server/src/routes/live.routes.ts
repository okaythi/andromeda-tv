import { Hono } from 'hono';
import { db } from '../db';
import { channels, events } from '../schema';

const liveRouter = new Hono();

liveRouter.get('/channels', async (c) => {
  const page = Number(c.req.query('page')) || 1;
  const results = await db.select().from(channels);
    
  return c.json({
    total: results.length,
    channels: results
  });
});

liveRouter.get('/events', async (c) => {
  const results = await db.select().from(events);
    
  return c.json({
    total: results.length,
    events: results
  });
});

export { liveRouter };
