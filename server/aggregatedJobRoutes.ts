/**
 * FreelanceSkills — Aggregated Jobs API Routes
 * Exposes AI-powered job listings + AI Apply system + Application Tracking
 */

import { type Express, type Request, type Response } from "express";
import { storage } from "./storage";
import { log } from "./logger";
import { db } from "./db";
import { aggregatedJobs } from "@shared/models/jobs";
import { eq, sql } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export function registerAggregatedJobRoutes(app: Express) {

  // ── GET /api/aggregated-jobs ─────────────────────────────────────────────
  app.get("/api/aggregated-jobs", async (req: Request, res: Response) => {
    try {
      const {
        province, country, category, source, jobType, experienceLevel,
        isUrgent, isRemote, search, limit,
      } = req.query as Record<string, string>;

      const jobs = await storage.searchAggregatedJobs({
        province: province || undefined,
        country: country || undefined,
        category: category || undefined,
        source: source || undefined,
        jobType: jobType || undefined,
        experienceLevel: experienceLevel || undefined,
        isUrgent: isUrgent === "true" ? true : undefined,
        isRemote: isRemote === "true" ? true : undefined,
        search: search || undefined,
        limit: limit ? parseInt(limit) : 500,
      });

      res.json({ jobs, total: jobs.length });
    } catch (err: any) {
      log(`GET /api/aggregated-jobs error: ${err.message}`, "error");
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  // ── GET /api/aggregated-jobs/stats ──────────────────────────────────────
  app.get("/api/aggregated-jobs/stats", async (_req: Request, res: Response) => {
    try {
      const { getAgentStats } = await import("./jobAgent");
      const stats = await getAgentStats();
      res.json(stats);
    } catch (err: any) {
      log(`GET /api/aggregated-jobs/stats error: ${err.message}`, "error");
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // ── GET /api/aggregated-jobs/:id ─────────────────────────────────────────
  app.get("/api/aggregated-jobs/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const job = await storage.getAggregatedJobById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });
      storage.incrementAggregatedJobView(id).catch(() => {});
      res.json(job);
    } catch (err: any) {
      log(`GET /api/aggregated-jobs/:id error: ${err.message}`, "error");
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // ── POST /api/aggregated-jobs/:id/ai-apply ───────────────────────────────
  // Generates AI cover letter + employability score, records application
  app.post("/api/aggregated-jobs/:id/ai-apply", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const job = await storage.getAggregatedJobById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });

      const { resumeSummary = "", userProfile = {} } = req.body;

      // ── AI Cover Letter ───────────────────────────────────────────────────
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

      // Track application in DB if user is authenticated
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

      // Increment application counter
      await storage.incrementAggregatedJobApplication(id).catch(() => {});

      res.json({
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
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/aggregated-jobs/:id/apply ─────────────────────────────────
  // Simple apply tracking (without AI) — kept for backward compatibility
  app.post("/api/aggregated-jobs/:id/apply", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const job = await storage.getAggregatedJobById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });

      await storage.incrementAggregatedJobApplication(id);

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

      res.json({
        success: true,
        redirectUrl: job.applyUrl || job.sourceUrl || null,
        message: "Application tracked. Redirecting to job listing…",
      });
    } catch (err: any) {
      log(`POST /api/aggregated-jobs/:id/apply error: ${err.message}`, "error");
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/my-applications ─────────────────────────────────────────────
  // Returns the authenticated user's application history
  app.get("/api/my-applications", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Authentication required" });
      const applications = await storage.getUserApplications(user.id || user.uid);
      res.json({ applications, total: applications.length });
    } catch (err: any) {
      log(`GET /api/my-applications error: ${err.message}`, "error");
      res.status(500).json({ error: err.message });
    }
  });

  // ── PATCH /api/my-applications/:id ──────────────────────────────────────
  // Update application status, notes, interview date
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
      res.json(updated);
    } catch (err: any) {
      log(`PATCH /api/my-applications/:id error: ${err.message}`, "error");
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/aggregated-jobs/sync ──────────────────────────────────────
  app.post("/api/aggregated-jobs/sync", async (req: Request, res: Response) => {
    try {
      const { batchSize = 20 } = req.body;
      const { runFullJobAgentSync } = await import("./jobAgent");
      const result = await runFullJobAgentSync(batchSize);
      res.json({ success: true, ...result });
    } catch (err: any) {
      log(`POST /api/aggregated-jobs/sync error: ${err.message}`, "error");
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/aggregated-jobs/live-fetch ────────────────────────────────
  // Manually trigger live job fetch from external APIs
  app.post("/api/aggregated-jobs/live-fetch", async (_req: Request, res: Response) => {
    try {
      const { fetchAndStoreLiveJobs } = await import("./liveJobFetcher");
      const result = await fetchAndStoreLiveJobs();
      const total = await storage.getAggregatedJobCount();
      res.json({ success: true, ...result, totalActive: total });
    } catch (err: any) {
      log(`POST /api/aggregated-jobs/live-fetch error: ${err.message}`, "error");
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/aggregated-jobs/seed ──────────────────────────────────────
  app.post("/api/aggregated-jobs/seed", async (_req: Request, res: Response) => {
    try {
      const { seedInitialJobs } = await import("./jobAgent");
      await seedInitialJobs();
      const total = await storage.getAggregatedJobCount();
      res.json({ success: true, total });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Startup: purge fake jobs, fetch all real jobs, then refresh every 30min ─
  (async () => {
    try {
      const { purgeAndRefresh, fetchAndStoreLiveJobs } = await import("./liveJobFetcher");

      // First check: wipe any AI-generated (fake) jobs still in DB
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

      // Refresh real jobs every 30 minutes
      setInterval(async () => {
        try {
          const result = await fetchAndStoreLiveJobs();
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
