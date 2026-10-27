import React from "react";

const sections = [
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
];

const questions = [
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
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h11M10 5l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Harmonized() {
  return (
    <div className="evol-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
        .evol-page {
          --ev-ink: #16263a; --ev-muted: #536579; --ev-cyan: #087e98;
          --ev-blue: #2865c8; --ev-line: #dce7ed; --ev-bg: #f5f9fb;
          min-height: 100vh; color: var(--ev-ink); background: var(--ev-bg);
          font: 15px/1.7 'DM Sans', sans-serif; overflow: hidden;
        }
        .evol-page * { box-sizing: border-box; }
        .evol-page a { color: inherit; text-decoration: none; }
        .evol-page a:focus-visible, .evol-page summary:focus-visible { outline: 3px solid #2f9ab0; outline-offset: 4px; border-radius: 4px; }
        .ev-wrap { width: min(1190px, calc(100% - 56px)); margin-inline: auto; }
        .ev-header { position: sticky; top: 0; z-index: 10; height: 64px; background: rgba(255,255,255,.88); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(29,61,83,.09); }
        .ev-nav { height: 100%; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px; }
        .ev-brand { justify-self: start; font: 500 23px/1 'Manrope',sans-serif; letter-spacing: -.045em; background: linear-gradient(100deg,#2865c8,#07899b 60%,#2865c8); color: transparent; background-clip: text; }
        .ev-links { display: flex; align-items: center; gap: clamp(16px,2.4vw,34px); font-size: 13px; color: #536579; }
        .ev-links a { transition: color .18s ease; }
        .ev-links a:hover { color: var(--ev-blue); }
        .ev-login { justify-self: end; display: inline-flex; align-items: center; gap: 10px; padding: 9px 16px; color: white !important; background: linear-gradient(105deg,#0aa9bd,#2865c8); border-radius: 8px; font-weight: 700; font-size: 13px; box-shadow: 0 6px 18px rgba(20,116,162,.17); transition: transform .2s ease, filter .2s ease; }
        .ev-login:hover,.ev-button:hover { transform: translateY(-2px); filter: brightness(1.04); }
        .ev-login svg,.ev-button svg,.ev-text-link svg { width: 17px; height: 17px; }
        .ev-main { padding-bottom: 88px; }
        .ev-heading { padding: 43px 0 34px; text-align: center; }
        .ev-eyebrow { margin: 0 0 10px; color: var(--ev-cyan); font-size: 12px; font-weight: 700; letter-spacing: .08em; }
        .ev-heading h1 { max-width: 900px; margin: 0 auto 12px; font: 700 clamp(31px,4vw,47px)/1.12 'Manrope',sans-serif; letter-spacing: -.045em; }
        .ev-accent { background: linear-gradient(100deg,#2865c8,#07899b 65%,#2865c8); color: transparent; background-clip: text; }
        .ev-intro { max-width: 790px; margin: 0 auto; font-size: clamp(16px,1.7vw,18px); line-height: 1.65; color: var(--ev-muted); }
        .ev-journey { display: grid; grid-template-columns: 1fr 72px 1fr; align-items: stretch; gap: 16px; max-width: 950px; margin: 0 auto 38px; }
        .ev-stage { position: relative; padding: 21px 24px 22px; border: 1px solid #dce8ee; border-radius: 13px; background: rgba(255,255,255,.8); box-shadow: 0 10px 26px rgba(25,55,77,.045); }
        .ev-stage:last-child { border-color: rgba(8,126,152,.25); background: linear-gradient(130deg,#f1f9fb,#f1f5ff); }
        .ev-stage-top { display: flex; align-items: center; gap: 13px; }
        .ev-stage-num { display: grid; place-items: center; width: 39px; height: 39px; flex: 0 0 39px; border-radius: 11px; color: #176c91; background: #e7f2f7; font: 700 14px 'Manrope',sans-serif; }
        .ev-stage:last-child .ev-stage-num { color: #2865c8; background: #e8eefb; }
        .ev-stage-kicker { margin: 0; color: #63768a; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
        .ev-stage h2 { margin: 1px 0 0; font: 700 17px/1.3 'Manrope',sans-serif; letter-spacing: -.025em; }
        .ev-stage p { margin: 13px 0 0; color: var(--ev-muted); font-size: 13px; line-height: 1.55; }
        .ev-connector { display: grid; align-content: center; justify-items: center; color: #1789a2; }
        .ev-connector:before,.ev-connector:after { content: ""; width: 1px; height: 17px; background: linear-gradient(transparent,#8bbdca); }
        .ev-connector:after { background: linear-gradient(#8bbdca,transparent); }
        .ev-connector svg { width: 25px; height: 25px; margin: 7px 0; }
        .ev-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; }
        .ev-card { position: relative; padding: 27px 29px 25px; border: 1px solid #dce6eb; border-radius: 13px; background: #fff; box-shadow: 0 9px 24px rgba(23,55,78,.035); transition: border-color .25s ease, transform .25s ease, box-shadow .25s ease; }
        .ev-card:hover { transform: translateY(-3px); border-color: rgba(8,126,152,.35); box-shadow: 0 14px 32px rgba(23,55,78,.075); }
        .ev-card:before { content: ""; position: absolute; top: 26px; bottom: 26px; left: 0; width: 3px; border-radius: 0 3px 3px 0; background: linear-gradient(#18a5b0,#3970cf); opacity: .78; }
        .ev-card h2 { margin: 0 0 12px; font: 700 19px/1.35 'Manrope',sans-serif; letter-spacing: -.025em; }
        .ev-card p { margin: 0 0 11px; color: var(--ev-muted); font-size: 13.5px; line-height: 1.65; }
        .ev-card p:last-of-type { margin-bottom: 0; }
        .ev-card ul { list-style: none; padding: 0; margin: 16px 0 0; display: grid; gap: 8px; }
        .ev-card li { position: relative; padding-left: 21px; color: #40566a; font-size: 12.5px; line-height: 1.5; }
        .ev-card li:before { content: ""; position: absolute; top: .48em; left: 0; width: 9px; height: 9px; border: 2px solid #1691a2; border-radius: 50%; background: #e6f5f4; }
        .ev-card[id] { scroll-margin-top: 88px; }
        .ev-card-feature { background: linear-gradient(145deg,#f0f8fa,#fff 52%,#f4f7ff); border-color: rgba(8,126,152,.25); }
        .ev-card-feature .ev-step { display: inline-flex; padding: 4px 9px; margin-bottom: 10px; border-radius: 99px; color: #126e86; background: #e3f3f4; font-size: 10px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; }
        .ev-cta { position: relative; isolation: isolate; overflow: hidden; margin: 45px 0 0; padding: 34px 26px; border: 1px solid rgba(17,130,157,.19); border-radius: 14px; background: linear-gradient(112deg,#edf5ff,#eaf8f7); text-align: center; }
        .ev-cta:before { content: ""; position: absolute; z-index: -1; width: 260px; height: 260px; top: -178px; left: 8%; border: 1px solid rgba(44,127,182,.13); border-radius: 50%; box-shadow: 0 0 0 22px rgba(44,127,182,.035),0 0 0 48px rgba(44,127,182,.025); }
        .ev-cta h2 { margin: 0 0 7px; font: 700 24px/1.3 'Manrope',sans-serif; letter-spacing: -.035em; }
        .ev-cta p { max-width: 610px; margin: 0 auto 15px; color: var(--ev-muted); font-size: 14px; }
        .ev-button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 19px; border-radius: 8px; color: white !important; background: linear-gradient(105deg,#0aa9bd,#2865c8); box-shadow: 0 7px 18px rgba(20,116,162,.19); font-size: 13px; font-weight: 700; transition: transform .2s ease, filter .2s ease; }
        .ev-faq { max-width: 860px; margin: 42px auto 0; }
        .ev-faq h2 { margin: 0 0 12px; font: 700 23px/1.3 'Manrope',sans-serif; letter-spacing: -.03em; }
        .ev-faq details { border-bottom: 1px solid #dce6eb; }
        .ev-faq summary { position: relative; cursor: pointer; list-style: none; padding: 16px 34px 16px 0; color: #20384c; font-size: 14px; font-weight: 700; }
        .ev-faq summary::-webkit-details-marker { display: none; }
        .ev-faq summary:after { content: "+"; position: absolute; right: 4px; top: 12px; color: #138397; font: 400 23px/1.3 'DM Sans',sans-serif; transition: transform .2s ease; }
        .ev-faq details[open] summary:after { transform: rotate(45deg); }
        .ev-faq details p { margin: -2px 34px 16px 0; color: var(--ev-muted); font-size: 13px; }
        .ev-footer { border-top: 1px solid rgba(29,61,83,.1); padding: 23px 0; background: rgba(255,255,255,.66); }
        .ev-footer-inner { display: flex; justify-content: space-between; align-items: center; gap: 18px; }
        .ev-footer-brand { font: 500 19px/1 'Manrope',sans-serif; letter-spacing: -.04em; background: linear-gradient(100deg,#2865c8,#07899b); color: transparent !important; background-clip: text; white-space: nowrap; }
        .ev-footer-copy { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 8px; text-align: right; color: #617386; font-size: 11px; }
        .ev-footer-copy p { margin: 0; }
        .ev-footer-copy a { text-decoration: underline; text-decoration-color: #a5b8c5; text-underline-offset: 3px; }
        @media (max-width: 900px) {
          .ev-nav { grid-template-columns: auto 1fr; }
          .ev-links { display: none; }
          .ev-journey { grid-template-columns: 1fr 48px 1fr; }
        }
        @media (max-width: 680px) {
          .ev-wrap { width: calc(100% - 36px); }
          .ev-header { height: 58px; }
          .ev-brand { font-size: 21px; }
          .ev-login { padding: 8px 11px; font-size: 12px; }
          .ev-main { padding-bottom: 58px; }
          .ev-heading { padding: 35px 0 25px; }
          .ev-eyebrow { font-size: 10px; }
          .ev-heading h1 { max-width: 520px; font-size: clamp(30px,8vw,39px); }
          .ev-intro { font-size: 15px; }
          .ev-journey { grid-template-columns: 1fr; gap: 10px; margin-bottom: 25px; }
          .ev-stage { padding: 18px 20px; }
          .ev-connector { grid-template-columns: 1fr auto 1fr; gap: 9px; }
          .ev-connector:before,.ev-connector:after { width: auto; height: 1px; }
          .ev-connector svg { transform: rotate(90deg); margin: 0; }
          .ev-grid { grid-template-columns: 1fr; gap: 13px; }
          .ev-card { padding: 23px 23px 22px; }
          .ev-card h2 { font-size: 18px; }
          .ev-cta { margin-top: 30px; padding: 29px 19px; }
          .ev-cta h2 { font-size: 21px; }
          .ev-faq { margin-top: 34px; }
          .ev-footer-inner { flex-direction: column; }
          .ev-footer-copy { justify-content: center; text-align: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .evol-page *, .evol-page *:before, .evol-page *:after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
        }
      `}</style>
      <header className="ev-header">
        <div className="ev-wrap ev-nav">
          <a className="ev-brand" href="/" aria-label="Innov Studio, accueil">Innov Studio</a>
          <nav className="ev-links" aria-label="Navigation principale">
            <a href="/">Accueil</a>
            <a href="/site-evolutif" aria-current="page">Site Web Evolutif</a>
            <a href="/references">Références</a>
            <a href="/#contact">Contact</a>
          </nav>
          <a className="ev-login" href="/login">Connexion <ArrowIcon /></a>
        </div>
      </header>
      <main className="ev-main">
        <article className="ev-wrap">
          <header className="ev-heading">
            <p className="ev-eyebrow">Une solution web qui évolue au rythme de votre activité.</p>
            <h1>Du site vitrine à l’<span className="ev-accent">application web métier</span></h1>
            <p className="ev-intro">Commencez par un site vitrine clair et bien référencé, puis ajoutez les fonctionnalités métier utiles à votre activité, jusqu’à une application web sur mesure.</p>
          </header>

          <section className="ev-journey" aria-label="Les étapes de votre solution web">
            <div className="ev-stage">
              <div className="ev-stage-top">
                <span className="ev-stage-num">01</span>
                <div><p className="ev-stage-kicker">Point de départ</p><h2>Site vitrine professionnel</h2></div>
              </div>
              <p>Des pages adaptées à votre activité, une présentation claire de vos services et des bases SEO solides.</p>
            </div>
            <div className="ev-connector" aria-hidden="true"><ArrowIcon /></div>
            <div className="ev-stage">
              <div className="ev-stage-top">
                <span className="ev-stage-num">02</span>
                <div><p className="ev-stage-kicker">À mesure que vos besoins grandissent</p><h2>Application web métier</h2></div>
              </div>
              <p>Des fonctions utiles, ajoutées progressivement, puis un outil conçu autour de vos processus.</p>
            </div>
          </section>

          <div className="ev-grid">
            {sections.map((section, index) => (
              <section className={`ev-card${section.id ? " ev-card-feature" : ""}`} id={section.id} key={section.title}>
                {section.id && <span className="ev-step">Étape clé · évolution métier</span>}
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
              </section>
            ))}
          </div>

          <section className="ev-cta" aria-labelledby="ev-cta-heading">
            <h2 id="ev-cta-heading">Parlons de la première étape de votre projet</h2>
            <p>Présentez votre activité, votre objectif et les besoins que vous souhaitez traiter en premier.</p>
            <a className="ev-button" href="/#contact">Parler de mon projet <ArrowIcon /></a>
          </section>

          <section className="ev-faq" aria-labelledby="ev-faq-heading">
            <h2 id="ev-faq-heading">Questions fréquentes</h2>
            {questions.map(({ question, answer }) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </section>
        </article>
      </main>
      <footer className="ev-footer">
        <div className="ev-wrap ev-footer-inner">
          <a className="ev-footer-brand" href="/">Innov Studio</a>
          <div className="ev-footer-copy">
            <p>© 2026 Innov Studio By Cyril Allegret · Création de sites web &amp; applications sur mesure. Tous droits réservés.</p>
            <span aria-hidden="true">·</span>
            <a href="https://www.jesuisnumerique.fr" target="_blank" rel="noopener noreferrer">jesuisnumerique.fr</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
