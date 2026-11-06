import test from "node:test";
import assert from "node:assert/strict";
import { sandboxSecret } from "../src/sandbox-config.js";
test("sandbox config permits blank development Compose value but requires production secret", () => {
  assert.equal(
    sandboxSecret("jwt-test", "", false),
    sandboxSecret("jwt-test", undefined, false),
  );
  assert.equal(sandboxSecret("jwt-test", "   ", false).length, 64);
  assert.throws(() => sandboxSecret("jwt-test", "", true));
  assert.throws(() => sandboxSecret("jwt-test", "   ", true));
  assert.throws(() => sandboxSecret("jwt-test", "short", false));
  assert.equal(sandboxSecret("jwt-test", "a".repeat(32), true), "a".repeat(32));
});
