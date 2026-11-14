import React from "react";
import { ArrowUpRight, Check, Compass, FileText, Image, Palette, PanelsTopLeft, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InnovDevModulesSectionProps = {
  onOpenBuilder: () => void;
};

const pages = [
  { name: "Accueil", detail: "Une page d’entrée pour présenter l’activité et sa promesse.", icon: PanelsTopLeft },
  { name: "Services", detail: "Une liste de prestations que vous pouvez adapter au client.", icon: Sparkles },
  { name: "À propos", detail: "Un espace pour raconter l’entreprise et son approche.", icon: Compass },
  { name: "Contact", detail: "Les coordonnées du client et les moyens de le joindre.", icon: Phone },
];

const capabilities = [
  { title: "Textes et prestations", detail: "Personnalisez les contenus éditables du modèle et la liste de services.", icon: FileText },
  { title: "Identité visuelle", detail: "Définissez la couleur de marque et l’image HTTPS du site.", icon: Palette },
  { title: "Coordonnées", detail: "Renseignez les contacts affichés dans le site vitrine.", icon: Phone },
  { title: "Aperçu et publication", detail: "Prévisualisez le résultat, créez le projet Replit puis publiez-le.", icon: Image },
];

export default function InnovDevModulesSection({ onOpenBuilder }: InnovDevModulesSectionProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-10">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-8 sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-primary/5" />
        <div className="relative max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Innov Studio Dev / Référence</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Modules et addons</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Retrouvez les fonctionnalités du modèle vitrine pour préparer les sites de vos clients.
            Ce catalogue présente les éléments intégrés aujourd’hui; l’installation d’addons personnalisés reste à venir.
          </p>
          <Button onClick={onOpenBuilder} className="mt-6">
            Ouvrir la création de sites <ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
      </header>

      <section aria-labelledby="template-pages-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Le modèle intégré</p>
            <h2 id="template-pages-heading" className="mt-1 text-xl font-semibold tracking-tight">Quatre pages, un point de départ clair</h2>
          </div>
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">Inclus dans le modèle</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pages.map(({ name, detail, icon: Icon }, index) => (
            <Card key={name} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="font-semibold">{name}</h3>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader className="pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ce que vous pouvez préparer</p>
            <CardTitle className="text-xl">Les fonctionnalités incluses</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {capabilities.map(({ title, detail, icon: Icon }) => (
              <div key={title} className="flex gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <aside className="rounded-xl border border-dashed border-border bg-muted/30 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Check aria-hidden="true" className="h-4 w-4 text-primary" />
            Aujourd’hui
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            La création, l’aperçu et la publication passent par l’espace de création de sites.
          </p>
          <div className="my-5 h-px bg-border" />
          <p className="text-sm font-semibold">Et ensuite ?</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Les modules et addons personnalisés ne sont pas encore configurés ici. Ils pourront enrichir ce catalogue lors d’une prochaine évolution.
          </p>
          <Button variant="outline" onClick={onOpenBuilder} className="mt-5 w-full">
            Aller à la création <ArrowUpRight aria-hidden="true" />
          </Button>
        </aside>
      </section>
    </div>
  );
}
