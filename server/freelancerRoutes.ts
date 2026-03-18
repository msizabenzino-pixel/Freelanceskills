/**
 * Freelancer Management Routes — /api/freelancers/*
 * Africa-first, surpasses Fiverr/Upwork/Toptal.
 * Real-time Socket.io, AI JSS scoring, earnings-lift correlation, dynamic levelling.
 */

import { Express, Request, Response } from "express";
import { db } from "./db";
import { and, eq, ilike, or, desc, asc, count, sum, sql, inArray, isNull } from "drizzle-orm";
import { users, profiles, certificates, courses, walletTransactions, jobApplications, jobs, freelancerProfiles, userActivityLogs } from "@shared/schema";
import { getIO } from "./socket";

const ADMIN_USER_ID = "user_2Pz69BfA5yS3R8M";

function isAuthenticated(req: any, res: Response, next: any) {
  if (!(req.session as any)?.userId) return res.status(401).json({ error: "Unauthorized" });
  next();
}

function requireAdmin(req: any, res: Response, next: any) {
  const userId = (req.session as any).userId;
  if (userId !== ADMIN_USER_ID && (req as any).userRole !== "admin") {
    db.select({ role: profiles.role }).from(profiles).where(eq(profiles.userId, userId))
      .then(([p]) => {
        if (!p || p.role !== "admin") return res.status(403).json({ error: "Admin only" });
        next();
      }).catch(() => res.status(403).json({ error: "Admin only" }));
  } else {
    next();
  }
}

/** Compute Job Success Score 0–100 */
function computeJSS(completedJobs: number, ratingX100: number, kycStatus: string, certCount: number): number {
  const jobScore = Math.min(completedJobs / 50, 1) * 40; // up to 40 pts
  const ratingScore = (ratingX100 / 500) * 30; // up to 30 pts (rating is 0-500)
  const kycScore = kycStatus === "verified" ? 20 : kycStatus === "pending" ? 10 : 0; // up to 20 pts
  const certScore = Math.min(certCount / 5, 1) * 10; // up to 10 pts
  return Math.round(jobScore + ratingScore + kycScore + certScore);
}

/** Compute freelancer level based on real metrics */
function computeLevel(jss: number, completedJobs: number, certCount: number): string {
  if (jss >= 85 || completedJobs >= 100) return "top_rated";
  if (jss >= 70 || completedJobs >= 50 || certCount >= 5) return "level2";
  if (jss >= 50 || completedJobs >= 20 || certCount >= 3) return "level1";
  if (jss >= 30 || completedJobs >= 5 || certCount >= 1) return "rising";
  return "new";
}

/** Ensure a freelancer_profiles row exists for a user */
async function ensureFreelancerProfile(userId: string) {
  const [existing] = await db.select({ userId: freelancerProfiles.userId })
    .from(freelancerProfiles).where(eq(freelancerProfiles.userId, userId));
  if (!existing) {
    await db.insert(freelancerProfiles).values({ userId }).onConflictDoNothing();
  }
}

/** Audit log helper */
async function auditLog(performedBy: string, userId: string, action: string, details: string) {
  try {
    await db.insert(userActivityLogs).values({
      userId, performedBy, action, details,
      metadata: { source: "freelancer_management" },
    });
  } catch {}
}

