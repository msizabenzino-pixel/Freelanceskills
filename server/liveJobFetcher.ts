/**
 * ════════════════════════════════════════════════════════════════════════════
 * FreelanceSkills — LIVE JOB ENGINE v3.0  (AFRICA-FIRST | 100% REAL JOBS)
 *
 * Every job is a REAL advertised position. Every apply link is real.
 * Zero fake / AI-generated listings — ever.
 *
 * Sources (10 live feeds — running in parallel):
 *  1.  Remotive × 15 categories  remotive.com         (global remote, no auth)
 *  2.  RemoteOK                  remoteok.com         (global remote, no auth)
 *  3.  Arbeitnow                 arbeitnow.com        (EU/remote,    no auth)
 *  4.  The Muse × 20 pages       themuse.com          (US/global,    no auth)
 *  5.  Himalayas                 himalayas.app        (global remote, no auth)
 *  6.  Working Nomads            workingnomads.com    (global remote, no auth)
 *  7.  Jobicy                    jobicy.com           (global remote, no auth)
 *  8.  Adzuna South Africa × 20  api.adzuna.com/za    (South Africa, free key)
 *  9.  Adzuna United Kingdom × 5 api.adzuna.com/gb    (UK remote,    free key)
 * 10.  Adzuna Australia × 3      api.adzuna.com/au    (AUS remote,   free key)
 *
 * Env vars required for Adzuna (sources 8-10):
 *   ADZUNA_APP_ID   — from developer.adzuna.com (free)
 *   ADZUNA_APP_KEY  — from developer.adzuna.com (free)
 * ════════════════════════════════════════════════════════════════════════════
 */

import { storage } from "./storage";
import { log } from "./logger";
import type { InsertAggregatedJob } from "@shared/models/jobs";

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapCategory(tags: string[], title: string, description = ""): string {
  const h = [...tags, title, description.slice(0, 300)].join(" ").toLowerCase();
  if (/\b(devops|cloud|aws|azure|gcp|kubernetes|docker|terraform|infra|sre|platform)\b/.test(h)) return "Cloud & DevOps";
  if (/\b(cyber|security|soc|pentest|infosec|devsecops|vulnerability)\b/.test(h)) return "Cybersecurity";
  if (/\b(data.sci|machine.learn|ai\b|llm|nlp|deep.learn|tensorflow|pytorch|etl|looker|tableau|power.bi)\b/.test(h)) return "Data Science & AI";
  if (/\b(ai|ml)\b/.test(h)) return "Data Science & AI";
  if (/\b(ui|ux|figma|sketch|illustrator|photoshop|brand|graphic|motion|visual.design)\b/.test(h)) return "Design & Creative";
  if (/\b(ios|android|swift|kotlin|flutter|react.native|mobile.dev)\b/.test(h)) return "Mobile Development";
  if (/\b(product.manager|pm\b|roadmap|agile|scrum.master)\b/.test(h)) return "Management & Executive";
  if (/\b(marketing|seo|content.market|social.media|growth.hack|copywrite|email.market|paid.ads|ppc|sem)\b/.test(h)) return "Marketing & Digital";
  if (/\b(sales|business.dev|account.execut|bdr|sdr|revenue.operat)\b/.test(h)) return "Sales & Business Development";
  if (/\b(finance|accounting|cfo|bookkeep|payroll|tax.specialist|audit|fintech|treasury)\b/.test(h)) return "Finance & Accounting";
  if (/\b(customer.success|customer.support|cx\b|helpdesk|service.desk|customer.service)\b/.test(h)) return "Customer Support & Success";
  if (/\b(hr\b|human.resources|talent.acqui|recruiter|people.ops)\b/.test(h)) return "Human Resources";
  if (/\b(legal|attorney|counsel|paralegal|compliance.officer)\b/.test(h)) return "Legal & Compliance";
  if (/\b(blockchain|web3|solidity|smart.contract|nft|defi|crypto)\b/.test(h)) return "Blockchain & Web3";
  if (/\b(qa|quality.assur|tester|automation.test|selenium|cypress|jest)\b/.test(h)) return "QA & Testing";
  if (/\b(writing|copywr|technical.writ|content.writ|editor|journalist)\b/.test(h)) return "Marketing & Digital";
  if (/\b(project.manager|project.management|scrum|kanban|delivery.manager)\b/.test(h)) return "Management & Executive";
  if (/\b(medical|nurse|doctor|pharmacist|health|clinical|dental)\b/.test(h)) return "Healthcare";
  if (/\b(education|teacher|instructor|tutor|curriculum|e.learn)\b/.test(h)) return "Education & Training";
  return "Software Engineering";
}

