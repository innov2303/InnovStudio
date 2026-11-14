import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { CSSProperties } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle, ArrowUpRight, Check, CircleHelp, Clock3, ExternalLink,
  Globe2, Loader2, Plus, RefreshCw, Rocket, Search, Settings2, ShieldCheck,
  Sparkles, Trash2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createDefaultInnovDevSiteContent } from "@shared/schema";
import type { InnovDevSite, InnovDevSiteContent } from "@shared/schema";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "./innov-dev.css";

type ClientProject = {
  id: string;
  title: string;
  projectType: string;
  status: string;
  sector: string | null;
};
type ReplitConnectionStatus = { connected: boolean; configured: boolean; connectedAt: string | null };
type SiteRecord = InnovDevSite & { projectTitle?: string };
type EditorValues = { projectId: string; siteName: string; content: InnovDevSiteContent };
type Filter = "all" | "draft" | "working" | "published" | "error";

const SITES_KEY = ["/api/innov-dev/sites"];
const PROJECTS_KEY = ["/api/innov-dev/projects"];
const CONNECTION_KEY = ["/api/innov-dev/replit/status"];

async function getJson<T>(url: string): Promise<T> {
  const response = await apiRequest("GET", url);
  return response.json() as Promise<T>;
}

function StatusPill({ site }: { site: SiteRecord }) {
  const labels: Record<string, string> = {
    draft: "Brouillon", creating_repl: "Création en cours", ready: "Prêt à publier",
    publishing: "Publication en cours", published: "Publié", error: "À vérifier",
  };
  const tones: Record<string, string> = {
    draft: "draft", creating_repl: "working", ready: "ready",
    publishing: "working", published: "published", error: "error",
  };
  return <span className={`id-status id-status--${tones[site.status] || "draft"}`}><i />{labels[site.status] || site.status}</span>;
}

function formatDate(value: Date | string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("fr-FR") : "—";
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <div className="id-field"><Label>{label}</Label>{children}{hint && <p className="id-hint">{hint}</p>}</div>;
}

function SitePreview({ values, onBack }: { values: EditorValues; onBack: () => void }) {
  const [activePage, setActivePage] = useState<"home" | "services" | "about" | "contact">("home");
  const content = values.content;
  const accent = /^#[\da-f]{6}$/i.test(content.primaryColor) ? content.primaryColor : "#2563eb";
  const heroImage = (() => {
    try {
      const url = new URL(content.heroImageUrl);
      return url.protocol === "https:" ? url.toString() : "";
    } catch {
      return "";
    }
  })();
  return <div className="id-preview-shell">
    <div className="id-preview-toolbar">
      <span>Aperçu du modèle vitrine</span>
      <Button variant="outline" size="sm" type="button" onClick={onBack}>Retour à l’édition</Button>
    </div>
    <div className="id-preview-page" style={{ "--preview-accent": accent } as CSSProperties}>
      <nav className="id-preview-nav">
        <strong>{content.brandName || values.siteName}</strong>
        <div>{([
          ["home", "Accueil"],
          ["services", "Services"],
          ["about", "À propos"],
          ["contact", "Contact"],
        ] as const).map(([page, label]) => <button key={page} type="button" aria-current={activePage === page ? "page" : undefined}
          onClick={() => setActivePage(page)}>{label}</button>)}</div>
      </nav>
      {activePage === "home" && <section className="id-preview-hero" style={heroImage ? { backgroundImage: `linear-gradient(90deg, rgba(8,20,39,.83), rgba(8,20,39,.18)), url("${heroImage}")` } : undefined}>
        <span>{content.tagline || content.brandName}</span>
        <h2>{content.heroTitle || "Votre activité, présentée clairement"}</h2>
        <p>{content.heroDescription}</p>
        <button type="button" onClick={() => setActivePage("contact")}>Nous contacter</button>
      </section>}
      {activePage === "services" && <section className="id-preview-services">
        <span className="id-preview-kicker">NOS SERVICES</span><h3>{content.servicesTitle}</h3>
        <div>{content.services.map((service, index) => <article key={`${service.title}-${index}`}><b>0{index + 1}</b><h4>{service.title}</h4><p>{service.description}</p></article>)}</div>
      </section>}
      {activePage === "about" && <section className="id-preview-about"><div><span className="id-preview-kicker">NOTRE ENTREPRISE</span><h3>{content.aboutTitle}</h3></div><p>{content.aboutText}</p></section>}
      {activePage === "contact" && <section className="id-preview-contact"><div><span className="id-preview-kicker">PRENONS CONTACT</span><h3>{content.contactTitle}</h3></div><div>{content.contactEmail && <span>{content.contactEmail}</span>}{content.contactPhone && <span>{content.contactPhone}</span>}</div></section>}
      <footer>{content.footerText}</footer>
    </div>
  </div>;
}

