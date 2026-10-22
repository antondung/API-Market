import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { ApiError } from './auth.js';
import { MarketplaceService, marketplaceId, marketplaceQuery } from './marketplace-service.js';

export function marketplaceRouter(service: MarketplaceService) {
  const router = Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false,
    handler: (_req, _res, next) => next(new ApiError(429, 'RATE_LIMITED', 'Too many marketplace requests')) }));
  router.get('/apis', async (req, res) => { res.json({ data: await service.list(marketplaceQuery.parse(req.query)) }); });
  router.get('/apis/:id', async (req, res) => {
    const parsed = marketplaceId.safeParse(req.params.id);
    if (!parsed.success) throw new ApiError(404, 'NOT_FOUND', 'API not found');
    res.json({ data: await service.detail(parsed.data) });
  });
  return router;
}
