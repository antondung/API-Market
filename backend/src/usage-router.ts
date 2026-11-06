import { Router, type RequestHandler } from "express";
import { UsageAnalytics, usageFilters } from "./usage-analytics.js";
export function usageConsumerRouter(
  service: UsageAnalytics,
  auth: RequestHandler,
  role: RequestHandler,
) {
  const r = Router();
  r.use(auth, role, (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  r.get("/summary", async (req, res) =>
    res.json({
      data: await service.summary(
        res.locals.identity.user.id,
        usageFilters.parse(req.query),
      ),
    }),
  );
  r.get("/history", async (req, res) =>
    res.json({
      data: await service.history(
        res.locals.identity.user.id,
        usageFilters.parse(req.query),
      ),
    }),
  );
  return r;
}
export function usageProviderRouter(
  service: UsageAnalytics,
  auth: RequestHandler,
  role: RequestHandler,
) {
  const r = Router();
  r.use(auth, role, (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  r.get("/overview", async (req, res) =>
    res.json({
      data: await service.overview(
        res.locals.identity.user.id,
        usageFilters.parse(req.query),
      ),
    }),
  );
  return r;
}
