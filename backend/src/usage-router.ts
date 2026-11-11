import { Router, type RequestHandler } from "express";
import { ApiError } from "./auth.js";
import { UsageAnalytics, providerUsageFilters, usageFilters } from "./usage-analytics.js";
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
  r.get("/overview", async (req, res) => {
      const query = providerUsageFilters.parse(req.query);
      // A Provider asking about someone else's API gets 404, not an empty report:
      // an empty report would confirm the API exists and leak its id space.
      if (query.apiId) {
        const owned = await service.ownsApi(res.locals.identity.user.id, query.apiId);
        if (!owned) throw new ApiError(404, "NOT_FOUND", "API not found");
      }
      res.json({
        data: await service.overview(res.locals.identity.user.id, query),
      });
    });
  return r;
}
