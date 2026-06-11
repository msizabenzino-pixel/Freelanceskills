// Freelancer search ranking (Command 12).
// rankFreelancers() scores a candidate set; searchFreelancersRanked() bounds the
// candidate set in SQL, computes signals with a fixed number of batch queries,
// scores the FULL set in memory, then paginates.
//
// Score = relevance*0.30 + conversionRate*0.25 + sellerSuccessScore*0.20
//       + reviewScore*0.10 + reviewRecency*0.08 + locationMatch*0.07
// New Seller Protection: joined<90d AND <5 completed orders -> +0.15 and listed
// separately in newAndVerified (additionally requires identityVerified).

import { db } from "./db";
import { profiles, users, bookings, gigViews, reviews } from "@shared/schema";
import { and, eq, sql, inArray, isNull } from "drizzle-orm";
import { evaluateProfileCompletion } from "./profileCompletion";
import { mapFreelancerCard } from "./discoveryShared";

// Best-effort SA province grouping for locationMatch (profiles have no lat/lng).
const SA_PROVINCE_CITIES: Record<string, string[]> = {
  gauteng: ["johannesburg", "joburg", "jhb", "pretoria", "sandton", "midrand", "centurion", "soweto", "tshwane", "ekurhuleni", "benoni", "kempton park", "randburg", "roodepoort"],
  "western cape": ["cape town", "capetown", "cpt", "stellenbosch", "paarl", "george", "somerset west", "bellville", "constantia"],
  "kwazulu-natal": ["durban", "dbn", "pietermaritzburg", "umhlanga", "ballito", "newcastle", "richards bay"],
  "eastern cape": ["gqeberha", "port elizabeth", "east london", "mthatha", "makhanda", "grahamstown"],
  "free state": ["bloemfontein", "welkom", "bethlehem", "sasolburg"],
  limpopo: ["polokwane", "tzaneen", "thohoyandou", "mokopane"],
  mpumalanga: ["nelspruit", "mbombela", "witbank", "emalahleni", "secunda"],
  "north west": ["rustenburg", "mahikeng", "potchefstroom", "klerksdorp"],
  "northern cape": ["kimberley", "upington", "springbok"],
};

function provinceOf(loc: string): string | null {
  for (const [prov, cities] of Object.entries(SA_PROVINCE_CITIES)) {
    if (loc.includes(prov)) return prov;
    for (const c of cities) if (loc.includes(c)) return prov;
  }
  return null;
}

