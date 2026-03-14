import type { Request, Response, NextFunction, Express } from "express";
import { storage } from "./storage";
import { log } from "./index";

// ============================================================
// #43 — IN-MEMORY CACHE (TTL-based, Redis-compatible interface)
// ============================================================
interface CacheEntry<T> { data: T; expiresAt: number; }
class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => this.evictExpired(), 30000);
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds = 300): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  invalidate(pattern: string): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(pattern)) { this.store.delete(key); count++; }
    }
    return count;
  }

  clear(): void { this.store.clear(); }

  stats() {
    return { entries: this.store.size, keys: Array.from(this.store.keys()).slice(0, 20) };
  }

  private evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

export const cache = new MemoryCache();

// ============================================================
// #42 / #58 — TIERED RATE LIMITER (free=100/min, premium=500/min)
// ============================================================
const tierLimits = new Map<string, { count: number; resetTime: number }>();

export async function tieredRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const userId = (req.session as any)?.userId;
  const key = userId || ip;
  const now = Date.now();
  const windowMs = 60000;

  let maxRequests = 100;
  if (userId) {
    const tier = cache.get<string>(`tier:${userId}`);
    if (tier === "premium" || tier === "enterprise") {
      maxRequests = 500;
    } else if (!tier) {
      const premiumTier = await getPremiumTier(userId);
      if (premiumTier && (premiumTier.tier === "premium" || premiumTier.tier === "enterprise")) {
        maxRequests = 500;
        cache.set(`tier:${userId}`, premiumTier.tier, 300);
      } else {
        cache.set(`tier:${userId}`, "free", 300);
      }
    }
  }

  const entry = tierLimits.get(key);
  if (!entry || now > entry.resetTime) {
    tierLimits.set(key, { count: 1, resetTime: now + windowMs });
    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", (maxRequests - 1).toString());
    return next();
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  res.setHeader("X-RateLimit-Limit", maxRequests.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());

  if (entry.count > maxRequests) {
    res.setHeader("Retry-After", Math.ceil((entry.resetTime - now) / 1000).toString());
    return res.status(429).json({
      message: "Rate limit exceeded",
      limit: maxRequests,
      tier: maxRequests > 100 ? "premium" : "free",
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    });
  }

  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of tierLimits) {
    if (now > entry.resetTime) tierLimits.delete(key);
  }
}, 60000);

// ============================================================
// #44 — AUDIT LOG MIDDLEWARE
// ============================================================
const AUDITED_ACTIONS: Record<string, string> = {
  "GET /api/jobs/:id": "job_view",
  "POST /api/applications": "job_apply",
  "POST /api/bookings": "booking_create",
  "POST /api/bookings/:id/release": "escrow_release",
  "PATCH /api/bookings/:id/status": "booking_status_change",
  "POST /api/jobs": "job_create",
  "POST /api/reviews": "review_create",
  "POST /api/disputes": "dispute_create",
  "GET /api/account/export": "data_export",
  "DELETE /api/account/delete": "account_delete",
  "POST /api/payfast/create-payment": "payment_create",
};

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  res.json = function (body) {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      const routeKey = `${req.method} ${req.route?.path || req.path}`;
      const action = AUDITED_ACTIONS[routeKey];
      if (action) {
        const userId = (req.session as any)?.userId || null;
        const resourceId = req.params?.id || body?.id || null;
        storage.createAuditLog({
          userId,
          action,
          resource: routeKey.split(" ")[1].split("/")[2] || "unknown",
          resourceId: resourceId?.toString(),
          metadata: { statusCode: res.statusCode, params: req.params, query: req.query },
          ipAddress: req.ip || req.socket.remoteAddress || null,
          userAgent: req.headers["user-agent"] || null,
        }).catch(err => console.error("Audit log error:", err));
      }
    }
    return originalJson.call(this, body);
  };
  next();
}

// ============================================================
// #45 — PREMIUM TIER MIDDLEWARE (visibility boost / top 3)
// ============================================================
async function getPremiumTier(userId: string) {
  return storage.getPremiumTier(userId);
}

