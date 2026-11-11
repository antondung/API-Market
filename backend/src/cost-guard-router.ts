import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { budgetInput, CostGuard } from './cost-guard.js';

export function costGuardRouter(service: CostGuard, auth: RequestHandler, buyer: RequestHandler) {
  const router = Router();
  router.use(auth, buyer, (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.get('/', async (req, res) => {
    z.object({}).strict().parse(req.query);
    res.json({ data: await service.summary(res.locals.identity.user.id) });
  });
  router.put('/', async (req, res) => {
    z.object({}).strict().parse(req.query);
    res.json({ data: await service.setBudget(res.locals.identity.user.id, budgetInput.parse(req.body)) });
  });
  return router;
}
