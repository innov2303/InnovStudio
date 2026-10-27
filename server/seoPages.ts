const SITE_URL = "https://innov-studio.fr";

type SeoSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  id?: string;
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
    title: "Site Web Évolutif : du site vitrine à l’application | Innov Studio",
    description:
      "Démarrez avec un site vitrine professionnel, puis faites-le évoluer vers une application web métier : espace client, suivi, tableaux de bord et automatisations.",
    h1: "Du site vitrine à l’application web métier",
    h1Accent: "application web métier",
    intro:
      "Commencez par un site vitrine clair et bien référencé, puis ajoutez les fonctionnalités métier utiles à votre activité, jusqu’à une application web sur mesure.",
    label: "Une solution web qui évolue au rythme de votre activité.",
    sections: [
      {
        title: "Des pages et des contenus adaptés à votre activité",
        paragraphs: [
          "Un site vitrine doit permettre à vos visiteurs de comprendre rapidement votre activité, vos services et la façon de vous contacter. Les pages sont organisées selon votre offre, vos publics et vos objectifs : accueil, services, réalisations, présentation ou contact.",
          "Les contenus mettent en valeur vos informations et guident les visiteurs vers l’action utile, qu’il s’agisse de demander un devis, de réserver ou de vous écrire.",
        ],
        bullets: [
          "Une arborescence organisée autour de vos services",
          "Des textes et visuels adaptés à votre activité",
          "Des appels à l’action et coordonnées faciles à trouver",
        ],
      },
      {
        title: "Un design responsive sur mobile et ordinateur",
        paragraphs: [
          "Votre site s’adapte aux différentes tailles d’écran pour rester agréable à consulter sur téléphone, tablette et ordinateur. La mise en page, les images et la navigation sont pensées pour que chaque visiteur trouve facilement les informations importantes.",
          "Cette adaptation facilite aussi les demandes de contact depuis un mobile, où de nombreux visiteurs découvrent aujourd’hui les entreprises.",
        ],
        bullets: [
          "Navigation claire sur les petits et grands écrans",
          "Textes et boutons lisibles et faciles à utiliser",
          "Présentation cohérente sur mobile et ordinateur",
        ],
      },
      {
        title: "Pourquoi rendre votre activité visible en ligne ?",
        paragraphs: [
          "Une présence en ligne permet aux personnes qui recherchent vos services de découvrir votre activité, de comprendre votre offre et de vérifier comment vous joindre. Votre site devient un point de repère accessible à tout moment, que vous partagiez son adresse directement ou qu’un visiteur le découvre depuis un moteur de recherche.",
          "Un site clair renforce la présentation de votre activité et aide les visiteurs à passer de la découverte à la prise de contact. La visibilité dépend de plusieurs facteurs et se construit dans le temps.",
        ],
        bullets: [
          "Présenter vos services au-delà de votre réseau immédiat",
          "Donner des informations utiles avant le premier échange",
          "Faciliter la prise de contact depuis vos pages",
        ],
      },
      {
        title: "Les fondations SEO incluses dès la création",
        paragraphs: [
          "Le référencement naturel est pris en compte dès la conception : chaque page dispose d’une structure claire, de titres cohérents et de balises adaptées à son contenu. Les URLs, les textes et les images sont organisés pour aider les moteurs de recherche à comprendre les sujets traités.",
          "Ces fondations facilitent l’exploration et l’indexation du site, sans garantir une position précise dans les résultats. Le classement dépend aussi de la concurrence, de la qualité et de l’évolution des contenus.",
        ],
        bullets: [
          "Balises title et descriptions adaptées à chaque page",
          "Hiérarchie de titres et URLs lisibles",
          "Contenus structurés et images renseignées",
          "Fondations techniques adaptées aux mobiles",
        ],
      },
      {
        id: "application-metier",
        title: "Du site vitrine à l’application web métier, étape par étape",
        paragraphs: [
          "Vous pouvez commencer par un site vitrine professionnel : des pages adaptées à votre activité, une présentation claire de vos services et des bases SEO solides. C’est un point de départ pour vous rendre visible et faciliter les prises de contact.",
          "Quand vos besoins grandissent, ajoutez progressivement des fonctions utiles : réservation, catalogue, formulaires connectés, espace client, comptes utilisateurs, suivi de dossiers, tableaux de bord ou automatisations.",
          "Lorsque ces fonctions deviennent centrales dans votre activité, le projet peut évoluer vers une application web métier conçue autour de vos processus. Selon le site existant et ses données, nous définissons ce qui peut être conservé et les étapes à construire. Vous pouvez aussi démarrer directement par l’application si c’est votre besoin prioritaire.",
        ],
        bullets: [
          "Commencer par un site vitrine professionnel et bien structuré",
          "Ajouter des fonctionnalités au rythme de vos besoins",
          "Faire évoluer le projet vers une application web métier sur mesure",
          "Planifier chaque étape selon vos usages et vos priorités",
        ],
      },
      {
        title: "Un accompagnement dans la durée",
        paragraphs: [
          "La conception, le développement, la mise en ligne et la maintenance peuvent être organisés par étapes. Vous gardez une vision claire de ce qui est réalisé et de ce qui peut venir ensuite.",
        ],
        bullets: [
          "Évolutions définies selon vos priorités",
          "Hébergement et maintenance disponibles",
          "Accompagnement technique après la mise en ligne",
        ],
      },
    ],
    cta: "Parlons de la première étape de votre projet",
    faq: [
      {
        question: "Peut-on passer d’un site vitrine à une application web métier ?",
        answer:
          "Oui, selon la structure du site, ses données et les fonctionnalités souhaitées. Une première analyse permet de déterminer ce qui peut être conservé et de planifier les évolutions.",
      },
      {
        question: "Dois-je prévoir toutes les fonctionnalités dès le départ ?",
        answer:
          "Non. Le projet peut commencer par les besoins prioritaires, puis évoluer par étapes planifiées à mesure que votre activité et vos usages se précisent.",
      },
      {
        question: "Le référencement SEO est-il inclus dans la création du site ?",
        answer:
          "Les fondations SEO sont intégrées à la création : structure des pages, titres, descriptions et contenus organisés. Elles aident les moteurs de recherche à comprendre le site, sans garantir une position précise.",
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
        <section class="content-section"${section.id ? ` id="${escapeHtml(section.id)}"` : ""}>
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
      :root{color-scheme:light;--bg:#f8fafc;--panel:#fff;--text:#0f172a;--muted:#475569;--cyan:#0e7490;--blue:#2563eb;--line:rgba(15,23,42,.12)}
      *{box-sizing:border-box}
      body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
      a{color:inherit;text-decoration:none}a:hover{color:var(--cyan)}
      .wrap{width:min(1280px,calc(100% - 48px));margin:auto}
      header{position:fixed;inset:0 0 auto;z-index:50;border-bottom:1px solid var(--line);background:rgba(255,255,255,.88);backdrop-filter:blur(14px)}
      .nav{height:52px;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:16px}
      .brand{justify-self:start;flex:none;font-size:24px;letter-spacing:.025em;font-weight:300;white-space:nowrap;background:linear-gradient(90deg,var(--blue),var(--cyan),var(--blue));background-clip:text;color:transparent}
      nav{justify-self:center;display:flex;align-items:center;justify-content:center;gap:24px;font-size:16px;white-space:nowrap}
      nav a{color:var(--muted);transition:color .2s ease}nav a:hover{color:var(--blue)}
      .login{justify-self:end;flex:none;display:inline-flex;align-items:center;height:38px;padding:8px 20px;border-radius:8px;background:linear-gradient(90deg,#06b6d4,#2563eb);color:white;font-size:14px;font-weight:600;line-height:20px;white-space:nowrap;box-shadow:0 8px 24px rgba(34,211,238,.18)}
      .login span{display:inline-flex;width:16px;justify-content:center;margin-left:4px}
      .login:hover{color:white;filter:brightness(1.08)}
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
      footer{border-top:1px solid var(--line);padding:26px 0;color:var(--muted);font-size:13px}
      .footer-inner{display:flex;align-items:center;justify-content:space-between;gap:18px}
      .footer-brand{font-size:20px;font-weight:300;letter-spacing:.04em;background:linear-gradient(90deg,var(--blue),var(--cyan));background-clip:text;color:transparent}
      .footer-copy{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;text-align:right}
      .footer-copy p{margin:0;font-size:13px}
      .footer-copy a{color:var(--muted)}
      @media(min-width:1024px){.nav{grid-template-columns:1fr auto 1fr}}
      @media(max-width:1023px){nav{display:none}}
      @media(max-width:767px){
        .wrap{width:calc(100% - 40px)}
        .nav{height:52px}
        .brand{font-size:20px}
        .login{font-size:13px;padding:8px 12px}
        .page-content{padding-top:78px}
        .page-heading{margin-bottom:28px}
        .page-heading h1{font-size:clamp(30px,8vw,40px)}
        .content-grid,.service-grid,.reference-grid{grid-template-columns:1fr;gap:16px}
        .content-section,.service-card{padding:24px}
        .cta{padding:30px 20px}
        .footer-inner{align-items:center;flex-direction:column;text-align:center}
        .footer-copy{justify-content:center;text-align:center}
      }
    </style>
  </head>
  <body>
    <header>
      <div class="wrap nav">
        <a class="brand" href="/">Innov Studio</a>
        <nav aria-label="Navigation principale">
          <a href="/">Accueil</a>
          <a href="/site-evolutif">Site Web Evolutif</a>
          <a href="/references">Références</a>
          <a href="/#contact">Contact</a>
        </nav>
        <a class="login" href="/login">Connexion<span aria-hidden="true">›</span></a>
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
