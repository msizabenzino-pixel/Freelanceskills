/**
 * FreelanceSkills — Aggregated Jobs API Routes v2.0
 * ==================================================
 * 10x backend improvements:
 *  - Zod input validation on all query params (no raw string passthrough)
 *  - In-memory response caching (2-min TTL for listings, 5-min for stats)
 *  - Cache-Control headers so browsers don't hammer the API
 *  - Cursor-based pagination (avoids re-sorting 100k rows per page)
 *  - Per-route rate limiting on AI-apply (5 req / 10 min per IP)
 *  - Cache invalidation on sync/live-fetch completion
 *  - Africa remote-fallback preserved and cached correctly
 */

import { type Express, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { log } from "./logger";
import { cache } from "./fortify";
import { db } from "./db";
import { aggregatedJobs } from "@shared/models/jobs";
import { eq, sql } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// ── Known Adzuna-supported country list (exact DB values) ─────────────────────
const AFRICAN_COUNTRIES = new Set([
  "Nigeria", "Kenya", "Ghana", "Egypt", "Morocco", "Ethiopia", "Tanzania",
  "Uganda", "Rwanda", "Senegal", "Côte d'Ivoire", "Zimbabwe", "Zambia",
  "Botswana", "Namibia", "Mozambique", "Cameroon", "Angola", "Tunisia",
  "Algeria", "Malawi", "Lesotho", "Eswatini", "Libya", "Sudan",
]);

// ── Zod schemas ───────────────────────────────────────────────────────────────

const jobListQuerySchema = z.object({
  country:         z.string().max(60).optional(),
  province:        z.string().max(60).optional(),
  category:        z.string().max(80).optional(),
  source:          z.string().max(80).optional(),
  jobType:         z.enum(["full-time", "part-time", "contract", "freelance", "internship", "learnership"]).optional(),
  experienceLevel: z.enum(["entry", "junior", "mid", "senior", "executive"]).optional(),
  isUrgent:        z.enum(["true", "false"]).optional(),
  isRemote:        z.enum(["true", "false"]).optional(),
  search:          z.string().max(200).optional(),
  limit:           z.coerce.number().int().min(1).max(500).default(200),
  cursorScore:     z.coerce.number().int().min(0).max(100).optional(),
  cursorId:        z.string().max(50).optional(),
});

type JobListQuery = z.infer<typeof jobListQuerySchema>;

// ── Per-route IP rate limiter (lightweight, no Redis needed) ──────────────────
const aiApplyLimits = new Map<string, { count: number; resetAt: number }>();

function aiApplyRateLimit(req: Request, res: Response, next: () => void) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const max = 5;

  const entry = aiApplyLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    aiApplyLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }
  entry.count++;
  if (entry.count > max) {
    res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
    return res.status(429).json({ error: "Too many AI applications. Please wait 10 minutes." });
  }
  next();
}

// Clean up expired rate-limit entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of aiApplyLimits) {
    if (now > v.resetAt) aiApplyLimits.delete(k);
  }
}, 15 * 60 * 1000);

// ── Cache key builder ─────────────────────────────────────────────────────────
function buildCacheKey(params: JobListQuery): string {
  // Stable key regardless of param order
  return "jobs:" + [
    params.country || "",
    params.province || "",
    params.category || "",
    params.source || "",
    params.jobType || "",
    params.experienceLevel || "",
    params.isUrgent || "",
    params.isRemote || "",
    params.search || "",
    params.limit,
    params.cursorScore ?? "",
    params.cursorId || "",
  ].join("|");
}

// ── Route registration ────────────────────────────────────────────────────────

