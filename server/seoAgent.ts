import cron from "node-cron";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { seoReports, pageVisits, references } from "../shared/schema";
import { desc, eq, gte, sql } from "drizzle-orm";
import { sendSeoReportEmail } from "./email";
import {
  getSeoPageAuditData,
  seoPages,
  withSeoMetadata,
  type SeoMetadataOverride,
  type SeoPageAuditData,
} from "./seoPages";

// ─── SEO scoring helpers ────────────────────────────────────────────────────

export interface SeoSuggestion {
  id: string;
  type: "title" | "description" | "keywords" | "structure" | "performance" | "content" | "canonical" | "indexability";
  priority: "high" | "medium" | "low";
  current: string;
  suggested: string;
  reason: string;
  field?: string; // html field to update if applicable
  urls?: string[];
  currentByUrl?: Record<string, string>;
}

interface SeoAnalysisResult {
  score: number;
  suggestions: SeoSuggestion[];
  trendingKeywords: string[];
  visitStats: Record<string, any>;
}

const CURRENT_META = {
  title: "Sites web et applications sur mesure | Innov Studio",
  description:
    "Créez un site web professionnel et faites-le évoluer vers des fonctionnalités métier ou une application web sur mesure, au rythme de votre entreprise.",
  keywords:
    "création site web professionnel, développeur web freelance, agence web sur mesure, site internet professionnel, application web métier, intégration IA, agent IA pour site web, automatisation web IA, React, Node.js, développement sur mesure, Progressive Web App, refonte site web, maintenance site web",
};

export type SeoAppliedChange = {
  applicationId: string;
  suggestionId: string;
  url: string;
  field: "title" | "description";
  value: string;
  previousValue: string;
  appliedAt: string;
  undoneAt?: string;
};

export function parseAppliedSeoChanges(raw: unknown): SeoAppliedChange[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SeoAppliedChange => {
      return (
        item !== null &&
        typeof item === "object" &&
        typeof item.applicationId === "string" &&
        typeof item.suggestionId === "string" &&
        typeof item.url === "string" &&
        (item.field === "title" || item.field === "description") &&
        typeof item.value === "string" &&
        typeof item.previousValue === "string" &&
        typeof item.appliedAt === "string" &&
        (item.undoneAt === undefined || typeof item.undoneAt === "string")
      );
    });
  } catch {
    return [];
  }
}

export function getActiveSeoMetadataOverrides(
  changes: SeoAppliedChange[],
): Record<string, SeoMetadataOverride> {
  const overrides = Object.create(null) as Record<string, SeoMetadataOverride>;
  for (const change of changes) {
    if (change.undoneAt) continue;
    overrides[change.url] ??= {};
    overrides[change.url][change.field] = change.value;
  }
  return overrides;
}

export async function getAppliedSeoMetadataOverrides() {
  try {
    const report = await getLatestReport();
    return getActiveSeoMetadataOverrides(parseAppliedSeoChanges(report?.appliedSuggestions));
  } catch (error) {
    console.error("[SEO Agent] Unable to load applied metadata overrides:", error);
    return {};
  }
}

function getBaseMetadataValue(url: string, field: "title" | "description"): string | null {
  if (url === "/") return CURRENT_META[field];
  const page = seoPages.find((candidate) => candidate.path === url);
  return page?.[field] ?? null;
}

function parseReportSuggestions(raw: string): SeoSuggestion[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SeoSuggestion => {
      if (!item || typeof item !== "object") return false;
      const suggestion = item as Partial<SeoSuggestion>;
      return (
        typeof suggestion.id === "string" &&
        typeof suggestion.type === "string" &&
        typeof suggestion.current === "string" &&
        typeof suggestion.suggested === "string" &&
        Array.isArray(suggestion.urls) &&
        suggestion.urls.every((url) => typeof url === "string")
      );
    });
  } catch {
    return [];
  }
}

type SeoActionResult =
  | { success: true; applicationId?: string }
  | { success: false; status: number; message: string };

