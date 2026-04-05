/**
 * ════════════════════════════════════════════════════════════════════════════
 * FreelanceSkills — LIVE JOB ENGINE v2.0  (100% REAL JOBS ONLY)
 *
 * Every single job here is a REAL advertised position from a real employer.
 * Every apply link goes to the actual live job posting.
 * Zero fake / AI-generated listings.
 *
 * Sources (8 live feeds, no auth required for most):
 *  1. Remotive        — remotive.com           (global remote, no auth)
 *  2. RemoteOK        — remoteok.com            (global remote, no auth)
 *  3. Arbeitnow       — arbeitnow.com           (EU/remote,    no auth)
 *  4. The Muse        — themuse.com             (US/global,    no auth)
 *  5. Himalayas       — himalayas.app           (global remote, no auth)
 *  6. Working Nomads  — workingnomads.com       (global remote, no auth)
 *  7. Adzuna SA       — api.adzuna.com/za       (South Africa, free API key)
 *  8. Adzuna NG       — api.adzuna.com/ng       (Nigeria,      free API key)
 *
 * For Adzuna (sources 7 & 8): set ADZUNA_APP_ID + ADZUNA_APP_KEY env vars.
 * Free registration at: https://developer.adzuna.com
 * ════════════════════════════════════════════════════════════════════════════
 */

import { storage } from "./storage";
import { log } from "./logger";
import type { InsertAggregatedJob } from "@shared/models/jobs";

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapCategory(tags: string[], title: string, description = ""): string {
  const h = [...tags, title, description.slice(0, 200)].join(" ").toLowerCase();
  if (/\b(devops|cloud|aws|azure|gcp|kubernetes|docker|terraform|infra|sre|platform)\b/.test(h)) return "Cloud & DevOps";
  if (/\b(cyber|security|soc|pentest|infosec|devsecops|vulnerability)\b/.test(h)) return "Cybersecurity";
  if (/\b(data.sci|analytics|ml|machine.learn|ai|llm|nlp|deep.learn|tensorflow|pytorch|etl|tableau|power.bi|looker)\b/.test(h)) return "Data Science & AI";
  if (/\b(ui|ux|figma|sketch|design|illustrator|photoshop|brand|graphic|motion|visual)\b/.test(h)) return "Design & Creative";
  if (/\b(ios|android|swift|kotlin|flutter|react.native|mobile)\b/.test(h)) return "Mobile Development";
  if (/\b(product.manager|pm\b|roadmap|sprint|agile|scrum.master)\b/.test(h)) return "Management & Executive";
  if (/\b(marketing|seo|content|social.media|growth|copywrite|email.market|paid.ads|ppc|sem)\b/.test(h)) return "Marketing & Digital";
  if (/\b(sales|business.dev|account.execut|bdr|sdr|revenue)\b/.test(h)) return "Sales & Business Development";
  if (/\b(finance|accounting|cfo|bookkeep|payroll|tax|audit|fintech|treasury)\b/.test(h)) return "Finance & Accounting";
  if (/\b(customer.success|support|cx|cx\b|helpdesk|service.desk)\b/.test(h)) return "Customer Support & Success";
  if (/\b(hr|human.resources|talent.acqui|recruiter|people.ops)\b/.test(h)) return "Human Resources";
  if (/\b(legal|contract|compliance|attorney|counsel|paralegal)\b/.test(h)) return "Legal & Compliance";
  if (/\b(blockchain|web3|solidity|smart.contract|nft|defi|crypto)\b/.test(h)) return "Blockchain & Web3";
  if (/\b(qa|quality.assur|tester|automation.test|selenium|cypress)\b/.test(h)) return "QA & Testing";
  if (/\b(backend|node|python|java|ruby|php|golang|rust|scala|spring|django|fastapi|rails|c\+\+|software|engineer|developer|fullstack|full.stack)\b/.test(h)) return "Software Engineering";
  if (/\b(react|angular|vue|frontend|next\.?js|nuxt|svelte|typescript|javascript|css|html|web.dev)\b/.test(h)) return "Software Engineering";
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
  if (/\b(senior|sr\.|staff|principal|lead|director|head|vp|chief)\b/.test(l)) return "senior";
  if (/\b(junior|jr\.|entry|graduate|intern|fresh)\b/.test(l)) return "entry";
  if (/\b(lead|manager|architect)\b/.test(l)) return "lead";
  return "mid";
}

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000);
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

