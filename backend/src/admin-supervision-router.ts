import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { ApiError } from './auth.js';
import type { AdminSupervisionService } from './admin-supervision-service.js';

const idSchema = z.string().regex(/^[1-9]\d{0,18}$/).refine((value) => {
  try { return BigInt(value) <= 9223372036854775807n; } catch { return false; }
}, 'Invalid id');

const pageFields = {
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
};

const subscriptionQuery = z.object({
  status: z.enum(['Pending', 'Active', 'Cancelled', 'Canceled', 'Expired', 'Suspended']).optional(),
  consumerId: idSchema.optional(),
  apiId: idSchema.optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  ...pageFields,
}).strict();

const paymentQuery = z.object({
  status: z.enum(['Pending', 'Succeeded', 'Failed', 'Expired']).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  ...pageFields,
}).strict();

const reasonSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
}).strict();

export function adminSupervisionRouter(service: AdminSupervisionService, authenticate: RequestHandler, adminRole: RequestHandler) {
  const router = Router();
  router.use(authenticate, adminRole, (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  const actorId = (res: any): string => res.locals.identity.user.id;
  const ip = (req: any): string | null => (req.ip && req.ip !== '::1' && req.ip !== '::ffff:127.0.0.1' ? req.ip : null);
  const range = (from?: string, to?: string) => {
    if (from && to && from > to) throw new ApiError(400, 'INVALID_RANGE', 'from must be earlier than to');
  };

  router.get('/subscriptions', async (req, res) => {
    const query = subscriptionQuery.parse(req.query);
    range(query.from, query.to);
    const status = query.status === 'Cancelled' ? 'Canceled' : query.status;
    res.json({ data: await service.listSubscriptions({ ...query, status }) });
  });

  router.get('/sandbox-payments', async (req, res) => {
    const query = paymentQuery.parse(req.query);
    range(query.from, query.to);
    res.json({ data: await service.listSandboxPayments(query) });
  });

  router.post('/api-keys/:id/revoke', async (req, res) => {
    const body = reasonSchema.parse(req.body);
    res.json({ data: await service.revokeKey(actorId(res), ip(req), idSchema.parse(String(req.params.id)), body.reason) });
  });

  router.post('/subscriptions/:id/suspend', async (req, res) => {
    const body = reasonSchema.parse(req.body);
    res.json({ data: await service.suspend(actorId(res), ip(req), idSchema.parse(String(req.params.id)), body.reason) });
  });

  router.post('/subscriptions/:id/restore', async (req, res) => {
    const body = reasonSchema.parse(req.body);
    res.json({ data: await service.restore(actorId(res), ip(req), idSchema.parse(String(req.params.id)), body.reason) });
  });

  return router;
}
