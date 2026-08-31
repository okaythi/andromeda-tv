import { Hono } from 'hono';
import type { MediaType } from '../../../../shared/catalog';
import { TitleDetailService } from '../../services/title-detail.service';

function parseMediaType(value: string): MediaType | null {
  return value === 'movie' || value === 'series' ? value : null;
}

function parseSeasonNumber(value: string): number | null {
  const seasonNumber = Number.parseInt(value, 10);
  return Number.isSafeInteger(seasonNumber) && seasonNumber > 0 ? seasonNumber : null;
}

export function createVodDetailRouter(service: TitleDetailService): Hono {
  const router = new Hono();

  router.get('/titles/:mediaType/:id', async (context) => {
    const mediaType = parseMediaType(context.req.param('mediaType'));
    const id = context.req.param('id').trim();
    if (!mediaType || !id) {
      return context.json({ error: 'Invalid title reference.' }, 400);
    }

    const detail = await service.getTitleDetail(mediaType, id);
    if (!detail) return context.json({ error: 'Title not found.' }, 404);

    context.header('Cache-Control', 'private, max-age=300');
    return context.json(detail);
  });

  router.get('/series/:id/seasons/:seasonNumber', async (context) => {
    const seriesId = context.req.param('id').trim();
    const seasonNumber = parseSeasonNumber(context.req.param('seasonNumber'));
    if (!seriesId || seasonNumber === null) {
      return context.json({ error: 'Invalid season reference.' }, 400);
    }

    const detail = await service.getSeasonDetail(seriesId, seasonNumber);
    if (!detail) return context.json({ error: 'Series not found.' }, 404);

    context.header('Cache-Control', 'private, max-age=300');
    return context.json(detail);
  });

  return router;
}