export async function premiumVisibilityMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  res.json = function (body) {
    if (Array.isArray(body) && body.length > 0 && body[0]?.freelancerId) {
      boostPremiumListings(body).then(boosted => originalJson.call(this, boosted));
      return this;
    }
    return originalJson.call(this, body);
  };
  next();
}

async function boostPremiumListings(listings: any[]): Promise<any[]> {
  const premiumIds = new Set<string>();
  const userIds = listings.map(l => l.freelancerId || l.userId).filter(Boolean);

  for (const uid of userIds.slice(0, 20)) {
    const tier = await getPremiumTier(uid);
    if (tier && tier.tier !== "free" && (!tier.featuredUntil || new Date(tier.featuredUntil) > new Date())) {
      premiumIds.add(uid);
    }
  }

  const premium = listings.filter(l => premiumIds.has(l.freelancerId || l.userId));
  const regular = listings.filter(l => !premiumIds.has(l.freelancerId || l.userId));

  return [...premium.slice(0, 3), ...regular];
}

export async function getTopPremiumInCategory(category: string) {
  const allPackages = await storage.getAllPackages(category);
  const results = [];

  for (const pkg of allPackages.slice(0, 20)) {
    const tier = await getPremiumTier(pkg.freelancerId);
    if (tier && tier.tier !== "free") {
      results.push({ ...pkg, isPremium: true, tier: tier.tier, boostLevel: tier.visibilityBoost });
    }
    if (results.length >= 3) break;
  }

  return results;
}

// ============================================================
// #46 — ENTERPRISE BULK POST (CSV → jobs)
// ============================================================
export function parseCSVToJobs(csvContent: string, clientId: string): any[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) throw new Error("CSV must have header + at least 1 row");
  if (lines.length > 51) throw new Error("Maximum 50 jobs per CSV upload");

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));
  const requiredFields = ["title", "description", "category"];
  for (const field of requiredFields) {
    if (!headers.includes(field)) throw new Error(`Missing required CSV column: ${field}`);
  }

  const jobs = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx]?.trim() || ""; });

    if (!row.title || !row.description || !row.category) continue;

    jobs.push({
      title: row.title,
      description: row.description,
      category: row.category,
      budget: row.budget ? parseInt(row.budget) : null,
      location: row.location || null,
      skills: row.skills ? row.skills.split(";").map(s => s.trim()) : [],
      clientId,
      status: "open",
    });
  }

  return jobs;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === "," && !inQuotes) { result.push(current); current = ""; }
    else { current += char; }
  }
  result.push(current);
  return result;
}

// ============================================================
// #47 — REFERRAL PAYOUT CALCULATION (R100 per successful referral)
// ============================================================
export const REFERRAL_REWARD_CENTS = 10000; // R100.00

export async function calculateReferralPayout(referrerId: string) {
  const referrals = await storage.getReferralsByReferrer(referrerId);
  const completed = referrals.filter(r => r.status === "completed");
  const paid = referrals.filter(r => r.status === "paid");
  const pending = referrals.filter(r => r.status === "signup");

  return {
    referrerId,
    totalReferred: referrals.length - referrals.filter(r => r.status === "pending").length,
    completedReferrals: completed.length,
    paidReferrals: paid.length,
    pendingSignups: pending.length,
    amountOwed: completed.length * REFERRAL_REWARD_CENTS,
    amountPaid: paid.reduce((sum, r) => sum + r.rewardAmount, 0),
    rewardPerReferral: REFERRAL_REWARD_CENTS,
    tier: getTierFromCount(referrals.length),
  };
}

function getTierFromCount(count: number): string {
  if (count >= 50) return "platinum";
  if (count >= 16) return "gold";
  if (count >= 6) return "silver";
  return "bronze";
}

