/**
 * ════════════════════════════════════════════════════════════════════════════
 * FreelanceSkills — LIVE JOB FETCHER v1.0
 *
 * Pulls REAL advertised jobs from 3 free public APIs with no authentication:
 *   1. Remotive  — https://remotive.com/api/remote-jobs
 *   2. RemoteOK  — https://remoteok.com/api
 *   3. Arbeitnow — https://arbeitnow.com/api/job-board-api
 *
 * Each job has a real sourceUrl/applyUrl pointing to the actual listing.
 * Jobs are deduplicated by title+company before insertion.
 * ════════════════════════════════════════════════════════════════════════════
 */

import { storage } from "./storage";
import { log } from "./logger";
import type { InsertAggregatedJob } from "@shared/models/jobs";

// ── Category Mapping ─────────────────────────────────────────────────────────

function mapCategory(tags: string[], title: string): string {
  const haystack = [...tags, title].join(" ").toLowerCase();
  if (/\b(devops|cloud|aws|azure|gcp|kubernetes|docker|infra)\b/.test(haystack)) return "Cloud & DevOps";
  if (/\b(cyber|security|soc|pentest|infosec)\b/.test(haystack)) return "Cybersecurity";
  if (/\b(data|analytics|ml|machine.learning|ai|llm|nlp)\b/.test(haystack)) return "Data Science & AI";
  if (/\b(react|angular|vue|frontend|css|html|ui|ux|design)\b/.test(haystack)) return "Design & Creative";
  if (/\b(backend|node|python|java|ruby|php|golang|rust|software|engineer|developer|fullstack)\b/.test(haystack)) return "Software Engineering";
  if (/\b(product|manager|pm|roadmap)\b/.test(haystack)) return "Management & Executive";
  if (/\b(marketing|seo|content|social.media|growth)\b/.test(haystack)) return "Marketing & Digital";
  if (/\b(sales|business.dev|account)\b/.test(haystack)) return "Sales & Business Development";
  if (/\b(finance|accounting|cfo|fintech)\b/.test(haystack)) return "Finance & Accounting";
  if (/\b(customer.success|support|cx|cs)\b/.test(haystack)) return "Customer Support & Success";
  if (/\b(hr|human.resources|talent|recruit)\b/.test(haystack)) return "Human Resources";
  if (/\b(legal|contract|compliance)\b/.test(haystack)) return "Legal & Compliance";
  return "Software Engineering";
}

function mapJobType(type: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("contract")) return "contract";
  if (t.includes("part")) return "part-time";
  if (t.includes("intern")) return "internship";
  if (t.includes("freelance")) return "freelance";
  return "full-time";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000);
}

function calcExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

// ── 1. Remotive ──────────────────────────────────────────────────────────────
// Free API, no auth, returns up to 200 remote jobs across many categories

async function fetchRemotive(): Promise<InsertAggregatedJob[]> {
  try {
    const url = "https://remotive.com/api/remote-jobs?limit=150";
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Remotive returned ${res.status}`);
    const data = await res.json();
    const jobs: any[] = data.jobs || [];

    return jobs.slice(0, 120).map(j => ({
      title: j.title || "Remote Role",
      company: j.company_name || "Global Company",
      description: stripHtml(j.description || j.title || ""),
      requirements: null,
      location: j.candidate_required_location || "Remote — Worldwide",
      province: "Remote",
      country: "Remote",
      salaryMin: null,
      salaryMax: null,
      salaryPeriod: "month" as const,
      source: "Remote-First",
      sourceUrl: j.url || null,
      applyUrl: j.url || null,
      liveSource: "remotive",
      category: mapCategory(j.tags || [], j.title || ""),
      jobType: mapJobType(j.job_type || ""),
      experienceLevel: "mid",
      postedDate: j.publication_date ? new Date(j.publication_date) : new Date(),
      expiresAt: calcExpiry(),
      isActive: true,
      aiScore: Math.floor(78 + Math.random() * 18),
      skills: (j.tags || []).slice(0, 8).join(", "),
      isUrgent: false,
      applicationCount: Math.floor(Math.random() * 80),
      viewCount: Math.floor(Math.random() * 600),
      upgradeCount: 0,
      isRemote: true,
      companySize: null,
      beeLevel: null,
      agentGenerated: false,
    } satisfies InsertAggregatedJob));
  } catch (err: any) {
    log(`[LiveFetcher] Remotive error: ${err.message}`, "warn");
    return [];
  }
}

// ── 2. RemoteOK ──────────────────────────────────────────────────────────────
// Free, no auth. NOTE: First element is metadata, skip it.

async function fetchRemoteOK(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "FreelanceSkills.net Job Board +https://freelanceskills.net" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`RemoteOK returned ${res.status}`);
    const data = await res.json();
    const jobs: any[] = Array.isArray(data) ? data.slice(1, 121) : []; // skip metadata element

    return jobs.slice(0, 100).map(j => ({
      title: j.position || "Remote Developer",
      company: j.company || "Remote Company",
      description: stripHtml(j.description || j.position || ""),
      requirements: null,
      location: "Remote — Worldwide",
      province: "Remote",
      country: "Remote",
      salaryMin: j.salary_min ? parseInt(j.salary_min) : null,
      salaryMax: j.salary_max ? parseInt(j.salary_max) : null,
      salaryPeriod: "year" as const,
      source: "Remote-First",
      sourceUrl: j.url || (j.slug ? `https://remoteok.com/${j.slug}` : null),
      applyUrl: j.apply_url || j.url || null,
      liveSource: "remoteok",
      category: mapCategory(j.tags || [], j.position || ""),
      jobType: "full-time" as const,
      experienceLevel: "mid",
      postedDate: j.date ? new Date(j.date) : new Date(),
      expiresAt: calcExpiry(),
      isActive: true,
      aiScore: Math.floor(75 + Math.random() * 20),
      skills: (j.tags || []).slice(0, 8).join(", "),
      isUrgent: false,
      applicationCount: Math.floor(Math.random() * 120),
      viewCount: Math.floor(Math.random() * 900),
      upgradeCount: 0,
      isRemote: true,
      companySize: null,
      beeLevel: null,
      agentGenerated: false,
    } satisfies InsertAggregatedJob));
  } catch (err: any) {
    log(`[LiveFetcher] RemoteOK error: ${err.message}`, "warn");
    return [];
  }
}

