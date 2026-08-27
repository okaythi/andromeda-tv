import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { vodRouter } from './routes/vod.routes';
import { liveRouter } from './routes/live.routes';
import { SyncService } from './services/sync.service';
import { TMDBService } from './services/tmdb.service';
import { db } from './db';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new Hono();

app.use('/*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

app.get('/api/health', (c) => c.json({ status: 'online' }));

app.route('/api/vod', vodRouter);
app.route('/api/live', liveRouter);

const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});

// Background sync
const tmdbService = new TMDBService(process.env['TMDB_READ_ACCESS_TOKEN'] || '');
const syncService = new SyncService(db, tmdbService);

console.log('Running initial sync...');
syncService.runGlobalSync().then(() => {
  console.log('Initial sync finished. Starting enrichment...');
  syncService.runTMDBEnrichment(100).catch(e => console.error('Initial enrichment error', e));
}).catch(e => console.error('Initial sync error', e));

// Run catalog sync every 6 hours
setInterval(() => {
  console.log('Running scheduled catalog sync...');
  syncService.runGlobalSync().catch(e => console.error('Scheduled sync error', e));
}, 6 * 60 * 60 * 1000);

// Run TMDB enrichment every 5 minutes for pending items
setInterval(() => {
  syncService.runTMDBEnrichment(50).catch(e => console.error('Enrichment error', e));
}, 5 * 60 * 1000);
