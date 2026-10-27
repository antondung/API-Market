import express, { type RequestHandler } from 'express';
import { GatewayService } from './gateway-service.js';

const first = (value: unknown): string => (Array.isArray(value) ? String(value[0] ?? '') : String(value ?? ''));

/** Flattens Express query values into the single-valued map SafeProxy accepts. */
function queryMap(query: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [name, value] of Object.entries(query)) {
    const single = Array.isArray(value) ? value[value.length - 1] : value;
    if (typeof single === 'string') result[name] = single;
  }
  return result;
}

/**
 * Public Gateway surface. The API key is the credential, so no session authentication applies
 * — a Consumer calls this from their own server, not from a browser session.
 *
 * The raw parser is mounted per-route because app.ts mounts express.json() for every other
 * route; a router-wide raw parser here would never see the body and JSON callers would end up
 * forwarding an empty payload.
 */
export function gatewayRouter(service: GatewayService) {
  const router = express.Router();

  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });

  const forward: RequestHandler = async (req, res, next) => {
    try {
      const wildcard = req.params.rest;
      const rest = Array.isArray(wildcard) ? wildcard.join('/') : String(wildcard ?? '');
      const result = await service.forward(first(req.header('x-api-key')), first(req.params.apiId), {
        method: req.method,
        path: rest ? `/${rest}` : '/',
        query: queryMap(req.query as Record<string, unknown>),
        headers: req.headers,
        body: Buffer.isBuffer(req.body) && req.body.length > 0 ? req.body : undefined,
      });
      // Response framing is decided by Express: relaying the upstream's content-length or
      // transfer-encoding would make the client reject the message as contradictory.
      for (const [name, value] of Object.entries(result.headers)) {
        if (['content-length', 'transfer-encoding', 'connection'].includes(name.toLowerCase())) continue;
        res.setHeader(name, value);
      }
      res.status(result.status).send(result.body);
    } catch (error) { next(error); }
  };

  const raw = express.raw({ type: '*/*', limit: '2mb' });
  router.all('/:apiId/*rest', raw, forward);
  router.all('/:apiId', raw, forward);

  return router;
}