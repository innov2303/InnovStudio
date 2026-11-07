import assert from "node:assert/strict";
import test from "node:test";
import { getSectionAtPosition } from "../client/src/lib/home-section-navigation";

const sections = [
  { id: "home-hero", top: 0, bottom: 800 },
  { id: "features", top: 800, bottom: 1600 },
  { id: "services", top: 1600, bottom: 2400 },
  { id: "contact", top: 2400, bottom: 3200 },
];

test("section navigation follows the section under the viewport marker", () => {
  assert.equal(getSectionAtPosition(sections, 450), "home-hero");
  assert.equal(getSectionAtPosition(sections, 1250), "features");
  assert.equal(getSectionAtPosition(sections, 2050), "services");
  assert.equal(getSectionAtPosition(sections, 2850), "contact");
});

test("section navigation switches at a section boundary", () => {
  assert.equal(getSectionAtPosition(sections, 800), "features");
});

test("section navigation selects the nearest section if the marker falls in a gap", () => {
  const sectionsWithGap = [
    { id: "first", top: 0, bottom: 500 },
    { id: "second", top: 700, bottom: 1200 },
  ];

  assert.equal(getSectionAtPosition(sectionsWithGap, 550), "first");
  assert.equal(getSectionAtPosition(sectionsWithGap, 680), "second");
  assert.equal(getSectionAtPosition([], 100), undefined);
});
