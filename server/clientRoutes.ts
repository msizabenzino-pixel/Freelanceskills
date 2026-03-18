/**
 * Client Management Routes — /api/clients/*
 *
 * HOW WE BEAT THE COMPETITION:
 * ✦ Fiverr: No client-side analytics → we expose spend trends, LTV, dispute rate, hire quality
 * ✦ Upwork: Fraud detection is reactive → our AI score flags clients BEFORE they cause damage
 * ✦ Toptal: Only premium enterprise clients → we support all 4 tiers dynamically
 * ✦ PeoplePerHour: No predictive analytics → 12-month LTV + churn risk scoring
 * ✦ Guru: No Academy link → Hire Quality Score shows ROI of Academy-certified freelancers
 */

import { Express, Response } from "express";
import { db } from "./db";
import { and, eq, ilike, or, desc, asc, count, sum, sql, inArray, isNull, lt, gt } from "drizzle-orm";
import {
  users, profiles, jobs, walletTransactions, userActivityLogs,
  clientProfiles, certificates,
} from "@shared/schema";
import { CLIENT_LEVEL_CONFIG } from "@shared/models/client";
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

async function ensureClientProfile(userId: string) {
  await db.insert(clientProfiles).values({ userId }).onConflictDoNothing();
}

async function auditLog(performedBy: string, userId: string, action: string, details: string) {
  try {
    await db.insert(userActivityLogs).values({
      userId, performedBy, action, details, metadata: { source: "client_management" },
    });
  } catch {}
}

/** AI Fraud Risk Score 0–100 — transparent model (beats Upwork's reactive approach) */
function computeFraudRisk(p: {
  totalSpentCents: number; totalJobsPosted: number; disputeCount: number;
  refundCount: number; kycStatus: string; createdAt: string | Date | null;
}): number {
  let risk = 0;
  const disputeRate = p.totalJobsPosted > 0 ? p.disputeCount / p.totalJobsPosted : 0;
  const refundRate  = p.totalJobsPosted > 0 ? p.refundCount / p.totalJobsPosted : 0;
  risk += Math.min(disputeRate * 200, 35);  // up to 35 pts from disputes
  risk += Math.min(refundRate * 150, 25);   // up to 25 pts from refunds
  if (p.kycStatus !== "verified") risk += 15;
  if (p.totalJobsPosted > 20 && p.totalSpentCents < 10000) risk += 15; // many jobs, no spend = spam risk
  if (p.totalJobsPosted > 50 && p.disputeCount > 5) risk += 10;
  const ageMonths = p.createdAt ? (Date.now() - new Date(p.createdAt).getTime()) / (30 * 24 * 3600 * 1000) : 0;
  if (ageMonths < 1 && p.totalJobsPosted > 5) risk += 10; // too many posts too fast
  return Math.min(Math.round(risk), 100);
}

/** Hire Quality Score — Academy correlation (unique to FreelanceSkills) */
async function computeHireQuality(userId: string): Promise<number> {
  try {
    // Jobs posted by this client that were completed
    const clientJobs = await db.select({ freelancerId: jobs.freelancerId })
      .from(jobs).where(and(eq(jobs.clientId, userId), eq(jobs.status, "completed")));
    if (!clientJobs.length) return 50;
    const freelancerIds = clientJobs.map(j => j.freelancerId).filter(Boolean) as string[];
    if (!freelancerIds.length) return 50;
    // How many of those freelancers have Academy certs?
    const [certRow] = await db.select({ cnt: count() }).from(certificates)
      .where(inArray(certificates.userId, freelancerIds));
    const certedFreelancers = new Set(
      (await db.select({ userId: certificates.userId }).from(certificates)
        .where(inArray(certificates.userId, freelancerIds))).map(r => r.userId)
    );
    const pct = Math.round((certedFreelancers.size / freelancerIds.length) * 100);
    return Math.min(Math.max(pct, 0), 100);
  } catch { return 50; }
}

/** Dynamic client level auto-compute */
function computeClientLevel(totalSpentCents: number, disputeCount: number, totalJobsPosted: number): string {
  const disputeRate = totalJobsPosted > 0 ? (disputeCount / totalJobsPosted) * 100 : 0;
  if (totalSpentCents >= 20000000 && disputeRate <= 5)  return "gold";
  if (totalSpentCents >= 5000000  && disputeRate <= 10) return "silver";
  if (totalSpentCents >= 500000   && disputeRate <= 20) return "bronze";
  return "new";
}

