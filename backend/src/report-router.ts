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

// Route ids reach SQL integer columns, so they are validated here rather than left to
// PostgreSQL: a non-numeric id would otherwise surface as a 500 instead of a 400.
const numericId = z.string().regex(/^[1-9][0-9]{0,18}$/, 'Must be a positive integer id');

const pagination = z.object({
  page: z.coerce.number().int().min(1).max(100000).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  status: z.enum(['Pending', 'Under Investigation', 'Resolved', 'Dismissed']).optional(),
}).strict();

/** Consumer surface: file a report and follow their own cases. */
export function reportConsumerRouter(service: ReportService, auth: RequestHandler, role: RequestHandler) {
  const router = express.Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(auth, role);

  router.get('/', async (req, res) => {
    const query = pagination.parse(req.query);
    res.json({ data: await service.listMine(res.locals.identity.user.id, query.page ?? 1, query.pageSize ?? 20) });
  });

  router.post('/:apiId', async (req, res) => {
    const apiId = numericId.parse(req.params.apiId);
    const input = createSchema.parse(req.body);
    res.status(201).json({ data: await service.create(res.locals.identity.user.id, apiId, input) });
  });

  return router;
}

/** Admin surface: moderation queue and decisions. */
export function reportAdminRouter(service: ReportService, auth: RequestHandler, role: RequestHandler) {
  const router = express.Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(auth, role);

  router.get('/', async (req, res) => {
    const query = pagination.parse(req.query);
    res.json({ data: await service.listForAdmin(query.status ?? null, query.page ?? 1, query.pageSize ?? 20) });
  });

  router.post('/:id/review', async (req, res) => {
    const reportId = numericId.parse(req.params.id);
    const input = moderateSchema.parse(req.body);
    res.json({ data: await service.moderate(res.locals.identity.user.id, reportId, input.action, input.note) });
  });

  return router;
}