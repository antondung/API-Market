import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { ApiError, AuthService } from './auth.js';
import type { Role } from './store.js';
import { openapi } from './openapi.js';

const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(12).max(128);
const registerSchema = z.object({ email, password, role: z.enum(['Consumer', 'Provider']), name: z.string().trim().min(1).max(120).optional() }).strict();
const loginSchema = z.object({ email, password: z.string().min(1).max(128) }).strict();
const refreshSchema = z.object({ refreshToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }).strict();
export type LogEvent = { requestId: string; method: string; route: string; status: number; durationMs: number };
export const localFrontendOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
export interface AppOptions { allowedOrigins?: string[] }

export function createApp(auth: AuthService, log: (event: LogEvent) => void = () => {}, options: AppOptions = {}) {
  const allowedOrigins = new Set(options.allowedOrigins ?? localFrontendOrigins);
  for (const origin of allowedOrigins) {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) throw new Error('CORS origins must be exact HTTP(S) origins without paths or wildcards');
  }
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use((req, res, next) => {
    res.locals.requestId = randomUUID();
    res.setHeader('X-Request-Id', res.locals.requestId);
    const start = performance.now();
    res.on('finish', () => log({
      requestId: res.locals.requestId, method: req.method,
      // Log the matched template only; never headers, body, query or arbitrary URLs.
      route: req.route?.path ?? 'unmatched', status: res.statusCode,
      durationMs: Math.round(performance.now() - start),
    }));
    next();
  });
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) { callback(null, false); return; }
      if (allowedOrigins.has(origin)) { callback(null, origin); return; }
      callback(new ApiError(403, 'CORS_ORIGIN_DENIED', 'Origin is not allowed'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id', 'Retry-After'],
    credentials: false, maxAge: 600, optionsSuccessStatus: 204,
  }));
  app.use(express.json({ limit: '16kb' }));
  app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
  app.get('/openapi.json', (_req, res) => { res.json(openapi); });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
  app.use('/api/auth', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.use('/api/auth', rateLimit({
    windowMs: 60_000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false,
    handler: (_req, _res, next) => next(new ApiError(429, 'RATE_LIMITED', 'Too many authentication requests')),
  }));
  const requireAuth: RequestHandler = async (req, res, next) => {
    const match = /^Bearer ([^ ]+)$/.exec(req.headers.authorization ?? '');
    if (!match?.[1]) throw new ApiError(401, 'UNAUTHORIZED', 'Authentication failed');
    res.locals.identity = await auth.authenticate(match[1]);
    next();
  };
  const requireRole = (role: Role): RequestHandler => (_req, res, next) => {
    if (res.locals.identity.user.role !== role) throw new ApiError(403, 'FORBIDDEN', 'Insufficient permissions');
    next();
  };
  app.post('/api/auth/register', async (req, res) => {
    const input = registerSchema.parse(req.body);
    res.status(201).json({ data: await auth.register(input.email, input.password, input.role, input.name) });
  });
  app.post('/api/auth/login', async (req, res) => {
    const input = loginSchema.parse(req.body);
    res.json({ data: await auth.login(input.email, input.password) });
  });
  app.post('/api/auth/refresh', async (req, res) => {
    const input = refreshSchema.parse(req.body);
    res.json({ data: await auth.refresh(input.refreshToken) });
  });
  app.post('/api/auth/logout', requireAuth, async (_req, res) => {
    await auth.logout(res.locals.identity.sessionId);
    res.status(204).end();
  });
  app.get('/api/auth/me', requireAuth, (_req, res) => { res.json({ data: res.locals.identity.user }); });
  // Provisional guard examples; real dashboard permissions await QA Role Matrix.
  for (const role of ['Consumer', 'Provider', 'Admin'] as const) {
    app.get(`/api/access/${role.toLowerCase()}`, requireAuth, requireRole(role), (_req, res) => {
      res.json({ data: { role } });
    });
  }
  app.use((_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', 'Route not found')));
  const errors: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request', requestId: res.locals.requestId,
        details: error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })) } });
      return;
    }
    const apiError = error instanceof ApiError ? error
      : error?.type === 'entity.too.large' ? new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body too large')
      : error?.type === 'entity.parse.failed' ? new ApiError(400, 'INVALID_JSON', 'Invalid JSON')
      : error?.type === 'encoding.unsupported' ? new ApiError(415, 'UNSUPPORTED_ENCODING', 'Content encoding is not supported')
      : error?.type === 'charset.unsupported' ? new ApiError(415, 'UNSUPPORTED_CHARSET', 'Content charset is not supported')
      : new ApiError(500, 'INTERNAL_ERROR', 'Internal server error');
    res.status(apiError.status).json({ error: { code: apiError.code, message: apiError.message, requestId: res.locals.requestId } });
  };
  app.use(errors);
  return app;
}
