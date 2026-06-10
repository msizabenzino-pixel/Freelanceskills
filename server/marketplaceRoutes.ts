/**
 * Marketplace Routes — Production-grade CRUD APIs
 * Jobs · Gigs · Service Packages · Proposals · Messaging
 *
 * Design decisions:
 * - SQL-level filtering + pagination for all list endpoints (no in-memory filter).
 * - Zod validation on every write path.
 * - Bulletproof auth middleware (requireAuth, requireOwnership, requireClient, requireFreelancer).
 * - Structured error responses: { success, code, message, hint }.
 * - Soft deletes (deletedAt / isActive) everywhere.
 * - Pagination metadata: { items, total, page, pageSize, totalPages }.
 */

import type { Express } from "express";
import { z } from "zod";
import { db } from "./db";
import { storage } from "./storage";
import { getIO } from "./socket";
import { log, logError } from "./logger";
import {
  requireAuth,
  requireOwnership,
  requireClient,
  requireFreelancer,
  getUser,
  getUserId,
} from "./replit_integrations/auth";

import {
  eq, and, or, ilike, desc, asc, gte, lte, sql, count, inArray, isNull,
} from "drizzle-orm";

import { jobs, jobApplications, insertJobSchema, aggregatedJobs } from "@shared/models/jobs";
import { gigs, gigPackages } from "@shared/models/gigs";
import { servicePackages, bookings } from "@shared/models/services";
import { profiles, users } from "@shared/schema";
import { conversations, messages, insertMessageSchema } from "@shared/models/messages";

// ─────────────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────────────

const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

function handleError(res: any, error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  logError(`[MarketplaceRoutes] ${message}`, error);
  return res.status(status).json({
    success: false,
    code: status === 400 ? "VALIDATION_ERROR" : "INTERNAL_ERROR",
    message,
    hint: "Please check your request and try again.",
  });
}

