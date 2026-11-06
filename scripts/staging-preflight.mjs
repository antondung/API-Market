// Run on the staging host with node --env-file=.env.staging scripts/staging-preflight.mjs.
const secrets = [
  "JWT_SECRET",
  "SANDBOX_WEBHOOK_SECRET",
  "GATEWAY_UPSTREAM_SECRET",
];
for (const name of secrets) {
  const value = process.env[name]?.trim();
  if (!value || Buffer.byteLength(value) < 32 || value.startsWith("replace-"))
    throw Error(`${name} must be an independent random secret >=32 bytes`);
}
if (
  new Set(secrets.map((name) => process.env[name]?.trim())).size !==
  secrets.length
)
  throw Error("Do not reuse secrets between JWT, payment and upstream signing");
if (process.env.NODE_ENV !== "production")
  throw Error("Staging must use NODE_ENV=production");
if (
  !process.env.POSTGRES_PASSWORD ||
  process.env.POSTGRES_PASSWORD.startsWith("replace-") ||
  process.env.POSTGRES_PASSWORD.length < 16
)
  throw Error("Set a strong staging PostgreSQL password");
for (const name of ["VITE_API_BASE_URL", "CORS_ORIGINS"]) {
  const values = (process.env[name] ?? "").split(",").map((s) => s.trim());
  for (const value of values) {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname.endsWith(".example.com") ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw Error(`${name} requires real HTTPS origins`);
  }
}
console.log(
  "Staging configuration preflight passed; this does not verify a deployed environment.",
);
