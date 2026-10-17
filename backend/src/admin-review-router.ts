import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { ApiError } from './auth.js';
import type { AdminReviewService } from './admin-review-service.js';
import type { AuditService } from './audit-service.js';

const idSchema = z.string().regex(/^[1-9][0-9]{0,9}$/, 'Invalid id');

const pagination = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

const reviewVerificationSchema = z.object({
  decision: z.enum(['Verified', 'Rejected']),
  reason: z.string().trim().max(1000).optional(),
}).strict();

const reviewApiSchema = z.object({
  next: z.enum(['Under Review', 'Approved', 'Rejected', 'Published']),
  reason: z.string().trim().max(1000).optional(),
}).strict();

const auditQuerySchema = z.object({
  actorId: idSchema.optional(),
  action: z.string().trim().max(100).optional(),
  targetType: z.string().trim().max(50).optional(),
  targetId: z.string().trim().max(64).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export function adminReviewRouter(
  review: AdminReviewService,
  audit: AuditService,
  authenticate: RequestHandler,
  adminRole: RequestHandler,
) {
  const router = Router();
  router.use(authenticate, adminRole, (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  const actorId = (res: any): string => res.locals.identity.user.id;
  const ip = (req: any): string | null => (req.ip && req.ip !== '::1' && req.ip !== '::ffff:127.0.0.1' ? req.ip : null);

  // ------------------------------------------------------------ Provider verification

  router.get('/provider-verifications', async (req, res) => {
    const status = z.enum(['Pending', 'Verified', 'Rejected']).catch('Pending').parse(req.query.status ?? 'Pending');
    const query = pagination.parse({ page: req.query.page, pageSize: req.query.pageSize });
    res.json({ data: await review.listVerifications(status, query.page, query.pageSize) });
  });

  router.get('/provider-verifications/:providerId', async (req, res) => {
    res.json({ data: await review.getVerification(idSchema.parse(String(req.params.providerId))) });
  });

  router.post('/provider-verifications/:providerId/review', async (req, res) => {
    const body = reviewVerificationSchema.parse(req.body);
    res.json({
      data: await review.reviewVerification(
        actorId(res), ip(req), idSchema.parse(String(req.params.providerId)), body.decision, body.reason,
      ),
    });
  });

  // ------------------------------------------------------------ API review

  router.get('/apis', async (req, res) => {
    const status = z.enum(['Draft', 'Submitted', 'Under Review', 'Approved', 'Published', 'Rejected'])
      .catch('Submitted').parse(req.query.status ?? 'Submitted');
    const query = pagination.parse({ page: req.query.page, pageSize: req.query.pageSize });
    res.json({ data: await review.listApis(status, query.page, query.pageSize) });
  });

  router.get('/apis/:id/dossier', async (req, res) => {
    res.json({ data: await review.getApiDossier(idSchema.parse(String(req.params.id))) });
  });

  router.post('/apis/:id/review', async (req, res) => {
    const body = reviewApiSchema.parse(req.body);
    res.json({
      data: await review.reviewApi(
        actorId(res), ip(req), idSchema.parse(String(req.params.id)), body.next, body.reason,
      ),
    });
  });

  // ------------------------------------------------------------ Audit log (US-14)

  router.get('/audit-logs', async (req, res) => {
    const query = auditQuerySchema.parse({
      actorId: req.query.actorId, action: req.query.action,
      targetType: req.query.targetType, targetId: req.query.targetId,
      from: req.query.from, to: req.query.to,
      page: req.query.page, pageSize: req.query.pageSize,
    });
    if (query.from && query.to && query.from > query.to) {
      throw new ApiError(400, 'INVALID_RANGE', 'from must be earlier than to');
    }
    res.json({ data: await audit.list(query) });
  });

  router.get('/audit-logs/actions', async (_req, res) => {
    res.json({ data: await audit.actions() });
  });

  return router;
}
