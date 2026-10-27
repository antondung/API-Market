import express, { type RequestHandler } from 'express';
import { z } from 'zod';
import { ReportService, REPORT_CATEGORIES } from './report-service.js';

const createSchema = z.object({
  category: z.enum(REPORT_CATEGORIES),
  description: z.string().trim().min(10).max(5000),
}).strict();

const moderateSchema = z.object({
  action: z.enum(['Suspend', 'Restore', 'Remove', 'Dismiss']),
  note: z.string().trim().min(1).max(2000),
}).strict();

/** Consumer surface: file a report and follow their own cases. */
export function reportConsumerRouter(service: ReportService, auth: RequestHandler, role: RequestHandler) {
  const router = express.Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(auth, role);

  router.get('/', async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 20) || 20));
    res.json({ data: await service.listMine(res.locals.identity.user.id, page, pageSize) });
  });

  router.post('/:apiId', async (req, res) => {
    const input = createSchema.parse(req.body);
    res.status(201).json({ data: await service.create(res.locals.identity.user.id, req.params.apiId ?? '', input) });
  });

  return router;
}

/** Admin surface: moderation queue and decisions. */
export function reportAdminRouter(service: ReportService, auth: RequestHandler, role: RequestHandler) {
  const router = express.Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(auth, role);

  router.get('/', async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : null;
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 20) || 20));
    res.json({ data: await service.listForAdmin(status, page, pageSize) });
  });

  router.post('/:id/review', async (req, res) => {
    const input = moderateSchema.parse(req.body);
    res.json({ data: await service.moderate(res.locals.identity.user.id, req.params.id ?? '', input.action, input.note) });
  });

  return router;
}