export async function applySeoSuggestion(input: {
  reportId: string;
  suggestionId: string;
  url: string;
}): Promise<SeoActionResult> {
  const report = await getLatestReport();
  if (!report) return { success: false, status: 404, message: "Aucun rapport SEO disponible." };
  if (report.id !== input.reportId) {
    return { success: false, status: 409, message: "Ce rapport n’est plus à jour. Relancez l’analyse." };
  }

  const suggestion = parseReportSuggestions(report.suggestions).find(
    (candidate) => candidate.id === input.suggestionId,
  );
  if (!suggestion) return { success: false, status: 404, message: "Suggestion introuvable." };
  if (
    (suggestion.field !== "title" && suggestion.field !== "description") ||
    (suggestion.type !== "title" && suggestion.type !== "description") ||
    !suggestion.urls?.includes(input.url)
  ) {
    return {
      success: false,
      status: 400,
      message: "Seuls les titres et descriptions associés à cette page peuvent être appliqués.",
    };
  }

  const value = suggestion.suggested?.trim();
  if (!value || value.length > (suggestion.field === "title" ? 200 : 500)) {
    return { success: false, status: 400, message: "La valeur proposée est invalide." };
  }

  const changes = parseAppliedSeoChanges(report.appliedSuggestions);
  const overrides = getActiveSeoMetadataOverrides(changes);
  const currentValue =
    overrides[input.url]?.[suggestion.field] ??
    getBaseMetadataValue(input.url, suggestion.field);
  const expectedValue = suggestion.currentByUrl?.[input.url] ?? suggestion.current;
  if (currentValue === null || currentValue !== expectedValue) {
    return {
      success: false,
      status: 409,
      message: "La métadonnée a changé depuis cette analyse. Relancez l’analyse avant de l’appliquer.",
    };
  }

  if (value === currentValue) {
    return { success: false, status: 409, message: "Cette suggestion est déjà appliquée." };
  }

  const applicationId = randomUUID();
  changes.push({
    applicationId,
    suggestionId: suggestion.id,
    url: input.url,
    field: suggestion.field,
    value,
    previousValue: currentValue,
    appliedAt: new Date().toISOString(),
  });
  await db
    .update(seoReports)
    .set({ appliedSuggestions: JSON.stringify(changes) })
    .where(eq(seoReports.id, report.id));

  return { success: true, applicationId };
}

export async function undoSeoSuggestion(input: {
  reportId: string;
  applicationId: string;
}): Promise<SeoActionResult> {
  const report = await getLatestReport();
  if (!report) return { success: false, status: 404, message: "Aucun rapport SEO disponible." };
  if (report.id !== input.reportId) {
    return { success: false, status: 409, message: "Ce rapport n’est plus à jour. Actualisez la page." };
  }

  const changes = parseAppliedSeoChanges(report.appliedSuggestions);
  const change = changes.find(
    (candidate) => candidate.applicationId === input.applicationId && !candidate.undoneAt,
  );
  if (!change) return { success: false, status: 404, message: "Modification appliquée introuvable." };

  change.undoneAt = new Date().toISOString();
  await db
    .update(seoReports)
    .set({ appliedSuggestions: JSON.stringify(changes) })
    .where(eq(seoReports.id, report.id));

  return { success: true };
}
// Trending keywords for web development — updated monthly by the agent
const TRENDING_KEYWORD_POOL: string[][] = [
  // Lot A — high-intent web projects
  [
    "création site web professionnel",
    "développeur web freelance",
    "agence web sur mesure",
    "site internet professionnel",
    "développement application web sur mesure",
  ],
  // Lot B — IA / tech
  [
    "intégration intelligence artificielle site web",
    "agent IA pour site vitrine",
    "automatisation site web IA",
    "chatbot site vitrine",
    "SEO automatique IA",
  ],
  // Lot C — métiers
  [
    "site web pour artisan",
    "site web pour restaurant",
    "site web pour PME",
    "refonte site web professionnel",
    "maintenance site web",
  ],
  // Lot D — tech stack
  [
    "site web React performant",
    "application Next.js sur mesure",
    "développement Node.js freelance France",
    "site web rapide optimisé SEO",
    "Progressive Web App",
  ],
];

function pickTrendingKeywords(): string[] {
  const weekOfYear = Math.floor(Date.now() / (7 * 24 * 3600 * 1000)) % TRENDING_KEYWORD_POOL.length;
  const base = TRENDING_KEYWORD_POOL[weekOfYear];
  // Mix with one from next batch for variety
  const next = TRENDING_KEYWORD_POOL[(weekOfYear + 1) % TRENDING_KEYWORD_POOL.length];
  return [...base, next[0]];
}

// ─── SEO rules engine ───────────────────────────────────────────────────────

const MAX_META_DESCRIPTION_LENGTH = 160;
const DEFAULT_DESCRIPTION_CTA = "Devis gratuit sous 24h.";

function truncateAtWordBoundary(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const clipped = value.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return (lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped)
    .replace(/[.,;:!?…\s]+$/g, "");
}

