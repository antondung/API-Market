import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import {
  signedUpstreamHeaders,
  originSigningKey,
  upstreamSecret,
} from "../src/upstream-signing.js";
import { SafeProxy } from "../src/safe-proxy.js";
const secret = "upstream-test-key-at-least-32-characters";
const { upstreamVerifier } = await import(
  pathToFileURL(resolve("mock-services/gateway-auth.mjs")).href
);
test("upstream HMAC binds method, origin, path/query, body, timestamp and nonce; denies direct/replayed requests", () => {
  const url = new URL("https://weather.example/v1/weather?city=Hanoi"),
    body = Buffer.from('{"a":1}');
  const at = Math.floor(Date.now() / 1000),
    headers = signedUpstreamHeaders(secret, "POST", url, body, at);
  const verify = upstreamVerifier(secret, url.origin);
  assert.equal(verify("POST", url.pathname + url.search, {}, body), false);
  for (const [method, path, content, origin] of [
    ["GET", url.pathname + url.search, body, url.origin],
    ["POST", "/other", body, url.origin],
    ["POST", url.pathname + url.search, Buffer.from("{}"), url.origin],
    ["POST", url.pathname + url.search, body, "https://attacker.example"],
  ] as const)
    assert.equal(
      upstreamVerifier(secret, origin)(method, path, headers, content),
      false,
    );
  assert.equal(
    upstreamVerifier(secret, url.origin, () => Date.now() + 120000)(
      "POST",
      url.pathname + url.search,
      headers,
      body,
    ),
    false,
  );
  assert.equal(verify("POST", url.pathname + url.search, headers, body), true);
  assert.equal(verify("POST", url.pathname + url.search, headers, body), false);
  assert.throws(() => upstreamSecret("jwt", "", true));
  assert.throws(() => upstreamSecret("jwt", "short", false));
});
test("SafeProxy signs its final validated URL/body and still refuses caller-controlled signing headers", async () => {
  let captured: any;
  const proxy = new SafeProxy({
    signingSecret: secret,
    lookup: async () => [{ address: "8.8.8.8", family: 4 }],
    request: (options, callback) => {
      captured = options;
      const req: any = new EventEmitter();
      req.destroy = () => {};
      req.end = (body: Buffer) => {
        setImmediate(() => {
          const socket: any = new EventEmitter();
          socket.remoteAddress = "8.8.8.8";
          req.emit("socket", socket);
          const res: any = Readable.from(["ok"]);
          res.statusCode = 200;
          res.headers = {};
          assert.equal(
            upstreamVerifier(
              originSigningKey(secret, "https://weather.example"),
              "https://weather.example",
            )("POST", options.path, options.headers, body),
            true,
          );
          callback(res);
        });
      };
      return req;
    },
  });
  await assert.rejects(
    proxy.prepare(
      "https://weather.example",
      "/v1/weather",
      { headers: { "x-gateway-signature": "forged" } },
      1000,
    ),
    { status: 400 },
  );
  await proxy.execute(
    await proxy.prepare(
      "https://weather.example",
      "/v1/weather",
      { method: "POST", body: { city: "Hanoi" }, query: { x: "a b" } },
      1000,
    ),
  );
  assert.equal(typeof captured.headers["x-gateway-signature"], "string");
});

test("each upstream origin receives a distinct leaf key without disclosing the Gateway master", async () => {
  const helper = await import(
    pathToFileURL(resolve("mock-services/gateway-auth.mjs")).href
  );
  const first = originSigningKey(secret, "https://first.example"),
    second = originSigningKey(secret, "https://second.example");
  assert.equal(first, helper.originSigningKey(secret, "https://first.example"));
  assert.notEqual(first, second);
  assert.notEqual(first, secret);
  const url = new URL("https://second.example/resource");
  const signedByFirst = signedUpstreamHeaders(first, "GET", url);
  assert.equal(
    upstreamVerifier(second, url.origin)("GET", url.pathname, signedByFirst),
    false,
  );
});