function paginateResponse<T>(items: T[], total: number, page: number, pageSize: number) {
  return {
    success: true,
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─────────────────────────────────────────────────────────────────────
// Jobs
// ─────────────────────────────────────────────────────────────────────

export function registerMarketplaceRoutes(app: Express) {
  // ── GET /api/jobs ── SQL-level filtering, pagination, sorting
  app.get("/api/jobs", async (req, res) => {
    try {
      const { page, pageSize, sortBy, sortOrder } = PaginationQuery.parse(req.query);
      const {
        q, category, locationType, location, minBudget, maxBudget, status,
        clientId, urgency, isRemote,
      } = req.query;

      const conditions = [];
      conditions.push(isNull(jobs.deletedAt));

      if (status) {
        conditions.push(eq(jobs.status, status as string));
      } else if (!clientId) {
        // Default: show open + in_progress
        conditions.push(inArray(jobs.status, ["open", "in_progress"]));
      }
      if (clientId) {
        const resolved = clientId === "me" ? (req.session as any)?.userId : (clientId as string);
        if (resolved) conditions.push(eq(jobs.clientId, resolved as string));
      }
      if (q) {
        const lower = `%${(q as string).toLowerCase()}%`;
        conditions.push(sql`LOWER(${jobs.title}) LIKE ${lower} OR LOWER(${jobs.description}) LIKE ${lower} OR LOWER(${jobs.category}) LIKE ${lower}`);
      }
      if (category) conditions.push(eq(jobs.category, category as string));
      if (locationType) conditions.push(eq(jobs.locationType, locationType as string));
      if (location) {
        conditions.push(ilike(jobs.location, `%${location as string}%`));
      }
      if (minBudget) conditions.push(gte(jobs.budget, parseInt(minBudget as string) * 100));
      if (maxBudget) conditions.push(lte(jobs.budget, parseInt(maxBudget as string) * 100));
      if (urgency) conditions.push(eq(jobs.urgency, urgency as string));
      if (isRemote === "true") conditions.push(eq(jobs.locationType, "remote"));

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      // Sort mapping
      const sortMap: Record<string, any> = {
        createdAt: sortOrder === "asc" ? asc(jobs.createdAt) : desc(jobs.createdAt),
        budget: sortOrder === "asc" ? asc(jobs.budget) : desc(jobs.budget),
        title: sortOrder === "asc" ? asc(jobs.title) : desc(jobs.title),
      };
      const orderBy = sortMap[sortBy as string] || desc(jobs.createdAt);

      const [{ value: total }] = await db
        .select({ value: count() })
        .from(jobs)
        .where(whereClause);

      const rows = await db
        .select()
        .from(jobs)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      // Enrich with client names and applicant counts
      const enriched = await Promise.all(
        rows.map(async (job) => {
          const profile = await storage.getProfile(job.clientId);
          const [{ value: appCount }] = await db
            .select({ value: count() })
            .from(jobApplications)
            .where(eq(jobApplications.jobId, job.id));
          return {
            ...job,
            budgetFormatted: `R${(job.budget / 100).toLocaleString("en-ZA")}`,
            clientName: profile?.title || "FreelanceSkills Client",
            applicantCount: appCount,
          };
        })
      );

      res.json(paginateResponse(enriched, total, page, pageSize));
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── GET /api/jobs/:id ── public
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job || job.deletedAt) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Job not found" });
      }
      const profile = await storage.getProfile(job.clientId);
      res.json({
        success: true,
        ...job,
        budgetFormatted: `R${(job.budget / 100).toLocaleString("en-ZA")}`,
        clientName: profile?.title || "FreelanceSkills Client",
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ── POST /api/jobs ── client creates
  app.post("/api/jobs", requireAuth, requireClient, async (req, res) => {
    try {
      const userId = getUserId(req);
      const body = {
        ...req.body,
        title: sanitizeText(req.body.title, 200),
        description: sanitizeText(req.body.description, 10000),
      };
      const validated = insertJobSchema.parse(body);
      const job = await storage.createJob({
        ...validated,
        clientId: userId,
        urgency: validated.urgency || "normal",
      });
      res.status(201).json({ success: true, job });
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── PATCH /api/jobs/:id ── client or admin edits
  app.patch("/api/jobs/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const existing = await storage.getJob(req.params.id);
      if (!existing || existing.deletedAt) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Job not found" });
      }
      const user = getUser(req);
      if (existing.clientId !== userId && user?.role !== "admin" && user?.role !== "moderator") {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "You can only edit your own jobs" });
      }

      const allowed = z.object({
        title: z.string().min(3).max(200).optional(),
        description: z.string().min(10).max(5000).optional(),
        category: z.string().optional(),
        locationType: z.enum(["onsite", "remote", "hybrid"]).optional(),
        location: z.string().optional(),
        budget: z.number().int().min(100).optional(),
        urgency: z.enum(["normal", "urgent"]).optional(),
      }).parse(req.body);

      const updates = Object.fromEntries(
        Object.entries(allowed).filter(([k, v]) => v !== undefined)
      );
      if (updates.title) updates.title = sanitizeText(updates.title, 200);
      if (updates.description) updates.description = sanitizeText(updates.description, 10000);
      updates.updatedAt = new Date();

      const [updated] = await db.update(jobs).set(updates).where(eq(jobs.id, req.params.id)).returning();
      res.json({ success: true, job: updated });
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── DELETE /api/jobs/:id ── soft delete
  app.delete("/api/jobs/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const existing = await storage.getJob(req.params.id);
      if (!existing || existing.deletedAt) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Job not found" });
      }
      const user = getUser(req);
      if (existing.clientId !== userId && user?.role !== "admin" && user?.role !== "moderator") {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "You can only delete your own jobs" });
      }
      await db.update(jobs).set({ deletedAt: new Date(), status: "cancelled" }).where(eq(jobs.id, req.params.id));
      res.json({ success: true, message: "Job deleted" });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ── GET /api/jobs/:id/applicants ── owner only
  app.get("/api/jobs/:id/applicants", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const job = await storage.getJob(req.params.id);
      if (!job || job.deletedAt) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Job not found" });
      }
      const user = getUser(req);
      if (job.clientId !== userId && user?.role !== "admin" && user?.role !== "moderator") {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "You do not own this job" });
      }
      const applicants = await storage.getJobApplicants(req.params.id);
      res.json({ success: true, applicants, total: applicants.length });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ── POST /api/jobs/:id/apply ── freelancer applies
  app.post("/api/jobs/:id/apply", requireAuth, requireFreelancer, async (req, res) => {
    try {
      const userId = getUserId(req);
      const job = await storage.getJob(req.params.id);
      if (!job || job.deletedAt || job.status !== "open") {
        return res.status(400).json({ success: false, code: "BAD_REQUEST", message: "Job is not available for applications" });
      }
      const { coverLetter, resumeSummary } = z.object({
        coverLetter: z.string().optional(),
        resumeSummary: z.string().optional(),
      }).parse(req.body);

      const [existing] = await db
        .select()
        .from(jobApplications)
        .where(and(eq(jobApplications.userId, userId), eq(jobApplications.jobId, req.params.id)));
      if (existing) {
        return res.status(409).json({ success: false, code: "ALREADY_APPLIED", message: "You already applied to this job" });
      }

      const application = await storage.createJobApplication({
        userId,
        jobId: req.params.id,
        jobTitle: job.title,
        company: job.clientId,
        coverLetter,
        resumeSummary,
        status: "applied",
      });

      res.status(201).json({ success: true, application });
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── GET /api/jobs/:id/related ── AI-powered matching (deterministic for now)
  app.get("/api/jobs/:id/related", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job || job.deletedAt) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Job not found" });
      }
      const related = await db
        .select()
        .from(jobs)
        .where(
          and(
            isNull(jobs.deletedAt),
            eq(jobs.status, "open"),
            eq(jobs.category, job.category),
            sql`${jobs.id} != ${job.id}`
          )
        )
        .orderBy(desc(jobs.createdAt))
        .limit(5);
      res.json({ success: true, related });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ─────────────────────────────────────────────────────────────────────
  // Gigs
  // ─────────────────────────────────────────────────────────────────────

  // ── GET /api/gigs ── public listing with SQL filtering
  app.get("/api/gigs", async (req, res) => {
    try {
      const { page, pageSize, sortBy, sortOrder } = PaginationQuery.parse(req.query);
      const { q, category, freelancerId, status } = req.query;

      const conditions = [sql`COALESCE(${gigs.deletedAt}, 'infinity') > NOW()`];
      if (status) conditions.push(eq(gigs.status, status as string));
      else conditions.push(inArray(gigs.status, ["active", "approved", "featured"]));
      if (category) conditions.push(eq(gigs.category, category as string));
      if (freelancerId) conditions.push(eq(gigs.freelancerId, freelancerId as string));
      if (q) {
        const lower = `%${(q as string).toLowerCase()}%`;
        conditions.push(sql`LOWER(${gigs.title}) LIKE ${lower} OR LOWER(${gigs.description}) LIKE ${lower}`);
      }

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      const [{ value: total }] = await db.select({ value: count() }).from(gigs).where(whereClause);

      const sortMap: Record<string, any> = {
        createdAt: sortOrder === "asc" ? asc(gigs.createdAt) : desc(gigs.createdAt),
        rating: sortOrder === "asc" ? asc(gigs.rating) : desc(gigs.rating),
        orders: sortOrder === "asc" ? asc(gigs.ordersLifetime) : desc(gigs.ordersLifetime),
      };
      const orderBy = sortMap[sortBy as string] || desc(gigs.createdAt);

      const rows = await db
        .select()
        .from(gigs)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const enriched = await Promise.all(
        rows.map(async (gig) => {
          const profile = await storage.getProfile(gig.freelancerId);
          return {
            ...gig,
            freelancerName: profile?.title || "Freelancer",
            freelancerAvatar: profile?.photoUrl,
            packages: [],
          };
        })
      );

      res.json(paginateResponse(enriched, total, page, pageSize));
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── GET /api/gigs/:id ── public
  app.get("/api/gigs/:id", async (req, res) => {
    try {
      const [gig] = await db
        .select()
        .from(gigs)
        .where(and(eq(gigs.id, req.params.id), sql`COALESCE(${gigs.deletedAt}, 'infinity') > NOW()`));
      if (!gig) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Gig not found" });
      }
      const profile = await storage.getProfile(gig.freelancerId);
      res.json({
        success: true,
        ...gig,
        freelancerName: profile?.title || "Freelancer",
        freelancerAvatar: profile?.photoUrl,
        packages: [],
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ── POST /api/gigs ── freelancer creates
  app.post("/api/gigs", requireAuth, requireFreelancer, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { title, description, category, skills, deliveryTimeHours } = z.object({
        title: z.string().min(5).max(255),
        description: z.string().min(20).max(5000),
        category: z.string().min(1),
        skills: z.array(z.string()).optional(),
        deliveryTimeHours: z.number().int().min(1),
      }).parse(req.body);

      const [gig] = await db
        .insert(gigs)
        .values({
          freelancerId: userId,
          title: sanitizeText(title, 255),
          description: sanitizeText(description, 5000),
          category,
          skills: skills || [],
          deliveryTimeHours,
          status: "draft",
        })
        .returning();

      res.status(201).json({ success: true, gig });
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── PATCH /api/gigs/:id ── freelancer or admin
  app.patch("/api/gigs/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const [gig] = await db.select().from(gigs).where(eq(gigs.id, req.params.id));
      if (!gig || gig.deletedAt) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Gig not found" });
      }
      const user = getUser(req);
      if (gig.freelancerId !== userId && user?.role !== "admin" && user?.role !== "moderator") {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Not your gig" });
      }

      const allowed = z.object({
        title: z.string().min(5).max(255).optional(),
        description: z.string().min(20).max(5000).optional(),
        category: z.string().optional(),
        skills: z.array(z.string()).optional(),
        deliveryTimeHours: z.number().int().min(1).optional(),
        status: z.enum(["draft", "active", "paused", "suspended"]).optional(),
      }).parse(req.body);

      const updates = Object.fromEntries(
        Object.entries(allowed).filter(([k, v]) => v !== undefined)
      );
      if (updates.title) updates.title = sanitizeText(updates.title, 255);
      if (updates.description) updates.description = sanitizeText(updates.description, 5000);
      updates.updatedAt = new Date();

      const [updated] = await db.update(gigs).set(updates).where(eq(gigs.id, req.params.id)).returning();
      res.json({ success: true, gig: updated });
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── DELETE /api/gigs/:id ── soft delete
  app.delete("/api/gigs/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const [gig] = await db.select().from(gigs).where(eq(gigs.id, req.params.id));
      if (!gig || gig.deletedAt) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Gig not found" });
      }
      const user = getUser(req);
      if (gig.freelancerId !== userId && user?.role !== "admin" && user?.role !== "moderator") {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Not your gig" });
      }
      await db.update(gigs).set({ deletedAt: new Date(), status: "suspended" }).where(eq(gigs.id, req.params.id));
      res.json({ success: true, message: "Gig deleted" });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ── POST /api/gigs/:id/packages ── add pricing tier
  app.post("/api/gigs/:id/packages", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const [gig] = await db.select().from(gigs).where(eq(gigs.id, req.params.id));
      if (!gig || gig.deletedAt) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Gig not found" });
      }
      const user = getUser(req);
      if (gig.freelancerId !== userId && user?.role !== "admin" && user?.role !== "moderator") {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Not your gig" });
      }
      const { tier, priceZAR, deliveryDays, revisions, features } = z.object({
        tier: z.enum(["basic", "standard", "premium"]),
        priceZAR: z.number().positive(),
        deliveryDays: z.number().int().min(1),
        revisions: z.number().int().min(0),
        features: z.array(z.string()).optional(),
      }).parse(req.body);

      res.status(400).json({
        success: false,
        code: "NOT_AVAILABLE",
        message: "Gig packages are currently disabled. Table migration pending.",
      });
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ─────────────────────────────────────────────────────────────────────
  // Service Packages
  // ─────────────────────────────────────────────────────────────────────

  // ── GET /api/service-packages ── public with SQL filtering
  app.get("/api/service-packages", async (req, res) => {
    try {
      const { page, pageSize, sortBy, sortOrder } = PaginationQuery.parse(req.query);
      const { q, category, freelancerId } = req.query;

      const conditions = [eq(servicePackages.isActive, true)];
      if (category) conditions.push(eq(servicePackages.category, category as string));
      if (freelancerId) conditions.push(eq(servicePackages.freelancerId, freelancerId as string));
      if (q) {
        const lower = `%${(q as string).toLowerCase()}%`;
        conditions.push(sql`LOWER(${servicePackages.title}) LIKE ${lower} OR LOWER(${servicePackages.description}) LIKE ${lower}`);
      }

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
      const [{ value: total }] = await db.select({ value: count() }).from(servicePackages).where(whereClause);

      const sortMap: Record<string, any> = {
        createdAt: sortOrder === "asc" ? asc(servicePackages.createdAt) : desc(servicePackages.createdAt),
        price: sortOrder === "asc" ? asc(servicePackages.price) : desc(servicePackages.price),
        bookingCount: sortOrder === "asc" ? asc(servicePackages.bookingCount) : desc(servicePackages.bookingCount),
      };
      const orderBy = sortMap[sortBy as string] || desc(servicePackages.createdAt);

      const rows = await db
        .select()
        .from(servicePackages)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const enriched = await Promise.all(
        rows.map(async (pkg) => {
          const profile = await storage.getProfile(pkg.freelancerId);
          return {
            ...pkg,
            priceFormatted: `R${pkg.price}`,
            freelancerName: profile?.title || "Freelancer",
            freelancerAvatar: profile?.photoUrl,
          };
        })
      );

      res.json(paginateResponse(enriched, total, page, pageSize));
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── GET /api/service-packages/:id ── public
  app.get("/api/service-packages/:id", async (req, res) => {
    try {
      const [pkg] = await db
        .select()
        .from(servicePackages)
        .where(and(eq(servicePackages.id, req.params.id), eq(servicePackages.isActive, true)));
      if (!pkg) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Service package not found" });
      }
      const profile = await storage.getProfile(pkg.freelancerId);
      res.json({
        success: true,
        ...pkg,
        priceFormatted: `R${pkg.price}`,
        freelancerName: profile?.title || "Freelancer",
        freelancerAvatar: profile?.photoUrl,
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ── POST /api/service-packages ── freelancer creates
  app.post("/api/service-packages", requireAuth, requireFreelancer, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { title, description, category, price, duration } = z.object({
        title: z.string().min(5).max(255),
        description: z.string().min(20).max(5000),
        category: z.string().min(1),
        price: z.number().int().min(100),
        duration: z.string().optional(),
      }).parse(req.body);

      const [pkg] = await db
        .insert(servicePackages)
        .values({
          freelancerId: userId,
          title: sanitizeText(title, 255),
          description: sanitizeText(description, 5000),
          category,
          price,
          duration,
        })
        .returning();
      res.status(201).json({ success: true, package: pkg });
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── PATCH /api/service-packages/:id ── freelancer or admin
  app.patch("/api/service-packages/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const [pkg] = await db.select().from(servicePackages).where(eq(servicePackages.id, req.params.id));
      if (!pkg) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Service package not found" });
      }
      const user = getUser(req);
      if (pkg.freelancerId !== userId && user?.role !== "admin" && user?.role !== "moderator") {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Not your package" });
      }

      const allowed = z.object({
        title: z.string().min(5).max(255).optional(),
        description: z.string().min(20).max(5000).optional(),
        category: z.string().optional(),
        price: z.number().int().min(100).optional(),
        duration: z.string().optional(),
        isActive: z.boolean().optional(),
      }).parse(req.body);

      const updates = Object.fromEntries(
        Object.entries(allowed).filter(([k, v]) => v !== undefined)
      );
      if (updates.title) updates.title = sanitizeText(updates.title, 255);
      if (updates.description) updates.description = sanitizeText(updates.description, 5000);

      const [updated] = await db.update(servicePackages).set(updates).where(eq(servicePackages.id, req.params.id)).returning();
      res.json({ success: true, package: updated });
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── DELETE /api/service-packages/:id ── soft delete (graceful without deletedAt)
  app.delete("/api/service-packages/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const [pkg] = await db.select().from(servicePackages).where(eq(servicePackages.id, req.params.id));
      if (!pkg) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Service package not found" });
      }
      const user = getUser(req);
      if (pkg.freelancerId !== userId && user?.role !== "admin" && user?.role !== "moderator") {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Not your package" });
      }
      await db.update(servicePackages).set({ isActive: false }).where(eq(servicePackages.id, req.params.id));
      res.json({ success: true, message: "Service package deleted" });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ─────────────────────────────────────────────────────────────────────
  // Proposals (Freelancer-facing)
  // ─────────────────────────────────────────────────────────────────────

  // ── GET /api/proposals ── my proposals (freelancer)
  app.get("/api/proposals", requireAuth, requireFreelancer, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { page, pageSize } = PaginationQuery.parse(req.query);
      const { status } = req.query;

      const conditions = [eq(jobApplications.userId, userId)];
      if (status) conditions.push(eq(jobApplications.status, status as string));

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
      const [{ value: total }] = await db.select({ value: count() }).from(jobApplications).where(whereClause);

      const rows = await db
        .select()
        .from(jobApplications)
        .where(whereClause)
        .orderBy(desc(jobApplications.appliedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const enriched = await Promise.all(
        rows.map(async (app) => {
          const job = app.jobId ? await storage.getJob(app.jobId) : null;
          return {
            ...app,
            jobTitle: job?.title || app.jobTitle,
            jobBudget: job?.budget,
            jobStatus: job?.status,
            jobLocation: job?.location,
          };
        })
      );

      res.json(paginateResponse(enriched, total, page, pageSize));
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── PATCH /api/proposals/:id/withdraw ── freelancer withdraws
  app.patch("/api/proposals/:id/withdraw", requireAuth, requireFreelancer, async (req, res) => {
    try {
      const userId = getUserId(req);
      const [app] = await db
        .select()
        .from(jobApplications)
        .where(and(eq(jobApplications.id, req.params.id), eq(jobApplications.userId, userId)));
      if (!app) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Proposal not found" });
      }
      if (app.status === "withdrawn") {
        return res.status(400).json({ success: false, code: "ALREADY_WITHDRAWN", message: "Already withdrawn" });
      }
      const [updated] = await db
        .update(jobApplications)
        .set({ status: "withdrawn", notes: app.notes ? `${app.notes}\n[Withdrawn by applicant]` : "Withdrawn by applicant" })
        .where(eq(jobApplications.id, req.params.id))
        .returning();
      res.json({ success: true, proposal: updated });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ── GET /api/proposals/:id ── my proposal detail
  app.get("/api/proposals/:id", requireAuth, requireFreelancer, async (req, res) => {
    try {
      const userId = getUserId(req);
      const [app] = await db
        .select()
        .from(jobApplications)
        .where(and(eq(jobApplications.id, req.params.id), eq(jobApplications.userId, userId)));
      if (!app) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Proposal not found" });
      }
      const job = app.jobId ? await storage.getJob(app.jobId) : null;
      res.json({
        success: true,
        ...app,
        jobTitle: job?.title || app.jobTitle,
        jobBudget: job?.budget,
        jobStatus: job?.status,
        jobLocation: job?.location,
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ── GET /api/proposals/match-jobs ── AI-ready matching (deterministic)
  app.get("/api/proposals/match-jobs", requireAuth, requireFreelancer, async (req, res) => {
    try {
      const userId = getUserId(req);
      const profile = await storage.getProfile(userId);
      const { page, pageSize } = PaginationQuery.parse(req.query);

      if (!profile || !Array.isArray(profile.skills) || profile.skills.length === 0) {
        return res.json(paginateResponse([], 0, page, pageSize));
      }

      const skillConditions = profile.skills.map((s: string) =>
        sql`LOWER(${jobs.title}) LIKE ${`%${s.toLowerCase()}%`} OR LOWER(${jobs.description}) LIKE ${`%${s.toLowerCase()}%`} OR LOWER(${jobs.category}) LIKE ${`%${s.toLowerCase()}%`}`
      );

      const conditions = [
        isNull(jobs.deletedAt),
        eq(jobs.status, "open"),
        or(...skillConditions),
      ];

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
      const [{ value: total }] = await db.select({ value: count() }).from(jobs).where(whereClause);

      const rows = await db
        .select()
        .from(jobs)
        .where(whereClause)
        .orderBy(desc(jobs.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const enriched = await Promise.all(
        rows.map(async (job) => {
          const clientProfile = await storage.getProfile(job.clientId);
          const [{ value: appCount }] = await db
            .select({ value: count() })
            .from(jobApplications)
            .where(eq(jobApplications.jobId, job.id));
          return {
            ...job,
            budgetFormatted: `R${(job.budget / 100).toLocaleString("en-ZA")}`,
            clientName: clientProfile?.title || "FreelanceSkills Client",
            applicantCount: appCount,
            matchScore: 75,
          };
        })
      );

      res.json(paginateResponse(enriched, total, page, pageSize));
    } catch (error) {
      handleError(res, error);
    }
  });

  // ─────────────────────────────────────────────────────────────────────
  // Messaging (enhanced)
  // ─────────────────────────────────────────────────────────────────────

  // ── GET /api/conversations ── list with last message preview
  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const rows = await db
        .select()
        .from(conversations)
        .where(or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)))
        .orderBy(desc(conversations.lastMessageAt));

      const enriched = await Promise.all(
        rows.map(async (conv) => {
          const otherId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
          const otherProfile = await storage.getProfile(otherId);
          const [{ value: unread }] = await db
            .select({ value: count() })
            .from(messages)
            .where(
              and(
                eq(messages.conversationId, conv.id),
                eq(messages.isRead, false),
                sql`${messages.senderId} != ${userId}`
              )
            );
          const [lastMsg] = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conv.id))
            .orderBy(desc(messages.createdAt))
            .limit(1);
          return {
            ...conv,
            otherUser: {
              id: otherId,
              name: otherProfile?.title || "Freelancer",
              avatar: otherProfile?.photoUrl,
            },
            lastMessage: lastMsg?.content || "",
            lastMessageAt: lastMsg?.createdAt || conv.lastMessageAt,
            unreadCount: unread,
          };
        })
      );
      res.json({ success: true, conversations: enriched });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ── GET /api/conversations/:id/messages ── paginated
  app.get("/api/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { page, pageSize } = PaginationQuery.parse(req.query);
      const conversationId = req.params.id;

      const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
      if (!conv) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Conversation not found" });
      }
      if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Access denied" });
      }

      const [{ value: total }] = await db
        .select({ value: count() })
        .from(messages)
        .where(
          and(eq(messages.conversationId, conversationId), isNull(messages.deletedAt))
        );

      const rows = await db
        .select()
        .from(messages)
        .where(and(eq(messages.conversationId, conversationId), isNull(messages.deletedAt)))
        .orderBy(desc(messages.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      res.json({
        success: true,
        ...paginateResponse(rows.reverse(), total, page, pageSize),
      });
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── POST /api/conversations/:id/messages ── send (already exists but using new middleware)
  // Kept in routes.ts for compatibility; we add a PATCH for message edits here.

  // ── PATCH /api/messages/:id ── edit (within 5 minutes)
  app.patch("/api/messages/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const [msg] = await db.select().from(messages).where(eq(messages.id, req.params.id));
      if (!msg || msg.deletedAt) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Message not found" });
      }
      if (msg.senderId !== userId) {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "You can only edit your own messages" });
      }
      const ageMs = Date.now() - (msg.createdAt ? new Date(msg.createdAt).getTime() : 0);
      if (ageMs > 5 * 60 * 1000) {
        return res.status(403).json({ success: false, code: "EDIT_WINDOW_EXPIRED", message: "Messages can only be edited within 5 minutes" });
      }
      const { content } = z.object({ content: z.string().min(1).max(5000) }).parse(req.body);
      const [updated] = await db
        .update(messages)
        .set({ content: sanitizeText(content, 5000), updatedAt: new Date() })
        .where(eq(messages.id, req.params.id))
        .returning();
      res.json({ success: true, message: updated });
    } catch (error) {
      handleError(res, error, 400);
    }
  });

  // ── DELETE /api/messages/:id ── soft delete
  app.delete("/api/messages/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const [msg] = await db.select().from(messages).where(eq(messages.id, req.params.id));
      if (!msg || msg.deletedAt) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Message not found" });
      }
      const user = getUser(req);
      if (msg.senderId !== userId && user?.role !== "admin" && user?.role !== "moderator") {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Not your message" });
      }
      await db.update(messages).set({ deletedAt: new Date() }).where(eq(messages.id, req.params.id));
      res.json({ success: true, message: "Message deleted" });
    } catch (error) {
      handleError(res, error);
    }
  });

  // ── POST /api/conversations/:id/read ── mark as read
  app.post("/api/conversations/:id/read", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, req.params.id));
      if (!conv) {
        return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Conversation not found" });
      }
      if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
        return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Access denied" });
      }
      const count = await storage.markMessagesAsRead(req.params.id, userId);
      res.json({ success: true, markedRead: count });
    } catch (error) {
      handleError(res, error);
    }
  });

  log("[MarketplaceRoutes] registered — Jobs · Gigs · Services · Proposals · Messaging");
}

// ─────────────────────────────────────────────────────────────────────
// Text sanitization
// ─────────────────────────────────────────────────────────────────────

function sanitizeText(text: string, maxLength: number): string {
  if (typeof text !== "string") return "";
  return text.trim().slice(0, maxLength);
}
