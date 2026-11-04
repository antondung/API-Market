import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "redis";
import { RedisMeter } from "../src/redis-meter.js";
test("Redis atomic last quota slot, rate gate, eviction floor and fail-closed", async () => {
  const client = createClient({
    url: process.env.REDIS_TEST_URL,
    socket: { reconnectStrategy: false },
  });
  client.on("error", () => {});
  await client.connect();
  const meter = new RedisMeter(client, `test:${randomUUID()}`);
  const input = {
    apiKeyId: "1",
    endpointId: "2",
    subscriptionId: "3",
    periodStart: "2026-01-01",
    expiresAt: Date.now() + 60000,
    rateLimit: 100,
    quota: 5,
    floor: 4,
  };
  try {
    const result = await Promise.allSettled(
      Array.from({ length: 5 }, () => meter.consume(input)),
    );
    assert.equal(result.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(
      result.filter(
        (r) =>
          r.status === "rejected" &&
          (r.reason as any).code === "QUOTA_EXHAUSTED",
      ).length,
      4,
    );
    const other = {
      ...input,
      subscriptionId: "4",
      apiKeyId: "2",
      rateLimit: 1,
      quota: 100,
      floor: 0,
    };
    await meter.consume(other);
    await assert.rejects(meter.consume(other), { status: 429 });
    await client.del(`${meter.prefix}:quota:3:2026-01-01`);
    await assert.rejects(meter.consume({ ...input, floor: 5 }), {
      status: 403,
    });
    await client.quit();
    await assert.rejects(meter.consume({ ...input, subscriptionId: "5" }), {
      status: 503,
    });
  } finally {
    if (client.isOpen) await client.quit();
  }
});

test("Redis stalled response fails closed within the metering deadline", async () => {
  const meter = new RedisMeter(
    { eval: () => new Promise(() => {}) },
    "deadline-test",
    20,
  );
  await assert.rejects(
    meter.consume({
      apiKeyId: "1",
      endpointId: "1",
      subscriptionId: "1",
      periodStart: "test",
      expiresAt: Date.now() + 60000,
      rateLimit: 10,
      quota: 10,
      floor: 0,
    }),
    { status: 503, code: "QUOTA_UNAVAILABLE" },
  );
});