function locationMatch(pLoc: string | null | undefined, qLoc: string): number {
  if (!qLoc) return 0;
  const p = (pLoc || "").toLowerCase().trim();
  const q = qLoc.toLowerCase().trim();
  if (!p || !q) return 0;
  if (p.includes(q) || q.includes(p)) return 1.0;
  const pp = provinceOf(p);
  const qp = provinceOf(q);
  if (pp && qp && pp === qp) return 0.5;
  return 0;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// TF-IDF-lite relevance normalised to 0..1 across the candidate set.
function computeRelevance(docs: string[], q: string): number[] {
  if (!q || !q.trim()) return docs.map(() => 0);
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return docs.map(() => 0);
  const N = docs.length;
  const idf = terms.map((t) => {
    const df = docs.filter((d) => d.includes(t)).length;
    return Math.log((N + 1) / (df + 1)) + 1;
  });
  const raw = docs.map((d) =>
    terms.reduce((s, t, i) => {
      const tf = (d.match(new RegExp(`\\b${escapeRegex(t)}`, "g")) || []).length;
      return s + tf * idf[i];
    }, 0),
  );
  const max = Math.max(0, ...raw);
  return raw.map((r) => (max > 0 ? r / max : 0));
}

export interface SearchParams {
  q?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerLevel?: string;
  deliveryDays?: number;
  page?: number;
  limit?: number;
}

const ARR = sql`array_to_string(coalesce(${profiles.skills}, '{}'), ' ')`;

export async function searchFreelancersRanked(params: SearchParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));
  const q = (params.q || "").trim();

  const conds: any[] = [eq(profiles.publishedProfile, true), isNull(profiles.deletedAt)];
  if (q) {
    const like = `%${q}%`;
    conds.push(sql`(${profiles.title} ILIKE ${like} OR ${profiles.bio} ILIKE ${like} OR ${profiles.category} ILIKE ${like} OR ${ARR} ILIKE ${like})`);
  }
  if (params.category && params.category !== "all") {
    const c = `%${params.category}%`;
    conds.push(sql`(${profiles.category} ILIKE ${c} OR ${ARR} ILIKE ${c})`);
  }
  if (params.subcategory) {
    const s = `%${params.subcategory}%`;
    conds.push(sql`(${profiles.title} ILIKE ${s} OR ${profiles.category} ILIKE ${s} OR ${ARR} ILIKE ${s})`);
  }
  if (params.location) {
    const l = `%${params.location}%`;
    conds.push(sql`${profiles.location} ILIKE ${l}`);
  }
  if (typeof params.minPrice === "number" && !isNaN(params.minPrice)) {
    conds.push(sql`${profiles.hourlyRate} >= ${Math.round(params.minPrice * 100)}`);
  }
  if (typeof params.maxPrice === "number" && !isNaN(params.maxPrice)) {
    conds.push(sql`${profiles.hourlyRate} <= ${Math.round(params.maxPrice * 100)}`);
  }
  if (params.sellerLevel) {
    const lv = params.sellerLevel.toLowerCase();
    if (lv.includes("pro")) conds.push(eq(profiles.isPro, true));
    else if (lv.includes("top")) conds.push(eq(profiles.topPerformer, true));
    else if (lv.includes("verif")) conds.push(eq(profiles.identityVerified, true));
  }
  // deliveryDays: no freelancer-level field exists (gig-level concept) — accepted but not filtered.

  const candidates = await db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      title: profiles.title,
      bio: profiles.bio,
      skills: profiles.skills,
      hourlyRate: profiles.hourlyRate,
      location: profiles.location,
      isPro: profiles.isPro,
      isProVerified: profiles.isProVerified,
      rating: profiles.rating,
      completedJobs: profiles.completedJobs,
      responseRate: profiles.responseRate,
      identityVerified: profiles.identityVerified,
      skillsVerified: profiles.skillsVerified,
      topPerformer: profiles.topPerformer,
      verificationTier: profiles.verificationTier,
      onTimeDeliveryRate: profiles.onTimeDeliveryRate,
      category: profiles.category,
      country: profiles.country,
      photoUrl: profiles.photoUrl,
      availableNow: profiles.availableNow,
      publishedProfile: profiles.publishedProfile,
      createdAt: profiles.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(profiles)
    .leftJoin(users, eq(profiles.userId, users.id))
    .where(and(...conds))
    .limit(500);

  // Exact completion gate (>= 60 == >= 5 of 7 checks).
  const eligible = candidates.filter((c) => evaluateProfileCompletion(c).score >= 60);
  if (eligible.length === 0) {
    return { results: [], promotedSlots: [], newAndVerified: [], total: 0, page, hasMore: false };
  }

  const ids = eligible.map((c) => c.userId);
  const bookingAgg = await db
    .select({
      freelancerId: bookings.freelancerId,
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${bookings.status} = 'completed')::int`,
      orders90d: sql<number>`count(*) filter (where ${bookings.status} = 'completed' and ${bookings.createdAt} >= now() - interval '90 days')::int`,
    })
    .from(bookings)
    .where(inArray(bookings.freelancerId, ids))
    .groupBy(bookings.freelancerId);
  const viewAgg = await db
    .select({
      sellerId: gigViews.sellerId,
      views90d: sql<number>`count(*) filter (where ${gigViews.createdAt} >= now() - interval '90 days')::int`,
    })
    .from(gigViews)
    .where(inArray(gigViews.sellerId, ids))
    .groupBy(gigViews.sellerId);
  const reviewAgg = await db
    .select({
      revieweeId: reviews.revieweeId,
      lastReviewAt: sql<string>`max(${reviews.createdAt})`,
    })
    .from(reviews)
    .where(inArray(reviews.revieweeId, ids))
    .groupBy(reviews.revieweeId);

  const bMap = new Map(bookingAgg.map((b) => [b.freelancerId, b]));
  const vMap = new Map(viewAgg.map((v) => [v.sellerId, v]));
  const rMap = new Map(reviewAgg.map((r) => [r.revieweeId, r]));

  const docs = eligible.map((c) =>
    `${c.title || ""} ${c.bio || ""} ${(c.skills || []).join(" ")} ${c.category || ""}`.toLowerCase(),
  );
  const relevance = computeRelevance(docs, q);

  const now = Date.now();
  const scored = eligible.map((c, i) => {
    const b = bMap.get(c.userId);
    const v = vMap.get(c.userId);
    const r = rMap.get(c.userId);
    const total = b?.total || 0;
    const completed = b?.completed || 0;
    const orders90d = b?.orders90d || 0;
    const views90d = v?.views90d || 0;

    const completionRate = total > 0 ? completed / total : 0;
    const onTimeRate = (c.onTimeDeliveryRate ?? 0) / 100;
    const avgRating01 = (c.rating ?? 0) / 500;
    const responseRate01 = (c.responseRate ?? 0) / 100;
    const sellerSuccess = (completionRate + onTimeRate + avgRating01 + responseRate01) / 4;
    const conversionRate = views90d >= 10 ? orders90d / views90d : 0;
    const reviewScore = (c.rating ?? 0) / 500;
    let reviewRecency = 0;
    if (r?.lastReviewAt) {
      const days = (now - new Date(r.lastReviewAt).getTime()) / 86400000;
      reviewRecency = days <= 30 ? 1.0 : days <= 90 ? 0.7 : 0.3;
    }
    const locMatch = params.location ? locationMatch(c.location, params.location) : 0;

    let score =
      relevance[i] * 0.3 +
      conversionRate * 0.25 +
      sellerSuccess * 0.2 +
      reviewScore * 0.1 +
      reviewRecency * 0.08 +
      locMatch * 0.07;

    const joinedDays = c.createdAt ? (now - new Date(c.createdAt as any).getTime()) / 86400000 : 9999;
    const isNewSeller = joinedDays < 90 && completed < 5;
    if (isNewSeller) score += 0.15;

    return {
      card: {
        ...mapFreelancerCard(c),
        score: Math.round(score * 1000) / 1000,
        isNewSeller,
        conversionRate: Math.round(conversionRate * 1000) / 1000,
      },
      score,
      isNewSeller,
      identityVerified: !!c.identityVerified,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const total = scored.length;
  const offset = (page - 1) * limit;
  const results = scored.slice(offset, offset + limit).map((s) => s.card);
  const newAndVerified = scored
    .filter((s) => s.isNewSeller && s.identityVerified)
    .slice(0, 8)
    .map((s) => s.card);

  return { results, promotedSlots: [], newAndVerified, total, page, hasMore: offset + limit < total };
}
