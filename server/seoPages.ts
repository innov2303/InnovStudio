import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = "https://innov-studio.fr";

let spaAssetMarkup: string | undefined;

function getSpaAssetMarkup(): string {
  if (spaAssetMarkup !== undefined) return spaAssetMarkup;
  if (process.env.NODE_ENV !== "production") {
    spaAssetMarkup = '<script type="module" src="/src/main.tsx"></script>';
    return spaAssetMarkup;
  }

  const indexPath = resolve(process.cwd(), "dist/public/index.html");
  if (!existsSync(indexPath)) {
    throw new Error(`Client entry not found: ${indexPath}`);
  }

  const indexHtml = readFileSync(indexPath, "utf8");
  const modulePreloads = indexHtml.match(/<link rel="modulepreload"[^>]*>/g) ?? [];
  const stylesheets = indexHtml.match(/<link rel="stylesheet"[^>]*>/g) ?? [];
  const moduleEntry = indexHtml.match(/<script type="module"[^>]*><\/script>/)?.[0];
  if (!moduleEntry) throw new Error("Client module entry not found in built index.html");

  spaAssetMarkup = [...modulePreloads, ...stylesheets, moduleEntry].join("\n");
  return spaAssetMarkup;
}

type FeatureIcon =
  | "pages"
  | "responsive"
  | "search"
  | "evolution"
  | "administration"
  | "custom"
  | "dashboard"
  | "ai";

type SeoSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  id?: string;
  icon?: FeatureIcon;
};

type ServiceCard = {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  items: { title: string; description: string }[];
};

export type PublicReference = {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
};

type SeoPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  h1Accent: string;
  intro: string;
  label: string;
  sections: SeoSection[];
  cta: string;
  faq: { question: string; answer: string }[];
  serviceCards?: ServiceCard[];
  references?: PublicReference[];
  featureGrid?: boolean;
  applicationFeatures?: SeoSection[];
  journey?: {
    start: { label: string; title: string; description: string };
    next: { label: string; title: string; description: string };
  };
};

export type SeoPageAuditData = {
  path: string;
  title: string;
  description: string;
  canonical: string | null;
  indexable: boolean;
  contentLength: number;
};