// ── 1. Remotive ───────────────────────────────────────────────────────────────

async function fetchRemotive(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?limit=200", {
      signal: AbortSignal.timeout(18000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  } catch (err: any) {
    log(`[LiveFetcher] Remotive: ${err.message}`, "warn");
    return [];
  }
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
    return jobs.filter(j => j.position).map(j => ({
      ...base(),
      title: j.position || "Remote Developer",
      company: j.company || "Remote Company",
      description: stripHtml(j.description || j.position || ""),
      location: "Remote — Worldwide",
      country: "Remote",
      salaryMin: j.salary_min ? parseInt(j.salary_min) || null : null,
      salaryMax: j.salary_max ? parseInt(j.salary_max) || null : null,
      salaryPeriod: "year",
      source: "RemoteOK",
      sourceUrl: j.url || (j.slug ? `https://remoteok.com/${j.slug}` : null),
      applyUrl: j.apply_url || j.url || null,
      liveSource: "remoteok",
      category: mapCategory(j.tags || [], j.position || ""),
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
      jobType: mapJobType((j.job_types || [])[0] || "full-time"),
      skills: (j.tags || []).slice(0, 10).join(", "),
      postedDate: j.created_at ? new Date(j.created_at * 1000) : new Date(),
      isRemote: !!j.remote,
    } satisfies InsertAggregatedJob));
  } catch (err: any) {
    log(`[LiveFetcher] Arbeitnow: ${err.message}`, "warn");
    return [];
  }
}

// ── 4. The Muse ───────────────────────────────────────────────────────────────
// Free, no auth required. 20 jobs per page, paginate 15 pages = up to 300 jobs.

