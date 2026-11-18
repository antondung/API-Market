import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import {
  RecommendationService,
  recommendationActionInputSchema,
  recommendationPreferencesInputSchema,
  recommendationQuerySchema,
  recommendationSwitchInputSchema,
} from './recommendation-service.js';

export function recommendationRouter(
  service: RecommendationService,
  auth: RequestHandler,
  buyer: RequestHandler,
) {
  const router = Router();
  router.use(auth, buyer, (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  router.get('/', async (req, res) => {
    const query = recommendationQuerySchema.parse(req.query);
    res.json({
      data: await service.getRecommendations(res.locals.identity.user.id, query),
    });
  });

  router.put('/preferences', async (req, res) => {
    z.object({}).strict().parse(req.query);
    const input = recommendationPreferencesInputSchema.parse(req.body);
    res.json({
      data: await service.updatePreferences(res.locals.identity.user.id, input),
    });
  });

  router.post('/actions', async (req, res) => {
    z.object({}).strict().parse(req.query);
    const input = recommendationActionInputSchema.parse(req.body);
    res.json({
      data: await service.submitAction(res.locals.identity.user.id, input),
    });
  });

  router.post('/switch', async (req, res) => {
    z.object({}).strict().parse(req.query);
    const input = recommendationSwitchInputSchema.parse(req.body);
    res.status(201).json({
      data: await service.switchSubscription(res.locals.identity.user.id, input),
    });
  });

  return router;
}
