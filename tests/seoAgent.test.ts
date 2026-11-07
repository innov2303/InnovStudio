import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyHomeSeoMetadata,
  getSeoPageAuditData,
  renderSeoPage,
  seoPages,
  withSeoMetadata,
  type SeoPageAuditData,
} from "../server/seoPages";

process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
const {
  analyzeServicePages,
  getActiveSeoMetadataOverrides,
  parseAppliedSeoChanges,
} = await import("../server/seoAgent");

test("applied SEO metadata updates server-rendered pages and the homepage head", () => {
  const page = seoPages.find((candidate) => candidate.path === "/site-evolutif");
  assert.ok(page);
  const updatedPage = withSeoMetadata(page, {
    title: "Titre ajusté pour le référencement | Innov Studio",
    description: "Description ajustée pour présenter l’offre web évolutive.",
  });
  const pageHtml = renderSeoPage(updatedPage);

  assert.match(pageHtml, /<title>Titre ajusté pour le référencement \| Innov Studio<\/title>/);
  assert.match(pageHtml, /<meta name="description" content="Description ajustée pour présenter l’offre web évolutive\.">/);

  const homeHtml = applyHomeSeoMetadata(
    '<title>Ancien titre</title><meta name="description" content="Ancienne description" /><meta property="og:title" content="Ancien titre" /><meta property="og:description" content="Ancienne description" /><meta name="twitter:title" content="Ancien titre" /><meta name="twitter:description" content="Ancienne description" />',
    {
      title: 'Titre "mis à jour" & validé',
      description: "Nouvelle description.",
    },
  );
  assert.match(homeHtml, /<title>Titre &quot;mis à jour&quot; &amp; validé<\/title>/);
  assert.match(homeHtml, /name="description" content="Nouvelle description\."/);
  assert.match(homeHtml, /property="og:title" content="Titre &quot;mis à jour&quot; &amp; validé"/);
  assert.match(homeHtml, /name="twitter:description" content="Nouvelle description\."/);
});

test("SEO metadata override history keeps the latest active value and supports undo", () => {
  const parsed = parseAppliedSeoChanges(JSON.stringify([
    {
      applicationId: "first",
      suggestionId: "title-a",
      url: "/",
      field: "title",
      value: "Titre A",
      previousValue: "Titre de base",
      appliedAt: "2026-11-07T10:00:00.000Z",
    },
    {
      applicationId: "second",
      suggestionId: "title-b",
      url: "/",
      field: "title",
      value: "Titre B",
      previousValue: "Titre A",
      appliedAt: "2026-11-07T11:00:00.000Z",
      undoneAt: "2026-11-07T11:30:00.000Z",
    },
    {
      applicationId: "description",
      suggestionId: "desc-a",
      url: "/references",
      field: "description",
      value: "Description projet",
      previousValue: "Description initiale",
      appliedAt: "2026-11-07T12:00:00.000Z",
    },
  ]));

  assert.deepEqual({ ...getActiveSeoMetadataOverrides(parsed) }, {
    "/": { title: "Titre A" },
    "/references": { description: "Description projet" },
  });
  assert.deepEqual(parseAppliedSeoChanges("not-json"), []);
});

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

test("public SEO pages include a responsive mobile navigation menu", () => {
  for (const page of seoPages) {
    const html = renderSeoPage(page);

    assert.match(html, /<nav class="desktop-nav" aria-label="Navigation principale">/);
    assert.match(html, /<details class="mobile-menu">/);
    assert.match(html, /id="mobile-page-navigation" class="mobile-panel"/);
    assert.match(html, /@media\(max-width:1023px\)\{\.desktop-nav\{display:none\}\.mobile-menu\{display:block\}\}/);
    assert.match(html, /<a href="\/#contact">Contact<\/a>/);
  }
});

