import "./_group.css";

export function FormulaCardsCurrent() {
  return (
    <div className="formula-current">
      <style>{`
        .formula-current {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 32px;
          background: linear-gradient(145deg, #fff 0%, #f5fbff 100%);
          color: #0f172a;
          font: 16px/1.65 Inter, ui-sans-serif, system-ui, sans-serif;
        }
        .formula-current * { box-sizing: border-box; }
        .formula-current .journey {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 64px minmax(0, 1fr);
          align-items: start;
          gap: 14px;
          width: min(960px, 100%);
          margin: 0 auto;
        }
        .formula-current .journey-option { min-width: 0; }
        .formula-current .journey-stage {
          padding: 22px 24px;
          border: 1px solid #dce7ed;
          border-radius: 18px;
          background: rgba(255,255,255,.9);
          box-shadow: 0 10px 26px rgba(15,60,90,.055);
          transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;
        }
        .formula-current .journey-stage:hover {
          transform: translateY(-3px);
          border-color: rgba(14,116,144,.3);
          box-shadow: 0 15px 30px rgba(15,60,90,.09);
        }
        .formula-current .journey-stage-next {
          border-color: rgba(37,99,235,.2);
          background: linear-gradient(130deg,#f0f9fb,#f1f5ff);
        }
        .formula-current .journey-stage-top { display: flex; align-items: center; gap: 13px; }
        .formula-current .journey-number {
          display: grid;
          place-items: center;
          flex: 0 0 42px;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #e7f4f7;
          color: #0e7490;
          font-weight: 700;
          font-size: 14px;
        }
        .formula-current .journey-stage-next .journey-number { background: #e9efff; color: #2563eb; }
        .formula-current .journey-label {
          margin: 0 0 3px;
          color: #64788b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .formula-current .journey-stage h2 { margin: 0; font-size: 18px; line-height: 1.3; }
        .formula-current .journey-description { margin: 14px 0 0; color: #475569; font-size: 14px; line-height: 1.55; }
        .formula-current .journey-connector {
          position: relative;
          display: grid;
          place-items: center;
          align-self: start;
          height: 34px;
          margin-top: 54px;
          color: #0e7490;
        }
        .formula-current .journey-connector::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 1px;
          background: linear-gradient(transparent,#8cbecb,transparent);
        }
        .formula-current .journey-connector::after {
          content: "→";
          position: relative;
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(14,116,144,.16);
          border-radius: 50%;
          background: #f7fcfd;
          font-size: 19px;
          line-height: 1;
        }
        @media (max-width: 700px) {
          .formula-current { padding: 24px 18px; }
          .formula-current .journey { grid-template-columns: 1fr; gap: 9px; }
          .formula-current .journey-stage { padding: 19px 20px; }
          .formula-current .journey-connector { height: 30px; margin-top: 0; }
          .formula-current .journey-connector::after { content: "↓"; width: 30px; height: 30px; font-size: 18px; }
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
