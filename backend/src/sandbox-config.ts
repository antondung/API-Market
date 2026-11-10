import { createHmac } from "node:crypto";
export function sandboxSecret(
  jwtSecret: string,
  configured: string | undefined,
  production: boolean,
) {
  const value = configured?.trim();
  if (!value && production)
    throw new Error("SANDBOX_WEBHOOK_SECRET is required in production");
  const secret =
    value ||
    createHmac("sha256", jwtSecret).update("payment-sandbox-v1").digest("hex");
  if (Buffer.byteLength(secret) < 32 || secret.startsWith("replace-"))
    throw new Error("SANDBOX_WEBHOOK_SECRET must contain at least 32 bytes and cannot be a placeholder");
  return secret;
}
