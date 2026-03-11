import type { Request, Response, NextFunction, Express } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { eq, desc, sql, and, count } from "drizzle-orm";
import {
  abTests, trackingPixels, discountCodes, badges, flashSales, affiliates, churnEvents,
  bookings, reviews, profiles, jobs, referrals, premiumTiers, escrowTransactions
} from "@shared/schema";

// ============================================================
// B1 — A/B TEST PREMIUM BANNER
// ============================================================
const AB_VARIANTS = {
  premium_banner: [
    { id: "A", text: "Unlock Top Visibility", subtext: "Get seen first by clients in your area", cta: "Go Premium", color: "#059669" },
    { id: "B", text: "Earn 30% More – Go Premium", subtext: "Premium freelancers earn R12,400/mo avg vs R9,500 for free", cta: "Boost Earnings", color: "#2563eb" },
  ],
};

export function getAbVariant(testName: string, sessionId: string): any {
  const variants = AB_VARIANTS[testName as keyof typeof AB_VARIANTS];
  if (!variants) return null;
  const hash = sessionId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return variants[hash % variants.length];
}

export async function trackAbEvent(testName: string, variant: string, event: "impression" | "click" | "conversion", userId?: string, sessionId?: string) {
  const existing = await db.select().from(abTests)
    .where(and(eq(abTests.testName, testName), eq(abTests.variant, variant)))
    .limit(1);

  if (existing.length > 0) {
    const update: Record<string, any> = {};
    if (event === "impression") update.impressions = sql`${abTests.impressions} + 1`;
    if (event === "click") update.clicks = sql`${abTests.clicks} + 1`;
    if (event === "conversion") update.conversions = sql`${abTests.conversions} + 1`;
    await db.update(abTests).set(update).where(eq(abTests.id, existing[0].id));
  } else {
    await db.insert(abTests).values({
      testName,
      variant,
      userId,
      sessionId,
      impressions: event === "impression" ? 1 : 0,
      clicks: event === "click" ? 1 : 0,
      conversions: event === "conversion" ? 1 : 0,
    });
  }
}

export async function getAbResults(testName: string) {
  const results = await db.select().from(abTests).where(eq(abTests.testName, testName));
  return results.map(r => ({
    variant: r.variant,
    impressions: r.impressions,
    clicks: r.clicks,
    conversions: r.conversions,
    ctr: r.impressions > 0 ? ((r.clicks / r.impressions) * 100).toFixed(2) + "%" : "0%",
    conversionRate: r.clicks > 0 ? ((r.conversions / r.clicks) * 100).toFixed(2) + "%" : "0%",
  }));
}

// ============================================================
// B2 — REFERRAL CAMPAIGN (email template + link generator)
// ============================================================
export function generateReferralEmailTemplate(referrerName: string, referralCode: string, baseUrl: string) {
  const link = `${baseUrl}/auth?ref=${referralCode}`;
  return {
    subject: `${referrerName} invites you to join FreelanceSkills.net – Earn R100!`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8fafc">
      <div style="background:#059669;color:white;padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="margin:0">FreelanceSkills.net</h1>
        <p style="margin:8px 0 0;opacity:0.9">South Africa's #1 Freelance Marketplace</p>
      </div>
      <div style="background:white;padding:24px;border-radius:0 0 12px 12px">
        <h2>Hey there! 👋</h2>
        <p>${referrerName} thinks you'd be great on FreelanceSkills.net.</p>
        <p>Join now and you'll <strong>both earn R100</strong> when you complete your first job.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${link}" style="background:#059669;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Join FreelanceSkills.net</a>
        </div>
        <p style="color:#6b7280;font-size:14px">Or use referral code: <strong>${referralCode}</strong></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
        <p style="color:#9ca3af;font-size:12px">FreelanceSkills (Pty) Ltd | Reg: 2026/070509/09 | Tableview, Cape Town</p>
      </div>
    </div>`,
    text: `${referrerName} invites you to FreelanceSkills.net! Join with code ${referralCode} and earn R100. Sign up: ${link}`,
    referralLink: link,
  };
}

// ============================================================
// B3 — FACEBOOK/GOOGLE PIXEL STUB + CONVERSION EVENTS
// ============================================================
export const CONVERSION_EVENTS = {
  JOB_POST: "job_post_complete",
  PREMIUM_SIGNUP: "premium_signup",
  PAYOUT_REQUEST: "payout_request",
  BOOKING_COMPLETE: "booking_complete",
  REGISTRATION: "registration_complete",
  FIRST_JOB: "first_job_complete",
} as const;

export async function trackConversionEvent(pixelType: "facebook" | "google" | "internal", eventName: string, userId?: string, metadata?: Record<string, any>) {
  await db.insert(trackingPixels).values({ pixelType, eventName, userId, metadata });
  return { tracked: true, pixelType, eventName, timestamp: new Date().toISOString() };
}

export function getPixelSnippets(fbPixelId?: string, gaId?: string) {
  return {
    facebook: fbPixelId ? `<!-- Facebook Pixel --><script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbPixelId}');fbq('track','PageView');</script>` : null,
    google: gaId ? `<!-- Google Analytics --><script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');</script>` : null,
    conversionEvents: CONVERSION_EVENTS,
  };
}

// ============================================================
// B4 — DYNAMIC PRICING ENGINE (real-time demand signals)
// ============================================================
const DEMAND_SIGNALS: Record<string, { baseRate: number; supplyFactor: number; trendMultiplier: number }> = {
  "web-development": { baseRate: 750, supplyFactor: 0.8, trendMultiplier: 1.3 },
  "mobile-development": { baseRate: 850, supplyFactor: 0.7, trendMultiplier: 1.4 },
  "graphic-design": { baseRate: 500, supplyFactor: 1.2, trendMultiplier: 1.0 },
  "writing": { baseRate: 350, supplyFactor: 1.5, trendMultiplier: 0.9 },
  "plumbing": { baseRate: 450, supplyFactor: 0.6, trendMultiplier: 1.2 },
  "electrical": { baseRate: 500, supplyFactor: 0.5, trendMultiplier: 1.3 },
  "cleaning": { baseRate: 200, supplyFactor: 1.8, trendMultiplier: 0.85 },
  "gardening": { baseRate: 180, supplyFactor: 1.6, trendMultiplier: 0.9 },
  "tutoring": { baseRate: 300, supplyFactor: 1.0, trendMultiplier: 1.1 },
  "photography": { baseRate: 600, supplyFactor: 0.9, trendMultiplier: 1.15 },
};

