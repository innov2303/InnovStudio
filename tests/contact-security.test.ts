import assert from "node:assert/strict";
import test from "node:test";
import { contactMessageSchema, emailAddressSchema } from "../shared/schema";
import { escapeEmailHtml } from "../server/email";

test("contact form requires valid, bounded fields and normalizes its optional subject", () => {
  const parsed = contactMessageSchema.safeParse({
    name: "  Camille Martin  ",
    email: " camille@example.com ",
    message: "  Bonjour Innov Studio  ",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.name, "Camille Martin");
    assert.equal(parsed.data.email, "camille@example.com");
    assert.equal(parsed.data.message, "Bonjour Innov Studio");
    assert.equal(parsed.data.subject, "Sans sujet");
    assert.equal(parsed.data.phone, "");
  }
});

test("contact form rejects markup in phone numbers and oversized messages", () => {
  assert.equal(emailAddressSchema.safeParse("<img@evil.example").success, false);

  assert.equal(contactMessageSchema.safeParse({
    name: "Camille",
    email: "camille@example.com",
    phone: "123\" onclick=alert(1)",
    message: "Bonjour",
  }).success, false);

  assert.equal(contactMessageSchema.safeParse({
    name: "Camille",
    email: "camille@example.com",
    message: "x".repeat(10_001),
  }).success, false);
});

test("contact email values are fully escaped for HTML contexts", () => {
  assert.equal(
    escapeEmailHtml(`<tag attr="x">& '`),
    "&lt;tag attr=&quot;x&quot;&gt;&amp; &#39;",
  );
});
