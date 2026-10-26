import express, { type RequestHandler } from 'express';
import { GatewayService } from './gateway-service.js';

/**
 * Public Gateway surface. The API key is the credential, so no session authentication is
 * applied here — a Consumer calls this from their own server, not from the browser session.
 */
export function gatewayRouter(service: GatewayService) {
  const router = express.Router();

  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });

  // `express.raw` keeps the body byte-exact so the upstream receives what the caller sent.
  router.use(express.raw({ type: '*/*', limit: '2mb' }));

  const forward: RequestHandler = async (req, res, next) => {
    try {
      // Express 5 exposes wildcard segments as an array under the wildcard's name.
      const wildcard = req.params.rest;
      const rest = Array.isArray(wildcard) ? wildcard.join('/') : String(wildcard ?? '');
      const rawKey = req.header('x-api-key');
      const apiKey = Array.isArray(rawKey) ? (rawKey[0] ?? '') : (rawKey ?? '');
      const rawId = req.params.apiId;
      const apiId = Array.isArray(rawId) ? (rawId[0] ?? '') : (rawId ?? '');
      const result = await service.forward(apiKey, apiId, {
        method: req.method,
        path: rest ? `/${rest}` : '/',
        headers: req.headers,
        body: Buffer.isBuffer(req.body) && req.body.length > 0 ? req.body : undefined,
      });
      for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value);
      res.status(result.status).send(result.body);
    } catch (error) { next(error); }
  };

  router.all('/:apiId/*rest', forward);
  router.all('/:apiId', forward);

  return router;
}