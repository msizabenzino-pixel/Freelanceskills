import session from "express-session";
import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { db } from "../../db";
import { profiles } from "@shared/models/profiles";
import { eq } from "drizzle-orm";

// ──────────────────────────────────────────────────────────────────────────────
// Session setup
// ──────────────────────────────────────────────────────────────────────────────

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  const isSecure =
    (process.env.REPLIT_DOMAINS || "").includes("replit.app") ||
    (!(process.env.REPLIT_DOMAINS || "").includes("replit.dev") &&
      process.env.NODE_ENV === "production");
  return session({
    secret: process.env.SESSION_SECRET || "freelanceskills-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

// ──────────────────────────────────────────────────────────────────────────────
// Enriched session user
// ──────────────────────────────────────────────────────────────────────────────

export interface SessionUser {
  userId: string;
  userType: "client" | "freelancer" | "both";
  role: "client" | "freelancer" | "admin" | "moderator" | "upskiller";
  status: "active" | "suspended" | "banned" | "pending";
  kycStatus: string;
  isPro: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  // enrichment metadata
  _enrichedAt?: number;
  _firebaseSynced?: boolean;
}

// In-memory profile cache (5-minute TTL) — avoids DB hit on every request
const profileCache = new Map<string, { user: SessionUser; expiresAt: number }>();
const PROFILE_CACHE_TTL = 5 * 60 * 1000;

async function loadProfile(userId: string): Promise<SessionUser | null> {
  // 1. Check cache
  const cached = profileCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }

  // 2. Fetch from DB
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!profile) {
      // Fallback: user exists but no profile — treat as minimal client
      const minimal: SessionUser = {
        userId,
        userType: "client",
        role: "client",
        status: "active",
        kycStatus: "not_started",
        isPro: false,
      };
      profileCache.set(userId, { user: minimal, expiresAt: Date.now() + PROFILE_CACHE_TTL });
      return minimal;
    }

    const user: SessionUser = {
      userId,
      userType: profile.userType,
      role: profile.role,
      status: profile.status,
      kycStatus: profile.kycStatus,
      isPro: profile.isPro,
      email: profile.email || undefined,
      firstName: profile.firstName || undefined,
      lastName: profile.lastName || undefined,
      profileImageUrl: profile.profileImageUrl || undefined,
      _enrichedAt: Date.now(),
    };

    profileCache.set(userId, { user, expiresAt: Date.now() + PROFILE_CACHE_TTL });
    return user;
  } catch (err) {
    console.error("[auth] loadProfile failed:", (err as Error).message);
    return null;
  }
}

export function clearProfileCache(userId: string) {
  profileCache.delete(userId);
}

// ──────────────────────────────────────────────────────────────────────────────
// Core isAuthenticated — enriches req with user
// ──────────────────────────────────────────────────────────────────────────────

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Authentication required. Please sign in.",
      hint: "Log in or register to continue.",
    });
  }

  // Load enriched profile
  const user = await loadProfile(userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      code: "SESSION_INVALID",
      message: "Your session is invalid or expired.",
      hint: "Please sign in again.",
    });
  }

  // Check if account is suspended or banned
  if (user.status === "banned") {
    return res.status(403).json({
      success: false,
      code: "ACCOUNT_BANNED",
      message: "Your account has been banned.",
      hint: "Contact support if you believe this is an error.",
    });
  }

  if (user.status === "suspended") {
    return res.status(403).json({
      success: false,
      code: "ACCOUNT_SUSPENDED",
      message: "Your account is currently suspended.",
      hint: "Contact support for assistance.",
    });
  }

  // Attach enriched user to request
  (req as any).__user = user;
  (req as any).__userId = userId;

  return next();
};

// ──────────────────────────────────────────────────────────────────────────────
// Helper: getUser() — safe accessor for enriched user
// ──────────────────────────────────────────────────────────────────────────────

export function getUser(req: Request): SessionUser | null {
  return (req as any).__user || null;
}

export function getUserId(req: Request): string | null {
  return (req as any).__userId || (req.session as any)?.userId || null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Role-based middleware
// ──────────────────────────────────────────────────────────────────────────────

export const requireAuth: RequestHandler = isAuthenticated;

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    });
  }
  if (user.role !== "admin" && user.role !== "moderator") {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN",
      message: "Admin access required.",
      hint: "You do not have permission to access this resource.",
    });
  }
  return next();
};

export const requireStrictAdmin: RequestHandler = async (req, res, next) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Authentication required." });
  }
  if (user.role !== "admin") {
    return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Super-admin access required." });
  }
  return next();
};

export const requireClient: RequestHandler = async (req, res, next) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Authentication required." });
  }
  if (user.userType !== "client" && user.userType !== "both") {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN",
      message: "Client access required.",
      hint: "Switch to a client account or create one.",
    });
  }
  return next();
};

export const requireFreelancer: RequestHandler = async (req, res, next) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Authentication required." });
  }
  if (user.userType !== "freelancer" && user.userType !== "both") {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN",
      message: "Freelancer access required.",
      hint: "Switch to a freelancer account or create one.",
    });
  }
  return next();
};

export const requireKyc: RequestHandler = async (req, res, next) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Authentication required." });
  }
  if (user.kycStatus !== "verified") {
    return res.status(403).json({
      success: false,
      code: "KYC_REQUIRED",
      message: "Identity verification required.",
      hint: "Complete KYC verification to access this feature.",
    });
  }
  return next();
};

// ──────────────────────────────────────────────────────────────────────────────
// Composable middleware
// ──────────────────────────────────────────────────────────────────────────────

export function requireAny(...handlers: RequestHandler[]): RequestHandler {
  return async (req, res, next) => {
    let lastError: any = null;
    for (const handler of handlers) {
      try {
        const result = handler(req, res, () => {
          // If handler calls next, we stop and continue
          return next();
        });
        if (result instanceof Promise) {
          await result;
        }
        return; // handler succeeded
      } catch (err) {
        lastError = err;
      }
    }
    // All handlers failed — pass the last error
    if (lastError) return next(lastError);
    return res.status(403).json({ success: false, code: "FORBIDDEN", message: "Access denied." });
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Ownership middleware factory
// ──────────────────────────────────────────────────────────────────────────────

export function requireOwnership(
  getOwnerId: (req: Request) => string | Promise<string>
): RequestHandler {
  return async (req, res, next) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Authentication required." });
    }

    // Admins/moderators bypass ownership check
    if (user.role === "admin" || user.role === "moderator") {
      return next();
    }

    try {
      const ownerId = await getOwnerId(req);
      if (user.userId !== ownerId) {
        return res.status(403).json({
          success: false,
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource.",
        });
      }
      return next();
    } catch (err) {
      console.error("[auth] requireOwnership error:", (err as Error).message);
      return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Ownership check failed." });
    }
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Legacy compatibility
// ──────────────────────────────────────────────────────────────────────────────

// For routes that use the old inline `if (!isAdmin(req))` pattern
export function isAdmin(req: Request): boolean {
  const user = getUser(req);
  return user?.role === "admin" || user?.role === "moderator" || false;
}

export function isClient(req: Request): boolean {
  const user = getUser(req);
  return user?.userType === "client" || user?.userType === "both" || false;
}

export function isFreelancer(req: Request): boolean {
  const user = getUser(req);
  return user?.userType === "freelancer" || user?.userType === "both" || false;
}