function fitMetaDescriptionWithCta(description: string): string {
  const normalized = description.trim();
  const trailingCta = normalized.match(/\b(?:devis|contactez)\b[^.!?]*[.!?]?\s*$/i)?.[0].trim();
  const cta = trailingCta || DEFAULT_DESCRIPTION_CTA;
  const rawBody = trailingCta
    ? normalized.slice(0, normalized.length - trailingCta.length).trim()
    : normalized;
  const body = rawBody.replace(/[.!?…]+$/g, "");
  const maxBodyLength = MAX_META_DESCRIPTION_LENGTH - cta.length - (body ? 2 : 0);
  const fittedBody = truncateAtWordBoundary(body, maxBodyLength);
  return `${fittedBody}${fittedBody ? ". " : ""}${cta}`;
}

function analyzeTitle(title: string, trending: string[]): SeoSuggestion[] {
  const suggestions: SeoSuggestion[] = [];
  const len = title.length;

  if (len < 50) {
    suggestions.push({
      id: "title-too-short",
      type: "title",
      priority: "high",
      current: title,
      suggested: `${title} | ${trending[0]}`,
      reason: `Le titre fait ${len} caractères. Idéal : 55-65 caractères pour le SEO.`,
      field: "title",
    });
  } else if (len > 70) {
    suggestions.push({
      id: "title-too-long",
      type: "title",
      priority: "medium",
      current: title,
      suggested: title.substring(0, 65),
      reason: `Le titre fait ${len} caractères — Google le tronque à ~65 car. Raccourcir.`,
      field: "title",
    });
  }

  // Check if title contains current year
  const currentYear = new Date().getFullYear().toString();
  if (!title.includes(currentYear)) {
    suggestions.push({
      id: "title-no-year",
      type: "title",
      priority: "low",
      current: title,
      suggested: title.replace(" | Innov Studio", ` ${currentYear} | Innov Studio`),
      reason: `Ajouter l'année "${currentYear}" dans le titre améliore le CTR (taux de clic).`,
      field: "title",
    });
  }

  return suggestions;
}

function analyzeDescription(desc: string, trending: string[]): SeoSuggestion[] {
  const suggestions: SeoSuggestion[] = [];
  const len = desc.length;
  const hasCta = /devis|contactez/i.test(desc);

  if (len < 120 && !hasCta) {
    suggestions.push({
      id: "desc-too-short",
      type: "description",
      priority: "high",
      current: desc,
      suggested: fitMetaDescriptionWithCta(desc),
      reason: `La description fait ${len} car. Idéal : 150-160 caractères. Elle est trop courte.`,
      field: "description",
    });
  } else if (len > MAX_META_DESCRIPTION_LENGTH) {
    suggestions.push({
      id: "desc-too-long",
      type: "description",
      priority: "medium",
      current: desc,
      suggested: fitMetaDescriptionWithCta(desc),
      reason: hasCta
        ? `La description fait ${len} caractères. La raccourcir à ${MAX_META_DESCRIPTION_LENGTH} caractères maximum en conservant le CTA.`
        : `La description fait ${len} caractères. La raccourcir à ${MAX_META_DESCRIPTION_LENGTH} caractères maximum et ajouter un CTA.`,
      field: "description",
    });
  }

  if (!hasCta && len >= 120 && len <= MAX_META_DESCRIPTION_LENGTH) {
    suggestions.push({
      id: "desc-no-cta",
      type: "description",
      priority: "medium",
      current: desc,
      suggested: fitMetaDescriptionWithCta(desc),
      reason: `Ajouter un appel à l'action (CTA) dans la meta description augmente le CTR de 5-15%.`,
      field: "description",
    });
  }

  const trendingInDesc = trending.some((kw) => desc.toLowerCase().includes(kw.toLowerCase().split(" ")[0]));
  if (!trendingInDesc && trending.length > 0) {
    suggestions.push({
      id: "desc-trending-kw",
      type: "description",
      priority: "low",
      current: desc,
      suggested: desc + ` Spécialiste en ${trending[1] || trending[0]}.`,
      reason: `Le mot-clé tendance "${trending[0]}" n'est pas dans la description. Le mentionner peut booster la visibilité.`,
    });
  }

  return suggestions;
}

