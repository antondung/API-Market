import express, { type RequestHandler } from "express";
import { z } from "zod";
import { BillingService } from "./billing-service.js";
import { marketplaceId } from "./marketplace-service.js";
const id = z
  .string()
  .regex(/^[1-9]\d{0,18}$/)
  .refine((s) => {
    try {
      return BigInt(s) <= 9223372036854775807n;
    } catch {
      return false;
    }
  });
const key = z.string().regex(/^[A-Za-z0-9_.:-]{1,100}$/);
const page = z
  .object({
    page: z.coerce.number().int().min(1).max(10000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
export function webhookRouter(service: BillingService) {
  const router = express.Router();
  router.post(
    "/",
    express.raw({ type: "application/json", limit: "16kb" }),
    async (req, res) => {
      res.json({
        data: await service.webhook(
          Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0),
          req.get("x-sandbox-timestamp") ?? "",
          req.get("x-sandbox-signature") ?? "",
        ),
      });
    },
  );
  return router;
}
export function billingRouter(
  service: BillingService,
  auth: RequestHandler,
  role: RequestHandler,
) {
  const r = express.Router();
  r.use(auth, role, (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  const user = (res: any) => res.locals.identity.user.id;
  r.get("/", async (req, res) => {
    const q = page.parse(req.query);
    res.json({ data: await service.list(user(res), q.page, q.pageSize) });
  });
  r.post("/", async (req, res) => {
    const input = z.object({ planId: marketplaceId }).strict().parse(req.body);
    res
      .status(201)
      .json({ data: await service.subscribe(user(res), input.planId) });
  });
  r.post("/confirm", async (req, res) => {
    const input = z
      .object({
        paymentId: id,
        token: z.string().max(200),
        outcome: z.enum(["success", "failure"]),
        eventId: key,
      })
      .strict()
      .parse(req.body);
    res.json({ data: await service.confirm(user(res), input) });
  });
  r.get("/:id", async (req, res) =>
    res.json({ data: await service.get(user(res), id.parse(req.params.id)) }),
  );
  r.post("/:id/cancel", async (req, res) => {
    const input = z
      .object({ immediate: z.boolean().default(false) })
      .strict()
      .parse(req.body ?? {});
    res.json({
      data: await service.cancel(
        user(res),
        id.parse(req.params.id),
        input.immediate,
      ),
    });
  });
  r.post("/:id/checkout", async (req, res) => {
    const input = z.object({ idempotencyKey: key }).strict().parse(req.body);
    res
      .status(201)
      .json({
        data: await service.checkout(
          user(res),
          id.parse(req.params.id),
          input.idempotencyKey,
        ),
      });
  });
  r.post("/:id/change-plan", async (req, res) => {
    const input = z
      .object({ planId: marketplaceId, idempotencyKey: key })
      .strict()
      .parse(req.body);
    res
      .status(201)
      .json({
        data: await service.change(
          user(res),
          id.parse(req.params.id),
          input.planId,
          input.idempotencyKey,
        ),
      });
  });
  return r;
}