export default function InnovDevSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editing, setEditing] = useState<SiteRecord | null>(null);
  const [syncTarget, setSyncTarget] = useState<SiteRecord | null>(null);
  const [values, setValues] = useState<EditorValues>(() => ({
    projectId: "", siteName: "", content: createDefaultInnovDevSiteContent(),
  }));
  const sitesQuery = useQuery<SiteRecord[]>({
    queryKey: SITES_KEY, queryFn: () => getJson("/api/innov-dev/sites"), staleTime: 0,
    refetchInterval: 6000,
  });
  const projectsQuery = useQuery<ClientProject[]>({
    queryKey: PROJECTS_KEY, queryFn: () => getJson("/api/innov-dev/projects"),
  });
  const connectionQuery = useQuery<ReplitConnectionStatus>({
    queryKey: CONNECTION_KEY, queryFn: () => getJson("/api/innov-dev/replit/status"), staleTime: 30_000,
  });
  const busy = (sitesQuery.data || []).some((site) => site.status === "creating_repl" || site.status === "publishing");
  useEffect(() => {
    if (busy) {
      const timer = window.setInterval(() => void sitesQuery.refetch(), 4500);
      return () => window.clearInterval(timer);
    }
  }, [busy, sitesQuery.refetch]);

  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; data: EditorValues }) => {
      const response = await apiRequest(payload.id ? "PATCH" : "POST",
        payload.id ? `/api/innov-dev/sites/${payload.id}` : "/api/innov-dev/sites",
        payload.id ? { siteName: payload.data.siteName, content: payload.data.content } : {
          ...payload.data, templateId: "showcase-v1",
        });
      return response.json() as Promise<SiteRecord>;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SITES_KEY });
      setEditorOpen(false);
    },
  });
  const actionMutation = useMutation({
    mutationFn: async ({ siteId, action }: { siteId: string; action: "create-repl" | "publish" | "sync" }) => {
      const response = await apiRequest("POST", `/api/innov-dev/sites/${siteId}/${action}`);
      return response.json();
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: SITES_KEY }); },
  });

  const sites = sitesQuery.data || [];
  const projects = projectsQuery.data || [];
  const filteredSites = useMemo(() => sites.filter((site) => {
    const matchesText = `${site.siteName} ${site.projectTitle || ""} ${site.content.brandName}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "working"
      ? ["creating_repl", "publishing", "ready"].includes(site.status)
      : site.status === filter);
    return matchesText && matchesFilter;
  }), [sites, search, filter]);
  const counts = useMemo(() => ({
    all: sites.length, draft: sites.filter((s) => s.status === "draft").length,
    working: sites.filter((s) => ["creating_repl", "publishing", "ready"].includes(s.status)).length,
    published: sites.filter((s) => s.status === "published").length,
    error: sites.filter((s) => s.status === "error").length,
  }), [sites]);

  const openCreate = () => {
    const firstProject = projects[0];
    setEditing(null);
    setPreviewOpen(false);
    setValues({
      projectId: firstProject?.id || "",
      siteName: firstProject?.title || "",
      content: createDefaultInnovDevSiteContent(firstProject?.title || "Votre entreprise"),
    });
    setEditorOpen(true);
  };
  const openEdit = (site: SiteRecord) => {
    setEditing(site);
    setPreviewOpen(false);
    setValues({ projectId: site.projectId, siteName: site.siteName, content: site.content });
    setEditorOpen(true);
  };
  const updateContent = (key: keyof InnovDevSiteContent, value: string) => {
    setValues((current) => ({ ...current, content: { ...current.content, [key]: value } }));
  };
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate({ id: editing?.id, data: values });
  };
  const runAction = (site: SiteRecord, action: "create-repl" | "publish" | "sync") => {
    actionMutation.mutate({ siteId: site.id, action });
    setSyncTarget(null);
  };

  return (
    <section className="innov-dev">
      <header className="id-topline">
        <div>
          <div className="id-eyebrow"><span className="id-mark">I</span> INNOV DEV <span className="id-eyebrow-rule" /> ESPACE PRIVÉ</div>
          <h1>Sites clients</h1>
          <p className="id-intro">Préparez les sites vitrines de vos clients, reliez leur projet Replit et suivez leur publication.</p>
        </div>
        <Button onClick={openCreate} disabled={projectsQuery.isLoading || projects.length === 0}>
          <Plus /> Nouveau site client
        </Button>
      </header>

      <div className="id-connection">
        <div className={`id-connection-icon ${connectionQuery.data?.connected ? "is-connected" : ""}`}>
          {connectionQuery.isLoading ? <Loader2 className="id-spin" /> : <Settings2 />}
        </div>
        <div className="id-connection-copy">
          <strong>Espace Replit</strong>
          <span>{connectionQuery.isLoading ? "Vérification de la connexion…" : connectionQuery.data?.connected
            ? `Connecté${connectionQuery.data.connectedAt ? ` · depuis le ${formatDate(connectionQuery.data.connectedAt)}` : ""}`
            : connectionQuery.data?.configured ? "Aucun compte connecté" : "La configuration OAuth est manquante"}</span>
        </div>
        <div className="id-connection-right">
          {connectionQuery.data?.connected
            ? <span className="id-connected"><ShieldCheck /> Connecté</span>
            : <Button variant="outline" size="sm" disabled={!connectionQuery.data?.configured}
              onClick={() => { window.location.href = "/api/innov-dev/replit/connect"; }}>
              Connecter Replit <ArrowUpRight />
            </Button>}
        </div>
      </div>
      {!connectionQuery.data?.configured && !connectionQuery.isLoading && <p className="id-setup-note">Configurez l’adresse de retour OAuth Replit sur le serveur avant de connecter un compte.</p>}
      {connectionQuery.isError && <InlineError text="Impossible de vérifier la connexion Replit." onRetry={() => void connectionQuery.refetch()} />}

      <div className="id-overview">
        <div className="id-overview-main">
          <div className="id-overview-label"><span className="id-live-dot" /> VUE D’ENSEMBLE</div>
          <div className="id-overview-number">{counts.all.toString().padStart(2, "0")}<span>sites suivis</span></div>
        </div>
        <div className="id-overview-stat"><span>En cours</span><strong>{counts.working.toString().padStart(2, "0")}</strong></div>
        <div className="id-overview-stat"><span>En ligne</span><strong>{counts.published.toString().padStart(2, "0")}</strong></div>
        <div className="id-overview-stat"><span>À vérifier</span><strong className={counts.error ? "id-attention-number" : ""}>{counts.error.toString().padStart(2, "0")}</strong></div>
        <div className="id-overview-note"><Sparkles /><span>Un projet Replit indépendant par site</span></div>
      </div>

      <div className="id-list-heading">
        <div><span className="id-section-kicker">PROJETS CLIENTS</span><h2>Sites suivis <span>{counts.all}</span></h2></div>
        <div className="id-tools">
          <div className="id-search"><Search /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un site" aria-label="Rechercher un site" /></div>
          <Button variant="outline" size="icon" aria-label="Actualiser les sites" onClick={() => void sitesQuery.refetch()}><RefreshCw className={sitesQuery.isFetching ? "id-spin" : ""} /></Button>
        </div>
      </div>
      <div className="id-filters" role="tablist" aria-label="Filtrer les sites">
        {(["all", "draft", "working", "published", "error"] as Filter[]).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={filter === key}
            className={filter === key ? "is-active" : ""} onClick={() => setFilter(key)}>
            {({ all: "Tous", draft: "Brouillons", working: "En cours", published: "Publiés", error: "À vérifier" } as Record<Filter, string>)[key]}
            <span>{counts[key]}</span>
          </button>
        ))}
      </div>

      {sitesQuery.isLoading ? <div className="id-skeleton-list" aria-label="Chargement des sites">
        {[0, 1, 2].map((item) => <div className="id-skeleton" key={item}><i /><span /><span /></div>)}
      </div> : sitesQuery.isError ? <InlineError text="The site list could not be loaded." onRetry={() => void sitesQuery.refetch()} /> :
        filteredSites.length === 0 ? <div className="id-empty">
          <div className="id-empty-symbol">{search || filter !== "all" ? <Search /> : <Globe2 />}</div>
          <div><h3>{search || filter !== "all" ? "Aucun site correspondant" : "Votre espace client est prêt"}</h3>
            <p>{search || filter !== "all" ? "Essayez une autre recherche ou un autre statut." : "Choisissez un projet client pour préparer son site vitrine et son application Replit."}</p></div>
          {!search && filter === "all" && <Button onClick={openCreate} disabled={projects.length === 0}><Plus /> Créer le premier site</Button>}
        </div> : <div className="id-site-list">
          {filteredSites.map((site) => {
            const actionBusy = (actionMutation.isPending && actionMutation.variables?.siteId === site.id) ||
              site.status === "creating_repl" || site.status === "publishing";
            return <article className="id-site-row" key={site.id}>
              <div className="id-site-monogram">{site.content.brandName.trim().slice(0, 1).toUpperCase() || "I"}</div>
              <div className="id-site-info">
                <div className="id-site-title-line"><h3>{site.siteName}</h3><StatusPill site={site} /></div>
                <p>{site.projectTitle || "Projet client"} <span>·</span> {site.content.tagline || "Modèle vitrine"}</p>
                <div className="id-site-meta">
                  {site.replitAppName && <span className="id-mono">{site.replitAppName}</span>}
                  <span><Clock3 /> Mis à jour le {formatDate(site.updatedAt)}</span>
                  {site.status === "published" && site.lastPublishedAt && <span>En ligne depuis le {formatDate(site.lastPublishedAt)}</span>}
                </div>
                {site.lastError && <p className="id-site-error"><AlertCircle /> {site.lastError}</p>}
              </div>
              <div className="id-site-actions">
                {site.publicUrl && <a className="id-link-button" href={site.publicUrl} target="_blank" rel="noreferrer">Voir le site <ExternalLink /></a>}
                {site.replitEditorUrl && <a className="id-link-button muted" href={site.replitEditorUrl} target="_blank" rel="noreferrer">Ouvrir Replit <ArrowUpRight /></a>}
                <Button variant="outline" size="sm" onClick={() => openEdit(site)} disabled={actionBusy}>Modifier le contenu</Button>
                {!site.replitAppId && (site.status === "draft" || site.status === "error") && <Button size="sm" onClick={() => runAction(site, "create-repl")}
                  disabled={actionBusy || !connectionQuery.data?.connected}>{actionBusy ? <Loader2 className="id-spin" /> : <Rocket />} Créer sur Replit</Button>}
                {site.replitAppId && <Button size="sm" onClick={() => runAction(site, "publish")} disabled={actionBusy}
                  title="Publier les modifications déjà faites dans l’application Replit">{actionBusy ? <Loader2 className="id-spin" /> : <Globe2 />} Publier les changements Replit</Button>}
                {site.replitAppId && <Button variant="outline" size="sm" onClick={() => setSyncTarget(site)} disabled={actionBusy}
                  title="Remplacer le code généré par le contenu Innov Dev puis publier"><RefreshCw /> Synchroniser et publier</Button>}
              </div>
            </article>;
          })}
        </div>}
      {actionMutation.isError && <InlineError text={actionMutation.error.message || "Impossible de lancer l’action demandée."} onRetry={() => actionMutation.reset()} />}
      {saveMutation.isError && <InlineError text={saveMutation.error.message || "Impossible d’enregistrer les modifications."} onRetry={() => saveMutation.reset()} />}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="id-editor-dialog">
          <DialogHeader>
            <div className="id-section-kicker">{editing ? "PARAMÈTRES DU SITE" : "NOUVEAU SITE CLIENT"}</div>
            <DialogTitle>{previewOpen ? "Aperçu du site" : editing ? "Modifier le contenu vitrine" : "Préparer un site vitrine"}</DialogTitle>
            <DialogDescription>{previewOpen ? "Aperçu indicatif du modèle avec les contenus saisis." : "Modifiez les contenus structurés qui alimenteront le site du client."}</DialogDescription>
          </DialogHeader>
          {previewOpen ? <SitePreview values={values} onBack={() => setPreviewOpen(false)} /> : <form className="id-editor-form" onSubmit={save}>
            {!editing && <Field label="Projet client">
              <select className="id-select" value={values.projectId} required onChange={(event) => {
                const project = projects.find((item) => item.id === event.target.value);
                setValues((current) => ({ ...current, projectId: event.target.value,
                  siteName: project?.title || current.siteName,
                  content: createDefaultInnovDevSiteContent(project?.title || current.content.brandName) }));
              }}>
                <option value="" disabled>Choisir un projet</option>
                {projects.map((project) =>
                  <option value={project.id} key={project.id}>{project.title} · {project.sector || project.projectType}</option>)}
              </select>
            </Field>}
            <div className="id-editor-grid">
              <Field label="Nom du site"><Input required minLength={2} maxLength={120} value={values.siteName}
                onChange={(event) => setValues((current) => ({ ...current, siteName: event.target.value }))} /></Field>
              <Field label="Nom de l’entreprise"><Input required value={values.content.brandName}
                onChange={(event) => updateContent("brandName", event.target.value)} /></Field>
            </div>
            <Field label="Phrase d’accroche"><Input value={values.content.tagline} onChange={(event) => updateContent("tagline", event.target.value)} /></Field>
            <div className="id-editor-grid">
              <Field label="Titre principal"><Input required value={values.content.heroTitle} onChange={(event) => updateContent("heroTitle", event.target.value)} /></Field>
              <Field label="Couleur principale" hint="Code hexadécimal sur six caractères, par exemple #2563eb">
                <div className="id-color-input"><input type="color" value={/^#[\da-f]{6}$/i.test(values.content.primaryColor) ? values.content.primaryColor : "#2563eb"}
                  onChange={(event) => updateContent("primaryColor", event.target.value)} /><Input value={values.content.primaryColor}
                  pattern="^#[\\da-fA-F]{6}$" onChange={(event) => updateContent("primaryColor", event.target.value)} /></div>
              </Field>
            </div>
            <Field label="Description principale"><Textarea rows={3} value={values.content.heroDescription}
              onChange={(event) => updateContent("heroDescription", event.target.value)} /></Field>
            <Field label="Adresse de l’image principale" hint="Facultatif · l’adresse doit commencer par HTTPS"><Input type="url" placeholder="https://…" value={values.content.heroImageUrl}
              onChange={(event) => updateContent("heroImageUrl", event.target.value)} /></Field>
            <Field label="Titre de la section services"><Input required value={values.content.servicesTitle} onChange={(event) => updateContent("servicesTitle", event.target.value)} /></Field>
            <div className="id-services-editor">
              {values.content.services.map((service, index) => <div className="id-service-edit-row" key={index}>
                <Field label={`Service ${index + 1} — titre`}><Input required maxLength={100} value={service.title}
                  onChange={(event) => setValues((current) => ({ ...current, content: { ...current.content, services: current.content.services.map((item, i) => i === index ? { ...item, title: event.target.value } : item) } }))} /></Field>
                <Field label="Description"><Input maxLength={500} value={service.description}
                  onChange={(event) => setValues((current) => ({ ...current, content: { ...current.content, services: current.content.services.map((item, i) => i === index ? { ...item, description: event.target.value } : item) } }))} /></Field>
                <Button type="button" variant="ghost" size="icon" aria-label={`Supprimer le service ${index + 1}`}
                  onClick={() => setValues((current) => ({ ...current, content: { ...current.content, services: current.content.services.filter((_, i) => i !== index) } }))}>
                  <Trash2 />
                </Button>
              </div>)}
              <Button type="button" variant="outline" size="sm" disabled={values.content.services.length >= 8}
                onClick={() => setValues((current) => ({ ...current, content: { ...current.content, services: [...current.content.services, { title: "Nouveau service", description: "" }] } }))}>
                <Plus /> Ajouter un service
              </Button>
            </div>
            <Field label="Titre de la section À propos"><Input required value={values.content.aboutTitle} onChange={(event) => updateContent("aboutTitle", event.target.value)} /></Field>
            <Field label="Présentation de l’entreprise"><Textarea rows={3} value={values.content.aboutText} onChange={(event) => updateContent("aboutText", event.target.value)} /></Field>
            <div className="id-editor-grid">
              <Field label="Titre de la section contact"><Input required value={values.content.contactTitle} onChange={(event) => updateContent("contactTitle", event.target.value)} /></Field>
              <Field label="Adresse e-mail"><Input type="email" value={values.content.contactEmail} onChange={(event) => updateContent("contactEmail", event.target.value)} /></Field>
            </div>
            <div className="id-editor-grid">
              <Field label="Téléphone"><Input value={values.content.contactPhone} onChange={(event) => updateContent("contactPhone", event.target.value)} /></Field>
              <Field label="Texte du pied de page"><Input value={values.content.footerText} onChange={(event) => updateContent("footerText", event.target.value)} /></Field>
            </div>
            <div className="id-form-footer">
              <span><CircleHelp /> Modèle : site vitrine v1</span>
              <div><Button variant="outline" type="button" onClick={() => { setPreviewOpen(true); }}>Aperçu</Button>
                <Button variant="outline" type="button" onClick={() => setEditorOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saveMutation.isPending || !values.projectId && !editing}>
                  {saveMutation.isPending ? <Loader2 className="id-spin" /> : <Check />}
                  {editing ? "Enregistrer" : "Créer le site"}
                </Button></div>
            </div>
          </form>}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!syncTarget} onOpenChange={(open) => !open && setSyncTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remplacer le contenu du site Replit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action met à jour le site <strong>{syncTarget?.siteName}</strong> à partir des contenus Innov Dev, puis le publie. Les modifications de code faites directement dans Replit peuvent être remplacées. Pour publier ces modifications sans les remplacer, utilisez « Publier les changements Replit ».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Conserver le site actuel</AlertDialogCancel>
            <AlertDialogAction onClick={() => syncTarget && runAction(syncTarget, "sync")}>Synchroniser et publier</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function InlineError({ text, onRetry }: { text: string; onRetry: () => void }) {
  return <div className="id-inline-error" role="alert"><AlertCircle /><span>{text}</span>
    <Button variant="outline" size="sm" onClick={onRetry}>Réessayer</Button></div>;
}
