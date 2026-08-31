import { Hono } from 'hono';
import { db } from '../db';
import { CatalogRepository } from '../repositories/catalog.repository';
import { TmdbCacheRepository } from '../repositories/tmdb-cache.repository';
import { TitleDetailService } from '../services/title-detail.service';
import { TMDBService } from '../services/tmdb.service';
import { createVodCatalogRouter } from './vod/catalog.routes';
import { createVodDetailRouter } from './vod/detail.routes';

export function createVodRouter(tmdbService: TMDBService): Hono {
  const catalogRepository = new CatalogRepository(db);
  const tmdbCacheRepository = new TmdbCacheRepository(db);
  const titleDetailService = new TitleDetailService(catalogRepository, tmdbCacheRepository, tmdbService);
  const router = new Hono();

  router.route('/', createVodCatalogRouter(catalogRepository));
  router.route('/', createVodDetailRouter(titleDetailService));

  return router;
}
