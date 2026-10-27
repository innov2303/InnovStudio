const SITE_URL = "https://innov-studio.fr";

type SeoSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
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
    title: "Site internet évolutif professionnel à Toulouse | Innov Studio",
    description:
      "Faites créer un site web évolutif à Toulouse, puis ajoutez des outils métier, un espace client et des automatisations à mesure que votre activité grandit.",
    h1: "Un site web qui grandit avec votre entreprise",
    h1Accent: "grandit avec votre entreprise",
    intro:
      "Commencez avec une présence web claire et professionnelle. Faites ensuite évoluer votre site vers des fonctionnalités sur mesure, jusqu’à une véritable application métier, au rythme de vos besoins.",
    label: "Une base simple aujourd’hui. Une solution plus complète demain.",
    sections: [
      {
        title: "Étape 1 — Lancer une présence web efficace",
        paragraphs: [
          "Votre projet démarre avec les fonctionnalités réellement utiles : présenter votre activité, expliquer vos offres et faciliter les prises de contact. L’objectif est de mettre en ligne une base professionnelle, rapide et adaptée aux mobiles.",
          "La structure est pensée pour accueillir de nouveaux contenus et services sans devoir repartir de zéro à chaque évolution.",
        ],
        bullets: ["Pages et contenus adaptés à votre activité", "Navigation claire sur mobile et ordinateur", "Fondations techniques et SEO propres"],
      },
      {
        title: "Étape 2 — Ajouter les bons outils",
        paragraphs: [
          "Quand votre activité évolue, le site peut intégrer de nouvelles fonctions : prise de rendez-vous, catalogue, formulaires métier, automatisations, espace client ou connexion à vos outils existants.",
          "Chaque amélioration répond à un besoin identifié. Vous développez votre solution progressivement plutôt que de financer d’emblée un système trop complexe.",
        ],
      },
      {
        title: "Étape 3 — Passer à une application métier",
        paragraphs: [
          "Si vos processus le nécessitent, le projet peut évoluer vers une application web : gestion de dossiers, suivi d’activité, tableaux de bord, rôles utilisateurs ou traitement automatisé de tâches.",
          "Le périmètre et les intégrations sont définis avec vous avant le développement, selon vos priorités, vos utilisateurs et vos contraintes.",
        ],
      },
      {
        title: "Un accompagnement dans la durée",
        paragraphs: [
          "La conception, le développement, la mise en ligne et la maintenance peuvent être organisés par étapes. Vous gardez une vision claire de ce qui est réalisé et de ce qui peut venir ensuite.",
        ],
        bullets: ["Évolutions définies selon vos priorités", "Hébergement et maintenance disponibles", "Accompagnement technique après la mise en ligne"],
      },
    ],
    cta: "Parlons de la première étape de votre projet",
    faq: [
      {
        question: "Peut-on transformer un site existant en application web ?",
        answer:
          "C’est parfois possible. Une première analyse du site, de ses données et des besoins permet de définir les éléments à conserver et les évolutions à prévoir.",
      },
      {
        question: "Dois-je prévoir toutes les fonctionnalités dès le départ ?",
        answer:
          "Non. Le projet peut commencer par les besoins prioritaires, puis évoluer par étapes planifiées à mesure que votre activité et vos usages se précisent.",
      },
    ],
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
    path: "/creation-site-web-toulouse",
    title: "Création de site internet à Toulouse | Innov Studio",
    description:
      "Création de site internet à Toulouse pour indépendants et entreprises : design adapté, navigation mobile et contenus clairs, avec un référencement local soigné.",
    h1: "Création de site web à Toulouse, pensé pour votre activité",
    h1Accent: "site web à Toulouse",
    intro:
      "Innov Studio accompagne les indépendants et les entreprises de Toulouse et d’Occitanie dans la création ou l’évolution de leur présence web, avec une approche adaptée à leurs objectifs.",
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
          "Chaque page doit répondre à une intention de recherche précise. Les titres, descriptions, liens internes, contenus et données structurées sont préparés en cohérence avec votre activité et votre zone de chalandise.",
          "Le référencement dépend aussi de la concurrence, de la qualité du contenu et de la réputation du site : aucun classement précis ne peut être garanti.",
        ],
      },
      {
        title: "Une solution qui peut s’enrichir",
        paragraphs: [
          "Votre site peut commencer par présenter vos services, puis intégrer de nouvelles pages, des formulaires, des réservations ou des fonctionnalités métier selon les besoins qui apparaissent.",
          "Découvrez l’approche du <a href=\"/site-evolutif\">site évolutif</a> ou la création d’une <a href=\"/application-web-entreprise\">application web métier</a>.",
        ],
      },
    ],
    cta: "Échangeons sur votre site web à Toulouse",
    faq: [
      {
        question: "Intervenez-vous uniquement à Toulouse ?",
        answer:
          "Innov Studio est basé à Toulouse et peut échanger avec des clients à distance, selon les besoins et l’organisation du projet.",
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
      "Découvrez les services web évolutifs d’Innov Studio : création de sites professionnels, fonctionnalités sur mesure et applications métier à Toulouse.",
    h1: "Des services web qui évoluent avec votre activité",
    h1Accent: "évoluent avec votre activité",
    intro:
      "Commencez par une présence web professionnelle, puis ajoutez les fonctionnalités dont votre activité a réellement besoin.",
    label: "Du premier site à l’application métier, par étapes.",
    sections: [],
    serviceCards: [
      {
        title: "Site évolutif",
        href: "/site-evolutif",
        linkLabel: "Découvrir le site évolutif",
        description:
          "Lancez une présence web professionnelle, puis ajoutez de nouvelles pages et fonctionnalités à mesure que votre activité grandit.",
        items: [
          { title: "Une base web sur mesure", description: "Un design clair, des contenus bien organisés et une expérience adaptée au mobile." },
          { title: "Des fonctionnalités utiles", description: "Réservation, catalogue, espace client ou outils connectés selon vos priorités." },
          { title: "Évolutions et maintenance", description: "Faites avancer votre site par étapes avec un accompagnement technique." },
          { title: "Hébergement sécurisé", description: "Certificat SSL, sauvegardes et infrastructure adaptée à votre projet." },
        ],
      },
      {
        title: "Application web métier",
        href: "/application-web-entreprise",
        linkLabel: "Découvrir les applications métier",
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
  return groups.map(({ category, title }) => {
    const items = references.filter((reference) => reference.category === category);
    return `
      <section class="reference-section">
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
    `;
  }).join("");
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
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script><script type="application/ld+json">${JSON.stringify(faq)}</script>`;
}

export function renderSeoPage(page: SeoPage): string {
  const escapedHeading = escapeHtml(page.h1);
  const escapedAccent = escapeHtml(page.h1Accent);
  const headingMarkup = escapedHeading.replace(
    escapedAccent,
    `<span class="accent">${escapedAccent}</span>`,
  );
  const sections = page.sections
    .map(
      (section) => `
        <section class="content-section">
          <h2>${escapeHtml(section.title)}</h2>
          ${section.paragraphs.map(renderParagraph).join("")}
          ${
            section.bullets
              ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
              : ""
          }
        </section>
      `,
    )
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
      : `<div class="content-grid">${sections}</div>`;

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
    <style>
      :root{color-scheme:dark;--bg:#080b12;--panel:#111722;--text:#f5f7fb;--muted:#9aa4b2;--cyan:#22d3ee;--blue:#3b82f6;--line:rgba(148,163,184,.18)}
      *{box-sizing:border-box}
      body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
      a{color:inherit;text-decoration:none}a:hover{color:var(--cyan)}
      .wrap{width:min(1280px,calc(100% - 48px));margin:auto}
      header{position:fixed;inset:0 0 auto;z-index:50;border-bottom:1px solid var(--line);background:rgba(8,11,18,.82);backdrop-filter:blur(14px)}
      .nav{height:60px;display:flex;align-items:center;justify-content:space-between;gap:18px}
      .brand{flex:none;font-size:22px;letter-spacing:.04em;font-weight:300;background:linear-gradient(90deg,var(--blue),var(--cyan),var(--blue));background-clip:text;color:transparent}
      nav{display:flex;align-items:center;justify-content:center;gap:clamp(12px,1.5vw,24px);font-size:14px;white-space:nowrap}
      nav a{color:var(--muted);transition:color .2s ease}nav a:hover{color:var(--text)}
      .login{flex:none;display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:8px;background:linear-gradient(90deg,#06b6d4,#2563eb);color:white;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(34,211,238,.18)}
      .login:hover{color:white;filter:brightness(1.08)}
      main{padding:60px 0 80px}
      .crumbs{font-size:13px;color:var(--muted);margin:24px 0 0}
      .crumbs a{color:var(--cyan)}
      .hero{padding:74px 0 70px;max-width:920px;margin:0 auto;text-align:center}
      .eyebrow{display:inline-flex;align-items:center;gap:8px;color:var(--text);font-size:14px;font-weight:500;letter-spacing:0;border:1px solid var(--line);border-radius:999px;background:rgba(15,23,42,.5);padding:8px 16px}
      h1{font-size:clamp(36px,5.4vw,64px);line-height:1.12;letter-spacing:-.035em;margin:28px 0 22px}
      .accent{background:linear-gradient(90deg,var(--blue),var(--cyan),var(--blue));background-clip:text;color:transparent}
      .intro{font-size:clamp(18px,2.1vw,21px);color:var(--muted);line-height:1.65;max-width:800px;margin:0 auto}
      .hero-label{color:var(--cyan);font-weight:600;margin:22px 0 0}
      .content-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
      #services{scroll-margin-top:80px}
      .service-grid,.reference-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
      .service-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:30px;display:flex;flex-direction:column}
      .service-card h2{font-size:25px}
      .service-card>p{min-height:54px}
      .service-items{display:grid;gap:14px;margin:10px 0 24px}
      .service-item{border-left:2px solid var(--cyan);padding-left:14px}
      .service-item h3,.reference-card h3{font-size:16px;margin:0 0 4px}
      .service-item p,.reference-card p{font-size:14px;margin:0}
      .service-card .button{align-self:flex-start;margin-top:auto}
      .reference-section{margin:0 0 42px}
      .reference-section h2{margin:0 0 20px}
      .reference-card{overflow:hidden;border:1px solid var(--line);border-radius:14px;background:var(--panel);transition:border-color .2s ease,transform .2s ease}
      a.reference-card{display:block}
      a.reference-card:hover{border-color:rgba(34,211,238,.55);transform:translateY(-2px)}
      .reference-card img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;background:#0b111d}
      .reference-copy{padding:18px}
      .reference-copy span{display:inline-block;color:var(--cyan);font-size:13px;margin-top:12px}
      .empty-reference{border:1px dashed var(--line);border-radius:12px;padding:20px}
      .content-section{background:var(--panel);border:1px solid transparent;border-radius:12px;padding:30px;transition:border-color .25s ease,box-shadow .25s ease}
      .content-section:hover{border-color:rgba(34,211,238,.5);box-shadow:0 0 18px rgba(0,200,255,.12)}
      h2{font-size:22px;line-height:1.3;margin:0 0 14px}
      p{color:var(--muted);margin:0 0 14px}p:last-child{margin-bottom:0}
      ul{color:#dbe6f5;padding-left:20px;margin:12px 0 0}li{padding:3px 0}
      .cta{margin:48px 0;padding:40px 28px;border:1px solid rgba(34,211,238,.32);border-radius:12px;background:linear-gradient(115deg,rgba(14,38,55,.75),rgba(16,23,42,.85));text-align:center}
      .cta h2{font-size:26px}
      .cta p{max-width:620px;margin:0 auto 14px}
      .button{display:inline-flex;align-items:center;justify-content:center;margin-top:8px;padding:12px 20px;border-radius:8px;background:linear-gradient(90deg,#06b6d4,#2563eb);color:white;font-weight:600;box-shadow:0 8px 24px rgba(34,211,238,.18);transition:filter .2s ease}
      .button:hover{color:white;filter:brightness(1.1)}
      .faq{margin:54px auto 0;max-width:900px}.faq h2{margin-bottom:18px}
      details{padding:17px 0;border-bottom:1px solid var(--line)}
      summary{cursor:pointer;font-weight:650}
      details p{margin:10px 0 0}
      footer{border-top:1px solid var(--line);padding:26px 0;color:var(--muted);font-size:13px}
      .footer-inner{display:flex;align-items:center;justify-content:space-between;gap:18px}
      .footer-brand{font-size:20px;font-weight:300;letter-spacing:.04em;background:linear-gradient(90deg,var(--blue),var(--cyan));background-clip:text;color:transparent}
      .footer-copy{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;text-align:right}
      .footer-copy p{margin:0;font-size:13px}
      .footer-copy a{color:var(--muted)}
      @media(max-width:1000px){nav{gap:12px;font-size:12px}.login{padding:8px 12px}}
      @media(max-width:900px){nav{display:none}}
      @media(max-width:767px){.wrap{width:calc(100% - 40px)}.nav{height:56px}.brand{font-size:20px}.login{font-size:13px;padding:8px 12px}main{padding-top:56px}.crumbs{margin-top:18px}.hero{padding:58px 0 48px}.content-grid,.service-grid,.reference-grid{grid-template-columns:1fr;gap:16px}.content-section,.service-card{padding:24px}.cta{padding:30px 20px}.footer-inner{align-items:center;flex-direction:column;text-align:center}.footer-copy{justify-content:center;text-align:center}}
    </style>
  </head>
  <body>
    <header>
      <div class="wrap nav">
        <a class="brand" href="/">Innov Studio</a>
        <nav aria-label="Navigation principale">
          <a href="/">Accueil</a>
          <a href="/services">Services</a>
          <a href="/site-evolutif">Site évolutif</a>
          <a href="/application-web-entreprise">Application métier</a>
          <a href="/creation-site-web-toulouse">À Toulouse</a>
          <a href="/#features">Avantages</a>
          <a href="/references">Références</a>
          <a href="/#contact">Contact</a>
        </nav>
        <a class="login" href="/login">Connexion <span aria-hidden="true">›</span></a>
      </div>
    </header>
    <main class="wrap">
      <div class="crumbs"><a href="/">Accueil</a> <span aria-hidden="true">›</span> ${escapeHtml(page.h1)}</div>
      <article>
        <section class="hero">
          <div class="eyebrow"><span aria-hidden="true">✧</span> Innovation Web & Intelligence Artificielle</div>
          <h1>${headingMarkup}</h1>
          <p class="intro">${escapeHtml(page.intro)}</p>
          <p class="hero-label">${escapeHtml(page.label)}</p>
        </section>
        ${pageContent}
        <section class="cta">
          <h2>${escapeHtml(page.cta)}</h2>
          <p>Présentez votre activité, votre objectif et les besoins que vous souhaitez traiter en premier.</p>
          <a class="button" href="/#contact">Parler de mon projet</a>
        </section>
        <section class="faq">
          <h2>Questions fréquentes</h2>
          ${faq}
        </section>
      </article>
    </main>
    <footer>
      <div class="wrap footer-inner">
        <a class="footer-brand" href="/">Innov Studio</a>
        <div class="footer-copy">
          <p>© ${new Date().getFullYear()} Innov Studio By Cyril Allegret · Création de sites web à Toulouse. Tous droits réservés.</p>
          <span aria-hidden="true">·</span>
          <a href="https://www.jesuisnumerique.fr" target="_blank" rel="noopener noreferrer">jesuisnumerique.fr</a>
        </div>
      </div>
    </footer>
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
