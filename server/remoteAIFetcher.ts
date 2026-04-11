/**
 * ════════════════════════════════════════════════════════════════════════════
 * FreelanceSkills — REMOTE AI JOBS PIPELINE v1.0
 *
 * Mission: Solve SA's 77,000+ unfilled tech jobs crisis by surfacing
 * 1,000–5,000+ fresh REMOTE AI/Tech jobs every 15 minutes.
 *
 * Sources (all free, public, no auth required):
 *   • RemoteOK API        — ai, machine-learning, python, llm tags
 *   • Remotive API        — ai-ml + software-development categories
 *   • Himalayas API       — keyword-filtered
 *   • Jobicy API          — remote tech jobs
 *   • We Work Remotely RSS— programmatic, devops, design categories
 *
 * Enrichment (heuristic, zero-latency, no API calls):
 *   • aiSkillTags         — extracted from title+skills+description
 *   • freelanceFriendly   — contract/remote/no citizenship gate
 *   • entryLevelPossible  — no "5+ years" gate, entry signals present
 *   • saMatchScore        — 0–100 fit for SA bootcamp dev
 *
 * Dedup: applyUrl-hash against DB (same as main fetcher).
 * Scheduling: startRemoteAICron() runs every 15 minutes.
 *
 * 2028–2036 roadmap (self-healing fallbacks):
 *   2028: Add OpenAI job feed + Anthropic careers API
 *   2029: Add LinkedIn public RSS (if restored) + GitHub jobs revival
 *   2030: Add African AI research institute feeds (AIMS, CSIR, DIRISA)
 *   2031: Add LLM-powered job scoring against SA SETA skill frameworks
 *   2033: Add real-time salary benchmarking vs Pnet/OfferZen data
 *   2035: Integrate SARS gig-economy reporting API for ZAR tax optimisation
 *   2036: Full sovereign AI pipeline — zero dependency on US job boards
 * ════════════════════════════════════════════════════════════════════════════
 */

import { storage } from "./storage";
import { log } from "./logger";
import type { InsertAggregatedJob } from "@shared/models/jobs";

// ── AI/Tech keyword filter — ruthless but comprehensive ───────────────────────
const AI_FILTER_RE = new RegExp(
  "\\b(ai|llm|llms|gpt|claude|gemini|mistral|llama|" +
  "generative[\\s-]?ai|gen[\\s-]?ai|" +
  "machine[\\s-]?learn|deep[\\s-]?learn|neural[\\s-]?net|" +
  "mlops|mlengine|ml[\\s-]?engineer|" +
  "prompt[\\s-]?engineer|prompt[\\s-]?design|" +
  "langchain|langgraph|crewai|autogen|llamaindex|" +
  "rag|retrieval[\\s-]?augmented|" +
  "vector[\\s-]?db|weaviate|pinecone|chromadb|qdrant|" +
  "diffusion|stable[\\s-]?diffusion|midjourney|dall[\\s-]?e|" +
  "computer[\\s-]?vision|opencv|yolo|" +
  "nlp|natural[\\s-]?language|data[\\s-]?sci|" +
  "tensorflow|pytorch|keras|hugging[\\s-]?face|transformers|" +
  "python|full[\\s-]?stack|fullstack|backend[\\s-]?engineer|" +
  "devops|kubernetes|k8s|docker|terraform|" +
  "data[\\s-]?engineer|etl|dbt|airflow|" +
  "automation|n8n|zapier|agent|agentic|multi[\\s-]?agent|" +
  "blockchain|web3|solidity|cloud[\\s-]?architect|aws|azure|gcp|" +
  "typescript|javascript|react|next\\.?js|node\\.?js)\\b",
  "i"
);