export const seoPages: SeoPage[] = [
  {
    path: "/site-evolutif",
    title: "Site Web Évolutif : du site vitrine à l’application | Innov Studio",
    description:
      "Démarrez avec un site vitrine professionnel, puis ajoutez une administration, le suivi des commandes, des tableaux de bord sur mesure ou des modules IA.",
    h1: "Du site vitrine à l’application web métier",
    h1Accent: "application web métier",
    intro:
      "Commencez par un site vitrine, puis faites-le évoluer vers une application web métier à votre rythme.",
    label: "Une solution web qui évolue au rythme de votre activité.",
    featureGrid: true,
    journey: {
      start: {
        label: "Point de départ",
        title: "Site vitrine professionnel",
        description:
          "Des pages adaptées à votre activité, une présentation claire de vos services et des bases SEO solides.",
      },
      next: {
        label: "Quand vos besoins grandissent",
        title: "Application web métier",
        description:
          "Des fonctionnalités ajoutées progressivement, puis un outil conçu autour de vos processus.",
      },
    },
    applicationFeatures: [
      {
        icon: "administration",
        title: "Interface d’administration complète",
        paragraphs: [
          "Gérez les utilisateurs et modifiez vos contenus depuis un espace dédié.",
        ],
      },
      {
        icon: "custom",
        title: "Fonctionnalités sur mesure",
        paragraphs: [
          "Gestions de commandes, catalogue, documents et autres",
        ],
      },
      {
        icon: "dashboard",
        title: "Dashboard selon vos besoins",
        paragraphs: [
          "Visualisez les indicateurs clés et les données utiles à votre activité dans un tableau de bord adapté.",
        ],
      },
      {
        icon: "ai",
        title: "Modules IA sur demande",
        paragraphs: [
          "Analyse des connexions au site, Agent SEO Dynamique et autre modules IA selon vos besoins",
        ],
      },
    ],
    sections: [
      {
        icon: "pages",
        title: "Des pages adaptées à votre activité",
        paragraphs: [
          "Présentez clairement vos services et aidez vos visiteurs à vous contacter.",
        ],
      },
      {
        icon: "responsive",
        title: "Une expérience claire sur tous les écrans",
        paragraphs: [
          "Une navigation agréable sur mobile, tablette et ordinateur.",
        ],
      },
      {
        icon: "search",
        title: "Des bases SEO dès la création",
        paragraphs: [
          "Des titres et contenus structurés pour aider les moteurs à comprendre vos pages.",
        ],
      },
      {
        icon: "evolution",
        id: "application-metier",
        title: "Votre site prêt à évoluer",
        paragraphs: [
          "Ajoutez des fonctionnalités et passez, si besoin, du site vitrine à l’application web métier.",
        ],
      },
    ],
    cta: "Parlons de la première étape de votre projet",
    faq: [],
  },
  {
    path: "/application-web-entreprise",
    title: "Application web sur mesure pour entreprise | Innov Studio",
    description:
      "Applications web métier sur mesure : outils internes, espaces clients, tableaux de bord et automatisations adaptés aux processus de votre entreprise.",
    h1: "Une application web adaptée à vos façons de travailler",
    h1Accent: "application web",
    intro:
      "Quand les tableurs, les tâches répétitives ou les outils dispersés freinent votre activité, une application web sur mesure peut réunir vos processus dans un outil plus adapté.",
    label: "Des outils numériques conçus autour de vos besoins métier.",
    sections: [
      {
        title: "Partir de vos processus réels",
        paragraphs: [
          "Avant de choisir une technologie, nous clarifions les utilisateurs concernés, les étapes de travail, les données manipulées et les points de blocage. Cette étape aide à construire une solution utile plutôt qu’une fonctionnalité de plus.",
        ],
      },
      {
        title: "Des fonctionnalités ciblées",
        paragraphs: [
          "Selon le projet, une application peut proposer des comptes utilisateurs, des rôles et permissions, un espace client, un suivi de dossiers, des tableaux de bord ou des notifications.",
          "Des connexions à des services externes et des automatisations peuvent aussi être étudiées lorsque cela simplifie réellement le travail.",
        ],
        bullets: ["Outils internes et gestion d’activité", "Espaces clients ou partenaires", "Tableaux de bord et suivi de données", "Automatisations et intégrations adaptées"],
      },
      {
        title: "Un projet maîtrisé par étapes",
        paragraphs: [
          "Le périmètre fonctionnel est défini avant le développement. Les fonctionnalités sont ensuite construites, testées et ajustées avec des échanges réguliers afin de limiter les surprises.",
          "La sécurité, les accès, la sauvegarde et la maintenance sont pris en compte selon la nature des données et les usages prévus.",
        ],
      },
      {
        title: "Une application qui peut continuer à évoluer",
        paragraphs: [
          "Une première version peut couvrir un processus prioritaire. Les retours des utilisateurs permettent ensuite de décider quelles améliorations apporter et dans quel ordre.",
        ],
      },
    ],
    cta: "Décrivez le processus que vous souhaitez simplifier",
    faq: [
      {
        question: "Une application web fonctionne-t-elle sans installation ?",
        answer:
          "Une application web s’utilise généralement dans un navigateur. Les modalités d’accès et les éventuelles fonctions installables sont définies selon le projet.",
      },
      {
        question: "Pouvez-vous connecter l’application à nos outils ?",
        answer:
          "Les intégrations sont étudiées au cas par cas selon les outils concernés, leurs interfaces disponibles, les données à échanger et les contraintes de sécurité.",
      },
    ],
  },
  {
    path: "/creation-site-web",
    title: "Création de site internet professionnel | Innov Studio",
    description:
      "Création de site internet pour indépendants et entreprises : design adapté, navigation mobile et contenus clairs, avec des bases SEO soignées.",
    h1: "Création de site web pensée pour votre activité",
    h1Accent: "site web",
    intro:
      "Innov Studio accompagne les indépendants et les entreprises dans la création ou l’évolution de leur présence web, avec une approche adaptée à leurs objectifs.",
    label: "Un site professionnel, utile à vos clients et prêt à évoluer.",
    sections: [
      {
        title: "Un site construit autour de vos objectifs",
        paragraphs: [
          "Un site efficace doit permettre à vos visiteurs de comprendre rapidement votre activité, vos services et la prochaine action à effectuer. Le contenu et la navigation sont organisés en fonction de vos clients et de votre offre.",
        ],
      },
      {
        title: "Une expérience soignée sur tous les écrans",
        paragraphs: [
          "La conception prend en compte les téléphones, tablettes et ordinateurs : lecture confortable, parcours simple et éléments importants faciles à trouver.",
          "Les performances, l’accessibilité et la qualité technique sont considérées dès la création, plutôt qu’ajoutées après coup.",
        ],
      },
      {
        title: "Des bases SEO propres",
        paragraphs: [
          "Chaque page doit répondre à une intention de recherche précise. Les titres, descriptions, liens internes, contenus et données structurées sont préparés en cohérence avec votre activité, vos clients et votre marché.",
          "Le référencement dépend aussi de la concurrence, de la qualité du contenu et de la réputation du site : aucun classement précis ne peut être garanti.",
        ],
      },
      {
        title: "Une solution qui peut s’enrichir",
        paragraphs: [
          "Votre site peut commencer par présenter vos services, puis intégrer de nouvelles pages, des formulaires, des réservations ou des fonctionnalités métier selon les besoins qui apparaissent.",
          "Découvrez l’approche du <a href=\"/site-evolutif\">site vitrine</a> ou la création d’une <a href=\"/application-web-entreprise\">application web métier</a>.",
        ],
      },
    ],
    cta: "Échangeons sur votre projet de site web",
    faq: [
      {
        question: "Comment se déroule le premier échange ?",
        answer:
          "Nous clarifions vos objectifs, votre activité et les fonctionnalités prioritaires avant de proposer une première approche.",
      },
      {
        question: "Le site sera-t-il optimisé pour les moteurs de recherche ?",
        answer:
          "Les fondations SEO techniques et éditoriales peuvent être intégrées au projet. Les résultats de positionnement dépendent toutefois de nombreux facteurs et ne peuvent pas être garantis.",
      },
    ],
  },
  {
    path: "/services",
    title: "Services web et applications métier | Innov Studio",
    description:
      "Découvrez les services web évolutifs d’Innov Studio : création de sites professionnels, fonctionnalités sur mesure et applications métier.",
    h1: "Des services web qui évoluent avec votre activité",
    h1Accent: "évoluent avec votre activité",
    intro:
      "Commencez par une présence web professionnelle, puis ajoutez les fonctionnalités dont votre activité a réellement besoin.",
    label: "Du premier site à l’application métier, par étapes.",
    sections: [],
    serviceCards: [
      {
        title: "Site Web Evolutif",
        href: "/site-evolutif",
        linkLabel: "Découvrir le site web évolutif",
        description:
          "Commencez par un site vitrine professionnel et faites-le évoluer avec de nouvelles pages et des fonctionnalités métier.",
        items: [
          { title: "Une base web sur mesure", description: "Un design clair, des contenus bien organisés et une expérience adaptée au mobile." },
          { title: "Des fonctionnalités utiles", description: "Réservation, catalogue, espace client ou outils connectés selon vos priorités." },
          { title: "Évolutions et maintenance", description: "Faites avancer votre site par étapes avec un accompagnement technique." },
          { title: "Hébergement sécurisé", description: "Certificat SSL, sauvegardes et infrastructure adaptée à votre projet." },
        ],
      },
      {
        title: "Application web métier",
        href: "/site-evolutif#application-metier",
        linkLabel: "Voir l’évolution vers une application métier",
        description:
          "Transformez vos processus en outils web adaptés à vos équipes et à vos clients lorsque votre activité en a besoin.",
        items: [
          { title: "Outils conçus pour vos usages", description: "Espaces internes ou clients, tableaux de bord et gestion de dossiers." },
          { title: "Automatisations utiles", description: "Intégrations et intelligence artificielle étudiées selon vos processus." },
          { title: "Déploiement accompagné", description: "Tests, ajustements et support pour faciliter l’adoption." },
          { title: "Architecture adaptée", description: "Accès, données et hébergement définis selon les besoins du projet." },
        ],
      },
    ],
    cta: "Parlons de la prochaine étape de votre projet",
    faq: [
      {
        question: "Faut-il choisir toutes les fonctionnalités dès le début ?",
        answer: "Non. Le projet peut commencer par les besoins prioritaires et évoluer ensuite par étapes.",
      },
      {
        question: "Un site peut-il devenir une application métier ?",
        answer: "Oui. L’architecture et les évolutions sont étudiées selon les usages, les données et les besoins de l’entreprise.",
      },
    ],
  },
  {
    path: "/references",
    title: "Références et réalisations web | Innov Studio",
    description:
      "Consultez les réalisations d’Innov Studio : sites web, produits numériques et applications conçus pour des activités et des besoins variés.",
    h1: "Références et projets réalisés",
    h1Accent: "projets réalisés",
    intro:
      "Découvrez une sélection de sites et de produits web réalisés par Innov Studio.",
    label: "Des projets conçus pour répondre à des besoins concrets.",
    sections: [
      {
        title: "Sites vitrine",
        paragraphs: ["Des sites conçus pour présenter une activité et faciliter la prise de contact."],
      },
      {
        title: "Produits web d’entreprise",
        paragraphs: ["Des outils numériques développés pour les besoins des équipes et des entreprises."],
      },
    ],
    cta: "Vous avez un projet similaire ?",
    faq: [],
  },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderParagraph(text: string): string {
  // Allow only the explicit, fixed internal links authored in this module.
  const safe = escapeHtml(text)
    .replace(/&lt;a href=&quot;(\/[a-z-]+)&quot;&gt;/g, '<a href="$1">')
    .replace(/&lt;\/a&gt;/g, "</a>");
  return `<p>${safe}</p>`;
}

function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function renderServiceCards(cards: ServiceCard[]): string {
  return `
    <div class="service-grid" id="services">
      ${cards.map((card) => `
        <section class="service-card">
          <h2>${escapeHtml(card.title)}</h2>
          <p>${escapeHtml(card.description)}</p>
          <div class="service-items">
            ${card.items.map((item) => `
              <div class="service-item">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
              </div>
            `).join("")}
          </div>
          <a class="button" href="${escapeHtml(card.href)}">${escapeHtml(card.linkLabel)} →</a>
        </section>
      `).join("")}
    </div>
  `;
}

function renderReferenceGroups(references: PublicReference[]): string {
  const groups = [
    { category: "vitrine", title: "Sites vitrine" },
    { category: "enterprise", title: "Produits web d’entreprise" },
  ];
  const categories = groups.map((group) => ({
    ...group,
    items: references.filter(
      (reference) => reference.category === group.category,
    ),
  }));
  const referenceCount = categories.reduce(
    (total, group) => total + group.items.length,
    0,
  );
  const sections = categories
    .map(({ category, title, items }) => `
      <section class="reference-section" data-reference-category="${escapeHtml(category)}">
        <h2>${escapeHtml(title)}</h2>
        ${items.length
          ? `<div class="reference-grid">${items.map((reference) => {
              const href = safeExternalUrl(reference.url);
              const image = reference.imageUrl?.startsWith("/") && !reference.imageUrl.startsWith("//")
                ? reference.imageUrl
                : safeExternalUrl(reference.imageUrl);
              const fallbackImage = href
                ? `https://image.thum.io/get/width/600/crop/400/${encodeURIComponent(href)}`
                : "";
              const imageSrc = image || fallbackImage;
              const card = `
                ${imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(reference.title)}" loading="lazy">` : ""}
                <div class="reference-copy">
                  <h3>${escapeHtml(reference.title)}</h3>
                  ${reference.description ? `<p>${escapeHtml(reference.description)}</p>` : ""}
                  ${href ? `<span>Visiter le site →</span>` : ""}
                </div>
              `;
              return href
                ? `<a class="reference-card" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${card}</a>`
                : `<article class="reference-card">${card}</article>`;
            }).join("")}</div>`
          : `<p class="empty-reference">Aucune référence publiée dans cette catégorie pour le moment.</p>`}
      </section>
    `)
    .join("");
  const tabs = referenceCount > 2
    ? `
      <div class="reference-tabs" role="group" aria-label="Filtrer les références par catégorie" data-reference-tabs hidden>
        <button class="reference-tab is-active" type="button" aria-pressed="true" data-reference-tab="all">Tous</button>
        ${categories
          .filter((group) => group.items.length > 0)
          .map(({ category, title }) => `
            <button class="reference-tab" type="button" aria-pressed="false" data-reference-tab="${escapeHtml(category)}">${escapeHtml(title)}</button>
          `)
          .join("")}
      </div>
    `
    : "";

  return `
    <div class="reference-browser" data-reference-browser>
      ${tabs}
      <div class="reference-groups">
        ${sections}
      </div>
    </div>
  `;
}

function jsonLd(page: SeoPage): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: `${SITE_URL}${page.path}`,
    inLanguage: "fr-FR",
    isPartOf: { "@type": "WebSite", name: "Innov Studio", url: SITE_URL },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: page.h1, item: `${SITE_URL}${page.path}` },
      ],
    },
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const faqScript = page.faq.length
    ? `<script type="application/ld+json">${JSON.stringify(faq)}</script>`
    : "";
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>${faqScript}`;
}

function renderFeatureIcon(icon?: FeatureIcon): string {
  const icons: Record<FeatureIcon, string> = {
    pages:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M7 3.5h7l4.5 4.5v12A1.5 1.5 0 0 1 17 21.5H7A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M14 3.5V8h4.5M9 12h6M9 15.5h6"/></svg>',
    responsive:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="2.8" y="4" width="14.2" height="11.5" rx="1.5"/><path d="M7.5 19.5h4.8m-2.4-4v4"/><rect x="17.5" y="8" width="4" height="11.5" rx="1.2"/><path d="M19 17h1"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.5 15.5 4.2 4.2M8.3 10.8h5"/></svg>',
    evolution:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18M7 6h.01M10 6h.01m1 7h6m-2.5-2.5L17 13l-2.5 2.5"/></svg>',
    administration:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.4-3 2.5-5 5.5-5 1.3 0 2.4.4 3.3 1M16.5 8.5l1.5 1.5 3-3"/><path d="M17 14v2m0 4v.01m-3-2h2m4 0h1"/></svg>',
    custom:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="4" rx="1.5"/><rect x="13" y="10" width="8" height="10" rx="1.5"/><path d="M3 14h8m-4-3v9"/></svg>',
    dashboard:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 16v-2m5 2v-4m5 4v-6"/></svg>',
    ai:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 3l.6 1.4L7 5l-1.4.6L5 7l-.6-1.4L3 5l1.4-.6L5 3Z"/></svg>',
  };

  return icon ? icons[icon] : "";
}

function renderFeatureGrid(
  sections: SeoSection[],
  additionalClass = "",
): string {
  const items = sections
    .map(
      (section) => `
        <section class="feature-item"${section.id ? ` id="${escapeHtml(section.id)}"` : ""}>
          <span class="feature-icon" aria-hidden="true">${renderFeatureIcon(section.icon)}</span>
          <div class="feature-copy">
            <h2>${escapeHtml(section.title)}</h2>
            ${section.paragraphs.map(renderParagraph).join("")}
          </div>
        </section>
      `,
    )
    .join("");

  return `<div class="content-grid feature-grid${additionalClass ? ` ${additionalClass}` : ""}">${items}</div>`;
}

export function renderSeoPage(page: SeoPage): string {
  const escapedHeading = escapeHtml(page.h1);
  const escapedAccent = escapeHtml(page.h1Accent);
  const headingMarkup = escapedHeading.replace(
    escapedAccent,
    `<span class="accent">${escapedAccent}</span>`,
  );
  const sections = page.sections
    .map((section) => {
      const sectionId = section.id
        ? ` id="${escapeHtml(section.id)}"`
        : "";

      return `
        <section class="content-section"${sectionId}>
          <h2>${escapeHtml(section.title)}</h2>
          ${section.paragraphs.map(renderParagraph).join("")}
          ${
            section.bullets
              ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
              : ""
          }
        </section>
      `;
    })
    .join("");
  const faq = page.faq
    .map(
      (item) => `
        <details>
          <summary>${escapeHtml(item.question)}</summary>
          <p>${escapeHtml(item.answer)}</p>
        </details>
      `,
    )
    .join("");
  const pageContent = page.serviceCards
    ? renderServiceCards(page.serviceCards)
    : page.references !== undefined
      ? renderReferenceGroups(page.references)
      : page.featureGrid
        ? renderFeatureGrid(page.sections)
        : `<div class="content-grid">${sections}</div>`;
  const applicationFeaturesMarkup = page.applicationFeatures?.length
    ? renderFeatureGrid(page.applicationFeatures, "application-feature-grid")
    : "";
  const journeyMarkup = page.journey
    ? `
      <section class="journey" aria-label="Les étapes de votre solution web">
        <div class="journey-option-start">
          <div class="journey-stage">
            <div class="journey-stage-top">
              <span class="journey-number" aria-hidden="true">01</span>
              <div>
                <p class="journey-label">${escapeHtml(page.journey.start.label)}</p>
                <h2>${escapeHtml(page.journey.start.title)}</h2>
              </div>
            </div>
            <p class="journey-description">${escapeHtml(page.journey.start.description)}</p>
          </div>
          ${page.featureGrid ? pageContent : ""}
        </div>
        <span class="journey-connector" aria-hidden="true"></span>
        <div class="journey-option-next">
          <div class="journey-stage journey-stage-next">
            <div class="journey-stage-top">
              <span class="journey-number" aria-hidden="true">02</span>
              <div>
                <p class="journey-label">${escapeHtml(page.journey.next.label)}</p>
                <h2>${escapeHtml(page.journey.next.title)}</h2>
              </div>
            </div>
            <p class="journey-description">${escapeHtml(page.journey.next.description)}</p>
          </div>
          ${applicationFeaturesMarkup}
        </div>
      </section>`
    : "";
  const pageContentMarkup =
    page.featureGrid && page.journey ? "" : pageContent;
  const ctaMarkup = page.featureGrid
    ? ""
    : `
      <section class="cta">
        <h2>${escapeHtml(page.cta)}</h2>
        <p>Présentez votre activité, votre objectif et les besoins que vous souhaitez traiter en premier.</p>
        <a class="button" href="/#contact">Parler de mon projet</a>
      </section>`;
  const faqMarkup = page.faq.length
    ? `
      <section class="faq">
        <h2>Questions fréquentes</h2>
        ${faq}
      </section>`
    : "";
  const referenceTabsScript =
    page.path === "/references" && (page.references?.length ?? 0) > 2
      ? `<script>
          (() => {
            const browser = document.querySelector("[data-reference-browser]");
            const tabList = browser?.querySelector("[data-reference-tabs]");
            const tabs = Array.from(browser?.querySelectorAll("[data-reference-tab]") ?? []);
            const sections = Array.from(browser?.querySelectorAll("[data-reference-category]") ?? []);
            if (!browser || !tabList || tabs.length === 0 || sections.length === 0) return;

            const setCategory = (category) => {
              tabs.forEach((tab) => {
                tab.setAttribute("aria-pressed", String(tab.dataset.referenceTab === category));
              });
              sections.forEach((section) => {
                section.hidden = category !== "all" && section.dataset.referenceCategory !== category;
              });
            };

            tabs.forEach((tab) => {
              tab.addEventListener("click", () => setCategory(tab.dataset.referenceTab || "all"));
            });
            setCategory("all");
            tabList.hidden = false;
          })();
        </script>`
      : "";

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${SITE_URL}${page.path}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:site_name" content="Innov Studio">
    <meta property="og:url" content="${SITE_URL}${page.path}">
    <meta property="og:title" content="${escapeHtml(page.title)}">
    <meta property="og:description" content="${escapeHtml(page.description)}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${escapeHtml(page.title)}">
    <meta name="twitter:description" content="${escapeHtml(page.description)}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    ${jsonLd(page)}
    ${getSpaAssetMarkup()}
    <style id="public-seo-page-styles">
      :root{color-scheme:light;--bg:#f8fafc;--panel:#fff;--text:#0f172a;--muted:#475569;--cyan:#0e7490;--blue:#2563eb;--line:rgba(15,23,42,.12);--border:220 13% 91%}
      *{box-sizing:border-box}
      body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
      a{color:inherit;text-decoration:none}a:hover{color:var(--cyan)}
      .wrap{width:min(1280px,calc(100% - 48px));margin:auto}
      .nav.wrap,footer .wrap{width:100%;max-width:none;padding-left:24px;padding-right:24px}
      header{position:fixed;inset:0 0 auto;z-index:50;border-bottom:1px solid hsl(var(--border));background:rgba(255,255,255,.8);backdrop-filter:blur(12px)}
      .nav{height:52px;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:16px}
      .brand{justify-self:start;flex:none;font-size:24px;line-height:32px;letter-spacing:.025em;font-weight:300;white-space:nowrap;background:linear-gradient(90deg,var(--blue),#22d3ee,var(--blue));background-clip:text;color:transparent}
      .desktop-nav{justify-self:center;display:flex;align-items:center;justify-content:center;gap:24px;font-size:16px;line-height:24px;white-space:nowrap}
      .desktop-nav a{color:var(--muted);transition:color .2s ease}.desktop-nav a:hover{color:var(--blue)}
      .nav-actions{justify-self:end;display:flex;align-items:center;gap:10px}
      .login{justify-self:end;flex:none;display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:8px 16px;border-radius:6px;background:linear-gradient(90deg,#06b6d4,#2563eb);color:white;font-size:14px;font-weight:500;line-height:20px;white-space:nowrap;box-shadow:0 8px 24px rgba(34,211,238,.18);transition:all .3s ease}
      .login span{display:inline-flex;width:16px;justify-content:center;margin-left:4px}
      .login:hover{color:white;filter:brightness(1.08);transform:scale(1.05)}
      .mobile-menu{position:relative;display:none;padding:0;border:0}
      .mobile-menu>summary{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border:1px solid var(--line);border-radius:8px;background:#fff;color:#334155;cursor:pointer;font-size:22px;line-height:1;list-style:none}
      .mobile-menu>summary::-webkit-details-marker{display:none}
      .mobile-menu>summary::marker{content:""}
      .mobile-menu>summary:focus-visible{outline:2px solid rgba(37,99,235,.55);outline-offset:2px}
      .menu-close{display:none}
      .mobile-menu[open] .menu-open{display:none}
      .mobile-menu[open] .menu-close{display:inline}
      .mobile-panel{position:absolute;top:calc(100% + 10px);right:0;z-index:60;width:min(280px,calc(100vw - 40px));padding:8px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.98);box-shadow:0 14px 35px rgba(15,23,42,.14);backdrop-filter:blur(12px)}
      .mobile-panel a{display:block;padding:10px 12px;border-radius:8px;color:var(--muted);font-size:15px;line-height:22px;white-space:normal;transition:background .2s ease,color .2s ease}
      .mobile-panel a:hover,.mobile-panel a:focus-visible{background:#f0f9ff;color:var(--cyan);outline:none}
      .mobile-panel .mobile-login{margin-top:4px;border-top:1px solid var(--line);border-radius:0;padding-top:12px;color:var(--cyan);font-weight:600}
      main{padding:0 0 80px}
      .accent{background:linear-gradient(90deg,var(--blue),var(--cyan),var(--blue));background-clip:text;color:transparent}
      .page-content{padding-top:88px}
      .page-heading{max-width:1080px;margin:0 auto 36px;text-align:center}
      .page-heading h1{max-width:920px;margin:0 auto 18px;font-size:clamp(32px,3.75vw,48px);line-height:1.12;letter-spacing:-.035em}
      .page-intro{font-size:clamp(18px,2.1vw,20px);color:var(--muted);line-height:1.65;max-width:1080px;margin:0 auto}
      .page-label{color:var(--cyan);font-weight:600;text-align:center;margin:0 auto 14px}
      .content-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
      #services{scroll-margin-top:80px}
      .service-grid,.reference-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
      .service-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:30px;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(15,23,42,.04)}
      .service-card h2{font-size:25px}
      .service-card>p{min-height:54px}
      .service-items{display:grid;gap:14px;margin:10px 0 24px}
      .service-item{border-left:2px solid var(--cyan);padding-left:14px}
      .service-item h3,.reference-card h3{font-size:16px;margin:0 0 4px}
      .service-item p,.reference-card p{font-size:14px;margin:0}
      .service-card .button{align-self:flex-start;margin-top:auto}
      .reference-section{margin:0 0 42px}
      .reference-section h2{margin:0 0 20px}
      .reference-section[hidden]{display:none}
      .reference-tabs{display:flex;flex-wrap:wrap;gap:9px;margin:0 0 28px}
      .reference-tabs[hidden]{display:none}
      .reference-tab{appearance:none;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--muted);padding:10px 16px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s ease,border-color .2s ease,color .2s ease}
      .reference-tab:hover{border-color:rgba(14,116,144,.35);color:var(--cyan)}
      .reference-tab[aria-pressed="true"]{border-color:transparent;background:linear-gradient(90deg,#06b6d4,#2563eb);color:#fff;box-shadow:0 6px 16px rgba(37,99,235,.16)}
      .reference-tab:focus-visible{outline:3px solid rgba(37,99,235,.3);outline-offset:3px}
      .reference-card{overflow:hidden;border:1px solid var(--line);border-radius:14px;background:var(--panel);box-shadow:0 8px 24px rgba(15,23,42,.04);transition:border-color .2s ease,transform .2s ease}
      a.reference-card{display:block}
      a.reference-card:hover{border-color:rgba(34,211,238,.55);transform:translateY(-2px)}
      .reference-card img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;background:#f1f5f9}
      .reference-copy{padding:18px}
      .reference-copy span{display:inline-block;color:var(--cyan);font-size:13px;margin-top:12px}
      .empty-reference{border:1px dashed var(--line);border-radius:12px;padding:20px}
      .content-section{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:30px;box-shadow:0 8px 24px rgba(15,23,42,.04);transition:border-color .25s ease,box-shadow .25s ease}
      .content-section:hover{border-color:rgba(14,116,144,.4);box-shadow:0 8px 24px rgba(15,23,42,.08)}
      .content-section[id]{scroll-margin-top:88px}
      h2{font-size:22px;line-height:1.3;margin:0 0 14px}
      p{color:var(--muted);margin:0 0 14px}p:last-child{margin-bottom:0}
      ul{color:#334155;padding-left:20px;margin:12px 0 0}li{padding:3px 0}
      .cta{margin:48px 0;padding:40px 28px;border:1px solid rgba(14,116,144,.22);border-radius:12px;background:linear-gradient(115deg,#eff6ff,#f0fdfa);text-align:center}
      .cta h2{font-size:26px}
      .cta p{max-width:620px;margin:0 auto 14px}
      .button{display:inline-flex;align-items:center;justify-content:center;margin-top:8px;padding:12px 20px;border-radius:8px;background:linear-gradient(90deg,#06b6d4,#2563eb);color:white;font-weight:600;box-shadow:0 8px 24px rgba(34,211,238,.18);transition:filter .2s ease}
      .button:hover{color:white;filter:brightness(1.1)}
      .hero-actions .button.button-secondary{border:1px solid rgba(14,116,144,.35);background:#fff;color:#0e7490;box-shadow:none}
      .hero-actions .button.button-secondary:hover{background:#f0fdfa;color:#0e7490}
      .faq{margin:54px auto 0;max-width:900px}.faq h2{margin-bottom:18px}
      details{padding:17px 0;border-bottom:1px solid var(--line)}
      summary{cursor:pointer;font-weight:650}
      details p{margin:10px 0 0}
      footer{border-top:1px solid hsl(var(--border));padding:16px 0;color:var(--muted);font-size:14px}
      .footer-inner{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:16px;text-align:center}
      .footer-brand{font-size:20px;line-height:28px;font-weight:300;letter-spacing:.025em;background:linear-gradient(90deg,var(--blue),#22d3ee,var(--blue));background-clip:text;color:transparent}
      .footer-copy{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;font-size:14px;line-height:20px}
      .footer-copy p{margin:0;font-size:14px;line-height:20px}
      .footer-copy span{display:none}
      .footer-copy a{color:var(--muted)}
      @media(min-width:1024px){.nav{grid-template-columns:1fr auto 1fr}}
      @media(min-width:640px){.nav.wrap,footer .wrap{max-width:640px}}
      @media(min-width:768px){.nav.wrap,footer .wrap{max-width:768px}}
      @media(min-width:1024px){.nav.wrap,footer .wrap{max-width:1024px}}
      @media(min-width:1280px){.nav.wrap,footer .wrap{max-width:1280px}}
      @media(min-width:1536px){.nav.wrap,footer .wrap{max-width:1536px}}
      @media(min-width:768px){
        .footer-inner{flex-direction:row;text-align:left}
        .footer-copy{flex-direction:row;justify-content:flex-end;flex-wrap:wrap;text-align:right}
        .footer-copy span{display:inline}
      }
      @media(max-width:1023px){.desktop-nav{display:none}.mobile-menu{display:block}}
      @media(max-width:767px){
        .wrap{width:calc(100% - 40px)}
        .nav{height:52px}
        .brand{font-size:20px}
        .brand{line-height:28px}
        .page-content{padding-top:78px}
        .page-heading{margin-bottom:28px}
        .page-heading h1{font-size:clamp(30px,8vw,40px)}
        .content-grid,.service-grid{grid-template-columns:1fr;gap:16px}
        .reference-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .reference-copy{padding:12px}
        .reference-card h3{font-size:14px}
        .reference-card p{font-size:12px;line-height:1.45}
        .reference-copy span{font-size:12px}
        .reference-tabs{gap:7px;margin-bottom:22px}
        .reference-tab{padding:9px 12px;font-size:13px}
        .content-section,.service-card{padding:24px}
        .cta{padding:30px 20px}
      }
      @media(max-width:639px){.desktop-login{display:none}}
      body.site-evolution{background:linear-gradient(180deg,#fff 0,#f5fbff 310px,#f8fafc 760px)}
      body.site-evolution .page-content{padding-top:88px}
      body.site-evolution .page-heading{max-width:980px;margin-bottom:32px}
      body.site-evolution .page-label{display:inline-flex;align-items:center;border:1px solid rgba(14,116,144,.16);border-radius:999px;background:rgba(255,255,255,.86);padding:7px 14px;margin-bottom:16px;color:#0e7490;font-size:13px;box-shadow:0 4px 14px rgba(15,60,90,.04)}
      body.site-evolution .page-heading h1{font-weight:700;letter-spacing:-.04em}
      body.site-evolution .journey{display:grid;grid-template-columns:minmax(0,1fr) 58px minmax(0,1fr);align-items:stretch;gap:14px;max-width:960px;margin:0 auto 30px}
      body.site-evolution .journey-option-start{min-width:0}
      body.site-evolution .journey-option-next{min-width:0}
      body.site-evolution .journey-stage{position:relative;isolation:isolate;overflow:hidden;min-height:202px;padding:27px 27px 25px;border:1px solid #cfe1ef;border-radius:21px;background:linear-gradient(140deg,#fff 0%,#f4faff 48%,#eaf5ff 100%);box-shadow:0 14px 36px rgba(24,71,110,.10),inset 0 1px 0 rgba(255,255,255,.95);transition:transform .24s ease,border-color .24s ease,box-shadow .24s ease}
      body.site-evolution .journey-stage::before{content:"";position:absolute;z-index:0;top:20px;bottom:20px;left:0;width:4px;border-radius:0 4px 4px 0;background:linear-gradient(180deg,#24b8c7,#4b80e7)}
      body.site-evolution .journey-stage::after{content:"";position:absolute;z-index:0;top:-76px;right:-58px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle,rgba(74,158,229,.17),rgba(74,158,229,0) 70%);pointer-events:none}
      body.site-evolution .journey-stage:hover{transform:translateY(-4px);border-color:rgba(14,116,144,.38);box-shadow:0 20px 42px rgba(24,71,110,.14),inset 0 1px 0 rgba(255,255,255,.95)}
      body.site-evolution .journey-stage-next{border-color:#c6d5f0;background:linear-gradient(140deg,#effbff 0%,#f0f5ff 52%,#e8edff 100%)}
      body.site-evolution .journey-stage-next::before{background:linear-gradient(180deg,#10a9b6,#3468d3)}
      body.site-evolution .journey-stage-next::after{top:auto;right:-46px;bottom:-105px;width:230px;height:230px;background:radial-gradient(circle,rgba(75,110,225,.17),rgba(75,110,225,0) 70%)}
      body.site-evolution .journey-stage-top{position:relative;z-index:1;display:flex;align-items:center;gap:15px}
      body.site-evolution .journey-number{display:grid;place-items:center;flex:0 0 50px;width:50px;height:50px;border:1px solid rgba(23,121,161,.14);border-radius:15px;background:linear-gradient(145deg,#dcf5fa,#e4edff);color:#116e91;box-shadow:0 7px 16px rgba(24,100,142,.13);font-weight:800;font-size:15px;letter-spacing:-.03em}
      body.site-evolution .journey-stage-next .journey-number{border-color:transparent;background:linear-gradient(145deg,#12a9b8,#3768d5);color:#fff;box-shadow:0 8px 18px rgba(47,103,207,.25)}
      body.site-evolution .journey-label{display:inline-flex;align-items:center;min-height:23px;margin:0 0 5px;padding:3px 9px;border:1px solid rgba(14,116,144,.12);border-radius:999px;background:rgba(255,255,255,.78);color:#0e7490;font-size:9px;font-weight:800;letter-spacing:.09em;line-height:1.2;text-transform:uppercase}
      body.site-evolution .journey-stage-next .journey-label{border-color:rgba(55,104,213,.13);color:#3263c6}
      body.site-evolution .journey-stage h2{margin:0;color:#10263b;font-size:20px;font-weight:750;letter-spacing:-.035em;line-height:1.25}
      body.site-evolution .journey-description{position:relative;z-index:1;max-width:390px;margin:17px 0 0 65px;color:#50677c;font-size:14px;line-height:1.65}
      body.site-evolution .journey-connector{position:relative;display:grid;place-items:center;align-self:start;height:42px;margin-top:80px;color:#fff}
      body.site-evolution .journey-connector::before{content:"";position:absolute;right:-7px;left:-7px;height:1px;background:linear-gradient(90deg,rgba(25,150,177,.06),rgba(25,150,177,.45),rgba(55,104,213,.3),rgba(55,104,213,.05))}
      body.site-evolution .journey-connector::after{content:"→";position:relative;display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(37,99,235,.18);border-radius:50%;background:linear-gradient(145deg,#fff,#eaf5ff);color:#167f9e;box-shadow:0 8px 19px rgba(25,89,131,.12);font-size:20px;line-height:1}
      body.site-evolution .journey-stage-next{align-self:start}
      body.site-evolution .journey-option-start .content-grid.feature-grid,body.site-evolution .journey-option-next .content-grid.feature-grid{max-width:none;margin:26px 0 0;grid-template-columns:1fr;gap:22px}
      body.site-evolution .feature-item{display:grid;grid-template-columns:42px minmax(0,1fr);align-items:start;gap:14px;min-width:0;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none;transition:none}
      body.site-evolution .feature-item:hover{transform:none;border-color:transparent;box-shadow:none}
      body.site-evolution .feature-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:10px;background:#eaf2ff;color:#4380e5}
      body.site-evolution .feature-icon svg{display:block;width:21px;height:21px}
      body.site-evolution .feature-copy h2{margin:1px 0 5px;font-size:17px;line-height:1.35;font-weight:650;letter-spacing:-.015em}
      body.site-evolution .feature-copy p{margin:0;color:#64748b;font-size:14px;line-height:1.5}
      body.site-evolution .feature-item#application-metier{scroll-margin-top:88px}
      @media(max-width:767px){
        body.site-evolution .page-content{padding-top:78px}
        body.site-evolution .journey{grid-template-columns:1fr;gap:9px;margin-bottom:22px}
        body.site-evolution .journey-stage{min-height:0;padding:22px 20px 21px}
        body.site-evolution .journey-stage-top{gap:12px}
        body.site-evolution .journey-number{flex-basis:44px;width:44px;height:44px;border-radius:13px}
        body.site-evolution .journey-stage h2{font-size:18px}
        body.site-evolution .journey-description{margin:13px 0 0 56px;font-size:13px}
        body.site-evolution .journey-connector{height:38px;min-height:38px;margin:0}
        body.site-evolution .journey-connector::before{top:-5px;right:auto;bottom:-5px;left:50%;width:1px;height:auto;background:linear-gradient(transparent,rgba(25,150,177,.45),rgba(55,104,213,.3),transparent)}
        body.site-evolution .journey-connector::after{content:"↓";width:32px;height:32px;font-size:17px}
        body.site-evolution .journey-option-start .content-grid.feature-grid,body.site-evolution .journey-option-next .content-grid.feature-grid{max-width:560px;margin:22px auto 0;gap:23px}
        body.site-evolution .feature-item{grid-template-columns:40px minmax(0,1fr);gap:13px}
        body.site-evolution .feature-icon{width:40px;height:40px}
        body.site-evolution .feature-copy h2{font-size:16px}
        body.site-evolution .feature-copy p{font-size:14px}
      }
    </style>
  </head>
  <body class="${page.path === "/site-evolutif" ? "site-evolution" : ""}">
    <div id="root">
    <header>
      <div class="wrap nav">
        <a class="brand" href="/">Innov Studio</a>
        <nav class="desktop-nav" aria-label="Navigation principale">
          <a href="/">Accueil</a>
          <a href="/site-evolutif">Site Web Evolutif</a>
          <a href="/references">Références</a>
          <a href="/#contact">Contact</a>
        </nav>
        <div class="nav-actions">
          <details class="mobile-menu">
            <summary aria-label="Afficher ou masquer le menu de navigation" aria-controls="mobile-page-navigation">
              <span class="menu-open" aria-hidden="true">☰</span>
              <span class="menu-close" aria-hidden="true">×</span>
            </summary>
            <nav id="mobile-page-navigation" class="mobile-panel" aria-label="Navigation mobile">
              <a href="/">Accueil</a>
              <a href="/site-evolutif">Site Web Evolutif</a>
              <a href="/references">Références</a>
              <a href="/#contact">Contact</a>
              <a class="mobile-login" href="/login">Connexion</a>
            </nav>
          </details>
          <a class="login desktop-login" href="/login">Connexion<span aria-hidden="true">›</span></a>
        </div>
      </div>
    </header>
    <main>
      <article>
        <div class="wrap page-content">
          <div class="page-heading">
            <p class="page-label">${escapeHtml(page.label)}</p>
            <h1>${headingMarkup}</h1>
            <p class="page-intro">${escapeHtml(page.intro)}</p>
          </div>
          ${journeyMarkup}
          ${pageContentMarkup}
          ${ctaMarkup}
          ${faqMarkup}
        </div>
      </article>
    </main>
    <footer>
      <div class="wrap footer-inner">
        <a class="footer-brand" href="/">Innov Studio</a>
        <div class="footer-copy">
          <p>© ${new Date().getFullYear()} Innov Studio By Cyril Allegret · Création de sites web & applications sur mesure. Tous droits réservés.</p>
          <span aria-hidden="true">·</span>
          <a href="https://www.jesuisnumerique.fr" target="_blank" rel="noopener noreferrer">jesuisnumerique.fr</a>
        </div>
      </div>
    </footer>
    </div>
    ${referenceTabsScript}
  </body>
</html>`;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function getSeoPageAuditData(page: SeoPage): SeoPageAuditData {
  const html = renderSeoPage(page);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const description =
    html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? null;
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i)?.[1] ?? "";
  const mainContent = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const visibleContent = decodeHtmlEntities(
    mainContent
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ").trim();

  return {
    path: page.path,
    title: decodeHtmlEntities(title),
    description: decodeHtmlEntities(description),
    canonical: canonical ? decodeHtmlEntities(canonical) : null,
    indexable: !robots
      .split(",")
      .some((directive) => ["noindex", "none"].includes(directive.trim().toLowerCase())),
    contentLength: visibleContent.length,
  };
}

export function renderSitemap(): string {
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "weekly" },
    ...seoPages.map((page) => ({ loc: `${SITE_URL}${page.path}`, priority: "0.8", changefreq: "monthly" })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      ({ loc, priority, changefreq }) =>
        `  <url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
    )
    .join("\n")}\n</urlset>`;
}