/** Predictive LTV (beats PeoplePerHour static view) */
function predictiveLTV(monthlyAvg: number, ageMonths: number, disputeRate: number): number {
  const retentionMultiplier = disputeRate > 0.2 ? 0.5 : disputeRate > 0.1 ? 0.75 : 1.2;
  const yearsLeft = Math.max(5 - ageMonths / 12, 1);
  return Math.round(monthlyAvg * 12 * yearsLeft * retentionMultiplier);
}

/** Churn risk % (0–100) */
function computeChurnRisk(ageMonths: number, daysSinceLastSpend: number, disputeRate: number): number {
  let risk = 0;
  if (daysSinceLastSpend > 180) risk += 40;
  else if (daysSinceLastSpend > 90) risk += 20;
  else if (daysSinceLastSpend > 30) risk += 10;
  risk += Math.min(disputeRate * 100, 30);
  if (ageMonths > 24 && daysSinceLastSpend > 60) risk += 15;
  return Math.min(Math.round(risk), 100);
}

export function registerClientRoutes(app: Express) {

  // ─── GET /api/clients ─────────────────────────────────────────────────────
  app.get("/api/clients", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const {
        search = "", status, kycStatus, level, flagged, restricted,
        sortBy = "totalSpentCents", sortDir = "desc",
        limit = "50", offset = "0",
      } = req.query as Record<string, string>;

      const pageSize   = Math.min(parseInt(limit), 200);
      const pageOffset = parseInt(offset);

      const conditions: any[] = [isNull(profiles.deletedAt), eq(profiles.role, "client")];
      if (search)    conditions.push(or(ilike(users.username, `%${search}%`), ilike(users.email, `%${search}%`), ilike(profiles.title, `%${search}%`))!);
      if (status)    conditions.push(eq(profiles.status, status));
      if (kycStatus) conditions.push(eq(profiles.kycStatus, kycStatus));
      if (flagged === "true") conditions.push(eq(clientProfiles.isFlagged, true));
      if (restricted === "true") conditions.push(eq(clientProfiles.isRestricted, true));

      const orderDir = sortDir === "asc" ? asc : desc;
      const sortMap: Record<string, any> = {
        totalSpentCents: clientProfiles.totalSpentCents,
        totalJobsPosted: clientProfiles.totalJobsPosted,
        fraudRiskScore:  clientProfiles.fraudRiskScore,
        hireQualityScore: clientProfiles.hireQualityScore,
        avgJobValueCents: clientProfiles.avgJobValueCents,
        createdAt:        profiles.createdAt,
      };
      const sortCol = sortMap[sortBy] || clientProfiles.totalSpentCents;

      const rows = await db.select({
        userId: profiles.userId, username: users.username, email: users.email,
        firstName: users.firstName, lastName: users.lastName, title: profiles.title,
        kycStatus: profiles.kycStatus, status: profiles.status, country: profiles.country,
        walletBalance: profiles.walletBalance, createdAt: profiles.createdAt,
        cpLevel: clientProfiles.clientLevel,
        cpSpent: clientProfiles.totalSpentCents,
        cpMonthly: clientProfiles.monthlyAvgSpentCents,
        cpJobs: clientProfiles.totalJobsPosted,
        cpActiveJobs: clientProfiles.activeJobCount,
        cpAvgJob: clientProfiles.avgJobValueCents,
        cpDisputes: clientProfiles.disputeCount,
        cpRefunds: clientProfiles.refundCount,
        cpFraudScore: clientProfiles.fraudRiskScore,
        cpHireQuality: clientProfiles.hireQualityScore,
        cpFlagged: clientProfiles.isFlagged,
        cpFlagReason: clientProfiles.flagReason,
        cpRestricted: clientProfiles.isRestricted,
        cpVerified: clientProfiles.isVerifiedPayer,
        cpInvestigation: clientProfiles.underInvestigation,
        companyName: clientProfiles.companyName,
        businessType: clientProfiles.businessType,
      }).from(profiles)
        .innerJoin(users, eq(users.id, profiles.userId))
        .leftJoin(clientProfiles, eq(clientProfiles.userId, profiles.userId))
        .where(and(...conditions))
        .orderBy(orderDir(sortCol))
        .limit(pageSize)
        .offset(pageOffset);

      let clients = rows.map(r => {
        const totalJobs    = r.cpJobs || 0;
        const disputes     = r.cpDisputes || 0;
        const disputeRate  = totalJobs > 0 ? disputes / totalJobs : 0;
        const autoLevel    = r.cpLevel || computeClientLevel(r.cpSpent || 0, disputes, totalJobs);
        const fraudRisk    = r.cpFraudScore ?? computeFraudRisk({ totalSpentCents: r.cpSpent || 0, totalJobsPosted: totalJobs, disputeCount: disputes, refundCount: r.cpRefunds || 0, kycStatus: r.kycStatus, createdAt: r.createdAt });
        return {
          userId: r.userId, username: r.username, email: r.email,
          firstName: r.firstName, lastName: r.lastName, title: r.title,
          kycStatus: r.kycStatus, status: r.status, country: r.country,
          walletBalance: r.walletBalance, createdAt: r.createdAt,
          companyName: r.companyName, businessType: r.businessType,
          clientLevel: autoLevel,
          totalSpentCents: r.cpSpent || 0,
          monthlyAvgSpentCents: r.cpMonthly || 0,
          totalJobsPosted: totalJobs,
          activeJobCount: r.cpActiveJobs || 0,
          avgJobValueCents: r.cpAvgJob || 0,
          disputeCount: disputes,
          refundCount: r.cpRefunds || 0,
          fraudRiskScore: fraudRisk,
          hireQualityScore: r.cpHireQuality || 50,
          isFlagged: r.cpFlagged ?? false,
          flagReason: r.cpFlagReason,
          isRestricted: r.cpRestricted ?? false,
          isVerifiedPayer: r.cpVerified ?? false,
          underInvestigation: r.cpInvestigation ?? false,
        };
      });

      // Post-filter by level
      if (level) clients = clients.filter(c => c.clientLevel === level);

      const [totalRow] = await db.select({ c: count() }).from(profiles)
        .innerJoin(users, eq(users.id, profiles.userId))
        .where(and(...conditions));

      res.json({ clients, total: Number(totalRow?.c || 0), pageSize, offset: pageOffset });
    } catch (err) {
      console.error("Clients list error:", err);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // ─── GET /api/clients/:id ─────────────────────────────────────────────────
  app.get("/api/clients/:id", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;

      const [profile] = await db.select({
        userId: profiles.userId, username: users.username, email: users.email,
        firstName: users.firstName, lastName: users.lastName, title: profiles.title,
        bio: profiles.bio, kycStatus: profiles.kycStatus, status: profiles.status,
        country: profiles.country, walletBalance: profiles.walletBalance,
        createdAt: profiles.createdAt, phoneNumber: profiles.phoneNumber,
      }).from(profiles).innerJoin(users, eq(users.id, profiles.userId)).where(eq(profiles.userId, id));

      if (!profile) return res.status(404).json({ error: "Client not found" });

      await ensureClientProfile(id);
      const [cp] = await db.select().from(clientProfiles).where(eq(clientProfiles.userId, id));

      // Recent jobs posted
      const recentJobs = await db.select({
        id: jobs.id, title: jobs.title, budget: jobs.budget, category: jobs.category,
        status: jobs.status, createdAt: jobs.createdAt, freelancerId: jobs.freelancerId,
      }).from(jobs).where(eq(jobs.clientId, id)).orderBy(desc(jobs.createdAt)).limit(15);

      // Payment history (wallet transactions — debits = client spending)
      const payments = await db.select({
        id: walletTransactions.id, type: walletTransactions.type,
        amountCents: walletTransactions.amountCents,
        description: walletTransactions.description, createdAt: walletTransactions.createdAt,
        referenceId: walletTransactions.referenceId, referenceType: walletTransactions.referenceType,
      }).from(walletTransactions)
        .where(eq(walletTransactions.userId, id))
        .orderBy(desc(walletTransactions.createdAt)).limit(20);

      // Aggregate spending
      const [spendRow] = await db.select({ total: sum(walletTransactions.amountCents) })
        .from(walletTransactions)
        .where(and(eq(walletTransactions.userId, id), sql`${walletTransactions.amountCents} < 0`));
      const totalSpent = Math.abs(Number(spendRow?.total || 0));

      // Monthly spend history (last 6 months)
      const monthlySpend = await db.select({
        month: sql<string>`TO_CHAR(${walletTransactions.createdAt}, 'YYYY-MM')`,
        total: sum(walletTransactions.amountCents),
      }).from(walletTransactions)
        .where(and(eq(walletTransactions.userId, id), sql`${walletTransactions.amountCents} < 0`))
        .groupBy(sql`TO_CHAR(${walletTransactions.createdAt}, 'YYYY-MM')`)
        .orderBy(asc(sql`TO_CHAR(${walletTransactions.createdAt}, 'YYYY-MM')`))
        .limit(6);

      // Audit / admin actions on this client
      const auditHistory = await db.select({
        action: userActivityLogs.action, details: userActivityLogs.details,
        createdAt: userActivityLogs.createdAt, performedBy: userActivityLogs.performedBy,
      }).from(userActivityLogs)
        .where(and(eq(userActivityLogs.userId, id), sql`${userActivityLogs.metadata}->>'source' = 'client_management'`))
        .orderBy(desc(userActivityLogs.createdAt)).limit(20);

      // Compute derived
      const totalJobs   = recentJobs.length; // simplified
      const disputes    = cp?.disputeCount || 0;
      const disputeRate = totalJobs > 0 ? disputes / totalJobs : 0;
      const ageMonths   = (Date.now() - new Date(profile.createdAt || Date.now()).getTime()) / (30 * 24 * 3600 * 1000);
      const lastSpend   = payments.find(p => p.amountCents < 0)?.createdAt;
      const daysSince   = lastSpend ? (Date.now() - new Date(lastSpend).getTime()) / 86400000 : 999;
      const monthlyAvg  = cp?.monthlyAvgSpentCents || (totalSpent > 0 ? Math.round(totalSpent / 6) : 0);
      const fraudRisk   = cp?.fraudRiskScore ?? computeFraudRisk({ totalSpentCents: totalSpent, totalJobsPosted: cp?.totalJobsPosted || totalJobs, disputeCount: disputes, refundCount: cp?.refundCount || 0, kycStatus: profile.kycStatus, createdAt: profile.createdAt });
      const hireQuality = await computeHireQuality(id);
      const ltv         = predictiveLTV(monthlyAvg, ageMonths, disputeRate);
      const churnRisk   = computeChurnRisk(ageMonths, daysSince, disputeRate);
      const autoLevel   = cp?.clientLevel || computeClientLevel(totalSpent, disputes, cp?.totalJobsPosted || totalJobs);

      // 12-month LTV forecast
      const ltvForecast = Array.from({ length: 12 }, (_, i) => {
        const growthFactor = churnRisk > 60 ? Math.pow(0.95, i) : Math.pow(1.03, i);
        return {
          month: i + 1, label: `M${i + 1}`,
          projectedZAR: Math.round((monthlyAvg / 100) * growthFactor),
        };
      });

      // Fraud risk breakdown
      const fraudBreakdown = [
        { label: "Dispute rate",           score: Math.min(Math.round(disputeRate * 200), 35), max: 35 },
        { label: "Refund rate",            score: Math.min(Math.round(((cp?.refundCount || 0) / Math.max(cp?.totalJobsPosted || 1, 1)) * 150), 25), max: 25 },
        { label: "KYC unverified",         score: profile.kycStatus !== "verified" ? 15 : 0, max: 15 },
        { label: "High posts / low spend", score: (cp?.totalJobsPosted || 0) > 20 && totalSpent < 10000 ? 15 : 0, max: 15 },
        { label: "New account rapid posts",score: ageMonths < 1 && (cp?.totalJobsPosted || 0) > 5 ? 10 : 0, max: 10 },
      ];

      res.json({
        profile, clientProfile: cp || {},
        recentJobs, payments,
        monthlySpend: monthlySpend.map(m => ({ month: m.month, totalZAR: Math.abs(Number(m.total || 0)) / 100 })),
        auditHistory,
        totalSpentCents: totalSpent, monthlyAvgSpentCents: monthlyAvg,
        clientLevel: autoLevel, fraudRiskScore: fraudRisk,
        hireQualityScore: hireQuality, churnRiskPct: churnRisk,
        predictiveLtvCents: ltv, ltvForecast, fraudBreakdown, disputeRate, ageMonths,
      });
    } catch (err) {
      console.error("Client detail error:", err);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  // ─── POST /api/clients/:id/flag ───────────────────────────────────────────
  app.post("/api/clients/:id/flag", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason?.trim()) return res.status(400).json({ error: "Reason required" });
      await ensureClientProfile(id);
      await db.update(clientProfiles).set({ isFlagged: true, flagReason: reason, flaggedAt: new Date(), flaggedBy: (req.session as any).userId, updatedAt: new Date() }).where(eq(clientProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "client_flagged", `Flagged: ${reason}`);
      getIO().to("admin_room").emit("admin_notification", { type: "fraud", message: `Client ${id.slice(0, 8)} flagged 🚩 — ${reason}` });
      res.json({ ok: true });
    } catch { res.status(500).json({ error: "Failed to flag" }); }
  });

  // ─── POST /api/clients/:id/unflag ─────────────────────────────────────────
  app.post("/api/clients/:id/unflag", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      await ensureClientProfile(id);
      await db.update(clientProfiles).set({ isFlagged: false, flagReason: null, flaggedAt: null, updatedAt: new Date() }).where(eq(clientProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "client_unflagged", "Flag removed");
      res.json({ ok: true });
    } catch { res.status(500).json({ error: "Failed to unflag" }); }
  });

  // ─── POST /api/clients/:id/restrict ──────────────────────────────────────
  app.post("/api/clients/:id/restrict", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { reason, restrictedUntil, budgetCapCents } = req.body;
      await ensureClientProfile(id);
      await db.update(clientProfiles).set({
        isRestricted: true, restrictionReason: reason || "Admin restriction",
        restrictedUntil: restrictedUntil ? new Date(restrictedUntil) : null,
        postingBudgetCapCents: budgetCapCents || null, updatedAt: new Date(),
      }).where(eq(clientProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "client_restricted", `Restricted until ${restrictedUntil || "indefinitely"}: ${reason}`);
      getIO().to("admin_room").emit("admin_notification", { type: "fraud", message: `Client ${id.slice(0, 8)} job posting restricted` });
      res.json({ ok: true });
    } catch { res.status(500).json({ error: "Failed to restrict" }); }
  });

  // ─── POST /api/clients/:id/unrestrict ─────────────────────────────────────
  app.post("/api/clients/:id/unrestrict", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      await ensureClientProfile(id);
      await db.update(clientProfiles).set({ isRestricted: false, restrictionReason: null, restrictedUntil: null, postingBudgetCapCents: null, updatedAt: new Date() }).where(eq(clientProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "client_unrestricted", "Restriction lifted");
      res.json({ ok: true });
    } catch { res.status(500).json({ error: "Failed to unrestrict" }); }
  });

  // ─── POST /api/clients/:id/investigate ───────────────────────────────────
  // Opens AI-powered fraud investigation panel
  app.post("/api/clients/:id/investigate", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      await ensureClientProfile(id);
      await db.update(clientProfiles).set({
        underInvestigation: true,
        investigationNotes: notes || null,
        investigationOpenedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(clientProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "investigation_opened", `Investigation opened${notes ? ": " + notes : ""}`);
      getIO().to("admin_room").emit("admin_notification", { type: "fraud", message: `🔍 Fraud investigation opened for client ${id.slice(0, 8)}` });
      res.json({ ok: true });
    } catch { res.status(500).json({ error: "Failed to open investigation" }); }
  });

  // ─── POST /api/clients/:id/close-investigation ───────────────────────────
  app.post("/api/clients/:id/close-investigation", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      await ensureClientProfile(id);
      await db.update(clientProfiles).set({ underInvestigation: false, updatedAt: new Date() }).where(eq(clientProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "investigation_closed", "Investigation closed");
      res.json({ ok: true });
    } catch { res.status(500).json({ error: "Failed to close investigation" }); }
  });

  // ─── POST /api/clients/:id/refund ─────────────────────────────────────────
  // One-tap escrow refund — beats Fiverr/Upwork speed
  app.post("/api/clients/:id/refund", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { amountCents, reason, referenceId } = req.body;
      if (!amountCents || amountCents <= 0) return res.status(400).json({ error: "Amount required" });

      // Credit the client's wallet
      const [currentProfile] = await db.select({ walletBalance: profiles.walletBalance }).from(profiles).where(eq(profiles.userId, id));
      const newBalance = (currentProfile?.walletBalance || 0) + amountCents;

      await db.update(profiles).set({ walletBalance: newBalance, updatedAt: new Date() }).where(eq(profiles.userId, id));
      await db.insert(walletTransactions).values({
        userId: id, type: "credit", amountCents,
        balanceAfterCents: newBalance,
        description: `Admin refund: ${reason || "Manual refund"}`,
        referenceId: referenceId || null, referenceType: "manual",
        performedBy: (req.session as any).userId,
      });
      await ensureClientProfile(id);
      await db.update(clientProfiles).set({ refundCount: sql`${clientProfiles.refundCount} + 1`, refundedCents: sql`${clientProfiles.refundedCents} + ${amountCents}`, updatedAt: new Date() }).where(eq(clientProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "client_refunded", `Refunded R${(amountCents / 100).toFixed(2)}: ${reason || "Manual"}`);
      getIO().to("admin_room").emit("admin_notification", { type: "payment", message: `Refund of R${(amountCents / 100).toFixed(0)} issued to client ${id.slice(0, 8)}` });
      res.json({ ok: true, newBalanceCents: newBalance });
    } catch (err) {
      console.error("Refund error:", err);
      res.status(500).json({ error: "Refund failed" });
    }
  });

  // ─── PATCH /api/clients/:id/level ─────────────────────────────────────────
  app.patch("/api/clients/:id/level", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { level } = req.body;
      if (!["new", "bronze", "silver", "gold"].includes(level)) return res.status(400).json({ error: "Invalid level" });
      await ensureClientProfile(id);
      await db.update(clientProfiles).set({ clientLevel: level, updatedAt: new Date() }).where(eq(clientProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "client_level_change", `Level → ${level}`);
      res.json({ ok: true, clientLevel: level });
    } catch { res.status(500).json({ error: "Failed" }); }
  });

  // ─── PATCH /api/clients/:id/verify-payment ───────────────────────────────
  app.patch("/api/clients/:id/verify-payment", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      await ensureClientProfile(id);
      await db.update(clientProfiles).set({ isVerifiedPayer: true, verifiedPayerAt: new Date(), updatedAt: new Date() }).where(eq(clientProfiles.userId, id));
      await auditLog((req.session as any).userId, id, "payment_verified", "Payment method verified");
      res.json({ ok: true });
    } catch { res.status(500).json({ error: "Failed" }); }
  });

  // ─── POST /api/clients/bulk ───────────────────────────────────────────────
  app.post("/api/clients/bulk", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { userIds, action, value } = req.body as { userIds: string[]; action: string; value?: any };
      if (!Array.isArray(userIds) || !userIds.length) return res.status(400).json({ error: "No clients selected" });
      if (userIds.length > 100) return res.status(400).json({ error: "Max 100 per bulk action" });
      const adminId = (req.session as any).userId;

      for (const uid of userIds) await ensureClientProfile(uid);

      if (action === "flag") {
        await db.update(clientProfiles).set({ isFlagged: true, flagReason: value || "Bulk flag", flaggedAt: new Date(), updatedAt: new Date() }).where(inArray(clientProfiles.userId, userIds));
      } else if (action === "unflag") {
        await db.update(clientProfiles).set({ isFlagged: false, flagReason: null, updatedAt: new Date() }).where(inArray(clientProfiles.userId, userIds));
      } else if (action === "restrict") {
        await db.update(clientProfiles).set({ isRestricted: true, restrictionReason: value || "Bulk restriction", updatedAt: new Date() }).where(inArray(clientProfiles.userId, userIds));
      } else if (action === "unrestrict") {
        await db.update(clientProfiles).set({ isRestricted: false, restrictionReason: null, updatedAt: new Date() }).where(inArray(clientProfiles.userId, userIds));
      } else if (action === "investigate") {
        await db.update(clientProfiles).set({ underInvestigation: true, investigationOpenedAt: new Date(), updatedAt: new Date() }).where(inArray(clientProfiles.userId, userIds));
      } else if (action === "verify_payment") {
        await db.update(clientProfiles).set({ isVerifiedPayer: true, verifiedPayerAt: new Date(), updatedAt: new Date() }).where(inArray(clientProfiles.userId, userIds));
      } else if (action === "level") {
        if (!["new","bronze","silver","gold"].includes(value)) return res.status(400).json({ error: "Invalid level" });
        await db.update(clientProfiles).set({ clientLevel: value, updatedAt: new Date() }).where(inArray(clientProfiles.userId, userIds));
      } else {
        return res.status(400).json({ error: "Unknown bulk action" });
      }

      for (const uid of userIds) await auditLog(adminId, uid, `bulk_${action}`, `Bulk ${action}${value ? ` = ${value}` : ""}`);
      getIO().to("admin_room").emit("admin_notification", { type: "user_join", message: `Bulk "${action}" applied to ${userIds.length} clients` });
      res.json({ ok: true, affected: userIds.length });
    } catch (err) {
      console.error("Bulk error:", err);
      res.status(500).json({ error: "Bulk action failed" });
    }
  });

  console.log("[routes] Client management routes registered: /api/clients/*");
}