function mapJobType(type: string): "full-time" | "part-time" | "contract" | "freelance" | "internship" {
  const t = (type || "").toLowerCase();
  if (t.includes("contract")) return "contract";
  if (t.includes("part")) return "part-time";
  if (t.includes("intern")) return "internship";
  if (t.includes("freelance")) return "freelance";
  return "full-time";
}

function mapExperience(level: string): "entry" | "mid" | "senior" | "lead" {
  const l = (level || "").toLowerCase();
  if (/\b(senior|sr\.|staff|principal|director|head|vp|chief|executive)\b/.test(l)) return "senior";
  if (/\b(junior|jr\.|entry|graduate|intern|fresh|associate)\b/.test(l)) return "entry";
  if (/\b(lead|manager|architect|head of)\b/.test(l)) return "lead";
  return "mid";
}

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim().slice(0, 3000);
}

function expiry(days = 30): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function base(): Pick<InsertAggregatedJob,
  "requirements" | "province" | "country" | "salaryMin" | "salaryMax" | "salaryPeriod" |
  "experienceLevel" | "expiresAt" | "isActive" | "aiScore" | "isUrgent" |
  "applicationCount" | "viewCount" | "upgradeCount" | "companySize" | "beeLevel" | "agentGenerated"
> {
  return {
    requirements: null,
    province: "Remote",
    country: "Remote",
    salaryMin: null,
    salaryMax: null,
    salaryPeriod: "year",
    experienceLevel: "mid",
    expiresAt: expiry(),
    isActive: true,
    aiScore: Math.floor(70 + Math.random() * 25),
    isUrgent: false,
    applicationCount: 0,
    viewCount: 0,
    upgradeCount: 0,
    companySize: null,
    beeLevel: null,
    agentGenerated: false,
  };
}

// ── 1. Remotive — ALL categories in parallel ──────────────────────────────────
// 15 categories × up to 100 jobs each = up to 1,500 real remote jobs

const REMOTIVE_CATEGORIES = [
  "software-development", "devops", "design", "marketing",
  "sales-business", "product", "project-management", "ai-ml",
  "data", "finance", "human-resources", "qa",
  "writing", "customer-service", "all-others",
];