test("the evolving service page presents the path to an application on one page", () => {
  const page = seoPages.find((candidate) => candidate.path === "/site-evolutif");
  assert.ok(page);

  const html = renderSeoPage(page);
  assert.match(html, /Du site vitrine à l’application web métier/);
  assert.match(html, /id="application-metier"/);
  assert.match(html, /class="content-grid feature-grid"/);
  assert.match(html, /class="content-grid feature-grid application-feature-grid"/);
  assert.equal((html.match(/class="feature-item"/g) ?? []).length, 10);
  const startGridIndex = html.indexOf('class="content-grid feature-grid"');
  const applicationStageIndex = html.indexOf(
    'class="journey-stage journey-stage-next"',
  );
  const applicationGridIndex = html.indexOf(
    'class="content-grid feature-grid application-feature-grid"',
  );
  const applicationFeatures = html.slice(applicationGridIndex);
  assert.equal(
    (applicationFeatures.match(/class="feature-item"/g) ?? []).length,
    5,
  );
  assert.ok(
    html.indexOf("Site vitrine professionnel") <
      startGridIndex,
  );
  assert.ok(
    startGridIndex < applicationStageIndex &&
      applicationStageIndex < applicationGridIndex,
  );
  assert.match(html, /Interface d’administration complète/);
  assert.match(html, /gestion|Gérez les utilisateurs/i);
  assert.match(html, /Gestions de commandes, catalogue, documents et autres/);
  assert.match(html, /Dashboard selon vos besoins/);
  assert.match(html, /Visualisez les indicateurs clés/);
  const customFeatureEnd = html.indexOf(
    "</section>",
    html.indexOf("Fonctionnalités sur mesure"),
  );
  assert.ok(
    html.lastIndexOf('<section class="feature-item"', html.indexOf("Dashboard selon vos besoins")) >
      customFeatureEnd,
  );
  assert.match(
    html,
    /Analyse des connexions au site, Agent SEO Dynamique et autre modules IA selon vos besoins/,
  );
  assert.equal((html.match(/Maintenance 7j\/7/g) ?? []).length, 2);
  assert.equal(
    (html.match(/Je gère les pannes, les bugs et les mises à jour de sécurité pour vous, si besoin\./g) ?? []).length,
    2,
  );
  assert.doesNotMatch(html, /Questions fréquentes|Parlons de la première étape/);
  assert.match(html, /href="\/site-evolutif">Site Web Evolutif<\/a>/);
  assert.doesNotMatch(html, /href="\/application-web-entreprise">Application web métier<\/a>/);

  const servicesPage = seoPages.find((candidate) => candidate.path === "/services");
  assert.ok(servicesPage);
  const servicesHtml = renderSeoPage(servicesPage);
  assert.match(servicesHtml, /href="\/site-evolutif#application-metier"/);
});

