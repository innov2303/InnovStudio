import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowUpRight, Clock3, ExternalLink, Globe2, RefreshCw, Rocket } from "lucide-react";
import type { InnovDevSite } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SiteRecord = InnovDevSite & { projectTitle?: string };
type InnovProdSectionProps = {
  onOpenBuilder: () => void;
};

const sitesQueryKey = ["/api/innov-dev/sites"];

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  creating_repl: "Création Replit en cours",
  ready: "Prêt à publier",
  publishing: "Publication en cours",
  published: "Publié",
  error: "À vérifier",
};

function safeExternalUrl(value: string | null | undefined, editor = false) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (editor) {
      return url.protocol === "https:" && (url.hostname === "replit.com" || url.hostname.endsWith(".replit.com"))
        ? url.href
        : undefined;
    }
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function displayDate(value: Date | string | null | undefined) {
  if (!value) return "Aucune date enregistrée";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date non disponible"
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function getSiteStatusTone(status: string) {
  if (status === "published") return "border-primary/25 bg-primary/10 text-primary";
  if (status === "error") return "border-destructive/25 bg-destructive/10 text-destructive";
  if (status === "creating_repl" || status === "publishing") return "border-amber-600/25 bg-amber-500/10 text-amber-800 dark:text-amber-300";
  return "border-border bg-muted text-muted-foreground";
}

export default function InnovProdSection({ onOpenBuilder }: InnovProdSectionProps) {
  const sitesQuery = useQuery<SiteRecord[]>({
    queryKey: sitesQueryKey,
    queryFn: async () => (await apiRequest("GET", "/api/innov-dev/sites")).json(),
    staleTime: 0,
  });
  const sites = sitesQuery.data ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <header className="flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Innov Studio Prod / Préparation</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sites clients</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Registre des sites préparés dans Innov Dev. Les statuts et liens ci-dessous reflètent les informations enregistrées,
            pas une vérification en direct de disponibilité.
          </p>
        </div>
        <Button variant="outline" onClick={() => void sitesQuery.refetch()} disabled={sitesQuery.isFetching}>
          <RefreshCw aria-hidden="true" className={sitesQuery.isFetching ? "animate-spin" : ""} />
          {sitesQuery.isFetching ? "Actualisation…" : "Actualiser"}
        </Button>
      </header>

      <div role="note" className="flex items-start gap-3 rounded-xl border border-amber-700/20 bg-amber-500/[0.07] p-4">
        <Clock3 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
        <div>
          <p className="text-sm font-semibold">La supervision n’est pas encore active</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Aucun contrôle de disponibilité, mesure de latence ou sonde de santé n’est effectué ici.
          </p>
        </div>
      </div>

      {sitesQuery.isLoading ? (
        <div aria-label="Chargement des sites clients" className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="animate-pulse rounded-xl border border-border bg-card p-5">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="mt-4 h-3 w-2/3 rounded bg-muted" />
              <div className="mt-5 h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : sitesQuery.isError ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="font-semibold">Impossible de charger le registre</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                La liste des sites enregistrés n’est pas disponible pour le moment. Réessayez dans un instant.
              </p>
            </div>
            <Button variant="outline" onClick={() => void sitesQuery.refetch()}>
              <RefreshCw aria-hidden="true" /> Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : sites.length === 0 ? (
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Globe2 aria-hidden="true" className="h-7 w-7" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Registre vide</p>
            <h2 className="mt-2 text-xl font-semibold">Les sites créés apparaîtront ici</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Préparez un site client dans Innov Dev pour retrouver ici son état de publication enregistré et ses liens.
            </p>
            <Button onClick={onOpenBuilder} className="mt-6"><Rocket aria-hidden="true" /> Ouvrir la création de sites</Button>
          </CardContent>
        </Card>
      ) : (
        <section aria-label="Registre des sites clients" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold">Registre</h2>
            <span className="text-sm text-muted-foreground">{sites.length} {sites.length === 1 ? "site" : "sites"}</span>
          </div>
          {sites.map((site) => {
            const publicUrl = safeExternalUrl(site.publicUrl);
            const editorUrl = safeExternalUrl(site.replitEditorUrl, true);
            const status = statusLabels[site.status] ?? "Statut enregistré";
            return (
              <Card key={site.id} className="min-w-0 overflow-hidden">
                <CardContent className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.7fr)]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                        <Globe2 aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-base font-semibold">{site.siteName}</h3>
                        <p className="mt-0.5 break-words text-sm text-muted-foreground">
                          {site.projectTitle || site.content.brandName || "Projet client"}
                          {site.templateId ? <span> · Modèle {site.templateId}</span> : null}
                        </p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 ${getSiteStatusTone(site.status)}`}>{status}</Badge>
                    </div>
                    {site.lastError && (
                      <p className="mt-4 flex items-start gap-2 break-words rounded-lg bg-destructive/[0.07] p-3 text-sm text-destructive">
                        <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> {site.lastError}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-3 lg:border-l lg:border-border lg:pl-5">
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        <Clock3 aria-hidden="true" className="h-3.5 w-3.5" /> Dates enregistrées
                      </p>
                      <p className="break-words text-foreground">
                        <span className="text-muted-foreground">Dernière publication : </span>{displayDate(site.lastPublishedAt)}
                      </p>
                      <p className="break-words text-foreground">
                        <span className="text-muted-foreground">Mise à jour : </span>{displayDate(site.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {publicUrl && (
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                          <span className="break-all">Site public</span>
                        </a>
                      )}
                      {editorUrl && (
                        <a
                          href={editorUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                          <span className="break-all">Ouvrir Replit</span>
                        </a>
                      )}
                      {!publicUrl && !editorUrl && (
                        <span className="text-xs text-muted-foreground">Aucun lien disponible</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