// ============================================================
// #48 — JOB COMPLETION CONFIRMATION FLOW
// ============================================================
export async function processJobCompletion(bookingId: string, clientId: string) {
  const booking = await storage.getBooking(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.clientId !== clientId) throw new Error("Only the client can confirm completion");
  if (booking.status !== "delivered") throw new Error(`Booking must be in 'delivered' status, currently '${booking.status}'`);

  const flags = await storage.getFraudFlagsByBooking(bookingId);
  const unresolved = flags.filter(f => !f.resolvedAt);
  if (unresolved.length > 0) throw new Error("Cannot complete: unresolved fraud flags exist");

  await storage.updateBookingStatus(bookingId, "completed");

  const escrow = await storage.getEscrowByBooking(bookingId);
  if (escrow) {
    await storage.updateEscrowStatus(escrow.id, "released");
  }

  if (booking.freelancerId) {
    await storage.createNotification({
      userId: booking.freelancerId,
      type: "payment",
      title: "Payment Released!",
      message: `Client approved your work. R${(booking.totalAmount / 100).toFixed(2)} has been released from escrow.`,
      link: `/bookings/${bookingId}`,
    });
  }

  return { bookingId, status: "completed", escrowReleased: !!escrow, amount: booking.totalAmount };
}

// ============================================================
// #49 — DISPUTE RESOLUTION STUB
// ============================================================
export async function createDispute(data: {
  bookingId: string; initiatorId: string; respondentId: string;
  reason: string; description: string;
}) {
  await storage.updateBookingStatus(data.bookingId, "disputed");

  const chatMessages = await exportBookingChatLog(data.bookingId);

  const dispute = await storage.createDispute({
    ...data,
    status: "open",
    chatLogExport: chatMessages,
  });

  await storage.createNotification({
    userId: data.respondentId,
    type: "system",
    title: "Dispute Filed",
    message: `A dispute has been filed for booking #${data.bookingId}. Our team will review within 48 hours.`,
    link: `/disputes/${dispute.id}`,
  });

  return dispute;
}

async function exportBookingChatLog(bookingId: string) {
  try {
    const booking = await storage.getBooking(bookingId);
    if (!booking || !booking.clientId || !booking.freelancerId) return [];

    const convs = await storage.getUserConversations(booking.clientId);
    const conv = convs.find(c =>
      (c.participant1Id === booking.clientId && c.participant2Id === booking.freelancerId) ||
      (c.participant1Id === booking.freelancerId && c.participant2Id === booking.clientId)
    );

    if (!conv) return [];
    const msgs = await storage.getConversationMessages(conv.id);
    return msgs.map(m => ({
      senderId: m.senderId,
      content: m.content,
      timestamp: m.createdAt,
    }));
  } catch {
    return [];
  }
}

// ============================================================
// #54 — CRON: PURGE EXPIRED JOBS + SEND REMINDER EMAILS
// ============================================================
export async function cronPurgeExpiredJobs() {
  const startedAt = new Date();
  let processed = 0;
  let reminded = 0;

  try {
    const allJobs = await storage.getAllJobs();
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    for (const job of allJobs) {
      const age = now - new Date(job.createdAt).getTime();

      if (job.status === "open" && age > thirtyDaysMs) {
        await storage.updateJobStatus(job.id, "expired");
        processed++;
        log(`Cron: expired job ${job.id} (${job.title})`, "cron");
      }

      if (job.status === "open" && age > sevenDaysMs && age < thirtyDaysMs) {
        if (job.clientId) {
          await storage.createNotification({
            userId: job.clientId,
            type: "system",
            title: "Job Expiring Soon",
            message: `Your job "${job.title}" will expire in ${Math.ceil((thirtyDaysMs - age) / (24 * 60 * 60 * 1000))} days. Consider refreshing it.`,
            link: `/jobs/${job.id}`,
          });
          reminded++;
        }
      }
    }

    await storage.createAuditLog({
      action: "cron_purge_expired",
      resource: "jobs",
      metadata: { processed, reminded, duration: Date.now() - startedAt.getTime() },
    });

    return { processed, reminded, duration: Date.now() - startedAt.getTime() };
  } catch (error: any) {
    log(`Cron purge error: ${error.message}`, "cron");
    return { error: error.message, processed, reminded };
  }
}