test("the evolving service formulas have distinct styled cards on desktop and mobile", () => {
  const page = seoPages.find((candidate) => candidate.path === "/site-evolutif");
  assert.ok(page);

  const html = renderSeoPage(page);
  assert.match(
    html,
    /body\.site-evolution \.journey-stage\{position:relative;isolation:isolate;overflow:hidden;min-height:202px/,
  );
  assert.match(
    html,
    /background:linear-gradient\(140deg,#fff 0%,#f4faff 48%,#eaf5ff 100%\)/,
  );
  assert.match(
    html,
    /body\.site-evolution \.journey-stage-next\{border-color:#c6d5f0;background:linear-gradient\(140deg,#effbff 0%,#f0f5ff 52%,#e8edff 100%\)\}/,
  );
  assert.match(html, /journey-stage-next \.journey-number\{border-color:transparent;background:linear-gradient\(145deg,#12a9b8,#3768d5\)/);
  assert.match(
    html,
    /body\.site-evolution \.journey\{grid-template-columns:1fr;gap:9px;margin-bottom:22px\}/,
  );
});

test("references show side-by-side categories with independent carousels", () => {
  const page = seoPages.find((candidate) => candidate.path === "/references");
  assert.ok(page);
  assert.equal(page.h1, "Mes projets réalisés");

  const references = [
    {
      id: "vitrine-1",
      title: "Site vitrine 1",
      url: "https://example.com/one",
      category: "vitrine",
    },
    {
      id: "vitrine-2",
      title: "Site vitrine 2",
      url: "https://example.com/two",
      category: "vitrine",
    },
    {
      id: "enterprise-1",
      title: "Produit web 1",
      url: "https://example.com/three",
      category: "enterprise",
    },
    {
      id: "enterprise-2",
      title: "Produit web 2",
      url: "https://example.com/four",
      category: "enterprise",
    },
  ];
  const html = renderSeoPage({ ...page, references });

  assert.match(
    html,
    /Découvrez une sélection de sites et de solutions web réalisés par Innov Studio\./,
  );
  assert.match(html, /<h1[^>]*>Mes[\s\S]*?projets réalisés[\s\S]*?<\/h1>/);
  assert.match(html, /Site vitrine professionnel/);
  assert.match(html, /Application web métier/);
  assert.doesNotMatch(html, /data-reference-tabs|data-reference-tab|Filtrer les références par catégorie/);
  assert.equal((html.match(/class="reference-section"/g) ?? []).length, 2);
  assert.equal((html.match(/class="reference-carousel-track"/g) ?? []).length, 2);
  assert.equal((html.match(/class="reference-slide"/g) ?? []).length, 4);
  assert.equal((html.match(/class="reference-carousel-button"/g) ?? []).length, 4);
  assert.equal((html.match(/class="reference-card"/g) ?? []).length, 4);
  assert.match(
    html,
    /\.reference-groups\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\);align-items:start;gap:24px\}/,
  );
  assert.match(html, /@media\(max-width:900px\)\{\.reference-groups\{grid-template-columns:1fr;gap:18px\}\}/);
  assert.match(html, /data-reference-previous/);
  assert.match(html, /data-reference-next/);

  const shortListHtml = renderSeoPage({
    ...page,
    references: references.slice(0, 2),
  });
  assert.doesNotMatch(shortListHtml, /data-reference-tabs|data-reference-tab/);
  assert.equal((shortListHtml.match(/class="reference-carousel-track"/g) ?? []).length, 1);
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

test("overlong descriptions combine the CTA and length fix into one non-recurring suggestion", () => {
  const page: SeoPageAuditData = {
    path: "/description-test",
    title: "Titre suffisamment long pour éviter les recommandations de longueur",
    description:
      "Des solutions web adaptées à votre entreprise et à vos clients, conçues pour présenter clairement vos services et accompagner le développement de votre activité. ".repeat(2),
    canonical: "https://innov-studio.fr/description-test",
    indexable: true,
    contentLength: 500,
  };

  const initialSuggestions = analyzeServicePages([page], []).filter(
    (suggestion) => suggestion.field === "description",
  );
  assert.equal(initialSuggestions.length, 1);
  const proposedDescription = initialSuggestions[0].suggested;
  assert.ok(proposedDescription.length <= 160);
  assert.match(proposedDescription, /devis/i);

  const followUpSuggestions = analyzeServicePages(
    [{ ...page, description: proposedDescription }],
    [],
  ).filter((suggestion) => suggestion.field === "description");
  assert.equal(followUpSuggestions.length, 0);
});

test("shortening a long description preserves an existing CTA", () => {
  const page: SeoPageAuditData = {
    path: "/description-cta-test",
    title: "Titre suffisamment long pour éviter les recommandations de longueur",
    description:
      "Des solutions web adaptées à votre entreprise et à vos clients, conçues pour présenter clairement vos services et accompagner le développement de votre activité. ".repeat(2) +
      "Devis gratuit sous 24h.",
    canonical: "https://innov-studio.fr/description-cta-test",
    indexable: true,
    contentLength: 500,
  };

  const suggestion = analyzeServicePages([page], []).find(
    (candidate) => candidate.field === "description",
  );
  assert.ok(suggestion);
  assert.ok(suggestion.suggested.length <= 160);
  assert.match(suggestion.suggested, /devis gratuit sous 24h/i);

  const followUpSuggestions = analyzeServicePages(
    [{ ...page, description: suggestion.suggested }],
    [],
  ).filter((candidate) => candidate.field === "description");
  assert.equal(followUpSuggestions.length, 0);
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
  const suggestions = analyzeServicePages(pages, ["création de site web professionnel"]);
  const suggestedUrls = new Set(suggestions.flatMap((suggestion) => suggestion.urls));

  for (const page of pages) {
    assert.ok(suggestedUrls.has(page.path), `the report includes ${page.path}`);
  }
});