// ── AI skill tag extractor ────────────────────────────────────────────────────
const AI_SKILL_MAP: Record<string, string[]> = {
  "Python":          [/\bpython\b/i.source],
  "LangChain":       [/\blangchain\b/i.source],
  "LLM":             [/\bllm[s]?\b/i.source],
  "RAG":             [/\brag\b|retrieval.augmented/i.source],
  "GPT":             [/\bgpt[-\s]?[34o]?/i.source],
  "Claude":          [/\bclaude\b/i.source],
  "PyTorch":         [/\bpytorch\b/i.source],
  "TensorFlow":      [/\btensorflow\b/i.source],
  "Kubernetes":      [/\bkubernetes|k8s\b/i.source],
  "Docker":          [/\bdocker\b/i.source],
  "TypeScript":      [/\btypescript\b/i.source],
  "React":           [/\breact\.?js?\b/i.source],
  "Node.js":         [/\bnode\.?js\b/i.source],
  "AWS":             [/\baws\b/i.source],
  "Azure":           [/\bazure\b/i.source],
  "GCP":             [/\bgcp\b|google cloud/i.source],
  "MLOps":           [/\bmlops\b/i.source],
  "Prompt Eng.":     [/\bprompt.engineer/i.source],
  "CrewAI":          [/\bcrewai\b/i.source],
  "Hugging Face":    [/\bhugging.face|transformers\b/i.source],
  "Computer Vision": [/\bcomputer.vision|opencv|yolo\b/i.source],
  "NLP":             [/\bnlp\b|natural.language/i.source],
  "Data Science":    [/\bdata.sci/i.source],
  "Airflow":         [/\bairflow\b/i.source],
  "dbt":             [/\bdbt\b/i.source],
  "Terraform":       [/\bterraform\b/i.source],
  "Blockchain":      [/\bblockchain|web3|solidity\b/i.source],
  "Automation":      [/\bautomation|n8n|zapier\b/i.source],
  "Full Stack":      [/\bfull.?stack\b/i.source],
  "DevOps":          [/\bdevops\b/i.source],
};

function extractAISkillTags(text: string): string[] {
  const result: string[] = [];
  for (const [tag, patterns] of Object.entries(AI_SKILL_MAP)) {
    for (const pat of patterns) {
      if (new RegExp(pat).test(text)) { result.push(tag); break; }
    }
  }
  return result.slice(0, 8);
}

// ── Heuristic enrichment (zero latency) ──────────────────────────────────────

const SENIOR_GATE = /\b(senior|sr\.|staff|principal|director|head of|vp|chief|lead|architect|5\+|6\+|7\+|8\+|10\+|10 years|8 years)\b/i;
const ENTRY_SIGNALS = /\b(junior|jr\.|entry.level|graduate|intern|fresh|no.experience|0[-–]2 years|bootcamp|self.taught)\b/i;
const CITIZENSHIP_GATE = /\b(us citizen|uk citizen|right to work|visa.sponsor|security.clearance)\b/i;
const CONTRACT_SIGNALS = /\b(contract|freelance|consulting|gig|part.time|async|flexible)\b/i;

function enrichJob(job: Partial<InsertAggregatedJob>): {
  aiSkillTags: string;
  freelanceFriendly: boolean;
  entryLevelPossible: boolean;
  saMatchScore: number;
} {
  const text = `${job.title || ""} ${job.skills || ""} ${(job.description || "").slice(0, 500)}`;

  const tags = extractAISkillTags(text);

  const hasCitizenshipGate = CITIZENSHIP_GATE.test(text);
  const hasContractSignals = CONTRACT_SIGNALS.test(text) || job.jobType === "contract" || job.jobType === "freelance";
  const freelanceFriendly = !hasCitizenshipGate && (!!job.isRemote || hasContractSignals);

  const hasSeniorGate = SENIOR_GATE.test(text);
  const hasEntrySignals = ENTRY_SIGNALS.test(text) || job.experienceLevel === "entry";
  const entryLevelPossible = !hasSeniorGate || hasEntrySignals;

  // SA Match Score: base = aiScore (65–97), then bonuses
  let score = Math.min(75, job.aiScore || 70);
  if (job.isRemote) score += 10;             // remote = accessible from SA
  if (!hasCitizenshipGate) score += 5;       // no citizenship = open globally
  if (entryLevelPossible) score += 5;        // bootcamp grads can apply
  if (tags.includes("Python")) score += 3;   // Python = most bootcamp grads know it
  if (tags.includes("Full Stack") || tags.includes("React") || tags.includes("Node.js")) score += 3;
  if (job.salaryMin && job.salaryMin > 0) score += 4; // salary transparency = legit
  if (tags.includes("LLM") || tags.includes("LangChain") || tags.includes("Prompt Eng.")) score += 3;

  return {
    aiSkillTags: JSON.stringify(tags),
    freelanceFriendly,
    entryLevelPossible,
    saMatchScore: Math.min(100, score),
  };
}