export function registerAggregatedJobRoutes(app: Express) {

  // ── GET /api/aggregated-jobs ───────────────────────────────────────────────
  // Main job board endpoint. Validated, cached, cursor-paginated.
  app.get("/api/aggregated-jobs", async (req: Request, res: Response) => {
    // 1. Validate & parse
    const parsed = jobListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
    }
    const params = parsed.data;

    // 2. Check cache
    const cacheKey = buildCacheKey(params);
    const cached = cache.get<{ jobs: unknown[]; total: number; remoteFallback: boolean; remoteFallbackCountry?: string }>(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=60");
      return res.json(cached);
    }

    try {
      // 3. Query DB
      const jobs = await storage.searchAggregatedJobs({
        province:        params.province,
        country:         params.country,
        category:        params.category,
        source:          params.source,
        jobType:         params.jobType,
        experienceLevel: params.experienceLevel,
        isUrgent:        params.isUrgent === "true" ? true : undefined,
        isRemote:        params.isRemote === "true" ? true : undefined,
        search:          params.search,
        limit:           params.limit,
        cursorScore:     params.cursorScore,
        cursorId:        params.cursorId,
      });

      // 4. Africa remote-fallback
      const hasCountryFilter = !!params.country && params.country !== "all";
      const isNonSAAfricanCountry = hasCountryFilter && params.country !== "South Africa" && AFRICAN_COUNTRIES.has(params.country!);

      let finalJobs = jobs;
      let remoteFallback = false;

      if (isNonSAAfricanCountry && jobs.length < 5) {
        finalJobs = await storage.searchAggregatedJobs({
          category:        params.category,
          source:          params.source,
          jobType:         params.jobType,
          experienceLevel: params.experienceLevel,
          isRemote:        true,
          search:          params.search,
          limit:           Math.min(params.limit, 200),
        });
        remoteFallback = finalJobs.length > 0;
      }

      // 5. Build response
      const payload = {
        jobs: finalJobs,
        total: finalJobs.length,
        remoteFallback,
        remoteFallbackCountry: remoteFallback ? params.country : undefined,
      };

      // 6. Store in cache (2 minutes TTL)
      cache.set(cacheKey, payload, 120);

      // 7. Response headers
      res.setHeader("X-Cache", "MISS");
      res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=60");
      return res.json(payload);

    } catch (err: any) {
      log(`GET /api/aggregated-jobs error: ${err.message}`, "error");
      return res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  // ── GET /api/aggregated-jobs/stats ────────────────────────────────────────
  // Expensive aggregate query — cache for 5 minutes.
  app.get("/api/aggregated-jobs/stats", async (_req: Request, res: Response) => {
    const STATS_CACHE_KEY = "jobs:stats:v2";
    const cached = cache.get<unknown>(STATS_CACHE_KEY);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cached);
    }

    try {
      const { getAgentStats } = await import("./jobAgent");
      const stats = await getAgentStats();
      cache.set(STATS_CACHE_KEY, stats, 300); // 5 minutes
      res.setHeader("X-Cache", "MISS");
      return res.json(stats);
    } catch (err: any) {
      log(`GET /api/aggregated-jobs/stats error: ${err.message}`, "error");
      return res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // ── GET /api/aggregated-jobs/:id ──────────────────────────────────────────
  app.get("/api/aggregated-jobs/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id || id.length > 50) return res.status(400).json({ error: "Invalid job ID" });

      const JOB_CACHE_KEY = `job:${id}`;
      const cachedJob = cache.get<unknown>(JOB_CACHE_KEY);
      if (cachedJob) {
        res.setHeader("X-Cache", "HIT");
        // Fire-and-forget view increment even on cache hit
        storage.incrementAggregatedJobView(id).catch(() => {});
        return res.json(cachedJob);
      }

      const job = await storage.getAggregatedJobById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });

      cache.set(JOB_CACHE_KEY, job, 300); // 5 minutes
      storage.incrementAggregatedJobView(id).catch(() => {});

      res.setHeader("X-Cache", "MISS");
      return res.json(job);
    } catch (err: any) {
      log(`GET /api/aggregated-jobs/:id error: ${err.message}`, "error");
      return res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // ── POST /api/aggregated-jobs/:id/ai-apply ────────────────────────────────
  // Generates AI cover letter + employability score.
  // Rate-limited: 5 calls per 10 minutes per IP.
  app.post("/api/aggregated-jobs/:id/ai-apply", aiApplyRateLimit, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const job = await storage.getAggregatedJobById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });

      const { resumeSummary = "", userProfile = {} } = req.body;

      let aiCoverLetter = "";
      let employabilityScore = 70;
      let interviewTips: string[] = [];

      try {
        const aiRes = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are Africa's #1 job application coach at FreelanceSkills.net. 
You generate winning, highly personalised cover letters and honest employability assessments.
Output JSON with: coverLetter (string, 3 paragraphs, 250-350 words, warm professional tone), 
employabilityScore (integer 55-95), 
scoreBreakdown (object: skillsMatch, experienceLevel, marketDemand each 0-100),
interviewTips (array of 4 specific tips for this role),
strengthsToHighlight (array of 3 strings).`,
            },
            {
              role: "user",
              content: `Job: ${job.title} at ${job.company}
Location: ${job.location}, ${job.country || job.province}
Category: ${job.category} | Type: ${job.jobType} | Level: ${job.experienceLevel || "mid"}
Description: ${(job.description || "").slice(0, 600)}
Requirements: ${(job.requirements || "").slice(0, 400)}
Skills needed: ${job.skills || ""}

Candidate profile: ${resumeSummary || "Experienced professional seeking new opportunities in Africa"}
${JSON.stringify(userProfile).slice(0, 300)}

Generate a personalised cover letter and honest employability assessment.`,
            },
          ],
        });

        const parsed = JSON.parse(aiRes.choices[0].message.content || "{}");
        aiCoverLetter = parsed.coverLetter || "";
        employabilityScore = Math.min(95, Math.max(55, parsed.employabilityScore || 70));
        interviewTips = parsed.interviewTips || [];
      } catch (aiErr: any) {
        log(`AI apply generation error: ${aiErr.message}`, "warn");
        aiCoverLetter = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background and passion for excellence, I am confident in my ability to contribute meaningfully to your team.\n\nI am particularly drawn to this opportunity because it aligns perfectly with my career goals and the skills I have developed. I look forward to bringing my dedication and expertise to ${job.company}.\n\nThank you for considering my application. I welcome the opportunity to discuss how I can contribute to your organization's success.\n\nSincerely,\n[Your Name]`;
        employabilityScore = 72;
        interviewTips = [
          "Research the company thoroughly before your interview",
          "Prepare specific examples using the STAR method",
          "Ask thoughtful questions about the team and growth opportunities",
          "Follow up with a thank-you email within 24 hours",
        ];
      }

      const user = (req as any).user;
      let applicationId: string | null = null;
      if (user) {
        try {
          const application = await storage.createJobApplication({
            userId: user.id || user.uid,
            jobId: null,
            aggregatedJobId: id,
            jobTitle: job.title,
            company: job.company,
            location: `${job.location}, ${job.country || job.province}`,
            coverLetter: req.body.coverLetter || null,
            aiCoverLetter,
            resumeSummary: resumeSummary || null,
            employabilityScore,
            source: job.source,
            applyUrl: job.applyUrl || job.sourceUrl || null,
          });
          applicationId = application.id;
        } catch (e: any) {
          log(`Could not record application: ${e.message}`, "warn");
        }
      }

      await storage.incrementAggregatedJobApplication(id).catch(() => {});
      // Invalidate individual job cache so view/application counts update
      cache.invalidate(`job:${id}`);

      return res.json({
        success: true,
        applicationId,
        aiCoverLetter,
        employabilityScore,
        interviewTips,
        applyUrl: job.applyUrl || job.sourceUrl || null,
        message: `Your AI-optimised application is ready! Employability score: ${employabilityScore}%`,
      });
    } catch (err: any) {
      log(`POST /api/aggregated-jobs/:id/ai-apply error: ${err.message}`, "error");
      return res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/aggregated-jobs/:id/apply ───────────────────────────────────
  app.post("/api/aggregated-jobs/:id/apply", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const job = await storage.getAggregatedJobById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });

      await storage.incrementAggregatedJobApplication(id);
      cache.invalidate(`job:${id}`);

      const user = (req as any).user;
      if (user) {
        try {
          await storage.createJobApplication({
            userId: user.id || user.uid,
            jobId: null,
            aggregatedJobId: id,
            jobTitle: job.title,
            company: job.company,
            location: `${job.location}, ${job.country || job.province}`,
            coverLetter: req.body.coverLetter || null,
            resumeSummary: req.body.resumeSummary || null,
            source: job.source,
            applyUrl: job.applyUrl || job.sourceUrl || null,
          });
        } catch (_e) {
          log(`Could not record application: ${_e}`, "warn");
        }
      }

      return res.json({
        success: true,
        redirectUrl: job.applyUrl || job.sourceUrl || null,
        message: "Application tracked. Redirecting to job listing…",
      });
    } catch (err: any) {
      log(`POST /api/aggregated-jobs/:id/apply error: ${err.message}`, "error");
      return res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/my-applications ──────────────────────────────────────────────
  app.get("/api/my-applications", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Authentication required" });
      const applications = await storage.getUserApplications(user.id || user.uid);
      return res.json({ applications, total: applications.length });
    } catch (err: any) {
      log(`GET /api/my-applications error: ${err.message}`, "error");
      return res.status(500).json({ error: err.message });
    }
  });

  // ── PATCH /api/my-applications/:id ───────────────────────────────────────
  app.patch("/api/my-applications/:id", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Authentication required" });
      const { id } = req.params;
      const { status, notes, interviewDate } = req.body;
      const updated = await storage.updateJobApplication(id, {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(interviewDate && { interviewDate: new Date(interviewDate) }),
      });
      if (!updated) return res.status(404).json({ error: "Application not found" });
      return res.json(updated);
    } catch (err: any) {
      log(`PATCH /api/my-applications/:id error: ${err.message}`, "error");
      return res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/aggregated-jobs/sync ────────────────────────────────────────
  app.post("/api/aggregated-jobs/sync", async (req: Request, res: Response) => {
    try {
      const { batchSize = 20 } = req.body;
      const { runFullJobAgentSync } = await import("./jobAgent");
      const result = await runFullJobAgentSync(batchSize);
      // Bust the entire jobs cache so users see fresh data immediately
      cache.invalidate("jobs:");
      cache.invalidate("jobs:stats");
      return res.json({ success: true, ...result });
    } catch (err: any) {
      log(`POST /api/aggregated-jobs/sync error: ${err.message}`, "error");
      return res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/aggregated-jobs/live-fetch ──────────────────────────────────
  app.post("/api/aggregated-jobs/live-fetch", async (_req: Request, res: Response) => {
    try {
      const { fetchAndStoreLiveJobs } = await import("./liveJobFetcher");
      const result = await fetchAndStoreLiveJobs();
      const total = await storage.getAggregatedJobCount();
      // Bust job listing caches after fresh data is inserted
      cache.invalidate("jobs:");
      cache.invalidate("jobs:stats");
      return res.json({ success: true, ...result, totalActive: total });
    } catch (err: any) {
      log(`POST /api/aggregated-jobs/live-fetch error: ${err.message}`, "error");
      return res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/aggregated-jobs/seed ───────────────────────────────────────
  app.post("/api/aggregated-jobs/seed", async (_req: Request, res: Response) => {
    try {
      const { seedInitialJobs } = await import("./jobAgent");
      await seedInitialJobs();
      const total = await storage.getAggregatedJobCount();
      cache.invalidate("jobs:");
      return res.json({ success: true, total });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Startup lifecycle: purge fake jobs → fetch real jobs → refresh every 30min ─
  (async () => {
    try {
      const { purgeAndRefresh, fetchAndStoreLiveJobs } = await import("./liveJobFetcher");

      const fakeCount = await db.select({ count: sql<number>`cast(count(*) as integer)` })
        .from(aggregatedJobs)
        .where(eq(aggregatedJobs.agentGenerated, true));
      const fake = fakeCount[0]?.count || 0;

      if (fake > 0) {
        log(`[Jobs] Detected ${fake} fake AI-generated jobs — purging and replacing with real jobs`, "jobs");
        await purgeAndRefresh();
      } else {
        log("[Jobs] No fake jobs detected — running live refresh", "jobs");
        await fetchAndStoreLiveJobs();
      }
      // Bust cache after initial load
      cache.invalidate("jobs:");
      cache.invalidate("jobs:stats");

      // Refresh every 30 minutes and bust cache each time
      setInterval(async () => {
        try {
          const result = await fetchAndStoreLiveJobs();
          cache.invalidate("jobs:");
          cache.invalidate("jobs:stats");
          log(`[Jobs] 30-min refresh: +${result.inserted} new real jobs, total: ${result.total}`, "jobs");
        } catch (e: any) {
          log(`[Jobs] 30-min refresh error: ${e.message}`, "warn");
        }
      }, 30 * 60 * 1000);

    } catch (err: any) {
      log(`[Jobs] Startup error (non-fatal): ${err.message}`, "warn");
    }
  })();

  log("Aggregated job routes registered", "routes");
}
