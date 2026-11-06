import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const required = [
  "STAGING_BASE_URL",
  "STAGING_CONSUMER_EMAIL",
  "STAGING_CONSUMER_PASSWORD",
  "STAGING_ADMIN_EMAIL",
  "STAGING_ADMIN_PASSWORD",
  "STAGING_API_ID",
  "STAGING_PLAN_ID",
  "STAGING_API_PATH",
];
for (const name of required)
  if (!process.env[name]) throw Error(`Missing ${name}`);
const base = new URL(process.env.STAGING_BASE_URL);
if (
  base.protocol !== "https:" ||
  base.username ||
  base.password ||
  base.pathname !== "/" ||
  base.search ||
  base.hash
)
  throw Error("STAGING_BASE_URL must be an HTTPS origin");
const path = process.env.STAGING_API_PATH;
if (!path.startsWith("/") || path.startsWith("//") || /[?#\\]/.test(path))
  throw Error("Use the exact registered STAGING_API_PATH");
const query = JSON.parse(process.env.STAGING_QUERY ?? "{}");
const apiId = process.env.STAGING_API_ID,
  planId = process.env.STAGING_PLAN_ID;
if (!/^[1-9][0-9]*$/.test(apiId) || !/^[1-9][0-9]*$/.test(planId))
  throw Error("Invalid API/plan id");
async function call(path, method = "GET", body, headers = {}, expected = 200) {
  const response = await fetch(new URL(path, base), {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  });
  if (response.status !== expected)
    throw Error(
      `Smoke step failed: ${method} ${path.split("?")[0]} HTTP ${response.status} (expected ${expected})`,
    );
  if (response.status === 204) return;
  return (await response.json()).data;
}
const consumer = await call("/api/auth/login", "POST", {
  email: process.env.STAGING_CONSUMER_EMAIL,
  password: process.env.STAGING_CONSUMER_PASSWORD,
});
const admin = await call("/api/auth/login", "POST", {
  email: process.env.STAGING_ADMIN_EMAIL,
  password: process.env.STAGING_ADMIN_PASSWORD,
});
const ch = { Authorization: `Bearer ${consumer.accessToken}` },
  ah = { Authorization: `Bearer ${admin.accessToken}` };
const detail = await call(`/api/marketplace/apis/${apiId}`);
assert.ok(detail.plans.some((p) => p.id === planId));
assert.ok(detail.endpoints.some((e) => e.method === "GET" && e.path === path));
const sub = await call(
  "/api/consumer/subscriptions",
  "POST",
  { planId },
  ch,
  201,
);
let key;
try {
  if (sub.status === "Pending") {
    const checkout = await call(
      `/api/consumer/subscriptions/${sub.id}/checkout`,
      "POST",
      { idempotencyKey: `smoke-${randomUUID()}` },
      ch,
      201,
    );
    const event = {
      paymentId: checkout.paymentId,
      token: checkout.token,
      outcome: "success",
      eventId: `smoke-${randomUUID()}`,
    };
    await call("/api/consumer/subscriptions/confirm", "POST", event, ch);
    await call("/api/consumer/subscriptions/confirm", "POST", event, ch);
  }
  key = await call(
    "/api/consumer/api-keys",
    "POST",
    { apiId, label: "Sprint4 staging QA" },
    ch,
    201,
  );
  const gatewayPath = `/api/gateway/${apiId}${path}?${new URLSearchParams(query)}`;
  await call(gatewayPath, "GET", undefined, { "x-api-key": key.key });
  let logged = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    const usage = await call(
      `/api/consumer/usage/history?apiId=${apiId}`,
      "GET",
      undefined,
      ch,
    );
    if (usage.items.length) {
      logged = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(logged, "Usage not persisted within 10 seconds");
  await call(
    `/api/admin/subscriptions/${sub.id}/suspend`,
    "POST",
    { reason: "Sprint4 staging smoke test" },
    ah,
  );
  await call(gatewayPath, "GET", undefined, { "x-api-key": key.key }, 403);
  await call(
    `/api/admin/api-keys/${key.id}/revoke`,
    "POST",
    { reason: "Sprint4 staging smoke test" },
    ah,
  );
  await call(gatewayPath, "GET", undefined, { "x-api-key": key.key }, 401);
  const health = await call("/api/admin/operations", "GET", undefined, ah);
  assert.equal(health.gateway, "ready");
  assert.equal(health.worker.status, "online");
  console.log(
    "PASS: Marketplace → subscribe/payment → key → Gateway → usage; suspend/revoke enforced; Redis/worker healthy.",
  );
} finally {
  if (key)
    await call(
      `/api/admin/api-keys/${key.id}/revoke`,
      "POST",
      { reason: "Sprint4 smoke cleanup" },
      ah,
    ).catch(() => console.error("Cleanup required for smoke key"));
  await call(
    `/api/consumer/subscriptions/${sub.id}/cancel`,
    "POST",
    { immediate: true },
    ch,
  ).catch(() =>
    console.error("Smoke subscription remains; Admin cleanup required"),
  );
}