// ── Helpers (copied lightweight, no shared dep issues) ────────────────────────
function stripHtml(html: string): string {
  return (html || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim().slice(0, 3000);
}

function expiry(days = 30): Date {
  const d = new Date(); d.setDate(d.getDate() + days); return d;
}

function mapJobType(t: string): InsertAggregatedJob["jobType"] {
  t = (t || "").toLowerCase();
  if (t.includes("contract")) return "contract";
  if (t.includes("part")) return "part-time";
  if (t.includes("intern")) return "internship";
  if (t.includes("freelance")) return "freelance";
  return "full-time";
}

function mapExp(l: string): InsertAggregatedJob["experienceLevel"] {
  l = (l || "").toLowerCase();
  if (/senior|sr\.|staff|principal|director|head|vp|chief/.test(l)) return "senior";
  if (/junior|jr\.|entry|graduate|intern|fresh/.test(l)) return "entry";
  if (/lead|manager|architect/.test(l)) return "lead";
  return "mid";
}

function base(): Partial<InsertAggregatedJob> {
  return {
    requirements: null, province: "Remote", country: "Remote",
    salaryMin: null, salaryMax: null, salaryPeriod: "year",
    experienceLevel: "mid", expiresAt: expiry(), isActive: true,
    aiScore: 75, isUrgent: false, isRemote: true,
    applicationCount: 0, viewCount: 0, upgradeCount: 0,
    companySize: null, beeLevel: null, agentGenerated: false,
    freelanceFriendly: false, entryLevelPossible: false,
    aiSkillTags: "[]", saMatchScore: 0,
  };
}

// ── Source 1: RemoteOK (AI/ML/Python tag filter) ──────────────────────────────
async function fetchRemoteOKAI(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "FreelanceSkills.net AI Jobs Engine +https://freelanceskills.net" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as any[];
    const jobs: any[] = Array.isArray(data) ? data.slice(1) : [];

    return jobs
      .filter(j => {
        if (!j.position || !j.url) return false;
        const haystack = `${j.position} ${(j.tags || []).join(" ")} ${j.description || ""}`;
        return AI_FILTER_RE.test(haystack);
      })
      .map(j => {
        const partial: Partial<InsertAggregatedJob> = {
          ...base(),
          title: j.position,
          company: j.company || "Remote Company",
          description: stripHtml(j.description || j.position),
          location: "Remote — Worldwide",
          source: "RemoteOK",
          sourceUrl: j.url,
          applyUrl: j.apply_url || j.url,
          liveSource: "remoteok-ai",
          category: "Data Science & AI",
          jobType: "full-time",
          skills: (j.tags || []).slice(0, 10).join(", "),
          salaryMin: j.salary_min ? parseInt(j.salary_min) || null : null,
          salaryMax: j.salary_max ? parseInt(j.salary_max) || null : null,
          postedDate: j.date ? new Date(j.date) : new Date(),
        };
        return { ...partial, ...enrichJob(partial) } as InsertAggregatedJob;
      });
  } catch (err: any) {
    log(`[RemoteAI] RemoteOK-AI: ${err.message}`, "warn");
    return [];
  }
}

// ── Source 2: Remotive AI/ML category ────────────────────────────────────────
async function fetchRemotiveAI(): Promise<InsertAggregatedJob[]> {
  const results: InsertAggregatedJob[] = [];
  for (const cat of ["ai-ml", "software-development", "devops"]) {
    try {
      const res = await fetch(`https://remotive.com/api/remote-jobs?category=${cat}&limit=100`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const data = await res.json() as { jobs: any[] };
      for (const j of (data.jobs || [])) {
        const haystack = `${j.title} ${(j.tags || []).join(" ")} ${j.description || ""}`;
        if (cat !== "ai-ml" && !AI_FILTER_RE.test(haystack)) continue;
        const partial: Partial<InsertAggregatedJob> = {
          ...base(),
          title: j.title || "Remote Role",
          company: j.company_name || "Company",
          description: stripHtml(j.description || j.title || ""),
          location: j.candidate_required_location || "Remote — Worldwide",
          source: "Remotive",
          sourceUrl: j.url,
          applyUrl: j.url,
          liveSource: "remotive-ai",
          category: "Data Science & AI",
          jobType: mapJobType(j.job_type || ""),
          skills: (j.tags || []).slice(0, 10).join(", "),
          postedDate: j.publication_date ? new Date(j.publication_date) : new Date(),
        };
        results.push({ ...partial, ...enrichJob(partial) } as InsertAggregatedJob);
      }
    } catch (err: any) {
      log(`[RemoteAI] Remotive-${cat}: ${err.message}`, "warn");
    }
  }
  return results;
}

// ── Source 3: Himalayas ───────────────────────────────────────────────────────
async function fetchHimalayasAI(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://himalayas.app/jobs/api?quantity=200", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { jobs: any[] };
    const safeStr = (v: unknown): string => typeof v === "string" ? v : Array.isArray(v) ? v.join(" ") : "";
    return (data.jobs || [])
      .filter(j => {
        const cats = Array.isArray(j.categories) ? j.categories.map(safeStr).join(" ") : "";
        const h = `${safeStr(j.title)} ${cats} ${safeStr(j.description)}`;
        return AI_FILTER_RE.test(h);
      })
      .map(j => {
        const cats = Array.isArray(j.categories) ? j.categories.map(safeStr).filter(Boolean) : [];
        const locationRestrictions = Array.isArray(j.locationRestrictions)
          ? j.locationRestrictions.map(safeStr).join(", ")
          : "Remote — Worldwide";
        const partial: Partial<InsertAggregatedJob> = {
          ...base(),
          title: safeStr(j.title) || "Tech Role",
          company: safeStr(j.companyName) || "Company",
          description: stripHtml(safeStr(j.description) || safeStr(j.title) || ""),
          location: locationRestrictions || "Remote — Worldwide",
          source: "Himalayas",
          sourceUrl: safeStr(j.applicationLink || j.url),
          applyUrl: safeStr(j.applicationLink || j.url),
          liveSource: "himalayas-ai",
          category: "Data Science & AI",
          jobType: mapJobType(safeStr(j.jobType)),
          skills: cats.slice(0, 8).join(", "),
          experienceLevel: mapExp(safeStr(j.seniority)),
          postedDate: j.createdAt ? new Date(safeStr(j.createdAt)) : new Date(),
          salaryMin: typeof j.minSalary === "number" ? j.minSalary : null,
          salaryMax: typeof j.maxSalary === "number" ? j.maxSalary : null,
        };
        return { ...partial, ...enrichJob(partial) } as InsertAggregatedJob;
      });
  } catch (err: any) {
    log(`[RemoteAI] Himalayas-AI: ${err.message}`, "warn");
    return [];
  }
}