// ============================================================
// #55 — FRAUD DETECTION CRON
// ============================================================
export async function cronFraudDetection() {
  const startedAt = new Date();
  let flagged = 0;

  try {
    const allJobs = await storage.getAllJobs();
    const allProfiles = await storage.searchFreelancers();

    for (const job of allJobs.slice(0, 100)) {
      const flags: string[] = [];

      if (job.budget && job.budget > 500000) flags.push("Unusually high budget (>R5000/hr)");
      if (job.description && job.description.length < 20) flags.push("Suspiciously short description");
      if (job.description && /whatsapp|telegram|signal|cash|crypto|bitcoin/i.test(job.description)) {
        flags.push("Off-platform communication/payment keywords detected");
      }

      if (flags.length >= 2) {
        await storage.createFraudFlag({
          userId: job.clientId,
          bookingId: null,
          riskScore: Math.min(100, flags.length * 30),
          flags,
          recommendation: flags.length >= 3 ? "suspend" : "review",
        });
        flagged++;
      }
    }

    const profileCounts = new Map<string, number>();
    for (const p of allProfiles) {
      if (p.bio) {
        const key = p.bio.substring(0, 50);
        profileCounts.set(key, (profileCounts.get(key) || 0) + 1);
      }
    }

    for (const [bio, count] of profileCounts) {
      if (count > 3) {
        const dupes = allProfiles.filter(p => p.bio?.startsWith(bio));
        for (const dupe of dupes) {
          await storage.createFraudFlag({
            userId: dupe.userId,
            bookingId: null,
            riskScore: 60,
            flags: [`Duplicate bio detected (${count} matches)`],
            recommendation: "review",
          });
          flagged++;
        }
      }
    }

    await storage.createAuditLog({
      action: "cron_fraud_detection",
      resource: "system",
      metadata: { flagged, jobsScanned: allJobs.length, profilesScanned: allProfiles.length, duration: Date.now() - startedAt.getTime() },
    });

    return { flagged, jobsScanned: allJobs.length, profilesScanned: allProfiles.length };
  } catch (error: any) {
    log(`Cron fraud error: ${error.message}`, "cron");
    return { error: error.message, flagged };
  }
}

// ============================================================
// #56 — SEO META TAGS GENERATOR
// ============================================================
export function generateSEOMetaTags(type: "job" | "category" | "profile", data: Record<string, any>) {
  const siteName = "FreelanceSkills.net";
  const baseUrl = "https://freelanceskills.net";

  if (type === "job") {
    const title = `${data.title} | ${data.location || "South Africa"} | ${siteName}`;
    const description = `${data.description?.substring(0, 155)}... Budget: R${data.budget || "Negotiable"}/hr. Apply now on ${siteName}.`;
    return {
      title,
      description,
      canonical: `${baseUrl}/jobs/${data.id}`,
      og: {
        title,
        description,
        type: "article",
        url: `${baseUrl}/jobs/${data.id}`,
        site_name: siteName,
      },
      twitter: { card: "summary_large_image", title, description },
      schema: {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: data.title,
        description: data.description,
        datePosted: data.createdAt,
        validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        employmentType: "CONTRACTOR",
        hiringOrganization: { "@type": "Organization", name: siteName, sameAs: baseUrl },
        jobLocation: {
          "@type": "Place",
          address: { "@type": "PostalAddress", addressLocality: data.location || "South Africa", addressCountry: "ZA" },
        },
        baseSalary: data.budget ? {
          "@type": "MonetaryAmount", currency: "ZAR",
          value: { "@type": "QuantitativeValue", value: data.budget, unitText: "HOUR" },
        } : undefined,
      },
    };
  }

  if (type === "category") {
    const title = `${data.name} Freelancers in ${data.location || "South Africa"} | ${siteName}`;
    const description = `Find verified ${data.name} freelancers. ${data.count || 0}+ professionals available. Hire locally with escrow protection.`;
    return {
      title,
      description,
      canonical: `${baseUrl}/categories/${data.slug}`,
      og: { title, description, type: "website", url: `${baseUrl}/categories/${data.slug}`, site_name: siteName },
      twitter: { card: "summary", title, description },
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: `${baseUrl}/categories/${data.slug}`,
      },
    };
  }

  if (type === "profile") {
    const title = `${data.title || "Freelancer"} in ${data.location || "South Africa"} | ${siteName}`;
    const description = `${data.bio?.substring(0, 155) || `Professional freelancer available for hire.`} Rating: ${data.rating || "New"}/5. ${data.completedJobs || 0} jobs completed.`;
    return {
      title,
      description,
      canonical: `${baseUrl}/profile/${data.userId}`,
      og: { title, description, type: "profile", url: `${baseUrl}/profile/${data.userId}`, site_name: siteName },
      twitter: { card: "summary", title, description },
      schema: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: data.title,
        jobTitle: data.title,
        address: { "@type": "PostalAddress", addressLocality: data.location, addressCountry: "ZA" },
        url: `${baseUrl}/profile/${data.userId}`,
      },
    };
  }

  return { title: siteName, description: "South Africa's Premier Freelance Marketplace" };
}

