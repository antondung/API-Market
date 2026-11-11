const bearer = [{ bearerAuth: [] }];
const id = { type: "string", pattern: "^[1-9][0-9]*$" };
const key = { type: "string", pattern: "^[A-Za-z0-9_.:-]{1,100}$" };
const object = (properties: object, required: string[]) => ({
  type: "object",
  additionalProperties: false,
  properties,
  ...(required.length ? { required } : {}),
});
const param = (name: string) => ({
  name,
  in: "path",
  required: true,
  schema: id,
});
const query = [
  {
    name: "page",
    in: "query",
    schema: { type: "integer", minimum: 1, maximum: 10000 },
  },
  {
    name: "pageSize",
    in: "query",
    schema: { type: "integer", minimum: 1, maximum: 100 },
  },
];
const usageQuery = [
  ...query,
  { name: "apiId", in: "query", schema: id },
  {
    name: "status",
    in: "query",
    schema: { type: "integer", minimum: 100, maximum: 599 },
  },
  ...["from", "to"].map((name) => ({
    name,
    in: "query",
    schema: { type: "string", format: "date" },
  })),
];
const metricCount = { type: "string", pattern: "^[0-9]+$" };
const trafficSchema = {
  requestCount: metricCount,
  errorCount: metricCount,
  clientErrorCount: metricCount,
  serverErrorCount: metricCount,
  errorRatePercent: { type: "number", minimum: 0, maximum: 100 },
  ...Object.fromEntries([50, 95, 99].flatMap(p => [
    [`p${p}LatencyMs`, { type: "integer", nullable: true }],
    [`p${p}OverheadMs`, { type: "integer", nullable: true }],
  ])),
};
const overviewOperation = operation(
  "Owned API and top endpoint traffic, error rate, latency, active subscribers and sandbox revenue",
  undefined,
  [
    ...usageQuery,
    { name: "endpointId", in: "query", schema: id, description: "Limits traffic metrics only. Revenue and subscribers remain scoped to the selected API." },
  ],
);
const apiTraffic = { ...trafficSchema, apiId: id, apiName: { type: "string" } };
const overviewSchema = {
  type: "object",
  properties: {
    data: {
      type: "object",
      properties: {
        requests: { type: "object", properties: { ...trafficSchema, successCount: metricCount, averageLatencyMs: { type: "number" } } },
        daily: { type: "array", items: { type: "object", properties: { date: { type: "string", format: "date" }, requestCount: metricCount } } },
        revenue: { type: "array", items: { type: "object", properties: { currency: { type: "string" }, amount: { type: "string" } } } },
        activeSubscribers: metricCount,
        apiBreakdown: { type: "array", items: { type: "object", properties: apiTraffic } },
        topEndpoints: { type: "array", maxItems: 10, items: { type: "object", properties: { ...apiTraffic, endpointId: id, method: { type: "string" }, path: { type: "string" } } } },
      },
    },
  },
};
function operation(
  summary: string,
  schema?: object,
  parameters: object[] = [],
  security: object[] = bearer,
) {
  return {
    summary,
    tags: ["Sprint 4"],
    security,
    parameters,
    ...(schema
      ? {
          requestBody: {
            required: true,
            content: { "application/json": { schema } },
          },
        }
      : {}),
    responses: {
      "200": { description: "Successful operation; data envelope" },
      "201": { description: "Created; data envelope" },
      "400": { description: "Validation error" },
      "401": { description: "Authentication failed" },
      "403": { description: "Role/entitlement denied" },
      "404": { description: "Owned resource not found" },
      "409": { description: "State or idempotency conflict" },
      "429": { description: "Rate limit exceeded" },
      "503": { description: "Metering unavailable, fail closed" },
    },
  };
}
export const sprint4Paths = {
  "/api/consumer/subscriptions": {
    get: operation("List my subscriptions", undefined, query),
    post: operation(
      "Subscribe to a Published active plan (Free activates immediately)",
      object({ planId: id }, ["planId"]),
    ),
  },
  "/api/consumer/subscriptions/{id}": {
    get: operation("Get my subscription", undefined, [param("id")]),
  },
  "/api/consumer/subscriptions/{id}/cancel": {
    post: operation(
      "Cancel renewal; immediate=true revokes access now",
      object({ immediate: { type: "boolean", default: false } }, []),
      [param("id")],
    ),
  },
  "/api/consumer/subscriptions/{id}/checkout": {
    post: operation(
      "Create/replay sandbox checkout; no real money or card data",
      object({ idempotencyKey: key }, ["idempotencyKey"]),
      [param("id")],
    ),
  },
  "/api/consumer/subscriptions/{id}/change-plan": {
    post: operation(
      "Stage plan change; only confirmed payment changes entitlement; quota is preserved",
      object({ planId: id, idempotencyKey: key }, ["planId", "idempotencyKey"]),
      [param("id")],
    ),
  },
  "/api/consumer/subscriptions/confirm": {
    post: operation(
      "Authenticated owner simulates sandbox outcome with one checkout token",
      object(
        {
          paymentId: id,
          token: { type: "string", maxLength: 200 },
          outcome: { type: "string", enum: ["success", "failure"] },
          eventId: key,
        },
        ["paymentId", "token", "outcome", "eventId"],
      ),
    ),
  },
  "/api/consumer/subscriptions/sandbox-webhook": {
    post: operation(
      "HMAC SHA256 over timestamp + dot + exact raw JSON; 5-minute tolerance",
      object(
        {
          paymentId: id,
          outcome: { type: "string", enum: ["success", "failure"] },
          eventId: key,
        },
        ["paymentId", "outcome", "eventId"],
      ),
      [
        {
          name: "x-sandbox-timestamp",
          in: "header",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "x-sandbox-signature",
          in: "header",
          required: true,
          schema: { type: "string", pattern: "^[a-f0-9]{64}$" },
        },
      ],
      [],
    ),
  },
  "/api/consumer/usage/summary": {
    get: operation(
      "My durable quota and daily request summary",
      undefined,
      usageQuery,
    ),
  },
  "/api/consumer/usage/history": {
    get: operation(
      "My redacted request history, no headers or bodies",
      undefined,
      usageQuery,
    ),
  },
  "/api/provider/analytics/overview": {
    get: {
      ...overviewOperation,
      responses: {
        ...overviewOperation.responses,
        "200": { description: "Traffic analytics by UTC date. Percentiles are null when no samples match.", content: { "application/json": { schema: overviewSchema } } },
      },
    },
  },
};