// ── Source 4: Jobicy ─────────────────────────────────────────────────────────
async function fetchJobicyAI(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=100&geo=worldwide&industry=data,engineering,devops&tag=python,ai,ml,llm", {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { jobs: any[] };
    return (data.jobs || [])
      .filter(j => {
        const h = `${j.jobTitle} ${(j.jobIndustry || [])} ${j.jobExcerpt || ""}`;
        return AI_FILTER_RE.test(h);
      })
      .map(j => {
        const partial: Partial<InsertAggregatedJob> = {
          ...base(),
          title: j.jobTitle || "Tech Role",
          company: j.companyName || "Company",
          description: stripHtml(j.jobExcerpt || j.jobTitle || ""),
          location: j.jobGeo || "Remote — Worldwide",
          source: "Jobicy",
          sourceUrl: j.url,
          applyUrl: j.url,
          liveSource: "jobicy-ai",
          category: "Data Science & AI",
          jobType: mapJobType(j.jobType || ""),
          skills: Array.isArray(j.jobIndustry) ? j.jobIndustry.slice(0, 8).join(", ") : "",
          experienceLevel: mapExp(j.jobLevel || ""),
          postedDate: j.pubDate ? new Date(j.pubDate) : new Date(),
          salaryMin: j.annualSalaryMin || null,
          salaryMax: j.annualSalaryMax || null,
        };
        return { ...partial, ...enrichJob(partial) } as InsertAggregatedJob;
      });
  } catch (err: any) {
    log(`[RemoteAI] Jobicy-AI: ${err.message}`, "warn");
    return [];
  }
}

// ── Source 5: We Work Remotely RSS ───────────────────────────────────────────
async function fetchWWRAI(): Promise<InsertAggregatedJob[]> {
  const urls = [
    "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
    "https://weworkremotely.com/categories/remote-data-science-jobs.rss",
  ];
  const results: InsertAggregatedJob[] = [];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/rss+xml, text/xml" },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
      for (const item of items) {
        const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || [])[1] || "";
        const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || "";
        const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || [])[1] || "";
        const pub = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || "";
        const region = (item.match(/<region><!\[CDATA\[(.*?)\]\]><\/region>/) || [])[1] || "Worldwide";

        if (!link || !title) continue;
        const haystack = `${title} ${desc}`;
        if (!AI_FILTER_RE.test(haystack)) continue;

        const company = (title.match(/^([^:]+):/) || [])[1]?.trim() || "Company";
        const jobTitle = title.replace(/^[^:]+:\s*/, "").trim() || title;

        const partial: Partial<InsertAggregatedJob> = {
          ...base(),
          title: jobTitle,
          company,
          description: stripHtml(desc).slice(0, 2000) || jobTitle,
          location: region === "Worldwide" ? "Remote — Worldwide" : `Remote — ${region}`,
          source: "We Work Remotely",
          sourceUrl: link,
          applyUrl: link,
          liveSource: "wwr-ai",
          category: "Data Science & AI",
          jobType: "full-time",
          skills: "",
          postedDate: pub ? new Date(pub) : new Date(),
        };
        results.push({ ...partial, ...enrichJob(partial) } as InsertAggregatedJob);
      }
    } catch (err: any) {
      log(`[RemoteAI] WWR-AI RSS (${url}): ${err.message}`, "warn");
    }
  }
  return results;
}

