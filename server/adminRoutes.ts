/**
 * Admin Routes — FreelanceSkills.net
 * Production-grade user management for a $1B platform
 * Scalability notes: All queries indexed on userId, status, role, kycStatus.
 * Redis-ready: swap MemoryCache for Redis by implementing same interface.
 */
import { Express, Request, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { db } from "./db";
import { eq, and, or, desc, asc, ilike, gte, lte, inArray, isNull, isNotNull, count, sql } from "drizzle-orm";
import {
  users, profiles, userActivityLogs, walletTransactions, kycDocuments,
  courses, courseProgress, certificates, notifications, passwordResetTokens,
} from "@shared/schema";
import { emitToUser } from "./socket";

const ADMIN_USER_ID = "user_2Pz69BfA5yS3R8M";
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "kyc");

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Multer: KYC file uploads ─────────────────────────────────────────────────
const kycStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `kyc-${unique}${ext}`);
  },
});

const kycUpload = multer({
  storage: kycStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG, PNG, WEBP or PDF allowed"));
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isAdminUser(userId: string, role?: string | null) {
  return userId === ADMIN_USER_ID || role === "admin";
}

async function logActivity(
  userId: string,
  action: string,
  details: string,
  performedBy?: string | null,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
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

// Send real-time notification + persist it
async function notifyUser(userId: string, title: string, message: string, type = "admin_action") {
  try {
    await db.insert(notifications).values({ userId, type, title, message, read: false });
    emitToUser(userId, "admin_notification", { title, message, type, timestamp: new Date().toISOString() });
  } catch (e) {
    console.error("Notify user error:", e);
  }
}

// Sanitize string input — strip HTML tags, trim, truncate
function sanitize(val: unknown, maxLen = 500): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").trim().slice(0, maxLen);
}

// Validate password strength
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) return { valid: false, reason: "Password must be at least 8 characters" };
  if (!/[A-Z]/.test(password)) return { valid: false, reason: "Password must contain at least one uppercase letter" };
  if (!/[a-z]/.test(password)) return { valid: false, reason: "Password must contain at least one lowercase letter" };
  if (!/\d/.test(password)) return { valid: false, reason: "Password must contain at least one number" };
  if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, reason: "Password must contain at least one special character" };
  return { valid: true };
}

