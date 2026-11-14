import test from "node:test";
import assert from "node:assert/strict";
import { adminWorkspaces, getAdminWorkspace, resolveDashboardSection } from "../shared/adminWorkspaces";

test("administration has exactly three named spaces with unique child sections", () => {
  assert.deepEqual(adminWorkspaces.map((workspace) => workspace.label), [
    "Innov Studio", "Innov Studio Dev", "Innov Studio Prod",
  ]);
  const sections = adminWorkspaces.flatMap((workspace) => workspace.sections.map((item) => item.id));
  assert.equal(new Set(sections).size, sections.length);
});

test("all original administration tools remain under Innov Studio", () => {
  const studio = adminWorkspaces.find((workspace) => workspace.id === "studio")!;
  assert.deepEqual(studio.sections.map((section) => section.id).sort(), [
    "dashboard", "profile", "projects", "documents", "subscription_settings",
    "users", "references", "seo", "logs", "analytics",
  ].sort());
});

test("creation and modules are in Dev while site supervision belongs to Prod", () => {
  assert.equal(getAdminWorkspace("innov_dev")?.id, "dev");
  assert.equal(getAdminWorkspace("innov_dev_modules")?.id, "dev");
  assert.equal(getAdminWorkspace("innov_prod")?.id, "prod");
  assert.equal(resolveDashboardSection("innov_dev", true), "innov_dev");
  assert.equal(resolveDashboardSection("innov_prod", true), "innov_prod");
});

test("client navigation cannot select an administrator workspace or unknown section", () => {
  for (const section of ["innov_dev", "innov_dev_modules", "innov_prod", "users", "seo", "unrecognized"]) {
    assert.equal(resolveDashboardSection(section, false), "dashboard");
  }
  assert.equal(resolveDashboardSection("services", false), "services");
  assert.equal(resolveDashboardSection("services", true), "dashboard");
  assert.equal(resolveDashboardSection(null, true), "dashboard");
});
