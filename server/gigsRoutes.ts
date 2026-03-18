/**
 * Gig Marketplace Admin Routes — /api/gigs/*
 *
 * Revenue engine with AI scoring, Academy correlation, predictive earnings,
 * ZAR optimization, and bulk operations.
 */
import { Express, Response } from "express";
import { db } from "./db";
import { eq, desc, ilike, inArray } from "drizzle-orm";
import { gigs, gigPackages, gigAnalytics, gigInsertSchema, gigPackageInsertSchema } from "@shared/models/gigs";
import { profiles, userActivityLogs } from "@shared/schema";
import { getIO } from "./socket";

const ADMIN_USER_ID = "user_2Pz69BfA5yS3R8M";

function isAuthenticated(req: any, res: Response, next: any) {
  if (!(req.session as any)?.userId) return res.status(401).json({ error: "Unauthorized" });
  next();
}

function requireAdmin(req: any, res: Response, next: any) {
  const userId = (req.session as any).userId;
  if (userId === ADMIN_USER_ID) { next(); return; }
  db.select({ role: profiles.role }).from(profiles).where(eq(profiles.userId, userId))
    .then(([p]) => { if (!p || p.role !== "admin") return res.status(403).json({ error: "Admin only" }); next(); })
    .catch(() => res.status(403).json({ error: "Admin only" }));
}

async function auditLog(adminId: string, action: string, details: any) {
  try {
    await db.insert(userActivityLogs).values({
      userId: adminId, performedBy: adminId, action: `GIG_${action}`,
      details: JSON.stringify(details), metadata: { source: "gigs" },
    });
  } catch {}
}

// AI Gig Intelligence Score calculator
function calculateAIScore(gig: any): number {
  let score = 50; // Base
  if (gig.rating > 4.5) score += 20;
  else if (gig.rating > 4.0) score += 10;
  if (gig.ordersLifetime > 100) score += 15;
  else if (gig.ordersLifetime > 50) score += 8;
  if (gig.ordersThisMonth > 10) score += 10;
  if (gig.featured) score += 5;
  return Math.min(100, score);
}

// Academy correlation multiplier
function calculateAcademyMultiplier(certCount: number): number {
  if (certCount >= 5) return 2.0;
  if (certCount >= 3) return 1.75;
  if (certCount >= 1) return 1.35;
  return 1.0;
}

// Predictive orders for next 30 days
function predictMonthlyOrders(gig: any): number {
  const baseOrders = gig.ordersThisMonth || 0;
  const trend = baseOrders * 1.1; // 10% month-over-month growth assumption
  return Math.round(trend * 2.5); // Scale to 30-day prediction
}

