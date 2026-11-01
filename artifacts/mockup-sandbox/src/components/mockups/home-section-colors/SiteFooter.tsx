export default function SiteFooter() {
  return (
    <footer className="border-t py-4">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <a
            href="/"
            className="text-xl font-light tracking-wide bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent"
          >
            Innov Studio
          </a>
          <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-muted-foreground text-center">
            <p>© {new Date().getFullYear()} Innov Studio By Cyril Allegret · Création de sites web & applications sur mesure. Tous droits réservés.</p>
            <span className="hidden md:inline">·</span>
            <a
              href="https://www.jesuisnumerique.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              data-testid="link-partenaire-jesuisnumerique"
            >
              jesuisnumerique.fr
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