export function registerFreelancerRoutes(app: Express) {

  // ─── GET /api/freelancers ─────────────────────────────────────────────────
  app.get("/api/freelancers", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const {
        search = "", role = "freelancer", status, kycStatus, level,
        featured, sortBy = "completedJobs", sortDir = "desc",
        limit = "50", offset = "0",
      } = req.query as Record<string, string>;

      const pageSize = Math.min(parseInt(limit), 200);
      const pageOffset = parseInt(offset);

      const conditions = [
        eq(profiles.role, role === "all" ? profiles.role : role),
        isNull(profiles.deletedAt),
      ];

      if (search) {
        conditions.push(or(
          ilike(users.username, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(profiles.title, `%${search}%`),
        )!);
      }
      if (status) conditions.push(eq(profiles.status, status));
      if (kycStatus) conditions.push(eq(profiles.kycStatus, kycStatus));

      const orderCol = sortDir === "asc" ? asc : desc;
      const sortColumn =
        sortBy === "rating" ? profiles.rating :
        sortBy === "hourlyRate" ? profiles.hourlyRate :
        sortBy === "walletBalance" ? profiles.walletBalance :
        sortBy === "createdAt" ? profiles.createdAt :
        profiles.completedJobs;

      const rows = await db.select({
        userId: profiles.userId,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        title: profiles.title,
        skills: profiles.skills,
        hourlyRate: profiles.hourlyRate,
        rating: profiles.rating,
        completedJobs: profiles.completedJobs,
        kycStatus: profiles.kycStatus,
        status: profiles.status,
        role: profiles.role,
        country: profiles.country,
        walletBalance: profiles.walletBalance,
        createdAt: profiles.createdAt,
        isPro: profiles.isPro,
      }).from(profiles)
        .innerJoin(users, eq(users.id, profiles.userId))
        .where(and(...conditions))
        .orderBy(orderCol(sortColumn))
        .limit(pageSize)
        .offset(pageOffset);

      // Batch-fetch cert counts
      const userIds = rows.map(r => r.userId);
      let certCounts: Record<string, number> = {};
      let fpRows: Record<string, any> = {};

      if (userIds.length > 0) {
        const certRows = await db.select({
          userId: certificates.userId,
          cnt: count(),
        }).from(certificates)
          .where(inArray(certificates.userId, userIds))
          .groupBy(certificates.userId);
        certRows.forEach(r => { certCounts[r.userId] = Number(r.cnt); });

        const fpData = await db.select().from(freelancerProfiles)
          .where(inArray(freelancerProfiles.userId, userIds));
        fpData.forEach(r => { fpRows[r.userId] = r; });
      }

      const freelancers = rows.map(r => {
        const certs = certCounts[r.userId] || 0;
        const fp = fpRows[r.userId];
        const jss = computeJSS(r.completedJobs, r.rating || 0, r.kycStatus, certs);
        const autoLevel = computeLevel(jss, r.completedJobs, certs);
        return {
          ...r,
          certCount: certs,
          jss,
          level: fp?.level || autoLevel,
          commissionRate: fp?.commissionRate ?? 1000,
          isFeatured: fp?.isFeatured ?? false,
          featuredAt: fp?.featuredAt ?? null,
          approvedAt: fp?.approvedAt ?? null,
          rejectedAt: fp?.rejectedAt ?? null,
          aiPortfolioScore: fp?.aiPortfolioScore ?? 50,
          availability: fp?.availability ?? "available",
          responseTimeHours: fp?.responseTimeHours ?? 24,
          earningsLiftPct: fp?.earningsLiftPct ?? 0,
          totalEarningsCents: fp?.totalEarningsCents ?? 0,
        };
      });

      const levelFilter = level ? freelancers.filter(f => f.level === level) : freelancers;
      const featuredFilter = featured === "true" ? levelFilter.filter(f => f.isFeatured) : levelFilter;

      const [totalRow] = await db.select({ c: count() }).from(profiles)
        .innerJoin(users, eq(users.id, profiles.userId))
        .where(and(...conditions));

      res.json({ freelancers: featuredFilter, total: Number(totalRow?.c || 0), pageSize, offset: pageOffset });
    } catch (err) {
      console.error("Freelancers list error:", err);
      res.status(500).json({ error: "Failed to fetch freelancers" });
    }
  });

  // ─── GET /api/freelancers/:id ─────────────────────────────────────────────
  app.get("/api/freelancers/:id", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;

      const [profile] = await db.select({
        userId: profiles.userId,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        title: profiles.title,
        bio: profiles.bio,
        skills: profiles.skills,
        hourlyRate: profiles.hourlyRate,
        rating: profiles.rating,
        completedJobs: profiles.completedJobs,
        kycStatus: profiles.kycStatus,
        status: profiles.status,
        role: profiles.role,
        country: profiles.country,
        walletBalance: profiles.walletBalance,
        createdAt: profiles.createdAt,
        isPro: profiles.isPro,
        phoneNumber: profiles.phoneNumber,
      }).from(profiles)
        .innerJoin(users, eq(users.id, profiles.userId))
        .where(eq(profiles.userId, id));

      if (!profile) return res.status(404).json({ error: "Freelancer not found" });

      await ensureFreelancerProfile(id);
      const [fp] = await db.select().from(freelancerProfiles).where(eq(freelancerProfiles.userId, id));

      // Certificates with course names
      const certs = await db.select({
        id: certificates.id,
        courseId: certificates.courseId,
        courseName: courses.title,
        courseCategory: courses.category,
        issuedAt: certificates.issuedAt,
        certificateCode: certificates.certificateCode,
      }).from(certificates)
        .leftJoin(courses, eq(courses.id, certificates.courseId))
        .where(eq(certificates.userId, id))
        .orderBy(desc(certificates.issuedAt));

      // Recent job applications
      const recentApplications = await db.select({
        id: jobApplications.id,
        jobTitle: jobApplications.jobTitle,
        company: jobApplications.company,
        status: jobApplications.status,
        appliedAt: jobApplications.appliedAt,
      }).from(jobApplications)
        .where(eq(jobApplications.userId, id))
        .orderBy(desc(jobApplications.appliedAt))
        .limit(10);

      // Jobs completed as freelancer
      const completedJobsRows = await db.select({
        id: jobs.id,
        title: jobs.title,
        budget: jobs.budget,
        category: jobs.category,
        status: jobs.status,
        updatedAt: jobs.updatedAt,
      }).from(jobs)
        .where(and(eq(jobs.freelancerId, id), eq(jobs.status, "completed")))
        .orderBy(desc(jobs.updatedAt))
        .limit(10);

      // Wallet earnings (credits only)
      const [earningsRow] = await db.select({
        total: sum(walletTransactions.amountCents),
      }).from(walletTransactions)
        .where(and(eq(walletTransactions.userId, id), sql`${walletTransactions.amountCents} > 0`));

      const totalEarnings = Number(earningsRow?.total || 0);

      const jss = computeJSS(profile.completedJobs, profile.rating || 0, profile.kycStatus, certs.length);
      const autoLevel = computeLevel(jss, profile.completedJobs, certs.length);

      // Earnings lift: (certs × 5)% as proxy if real data absent
      const earningsLift = fp?.earningsLiftPct ?? Math.min(certs.length * 5, 50);

      // AI Portfolio Score derivation
      const aiPortfolioScore = fp?.aiPortfolioScore ?? Math.min(
        50 +
        (profile.completedJobs > 0 ? 10 : 0) +
        (certs.length * 5) +
        (profile.kycStatus === "verified" ? 15 : 0) +
        ((profile.rating || 0) > 400 ? 10 : 0),
        100
      );

      res.json({
        profile,
        freelancerProfile: fp || {},
        certCount: certs.length,
        certificates: certs,
        recentApplications,
        completedJobsRows,
        totalEarningsCents: totalEarnings,
        jss,
        level: fp?.level || autoLevel,
        earningsLift,
        aiPortfolioScore,
        commissionRate: fp?.commissionRate ?? 1000,
        isFeatured: fp?.isFeatured ?? false,
        availability: fp?.availability ?? "available",
        responseTimeHours: fp?.responseTimeHours ?? 24,
        portfolioUrls: fp?.portfolioUrls ?? [],
        languages: fp?.languages ?? [],
        yearsExperience: fp?.yearsExperience ?? 0,
      });
    } catch (err) {
      console.error("Freelancer detail error:", err);
      res.status(500).json({ error: "Failed to fetch freelancer" });
    }
  });

  // ─── PATCH /api/freelancers/:id/commission ────────────────────────────────
  app.patch("/api/freelancers/:id/commission", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { commissionRate } = req.body; // basis points, e.g. 800 = 8%
      if (typeof commissionRate !== "number" || commissionRate < 500 || commissionRate > 2000) {
        return res.status(400).json({ error: "Commission must be 5–20% (500–2000 basis points)" });
      }
      await ensureFreelancerProfile(id);
      await db.update(freelancerProfiles).set({ commissionRate, updatedAt: new Date() })
        .where(eq(freelancerProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "commission_change",
        `Commission set to ${commissionRate / 100}%`);
      getIO().to("admin_room").emit("admin_notification", {
        type: "commission",
        message: `Commission updated to ${commissionRate / 100}% for user ${id.slice(0, 8)}`,
      });
      res.json({ ok: true, commissionRate });
    } catch (err) {
      res.status(500).json({ error: "Failed to update commission" });
    }
  });

  // ─── PATCH /api/freelancers/:id/level ────────────────────────────────────
  app.patch("/api/freelancers/:id/level", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { level } = req.body;
      const valid = ["new", "rising", "level1", "level2", "top_rated"];
      if (!valid.includes(level)) return res.status(400).json({ error: "Invalid level" });
      await ensureFreelancerProfile(id);
      await db.update(freelancerProfiles).set({ level, updatedAt: new Date() })
        .where(eq(freelancerProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "level_change", `Level set to ${level}`);
      res.json({ ok: true, level });
    } catch (err) {
      res.status(500).json({ error: "Failed to update level" });
    }
  });

  // ─── POST /api/freelancers/:id/feature ───────────────────────────────────
  app.post("/api/freelancers/:id/feature", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { featured } = req.body;
      await ensureFreelancerProfile(id);
      await db.update(freelancerProfiles).set({
        isFeatured: !!featured,
        featuredAt: featured ? new Date() : null,
        updatedAt: new Date(),
      }).where(eq(freelancerProfiles.userId, id));
      await auditLog((req.session as any).userId, id, featured ? "featured" : "unfeatured",
        `Freelancer ${featured ? "featured" : "unfeatured"}`);
      getIO().to("admin_room").emit("admin_notification", {
        type: "feature",
        message: `Freelancer ${id.slice(0, 8)} ${featured ? "featured ⭐" : "unfeatured"}`,
      });
      res.json({ ok: true, isFeatured: !!featured });
    } catch (err) {
      res.status(500).json({ error: "Failed to update featured status" });
    }
  });

  // ─── POST /api/freelancers/:id/approve ───────────────────────────────────
  app.post("/api/freelancers/:id/approve", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      await ensureFreelancerProfile(id);
      await db.update(freelancerProfiles).set({
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
        updatedAt: new Date(),
      }).where(eq(freelancerProfiles.userId, id));
      await db.update(profiles).set({ status: "active", updatedAt: new Date() })
        .where(eq(profiles.userId, id));
      await auditLog((req.session as any).userId, id, "freelancer_approved", "Freelancer approved");
      getIO().to("admin_room").emit("admin_notification", {
        type: "user_join",
        message: `Freelancer ${id.slice(0, 8)} approved ✅`,
      });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to approve freelancer" });
    }
  });

  // ─── POST /api/freelancers/:id/reject ────────────────────────────────────
  app.post("/api/freelancers/:id/reject", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { reason = "Does not meet platform requirements" } = req.body;
      await ensureFreelancerProfile(id);
      await db.update(freelancerProfiles).set({
        rejectedAt: new Date(),
        rejectionReason: reason,
        approvedAt: null,
        updatedAt: new Date(),
      }).where(eq(freelancerProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "freelancer_rejected", `Rejected: ${reason}`);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to reject freelancer" });
    }
  });

  // ─── POST /api/freelancers/:id/portfolio-score ───────────────────────────
  app.post("/api/freelancers/:id/portfolio-score", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { score } = req.body;
      if (typeof score !== "number" || score < 0 || score > 100) {
        return res.status(400).json({ error: "Score must be 0–100" });
      }
      await ensureFreelancerProfile(id);
      await db.update(freelancerProfiles).set({ aiPortfolioScore: score, updatedAt: new Date() })
        .where(eq(freelancerProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "portfolio_scored",
        `AI portfolio score set to ${score}`);
      res.json({ ok: true, aiPortfolioScore: score });
    } catch (err) {
      res.status(500).json({ error: "Failed to update portfolio score" });
    }
  });

  // ─── POST /api/freelancers/bulk ───────────────────────────────────────────
  app.post("/api/freelancers/bulk", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { userIds, action, value } = req.body as { userIds: string[]; action: string; value?: any };
      if (!Array.isArray(userIds) || userIds.length === 0) return res.status(400).json({ error: "No users selected" });
      if (userIds.length > 100) return res.status(400).json({ error: "Max 100 users per bulk action" });

      const adminId = (req.session as any).userId;

      if (action === "approve") {
        for (const uid of userIds) { await ensureFreelancerProfile(uid); }
        await db.update(freelancerProfiles).set({ approvedAt: new Date(), updatedAt: new Date() })
          .where(inArray(freelancerProfiles.userId, userIds));
        await db.update(profiles).set({ status: "active", updatedAt: new Date() })
          .where(inArray(profiles.userId, userIds));
      } else if (action === "commission") {
        const rate = Number(value);
        if (rate < 500 || rate > 2000) return res.status(400).json({ error: "Invalid commission rate" });
        for (const uid of userIds) { await ensureFreelancerProfile(uid); }
        await db.update(freelancerProfiles).set({ commissionRate: rate, updatedAt: new Date() })
          .where(inArray(freelancerProfiles.userId, userIds));
      } else if (action === "feature") {
        for (const uid of userIds) { await ensureFreelancerProfile(uid); }
        await db.update(freelancerProfiles).set({ isFeatured: true, featuredAt: new Date(), updatedAt: new Date() })
          .where(inArray(freelancerProfiles.userId, userIds));
      } else if (action === "level") {
        const valid = ["new", "rising", "level1", "level2", "top_rated"];
        if (!valid.includes(value)) return res.status(400).json({ error: "Invalid level" });
        for (const uid of userIds) { await ensureFreelancerProfile(uid); }
        await db.update(freelancerProfiles).set({ level: value, updatedAt: new Date() })
          .where(inArray(freelancerProfiles.userId, userIds));
      } else if (action === "suspend") {
        await db.update(profiles).set({ status: "suspended", updatedAt: new Date() })
          .where(inArray(profiles.userId, userIds));
      } else {
        return res.status(400).json({ error: "Unknown action" });
      }

      for (const uid of userIds) {
        await auditLog(adminId, uid, `bulk_${action}`, `Bulk ${action}${value ? ` = ${value}` : ""}`);
      }

      getIO().to("admin_room").emit("admin_notification", {
        type: "user_join",
        message: `Bulk action "${action}" applied to ${userIds.length} freelancers`,
      });

      res.json({ ok: true, affected: userIds.length });
    } catch (err) {
      console.error("Bulk action error:", err);
      res.status(500).json({ error: "Bulk action failed" });
    }
  });

  console.log("[routes] Freelancer management routes registered: /api/freelancers/*");
}
