import { Router, type RequestHandler } from "express";
import { z } from "zod";
import type { Pool } from "pg";
import {
  SubscriptionAdminService,
  monitorQuery,
  operationId,
} from "./subscription-admin-service.js";
const reason = z
  .object({
    reason: z
      .string()
      .trim()
      .min(1)
      .max(2000)
      .refine((s) => !s.includes("\0")),
  })
  .strict();
async function bounded<T>(promise: Promise<T>) {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Unavailable")), 1000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
export class OperationsHealth {
  constructor(
    readonly pool: Pool,
    readonly redis: { ping(): Promise<unknown> },
  ) {}
  async snapshot() {
    const [postgres, redis, worker] = await Promise.allSettled([
      bounded(this.pool.query("SELECT 1")),
      bounded(this.redis.ping()),
      bounded(
        this.pool.query(
          "SELECT last_started_at,last_succeeded_at,last_error_at,last_result FROM backend_job_runs WHERE name='subscription-maintenance'",
        ),
      ),
    ]);
    const job =
      worker.status === "fulfilled" ? worker.value.rows[0] : undefined;
    const workerHealthy =
      !!job?.last_succeeded_at &&
      Date.now() - new Date(job.last_succeeded_at).getTime() < 180000 &&
      (!job.last_error_at ||
        new Date(job.last_error_at) < new Date(job.last_succeeded_at));
    return {
      checkedAt: new Date().toISOString(),
      controlPlane: "online",
      postgres: postgres.status === "fulfilled" ? "online" : "unavailable",
      redis: redis.status === "fulfilled" ? "online" : "unavailable",
      gateway:
        postgres.status === "fulfilled" && redis.status === "fulfilled"
          ? "ready"
          : "degraded",
      worker: { status: workerHealthy ? "online" : "unknown", ...job },
    };
  }
}
export function operationsRouter(
  service: SubscriptionAdminService,
  health: OperationsHealth,
  auth: RequestHandler,
  role: RequestHandler,
) {
  const r = Router();
  r.use(auth, role, (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  r.get("/operations", async (_req, res) =>
    res.json({ data: await health.snapshot() }),
  );
  r.get("/subscriptions", async (req, res) =>
    res.json({ data: await service.list(monitorQuery.parse(req.query)) }),
  );
  r.get("/payments", async (req, res) =>
    res.json({ data: await service.payments(monitorQuery.parse(req.query)) }),
  );
  r.get("/subscriptions/:id/keys", async (req, res) =>
    res.json({ data: await service.keys(operationId.parse(req.params.id)) }),
  );
  r.post("/subscriptions/:id/suspend", async (req, res) =>
    res.json({
      data: await service.action(
        res.locals.identity.user.id,
        "suspend",
        operationId.parse(req.params.id),
        reason.parse(req.body).reason,
      ),
    }),
  );
  r.post("/subscriptions/:id/restore", async (req, res) =>
    res.json({
      data: await service.action(
        res.locals.identity.user.id,
        "restore",
        operationId.parse(req.params.id),
        reason.parse(req.body).reason,
      ),
    }),
  );
  r.post("/api-keys/:id/revoke", async (req, res) =>
    res.json({
      data: await service.action(
        res.locals.identity.user.id,
        "revoke",
        operationId.parse(req.params.id),
        reason.parse(req.body).reason,
      ),
    }),
  );
  return r;
}