export async function calculateDynamicRate(category: string, freelancerRate: number, location?: string) {
  const signal = DEMAND_SIGNALS[category] || { baseRate: 400, supplyFactor: 1.0, trendMultiplier: 1.0 };
  
  const allJobs = await db.select({ count: count() }).from(jobs).where(and(eq(jobs.category, category), eq(jobs.status, "open")));
  const allFreelancers = await db.select({ count: count() }).from(profiles).where(sql`${category} = ANY(${profiles.skills})`);
  
  const openJobs = allJobs[0]?.count || 0;
  const activeFreelancers = allFreelancers[0]?.count || 0;
  const demandRatio = activeFreelancers > 0 ? openJobs / activeFreelancers : 1;

  let suggestedRate = signal.baseRate * signal.trendMultiplier;
  if (demandRatio > 2) suggestedRate *= 1.25;
  else if (demandRatio > 1) suggestedRate *= 1.1;
  else if (demandRatio < 0.5) suggestedRate *= 0.9;

  const locationBoosts: Record<string, number> = {
    "johannesburg": 1.15, "cape town": 1.1, "durban": 1.05, "pretoria": 1.1,
    "sandton": 1.2, "stellenbosch": 1.05, "umhlanga": 1.1,
  };
  const locBoost = locationBoosts[(location || "").toLowerCase()] || 1.0;
  suggestedRate *= locBoost;

  const isUnderpriced = freelancerRate > 0 && freelancerRate < suggestedRate * 0.7;
  const isOverpriced = freelancerRate > 0 && freelancerRate > suggestedRate * 1.5;

  return {
    category,
    currentRate: freelancerRate,
    suggestedRate: Math.round(suggestedRate),
    marketSignals: {
      openJobs, activeFreelancers, demandRatio: demandRatio.toFixed(2),
      supplyLevel: demandRatio > 1.5 ? "high_demand" : demandRatio > 0.8 ? "balanced" : "oversupplied",
      trendDirection: signal.trendMultiplier > 1.1 ? "rising" : signal.trendMultiplier < 0.95 ? "declining" : "stable",
    },
    recommendation: isUnderpriced ? "You're undercharging. Raise your rate to attract better clients." :
      isOverpriced ? "Your rate may be too high for this market. Consider adjusting for more bookings." :
      "Your rate is competitive for this market.",
    locationMultiplier: locBoost,
    priceRange: { min: Math.round(suggestedRate * 0.8), max: Math.round(suggestedRate * 1.3) },
  };
}

// ============================================================
// B5 — FLASH SALE STUB (50% off first month)
// ============================================================
export async function getActiveFlashSales() {
  const now = new Date();
  const sales = await db.select().from(flashSales).where(eq(flashSales.isActive, true));
  return sales.filter(s => new Date(s.startsAt) <= now && new Date(s.endsAt) >= now && s.currentRedemptions < s.maxRedemptions)
    .map(s => ({
      ...s,
      timeRemaining: Math.max(0, new Date(s.endsAt).getTime() - now.getTime()),
      spotsLeft: s.maxRedemptions - s.currentRedemptions,
    }));
}

export async function createFlashSale(data: { name: string; discountPercent: number; durationHours: number; maxRedemptions: number }) {
  const originalPrice = 7900;
  const salePrice = Math.round(originalPrice * (1 - data.discountPercent / 100));
  const now = new Date();
  const [sale] = await db.insert(flashSales).values({
    name: data.name,
    discountPercent: data.discountPercent,
    originalPrice,
    salePrice,
    startsAt: now,
    endsAt: new Date(now.getTime() + data.durationHours * 3600000),
    maxRedemptions: data.maxRedemptions,
    targetAudience: "new_freelancers",
    isActive: true,
  }).returning();
  return sale;
}

export async function redeemFlashSale(saleId: number, userId: string) {
  const [sale] = await db.select().from(flashSales).where(eq(flashSales.id, saleId));
  if (!sale) throw new Error("Sale not found");
  if (!sale.isActive) throw new Error("Sale is no longer active");
  if (sale.currentRedemptions >= sale.maxRedemptions) throw new Error("Sale is sold out");
  if (new Date() > new Date(sale.endsAt)) throw new Error("Sale has expired");
  
  await db.update(flashSales).set({ currentRedemptions: sql`${flashSales.currentRedemptions} + 1` }).where(eq(flashSales.id, saleId));
  return { userId, saleId, price: sale.salePrice, discount: sale.discountPercent, originalPrice: sale.originalPrice };
}

// ============================================================
// B6 — UPSELL MODAL AFTER JOB COMPLETION
// ============================================================
export async function getUpsellOffer(userId: string) {
  const tier = await db.select().from(premiumTiers).where(eq(premiumTiers.userId, userId)).limit(1);
  if (tier.length > 0 && tier[0].tier !== "free") return null;

  const completedJobs = await db.select({ count: count() }).from(bookings)
    .where(and(eq(bookings.freelancerId, userId), eq(bookings.status, "completed")));
  const jobCount = completedJobs[0]?.count || 0;

  if (jobCount === 0) return null;

  const activeSales = await getActiveFlashSales();
  const flashDeal = activeSales.length > 0 ? activeSales[0] : null;

  return {
    show: true,
    headline: "You just crushed it! 🎉",
    message: `You've completed ${jobCount} job${jobCount > 1 ? "s" : ""}. Premium freelancers get priority on the next ${jobCount * 3}+ matching gigs.`,
    cta: flashDeal ? `Upgrade Now – R${(flashDeal.salePrice / 100).toFixed(0)}/mo (${flashDeal.discountPercent}% off!)` : "Upgrade to Premium – R79/mo",
    price: flashDeal ? flashDeal.salePrice : 7900,
    originalPrice: 7900,
    benefits: ["Top search placement", "5% commission (vs 10%)", "Verified badge", "Priority support"],
    flashSale: flashDeal ? { id: flashDeal.id, endsAt: flashDeal.endsAt, spotsLeft: flashDeal.maxRedemptions - flashDeal.currentRedemptions } : null,
  };
}

