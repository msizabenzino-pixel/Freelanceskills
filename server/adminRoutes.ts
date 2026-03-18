import { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, and, or, desc, asc, ilike, gte, lte, inArray, count, sql } from "drizzle-orm";
import {
  users, profiles, userActivityLogs, walletTransactions,
  courses, courseProgress, certificates
} from "@shared/schema";

const ADMIN_USER_ID = "user_2Pz69BfA5yS3R8M";

function isAdminUser(userId: string, role?: string | null) {
  return userId === ADMIN_USER_ID || role === "admin";
}

async function logActivity(
  userId: string,
  action: string,
  details: string,
  performedBy?: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string
) {
  try {
    await db.insert(userActivityLogs).values({
      userId,
      performedBy: performedBy || null,
      action,
      details,
      metadata: metadata || null,
      ipAddress: ipAddress || null,
    });
  } catch (e) {
    console.error("Activity log error:", e);
  }
}

export function registerAdminRoutes(app: Express, isAuthenticated: any) {

  // ─── Middleware: require admin ───────────────────────────────────────────────
  async function requireAdmin(req: any, res: Response, next: any) {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
    if (!isAdminUser(userId, profile?.role)) return res.status(403).json({ error: "Admin access required" });
    (req as any).adminId = userId;
    (req as any).adminProfile = profile;
    next();
  }

  // ─── GET /api/admin/users ──────────────────────────────────────────────────
  // List all users with filters, pagination, sorting
  app.get("/api/admin/users", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const {
        page = "1", limit = "20", search = "", role = "", status = "",
        kycStatus = "", country = "", userType = "",
        dateFrom = "", dateTo = "", sortBy = "createdAt", sortDir = "desc"
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const conditions: any[] = [];

      if (search) {
        conditions.push(
          or(
            ilike(users.email, `%${search}%`),
            ilike(users.firstName, `%${search}%`),
            ilike(users.lastName, `%${search}%`)
          )
        );
      }
      if (role) conditions.push(eq(profiles.role, role));
      if (status) conditions.push(eq(profiles.status, status));
      if (kycStatus) conditions.push(eq(profiles.kycStatus, kycStatus));
      if (country) conditions.push(ilike(profiles.country, `%${country}%`));
      if (userType) conditions.push(eq(profiles.userType, userType));
      if (dateFrom) conditions.push(gte(users.createdAt, new Date(dateFrom)));
      if (dateTo) conditions.push(lte(users.createdAt, new Date(dateTo)));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const orderCol = sortBy === "email" ? users.email
        : sortBy === "lastLoginAt" ? profiles.lastLoginAt
        : sortBy === "walletBalance" ? profiles.walletBalance
        : users.createdAt;
      const orderDir = sortDir === "asc" ? asc(orderCol as any) : desc(orderCol as any);

      const [rows, totalRows] = await Promise.all([
        db.select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          // profile fields
          profileId: profiles.id,
          userType: profiles.userType,
          role: profiles.role,
          status: profiles.status,
          kycStatus: profiles.kycStatus,
          location: profiles.location,
          country: profiles.country,
          phoneNumber: profiles.phoneNumber,
          walletBalance: profiles.walletBalance,
          lastLoginAt: profiles.lastLoginAt,
          lastLoginIp: profiles.lastLoginIp,
          isPro: profiles.isPro,
          completedJobs: profiles.completedJobs,
          rating: profiles.rating,
          suspendedUntil: profiles.suspendedUntil,
          suspendedReason: profiles.suspendedReason,
          banReason: profiles.banReason,
        })
          .from(users)
          .leftJoin(profiles, eq(profiles.userId, users.id))
          .where(whereClause)
          .orderBy(orderDir)
          .limit(limitNum)
          .offset(offset),
        db.select({ total: count() })
          .from(users)
          .leftJoin(profiles, eq(profiles.userId, users.id))
          .where(whereClause),
      ]);

      res.json({
        users: rows,
        total: totalRows[0]?.total || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((totalRows[0]?.total || 0) / limitNum),
      });
    } catch (err) {
      console.error("Admin list users error:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // ─── GET /api/admin/users/export ──────────────────────────────────────────
  app.get("/api/admin/users/export", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { search = "", role = "", status = "", kycStatus = "", country = "" } = req.query as Record<string, string>;
      const conditions: any[] = [];
      if (search) conditions.push(or(ilike(users.email, `%${search}%`), ilike(users.firstName, `%${search}%`), ilike(users.lastName, `%${search}%`)));
      if (role) conditions.push(eq(profiles.role, role));
      if (status) conditions.push(eq(profiles.status, status));
      if (kycStatus) conditions.push(eq(profiles.kycStatus, kycStatus));
      if (country) conditions.push(ilike(profiles.country, `%${country}%`));

      const rows = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        userType: profiles.userType,
        role: profiles.role,
        status: profiles.status,
        kycStatus: profiles.kycStatus,
        country: profiles.country,
        phoneNumber: profiles.phoneNumber,
        walletBalance: profiles.walletBalance,
        lastLoginAt: profiles.lastLoginAt,
        lastLoginIp: profiles.lastLoginIp,
        createdAt: users.createdAt,
        completedJobs: profiles.completedJobs,
        isPro: profiles.isPro,
      })
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(10000);

      const headers = [
        "User ID", "First Name", "Last Name", "Email", "Phone", "Role", "User Type",
        "Status", "KYC Status", "Country", "Wallet Balance (ZAR)", "Completed Jobs",
        "Pro", "Last Login", "Last IP", "Registered"
      ];
      const csvRows = rows.map(r => [
        r.id, r.firstName || "", r.lastName || "", r.email || "",
        r.phoneNumber || "", r.role || "client", r.userType || "client",
        r.status || "active", r.kycStatus || "not_started", r.country || "",
        r.walletBalance != null ? (r.walletBalance / 100).toFixed(2) : "0.00",
        r.completedJobs || 0, r.isPro ? "Yes" : "No",
        r.lastLoginAt ? new Date(r.lastLoginAt).toISOString() : "",
        r.lastLoginIp || "",
        r.createdAt ? new Date(r.createdAt).toISOString() : "",
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

      const csv = [headers.join(","), ...csvRows].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="users-${Date.now()}.csv"`);
      res.send(csv);
    } catch (err) {
      console.error("Admin export error:", err);
      res.status(500).json({ error: "Export failed" });
    }
  });

  // ─── GET /api/admin/users/:id ─────────────────────────────────────────────
  app.get("/api/admin/users/:id", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const [userData] = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profileId: profiles.id,
        userType: profiles.userType,
        role: profiles.role,
        status: profiles.status,
        kycStatus: profiles.kycStatus,
        bio: profiles.bio,
        title: profiles.title,
        skills: profiles.skills,
        hourlyRate: profiles.hourlyRate,
        location: profiles.location,
        country: profiles.country,
        phoneNumber: profiles.phoneNumber,
        walletBalance: profiles.walletBalance,
        lastLoginAt: profiles.lastLoginAt,
        lastLoginIp: profiles.lastLoginIp,
        isPro: profiles.isPro,
        completedJobs: profiles.completedJobs,
        rating: profiles.rating,
        suspendedUntil: profiles.suspendedUntil,
        suspendedReason: profiles.suspendedReason,
        banReason: profiles.banReason,
      }).from(users).leftJoin(profiles, eq(profiles.userId, users.id)).where(eq(users.id, id));

      if (!userData) return res.status(404).json({ error: "User not found" });

      // Academy progress (count completed lessons per course as proxy for progress)
      const [progressRows, certsRows] = await Promise.all([
        db.select({ courseId: courseProgress.courseId, completed: courseProgress.completed, completedAt: courseProgress.completedAt })
          .from(courseProgress).where(eq(courseProgress.userId, id)),
        db.select().from(certificates).where(eq(certificates.userId, id)),
      ]);

      res.json({
        ...userData,
        academyProgress: progressRows,
        certificates: certsRows,
      });
    } catch (err) {
      console.error("Admin get user error:", err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // ─── PATCH /api/admin/users/:id/status ────────────────────────────────────
  app.patch("/api/admin/users/:id/status", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { status, reason, suspendedUntil } = req.body;
      const adminId = req.adminId;

      const validStatuses = ["active", "suspended", "banned", "pending"];
      if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

      const updates: Record<string, any> = { status, updatedAt: new Date() };
      if (status === "suspended") {
        updates.suspendedReason = reason || null;
        updates.suspendedUntil = suspendedUntil ? new Date(suspendedUntil) : null;
      } else if (status === "banned") {
        updates.banReason = reason || null;
        updates.suspendedUntil = null;
      } else if (status === "active") {
        updates.suspendedReason = null;
        updates.suspendedUntil = null;
        updates.banReason = null;
      }

      await db.update(profiles).set(updates).where(eq(profiles.userId, id));
      await logActivity(id, `status_change_${status}`,
        `Status changed to ${status}${reason ? `: ${reason}` : ""}`,
        adminId, { status, reason, suspendedUntil }, req.ip);

      res.json({ success: true, status });
    } catch (err) {
      console.error("Admin update status error:", err);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // ─── PATCH /api/admin/users/:id/role ─────────────────────────────────────
  app.patch("/api/admin/users/:id/role", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const adminId = req.adminId;

      const validRoles = ["client", "freelancer", "admin", "moderator", "upskiller"];
      if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });

      const [existing] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.userId, id));
      const oldRole = existing?.role;

      await db.update(profiles).set({ role, updatedAt: new Date() }).where(eq(profiles.userId, id));
      await logActivity(id, "role_change",
        `Role changed from ${oldRole} to ${role}`,
        adminId, { oldRole, newRole: role }, req.ip);

      res.json({ success: true, role });
    } catch (err) {
      console.error("Admin update role error:", err);
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  // ─── PATCH /api/admin/users/:id/kyc ──────────────────────────────────────
  app.patch("/api/admin/users/:id/kyc", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { kycStatus, notes } = req.body;
      const adminId = req.adminId;

      const validKyc = ["not_started", "pending", "verified", "rejected"];
      if (!validKyc.includes(kycStatus)) return res.status(400).json({ error: "Invalid KYC status" });

      await db.update(profiles).set({ kycStatus, updatedAt: new Date() }).where(eq(profiles.userId, id));
      await logActivity(id, `kyc_${kycStatus}`,
        `KYC status updated to ${kycStatus}${notes ? `: ${notes}` : ""}`,
        adminId, { kycStatus, notes }, req.ip);

      res.json({ success: true, kycStatus });
    } catch (err) {
      console.error("Admin update KYC error:", err);
      res.status(500).json({ error: "Failed to update KYC" });
    }
  });

  // ─── POST /api/admin/users/:id/reset-password ─────────────────────────────
  app.post("/api/admin/users/:id/reset-password", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const adminId = req.adminId;
      const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, id));
      if (!user) return res.status(404).json({ error: "User not found" });

      // Generate a reset token (reuse existing system if available)
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      const { passwordResetTokens } = await import("@shared/schema");
      await db.insert(passwordResetTokens).values({ userId: id, token, expiresAt });

      await logActivity(id, "password_reset_forced",
        `Admin forced password reset for ${user.email}`,
        adminId, { email: user.email }, req.ip);

      res.json({ success: true, message: `Password reset initiated for ${user.email}`, token });
    } catch (err) {
      console.error("Admin reset password error:", err);
      res.status(500).json({ error: "Failed to initiate password reset" });
    }
  });

  // ─── POST /api/admin/users/:id/message ────────────────────────────────────
  app.post("/api/admin/users/:id/message", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { subject, body } = req.body;
      const adminId = req.adminId;

      if (!body) return res.status(400).json({ error: "Message body required" });

      // Log the message action
      await logActivity(id, "admin_message_sent",
        `Admin message sent: ${subject || "(no subject)"}`,
        adminId, { subject, body: body.substring(0, 200) }, req.ip);

      // Store as notification
      const { notifications } = await import("@shared/schema");
      await db.insert(notifications).values({
        userId: id,
        type: "admin_message",
        title: subject || "Message from Admin",
        message: body,
        read: false,
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Admin send message error:", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ─── GET /api/admin/users/:id/activity ────────────────────────────────────
  app.get("/api/admin/users/:id/activity", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { page = "1", limit = "50" } = req.query as Record<string, string>;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(200, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      const logs = await db.select()
        .from(userActivityLogs)
        .where(eq(userActivityLogs.userId, id))
        .orderBy(desc(userActivityLogs.createdAt))
        .limit(limitNum)
        .offset(offset);

      res.json(logs);
    } catch (err) {
      console.error("Admin user activity error:", err);
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  });

  // ─── GET /api/admin/users/:id/wallet ──────────────────────────────────────
  app.get("/api/admin/users/:id/wallet", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const [balanceRow] = await db.select({ walletBalance: profiles.walletBalance })
        .from(profiles).where(eq(profiles.userId, id));

      const transactions = await db.select()
        .from(walletTransactions)
        .where(eq(walletTransactions.userId, id))
        .orderBy(desc(walletTransactions.createdAt))
        .limit(100);

      res.json({ balance: balanceRow?.walletBalance || 0, transactions });
    } catch (err) {
      console.error("Admin wallet error:", err);
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  // ─── POST /api/admin/users/:id/wallet ─────────────────────────────────────
  // Manual credit/debit
  app.post("/api/admin/users/:id/wallet", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { type, amountCents, description } = req.body;
      const adminId = req.adminId;

      if (!["credit", "debit"].includes(type)) return res.status(400).json({ error: "type must be 'credit' or 'debit'" });
      if (!amountCents || amountCents <= 0) return res.status(400).json({ error: "amountCents must be positive" });

      const [existing] = await db.select({ walletBalance: profiles.walletBalance })
        .from(profiles).where(eq(profiles.userId, id));
      const currentBalance = existing?.walletBalance || 0;
      const delta = type === "credit" ? amountCents : -amountCents;
      const newBalance = currentBalance + delta;

      if (newBalance < 0) return res.status(400).json({ error: "Insufficient wallet balance" });

      await db.update(profiles).set({ walletBalance: newBalance, updatedAt: new Date() }).where(eq(profiles.userId, id));
      await db.insert(walletTransactions).values({
        userId: id,
        type,
        amountCents: delta,
        balanceAfterCents: newBalance,
        description: description || `Manual ${type} by admin`,
        referenceType: "manual",
        performedBy: adminId,
      });

      await logActivity(id, `wallet_${type}`,
        `Admin manual ${type}: R${(amountCents / 100).toFixed(2)}. ${description || ""}`,
        adminId, { type, amountCents, newBalance }, req.ip);

      res.json({ success: true, newBalance });
    } catch (err) {
      console.error("Admin wallet update error:", err);
      res.status(500).json({ error: "Failed to update wallet" });
    }
  });

  // ─── GET /api/admin/activity-log ─────────────────────────────────────────
  app.get("/api/admin/activity-log", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { page = "1", limit = "50", action = "" } = req.query as Record<string, string>;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(200, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      const conditions: any[] = [];
      if (action) conditions.push(ilike(userActivityLogs.action, `%${action}%`));

      const logs = await db.select({
        log: userActivityLogs,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      })
        .from(userActivityLogs)
        .leftJoin(users, eq(users.id, userActivityLogs.userId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(userActivityLogs.createdAt))
        .limit(limitNum)
        .offset(offset);

      res.json(logs);
    } catch (err) {
      console.error("Admin global activity log error:", err);
      res.status(500).json({ error: "Failed to fetch activity log" });
    }
  });

  // ─── GET /api/admin/stats ─────────────────────────────────────────────────
  app.get("/api/admin/stats", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const [
        totalUsersRow,
        activeRow,
        suspendedRow,
        bannedRow,
        verifiedKycRow,
        pendingKycRow,
      ] = await Promise.all([
        db.select({ c: count() }).from(users),
        db.select({ c: count() }).from(profiles).where(eq(profiles.status, "active")),
        db.select({ c: count() }).from(profiles).where(eq(profiles.status, "suspended")),
        db.select({ c: count() }).from(profiles).where(eq(profiles.status, "banned")),
        db.select({ c: count() }).from(profiles).where(eq(profiles.kycStatus, "verified")),
        db.select({ c: count() }).from(profiles).where(eq(profiles.kycStatus, "pending")),
      ]);

      res.json({
        totalUsers: totalUsersRow[0]?.c || 0,
        activeUsers: activeRow[0]?.c || 0,
        suspendedUsers: suspendedRow[0]?.c || 0,
        bannedUsers: bannedRow[0]?.c || 0,
        verifiedKyc: verifiedKycRow[0]?.c || 0,
        pendingKyc: pendingKycRow[0]?.c || 0,
      });
    } catch (err) {
      console.error("Admin stats error:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ─── POST /api/admin/users/bulk-action ────────────────────────────────────
  app.post("/api/admin/users/bulk-action", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { userIds, action, reason, role } = req.body;
      const adminId = req.adminId;

      if (!Array.isArray(userIds) || userIds.length === 0) return res.status(400).json({ error: "userIds required" });
      if (userIds.length > 100) return res.status(400).json({ error: "Max 100 users per bulk action" });

      const validActions = ["activate", "suspend", "ban", "change_role", "verify_kyc", "reject_kyc"];
      if (!validActions.includes(action)) return res.status(400).json({ error: "Invalid action" });

      if (action === "activate") {
        await db.update(profiles).set({ status: "active", suspendedReason: null, banReason: null, updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "suspend") {
        await db.update(profiles).set({ status: "suspended", suspendedReason: reason || "Bulk action", updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "ban") {
        await db.update(profiles).set({ status: "banned", banReason: reason || "Bulk action", updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "change_role" && role) {
        const validRoles = ["client", "freelancer", "admin", "moderator", "upskiller"];
        if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });
        await db.update(profiles).set({ role, updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "verify_kyc") {
        await db.update(profiles).set({ kycStatus: "verified", updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "reject_kyc") {
        await db.update(profiles).set({ kycStatus: "rejected", updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      }

      // Log for all affected users
      await Promise.all(userIds.map((uid: string) =>
        logActivity(uid, `bulk_${action}`, `Bulk action: ${action}${reason ? ` - ${reason}` : ""}`, adminId, { action, reason, role }, req.ip)
      ));

      res.json({ success: true, affected: userIds.length });
    } catch (err) {
      console.error("Admin bulk action error:", err);
      res.status(500).json({ error: "Bulk action failed" });
    }
  });
}