async function fetchTheMuse(): Promise<InsertAggregatedJob[]> {
  const allJobs: InsertAggregatedJob[] = [];
  try {
    for (let page = 0; page < 15; page++) {
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
        const level = j.levels?.[0]?.name || "Mid Level";
        allJobs.push({
          ...base(),
          title: j.name || "Open Role",
          company: j.company?.name || "Company",
          description: stripHtml(j.contents || j.name || ""),
          location: loc,
          country: loc.includes("Remote") ? "Remote" : "Global",
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
          experienceLevel: mapExperience(level),
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
// Free, no auth. Fully remote jobs with clean JSON.

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
        jobType: mapJobType(j.jobType || "full-time"),
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
// Free, no auth. Curated remote jobs.

async function fetchWorkingNomads(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://www.workingnomads.com/api/exposed_jobs/", {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jobs: any[] = await res.json();
    return (Array.isArray(jobs) ? jobs : []).filter(j => j.url && j.title).map(j => ({
      ...base(),
      title: j.title || "Remote Role",
      company: j.company_name || "Remote Company",
      description: stripHtml(j.description || j.title || ""),
      location: "Remote — Worldwide",
      country: "Remote",
      source: "Working Nomads",
      sourceUrl: j.url,
      applyUrl: j.url,
      liveSource: "workingnomads",
      category: mapCategory([], j.title || "", j.description || ""),
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

// ── 7 & 8. Adzuna (South Africa + Nigeria) ───────────────────────────────────
// Free API key required. Register at https://developer.adzuna.com (free tier: 250 req/day)
// Set ADZUNA_APP_ID and ADZUNA_APP_KEY in environment variables.

async function fetchAdzunaCountry(
  country: string,
  countryLabel: string,
  maxPages = 10,
): Promise<InsertAggregatedJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const allJobs: InsertAggregatedJob[] = [];
  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=50&content-type=application/json&sort_by=date`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) break;
      const data = await res.json();
      const jobs: any[] = data.results || [];
      if (jobs.length === 0) break;
      for (const j of jobs) {
        const applyUrl = j.redirect_url || null;
        if (!applyUrl) continue;
        allJobs.push({
          ...base(),
          title: j.title || "Open Role",
          company: j.company?.display_name || "Company",
          description: stripHtml(j.description || j.title || ""),
          location: j.location?.display_name || countryLabel,
          province: j.location?.area?.[2] || j.location?.area?.[1] || "National",
          country: countryLabel,
          salaryMin: j.salary_min ? Math.round(j.salary_min) : null,
          salaryMax: j.salary_max ? Math.round(j.salary_max) : null,
          salaryPeriod: "year",
          source: `Adzuna ${countryLabel}`,
          sourceUrl: applyUrl,
          applyUrl,
          liveSource: `adzuna_${country}`,
          category: mapCategory([], j.title || "", j.description || ""),
          jobType: mapJobType(j.contract_time || "full-time"),
          skills: j.category?.label || "",
          postedDate: j.created ? new Date(j.created) : new Date(),
          isRemote: (j.title || "").toLowerCase().includes("remote") ||
                    (j.description || "").toLowerCase().includes("remote"),
        } satisfies InsertAggregatedJob);
      }
    }
  } catch (err: any) {
    log(`[LiveFetcher] Adzuna ${countryLabel}: ${err.message}`, "warn");
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
  log("[LiveFetcher] Starting REAL job fetch from 8 sources...", "jobs");

  const [remotive, remoteok, arbeitnow, muse, himalayas, nomads, adzunaSA, adzunaNG] =
    await Promise.all([
      fetchRemotive(),
      fetchRemoteOK(),
      fetchArbeitnow(),
      fetchTheMuse(),
      fetchHimalayas(),
      fetchWorkingNomads(),
      fetchAdzunaCountry("za", "South Africa", 10),
      fetchAdzunaCountry("ng", "Nigeria", 4),
    ]);

  const sourceCounts: Record<string, number> = {
    remotive: remotive.length,
    remoteok: remoteok.length,
    arbeitnow: arbeitnow.length,
    themuse: muse.length,
    himalayas: himalayas.length,
    workingnomads: nomads.length,
    adzuna_za: adzunaSA.length,
    adzuna_ng: adzunaNG.length,
  };

  const allLive = [
    ...remotive, ...remoteok, ...arbeitnow,
    ...muse, ...himalayas, ...nomads,
    ...adzunaSA, ...adzunaNG,
  ];

  log(
    `[LiveFetcher] Fetched ${allLive.length} real jobs — ` +
    Object.entries(sourceCounts).map(([k, v]) => `${k}:${v}`).join(", "),
    "jobs",
  );

  // Build dedup key set from existing REAL jobs only
  const existing = await storage.getAggregatedJobs();
  const existingKeys = new Set(
    existing.map(j => `${j.title.toLowerCase().trim()}|${j.company.toLowerCase().trim()}`),
  );

  let inserted = 0;
  for (const job of allLive) {
    if (!job.applyUrl) continue; // skip jobs with no apply link
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    if (existingKeys.has(key)) continue;
    try {
      await storage.createAggregatedJob(job);
      existingKeys.add(key);
      inserted++;
    } catch {
      // duplicate constraint — skip
    }
  }

  const total = await storage.getAggregatedJobCount();
  log(`[LiveFetcher] Done — inserted ${inserted} new real jobs, total now: ${total}`, "jobs");

  return { inserted, deleted: 0, total, sources: sourceCounts };
}

/**
 * Wipe all AI-generated (fake) jobs and replace with only real live jobs.
 * Called once on startup if fake jobs are detected.
 */
export async function purgeAndRefresh(): Promise<LiveFetchResult> {
  log("[LiveFetcher] Purging ALL AI-generated fake jobs...", "jobs");
  const deleted = await storage.deleteAgentGeneratedJobs();
  log(`[LiveFetcher] Purged ${deleted} fake jobs from DB`, "jobs");
  const result = await fetchAndStoreLiveJobs();
  return { ...result, deleted };
}