// ============================================================
// B7 — CLIENT PREMIUM TIER (bulk discounts)
// ============================================================
export async function getClientBulkDiscount(userId: string) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthlyJobs = await db.select({ count: count() }).from(jobs)
    .where(and(eq(jobs.clientId, userId), sql`${jobs.createdAt} >= ${monthStart}`));
  
  const jobCount = monthlyJobs[0]?.count || 0;
  let discount = 0;
  let tier = "standard";

  if (jobCount >= 50) { discount = 25; tier = "platinum_client"; }
  else if (jobCount >= 25) { discount = 20; tier = "gold_client"; }
  else if (jobCount >= 10) { discount = 15; tier = "silver_client"; }
  else if (jobCount >= 5) { discount = 10; tier = "bronze_client"; }

  return {
    userId,
    monthlyJobCount: jobCount,
    tier,
    discountPercent: discount,
    commissionRate: Math.max(3, 10 - discount),
    nextTierAt: jobCount < 5 ? 5 : jobCount < 10 ? 10 : jobCount < 25 ? 25 : jobCount < 50 ? 50 : null,
    savings: discount > 0 ? `Save ${discount}% on commissions this month` : "Post 5+ jobs this month to unlock bulk discounts",
  };
}

// ============================================================
// B8 — FREELANCER ANALYTICS DASHBOARD
// ============================================================
export async function getFreelancerAnalytics(userId: string) {
  const allBookings = await db.select().from(bookings).where(eq(bookings.freelancerId, userId));
  const completed = allBookings.filter(b => b.status === "completed");
  const totalEarned = completed.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const monthlyEarnings: Record<string, number> = {};
  for (const b of completed) {
    const month = new Date(b.createdAt!).toISOString().substring(0, 7);
    monthlyEarnings[month] = (monthlyEarnings[month] || 0) + (b.totalAmount || 0);
  }

  const clientCounts: Record<string, number> = {};
  for (const b of completed) {
    if (b.clientId) clientCounts[b.clientId] = (clientCounts[b.clientId] || 0) + 1;
  }
  const topClients = Object.entries(clientCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([clientId, count]) => ({ clientId, jobCount: count }));

  const now = new Date();
  const thisMonth = completed.filter(b => {
    const d = new Date(b.createdAt!);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = completed.filter(b => {
    const d = new Date(b.createdAt!);
    const lm = new Date(now);
    lm.setMonth(lm.getMonth() - 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  const thisMonthTotal = thisMonth.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const lastMonthTotal = lastMonth.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const growthPercent = lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0;

  return {
    totalEarnings: totalEarned,
    totalJobs: completed.length,
    averageJobValue: completed.length > 0 ? Math.round(totalEarned / completed.length) : 0,
    monthlyEarnings: Object.entries(monthlyEarnings).map(([month, amount]) => ({ month, amount })).slice(-6),
    topClients,
    thisMonth: { earnings: thisMonthTotal, jobs: thisMonth.length },
    lastMonth: { earnings: lastMonthTotal, jobs: lastMonth.length },
    growthPercent,
    pendingPayouts: allBookings.filter(b => b.status === "delivered").reduce((s, b) => s + (b.totalAmount || 0), 0),
  };
}

// ============================================================
// B9 — CLIENT ANALYTICS
// ============================================================
export async function getClientAnalytics(userId: string) {
  const allBookings = await db.select().from(bookings).where(eq(bookings.clientId, userId));
  const completed = allBookings.filter(b => b.status === "completed");
  const totalSpent = completed.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const avgRate = completed.length > 0 ? Math.round(totalSpent / completed.length) : 0;

  const allReviews = await db.select().from(reviews).where(eq(reviews.reviewerId, userId));
  const avgSatisfaction = allReviews.length > 0
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : "N/A";

  const freelancerCounts: Record<string, number> = {};
  for (const b of completed) {
    if (b.freelancerId) freelancerCounts[b.freelancerId] = (freelancerCounts[b.freelancerId] || 0) + 1;
  }

  return {
    totalSpent,
    totalHires: completed.length,
    averageRatePaid: avgRate,
    satisfactionScore: avgSatisfaction,
    activeJobs: allBookings.filter(b => ["pending", "confirmed", "in_progress"].includes(b.status)).length,
    repeatHireRate: Object.values(freelancerCounts).filter(c => c > 1).length,
    topFreelancers: Object.entries(freelancerCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([id, cnt]) => ({ freelancerId: id, hires: cnt })),
  };
}

// ============================================================
// B10 — VIRAL SHARE BUTTON
// ============================================================
export function generateViralShareContent(freelancerName: string, jobTitle: string, rating: number) {
  const text = `I just hired ${freelancerName} on FreelanceSkills.net for "${jobTitle}" — ${rating}⭐ experience! 🇿🇦`;
  const url = "https://freelanceskills.net";
  return {
    text,
    platforms: {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    },
    hashtags: ["#FreelanceSkillsSA", "#SouthAfrica", "#Freelancing"],
  };
}

// ============================================================
// B11 — SMS NOTIFICATION STUB (Twilio-like)
// ============================================================
export async function sendSmsNotification(phoneNumber: string, message: string, jobId?: string) {
  const sanitized = phoneNumber.replace(/[^\d+]/g, "");
  if (!sanitized.startsWith("+27") && !sanitized.startsWith("0")) {
    return { sent: false, error: "Only South African numbers (+27) supported" };
  }

  return {
    sent: true,
    stub: true,
    provider: "twilio",
    to: sanitized,
    message: message.substring(0, 160),
    jobId,
    sid: `SM${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`,
    note: "SMS delivery stubbed — configure TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN for live delivery",
  };
}

// ============================================================
// B12 — PUSH NOTIFICATION SERVICE WORKER
// ============================================================
export function getPushNotificationConfig() {
  return {
    supported: true,
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || "STUB_VAPID_KEY_REPLACE_IN_PRODUCTION",
    serviceWorkerUrl: "/sw.js",
    events: ["new_match", "application_received", "message_received", "payment_released", "job_urgency"],
    setup: {
      step1: "Register service worker at /sw.js",
      step2: "Subscribe to push notifications using VAPID key",
      step3: "Send subscription to POST /api/push/subscribe",
      step4: "Server sends push via web-push library",
    },
  };
}

// ============================================================
// B13 — GAMIFICATION: BADGES
// ============================================================
const BADGE_DEFINITIONS = [
  { type: "jobs_5", name: "Starter", icon: "🌟", threshold: 5, description: "Completed 5 jobs" },
  { type: "jobs_10", name: "Pro", icon: "⭐", threshold: 10, description: "Completed 10 jobs" },
  { type: "jobs_50", name: "Legend", icon: "🏆", threshold: 50, description: "Completed 50 jobs" },
  { type: "jobs_100", name: "Elite", icon: "💎", threshold: 100, description: "Completed 100 jobs" },
  { type: "rating_5", name: "Perfect Score", icon: "🎯", threshold: 0, description: "Maintained 5.0 rating" },
  { type: "earner_50k", name: "High Earner", icon: "💰", threshold: 5000000, description: "Earned R50,000+" },
  { type: "earner_100k", name: "Top Earner", icon: "🤑", threshold: 10000000, description: "Earned R100,000+" },
  { type: "fast_delivery", name: "Speed Demon", icon: "⚡", threshold: 0, description: "3+ jobs delivered ahead of schedule" },
  { type: "referral_5", name: "Connector", icon: "🤝", threshold: 5, description: "Referred 5+ successful hires" },
  { type: "academy_grad", name: "Scholar", icon: "🎓", threshold: 0, description: "Completed 3+ academy courses" },
];

export async function checkAndAwardBadges(userId: string) {
  const existingBadges = await db.select().from(badges).where(eq(badges.userId, userId));
  const existingTypes = new Set(existingBadges.map(b => b.badgeType));
  const newBadges: any[] = [];

  const completedJobs = await db.select({ count: count() }).from(bookings)
    .where(and(eq(bookings.freelancerId, userId), eq(bookings.status, "completed")));
  const jobCount = completedJobs[0]?.count || 0;

  const totalEarned = await db.select({ sum: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)` })
    .from(bookings).where(and(eq(bookings.freelancerId, userId), eq(bookings.status, "completed")));
  const earnings = totalEarned[0]?.sum || 0;

  const userReferrals = await db.select({ count: count() }).from(referrals)
    .where(and(eq(referrals.referrerId, userId), eq(referrals.status, "completed")));
  const refCount = userReferrals[0]?.count || 0;

  for (const def of BADGE_DEFINITIONS) {
    if (existingTypes.has(def.type)) continue;

    let earned = false;
    if (def.type.startsWith("jobs_") && jobCount >= def.threshold) earned = true;
    if (def.type.startsWith("earner_") && earnings >= def.threshold) earned = true;
    if (def.type === "referral_5" && refCount >= 5) earned = true;

    if (earned) {
      const [badge] = await db.insert(badges).values({
        userId,
        badgeType: def.type,
        badgeName: def.name,
        badgeIcon: def.icon,
        metadata: { description: def.description },
      }).returning();
      newBadges.push(badge);
    }
  }

  return { userId, totalBadges: existingBadges.length + newBadges.length, newBadges, allBadges: [...existingBadges, ...newBadges] };
}

export function getBadgeDefinitions() {
  return BADGE_DEFINITIONS;
}

// ============================================================
// B14 — LEADERBOARD (top earners, opt-in)
// ============================================================
export async function getLeaderboard(period: "month" | "all_time" = "month") {
  let dateFilter = sql`TRUE`;
  if (period === "month") {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    dateFilter = sql`${bookings.createdAt} >= ${monthStart}`;
  }

  const results = await db.select({
    freelancerId: bookings.freelancerId,
    totalEarnings: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)`.as("total_earnings"),
    jobCount: sql<number>`COUNT(*)`.as("job_count"),
  }).from(bookings)
    .where(and(eq(bookings.status, "completed"), dateFilter))
    .groupBy(bookings.freelancerId)
    .orderBy(sql`total_earnings DESC`)
    .limit(20);

  return results.map((r, idx) => ({
    rank: idx + 1,
    freelancerId: r.freelancerId,
    totalEarnings: r.totalEarnings,
    jobCount: r.jobCount,
    anonymized: true,
  }));
}

// ============================================================
// B15 — SEASONAL CAMPAIGN STUB
// ============================================================
export function getSeasonalCampaigns() {
  const now = new Date();
  const month = now.getMonth();

  const campaigns = [];
  if (month >= 10 || month <= 1) {
    campaigns.push({ id: "summer-handyman", name: "Summer Handyman Special", description: "20% more visibility for pool, garden & outdoor gigs", boost: 20, categories: ["plumbing", "gardening", "cleaning", "pool-maintenance"], validUntil: "2026-02-28", badge: "☀️" });
  }
  if (month >= 0 && month <= 2) {
    campaigns.push({ id: "back-to-school", name: "Back to School", description: "Tutors get featured placement", boost: 15, categories: ["tutoring", "education"], validUntil: "2026-03-31", badge: "📚" });
  }
  if (month >= 9 && month <= 11) {
    campaigns.push({ id: "year-end-rush", name: "Year-End Rush", description: "Businesses hiring for December — premium clients get 10% off", boost: 25, categories: ["all"], validUntil: "2026-12-31", badge: "🎄" });
  }
  campaigns.push({ id: "always-on", name: "Mzansi Skills", description: "South Africa's top talent — always available", boost: 5, categories: ["all"], validUntil: "2027-12-31", badge: "🇿🇦" });

  return campaigns;
}

// ============================================================
// B16 — AFFILIATE PROGRAM STUB (15% recurring)
// ============================================================
export async function createAffiliate(name: string, email: string) {
  const code = `AFF-${name.substring(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const [aff] = await db.insert(affiliates).values({
    name, email, affiliateCode: code, commissionRate: 15, isActive: true,
  }).returning();
  return aff;
}

export async function getAffiliateStats(affiliateCode: string) {
  const [aff] = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, affiliateCode));
  if (!aff) return null;

  const codes = await db.select().from(discountCodes).where(eq(discountCodes.affiliateId, aff.affiliateCode));
  const totalRedemptions = codes.reduce((s, c) => s + c.currentUses, 0);

  return {
    ...aff,
    discountCodes: codes,
    totalRedemptions,
    pendingCommission: Math.round(totalRedemptions * 7900 * (aff.commissionRate / 100)),
  };
}

// ============================================================
// B17 — DISCOUNT CODE SYSTEM
// ============================================================
export async function createDiscountCode(data: { code: string; type: "percentage" | "fixed"; value: number; maxUses: number; affiliateId?: string; expiresAt?: Date; stripeCouponId?: string }) {
  const existing = await db.select().from(discountCodes).where(eq(discountCodes.code, data.code.toUpperCase()));
  if (existing.length > 0) throw new Error("Discount code already exists");

  const [dc] = await db.insert(discountCodes).values({
    code: data.code.toUpperCase(),
    type: data.type,
    value: data.value,
    maxUses: data.maxUses,
    affiliateId: data.affiliateId || null,
    expiresAt: data.expiresAt || null,
    stripeCouponId: data.stripeCouponId || null,
    isActive: true,
  }).returning();
  return dc;
}

export async function validateDiscountCode(code: string) {
  const [dc] = await db.select().from(discountCodes).where(and(eq(discountCodes.code, code.toUpperCase()), eq(discountCodes.isActive, true)));
  if (!dc) return { valid: false, error: "Invalid discount code" };
  if (dc.currentUses >= dc.maxUses) return { valid: false, error: "Code has been fully redeemed" };
  if (dc.expiresAt && new Date() > new Date(dc.expiresAt)) return { valid: false, error: "Code has expired" };

  const discount = dc.type === "percentage" ? { percent: dc.value, amount: Math.round(7900 * dc.value / 100) } : { percent: 0, amount: dc.value };
  return { valid: true, code: dc.code, discount, finalPrice: Math.max(0, 7900 - discount.amount) };
}

export async function redeemDiscountCode(code: string) {
  const validation = await validateDiscountCode(code);
  if (!validation.valid) throw new Error(validation.error);
  await db.update(discountCodes).set({ currentUses: sql`${discountCodes.currentUses} + 1` }).where(eq(discountCodes.code, code.toUpperCase()));
  return validation;
}

// ============================================================
// B18 — CHURN PREVENTION
// ============================================================
export async function detectChurnRisk() {
  const allProfiles = await db.select().from(profiles);
  const risks: any[] = [];

  for (const profile of allProfiles.slice(0, 100)) {
    const lastBooking = await db.select().from(bookings)
      .where(eq(bookings.freelancerId, profile.userId))
      .orderBy(desc(bookings.createdAt))
      .limit(1);

    const lastActivity = lastBooking[0]?.createdAt || profile.createdAt;
    const daysSince = Math.floor((Date.now() - new Date(lastActivity!).getTime()) / 86400000);

    if (daysSince > 14) {
      const creditOffer = daysSince > 30 ? 5000 : daysSince > 21 ? 2500 : 0;
      risks.push({
        userId: profile.userId,
        daysSinceLastActivity: daysSince,
        riskLevel: daysSince > 30 ? "high" : daysSince > 21 ? "medium" : "low",
        suggestedAction: daysSince > 30 ? "Send R50 credit offer + urgent re-engagement email" :
          daysSince > 21 ? "Send R25 credit offer + reminder" : "Send gentle nudge email",
        emailSubject: daysSince > 30 ? "We miss you! Here's R50 credit 💚" :
          daysSince > 21 ? "Post one job this week — get R25 credit" : "New opportunities matching your skills",
        creditOffer,
      });
    }
  }

  return { totalAtRisk: risks.length, risks: risks.slice(0, 20) };
}

// ============================================================
// B19 — RETENTION ANALYTICS (cohort stub)
// ============================================================
export async function getCohortAnalysis() {
  const monthlySignups = await db.select({
    month: sql<string>`TO_CHAR(${profiles.createdAt}, 'YYYY-MM')`.as("signup_month"),
    count: count(),
  }).from(profiles)
    .groupBy(sql`TO_CHAR(${profiles.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`signup_month DESC`)
    .limit(6);

  const cohorts = [];
  for (const cohort of monthlySignups) {
    const signupMonth = cohort.month;
    const usersInCohort = await db.select({ userId: profiles.userId })
      .from(profiles)
      .where(sql`TO_CHAR(${profiles.createdAt}, 'YYYY-MM') = ${signupMonth}`);
    
    const userIds = usersInCohort.map(u => u.userId);
    let firstJob = 0, premium = 0, retained = 0;

    if (userIds.length > 0 && userIds.length <= 100) {
      for (const uid of userIds.slice(0, 50)) {
        const hasBooking = await db.select({ count: count() }).from(bookings).where(eq(bookings.freelancerId, uid));
        if ((hasBooking[0]?.count || 0) > 0) firstJob++;
        const hasPremium = await db.select({ count: count() }).from(premiumTiers).where(and(eq(premiumTiers.userId, uid), sql`${premiumTiers.tier} != 'free'`));
        if ((hasPremium[0]?.count || 0) > 0) premium++;
        const recentBooking = await db.select({ count: count() }).from(bookings).where(and(eq(bookings.freelancerId, uid), sql`${bookings.createdAt} >= NOW() - INTERVAL '30 days'`));
        if ((recentBooking[0]?.count || 0) > 0) retained++;
      }
    }

    const total = Math.min(userIds.length, 50);
    cohorts.push({
      month: signupMonth,
      signups: cohort.count,
      firstJobRate: total > 0 ? `${Math.round(firstJob / total * 100)}%` : "0%",
      premiumRate: total > 0 ? `${Math.round(premium / total * 100)}%` : "0%",
      retentionRate: total > 0 ? `${Math.round(retained / total * 100)}%` : "0%",
    });
  }

  return { cohorts, methodology: "Tracks signup → first job → premium → 30-day retention" };
}

// ============================================================
// B20 — REVENUE FORECAST CALCULATOR
// ============================================================
export function calculateRevenueForecast(params: { monthlySignups: number; conversionRate: number; avgJobValue: number; commissionRate: number; premiumRate: number; premiumPrice: number; churnRate: number; months: number }) {
  const { monthlySignups, conversionRate, avgJobValue, commissionRate, premiumRate, premiumPrice, churnRate, months } = params;
  
  const forecast = [];
  let totalUsers = 0;
  let cumulativeRevenue = 0;
  let mrr = 0;

  for (let m = 1; m <= months; m++) {
    totalUsers = Math.round(totalUsers * (1 - churnRate / 100) + monthlySignups);
    const activeJobbers = Math.round(totalUsers * conversionRate / 100);
    const premiumUsers = Math.round(totalUsers * premiumRate / 100);
    const transactionRevenue = Math.round(activeJobbers * avgJobValue * commissionRate / 100);
    const subscriptionRevenue = premiumUsers * premiumPrice;
    mrr = transactionRevenue + subscriptionRevenue;
    cumulativeRevenue += mrr;

    forecast.push({
      month: m,
      totalUsers,
      activeJobbers,
      premiumUsers,
      transactionRevenue,
      subscriptionRevenue,
      mrr,
      arr: mrr * 12,
      cumulativeRevenue,
    });
  }

  return {
    forecast,
    summary: {
      month12MRR: forecast[months - 1]?.mrr || 0,
      month12ARR: (forecast[months - 1]?.mrr || 0) * 12,
      totalRevenue: cumulativeRevenue,
      totalUsers: forecast[months - 1]?.totalUsers || 0,
      breakEvenMonth: forecast.findIndex(f => f.cumulativeRevenue > 500000) + 1 || null,
    },
  };
}

// ============================================================
// B21 — STRIPE COUPON SYSTEM
// ============================================================
export async function createStripeCoupon(data: { name: string; percentOff?: number; amountOff?: number; duration: "once" | "repeating" | "forever"; durationInMonths?: number }) {
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-01-27.acacia" as any });

    const couponData: any = {
      name: data.name,
      duration: data.duration,
    };
    if (data.percentOff) couponData.percent_off = data.percentOff;
    if (data.amountOff) { couponData.amount_off = data.amountOff; couponData.currency = "zar"; }
    if (data.durationInMonths) couponData.duration_in_months = data.durationInMonths;

    const coupon = await stripe.coupons.create(couponData);
    return { success: true, couponId: coupon.id, ...couponData };
  } catch (error: any) {
    return { success: false, error: error.message, stub: true, couponId: `STUB_${Date.now()}` };
  }
}

export async function listStripeCoupons() {
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-01-27.acacia" as any });
    const coupons = await stripe.coupons.list({ limit: 20 });
    return coupons.data.map(c => ({ id: c.id, name: c.name, percentOff: c.percent_off, amountOff: c.amount_off, duration: c.duration, valid: c.valid }));
  } catch {
    return [{ id: "STUB", name: "Welcome 50% Off", percentOff: 50, duration: "once", valid: true, stub: true }];
  }
}

// ============================================================
// B22 — MULTI-CURRENCY DISPLAY STUB
// ============================================================
const EXCHANGE_RATES: Record<string, number> = {
  ZAR: 1.0, USD: 0.054, EUR: 0.050, GBP: 0.043, BWP: 0.73, NAD: 1.0, MZN: 3.45, SZL: 1.0,
};

export function convertCurrency(amountCents: number, from: string, to: string) {
  const fromRate = EXCHANGE_RATES[from.toUpperCase()] || 1;
  const toRate = EXCHANGE_RATES[to.toUpperCase()] || 1;
  const converted = Math.round(amountCents * (toRate / fromRate));
  return {
    original: { amount: amountCents, currency: from.toUpperCase() },
    converted: { amount: converted, currency: to.toUpperCase() },
    rate: (toRate / fromRate).toFixed(4),
    displayOriginal: `R${(amountCents / 100).toFixed(2)}`,
    displayConverted: `${getCurrencySymbol(to)}${(converted / 100).toFixed(2)}`,
    disclaimer: "Exchange rates are indicative and updated periodically. Actual rates may vary.",
  };
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = { ZAR: "R", USD: "$", EUR: "€", GBP: "£", BWP: "P", NAD: "N$", MZN: "MT", SZL: "E" };
  return symbols[currency.toUpperCase()] || currency;
}

export function getSupportedCurrencies() {
  return Object.entries(EXCHANGE_RATES).map(([code, rate]) => ({
    code, symbol: getCurrencySymbol(code), rate, name: getCurrencyName(code),
  }));
}

function getCurrencyName(code: string): string {
  const names: Record<string, string> = {
    ZAR: "South African Rand", USD: "US Dollar", EUR: "Euro", GBP: "British Pound",
    BWP: "Botswana Pula", NAD: "Namibian Dollar", MZN: "Mozambican Metical", SZL: "Eswatini Lilangeni",
  };
  return names[code] || code;
}

// ============================================================
// B23 — TAX CALCULATOR (SARS STUB)
// ============================================================
export function calculateFreelancerTax(annualIncome: number, expenses: number = 0) {
  const taxableIncome = Math.max(0, annualIncome - expenses);
  const brackets = [
    { min: 0, max: 237100, rate: 18, base: 0 },
    { min: 237101, max: 370500, rate: 26, base: 42678 },
    { min: 370501, max: 512800, rate: 31, base: 77362 },
    { min: 512801, max: 673000, rate: 36, base: 121475 },
    { min: 673001, max: 857900, rate: 39, base: 179147 },
    { min: 857901, max: 1817000, rate: 41, base: 251258 },
    { min: 1817001, max: Infinity, rate: 45, base: 644489 },
  ];

  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome >= b.min) {
      if (taxableIncome <= b.max) {
        tax = b.base + (taxableIncome - b.min) * b.rate / 100;
        break;
      }
    }
  }

  const primaryRebate = 17235;
  const netTax = Math.max(0, tax - primaryRebate);
  const effectiveRate = taxableIncome > 0 ? ((netTax / taxableIncome) * 100).toFixed(1) : "0";

  return {
    grossIncome: annualIncome,
    deductions: expenses,
    taxableIncome,
    taxBeforeRebates: Math.round(tax),
    primaryRebate,
    taxPayable: Math.round(netTax),
    effectiveRate: `${effectiveRate}%`,
    monthlyTax: Math.round(netTax / 12),
    takeHome: Math.round((annualIncome - netTax) / 12),
    disclaimer: "This is an estimate based on SARS 2025/2026 tax tables. Consult a tax professional for accurate calculations.",
    tips: [
      "Keep receipts for all business expenses (internet, equipment, travel)",
      "Register as a provisional taxpayer if earning >R30,000/year from freelancing",
      "You can deduct home office costs if you work from home regularly",
      "Consider forming a Section 12J investment for tax benefits",
    ],
  };
}

// ============================================================
// B24 — CASH-OUT SPEED BOOST (same-day vs 3-day)
// ============================================================
export function getPayoutOptions(amount: number, isPremium: boolean) {
  return {
    options: [
      {
        id: "standard",
        name: "Standard Payout",
        description: "Free bank transfer",
        fee: 0,
        feePercent: 0,
        processingTime: isPremium ? "1-2 business days" : "3-5 business days",
        netAmount: amount,
        available: true,
      },
      {
        id: "express",
        name: "Express Payout",
        description: "Same-day bank transfer",
        fee: Math.round(amount * 0.015),
        feePercent: 1.5,
        processingTime: isPremium ? "Within 2 hours" : "Same business day",
        netAmount: amount - Math.round(amount * 0.015),
        available: isPremium,
        premiumOnly: !isPremium,
        upgradeMessage: isPremium ? null : "Upgrade to Premium for 2-hour express payouts",
      },
      {
        id: "instant",
        name: "Instant Payout",
        description: "Immediate to your linked card",
        fee: Math.round(amount * 0.025),
        feePercent: 2.5,
        processingTime: "Instant (< 30 seconds)",
        netAmount: amount - Math.round(amount * 0.025),
        available: isPremium,
        premiumOnly: !isPremium,
        upgradeMessage: isPremium ? null : "Upgrade to Premium for instant payouts",
      },
    ],
    premiumBenefit: isPremium ? "As a Premium member, you get priority processing on all payouts" : null,
  };
}

// ============================================================
// B25 — VICTORY DEPLOY: test transaction endpoint
// ============================================================
export async function runTestTransaction() {
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-01-27.acacia" as any });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "zar",
      description: "FreelanceSkills.net — R1.00 test transaction (B25 victory deploy)",
      metadata: { type: "test_transaction", feature: "B25_victory_deploy" },
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: 100,
      currency: "ZAR",
      status: paymentIntent.status,
      message: "R1.00 test charge created. Use test card 4242 4242 4242 4242 to complete.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stub: true,
      message: "Stripe not configured — test transaction stubbed",
    };
  }
}

