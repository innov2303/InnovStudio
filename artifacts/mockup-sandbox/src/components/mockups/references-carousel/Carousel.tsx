import { useRef, useState } from "react";
import "../site-evolutif/_group.css";

const groups = [
  {
    category: "vitrine",
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
    category: "enterprise",
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

export function Carousel() {
  const tracks = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndexes, setActiveIndexes] = useState([0, 0]);

  const updateIndex = (groupIndex: number) => {
    const track = tracks.current[groupIndex];
    if (!track) return;
    const slides = Array.from(track.querySelectorAll<HTMLElement>(".reference-slide"));
    const closestIndex = slides.reduce((closest, slide, index) => {
      const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
      const closestDistance = Math.abs(
        slides[closest]?.offsetLeft - track.scrollLeft,
      );
      return distance < closestDistance ? index : closest;
    }, 0);
    setActiveIndexes((current) =>
      current[groupIndex] === closestIndex
        ? current
        : current.map((value, index) => (index === groupIndex ? closestIndex : value)),
    );
  };

  const move = (groupIndex: number, direction: -1 | 1) => {
    const track = tracks.current[groupIndex];
    if (!track) return;
    const nextIndex = Math.max(
      0,
      Math.min(groups[groupIndex].items.length - 1, activeIndexes[groupIndex] + direction),
    );
    const slide = track.querySelectorAll<HTMLElement>(".reference-slide")[nextIndex];
    if (!slide) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    track.scrollTo({ left: slide.offsetLeft, behavior });
  };

  return (
    <main className="references-carousel-page">
      <style>{`
        .references-carousel-page {
          min-height: 100vh;
          padding: 40px 24px 70px;
          background: #f8fafc;
          color: #0f172a;
          font: 16px/1.6 Inter, ui-sans-serif, system-ui, sans-serif;
        }
        .references-carousel-page * { box-sizing: border-box; }
        .references-carousel-page .page-heading {
          max-width: 1080px;
          margin: 0 auto 36px;
          text-align: center;
        }
        .references-carousel-page .page-label {
          margin: 0 auto 14px;
          color: #0e7490;
          font-size: 15px;
          font-weight: 600;
        }
        .references-carousel-page h1 {
          margin: 0 auto 18px;
          font-size: clamp(32px, 3.75vw, 48px);
          letter-spacing: -.035em;
          line-height: 1.12;
        }
        .references-carousel-page .accent {
          background: linear-gradient(90deg, #2563eb, #22d3ee, #2563eb);
          background-clip: text;
          color: transparent;
        }
        .references-carousel-page .page-intro {
          max-width: 1080px;
          margin: 0 auto;
          color: #64748b;
          font-size: clamp(18px, 2.1vw, 20px);
          line-height: 1.65;
        }
        .references-carousel-page .reference-groups {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: start;
          gap: 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .references-carousel-page .reference-section {
          min-width: 0;
          margin: 0;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: linear-gradient(145deg, #fff, #f8fbff);
          box-shadow: 0 10px 28px rgba(15,23,42,.045);
        }
        .references-carousel-page .reference-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 18px;
        }
        .references-carousel-page .reference-heading h2 {
          min-width: 0;
          margin: 0;
          font-size: 21px;
          line-height: 1.3;
        }
        .references-carousel-page .reference-carousel-controls {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 7px;
        }
        .references-carousel-page .reference-carousel-status {
          min-width: 38px;
          color: #64748b;
          font-size: 12px;
          font-variant-numeric: tabular-nums;
          text-align: center;
        }
        .references-carousel-page .reference-carousel-button {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border: 1px solid #dbe5ee;
          border-radius: 50%;
          background: #fff;
          color: #0e7490;
          cursor: pointer;
          transition: background .18s ease, border-color .18s ease, color .18s ease, transform .18s ease;
        }
        .references-carousel-page .reference-carousel-button:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: #9bd6e1;
          background: #f0fbfd;
        }
        .references-carousel-page .reference-carousel-button:disabled {
          color: #a8b4c0;
          cursor: not-allowed;
          opacity: .6;
        }
        .references-carousel-page .reference-carousel-button:focus-visible {
          outline: 3px solid rgba(37,99,235,.28);
          outline-offset: 2px;
        }
        .references-carousel-page .reference-carousel-button svg {
          width: 17px;
          height: 17px;
        }
        .references-carousel-page .reference-carousel-track {
          position: relative;
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding: 1px 1px 9px;
          overscroll-behavior-x: contain;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          scrollbar-color: #cbd5e1 transparent;
          scrollbar-width: thin;
        }
        .references-carousel-page .reference-carousel-track:focus-visible {
          outline: 3px solid rgba(37,99,235,.24);
          outline-offset: 2px;
          border-radius: 12px;
        }
        .references-carousel-page .reference-slide {
          flex: 0 0 100%;
          min-width: 0;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .references-carousel-page .reference-card {
          display: block;
          height: 100%;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(15,23,42,.04);
          color: inherit;
          text-decoration: none;
          transition: border-color .2s ease, transform .2s ease;
        }
        .references-carousel-page .reference-card:hover {
          transform: translateY(-2px);
          border-color: rgba(34,211,238,.55);
        }
        .references-carousel-page .reference-card img {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          object-position: top;
          background: #f1f5f9;
        }
        .references-carousel-page .reference-copy { padding: 18px; }
        .references-carousel-page .reference-copy h3 { margin: 0 0 4px; font-size: 16px; }
        .references-carousel-page .reference-copy p { margin: 0; color: #64748b; font-size: 14px; }
        .references-carousel-page .reference-copy span {
          display: inline-block;
          margin-top: 12px;
          color: #0e7490;
          font-size: 13px;
        }
        .references-carousel-page .empty-reference {
          margin: 0;
          border: 1px dashed #dbe5ee;
          border-radius: 12px;
          padding: 18px;
          color: #64748b;
        }
        @media (max-width: 900px) {
          .references-carousel-page .reference-groups { grid-template-columns: 1fr; gap: 18px; }
        }
        @media (max-width: 767px) {
          .references-carousel-page { padding: 24px 20px 54px; }
          .references-carousel-page .page-heading { margin-bottom: 28px; }
          .references-carousel-page .reference-section { padding: 15px; }
          .references-carousel-page .reference-heading { margin-bottom: 13px; }
          .references-carousel-page .reference-heading h2 { font-size: 18px; }
          .references-carousel-page .reference-carousel-button { width: 32px; height: 32px; }
          .references-carousel-page .reference-copy { padding: 12px; }
          .references-carousel-page .reference-card h3 { font-size: 14px; }
          .references-carousel-page .reference-copy p { font-size: 12px; line-height: 1.45; }
          .references-carousel-page .reference-copy span { font-size: 12px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .references-carousel-page .reference-carousel-track { scroll-behavior: auto; }
          .references-carousel-page .reference-carousel-button,
          .references-carousel-page .reference-card { transition: none; }
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
        {groups.map((group, groupIndex) => {
          const activeIndex = activeIndexes[groupIndex] ?? 0;
          return (
            <section className="reference-section" key={group.category}>
              <div className="reference-heading">
                <h2>{group.title}</h2>
                <div className="reference-carousel-controls">
                  <button
                    aria-label={`Projet précédent dans la catégorie ${group.title}`}
                    className="reference-carousel-button"
                    disabled={activeIndex === 0}
                    onClick={() => move(groupIndex, -1)}
                    type="button"
                  >
                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                      <path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </button>
                  <span aria-live="polite" className="reference-carousel-status">
                    {activeIndex + 1} / {group.items.length}
                  </span>
                  <button
                    aria-label={`Projet suivant dans la catégorie ${group.title}`}
                    className="reference-carousel-button"
                    disabled={activeIndex >= group.items.length - 1}
                    onClick={() => move(groupIndex, 1)}
                    type="button"
                  >
                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                      <path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                aria-label={`Références — ${group.title}`}
                aria-roledescription="carrousel"
                className="reference-carousel-track"
                onScroll={() => updateIndex(groupIndex)}
                ref={(element) => { tracks.current[groupIndex] = element; }}
                role="region"
                tabIndex={0}
              >
                {group.items.map((item, index) => (
                  <div
                    aria-label={`${index + 1} sur ${group.items.length}`}
                    aria-roledescription="diapositive"
                    className="reference-slide"
                    key={item.title}
                    role="group"
                  >
                    <a
                      className="reference-card"
                      href={item.url}
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
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