// Auto-upgrade role based on academy completion (Scalability: run via cron for 1M+ users)
async function checkAcademyAutoUpgrade(userId: string) {
  try {
    const [certCount] = await db.select({ c: count() }).from(certificates).where(eq(certificates.userId, userId));
    if ((certCount?.c || 0) >= 3) {
      const [current] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.userId, userId));
      if (current?.role === "client" || current?.role === "freelancer") {
        await db.update(profiles).set({ role: "upskiller", updatedAt: new Date() }).where(eq(profiles.userId, userId));
        await logActivity(userId, "auto_role_upgrade", "Role auto-upgraded to 'upskiller' after earning 3+ certificates", null, { certCount: certCount?.c });
        await notifyUser(userId, "Role Upgraded!", "Congratulations! You've earned the Upskiller role after completing your academy courses.", "role_upgrade");
      }
    }
  } catch (e) {
    console.error("Auto-upgrade check error:", e);
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

  // Serve uploaded KYC files (admin-only)
  app.get("/api/admin/kyc-file/:filename", isAuthenticated, requireAdmin, (req: any, res: Response) => {
    const filename = path.basename(req.params.filename); // Prevent path traversal
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
    res.sendFile(filePath);
  });

  // ─── GET /api/admin/stats ─────────────────────────────────────────────────
  app.get("/api/admin/stats", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const [
        totalUsersRow, activeRow, suspendedRow, bannedRow,
        verifiedKycRow, pendingKycRow, deletedRow, pendingKycDocsRow,
      ] = await Promise.all([
        db.select({ c: count() }).from(users),
        db.select({ c: count() }).from(profiles).where(and(eq(profiles.status, "active"), isNull(profiles.deletedAt))),
        db.select({ c: count() }).from(profiles).where(and(eq(profiles.status, "suspended"), isNull(profiles.deletedAt))),
        db.select({ c: count() }).from(profiles).where(and(eq(profiles.status, "banned"), isNull(profiles.deletedAt))),
        db.select({ c: count() }).from(profiles).where(eq(profiles.kycStatus, "verified")),
        db.select({ c: count() }).from(profiles).where(eq(profiles.kycStatus, "pending")),
        db.select({ c: count() }).from(profiles).where(isNotNull(profiles.deletedAt)),
        db.select({ c: count() }).from(kycDocuments).where(eq(kycDocuments.status, "pending")),
      ]);
      res.json({
        totalUsers: totalUsersRow[0]?.c || 0,
        activeUsers: activeRow[0]?.c || 0,
        suspendedUsers: suspendedRow[0]?.c || 0,
        bannedUsers: bannedRow[0]?.c || 0,
        verifiedKyc: verifiedKycRow[0]?.c || 0,
        pendingKyc: pendingKycRow[0]?.c || 0,
        deletedUsers: deletedRow[0]?.c || 0,
        pendingKycDocs: pendingKycDocsRow[0]?.c || 0,
      });
    } catch (err) {
      console.error("Admin stats error:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ─── GET /api/admin/users ──────────────────────────────────────────────────
  // Scalability: indexed on status, role, kycStatus. For 10M+ users, add cursor pagination.
  app.get("/api/admin/users", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const {
        page = "1", limit = "20",
        search = "", role = "", status = "",
        kycStatus = "", country = "", userType = "",
        dateFrom = "", dateTo = "", sortBy = "createdAt", sortDir = "desc",
        showDeleted = "false",
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const includeDeleted = showDeleted === "true";

      const conditions: any[] = [];

      // Advanced search: name, email, phone, ID
      if (search) {
        const s = `%${sanitize(search, 100)}%`;
        conditions.push(or(
          ilike(users.email, s),
          ilike(users.firstName, s),
          ilike(users.lastName, s),
          ilike(profiles.phoneNumber, s),
          ilike(users.id, s),
        ));
      }
      if (role) conditions.push(eq(profiles.role, sanitize(role, 30)));
      if (status) conditions.push(eq(profiles.status, sanitize(status, 30)));
      if (kycStatus) conditions.push(eq(profiles.kycStatus, sanitize(kycStatus, 30)));
      if (country) conditions.push(ilike(profiles.country, `%${sanitize(country, 60)}%`));
      if (userType) conditions.push(eq(profiles.userType, sanitize(userType, 30)));
      if (dateFrom) conditions.push(gte(users.createdAt, new Date(dateFrom)));
      if (dateTo) conditions.push(lte(users.createdAt, new Date(dateTo)));

      // Soft-delete filter
      if (!includeDeleted) conditions.push(isNull(profiles.deletedAt));
      else conditions.push(isNotNull(profiles.deletedAt));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const orderCol = sortBy === "email" ? users.email
        : sortBy === "lastLoginAt" ? profiles.lastLoginAt
        : sortBy === "walletBalance" ? profiles.walletBalance
        : users.createdAt;
      const orderDir = sortDir === "asc" ? asc(orderCol as any) : desc(orderCol as any);

      const [rows, totalRows] = await Promise.all([
        db.select({
          id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName,
          profileImageUrl: users.profileImageUrl, createdAt: users.createdAt,
          profileId: profiles.id, userType: profiles.userType, role: profiles.role,
          status: profiles.status, kycStatus: profiles.kycStatus, location: profiles.location,
          country: profiles.country, phoneNumber: profiles.phoneNumber,
          walletBalance: profiles.walletBalance, lastLoginAt: profiles.lastLoginAt,
          lastLoginIp: profiles.lastLoginIp, isPro: profiles.isPro,
          completedJobs: profiles.completedJobs, rating: profiles.rating,
          suspendedUntil: profiles.suspendedUntil, suspendedReason: profiles.suspendedReason,
          banReason: profiles.banReason, deletedAt: profiles.deletedAt,
        })
          .from(users).leftJoin(profiles, eq(profiles.userId, users.id))
          .where(whereClause).orderBy(orderDir).limit(limitNum).offset(offset),
        db.select({ total: count() })
          .from(users).leftJoin(profiles, eq(profiles.userId, users.id))
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
      const conditions: any[] = [isNull(profiles.deletedAt)];
      if (search) {
        const s = `%${sanitize(search, 100)}%`;
        conditions.push(or(ilike(users.email, s), ilike(users.firstName, s), ilike(users.lastName, s), ilike(profiles.phoneNumber, s)));
      }
      if (role) conditions.push(eq(profiles.role, role));
      if (status) conditions.push(eq(profiles.status, status));
      if (kycStatus) conditions.push(eq(profiles.kycStatus, kycStatus));
      if (country) conditions.push(ilike(profiles.country, `%${country}%`));

      const rows = await db.select({
        id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName,
        userType: profiles.userType, role: profiles.role, status: profiles.status,
        kycStatus: profiles.kycStatus, country: profiles.country, phoneNumber: profiles.phoneNumber,
        walletBalance: profiles.walletBalance, lastLoginAt: profiles.lastLoginAt,
        lastLoginIp: profiles.lastLoginIp, createdAt: users.createdAt,
        completedJobs: profiles.completedJobs, isPro: profiles.isPro, location: profiles.location,
      }).from(users).leftJoin(profiles, eq(profiles.userId, users.id))
        .where(and(...conditions)).orderBy(desc(users.createdAt)).limit(10000);

      const headers = ["User ID", "First Name", "Last Name", "Email", "Phone", "Role", "User Type",
        "Status", "KYC Status", "Country", "Location", "Wallet Balance (ZAR)", "Completed Jobs",
        "Pro", "Last Login", "Last IP", "Registered"];
      const csvRows = rows.map(r => [
        r.id, r.firstName || "", r.lastName || "", r.email || "", r.phoneNumber || "",
        r.role || "client", r.userType || "client", r.status || "active",
        r.kycStatus || "not_started", r.country || "", r.location || "",
        r.walletBalance != null ? (r.walletBalance / 100).toFixed(2) : "0.00",
        r.completedJobs || 0, r.isPro ? "Yes" : "No",
        r.lastLoginAt ? new Date(r.lastLoginAt).toISOString() : "",
        r.lastLoginIp || "", r.createdAt ? new Date(r.createdAt).toISOString() : "",
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

  // ─── POST /api/admin/users/import ─────────────────────────────────────────
  // Import users from CSV. Validates email uniqueness and required fields.
  app.post("/api/admin/users/import", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { rows } = req.body as { rows: Record<string, string>[] };
      if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: "No rows provided" });
      if (rows.length > 500) return res.status(400).json({ error: "Max 500 rows per import" });

      const results = { created: 0, skipped: 0, errors: [] as string[] };

      for (const row of rows) {
        const email = sanitize(row.email, 200)?.toLowerCase();
        const firstName = sanitize(row.firstName || row.first_name || "", 100);
        const lastName = sanitize(row.lastName || row.last_name || "", 100);
        const country = sanitize(row.country || "", 100);
        const phoneNumber = sanitize(row.phoneNumber || row.phone || "", 30);

        if (!email || !email.includes("@")) {
          results.errors.push(`Invalid email: ${row.email}`);
          continue;
        }

        // Check if user already exists
        const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
        if (existing) {
          results.skipped++;
          continue;
        }

        const newUserId = crypto.randomUUID();
        await db.insert(users).values({ id: newUserId, email, firstName, lastName });
        await db.insert(profiles).values({
          userId: newUserId,
          userType: sanitize(row.userType || row.user_type || "client", 30),
          status: "pending",
          kycStatus: "not_started",
          country,
          phoneNumber,
          role: "client",
          walletBalance: 0,
        });

        await logActivity(newUserId, "user_imported", `User imported via CSV by admin`, req.adminId, { email }, req.ip);
        results.created++;
      }

      res.json({ success: true, ...results });
    } catch (err) {
      console.error("Admin import error:", err);
      res.status(500).json({ error: "Import failed" });
    }
  });

  // ─── GET /api/admin/users/:id ─────────────────────────────────────────────
  app.get("/api/admin/users/:id", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const [userData] = await db.select({
        id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName,
        profileImageUrl: users.profileImageUrl, createdAt: users.createdAt, updatedAt: users.updatedAt,
        profileId: profiles.id, userType: profiles.userType, role: profiles.role, status: profiles.status,
        kycStatus: profiles.kycStatus, bio: profiles.bio, title: profiles.title, skills: profiles.skills,
        hourlyRate: profiles.hourlyRate, location: profiles.location, country: profiles.country,
        phoneNumber: profiles.phoneNumber, walletBalance: profiles.walletBalance,
        lastLoginAt: profiles.lastLoginAt, lastLoginIp: profiles.lastLoginIp,
        isPro: profiles.isPro, completedJobs: profiles.completedJobs, rating: profiles.rating,
        suspendedUntil: profiles.suspendedUntil, suspendedReason: profiles.suspendedReason,
        banReason: profiles.banReason, deletedAt: profiles.deletedAt,
      }).from(users).leftJoin(profiles, eq(profiles.userId, users.id)).where(eq(users.id, id));

      if (!userData) return res.status(404).json({ error: "User not found" });

      // Academy progress + certificates
      const [completedLessons, certsRows, kycDocs, allCoursesList] = await Promise.all([
        db.select({ courseId: courseProgress.courseId, lessonId: courseProgress.lessonId, completed: courseProgress.completed, completedAt: courseProgress.completedAt })
          .from(courseProgress).where(and(eq(courseProgress.userId, id), eq(courseProgress.completed, true))),
        db.select().from(certificates).where(eq(certificates.userId, id)),
        db.select().from(kycDocuments).where(eq(kycDocuments.userId, id)).orderBy(desc(kycDocuments.uploadedAt)),
        db.select({ id: courses.id, title: courses.title, totalLessons: courses.totalLessons }).from(courses),
      ]);

      // Group progress by course
      const progressByCourseid: Record<number, { completed: number; total: number }> = {};
      for (const lesson of completedLessons) {
        const course = allCoursesList.find(c => c.id === lesson.courseId);
        if (!progressByCourseid[lesson.courseId]) {
          progressByCourseid[lesson.courseId] = { completed: 0, total: course?.totalLessons || 1 };
        }
        progressByCourseid[lesson.courseId].completed++;
      }
      const academyProgress = Object.entries(progressByCourseid).map(([courseId, data]) => ({
        courseId: parseInt(courseId),
        completedLessons: data.completed,
        totalLessons: data.total,
        percent: Math.round((data.completed / data.total) * 100),
        hasCertificate: certsRows.some(c => c.courseId === parseInt(courseId)),
      }));

      // Auto-upgrade check when viewing user detail
      await checkAcademyAutoUpgrade(id);

      res.json({ ...userData, academyProgress, certificates: certsRows, kycDocuments: kycDocs });
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
        updates.suspendedReason = sanitize(reason, 500) || null;
        updates.suspendedUntil = suspendedUntil ? new Date(suspendedUntil) : null;
      } else if (status === "banned") {
        updates.banReason = sanitize(reason, 500) || null;
        updates.suspendedUntil = null;
      } else if (status === "active") {
        updates.suspendedReason = null;
        updates.suspendedUntil = null;
        updates.banReason = null;
      }

      await db.update(profiles).set(updates).where(eq(profiles.userId, id));
      await logActivity(id, `status_${status}`, `Status → ${status}${reason ? `: ${reason}` : ""}`, adminId, { status, reason }, req.ip);

      const notifMsg: Record<string, string> = {
        active: "Your account has been reactivated. Welcome back!",
        suspended: `Your account has been suspended${reason ? `: ${reason}` : ""}. Contact support to appeal.`,
        banned: `Your account has been permanently banned${reason ? `: ${reason}` : ""}. Contact support if you believe this is an error.`,
        pending: "Your account status has been set to pending review.",
      };
      await notifyUser(id, `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`, notifMsg[status] || "Your account status has changed.");

      res.json({ success: true, status });
    } catch (err) {
      console.error("Admin status error:", err);
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
      await logActivity(id, "role_change", `Role: ${oldRole} → ${role}`, adminId, { oldRole, newRole: role }, req.ip);
      await notifyUser(id, "Role Updated", `Your platform role has been changed to ${role}.`);

      res.json({ success: true, role });
    } catch (err) {
      console.error("Admin role error:", err);
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
      await logActivity(id, `kyc_${kycStatus}`, `KYC → ${kycStatus}${notes ? `: ${notes}` : ""}`, adminId, { kycStatus, notes }, req.ip);

      const kycMessages: Record<string, string> = {
        verified: "Your identity has been verified. Your KYC is now complete!",
        rejected: `Your KYC submission was rejected${notes ? `: ${notes}` : ""}. Please re-submit your documents.`,
        pending: "Your KYC documents are under review. We'll notify you soon.",
        not_started: "Your KYC status has been reset. Please upload your documents to get verified.",
      };
      await notifyUser(id, `KYC ${kycStatus.replace(/_/g, " ").toUpperCase()}`, kycMessages[kycStatus]);

      res.json({ success: true, kycStatus });
    } catch (err) {
      console.error("Admin KYC error:", err);
      res.status(500).json({ error: "Failed to update KYC" });
    }
  });

  // ─── POST /api/admin/users/:id/kyc-documents ─────────────────────────────
  // Admin-side KYC document upload on behalf of user
  app.post("/api/admin/users/:id/kyc-documents",
    isAuthenticated, requireAdmin,
    kycUpload.single("document"),
    async (req: any, res: Response) => {
      try {
        const { id } = req.params;
        const { type } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ error: "No file uploaded" });
        const validTypes = ["id_document", "selfie", "proof_of_address"];
        if (!validTypes.includes(type)) return res.status(400).json({ error: "Invalid document type" });

        await db.insert(kycDocuments).values({
          userId: id,
          type,
          fileName: file.originalname,
          filePath: file.filename,
          mimeType: file.mimetype,
          fileSizeBytes: file.size,
          status: "pending",
        });

        // Auto-set KYC status to pending when a doc is uploaded
        await db.update(profiles).set({ kycStatus: "pending", updatedAt: new Date() }).where(eq(profiles.userId, id));
        await logActivity(id, "kyc_doc_uploaded", `KYC document uploaded: ${type}`, req.adminId, { type, fileName: file.originalname }, req.ip);

        res.json({ success: true });
      } catch (err) {
        console.error("KYC upload error:", err);
        res.status(500).json({ error: "Upload failed" });
      }
    }
  );

  // User self-uploads KYC document
  app.post("/api/kyc/upload",
    isAuthenticated,
    kycUpload.single("document"),
    async (req: any, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { type } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ error: "No file uploaded" });
        const validTypes = ["id_document", "selfie", "proof_of_address"];
        if (!validTypes.includes(type)) return res.status(400).json({ error: "Invalid document type" });

        await db.insert(kycDocuments).values({
          userId,
          type,
          fileName: file.originalname,
          filePath: file.filename,
          mimeType: file.mimetype,
          fileSizeBytes: file.size,
          status: "pending",
        });

        await db.update(profiles).set({ kycStatus: "pending", updatedAt: new Date() }).where(eq(profiles.userId, userId));
        await logActivity(userId, "kyc_doc_self_upload", `User self-uploaded KYC: ${type}`, null, { type }, req.ip);

        res.json({ success: true, message: "Document submitted for review" });
      } catch (err) {
        console.error("KYC self-upload error:", err);
        res.status(500).json({ error: "Upload failed" });
      }
    }
  );

  // ─── PATCH /api/admin/kyc-documents/:docId/review ────────────────────────
  app.patch("/api/admin/kyc-documents/:docId/review", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { docId } = req.params;
      const { status, notes } = req.body;
      const adminId = req.adminId;

      const validStatuses = ["approved", "rejected"];
      if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

      const [doc] = await db.select().from(kycDocuments).where(eq(kycDocuments.id, docId));
      if (!doc) return res.status(404).json({ error: "Document not found" });

      await db.update(kycDocuments).set({
        status,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: sanitize(notes, 500) || null,
      }).where(eq(kycDocuments.id, docId));

      // Check if all docs approved → auto-verify KYC
      const [pending] = await db.select({ c: count() }).from(kycDocuments)
        .where(and(eq(kycDocuments.userId, doc.userId), eq(kycDocuments.status, "pending")));
      const [total] = await db.select({ c: count() }).from(kycDocuments).where(eq(kycDocuments.userId, doc.userId));
      const [rejected] = await db.select({ c: count() }).from(kycDocuments)
        .where(and(eq(kycDocuments.userId, doc.userId), eq(kycDocuments.status, "rejected")));

      if ((pending?.c || 0) === 0 && (total?.c || 0) >= 2) {
        if ((rejected?.c || 0) === 0) {
          await db.update(profiles).set({ kycStatus: "verified", updatedAt: new Date() }).where(eq(profiles.userId, doc.userId));
          await notifyUser(doc.userId, "KYC Verified!", "All your documents have been reviewed and approved. Your identity is now verified!");
        } else {
          await db.update(profiles).set({ kycStatus: "rejected", updatedAt: new Date() }).where(eq(profiles.userId, doc.userId));
          await notifyUser(doc.userId, "KYC Document Rejected", `One or more of your documents were rejected${notes ? `: ${notes}` : ""}. Please re-upload.`);
        }
      }

      await logActivity(doc.userId, `kyc_doc_${status}`, `KYC document ${status}: ${doc.type}`, adminId, { docId, status, notes }, req.ip);
      res.json({ success: true });
    } catch (err) {
      console.error("KYC review error:", err);
      res.status(500).json({ error: "Review failed" });
    }
  });

  // ─── POST /api/admin/users/:id/reset-password ─────────────────────────────
  app.post("/api/admin/users/:id/reset-password", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const adminId = req.adminId;
      const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, id));
      if (!user) return res.status(404).json({ error: "User not found" });

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.insert(passwordResetTokens).values({ userId: id, token, expiresAt });

      await logActivity(id, "password_reset_forced", `Admin forced password reset for ${user.email}`, adminId, { email: user.email }, req.ip);
      await notifyUser(id, "Password Reset Required", "An administrator has initiated a password reset for your account. Please check your email or use the reset link provided.");

      res.json({ success: true, message: `Reset initiated for ${user.email}`, resetToken: token });
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
      await logActivity(id, "admin_message_sent", `Admin message: ${sanitize(subject, 100) || "(no subject)"}`, adminId, { subject, body: body.substring(0, 200) }, req.ip);
      await notifyUser(id, sanitize(subject, 100) || "Message from Admin", sanitize(body, 1000));
      res.json({ success: true });
    } catch (err) {
      console.error("Admin message error:", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ─── GET /api/admin/users/:id/activity ────────────────────────────────────
  app.get("/api/admin/users/:id/activity", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { page = "1", limit = "50" } = req.query as Record<string, string>;
      const offset = (Math.max(1, parseInt(page)) - 1) * Math.min(200, parseInt(limit));

      const logs = await db.select().from(userActivityLogs)
        .where(eq(userActivityLogs.userId, id))
        .orderBy(desc(userActivityLogs.createdAt))
        .limit(Math.min(200, parseInt(limit))).offset(offset);
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
      const [balanceRow] = await db.select({ walletBalance: profiles.walletBalance }).from(profiles).where(eq(profiles.userId, id));
      const transactions = await db.select().from(walletTransactions).where(eq(walletTransactions.userId, id)).orderBy(desc(walletTransactions.createdAt)).limit(100);
      res.json({ balance: balanceRow?.walletBalance || 0, transactions });
    } catch (err) {
      console.error("Admin wallet error:", err);
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  // ─── POST /api/admin/users/:id/wallet ─────────────────────────────────────
  app.post("/api/admin/users/:id/wallet", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { type, amountCents, description } = req.body;
      const adminId = req.adminId;

      if (!["credit", "debit"].includes(type)) return res.status(400).json({ error: "type must be 'credit' or 'debit'" });
      if (!amountCents || amountCents <= 0) return res.status(400).json({ error: "amountCents must be positive" });

      const [existing] = await db.select({ walletBalance: profiles.walletBalance }).from(profiles).where(eq(profiles.userId, id));
      const currentBalance = existing?.walletBalance || 0;
      const delta = type === "credit" ? amountCents : -amountCents;
      const newBalance = currentBalance + delta;

      if (newBalance < 0) return res.status(400).json({ error: "Insufficient wallet balance" });

      await db.update(profiles).set({ walletBalance: newBalance, updatedAt: new Date() }).where(eq(profiles.userId, id));
      await db.insert(walletTransactions).values({
        userId: id, type, amountCents: delta, balanceAfterCents: newBalance,
        description: sanitize(description, 200) || `Manual ${type} by admin`,
        referenceType: "manual", performedBy: adminId,
      });

      const zarAmount = (amountCents / 100).toFixed(2);
      await logActivity(id, `wallet_${type}`, `Admin ${type}: R${zarAmount}. ${description || ""}`, adminId, { type, amountCents, newBalance }, req.ip);
      await notifyUser(id, `Wallet ${type === "credit" ? "Credited" : "Debited"}`, `R${zarAmount} has been ${type === "credit" ? "added to" : "removed from"} your wallet by an administrator.`);

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
      const conditions: any[] = [];
      if (action) conditions.push(ilike(userActivityLogs.action, `%${sanitize(action, 50)}%`));

      const logs = await db.select({
        log: userActivityLogs, userEmail: users.email,
        userFirstName: users.firstName, userLastName: users.lastName,
      }).from(userActivityLogs)
        .leftJoin(users, eq(users.id, userActivityLogs.userId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(userActivityLogs.createdAt))
        .limit(limitNum).offset((pageNum - 1) * limitNum);
      res.json(logs);
    } catch (err) {
      console.error("Admin global activity log error:", err);
      res.status(500).json({ error: "Failed to fetch activity log" });
    }
  });

  // ─── DELETE /api/admin/users/:id (soft-delete) ────────────────────────────
  app.delete("/api/admin/users/:id", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { reason, permanent } = req.body;
      const adminId = req.adminId;

      if (id === ADMIN_USER_ID) return res.status(400).json({ error: "Cannot delete the primary admin account" });

      if (permanent === true) {
        // Permanent delete — only if already soft-deleted for 30+ days
        const [profile] = await db.select({ deletedAt: profiles.deletedAt }).from(profiles).where(eq(profiles.userId, id));
        if (!profile?.deletedAt) return res.status(400).json({ error: "User must be soft-deleted first" });
        const daysSinceDelete = (Date.now() - new Date(profile.deletedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDelete < 30) return res.status(400).json({ error: `User can only be permanently deleted after 30 days. ${Math.ceil(30 - daysSinceDelete)} days remaining.` });

        // Hard delete activity logs, kyc docs, wallet txns, then user
        await db.delete(userActivityLogs).where(eq(userActivityLogs.userId, id));
        await db.delete(walletTransactions).where(eq(walletTransactions.userId, id));
        await db.delete(kycDocuments).where(eq(kycDocuments.userId, id));
        await db.delete(profiles).where(eq(profiles.userId, id));
        await db.delete(users).where(eq(users.id, id));

        await logActivity(adminId, "permanent_delete_admin", `Permanently deleted user ${id}`, adminId, { deletedUserId: id }, req.ip);
        return res.json({ success: true, permanent: true });
      }

      // Soft-delete
      await db.update(profiles).set({
        deletedAt: new Date(),
        deletedBy: adminId,
        deleteReason: sanitize(reason, 500) || "Admin action",
        status: "banned",
        updatedAt: new Date(),
      }).where(eq(profiles.userId, id));

      await logActivity(id, "soft_deleted", `User soft-deleted. Reason: ${reason || "Admin action"}`, adminId, { reason }, req.ip);
      res.json({ success: true, permanent: false, message: "User soft-deleted. Can be restored within 30 days." });
    } catch (err) {
      console.error("Admin delete error:", err);
      res.status(500).json({ error: "Delete failed" });
    }
  });

  // ─── POST /api/admin/users/:id/restore ────────────────────────────────────
  app.post("/api/admin/users/:id/restore", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const adminId = req.adminId;

      const [profile] = await db.select({ deletedAt: profiles.deletedAt }).from(profiles).where(eq(profiles.userId, id));
      if (!profile?.deletedAt) return res.status(400).json({ error: "User is not soft-deleted" });

      const daysSinceDelete = (Date.now() - new Date(profile.deletedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDelete >= 30) return res.status(400).json({ error: "30-day recovery window has passed. Use permanent delete." });

      await db.update(profiles).set({
        deletedAt: null,
        deletedBy: null,
        deleteReason: null,
        status: "active",
        updatedAt: new Date(),
      }).where(eq(profiles.userId, id));

      await logActivity(id, "user_restored", "User account restored by admin", adminId, {}, req.ip);
      await notifyUser(id, "Account Restored", "Your account has been restored by an administrator. Welcome back!");
      res.json({ success: true });
    } catch (err) {
      console.error("Admin restore error:", err);
      res.status(500).json({ error: "Restore failed" });
    }
  });

  // ─── POST /api/admin/users/bulk-action ────────────────────────────────────
  app.post("/api/admin/users/bulk-action", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { userIds, action, reason, role } = req.body;
      const adminId = req.adminId;

      if (!Array.isArray(userIds) || userIds.length === 0) return res.status(400).json({ error: "userIds required" });
      if (userIds.length > 100) return res.status(400).json({ error: "Max 100 users per bulk action" });
      if (userIds.includes(ADMIN_USER_ID)) return res.status(400).json({ error: "Cannot apply bulk action to primary admin" });

      const validActions = ["activate", "suspend", "ban", "change_role", "verify_kyc", "reject_kyc", "soft_delete"];
      if (!validActions.includes(action)) return res.status(400).json({ error: "Invalid action" });

      if (action === "activate") {
        await db.update(profiles).set({ status: "active", suspendedReason: null, banReason: null, updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "suspend") {
        await db.update(profiles).set({ status: "suspended", suspendedReason: sanitize(reason, 500) || "Bulk action", updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "ban") {
        await db.update(profiles).set({ status: "banned", banReason: sanitize(reason, 500) || "Bulk action", updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "change_role" && role) {
        const validRoles = ["client", "freelancer", "admin", "moderator", "upskiller"];
        if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });
        await db.update(profiles).set({ role, updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "verify_kyc") {
        await db.update(profiles).set({ kycStatus: "verified", updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "reject_kyc") {
        await db.update(profiles).set({ kycStatus: "rejected", updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      } else if (action === "soft_delete") {
        await db.update(profiles).set({ deletedAt: new Date(), deletedBy: adminId, deleteReason: sanitize(reason, 500) || "Bulk action", status: "banned", updatedAt: new Date() }).where(inArray(profiles.userId, userIds));
      }

      await Promise.all(userIds.map((uid: string) =>
        logActivity(uid, `bulk_${action}`, `Bulk: ${action}${reason ? ` — ${reason}` : ""}`, adminId, { action, reason, role }, req.ip)
      ));

      res.json({ success: true, affected: userIds.length });
    } catch (err) {
      console.error("Admin bulk action error:", err);
      res.status(500).json({ error: "Bulk action failed" });
    }
  });

  // ─── GET /api/admin/certificate/:userId/:courseId ─────────────────────────
  // Serve printable certificate HTML (browser prints to PDF)
  app.get("/api/admin/certificate/:userId/:courseId", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { userId, courseId } = req.params;
      const [user] = await db.select({ firstName: users.firstName, lastName: users.lastName, email: users.email }).from(users).where(eq(users.id, userId));
      const [cert] = await db.select().from(certificates).where(and(eq(certificates.userId, userId), eq(certificates.courseId, parseInt(courseId))));
      const [course] = await db.select({ title: courses.title }).from(courses).where(eq(courses.id, parseInt(courseId)));

      if (!cert || !user || !course) return res.status(404).json({ error: "Certificate not found" });

      const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
      const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

      res.setHeader("Content-Type", "text/html");
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate — ${course.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600&display=swap');
    @media print { body { margin: 0; } .no-print { display: none; } }
    body { margin: 0; padding: 40px; font-family: 'Inter', sans-serif; background: #f0f4f8; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .cert { background: white; width: 900px; max-width: 100%; padding: 60px 80px; border: 12px solid #1DBF73; box-shadow: 0 20px 60px rgba(0,0,0,0.15); position: relative; }
    .cert::before { content: ''; position: absolute; inset: 8px; border: 2px solid #1DBF73; pointer-events: none; }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo-text { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #1DBF73; letter-spacing: 2px; }
    .logo-sub { font-size: 12px; color: #666; letter-spacing: 4px; text-transform: uppercase; }
    .divider { height: 2px; background: linear-gradient(90deg, transparent, #1DBF73, transparent); margin: 24px 0; }
    h1 { font-family: 'Playfair Display', serif; font-size: 42px; color: #1a1a1a; margin: 0 0 8px; text-align: center; }
    .subtitle { text-align: center; color: #666; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 32px; }
    .name { font-family: 'Playfair Display', serif; font-size: 38px; color: #1DBF73; text-align: center; margin: 16px 0; border-bottom: 2px solid #e0e0e0; padding-bottom: 16px; }
    .course { text-align: center; font-size: 16px; color: #444; margin-bottom: 8px; }
    .course strong { font-size: 22px; color: #1a1a1a; display: block; margin-top: 8px; }
    .meta { display: flex; justify-content: space-between; margin-top: 48px; padding-top: 32px; border-top: 1px solid #e0e0e0; }
    .meta-item { text-align: center; }
    .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #999; }
    .meta-value { font-size: 14px; color: #333; margin-top: 4px; font-weight: 600; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg); font-size: 100px; color: rgba(29,191,115,0.04); font-family: 'Playfair Display', serif; pointer-events: none; white-space: nowrap; }
    .btn { margin-top: 32px; padding: 12px 32px; background: #1DBF73; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-family: 'Inter', sans-serif; }
    .btn:hover { background: #17a360; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="watermark">FreelanceSkills</div>
    <div class="logo">
      <div class="logo-text">FreelanceSkills</div>
      <div class="logo-sub">Upskilling Academy</div>
    </div>
    <div class="divider"></div>
    <h1>Certificate of Completion</h1>
    <p class="subtitle">This certifies that</p>
    <div class="name">${userName}</div>
    <p class="course">has successfully completed<strong>${course.title}</strong></p>
    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">Issued On</div>
        <div class="meta-value">${issuedDate}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Certificate ID</div>
        <div class="meta-value">${cert.certificateCode}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Platform</div>
        <div class="meta-value">FreelanceSkills.net</div>
      </div>
    </div>
  </div>
  <button class="btn no-print" onclick="window.print()">Download / Print Certificate</button>
</body>
</html>`);
    } catch (err) {
      console.error("Certificate error:", err);
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  });

  // ─── GET /api/admin/kyc-queue ──────────────────────────────────────────────
  // List all pending KYC documents for admin review
  app.get("/api/admin/kyc-queue", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const docs = await db.select({
        doc: kycDocuments,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      }).from(kycDocuments)
        .leftJoin(users, eq(users.id, kycDocuments.userId))
        .where(eq(kycDocuments.status, "pending"))
        .orderBy(asc(kycDocuments.uploadedAt))
        .limit(200);
      res.json(docs);
    } catch (err) {
      console.error("KYC queue error:", err);
      res.status(500).json({ error: "Failed to fetch KYC queue" });
    }
  });

  // ─── GET /api/admin/password-strength-check ──────────────────────────────
  app.post("/api/admin/password-strength-check", isAuthenticated, requireAdmin, (req: any, res: Response) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password required" });
    res.json(validatePasswordStrength(password));
  });

  // ─── GET /api/admin/wallet-transactions (mobile admin: payout monitor) ────
  app.get("/api/admin/wallet-transactions", isAuthenticated, requireAdmin, async (req: any, res: Response) => {
    try {
      const { type = "payout", limit = "20" } = req.query as Record<string, string>;
      const txs = await db.select({
        id: walletTransactions.id,
        userId: walletTransactions.userId,
        type: walletTransactions.type,
        amountCents: walletTransactions.amountCents,
        description: walletTransactions.description,
        referenceType: walletTransactions.referenceType,
        createdAt: walletTransactions.createdAt,
      }).from(walletTransactions)
        .where(eq(walletTransactions.type, type))
        .orderBy(desc(walletTransactions.createdAt))
        .limit(Math.min(parseInt(limit), 100));
      res.json({ transactions: txs });
    } catch (err) {
      console.error("Admin wallet-transactions error:", err);
      res.status(500).json({ error: "Failed to fetch wallet transactions" });
    }
  });
}