function analyzeKeywords(keywords: string, trending: string[]): SeoSuggestion[] {
  const suggestions: SeoSuggestion[] = [];
  const kwList = keywords.split(",").map((k) => k.trim().toLowerCase());

  const missingTrending = trending.filter(
    (t) => !kwList.some((kw) => kw.includes(t.toLowerCase().split(" ")[0]))
  );

  if (missingTrending.length > 0) {
    suggestions.push({
      id: "keywords-missing-trending",
      type: "keywords",
      priority: "medium",
      current: keywords,
      suggested: keywords + ", " + missingTrending.slice(0, 3).join(", "),
      reason: `Les mots-clés tendance "${missingTrending.slice(0, 2).join('", "')}" ne sont pas dans vos meta keywords. Les ajouter améliore la cohérence SEO.`,
      field: "keywords",
    });
  }

  const currentYear = new Date().getFullYear().toString();
  if (!keywords.includes(currentYear)) {
    suggestions.push({
      id: "keywords-add-year",
      type: "keywords",
      priority: "low",
      current: keywords,
      suggested: keywords + `, création site web professionnel ${currentYear}`,
      reason: `Ajouter des mots-clés avec l'année en cours cible les recherches récentes.`,
      field: "keywords",
    });
  }

  return suggestions;
}

function analyzeStructure(refs: any[]): SeoSuggestion[] {
  const suggestions: SeoSuggestion[] = [];

  if (refs.length < 3) {
    suggestions.push({
      id: "structure-few-refs",
      type: "structure",
      priority: "high",
      current: `${refs.length} référence(s)`,
      suggested: "Ajouter au moins 3 références avec descriptions complètes",
      reason: `Peu de références réduisent le contenu indexable. Plus de contenu = meilleur référencement.`,
    });
  }

  const refsWithoutDesc = refs.filter((r) => !r.description || r.description.length < 30);
  if (refsWithoutDesc.length > 0) {
    suggestions.push({
      id: "structure-refs-desc",
      type: "content",
      priority: "medium",
      current: `${refsWithoutDesc.length} référence(s) sans description`,
      suggested: `Ajouter des descriptions de 30-100 mots pour chaque référence`,
      reason: `Les descriptions des références sont indexées par Google. Plus de texte = plus de chances d'apparaître.`,
    });
  }

  return suggestions;
}

function attachUrl(suggestions: SeoSuggestion[], url: string): SeoSuggestion[] {
  return suggestions.map((suggestion) => ({
    ...suggestion,
    id: `${suggestion.id}-${url === "/" ? "home" : url.slice(1).replace(/\//g, "-")}`,
    urls: [url],
  }));
}

export function analyzeServicePages(
  pages: SeoPageAuditData[],
  trending: string[],
): SeoSuggestion[] {
  const suggestions = pages.flatMap((page) => {
    const suggestions = [
      ...analyzeTitle(page.title, trending),
      ...analyzeDescription(page.description, trending),
    ];

    const expectedCanonical = `https://innov-studio.fr${page.path}`;
    if (page.canonical !== expectedCanonical) {
      suggestions.push({
        id: "canonical-missing-or-incorrect",
        type: "canonical",
        priority: "high",
        current: page.canonical ?? "Aucun canonical",
        suggested: expectedCanonical,
        reason: "Le canonical doit pointer vers l’URL principale de cette page.",
        field: "canonical",
      });
    }

    if (!page.indexable) {
      suggestions.push({
        id: "page-not-indexable",
        type: "indexability",
        priority: "high",
        current: "Page déclarée noindex",
        suggested: "Autoriser l’indexation de cette page",
        reason: "La directive robots empêche les moteurs de recherche d’indexer cette page.",
        field: "robots",
      });
    } else if (page.contentLength < 300) {
      suggestions.push({
        id: "page-content-too-short",
        type: "content",
        priority: "medium",
        current: `${page.contentLength} caractères de contenu visible`,
        suggested: "Enrichir le contenu visible de la page",
        reason: "La page contient peu de contenu textuel visible pour les moteurs de recherche.",
        field: "content",
      });
    }

    return attachUrl(suggestions, page.path);
  });
  return deduplicateSuggestions(suggestions);
}

function deduplicateSuggestions(suggestions: SeoSuggestion[]): SeoSuggestion[] {
  const deduplicated = new Map<string, SeoSuggestion>();

  for (const suggestion of suggestions) {
    const key = [
      suggestion.type,
      suggestion.priority,
      suggestion.field ?? "",
      suggestion.suggested,
      suggestion.reason,
    ].join("|");
    const existing = deduplicated.get(key);

    if (!existing) {
      deduplicated.set(key, {
        ...suggestion,
        currentByUrl: suggestion.urls?.length
          ? { [suggestion.urls[0]]: suggestion.current }
          : undefined,
      });
      continue;
    }

    existing.urls ??= [];
    for (const url of suggestion.urls ?? []) {
      if (!existing.urls.includes(url)) existing.urls.push(url);
      existing.currentByUrl ??= {};
      existing.currentByUrl[url] = suggestion.current;
    }
  }

  return Array.from(deduplicated.values()).map((suggestion) => {
    if ((suggestion.urls?.length ?? 0) < 2) {
      delete suggestion.currentByUrl;
    }
    return suggestion;
  });
}