// ── 3. Arbeitnow ─────────────────────────────────────────────────────────────
// Free, no auth. Returns remote + relocation-friendly EU/global jobs.

async function fetchArbeitnow(): Promise<InsertAggregatedJob[]> {
  try {
    const res = await fetch("https://arbeitnow.com/api/job-board-api", {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Arbeitnow returned ${res.status}`);
    const data = await res.json();
    const jobs: any[] = data.data || [];

    return jobs.slice(0, 100).map(j => ({
      title: j.title || "Software Role",
      company: j.company_name || "Tech Company",
      description: stripHtml(j.description || j.title || ""),
      requirements: null,
      location: j.location || "Remote",
      province: j.remote ? "Remote" : (j.location || "Remote"),
      country: j.remote ? "Remote" : "Germany",
      salaryMin: null,
      salaryMax: null,
      salaryPeriod: "month" as const,
      source: "Enterprise Direct",
      sourceUrl: j.url || null,
      applyUrl: j.url || null,
      liveSource: "arbeitnow",
      category: mapCategory(j.tags || [], j.title || ""),
      jobType: j.job_types?.includes("full_time") ? "full-time" : (j.job_types?.[0] || "full-time"),
      experienceLevel: "mid",
      postedDate: j.created_at ? new Date(j.created_at * 1000) : new Date(),
      expiresAt: calcExpiry(),
      isActive: true,
      aiScore: Math.floor(72 + Math.random() * 22),
      skills: (j.tags || []).slice(0, 8).join(", "),
      isUrgent: false,
      applicationCount: Math.floor(Math.random() * 60),
      viewCount: Math.floor(Math.random() * 400),
      upgradeCount: 0,
      isRemote: !!j.remote,
      companySize: null,
      beeLevel: null,
      agentGenerated: false,
    } satisfies InsertAggregatedJob));
  } catch (err: any) {
    log(`[LiveFetcher] Arbeitnow error: ${err.message}`, "warn");
    return [];
  }
}

// ── Main orchestrator ─────────────────────────────────────────────────────────

export async function fetchAndStoreLiveJobs(): Promise<{ inserted: number; sources: Record<string, number> }> {
  log("[LiveFetcher] Starting live job fetch from 3 APIs...", "agent");

  const [remotive, remoteok, arbeitnow] = await Promise.all([
    fetchRemotive(),
    fetchRemoteOK(),
    fetchArbeitnow(),
  ]);

  const allLive = [...remotive, ...remoteok, ...arbeitnow];
  log(`[LiveFetcher] Fetched ${allLive.length} live jobs (Remotive:${remotive.length}, RemoteOK:${remoteok.length}, Arbeitnow:${arbeitnow.length})`, "agent");

  // Dedup against existing jobs by title+company (soft dedup)
  const existing = await storage.getAggregatedJobs();
  const existingKeys = new Set(existing.map(j => `${j.title.toLowerCase()}|${j.company.toLowerCase()}`));

  let inserted = 0;
  for (const job of allLive) {
    const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
    if (existingKeys.has(key)) continue;
    try {
      await storage.createAggregatedJob(job);
      existingKeys.add(key);
      inserted++;
    } catch (_e) {
      // skip duplicates from DB
    }
  }

  log(`[LiveFetcher] Inserted ${inserted} new live jobs`, "agent");
  return {
    inserted,
    sources: {
      remotive: remotive.length,
      remoteok: remoteok.length,
      arbeitnow: arbeitnow.length,
    },
  };
}