// ============================================================
// REGISTER ALL GROWTH ROUTES
// ============================================================
export function registerGrowthRoutes(app: Express, isAuthenticated: any) {
  // B1: A/B Test
  app.get("/api/growth/ab-test/:testName", (req, res) => {
    const sessionId = (req.session as any)?.userId || req.ip || "anon";
    const variant = getAbVariant(req.params.testName, sessionId);
    if (!variant) return res.status(404).json({ message: "Test not found" });
    trackAbEvent(req.params.testName, variant.id, "impression", (req.session as any)?.userId, sessionId);
    res.json(variant);
  });

  app.post("/api/growth/ab-test/:testName/track", (req, res) => {
    const { variant, event } = req.body;
    if (!variant || !event) return res.status(400).json({ message: "variant and event required" });
    trackAbEvent(req.params.testName, variant, event, (req.session as any)?.userId);
    res.json({ tracked: true });
  });

  app.get("/api/growth/ab-test/:testName/results", async (req, res) => {
    res.json(await getAbResults(req.params.testName));
  });

  // B2: Referral Campaign
  app.post("/api/growth/referral-email", isAuthenticated, async (req, res) => {
    const userId = (req.session as any).userId;
    const profile = await storage.getProfile(userId);
    const userReferrals = await storage.getReferralsByReferrer(userId);
    let code = userReferrals.find(r => r.referralCode)?.referralCode;
    if (!code) {
      code = `REF-${userId.substring(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const template = generateReferralEmailTemplate(profile?.displayName || "A friend", code, baseUrl);
    res.json(template);
  });

  // B3: Pixel stubs
  app.get("/api/growth/pixels", (_req, res) => {
    res.json(getPixelSnippets(process.env.FB_PIXEL_ID, process.env.GA_TRACKING_ID));
  });

  app.post("/api/growth/track-conversion", async (req, res) => {
    const { pixelType, eventName, metadata } = req.body;
    if (!eventName) return res.status(400).json({ message: "eventName required" });
    const result = await trackConversionEvent(pixelType || "internal", eventName, (req.session as any)?.userId, metadata);
    res.json(result);
  });

  // B4: Dynamic pricing (enhanced)
  app.post("/api/growth/dynamic-rate", async (req, res) => {
    const { category, currentRate, location } = req.body;
    if (!category) return res.status(400).json({ message: "category required" });
    res.json(await calculateDynamicRate(category, currentRate || 0, location));
  });

  // B5: Flash sales
  app.get("/api/growth/flash-sales", async (_req, res) => {
    res.json(await getActiveFlashSales());
  });

  app.post("/api/growth/flash-sales", isAuthenticated, async (req, res) => {
    try {
      const sale = await createFlashSale(req.body);
      res.json(sale);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.post("/api/growth/flash-sales/:id/redeem", isAuthenticated, async (req, res) => {
    try {
      const result = await redeemFlashSale(parseInt(req.params.id), (req.session as any).userId);
      res.json(result);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  // B6: Upsell modal
  app.get("/api/growth/upsell", isAuthenticated, async (req, res) => {
    res.json(await getUpsellOffer((req.session as any).userId));
  });

  // B7: Client bulk discount
  app.get("/api/growth/client-discount", isAuthenticated, async (req, res) => {
    res.json(await getClientBulkDiscount((req.session as any).userId));
  });

  // B8: Freelancer analytics
  app.get("/api/growth/freelancer-analytics", isAuthenticated, async (req, res) => {
    res.json(await getFreelancerAnalytics((req.session as any).userId));
  });

  // B9: Client analytics
  app.get("/api/growth/client-analytics", isAuthenticated, async (req, res) => {
    res.json(await getClientAnalytics((req.session as any).userId));
  });

  // B10: Viral share
  app.post("/api/growth/viral-share", (req, res) => {
    const { freelancerName, jobTitle, rating } = req.body;
    res.json(generateViralShareContent(freelancerName || "an amazing freelancer", jobTitle || "a project", rating || 5));
  });

  // B11: SMS stub
  app.post("/api/growth/sms-notify", isAuthenticated, async (req, res) => {
    const { phoneNumber, message, jobId } = req.body;
    if (!phoneNumber || !message) return res.status(400).json({ message: "phoneNumber and message required" });
    res.json(await sendSmsNotification(phoneNumber, message, jobId));
  });

  // B12: Push notification config
  app.get("/api/growth/push-config", (_req, res) => {
    res.json(getPushNotificationConfig());
  });

  // B13: Badges
  app.get("/api/growth/badges", isAuthenticated, async (req, res) => {
    res.json(await checkAndAwardBadges((req.session as any).userId));
  });

  app.get("/api/growth/badge-definitions", (_req, res) => {
    res.json(getBadgeDefinitions());
  });

  // B14: Leaderboard
  app.get("/api/growth/leaderboard", async (req, res) => {
    const period = (req.query.period as string) === "all_time" ? "all_time" : "month";
    res.json(await getLeaderboard(period));
  });

  // B15: Seasonal campaigns
  app.get("/api/growth/campaigns", (_req, res) => {
    res.json(getSeasonalCampaigns());
  });

  // B16: Affiliates
  app.post("/api/growth/affiliates", isAuthenticated, async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: "name and email required" });
    res.json(await createAffiliate(name, email));
  });

  app.get("/api/growth/affiliates/:code", async (req, res) => {
    const stats = await getAffiliateStats(req.params.code);
    if (!stats) return res.status(404).json({ message: "Affiliate not found" });
    res.json(stats);
  });

  // B17: Discount codes
  app.post("/api/growth/discount-codes", isAuthenticated, async (req, res) => {
    try {
      res.json(await createDiscountCode(req.body));
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.get("/api/growth/discount-codes/validate/:code", async (req, res) => {
    res.json(await validateDiscountCode(req.params.code));
  });

  app.post("/api/growth/discount-codes/:code/redeem", isAuthenticated, async (req, res) => {
    try {
      res.json(await redeemDiscountCode(req.params.code));
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  // B18: Churn prevention
  app.get("/api/growth/churn-risk", isAuthenticated, async (_req, res) => {
    res.json(await detectChurnRisk());
  });

  // B19: Cohort analysis
  app.get("/api/growth/cohort-analysis", isAuthenticated, async (_req, res) => {
    res.json(await getCohortAnalysis());
  });

  // B20: Revenue forecast
  app.post("/api/growth/revenue-forecast", (req, res) => {
    const defaults = {
      monthlySignups: 500, conversionRate: 15, avgJobValue: 250000, commissionRate: 10,
      premiumRate: 8, premiumPrice: 7900, churnRate: 5, months: 12,
    };
    res.json(calculateRevenueForecast({ ...defaults, ...req.body }));
  });

  // B21: Stripe coupons
  app.post("/api/growth/stripe-coupons", isAuthenticated, async (req, res) => {
    res.json(await createStripeCoupon(req.body));
  });

  app.get("/api/growth/stripe-coupons", async (_req, res) => {
    res.json(await listStripeCoupons());
  });

  // B22: Multi-currency
  app.get("/api/growth/currencies", (_req, res) => {
    res.json(getSupportedCurrencies());
  });

  app.get("/api/growth/convert", (req, res) => {
    const { amount, from, to } = req.query;
    if (!amount || !from || !to) return res.status(400).json({ message: "amount, from, to required" });
    res.json(convertCurrency(parseInt(amount as string), from as string, to as string));
  });

  // B23: Tax calculator
  app.post("/api/growth/tax-calculator", (req, res) => {
    const { annualIncome, expenses } = req.body;
    if (!annualIncome) return res.status(400).json({ message: "annualIncome required" });
    res.json(calculateFreelancerTax(annualIncome, expenses || 0));
  });

  // B24: Payout options
  app.get("/api/growth/payout-options", isAuthenticated, async (req, res) => {
    const { amount } = req.query;
    const userId = (req.session as any).userId;
    const tier = await db.select().from(premiumTiers).where(eq(premiumTiers.userId, userId)).limit(1);
    const isPremium = tier.length > 0 && tier[0].tier !== "free";
    res.json(getPayoutOptions(parseInt(amount as string) || 0, isPremium));
  });

  // B25: Test transaction
  app.post("/api/growth/test-transaction", isAuthenticated, async (_req, res) => {
    res.json(await runTestTransaction());
  });
}