function calculateScore(suggestions: SeoSuggestion[]): number {
  let score = 100;
  for (const s of suggestions) {
    if (s.priority === "high") score -= 15;
    else if (s.priority === "medium") score -= 8;
    else score -= 3;
  }
  return Math.max(0, Math.min(100, score));
}

// ─── Main analysis function ─────────────────────────────────────────────────

export async function runSeoAnalysis(): Promise<SeoAnalysisResult> {
  // 1. Fetch data
  const [refs, recentVisits, metadataOverrides] = await Promise.all([
    db.select().from(references).orderBy(desc(references.createdAt)),
    db
      .select({ path: pageVisits.path, count: sql<number>`count(*)` })
      .from(pageVisits)
      .where(gte(pageVisits.createdAt, new Date(Date.now() - 30 * 24 * 3600 * 1000)))
      .groupBy(pageVisits.path)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
    getAppliedSeoMetadataOverrides(),
  ]);

  // 2. Pick trending keywords
  const trending = pickTrendingKeywords();

  // 3. Run rules
  const suggestions = deduplicateSuggestions([
    ...attachUrl(
      analyzeTitle(metadataOverrides["/"]?.title ?? CURRENT_META.title, trending),
      "/",
    ),
    ...attachUrl(
      analyzeDescription(
        metadataOverrides["/"]?.description ?? CURRENT_META.description,
        trending,
      ),
      "/",
    ),
    ...attachUrl(analyzeKeywords(CURRENT_META.keywords, trending), "/"),
    ...attachUrl(analyzeStructure(refs), "/"),
    ...analyzeServicePages(
      seoPages.map((page) =>
        getSeoPageAuditData(withSeoMetadata(page, metadataOverrides[page.path])),
      ),
      trending,
    ),
  ]);

  // 4. Score
  const score = calculateScore(suggestions);

  // 5. Visit stats
  const visitStats = {
    totalLast30Days: recentVisits.reduce((sum, v) => sum + Number(v.count), 0),
    topPages: recentVisits.slice(0, 5),
  };

  return { score, suggestions, trendingKeywords: trending, visitStats };
}

// ─── Persist report ─────────────────────────────────────────────────────────

export async function saveReport(result: SeoAnalysisResult, emailSent = false) {
  const previousReport = await getLatestReport();
  const [report] = await db
    .insert(seoReports)
    .values({
      score: String(result.score),
      suggestions: JSON.stringify(result.suggestions),
      appliedSuggestions: JSON.stringify(
        parseAppliedSeoChanges(previousReport?.appliedSuggestions),
      ),
      trendingKeywords: JSON.stringify(result.trendingKeywords),
      visitStats: JSON.stringify(result.visitStats),
      emailSent,
    })
    .returning();
  return report;
}

export async function getLatestReport() {
  const [report] = await db.select().from(seoReports).orderBy(desc(seoReports.analysisDate)).limit(1);
  return report || null;
}

export async function getReportHistory(limit = 10) {
  return db.select().from(seoReports).orderBy(desc(seoReports.analysisDate)).limit(limit);
}

// ─── Cron jobs ───────────────────────────────────────────────────────────────

export function initSeoAgent() {
  // Daily analysis at 06:00
  cron.schedule("0 6 * * *", async () => {
    try {
      console.log("[SEO Agent] Running daily analysis...");
      const result = await runSeoAnalysis();
      await saveReport(result);
      console.log(`[SEO Agent] Analysis done. Score: ${result.score}/100, Suggestions: ${result.suggestions.length}`);
    } catch (err) {
      console.error("[SEO Agent] Daily analysis error:", err);
    }
  });

  // Weekly email report on Monday at 08:00
  cron.schedule("0 8 * * 1", async () => {
    try {
      console.log("[SEO Agent] Sending weekly email report...");
      const result = await runSeoAnalysis();
      const emailOk = await sendSeoReportEmail(result.score, result.suggestions, result.trendingKeywords, result.visitStats);
      await saveReport(result, emailOk);
      console.log(`[SEO Agent] Weekly report sent: ${emailOk}`);
    } catch (err) {
      console.error("[SEO Agent] Weekly report error:", err);
    }
  });

  console.log("[SEO Agent] Cron jobs initialized (daily 06:00, weekly Mon 08:00)");
}
