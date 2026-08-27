import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import { vodRouter } from './routes/vod.routes';
import { liveRouter } from './routes/live.routes';
import { SyncService } from './services/sync.service';
import { TMDBService } from './services/tmdb.service';
import { drizzle } from 'drizzle-orm/d1';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('/*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Routes
app.get('/api/health', (c) => c.json({ status: 'online' }));
app.route('/api/vod', vodRouter);
app.route('/api/live', liveRouter);

// Cloudflare Worker export (fetch and scheduled cron)
export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const db = drizzle(env.DB);
    const tmdbService = new TMDBService(env.TMDB_READ_ACCESS_TOKEN);
    const syncService = new SyncService(db, tmdbService);
    
    // Pass the promise to ctx.waitUntil so the worker doesn't exit until it completes
    ctx.waitUntil(syncService.runGlobalSync());
  }
};
