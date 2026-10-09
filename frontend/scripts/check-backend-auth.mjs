import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// Run against a development backend only; this creates two test accounts.
const base = process.env.VITE_API_BASE_URL || "http://127.0.0.1:3000";
const password = randomUUID();
async function call(path, body, token) {
  const response = await fetch(`${base}${path}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, value: response.status === 204 ? null : await response.json() };
}
for (const role of ["Consumer", "Provider"]) {
  const email = `frontend-${randomUUID()}@example.test`;
  const account = { name: "Frontend smoke test", email, password, role };
  assert.equal((await call("/api/auth/register", account)).status, 201);
  assert.equal((await call("/api/auth/register", account)).status, 409);
  assert.equal((await call("/api/auth/login", { email, password: "incorrect-password" })).status, 401);
  const login = await call("/api/auth/login", { email, password });
  assert.equal(login.status, 200);
  const tokens = login.value.data;
  assert.equal((await call("/api/auth/me", null, tokens.accessToken)).value.data.role, role);
  for (const target of ["consumer", "provider", "admin"]) {
    assert.equal((await call(`/api/access/${target}`, null, tokens.accessToken)).status, target === role.toLowerCase() ? 200 : 403);
  }
  const rotated = await call("/api/auth/refresh", { refreshToken: tokens.refreshToken });
  assert.equal(rotated.status, 200);
  assert.notEqual(rotated.value.data.refreshToken, tokens.refreshToken);
  assert.equal((await call("/api/auth/refresh", { refreshToken: tokens.refreshToken })).status, 401);
  assert.equal((await call("/api/auth/logout", {}, rotated.value.data.accessToken)).status, 204);
  assert.equal((await call("/api/auth/me", null, rotated.value.data.accessToken)).status, 401);
  assert.equal((await call("/api/auth/refresh", { refreshToken: rotated.value.data.refreshToken })).status, 401);
}
console.log("PASS: Consumer/Provider registration, duplicate email, bad password, me, role guards, refresh rotation and logout revocation.");