export function registerGigsRoutes(app: Express) {

  // ─── GET /api/gigs (searchable list with filters) ────────────────────
  app.get("/api/gigs", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { search, status, category, minRating, minScore, featured } = req.query;

      let query = db.select({
        id: gigs.id,
        title: gigs.title,
        freelancerId: gigs.freelancerId,
        category: gigs.category,
        skills: gigs.skills,
        rating: gigs.rating,
        ordersLifetime: gigs.ordersLifetime,
        ordersThisMonth: gigs.ordersThisMonth,
        status: gigs.status,
        featured: gigs.featured,
        aiIntelligenceScore: gigs.aiIntelligenceScore,
        academyCorrelationMultiplier: gigs.academyCorrelationMultiplier,
        predictedMonthlyOrders: gigs.predictedMonthlyOrders,
        predictedMonthlyEarningsZAR: gigs.predictedMonthlyEarningsZAR,
        freelancerName: profiles.fullName,
        freelancerLevel: profiles.level,
      })
        .from(gigs)
        .leftJoin(profiles, eq(gigs.freelancerId, profiles.userId));

      // Filters
      const conditions: any[] = [];
      if (search) conditions.push(ilike(gigs.title, `%${search}%`));
      if (status) conditions.push(eq(gigs.status, status));
      if (category) conditions.push(eq(gigs.category, category));
      if (minRating) conditions.push((table: any) => table[gigs.rating] >= parseFloat(minRating));
      if (minScore !== undefined) conditions.push((table: any) => table[gigs.aiIntelligenceScore] >= parseInt(minScore));
      if (featured === "true") conditions.push(eq(gigs.featured, true));

      for (const cond of conditions) {
        if (typeof cond === "function") query = query.where(cond) as any;
        else query = query.where(cond) as any;
      }

      const results = await query.orderBy(desc(gigs.createdAt)).limit(1000);
      res.json({ gigs: results, total: results.length });
    } catch (err) { res.status(500).json({ error: "Failed to fetch gigs" }); }
  });

  // ─── POST /api/gigs (create new gig) ───────────────────────────────────
  app.post("/api/gigs", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const adminId = (req.session as any).userId;
      const data = gigInsertSchema.parse(req.body);

      const newGig = await db.insert(gigs).values(data).returning();
      await auditLog(adminId, "GIG_CREATED", { gigId: newGig[0].id });

      res.json({ ok: true, gig: newGig[0] });
    } catch (err) { res.status(400).json({ error: "Invalid gig data" }); }
  });

  // ─── GET /api/gigs/:id (detailed view with packages + analytics) ──────
  app.get("/api/gigs/:id", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const gig = await db.select().from(gigs).where(eq(gigs.id, id));
      if (!gig.length) return res.status(404).json({ error: "Gig not found" });

      const packages = await db.select().from(gigPackages).where(eq(gigPackages.gigId, id));
      const analytics = await db.select().from(gigAnalytics).where(eq(gigAnalytics.gigId, id)).orderBy(desc(gigAnalytics.createdAt)).limit(1);

      const freelancer = await db.select().from(profiles).where(eq(profiles.userId, gig[0].freelancerId));

      res.json({
        gig: gig[0],
        packages,
        analytics: analytics[0] || null,
        freelancer: freelancer[0] || null,
      });
    } catch (err) { res.status(500).json({ error: "Failed to fetch gig" }); }
  });

  // ─── PATCH /api/gigs/:id (update gig) ──────────────────────────────────
  app.patch("/api/gigs/:id", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const adminId = (req.session as any).userId;
      const updates = req.body;

      const updated = await db.update(gigs).set({
        ...updates,
        updatedAt: new Date(),
      }).where(eq(gigs.id, id)).returning();

      await auditLog(adminId, "GIG_UPDATED", { gigId: id, changes: Object.keys(updates) });
      getIO().to("admin_room").emit("admin_notification", { type: "gig", message: `Gig "${updated[0].title}" updated` });

      res.json({ ok: true, gig: updated[0] });
    } catch (err) { res.status(500).json({ error: "Failed to update gig" }); }
  });

  // ─── POST /api/gigs/:id/approve (approve pending gig) ──────────────────
  app.post("/api/gigs/:id/approve", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = (req.session as any).userId;

      const updated = await db.update(gigs).set({
        status: "active",
        approvedBy: adminId,
        updatedAt: new Date(),
      }).where(eq(gigs.id, id)).returning();

      await auditLog(adminId, "GIG_APPROVED", { gigId: id, notes });
      getIO().to("admin_room").emit("admin_notification", { type: "gig", message: `✅ Gig approved: ${updated[0].title}` });

      res.json({ ok: true, gig: updated[0] });
    } catch (err) { res.status(500).json({ error: "Failed to approve gig" }); }
  });

  // ─── POST /api/gigs/:id/reject (reject pending gig) ───────────────────
  app.post("/api/gigs/:id/reject", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason) return res.status(400).json({ error: "Rejection reason required" });

      const adminId = (req.session as any).userId;
      const updated = await db.update(gigs).set({
        status: "draft",
        rejectionReason: reason,
        updatedAt: new Date(),
      }).where(eq(gigs.id, id)).returning();

      await auditLog(adminId, "GIG_REJECTED", { gigId: id, reason });
      getIO().to("admin_room").emit("admin_notification", { type: "gig", message: `❌ Gig rejected: ${reason}` });

      res.json({ ok: true, gig: updated[0] });
    } catch (err) { res.status(500).json({ error: "Failed to reject gig" }); }
  });

  // ─── POST /api/gigs/:id/feature (feature/unfeature gig) ────────────────
  app.post("/api/gigs/:id/feature", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { featured, daysUntil } = req.body;
      const adminId = (req.session as any).userId;

      const featuredUntil = featured ? new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000) : null;
      const updated = await db.update(gigs).set({
        featured: Boolean(featured),
        featuredUntil,
        updatedAt: new Date(),
      }).where(eq(gigs.id, id)).returning();

      await auditLog(adminId, `GIG_${featured ? "FEATURED" : "UNFEATURED"}`, { gigId: id, days: daysUntil });
      res.json({ ok: true, gig: updated[0] });
    } catch (err) { res.status(500).json({ error: "Failed to update featured status" }); }
  });

  // ─── POST /api/gigs/:id/suspend (suspend gig) ────────────────────────
  app.post("/api/gigs/:id/suspend", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = (req.session as any).userId;

      const updated = await db.update(gigs).set({
        status: "suspended",
        rejectionReason: reason,
        updatedAt: new Date(),
      }).where(eq(gigs.id, id)).returning();

      await auditLog(adminId, "GIG_SUSPENDED", { gigId: id, reason });
      res.json({ ok: true, gig: updated[0] });
    } catch (err) { res.status(500).json({ error: "Failed to suspend gig" }); }
  });

  // ─── POST /api/gigs/:id/packages (add/update package) ────────────────
  app.post("/api/gigs/:id/packages", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const adminId = (req.session as any).userId;
      const packages = req.body; // Array of {tier, priceZAR, deliveryDays, revisions, features}

      // Delete existing and insert new
      await db.delete(gigPackages).where(eq(gigPackages.gigId, id));
      const inserted = await db.insert(gigPackages).values(
        packages.map((pkg: any) => ({ ...pkg, gigId: id }))
      ).returning();

      await auditLog(adminId, "GIG_PACKAGES_UPDATED", { gigId: id, count: packages.length });
      res.json({ ok: true, packages: inserted });
    } catch (err) { res.status(500).json({ error: "Failed to update packages" }); }
  });

  // ─── POST /api/gigs/bulk/approve ──────────────────────────────────────
  app.post("/api/gigs/bulk/approve", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { gigIds } = req.body;
      if (!Array.isArray(gigIds)) return res.status(400).json({ error: "gigIds must be array" });

      const adminId = (req.session as any).userId;
      await db.update(gigs).set({
        status: "active",
        approvedBy: adminId,
        updatedAt: new Date(),
      }).where(inArray(gigs.id, gigIds));

      await auditLog(adminId, "GIGS_BULK_APPROVED", { count: gigIds.length });
      getIO().to("admin_room").emit("admin_notification", { type: "gig", message: `✅ Bulk approved ${gigIds.length} gigs` });

      res.json({ ok: true, count: gigIds.length });
    } catch (err) { res.status(500).json({ error: "Bulk approve failed" }); }
  });

  // ─── POST /api/gigs/bulk/feature ──────────────────────────────────────
  app.post("/api/gigs/bulk/feature", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { gigIds, daysUntil } = req.body;
      const adminId = (req.session as any).userId;
      const featuredUntil = new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000);

      await db.update(gigs).set({
        featured: true,
        featuredUntil,
        updatedAt: new Date(),
      }).where(inArray(gigs.id, gigIds));

      await auditLog(adminId, "GIGS_BULK_FEATURED", { count: gigIds.length, days: daysUntil });
      res.json({ ok: true, count: gigIds.length });
    } catch (err) { res.status(500).json({ error: "Bulk feature failed" }); }
  });

  // ─── POST /api/gigs/bulk/price-adjust ────────────────────────────────
  app.post("/api/gigs/bulk/price-adjust", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { gigIds, percentChange } = req.body;
      const adminId = (req.session as any).userId;

      // Get current packages and adjust
      const packages = await db.select().from(gigPackages).where(inArray(gigPackages.gigId, gigIds));
      const multiplier = 1 + percentChange / 100;

      for (const pkg of packages) {
        const newPrice = Math.round(parseFloat(pkg.priceZAR) * multiplier * 100) / 100;
        await db.update(gigPackages).set({
          priceZAR: newPrice.toString(),
          updatedAt: new Date(),
        }).where(eq(gigPackages.id, pkg.id));
      }

      await auditLog(adminId, "GIGS_BULK_PRICE_ADJUSTED", { count: gigIds.length, percentChange });
      res.json({ ok: true, count: gigIds.length, percentChange });
    } catch (err) { res.status(500).json({ error: "Price adjustment failed" }); }
  });

  // ─── GET /api/gigs/export/csv ─────────────────────────────────────────
  app.get("/api/gigs/export/csv", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const allGigs = await db.select({
        id: gigs.id,
        title: gigs.title,
        category: gigs.category,
        rating: gigs.rating,
        orders: gigs.ordersLifetime,
        aiScore: gigs.aiIntelligenceScore,
        academyMultiplier: gigs.academyCorrelationMultiplier,
        predictedMonthlyOrders: gigs.predictedMonthlyOrders,
        status: gigs.status,
        featured: gigs.featured,
      }).from(gigs).orderBy(desc(gigs.aiIntelligenceScore));

      const csv = [
        "Gig ID,Title,Category,Rating,Lifetime Orders,AI Score,Academy Multiplier,Predicted Monthly Orders,Status,Featured",
        ...allGigs.map(g => `${g.id},"${g.title}",${g.category},${g.rating},${g.orders},${g.aiScore},${g.academyMultiplier},${g.predictedMonthlyOrders},${g.status},${g.featured}`),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="gigs-export-${new Date().getTime()}.csv"`);
      res.send(csv);
    } catch (err) { res.status(500).json({ error: "Export failed" }); }
  });

  // ─── GET /api/gigs/analytics/dashboard ─────────────────────────────────
  app.get("/api/gigs/analytics/dashboard", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const allGigs = await db.select().from(gigs);
      const activeCount = allGigs.filter(g => g.status === "active").length;
      const pendingCount = allGigs.filter(g => g.status === "pending_approval").length;
      const suspendedCount = allGigs.filter(g => g.status === "suspended").length;
      const totalEarnings = allGigs.reduce((sum, g) => sum + parseFloat(g.predictedMonthlyEarningsZAR || "0"), 0);
      const avgScore = Math.round(allGigs.reduce((sum, g) => sum + g.aiIntelligenceScore, 0) / (allGigs.length || 1));

      res.json({
        totalGigs: allGigs.length,
        activeGigs: activeCount,
        pendingApproval: pendingCount,
        suspendedGigs: suspendedCount,
        totalMonthlyEarningsZAR: totalEarnings.toFixed(2),
        averageAIScore: avgScore,
        topGigs: allGigs.sort((a, b) => b.ordersLifetime - a.ordersLifetime).slice(0, 5),
      });
    } catch (err) { res.status(500).json({ error: "Failed to fetch analytics" }); }
  });

  console.log("[routes] Gig Marketplace routes registered: /api/gigs/*");
}
