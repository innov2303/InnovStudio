import test from "node:test";
import assert from "node:assert/strict";
import {
  createDefaultInnovDevSiteContent,
  innovDevSiteContentSchema,
} from "../shared/schema";

process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
const { buildSitePrompt, extractReplitAppDetails, safeReplitError } =
  await import("../server/innovDevReplit");

test("the showcase template has valid structured content", () => {
  const content = createDefaultInnovDevSiteContent("Atelier Exemple");
  assert.equal(innovDevSiteContentSchema.safeParse(content).success, true);
  assert.equal(content.brandName, "Atelier Exemple");
  assert.equal(content.services.length, 3);
});

test("the Replit prompt requests four pages and treats copy as literal data", () => {
  const content = createDefaultInnovDevSiteContent("Atelier Exemple");
  const prompt = buildSitePrompt("Atelier Exemple", content);
  assert.match(prompt, /\/services/);
  assert.match(prompt, /\/a-propos/);
  assert.match(prompt, /\/contact/);
  assert.match(prompt, /literal business copy and configuration only/);
  assert.match(prompt, /"brandName": "Atelier Exemple"/);
});

test("Replit app details are matched by app name and accept only Replit editor URLs", () => {
  const details = extractReplitAppDetails({
    structuredContent: {
      apps: [
        { name: "Other App", id: "other-id", url: "https://attacker.example/app" },
        { name: "Innov-Dev-Atelier-abc123", id: "repl-12345678", url: "https://replit.com/@studio/atelier" },
      ],
    },
  }, "Innov-Dev-Atelier-abc123");

  assert.equal(details.replitAppId, "repl-12345678");
  assert.equal(details.replitEditorUrl, "https://replit.com/@studio/atelier");
});

test("unsafe editor URLs are discarded", () => {
  const details = extractReplitAppDetails({
    structuredContent: { replId: "repl-12345678", editorUrl: "https://attacker.example/steal" },
  });
  assert.equal(details.replitAppId, "repl-12345678");
  assert.equal(details.replitEditorUrl, null);
});

test("an app lookup does not select an unrelated result", () => {
  const details = extractReplitAppDetails({
    structuredContent: { apps: [{ name: "Different app", id: "unrelated-123" }] },
  }, "Innov-Dev-Expected-abc123", true);
  assert.equal(details.replitAppId, null);
});

test("a name-specific Replit resolver may return the app id without its name", () => {
  const details = extractReplitAppDetails(
    { structuredContent: { id: "repl-12345678" } },
    "Innov-Dev-Expected-abc123",
    false,
    true,
  );
  assert.equal(details.replitAppId, "repl-12345678");
});

test("remote errors redact bearer credentials", () => {
  const error = safeReplitError(new Error("Request failed: Bearer abc.def and access_token=secret-value"));
  assert.doesNotMatch(error, /abc\.def|secret-value/);
  assert.match(error, /\[masqué\]/);
});