async function fetchRemotiveCategory(slug: string): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?category=${slug}&limit=100`,
      { signal: AbortSignal.timeout(20000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const jobs: any[] = data.jobs || [];
    return jobs.map(j => ({
      ...base(),
      title: j.title || "Remote Role",
      company: j.company_name || "Global Company",
      description: stripHtml(j.description || j.title || ""),
      location: j.candidate_required_location || "Remote — Worldwide",
      country: "Remote",
      source: "Remotive",
      sourceUrl: j.url || null,
      applyUrl: j.url || null,
      liveSource: "remotive",
      category: mapCategory(j.tags || [], j.title || ""),
      jobType: mapJobType(j.job_type || ""),
      skills: (j.tags || []).slice(0, 10).join(", "),
      postedDate: j.publication_date ? new Date(j.publication_date) : new Date(),
      isRemote: true,
    } satisfies InsertAggregatedJob));
  } catch {
    return [];
  }
}

async function fetchRemotive(): Promise<InsertAggregatedJob[]> {
  const results = await Promise.all(REMOTIVE_CATEGORIES.map(fetchRemotiveCategory));
  const seen = new Set<string>();
  const unique: InsertAggregatedJob[] = [];
  for (const batch of results) {
    for (const j of batch) {
      const k = j.applyUrl || `${j.title}|${j.company}`;
      if (!seen.has(k)) { seen.add(k); unique.push(j); }
    }
  }
  return unique;
}

// ── 2. RemoteOK ───────────────────────────────────────────────────────────────

async function fetchRemoteOK(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "FreelanceSkills.net Job Aggregator +https://freelanceskills.net" },
      signal: AbortSignal.timeout(18000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const jobs: any[] = Array.isArray(data) ? data.slice(1) : [];
    return jobs.filter(j => j.position && j.url).map(j => ({
      ...base(),
      title: j.position,
      company: j.company || "Remote Company",
      description: stripHtml(j.description || j.position),
      location: "Remote — Worldwide",
      country: "Remote",
      salaryMin: j.salary_min ? parseInt(j.salary_min) || null : null,
      salaryMax: j.salary_max ? parseInt(j.salary_max) || null : null,
      salaryPeriod: "year",
      source: "RemoteOK",
      sourceUrl: j.url || null,
      applyUrl: j.apply_url || j.url || null,
      liveSource: "remoteok",
      category: mapCategory(j.tags || [], j.position),
      jobType: "full-time",
      skills: (j.tags || []).slice(0, 10).join(", "),
      postedDate: j.date ? new Date(j.date) : new Date(),
      isRemote: true,
    } satisfies InsertAggregatedJob));
  } catch (err: any) {
    log(`[LiveFetcher] RemoteOK: ${err.message}`, "warn");
    return [];
  }
}

// ── 3. Arbeitnow ──────────────────────────────────────────────────────────────

async function fetchArbeitnow(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://arbeitnow.com/api/job-board-api", {
      signal: AbortSignal.timeout(18000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const jobs: any[] = data.data || [];
    return jobs.map(j => ({
      ...base(),
      title: j.title || "Software Role",
      company: j.company_name || "Tech Company",
      description: stripHtml(j.description || j.title || ""),
      location: j.location || "Remote",
      country: j.remote ? "Remote" : "Global",
      source: "Arbeitnow",
      sourceUrl: j.url || null,
      applyUrl: j.url || null,
      liveSource: "arbeitnow",
      category: mapCategory(j.tags || [], j.title || ""),
      jobType: mapJobType((j.job_types || [])[0] || ""),
      skills: (j.tags || []).slice(0, 10).join(", "),
      postedDate: j.created_at ? new Date(j.created_at * 1000) : new Date(),
      isRemote: !!j.remote,
    } satisfies InsertAggregatedJob));
  } catch (err: any) {
    log(`[LiveFetcher] Arbeitnow: ${err.message}`, "warn");
    return [];
  }
}

// ── 4. The Muse — 20 pages × 20 jobs = up to 400 jobs ────────────────────────

async function fetchTheMuse(): Promise<InsertAggregatedJob[]> {
  const allJobs: InsertAggregatedJob[] = [];
  try {
    for (let page = 0; page < 20; page++) {
      const res = await fetch(
        `https://www.themuse.com/api/public/jobs?page=${page}&descending=true`,
        { signal: AbortSignal.timeout(15000) },
      );
      if (!res.ok) break;
      const data = await res.json();
      const jobs: any[] = data.results || [];
      if (jobs.length === 0) break;
      for (const j of jobs) {
        const applyUrl = j.refs?.landing_page || null;
        if (!applyUrl) continue;
        const loc = j.locations?.[0]?.name || "Remote";
        allJobs.push({
          ...base(),
          title: j.name || "Open Role",
          company: j.company?.name || "Company",
          description: stripHtml(j.contents || j.name || ""),
          location: loc,
          country: loc.toLowerCase().includes("remote") ? "Remote" : "Global",
          source: "The Muse",
          sourceUrl: applyUrl,
          applyUrl,
          liveSource: "themuse",
          category: mapCategory(
            (j.tags || []).map((t: any) => t.name),
            j.name || "",
            j.contents || "",
          ),
          jobType: "full-time",
          experienceLevel: mapExperience(j.levels?.[0]?.name || ""),
          skills: (j.tags || []).slice(0, 8).map((t: any) => t.name).join(", "),
          postedDate: j.publication_date ? new Date(j.publication_date) : new Date(),
          isRemote: loc.toLowerCase().includes("remote") || loc.toLowerCase().includes("flexible"),
        } satisfies InsertAggregatedJob);
      }
    }
  } catch (err: any) {
    log(`[LiveFetcher] The Muse: ${err.message}`, "warn");
  }
  return allJobs;
}

// ── 5. Himalayas ──────────────────────────────────────────────────────────────

async function fetchHimalayas(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://himalayas.app/jobs/api?limit=200&offset=0", {
      headers: { "User-Agent": "FreelanceSkills.net Job Aggregator" },
      signal: AbortSignal.timeout(18000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const jobs: any[] = data.jobs || [];
    return jobs.filter(j => j.applyUrl || j.url).map(j => {
      const applyLink = j.applyUrl || j.url;
      return {
        ...base(),
        title: j.title || "Remote Role",
        company: j.companyName || j.company?.name || "Company",
        description: stripHtml(j.description || j.title || ""),
        location: "Remote — Worldwide",
        country: "Remote",
        salaryMin: j.salary?.min || null,
        salaryMax: j.salary?.max || null,
        salaryPeriod: "year",
        source: "Himalayas",
        sourceUrl: j.url || applyLink,
        applyUrl: applyLink,
        liveSource: "himalayas",
        category: mapCategory(j.skills || [], j.title || "", j.description || ""),
        jobType: mapJobType(j.jobType || ""),
        skills: (j.skills || []).slice(0, 10).join(", "),
        postedDate: j.publishedAt ? new Date(j.publishedAt) : new Date(),
        isRemote: true,
      } satisfies InsertAggregatedJob;
    });
  } catch (err: any) {
    log(`[LiveFetcher] Himalayas: ${err.message}`, "warn");
    return [];
  }
}

