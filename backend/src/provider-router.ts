import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { ApiError } from './auth.js';
import { providerSchemas, validateProviderJson } from './provider-domain.js';
import { ProviderService } from './provider-service.js';

export function providerRouter(service: ProviderService, authenticate: RequestHandler, providerRole: RequestHandler) {
  const router = Router();
  router.use(authenticate, providerRole, (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use((req, _res, next) => { validateProviderJson(req.body); next(); });
  const actor = (res: any): string => res.locals.identity.user.id;
  const pagination = z.object({ page: z.coerce.number().int().min(1).max(10000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) }).strict();
  router.get('/agreement', async (_req, res) => { res.json({ data: await service.agreement() }); });
  router.get('/verification', async (_req, res) => { res.json({ data: await service.getVerification(actor(res)) }); });
  router.post('/verification', async (req, res) => { res.status(201).json({ data: await service.sendVerification(actor(res), providerSchemas.verification.parse(req.body)) }); });
  router.get('/apis', async (req, res) => { const query = pagination.parse(req.query); res.json({ data: await service.list(actor(res), query.page, query.pageSize) }); });
  router.post('/apis', async (req, res) => { res.status(201).json({ data: await service.create(actor(res), providerSchemas.api.parse(req.body)) }); });
  router.get('/apis/:id', async (req, res) => { res.json({ data: await service.get(actor(res), String(req.params.id)) }); });
  router.put('/apis/:id', async (req, res) => { res.json({ data: await service.update(actor(res), String(req.params.id), providerSchemas.api.parse(req.body)) }); });
  router.delete('/apis/:id', async (req, res) => { await service.deleteApi(actor(res), String(req.params.id)); res.status(204).end(); });
  for (const kind of ['versions', 'endpoints', 'plans', 'documentation'] as const) {
    router.get(`/apis/:id/${kind}`, async (req, res) => { res.json({ data: await service.listChild(actor(res), String(req.params.id), kind) }); });
  }
  router.post('/apis/:id/versions', async (req, res) => { res.status(201).json({ data: await service.addVersion(actor(res), String(req.params.id), providerSchemas.version.parse(req.body)) }); });
  router.put('/apis/:id/versions/:vid', async (req, res) => { res.json({ data: await service.updateVersion(actor(res), String(req.params.id), String(req.params.vid), providerSchemas.version.parse(req.body)) }); });
  router.delete('/apis/:id/versions/:vid', async (req, res) => { await service.deleteVersion(actor(res), String(req.params.id), String(req.params.vid)); res.status(204).end(); });
  router.post('/apis/:id/endpoints', async (req, res) => { res.status(201).json({ data: await service.endpoint(actor(res), String(req.params.id), providerSchemas.endpoint.parse(req.body)) }); });
  router.put('/apis/:id/endpoints/:eid', async (req, res) => { res.json({ data: await service.endpoint(actor(res), String(req.params.id), providerSchemas.endpoint.parse(req.body), String(req.params.eid)) }); });
  router.post('/apis/:id/plans', async (req, res) => { res.status(201).json({ data: await service.plan(actor(res), String(req.params.id), providerSchemas.plan.parse(req.body)) }); });
  router.put('/apis/:id/plans/:pid', async (req, res) => { res.json({ data: await service.plan(actor(res), String(req.params.id), providerSchemas.plan.parse(req.body), String(req.params.pid)) }); });
  for (const kind of ['endpoints', 'plans'] as const) {
    router.delete(`/apis/:id/${kind}/:child`, async (req, res) => { await service.deleteChild(actor(res), String(req.params.id), String(req.params.child), kind); res.status(204).end(); });
  }
  router.get('/apis/:id/legal', async (req, res) => { res.json({ data: await service.legal(actor(res), String(req.params.id)) }); });
  router.put('/apis/:id/legal', async (req, res) => { res.json({ data: await service.legal(actor(res), String(req.params.id), providerSchemas.legal.parse(req.body)) }); });
  router.get('/apis/:id/publish-status', async (req, res) => {
    const api = await service.get(actor(res), String(req.params.id));
    res.json({ data: { id: api.id, status: api.status, submittedAt: api.submittedAt, approvedAt: api.approvedAt, publishedAt: api.publishedAt } });
  });
  for (const action of ['submit-review', 'reopen'] as const) router.post(`/apis/:id/${action}`, async (req, res) => {
    z.object({}).strict().parse(req.body ?? {});
    res.json({ data: await (action === 'submit-review' ? service.submit(actor(res), String(req.params.id)) : service.reopen(actor(res), String(req.params.id))) });
  });
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024, files: 1, fields: 1, fieldSize: 64, parts: 2 } });
  router.post('/apis/:id/import-openapi', async (req, res, next) => {
    await service.get(actor(res), String(req.params.id)); next();
  }, (req, res, next) => {
    upload.single('file')(req, res, error => next(error && !(error instanceof multer.MulterError)
      ? new ApiError(400, 'IMPORT_UPLOAD_INVALID', 'Malformed multipart upload') : error));
  }, async (req, res) => {
    const input = z.object({ versionId: z.string().regex(/^[1-9][0-9]{0,9}$/) }).strict().parse(req.body);
    if (!req.file) throw new ApiError(400, 'IMPORT_FILE_REQUIRED', 'Upload a file field');
    if (!/\.(json|ya?ml)$/i.test(req.file.originalname)) throw new ApiError(415, 'IMPORT_FILE_TYPE', 'Use a JSON or YAML file');
    res.json({ data: await service.import(actor(res), String(req.params.id), input.versionId, req.file.buffer.toString('utf8')) });
  });
  return router;
}