// ============================================================
// #59 — BACKUP CRON STUB (S3-compatible)
// ============================================================
export async function cronBackupStub() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  log(`Backup cron triggered at ${timestamp}`, "cron");

  return {
    status: "stub",
    message: "S3 backup not configured — set S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT env vars to enable",
    timestamp,
    wouldBackup: [
      "PostgreSQL full dump (pg_dump)",
      "Uploaded files (if any)",
      "Audit logs export",
    ],
    suggestedCron: "0 2 * * *",
    s3Config: {
      bucket: process.env.S3_BUCKET || "not-set",
      endpoint: process.env.S3_ENDPOINT || "not-set",
      configured: !!(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY),
    },
  };
}

// ============================================================
// #60 — PROMETHEUS + GRAFANA STUB
// ============================================================
const prometheusMetrics = {
  httpRequestsTotal: 0,
  httpRequestDuration: [] as number[],
  activeConnections: 0,
  dbQueryCount: 0,
  cacheHits: 0,
  cacheMisses: 0,
  escrowHeld: 0,
  escrowReleased: 0,
  fraudFlagsCreated: 0,
  jobsCreated: 0,
  bookingsCreated: 0,
  errorsTotal: 0,
};

export function trackMetric(metric: keyof typeof prometheusMetrics, value = 1) {
  if (metric === "httpRequestDuration") {
    (prometheusMetrics.httpRequestDuration as number[]).push(value);
    if (prometheusMetrics.httpRequestDuration.length > 1000) {
      prometheusMetrics.httpRequestDuration = prometheusMetrics.httpRequestDuration.slice(-500);
    }
  } else {
    (prometheusMetrics as any)[metric] += value;
  }
}

export function getPrometheusMetrics() {
  const durations = prometheusMetrics.httpRequestDuration;
  const sorted = [...durations].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
  const avg = durations.length > 0 ? durations.reduce((s, v) => s + v, 0) / durations.length : 0;

  return {
    ...prometheusMetrics,
    httpRequestDuration: undefined,
    latency: { p50, p95, p99, avg: Math.round(avg), samples: durations.length },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    timestamp: new Date().toISOString(),
  };
}

