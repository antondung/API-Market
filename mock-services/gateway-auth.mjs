import { createHash, createHmac, timingSafeEqual } from "node:crypto";
export function originSigningKey(master, origin) {
  if (Buffer.byteLength(master) < 32)
    throw new Error("Invalid upstream master secret");
  return createHmac("sha256", master)
    .update(`upstream-origin-v1:${new URL(origin).origin}`)
    .digest("hex");
}
/** One replay cache per upstream instance; use shared nonce storage for multiple replicas. */
export function upstreamVerifier(secret, origin, clock = () => Date.now()) {
  if (Buffer.byteLength(secret) < 32)
    throw new Error("Gateway shared secret must contain at least 32 bytes");
  const audience = new URL(origin).origin;
  const seen = new Map();
  return (method, path, headers, body = Buffer.alloc(0)) => {
    const at = headers["x-gateway-timestamp"],
      nonce = headers["x-gateway-nonce"],
      signature = headers["x-gateway-signature"];
    const now = clock();
    if (
      typeof at !== "string" ||
      !/^\d{10}$/.test(at) ||
      Math.abs(now - Number(at) * 1000) > 60000 ||
      typeof nonce !== "string" ||
      !/^[a-f0-9-]{36}$/.test(nonce) ||
      typeof signature !== "string" ||
      !/^[a-f0-9]{64}$/.test(signature)
    )
      return false;
    for (const [key, expiry] of seen) if (expiry <= now) seen.delete(key);
    if (seen.has(nonce) || seen.size >= 10000) return false;
    const canonical = [
      method.toUpperCase(),
      audience,
      path,
      at,
      nonce,
      createHash("sha256").update(body).digest("hex"),
    ].join("\n");
    const expected = createHmac("sha256", secret).update(canonical).digest();
    if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) return false;
    seen.set(nonce, now + 120000);
    return true;
  };
}
