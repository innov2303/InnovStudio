import cron from "node-cron";
import { db } from "./db";
import { seoReports, pageVisits, references } from "../shared/schema";
import { desc, gte, sql } from "drizzle-orm";
import { sendSeoReportEmail } from "./email";

// ─── SEO scoring helpers ────────────────────────────────────────────────────

interface SeoSuggestion {
  id: string;
  type: "title" | "description" | "keywords" | "structure" | "performance" | "content";
  priority: "high" | "medium" | "low";
  current: string;
  suggested: string;
  reason: string;
  field?: string; // html field to update if applicable
}

interface SeoAnalysisResult {
  score: number;
  suggestions: SeoSuggestion[];
  trendingKeywords: string[];
  visitStats: Record<string, any>;
}

const CURRENT_META = {
  title: "Innov Studio | Création de Sites Web & Applications à Toulouse 2026",
  description:
    "Innov Studio - Création de sites web et applications sur mesure à Toulouse. Spécialisé en sites vitrines, apps entreprise & intégration IA. Devis gratuit sous 24h.",
  keywords:
    "création site web Toulouse, développeur web Toulouse, création site internet Toulouse, application web entreprise Toulouse, site vitrine Toulouse, développeur freelance Toulouse, agence web Toulouse, intégration IA, React, Node.js, développement sur mesure, Haute-Garonne, Occitanie, refonte site web professionnel, maintenance site web Toulouse, création site web Toulouse 2026",
};

// Trending keywords for web dev / Toulouse — updated monthly by the agent
const TRENDING_KEYWORD_POOL: string[][] = [
  // Lot A — high intent local
  [
    "création site web Toulouse 2025",
    "développeur web freelance Toulouse",
    "agence web Toulouse pas cher",
    "site vitrine professionnel Toulouse",
    "développement application web Toulouse",
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
    "site web artisan Toulouse",
    "site web restaurant Toulouse",
    "site web PME Occitanie",
    "refonte site web professionnel",
    "maintenance site web Toulouse",
  ],
  // Lot D — tech stack
  [
    "site web React performant",
    "application Next.js Toulouse",
    "développement Node.js freelance France",
    "site web rapide optimisé SEO",
    "Progressive Web App Toulouse",
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
      suggested: title.replace("Toulouse", `Toulouse ${currentYear}`),
      reason: `Ajouter l'année "${currentYear}" dans le titre améliore le CTR (taux de clic).`,
      field: "title",
    });
  }

  return suggestions;
}

function analyzeDescription(desc: string, trending: string[]): SeoSuggestion[] {
  const suggestions: SeoSuggestion[] = [];
  const len = desc.length;

  if (len < 120) {
    suggestions.push({
      id: "desc-too-short",
      type: "description",
      priority: "high",
      current: desc,
      suggested: `${desc} Contactez-moi pour un devis gratuit.`,
      reason: `La description fait ${len} car. Idéal : 150-160 caractères. Elle est trop courte.`,
      field: "description",
    });
  } else if (len > 165) {
    suggestions.push({
      id: "desc-too-long",
      type: "description",
      priority: "medium",
      current: desc,
      suggested: desc.substring(0, 155) + "...",
      reason: `La description fait ${len} car — tronquée par Google à ~160. La raccourcir.`,
      field: "description",
    });
  }

  if (!desc.toLowerCase().includes("devis") && !desc.toLowerCase().includes("contactez")) {
    suggestions.push({
      id: "desc-no-cta",
      type: "description",
      priority: "medium",
      current: desc,
      suggested: desc.replace(/\.$/, "") + ". Devis gratuit sous 24h.",
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
      suggested: keywords + `, création site web Toulouse ${currentYear}`,
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
  const [refs, recentVisits] = await Promise.all([
    db.select().from(references).orderBy(desc(references.createdAt)),
    db
      .select({ path: pageVisits.path, count: sql<number>`count(*)` })
      .from(pageVisits)
      .where(gte(pageVisits.createdAt, new Date(Date.now() - 30 * 24 * 3600 * 1000)))
      .groupBy(pageVisits.path)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
  ]);

  // 2. Pick trending keywords
  const trending = pickTrendingKeywords();

  // 3. Run rules
  const suggestions: SeoSuggestion[] = [
    ...analyzeTitle(CURRENT_META.title, trending),
    ...analyzeDescription(CURRENT_META.description, trending),
    ...analyzeKeywords(CURRENT_META.keywords, trending),
    ...analyzeStructure(refs),
  ];

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
  const [report] = await db
    .insert(seoReports)
    .values({
      score: String(result.score),
      suggestions: JSON.stringify(result.suggestions),
      appliedSuggestions: "[]",
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
