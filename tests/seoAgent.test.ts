import assert from "node:assert/strict";
import { test } from "node:test";
import { getSeoPageAuditData, seoPages, type SeoPageAuditData } from "../server/seoPages";

process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
const { analyzeServicePages } = await import("../server/seoAgent");

test("the rendered service pages expose their title, description, canonical and indexable content", () => {
  const pages = seoPages.map(getSeoPageAuditData);

  assert.equal(pages.length, 5);
  assert.ok(pages.some((page) => page.path === "/services"));
  assert.ok(pages.some((page) => page.path === "/references"));
  for (const page of pages) {
    assert.ok(page.title.length > 0, `${page.path} has a title`);
    assert.ok(page.description.length > 0, `${page.path} has a description`);
    assert.equal(page.canonical, `https://innov-studio.fr${page.path}`);
    assert.equal(page.indexable, true);
    assert.ok(page.contentLength >= 300, `${page.path} has enough visible content`);
  }
});

test("service-page recommendations identify their URL and detect canonical/indexability issues", () => {
  const page: SeoPageAuditData = {
    path: "/page-test",
    title: "Titre assez long pour éviter le contrôle de longueur",
    description: "Description suffisamment longue pour passer la règle minimale, mais sans appel à l’action ni mots-clés.",
    canonical: null,
    indexable: false,
    contentLength: 50,
  };

  const suggestions = analyzeServicePages([page], []);

  assert.ok(suggestions.some((suggestion) => suggestion.type === "canonical" && suggestion.urls.includes(page.path)));
  assert.ok(suggestions.some((suggestion) => suggestion.type === "indexability" && suggestion.urls.includes(page.path)));
  assert.ok(suggestions.every((suggestion) => suggestion.urls.includes(page.path)));
});

test("identical recommendations across pages are grouped while retaining each URL", () => {
  const duplicatePages: SeoPageAuditData[] = [
    {
      path: "/service-a",
      title: "Courte",
      description: "Description courte",
      canonical: "https://innov-studio.fr/service-a",
      indexable: true,
      contentLength: 500,
    },
    {
      path: "/service-b",
      title: "Courte",
      description: "Description courte",
      canonical: "https://innov-studio.fr/service-b",
      indexable: true,
      contentLength: 500,
    },
  ];

  const suggestions = analyzeServicePages(duplicatePages, ["mot-clé tendance"]);
  const shortTitle = suggestions.find((suggestion) => suggestion.id.startsWith("title-too-short-"));

  assert.ok(shortTitle);
  assert.deepEqual(shortTitle.urls, ["/service-a", "/service-b"]);
  assert.deepEqual(shortTitle.currentByUrl, {
    "/service-a": "Courte",
    "/service-b": "Courte",
  });
});

test("the report creates page-specific recommendations for every configured service page", () => {
  const pages = seoPages.map(getSeoPageAuditData);
  const suggestions = analyzeServicePages(pages, ["création site web Toulouse"]);
  const suggestedUrls = new Set(suggestions.flatMap((suggestion) => suggestion.urls));

  for (const page of pages) {
    assert.ok(suggestedUrls.has(page.path), `the report includes ${page.path}`);
  }
});