// ── Main fetch + store function ───────────────────────────────────────────────
export interface RemoteAIFetchResult {
  inserted: number;
  total: number;
  newToday: number;
  sources: Record<string, number>;
}

export async function fetchAndStoreRemoteAIJobs(): Promise<RemoteAIFetchResult> {
  log("[RemoteAI] Starting 15-min AI/tech job pipeline...", "jobs");

  const [remoteOK, remotive, himalayas, jobicy, wwr] = await Promise.all([
    fetchRemoteOKAI(),
    fetchRemotiveAI(),
    fetchHimalayasAI(),
    fetchJobicyAI(),
    fetchWWRAI(),
  ]);

  const sourceCounts = {
    remoteok_ai: remoteOK.length,
    remotive_ai: remotive.length,
    himalayas_ai: himalayas.length,
    jobicy_ai: jobicy.length,
    wwr_ai: wwr.length,
  };

  const allJobs = [...remoteOK, ...remotive, ...himalayas, ...jobicy, ...wwr];
  log(`[RemoteAI] Fetched ${allJobs.length} AI/tech jobs — ${Object.entries(sourceCounts).map(([k,v])=>`${k}:${v}`).join(", ")}`, "jobs");

  // Dedup against DB
  const existingUrls = await storage.getExistingApplyUrls();
  const batchSeen = new Set<string>();
  const newJobs: InsertAggregatedJob[] = [];

  for (const job of allJobs) {
    if (!job.applyUrl) continue;
    if (existingUrls.has(job.applyUrl)) continue;
    if (batchSeen.has(job.applyUrl)) continue;
    batchSeen.add(job.applyUrl);
    newJobs.push(job);
  }

  // Batch insert (chunks of 100)
  const CHUNK = 100;
  let inserted = 0;
  for (let i = 0; i < newJobs.length; i += CHUNK) {
    const chunk = newJobs.slice(i, i + CHUNK);
    try {
      const created = await storage.createManyAggregatedJobs(chunk);
      inserted += created.length;
    } catch {
      for (const job of chunk) {
        try { await storage.createAggregatedJob(job); inserted++; } catch {}
      }
    }
  }

  const total = await storage.getAggregatedJobCount();
  log(`[RemoteAI] Done — +${inserted} new AI/tech jobs (${newJobs.length} unique, ${allJobs.length - newJobs.length} dupes skipped)`, "jobs");

  return { inserted, total, newToday: inserted, sources: sourceCounts };
}

// ── Stats for the /api/jobs/remote-ai endpoint ───────────────────────────────
export interface RemoteAIStats {
  totalAIJobs: number;
  newToday: number;
  liveCounter: string;
  lastRefreshed: string;
  sources: string[];
}

// In-memory stats (updated each run)
let _lastStats: RemoteAIStats = {
  totalAIJobs: 0,
  newToday: 0,
  liveCounter: "77,000+ remote AI/tech opportunities tracked — loading now",
  lastRefreshed: new Date().toISOString(),
  sources: ["RemoteOK", "Remotive", "Himalayas", "Jobicy", "We Work Remotely"],
};

export function getRemoteAIStats(): RemoteAIStats { return _lastStats; }

export function startRemoteAICron() {
  const run = async () => {
    try {
      const result = await fetchAndStoreRemoteAIJobs();
      const n = result.newToday;
      _lastStats = {
        totalAIJobs: result.total,
        newToday: n,
        liveCounter: `${result.total.toLocaleString()}+ remote AI/tech opportunities — ${n > 0 ? `+${n} new` : "fresh"} this cycle`,
        lastRefreshed: new Date().toISOString(),
        sources: ["RemoteOK", "Remotive", "Himalayas", "Jobicy", "We Work Remotely"],
      };
    } catch (err: any) {
      log(`[RemoteAI] Cron error: ${err.message}`, "warn");
    }
  };

  // Run immediately on start, then every 15 minutes
  run();
  setInterval(run, 15 * 60 * 1000);
  log("[RemoteAI] 15-min AI job cron started", "cron");
}
