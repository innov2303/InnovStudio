import assert from "node:assert/strict";
import test from "node:test";
import { googleProfileSchema } from "../shared/schema";

const requiredProfile = {
  firstName: "Camille",
  lastName: "Martin",
  company: "Atelier Martin",
  address: "12 rue des Lilas",
  postalCode: "75010",
  city: "Paris",
};

test("Google profile completion defaults billing details to the business address", () => {
  const profile = googleProfileSchema.parse(requiredProfile);
  assert.equal(profile.sameAsBilling, true);
});

test("Google profile completion requires separate billing details when selected", () => {
  const result = googleProfileSchema.safeParse({
    ...requiredProfile,
    sameAsBilling: false,
  });
  assert.equal(result.success, false);
});
