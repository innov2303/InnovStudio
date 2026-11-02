import "./_group.css";

export function FormulaCardsStyled() {
  return (
    <div className="formula-styled">
      <style>{`
        .formula-styled {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 32px;
          background:
            radial-gradient(ellipse at 8% 8%, rgba(62, 167, 211, .09), transparent 38%),
            linear-gradient(145deg, #fff 0%, #f2f8ff 100%);
          color: #10263b;
          font: 16px/1.65 Inter, ui-sans-serif, system-ui, sans-serif;
        }
        .formula-styled * { box-sizing: border-box; }
        .formula-styled .journey {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 58px minmax(0, 1fr);
          align-items: stretch;
          gap: 14px;
          width: min(960px, 100%);
          margin: 0 auto;
        }
        .formula-styled .journey-option { min-width: 0; }
        .formula-styled .journey-stage {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          min-height: 202px;
          padding: 27px 27px 25px;
          border: 1px solid #cfe1ef;
          border-radius: 21px;
          background: linear-gradient(140deg, #fff 0%, #f4faff 48%, #eaf5ff 100%);
          box-shadow: 0 14px 36px rgba(24, 71, 110, .10), inset 0 1px 0 rgba(255,255,255,.95);
          transition: transform .24s ease, border-color .24s ease, box-shadow .24s ease;
        }
        .formula-styled .journey-stage::before {
          content: "";
          position: absolute;
          z-index: 0;
          top: 20px;
          bottom: 20px;
          left: 0;
          width: 4px;
          border-radius: 0 4px 4px 0;
          background: linear-gradient(180deg, #24b8c7, #4b80e7);
        }
        .formula-styled .journey-stage::after {
          content: "";
          position: absolute;
          z-index: 0;
          top: -76px;
          right: -58px;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(74, 158, 229, .17), rgba(74, 158, 229, 0) 70%);
          pointer-events: none;
        }
        .formula-styled .journey-stage:hover {
          transform: translateY(-4px);
          border-color: rgba(14,116,144,.38);
          box-shadow: 0 20px 42px rgba(24,71,110,.14), inset 0 1px 0 rgba(255,255,255,.95);
        }
        .formula-styled .journey-stage-next {
          border-color: #c6d5f0;
          background: linear-gradient(140deg, #effbff 0%, #f0f5ff 52%, #e8edff 100%);
        }
        .formula-styled .journey-stage-next::before { background: linear-gradient(180deg, #10a9b6, #3468d3); }
        .formula-styled .journey-stage-next::after {
          top: auto;
          right: -46px;
          bottom: -105px;
          width: 230px;
          height: 230px;
          background: radial-gradient(circle, rgba(75, 110, 225, .17), rgba(75, 110, 225, 0) 70%);
        }
        .formula-styled .journey-stage-top { position: relative; z-index: 1; display: flex; align-items: center; gap: 15px; }
        .formula-styled .journey-number {
          display: grid;
          place-items: center;
          flex: 0 0 50px;
          width: 50px;
          height: 50px;
          border: 1px solid rgba(23, 121, 161, .14);
          border-radius: 15px;
          background: linear-gradient(145deg, #dcf5fa, #e4edff);
          color: #116e91;
          box-shadow: 0 7px 16px rgba(24, 100, 142, .13);
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -.03em;
        }
        .formula-styled .journey-stage-next .journey-number {
          border-color: transparent;
          background: linear-gradient(145deg, #12a9b8, #3768d5);
          color: #fff;
          box-shadow: 0 8px 18px rgba(47, 103, 207, .25);
        }
        .formula-styled .journey-label {
          display: inline-flex;
          align-items: center;
          min-height: 23px;
          margin: 0 0 5px;
          padding: 3px 9px;
          border: 1px solid rgba(14, 116, 144, .12);
          border-radius: 999px;
          background: rgba(255,255,255,.78);
          color: #0e7490;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .09em;
          line-height: 1.2;
          text-transform: uppercase;
        }
        .formula-styled .journey-stage-next .journey-label {
          border-color: rgba(55,104,213,.13);
          color: #3263c6;
        }
        .formula-styled .journey-stage h2 {
          margin: 0;
          color: #10263b;
          font-size: 20px;
          font-weight: 750;
          letter-spacing: -.035em;
          line-height: 1.25;
        }
        .formula-styled .journey-description {
          position: relative;
          z-index: 1;
          max-width: 390px;
          margin: 17px 0 0 65px;
          color: #50677c;
          font-size: 14px;
          line-height: 1.65;
        }
        .formula-styled .journey-connector {
          position: relative;
          display: grid;
          place-items: center;
          align-self: center;
          color: #fff;
        }
        .formula-styled .journey-connector::before {
          content: "";
          position: absolute;
          right: -7px;
          left: -7px;
          height: 1px;
          background: linear-gradient(90deg, rgba(25,150,177,.06), rgba(25,150,177,.45), rgba(55,104,213,.3), rgba(55,104,213,.05));
        }
        .formula-styled .journey-connector::after {
          content: "→";
          position: relative;
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(37,99,235,.18);
          border-radius: 50%;
          background: linear-gradient(145deg, #fff, #eaf5ff);
          color: #167f9e;
          box-shadow: 0 8px 19px rgba(25,89,131,.12);
          font-size: 20px;
          line-height: 1;
        }
        @media (max-width: 700px) {
          .formula-styled { padding: 24px 18px; }
          .formula-styled .journey { grid-template-columns: 1fr; gap: 9px; }
          .formula-styled .journey-stage { min-height: 0; padding: 22px 20px 21px; }
          .formula-styled .journey-stage-top { gap: 12px; }
          .formula-styled .journey-number { flex-basis: 44px; width: 44px; height: 44px; border-radius: 13px; }
          .formula-styled .journey-stage h2 { font-size: 18px; }
          .formula-styled .journey-description { margin: 13px 0 0 56px; font-size: 13px; }
          .formula-styled .journey-connector { height: 38px; }
          .formula-styled .journey-connector::before { top: -5px; bottom: -5px; left: 50%; width: 1px; height: auto; }
          .formula-styled .journey-connector::after { content: "↓"; width: 32px; height: 32px; font-size: 17px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .formula-styled *, .formula-styled *::before, .formula-styled *::after { transition-duration: .01ms !important; }
        }
      `}</style>
      <section className="journey" aria-label="Les étapes de votre solution web">
        <div className="journey-option">
          <article className="journey-stage">
            <div className="journey-stage-top">
              <span className="journey-number" aria-hidden="true">01</span>
              <div>
                <p className="journey-label">Point de départ</p>
                <h2>Site vitrine professionnel</h2>
              </div>
            </div>
            <p className="journey-description">Des pages adaptées à votre activité, une présentation claire de vos services et des bases SEO solides.</p>
          </article>
        </div>
        <span className="journey-connector" aria-hidden="true" />
        <div className="journey-option">
          <article className="journey-stage journey-stage-next">
            <div className="journey-stage-top">
              <span className="journey-number" aria-hidden="true">02</span>
              <div>
                <p className="journey-label">Quand vos besoins grandissent</p>
                <h2>Application web métier</h2>
              </div>
            </div>
            <p className="journey-description">Des fonctionnalités ajoutées progressivement, puis un outil conçu autour de vos processus.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
