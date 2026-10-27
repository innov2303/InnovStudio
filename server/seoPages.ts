const SITE_URL = "https://innov-studio.fr";

type SeoSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type SeoPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  label: string;
  sections: SeoSection[];
  cta: string;
  faq: { question: string; answer: string }[];
};

export const seoPages: SeoPage[] = [
  {
    path: "/site-evolutif",
    title: "Site internet évolutif professionnel à Toulouse | Innov Studio",
    description:
      "Faites créer un site web évolutif à Toulouse, puis ajoutez des outils métier, un espace client et des automatisations à mesure que votre activité grandit.",
    h1: "Un site web qui grandit avec votre entreprise",
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
    ${jsonLd(page)}
    <style>
      :root{color-scheme:dark;--bg:#070b14;--panel:#101827;--text:#eef4ff;--muted:#a8b4c7;--cyan:#44d6ff;--blue:#438bff;--line:#223148}
      *{box-sizing:border-box}
      body{margin:0;background:radial-gradient(ellipse at 50% -25%,#15304d 0,transparent 55%),var(--bg);color:var(--text);font:16px/1.7 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
      a{color:var(--cyan);text-decoration:none}a:hover{text-decoration:underline}
      .wrap{width:min(1060px,calc(100% - 40px));margin:auto}
      header{border-bottom:1px solid var(--line);background:#070b14e8}
      .nav{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:20px}
      .brand{font-size:22px;letter-spacing:.04em;font-weight:300;background:linear-gradient(90deg,var(--blue),var(--cyan));background-clip:text;color:transparent}
      nav{display:flex;gap:20px;flex-wrap:wrap;font-size:14px}
      nav a{color:#d5e1f3}
      main{padding:42px 0 80px}
      .crumbs{font-size:13px;color:var(--muted);margin:0 0 34px}
      .hero{padding:36px 0 56px;max-width:850px}
      .eyebrow{color:var(--cyan);font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
      h1{font-size:clamp(36px,6vw,64px);line-height:1.08;letter-spacing:-.035em;margin:14px 0 20px}
      .intro{font-size:clamp(18px,2.4vw,22px);color:#c4d0e1;line-height:1.6;max-width:780px}
      .hero-label{color:var(--cyan);font-weight:600;margin-top:26px}
      .content-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
      .content-section{background:linear-gradient(145deg,#111b2c,#0b111d);border:1px solid var(--line);border-radius:16px;padding:26px}
      h2{font-size:22px;line-height:1.25;margin:0 0 14px}
      p{color:#bdc9db;margin:0 0 14px}p:last-child{margin-bottom:0}
      ul{color:#dbe6f5;padding-left:20px;margin:12px 0 0}li{padding:3px 0}
      .cta{margin:34px 0;padding:32px;border:1px solid #176785;border-radius:18px;background:linear-gradient(115deg,#0e2637,#10172a);text-align:center}
      .cta h2{font-size:26px}
      .button{display:inline-block;margin-top:8px;padding:12px 20px;border-radius:10px;background:linear-gradient(90deg,#168fc6,#326be3);color:white;font-weight:700}
      .faq{margin-top:48px}.faq h2{margin-bottom:18px}
      details{padding:17px 0;border-bottom:1px solid var(--line)}
      summary{cursor:pointer;font-weight:650}
      details p{margin:10px 0 0}
      footer{border-top:1px solid var(--line);padding:26px 0;color:var(--muted);font-size:13px}
      footer .links{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px}
      @media(max-width:720px){.nav{align-items:flex-start;flex-direction:column;padding:16px 0}nav{gap:12px 18px}.content-grid{grid-template-columns:1fr}.hero{padding-top:20px}.content-section{padding:22px}main{padding-top:28px}}
    </style>
  </head>
  <body>
    <header>
      <div class="wrap nav">
        <a class="brand" href="/">Innov Studio</a>
        <nav aria-label="Navigation principale">
          <a href="/">Accueil</a>
          <a href="/site-evolutif">Site évolutif</a>
          <a href="/application-web-entreprise">Application métier</a>
          <a href="/creation-site-web-toulouse">Création à Toulouse</a>
          <a href="/#references">Réalisations</a>
          <a href="/#contact">Contact</a>
        </nav>
      </div>
    </header>
    <main class="wrap">
      <div class="crumbs"><a href="/">Accueil</a> <span aria-hidden="true">›</span> ${escapeHtml(page.h1)}</div>
      <article>
        <section class="hero">
          <div class="eyebrow">Innov Studio · Toulouse</div>
          <h1>${escapeHtml(page.h1)}</h1>
          <p class="intro">${escapeHtml(page.intro)}</p>
          <p class="hero-label">${escapeHtml(page.label)}</p>
        </section>
        <div class="content-grid">${sections}</div>
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
      <div class="wrap">
        <strong>Innov Studio</strong> · Création web et applications sur mesure à Toulouse
        <div class="links">
          <a href="/site-evolutif">Site évolutif</a>
          <a href="/application-web-entreprise">Application web métier</a>
          <a href="/creation-site-web-toulouse">Création de site à Toulouse</a>
          <a href="/#contact">Contact</a>
          <a href="/mentions-legales">Mentions légales</a>
        </div>
      </div>
    </footer>
  </body>
</html>`;
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
