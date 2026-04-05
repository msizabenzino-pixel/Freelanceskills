/**
 * FreelanceSkills — Aggregated Jobs API Routes
 * Exposes AI-powered job listings to the frontend
 */

import { type Express, type Request, type Response } from "express";
import { storage } from "./storage";
import { log } from "./logger";

export function registerAggregatedJobRoutes(app: Express) {

  // ── GET /api/aggregated-jobs ─────────────────────────────────────────────
  // Returns active aggregated jobs with filtering & search
  app.get("/api/aggregated-jobs", async (req: Request, res: Response) => {
    try {
      const {
        province, category, source, jobType, experienceLevel,
        isUrgent, isRemote, search, limit,
      } = req.query as Record<string, string>;

      const jobs = await storage.searchAggregatedJobs({
        province: province || undefined,
        category: category || undefined,
        source: source || undefined,
        jobType: jobType || undefined,
        experienceLevel: experienceLevel || undefined,
        isUrgent: isUrgent === "true" ? true : undefined,
        isRemote: isRemote === "true" ? true : undefined,
        search: search || undefined,
        limit: limit ? parseInt(limit) : 200,
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

      // Increment view count (fire-and-forget)
      storage.incrementAggregatedJobView(id).catch(() => {});

      res.json(job);
    } catch (err: any) {
      log(`GET /api/aggregated-jobs/:id error: ${err.message}`, "error");
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // ── POST /api/aggregated-jobs/sync ──────────────────────────────────────
  // Admin: manually trigger the AI job agent
  app.post("/api/aggregated-jobs/sync", async (req: Request, res: Response) => {
    try {
      const { batchSize = 20, useAI = true } = req.body;
      const { runFullJobAgentSync } = await import("./jobAgent");
      const result = await runFullJobAgentSync(batchSize);
      res.json({ success: true, ...result });
    } catch (err: any) {
      log(`POST /api/aggregated-jobs/sync error: ${err.message}`, "error");
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/aggregated-jobs/:id/apply ─────────────────────────────────
  // Track application + increment counter
  app.post("/api/aggregated-jobs/:id/apply", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const job = await storage.getAggregatedJobById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });

      // Increment application count
      await storage.incrementAggregatedJobApplication(id);

      // If user is authenticated, also record application in jobApplications table
      const user = (req as any).user;
      if (user) {
        try {
          const { jobId, coverLetter, resumeSummary } = req.body;
          await storage.createJobApplication({
            userId: user.id || user.uid,
            jobId: null,
            aggregatedJobId: id,
            jobTitle: job.title,
            company: job.company,
            coverLetter: coverLetter || null,
            resumeSummary: resumeSummary || null,
            source: job.source,
          });
        } catch (_e) {
          // Non-critical — just log and continue
          log(`Could not record application in DB: ${_e}`, "warn");
        }
      }

      res.json({
        success: true,
        redirectUrl: job.sourceUrl || `https://www.pnet.co.za/jobs`,
        message: "Application tracked. Redirecting to job portal...",
      });
    } catch (err: any) {
      log(`POST /api/aggregated-jobs/:id/apply error: ${err.message}`, "error");
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/aggregated-jobs/seed ──────────────────────────────────────
  // Seed initial 100 jobs (idempotent)
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

  log("Aggregated job routes registered", "routes");
}