export function prometheusTextFormat() {
  const m = getPrometheusMetrics();
  return [
    `# HELP http_requests_total Total HTTP requests`,
    `# TYPE http_requests_total counter`,
    `http_requests_total ${m.httpRequestsTotal}`,
    `# HELP http_request_duration_ms HTTP request latency`,
    `# TYPE http_request_duration_ms summary`,
    `http_request_duration_ms{quantile="0.5"} ${m.latency.p50}`,
    `http_request_duration_ms{quantile="0.95"} ${m.latency.p95}`,
    `http_request_duration_ms{quantile="0.99"} ${m.latency.p99}`,
    `# HELP active_connections Active WebSocket connections`,
    `# TYPE active_connections gauge`,
    `active_connections ${m.activeConnections}`,
    `# HELP escrow_held_total Total escrow amount held`,
    `# TYPE escrow_held_total counter`,
    `escrow_held_total ${m.escrowHeld}`,
    `# HELP escrow_released_total Total escrow released`,
    `# TYPE escrow_released_total counter`,
    `escrow_released_total ${m.escrowReleased}`,
    `# HELP fraud_flags_total Total fraud flags created`,
    `# TYPE fraud_flags_total counter`,
    `fraud_flags_total ${m.fraudFlagsCreated}`,
    `# HELP jobs_created_total Total jobs created`,
    `# TYPE jobs_created_total counter`,
    `jobs_created_total ${m.jobsCreated}`,
    `# HELP errors_total Total errors`,
    `# TYPE errors_total counter`,
    `errors_total ${m.errorsTotal}`,
    `# HELP process_uptime_seconds Process uptime`,
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${Math.round(m.uptime)}`,
    `# HELP process_heap_bytes Process heap usage`,
    `# TYPE process_heap_bytes gauge`,
    `process_heap_bytes ${m.memory.heapUsed}`,
  ].join("\n");
}

// ============================================================
// #57 — ENHANCED SECURITY HEADERS (Helmet-equivalent)
// ============================================================
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=(self), payment=(self)");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Origin-Agent-Cluster", "?1");

  const isDev = process.env.NODE_ENV !== "production";
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://www.payfast.co.za https://sandbox.payfast.co.za; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    `connect-src 'self' https: ${isDev ? "ws: wss:" : "wss:"}; ` +
    "frame-src 'self' https://www.payfast.co.za https://sandbox.payfast.co.za; " +
    "frame-ancestors 'self' https://*.replit.dev https://*.replit.app; " +
    "base-uri 'self'; " +
    "form-action 'self' https://www.payfast.co.za https://sandbox.payfast.co.za;"
  );

  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  next();
}

// ============================================================
// CORS MIDDLEWARE
// ============================================================
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    "https://freelanceskills.net",
    "https://www.freelanceskills.net",
    /https:\/\/.*\.replit\.dev$/,
    /https:\/\/.*\.replit\.app$/,
  ];

  const origin = req.headers.origin;
  if (origin) {
    const isAllowed = allowedOrigins.some(o =>
      typeof o === "string" ? o === origin : o.test(origin)
    );
    if (isAllowed || process.env.NODE_ENV !== "production") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      res.setHeader("Access-Control-Max-Age", "86400");
    }
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
}

// ============================================================
// CRON SCHEDULER (runs all crons on intervals)
// ============================================================
export function startCronScheduler() {
  log("Starting cron scheduler", "cron");

  setInterval(async () => {
    try {
      const result = await cronPurgeExpiredJobs();
      if (result.processed > 0 || result.reminded > 0) {
        log(`Cron purge: ${result.processed} expired, ${result.reminded} reminded`, "cron");
      }
    } catch (err: any) {
      log(`Cron purge error: ${err.message}`, "cron");
    }
  }, 6 * 60 * 60 * 1000);

  setInterval(async () => {
    try {
      const result = await cronFraudDetection();
      if (result.flagged > 0) {
        log(`Cron fraud: ${result.flagged} flagged`, "cron");
      }
    } catch (err: any) {
      log(`Cron fraud error: ${err.message}`, "cron");
    }
  }, 24 * 60 * 60 * 1000);

  setInterval(async () => {
    try {
      const result = await cronBackupStub();
      log(`Cron backup: ${result.status}`, "cron");
    } catch (err: any) {
      log(`Cron backup error: ${err.message}`, "cron");
    }
  }, 24 * 60 * 60 * 1000);
}
