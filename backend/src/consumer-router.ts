import { Router, type RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { ApiError } from './auth.js';
import { marketplaceId } from './marketplace-service.js';
import { ApiKeyService, SandboxService } from './consumer-service.js';

const keyId = z.string().regex(/^[1-9][0-9]{0,18}$/).refine(value => BigInt(value) <= 9223372036854775807n);
const empty = z.object({}).strict();
const createKey = z.object({ apiId: marketplaceId, label: z.string().trim().min(1).max(100).refine(s => !/[\x00-\x1f\x7f]/.test(s)).optional() }).strict();
const pagination = z.object({ page: z.coerce.number().int().min(1).max(10000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) }).strict();
export function consumerRouter(sandbox: SandboxService, keys: ApiKeyService, auth: RequestHandler, role: RequestHandler) {
  const router = Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(auth, role);
  router.use(rateLimit({ windowMs: 60_000, limit: 60, keyGenerator: (_req, res) => res.locals.identity.user.id,
    standardHeaders: 'draft-8', legacyHeaders: false,
    handler: (_req, _res, next) => next(new ApiError(429, 'RATE_LIMITED', 'Too many Consumer requests')) }));
  router.get('/apis/:apiId/sandbox', async (req, res) => {
    empty.parse(req.query);
    res.json({ data: await sandbox.get(res.locals.identity.user.id, marketplaceId.parse(req.params.apiId)) });
  });
  router.post('/apis/:apiId/sandbox', async (req, res) => {
    empty.parse(req.body ?? {}); empty.parse(req.query);
    const result = await sandbox.grant(res.locals.identity.user.id, marketplaceId.parse(req.params.apiId));
    res.status(result.created ? 201 : 200).json({ data: result.data });
  });
  router.get('/api-keys', async (req, res) => {
    const query = pagination.parse(req.query);
    res.json({ data: await keys.list(res.locals.identity.user.id, query.page, query.pageSize) });
  });
  router.post('/api-keys', async (req, res) => {
    empty.parse(req.query);
    const input = createKey.parse(req.body);
    res.status(201).json({ data: await keys.create(res.locals.identity.user.id, input.apiId, input.label) });
  });
  router.post('/api-keys/:id/rotate', async (req, res) => {
    empty.parse(req.body ?? {}); empty.parse(req.query);
    res.status(201).json({ data: await keys.rotate(res.locals.identity.user.id, keyId.parse(req.params.id)) });
  });
  router.delete('/api-keys/:id', async (req, res) => {
    empty.parse(req.query);
    await keys.revoke(res.locals.identity.user.id, keyId.parse(req.params.id));
    res.status(204).end();
  });
  return router;
}