// ── 6. Working Nomads ─────────────────────────────────────────────────────────

async function fetchWorkingNomads(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://www.workingnomads.com/api/exposed_jobs/", {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jobs: any[] = await res.json();
    return (Array.isArray(jobs) ? jobs : []).filter(j => j.url && j.title).map(j => ({
      ...base(),
      title: j.title,
      company: j.company_name || "Remote Company",
      description: stripHtml(j.description || j.title),
      location: "Remote — Worldwide",
      country: "Remote",
      source: "Working Nomads",
      sourceUrl: j.url,
      applyUrl: j.url,
      liveSource: "workingnomads",
      category: mapCategory([], j.title, j.description || ""),
      jobType: "full-time",
      skills: "",
      postedDate: j.pub_date_iso ? new Date(j.pub_date_iso) : new Date(),
      isRemote: true,
    } satisfies InsertAggregatedJob));
  } catch (err: any) {
    log(`[LiveFetcher] Working Nomads: ${err.message}`, "warn");
    return [];
  }
}

// ── 7. Jobicy ─────────────────────────────────────────────────────────────────
// Free JSON API, no auth. Curated remote jobs across all sectors.

async function fetchJobicy(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=50&geo=any", {
      headers: { "User-Agent": "FreelanceSkills.net Job Aggregator +https://freelanceskills.net" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const jobs: any[] = data.jobs || data.data || (Array.isArray(data) ? data : []);
    return jobs.filter(j => (j.url || j.jobUrl || j.apply_url) && (j.title || j.jobTitle)).map(j => {
      const title = j.jobTitle || j.title || "Remote Role";
      const company = j.companyName || j.company_name || j.company || "Company";
      const applyUrl = j.url || j.jobUrl || j.apply_url;
      return {
        ...base(),
        title,
        company,
        description: stripHtml(j.jobDescription || j.description || title),
        location: j.jobGeo || "Remote — Worldwide",
        country: "Remote",
        source: "Jobicy",
        sourceUrl: applyUrl,
        applyUrl,
        liveSource: "jobicy",
        category: mapCategory(
          (j.jobIndustry || j.tags || []),
          title,
          j.jobDescription || "",
        ),
        jobType: mapJobType(j.jobType || ""),
        skills: Array.isArray(j.jobIndustry) ? j.jobIndustry.join(", ") : (j.jobIndustry || ""),
        postedDate: j.pubDate ? new Date(j.pubDate) : new Date(),
        isRemote: true,
      } satisfies InsertAggregatedJob;
    });
  } catch (err: any) {
    log(`[LiveFetcher] Jobicy: ${err.message}`, "warn");
    return [];
  }
}

// ── 8, 9, 10. Adzuna (SA + UK + AU) ──────────────────────────────────────────
// ADZUNA_APP_ID + ADZUNA_APP_KEY required (free at developer.adzuna.com)
// SA: 20 pages × 50 = up to 1,000 South African jobs
// UK: 5 pages × 50 = up to 250 remote-eligible UK jobs
// AU: 3 pages × 50 = up to 150 remote-eligible AU jobs

const ADZUNA_CONFIGS: { country: string; label: string; maxPages: number; filterRemote: boolean }[] = [
  { country: "za", label: "South Africa", maxPages: 20, filterRemote: false },
  { country: "gb", label: "United Kingdom", maxPages: 5, filterRemote: true },
  { country: "au", label: "Australia", maxPages: 3, filterRemote: true },
];

