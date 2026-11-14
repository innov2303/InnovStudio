import test from "node:test";
import assert from "node:assert/strict";
import { generateDrizzleJson } from "drizzle-kit/api";
import * as innovDevSchema from "../shared/innovDevDatabaseSchema";

process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
const { default: config } = await import("../drizzle.config");
const { default: innovDevConfig } = await import("../drizzle.innov-dev.config");

test("database pushes leave the independently managed login session table untouched", () => {
  assert.deepEqual(config.tablesFilter, ["!session"]);
});

test("the Innov Dev command inspects only its two tables and requires confirmation", () => {
  assert.equal(innovDevConfig.schema, "./shared/innovDevDatabaseSchema.ts");
  assert.deepEqual(innovDevConfig.tablesFilter, ["innov_dev_sites", "innov_dev_replit_connections"]);
  assert.equal(innovDevConfig.strict, true);
});

test("the Innov Dev schema cannot generate changes for visits, users, or sessions", () => {
  const snapshot = generateDrizzleJson(innovDevSchema);
  assert.deepEqual(Object.keys(snapshot.tables).sort(), [
    "public.innov_dev_replit_connections",
    "public.innov_dev_sites",
  ]);
});
