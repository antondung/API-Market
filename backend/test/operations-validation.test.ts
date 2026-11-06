import test from "node:test";
import assert from "node:assert/strict";
import { monitorQuery } from "../src/subscription-admin-service.js";
test("Admin monitor rejects malformed INTEGER IDs as validation failures without throwing conversion errors", () => {
  for (const field of ["consumerId", "apiId"])
    for (const value of [
      "abc",
      "1.5",
      "1e3",
      "-1",
      "0",
      "99999999999999999999",
      "",
    ])
      assert.equal(monitorQuery.safeParse({ [field]: value }).success, false);
  assert.equal(
    monitorQuery.safeParse({ apiId: "2147483647", consumerId: "1" }).success,
    true,
  );
});
