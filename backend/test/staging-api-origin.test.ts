import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
const { validateStagingApiOrigin } = await import(
  new URL("../../scripts/staging-api-origin.mjs", import.meta.url).href
);
test("staging build accepts and normalizes the actual public HTTPS backend origin", () => {
  assert.equal(
    validateStagingApiOrigin(" HTTPS://API.STAGE.ACME.DEV:443/ "),
    "https://api.stage.acme.dev",
  );
  assert.equal(
    validateStagingApiOrigin("https://api.stage.acme.dev:8443"),
    "https://api.stage.acme.dev:8443",
  );
});
test("staging build fails closed on missing, sample, local or malformed configuration", () => {
  for (const value of [
    undefined,
    "",
    "https://api-staging.example.com",
    "https://example.net",
    "https://api.example.org",
    "http://api.stage.acme.dev",
    "https://localhost",
    "https://127.0.0.1",
    "https://backend.internal",
    "https://api.stage.acme.dev/path",
    "https://user:private-password@api.stage.acme.dev",
    "https://api.stage.acme.dev?q=a",
    "https://api.stage.acme.dev#fragment",
    "https://api.stage.acme.dev\n.evil.net",
  ])
    assert.throws(() => validateStagingApiOrigin(value));
});
test("staging URL CLI emits only the configured origin and never falls back to a template or logs credentials", () => {
  const run = (value?: string) => {
    const env = { ...process.env };
    delete env.STAGING_API_BASE_URL;
    if (value !== undefined) env.STAGING_API_BASE_URL = value;
    return spawnSync(process.execPath, ["scripts/staging-api-origin.mjs"], {
      env,
      encoding: "utf8",
      windowsHide: true,
    });
  };
  const valid = run("https://api.stage.acme.dev/");
  assert.equal(valid.status, 0);
  assert.equal(valid.stdout.trim(), "https://api.stage.acme.dev");
  const missing = run();
  assert.notEqual(missing.status, 0);
  assert.equal(missing.stdout, "");
  const invalid = run("https://user:private-password@api.stage.acme.dev");
  assert.notEqual(invalid.status, 0);
  assert.equal(invalid.stdout, "");
  assert.equal(invalid.stderr.includes("private-password"), false);
});
test("CD passes the repository API URL through validation into the frontend image build", () => {
  const workflow = parse(
    readFileSync(".github/workflows/cd-staging.yml", "utf8"),
  );
  const build = workflow.jobs.images.steps.find((step: any) =>
    step.run?.includes("build_one frontend"),
  );
  assert.equal(
    build.env.STAGING_API_BASE_URL,
    "${{ vars.STAGING_API_BASE_URL }}",
  );
  assert.match(
    build.run,
    /vite_url="\$\(node scripts\/staging-api-origin\.mjs\)"/,
  );
  assert.match(
    build.run,
    /build_one frontend .*--build-arg "VITE_API_BASE_URL=\$\{vite_url\}"/,
  );
  assert.doesNotMatch(build.run, /\.env\.staging\.example/);
});