async function fetchAdzunaConfig(
  cfg: typeof ADZUNA_CONFIGS[0],
): Promise<InsertAggregatedJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const allJobs: InsertAggregatedJob[] = [];
  try {
    for (let page = 1; page <= cfg.maxPages; page++) {
      const params = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        results_per_page: "50",
        "content-type": "application/json",
        sort_by: "date",
        ...(cfg.filterRemote ? { what: "remote" } : {}),
      });
      const url = `https://api.adzuna.com/v1/api/jobs/${cfg.country}/search/${page}?${params}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) break;
      const data = await res.json();
      const jobs: any[] = data.results || [];
      if (jobs.length === 0) break;
      for (const j of jobs) {
        const applyUrl = j.redirect_url || null;
        if (!applyUrl) continue;
        const isRemote =
          (j.title || "").toLowerCase().includes("remote") ||
          (j.description || "").toLowerCase().includes("remote") ||
          cfg.filterRemote;
        allJobs.push({
          ...base(),
          title: j.title || "Open Role",
          company: j.company?.display_name || "Company",
          description: stripHtml(j.description || j.title || ""),
          location: j.location?.display_name || cfg.label,
          province: j.location?.area?.[2] || j.location?.area?.[1] || "National",
          country: cfg.label,
          salaryMin: j.salary_min ? Math.round(j.salary_min) : null,
          salaryMax: j.salary_max ? Math.round(j.salary_max) : null,
          salaryPeriod: "year",
          source: `Adzuna ${cfg.label}`,
          sourceUrl: applyUrl,
          applyUrl,
          liveSource: `adzuna_${cfg.country}`,
          category: mapCategory([], j.title || "", j.description || ""),
          jobType: mapJobType(j.contract_time || ""),
          skills: j.category?.label || "",
          postedDate: j.created ? new Date(j.created) : new Date(),
          isRemote,
        } satisfies InsertAggregatedJob);
      }
    }
  } catch (err: any) {
    log(`[LiveFetcher] Adzuna ${cfg.label}: ${err.message}`, "warn");
  }
  return allJobs;
}

// ── Main Orchestrator ─────────────────────────────────────────────────────────

export interface LiveFetchResult {
  inserted: number;
  deleted: number;
  total: number;
  sources: Record<string, number>;
}

export async function fetchAndStoreLiveJobs(): Promise<LiveFetchResult> {
  log("[LiveFetcher] Launching 10-source REAL job fetch...", "jobs");

  const [remotive, remoteok, arbeitnow, muse, himalayas, nomads, jobicy, ...adzunaResults] =
    await Promise.all([
      fetchRemotive(),
      fetchRemoteOK(),
      fetchArbeitnow(),
      fetchTheMuse(),
      fetchHimalayas(),
      fetchWorkingNomads(),
      fetchJobicy(),
      ...ADZUNA_CONFIGS.map(fetchAdzunaConfig),
    ]);

  const [adzunaSA, adzunaUK, adzunaAU] = adzunaResults;

  const sourceCounts: Record<string, number> = {
    remotive: remotive.length,
    remoteok: remoteok.length,
    arbeitnow: arbeitnow.length,
    themuse: muse.length,
    himalayas: himalayas.length,
    workingnomads: nomads.length,
    jobicy: jobicy.length,
    adzuna_za: adzunaSA?.length || 0,
    adzuna_gb: adzunaUK?.length || 0,
    adzuna_au: adzunaAU?.length || 0,
  };

  const allLive = [
    ...remotive, ...remoteok, ...arbeitnow,
    ...muse, ...himalayas, ...nomads, ...jobicy,
    ...(adzunaSA || []), ...(adzunaUK || []), ...(adzunaAU || []),
  ];

  log(
    `[LiveFetcher] Fetched ${allLive.length} real jobs — ` +
    Object.entries(sourceCounts).map(([k, v]) => `${k}:${v}`).join(", "),
    "jobs",
  );

  // Efficient dedup: title+company key set from existing real jobs
  const existing = await storage.getAggregatedJobs();
  const existingKeys = new Set(
    existing.map(j => `${j.title.toLowerCase().trim()}|${j.company.toLowerCase().trim()}`),
  );

  // Also dedup within this batch (multiple sources can overlap)
  const batchSeen = new Set<string>();
  let inserted = 0;

  for (const job of allLive) {
    if (!job.applyUrl) continue;
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    if (existingKeys.has(key) || batchSeen.has(key)) continue;
    batchSeen.add(key);
    try {
      await storage.createAggregatedJob(job);
      existingKeys.add(key);
      inserted++;
    } catch {
      // DB constraint duplicate — skip
    }
  }

  const total = await storage.getAggregatedJobCount();
  log(`[LiveFetcher] Done — +${inserted} new real jobs inserted, total in DB: ${total}`, "jobs");
  return { inserted, deleted: 0, total, sources: sourceCounts };
}

/**
 * Wipe all AI-generated (fake) jobs and replace with real live jobs.
 * Called automatically on startup when fake jobs are detected.
 */
export async function purgeAndRefresh(): Promise<LiveFetchResult> {
  log("[LiveFetcher] Purging ALL AI-generated fake jobs...", "jobs");
  const deleted = await storage.deleteAgentGeneratedJobs();
  log(`[LiveFetcher] Purged ${deleted} fake jobs`, "jobs");
  const result = await fetchAndStoreLiveJobs();
  return { ...result, deleted };
}
