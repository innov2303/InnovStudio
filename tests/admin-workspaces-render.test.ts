import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminWorkspaceNavigation from "../client/src/components/admin-workspaces/AdminWorkspaceNavigation";
import InnovProdSection from "../client/src/components/admin-workspaces/InnovProdSection";
import { createDefaultInnovDevSiteContent } from "../shared/schema";

test("expanded navigation highlights the selected section inside its workspace", () => {
  const html = renderToStaticMarkup(createElement(AdminWorkspaceNavigation, {
    activeSection: "innov_prod", collapsed: false, onNavigate: () => {},
  }));
  for (const workspace of ["studio", "dev", "prod"]) {
    assert.match(html, new RegExp(`data-testid="workspace-${workspace}"`));
  }
  assert.match(html, /data-testid="menu-innov_prod" aria-current="page"/);
  assert.match(html, /id="workspace-menu-studio" hidden=""/);
  assert.doesNotMatch(html, /id="workspace-menu-prod" hidden=""/);
});

test("collapsed navigation retains accessible controls for the three spaces", () => {
  const html = renderToStaticMarkup(createElement(AdminWorkspaceNavigation, {
    activeSection: "innov_dev", collapsed: true, onNavigate: () => {},
  }));
  assert.match(html, /aria-label="Innov Studio Dev/);
  assert.match(html, /aria-label="Innov Studio Prod/);
  assert.doesNotMatch(html, /data-testid="menu-/);
});

test("Prod displays saved publication data without unsafe links or claiming live monitoring", () => {
  const client = new QueryClient();
  client.setQueryData(["/api/innov-dev/sites"], [{
    id: "demo", siteName: "Site de démonstration", projectId: "demo-project",
    templateId: "showcase-v1", content: createDefaultInnovDevSiteContent("Démo"),
    status: "published", publicUrl: "javascript:alert(1)",
    replitEditorUrl: "https://attacker.example/app", lastPublishedAt: null,
    updatedAt: null, lastError: null,
  }]);
  const html = renderToStaticMarkup(createElement(QueryClientProvider, { client },
    createElement(InnovProdSection, { onOpenBuilder: () => {} })));
  client.clear();
  assert.match(html, /Site de démonstration/);
  assert.match(html, /La supervision n’est pas encore active/);
  assert.match(html, /Dernière publication/);
  assert.doesNotMatch(html, /href="javascript:/);
  assert.doesNotMatch(html, /href="https:\/\/attacker/);
});
