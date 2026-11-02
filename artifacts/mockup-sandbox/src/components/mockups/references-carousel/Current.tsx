import "../site-evolutif/_group.css";

const groups = [
  {
    title: "Site vitrine professionnel",
    items: [
      {
        title: "MAM La Chouette Violette",
        url: "https://lachouetteviolette.fr",
        image: "/uploads/ref-1772885229024-885883569-Capture%20Site.png",
        description:
          "Présentation de la MAM La Chouette Violette - Maison d'Assistantes Maternelles",
      },
    ],
  },
  {
    title: "Application web métier",
    items: [
      {
        title: "Infra Shield Tools",
        url: "https://ist-secu.com",
        image: "/uploads/ref-1772885237918-31809429-IST%20Capture%20Site.png",
        description:
          "Outil entreprise de sécurisation d'infrastructure systèmes",
      },
    ],
  },
];

export function Current() {
  return (
    <main className="references-current">
      <style>{`
        .references-current {
          min-height: 100vh;
          padding: 40px 24px 70px;
          background: #f8fafc;
          color: #0f172a;
          font: 16px/1.6 Inter, ui-sans-serif, system-ui, sans-serif;
        }
        .references-current * { box-sizing: border-box; }
        .references-current .page-heading {
          max-width: 1080px;
          margin: 0 auto 36px;
          text-align: center;
        }
        .references-current .page-label {
          margin: 0 auto 14px;
          color: #0e7490;
          font-size: 15px;
          font-weight: 600;
        }
        .references-current h1 {
          margin: 0 auto 18px;
          font-size: clamp(32px, 3.75vw, 48px);
          letter-spacing: -.035em;
          line-height: 1.12;
        }
        .references-current .accent {
          background: linear-gradient(90deg, #2563eb, #22d3ee, #2563eb);
          background-clip: text;
          color: transparent;
        }
        .references-current .page-intro {
          max-width: 1080px;
          margin: 0 auto;
          color: #64748b;
          font-size: clamp(18px, 2.1vw, 20px);
          line-height: 1.65;
        }
        .references-current .reference-groups { max-width: 1280px; margin: 0 auto; }
        .references-current .reference-section { margin: 0 0 42px; }
        .references-current .reference-section h2 { margin: 0 0 20px; font-size: 22px; }
        .references-current .reference-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }
        .references-current .reference-card {
          display: block;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(15,23,42,.04);
          color: inherit;
          text-decoration: none;
          transition: border-color .2s ease, transform .2s ease;
        }
        .references-current .reference-card:hover {
          transform: translateY(-2px);
          border-color: rgba(34,211,238,.55);
        }
        .references-current .reference-card img {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          object-position: top;
          background: #f1f5f9;
        }
        .references-current .reference-copy { padding: 18px; }
        .references-current .reference-copy h3 { margin: 0 0 4px; font-size: 16px; }
        .references-current .reference-copy p { margin: 0; color: #64748b; font-size: 14px; }
        .references-current .reference-copy span {
          display: inline-block;
          margin-top: 12px;
          color: #0e7490;
          font-size: 13px;
        }
        @media (max-width: 767px) {
          .references-current { padding: 24px 20px 54px; }
          .references-current .page-heading { margin-bottom: 28px; }
          .references-current .reference-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .references-current .reference-copy { padding: 12px; }
          .references-current .reference-card h3 { font-size: 14px; }
          .references-current .reference-copy p { font-size: 12px; line-height: 1.45; }
          .references-current .reference-copy span { font-size: 12px; }
        }
      `}</style>
      <header className="page-heading">
        <p className="page-label">Des projets conçus pour répondre à des besoins concrets.</p>
        <h1>Mes <span className="accent">projets réalisés</span></h1>
        <p className="page-intro">
          Découvrez une sélection de sites et de solutions web réalisés par Innov Studio.
        </p>
      </header>
      <div className="reference-groups">
        {groups.map((group) => (
          <section className="reference-section" key={group.title}>
            <h2>{group.title}</h2>
            <div className="reference-grid">
              {group.items.map((item) => (
                <a
                  className="reference-card"
                  href={item.url}
                  key={item.title}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <img alt={item.title} loading="lazy" src={item.image} />
                  <div className="reference-copy">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span>Visiter le site →</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
