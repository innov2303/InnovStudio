import test from "node:test";
import assert from "node:assert/strict";

process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
const { default: config } = await import("../drizzle.config");

test("database pushes leave the independently managed login session table untouched", () => {
  assert.deepEqual(config.tablesFilter, ["!session"]);
});
