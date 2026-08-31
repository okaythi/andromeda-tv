import { asc } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db';
import { CatalogRepository } from '../repositories/catalog.repository';
import { events } from '../schema';

const MAX_GUIDE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

function parseGuideDate(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? fallback : new Date(timestamp);
}

function normalizedCategory(value: string | undefined): string | null {
  const category = value?.trim();
  return category ? category : null;
}

const repository = new CatalogRepository(db);
const liveRouter = new Hono();

liveRouter.get('/channels', async (context) => {
  const channels = await repository.listChannels(normalizedCategory(context.req.query('category')));
  return context.json({ total: channels.length, channels });
});

liveRouter.get('/channels/:id', async (context) => {
  const channel = await repository.findChannel(context.req.param('id'));
  if (!channel) return context.json({ error: 'Channel not found.' }, 404);
  return context.json(channel);
});

liveRouter.get('/channels/:id/guide', async (context) => {
  const now = new Date();
  const from = parseGuideDate(context.req.query('from'), now);
  const requestedTo = parseGuideDate(context.req.query('to'), new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const to = new Date(Math.min(requestedTo.getTime(), from.getTime() + MAX_GUIDE_WINDOW_MS));

  if (to.getTime() <= from.getTime()) {
    return context.json({ error: 'Guide end time must be after start time.' }, 400);
  }

  const guide = await repository.getChannelGuide(
    context.req.param('id'),
    from.toISOString(),
    to.toISOString(),
  );
  if (!guide) return context.json({ error: 'Channel not found.' }, 404);

  return context.json(guide);
});

liveRouter.get('/events', async (context) => {
  const rows = await db.select({
    id: events.id,
    title: events.title,
    description: events.description,
    posterUrl: events.posterUrl,
    category: events.category,
    startTime: events.startTime,
    status: events.status,
  }).from(events).orderBy(asc(events.startTime));

  return context.json({ total: rows.length, events: rows });
});

export { liveRouter };
