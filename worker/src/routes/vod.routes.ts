import { Hono } from 'hono';
import type { Env } from '../types';
import { vodCatalogRouter } from './vod/catalog.routes';
import { vodDetailRouter } from './vod/detail.routes';

const vodRouter = new Hono<{ Bindings: Env }>();

vodRouter.route('/', vodCatalogRouter);
vodRouter.route('/', vodDetailRouter);

export { vodRouter };
