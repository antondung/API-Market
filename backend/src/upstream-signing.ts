import { createHash, createHmac, randomUUID } from "node:crypto";
export function originSigningKey(master: string, origin: string) {
  if (Buffer.byteLength(master) < 32)
    throw new Error("Invalid upstream master secret");
  return createHmac("sha256", master)
    .update(`upstream-origin-v1:${new URL(origin).origin}`)
    .digest("hex");
}
export function upstreamSecret(
  jwt: string,
  configured: string | undefined,
  production: boolean,
) {
  const value = configured?.trim();
  if (!value && production)
    throw new Error("GATEWAY_UPSTREAM_SECRET is required in production");
  const secret =
    value ||
    createHmac("sha256", jwt).update("upstream-signing-v1").digest("hex");
  if (Buffer.byteLength(secret) < 32 || secret.startsWith("replace-"))
    throw new Error("GATEWAY_UPSTREAM_SECRET must contain at least 32 bytes");
  return secret;
}
export function signedUpstreamHeaders(
  secret: string,
  method: string,
  url: URL,
  body?: Buffer,
  at = Math.floor(Date.now() / 1000),
  nonce = randomUUID(),
) {
  if (Buffer.byteLength(secret) < 32)
    throw new Error("Invalid upstream signing secret");
  const timestamp = String(at);
  const canonical = [
    method.toUpperCase(),
    url.origin,
    url.pathname + url.search,
    timestamp,
    nonce,
    createHash("sha256")
      .update(body ?? Buffer.alloc(0))
      .digest("hex"),
  ].join("\n");
  return {
    "x-gateway-timestamp": timestamp,
    "x-gateway-nonce": nonce,
    "x-gateway-signature": createHmac("sha256", secret)
      .update(canonical)
      .digest("hex"),
  };
}
