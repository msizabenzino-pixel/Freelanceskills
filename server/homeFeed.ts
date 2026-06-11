// Personalised home feed (Command 13). Seven sections, each returning
// { items, sectionTitle, seeAllLink }. Real-data-only: order/review/view-driven
// sections honestly return [] until activity exists. Cache TTLs per spec.

import { db } from "./db";
import { servicePackages, profiles, users, bookings, gigViews, categoryViews, searchLog } from "@shared/schema";
import { and, eq, sql, desc, inArray, notInArray, or } from "drizzle-orm";
import { cache } from "./fortify";
import { mapGigCard, mapFreelancerCard } from "./discoveryShared";
import { evaluateProfileCompletion } from "./profileCompletion";

const gigCols = {
  id: servicePackages.id,
  title: servicePackages.title,
  description: servicePackages.description,
  category: servicePackages.category,
  price: servicePackages.price,
  duration: servicePackages.duration,
  bookingCount: servicePackages.bookingCount,
  viewCount: servicePackages.viewCount,
  conversionRate: servicePackages.conversionRate,
  createdAt: servicePackages.createdAt,
  freelancerId: servicePackages.freelancerId,
  location: profiles.location,
  bio: profiles.bio,
  rating: profiles.rating,
  completedJobs: profiles.completedJobs,
  isPro: profiles.isPro,
  kycStatus: profiles.kycStatus,
  photoUrl: profiles.photoUrl,
  skills: profiles.skills,
  profTitle: profiles.title,
  firstName: users.firstName,
  lastName: users.lastName,
} as const;

const flCols = {
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
} as const;

const ACTIVE = sql`${servicePackages.isActive} = true and ${servicePackages.deletedAt} is null`;

function gigQuery() {
  return db
    .select(gigCols)
    .from(servicePackages)
    .innerJoin(profiles, eq(servicePackages.freelancerId, profiles.userId))
    .leftJoin(users, eq(servicePackages.freelancerId, users.id));
}

// 1. popular-categories — top 12 categories by completed order volume (30d). Cache 1h.
export async function getPopularCategories() {
  const KEY = "home:popular-categories";
  const cached = cache.get<any>(KEY);
  if (cached) return cached;
  const rows = await db
    .select({ category: servicePackages.category, count: sql<number>`count(*)::int` })
    .from(bookings)
    .innerJoin(servicePackages, eq(bookings.servicePackageId, servicePackages.id))
    .where(sql`${bookings.status} = 'completed' and ${bookings.createdAt} >= now() - interval '30 days'`)
    .groupBy(servicePackages.category)
    .orderBy(desc(sql`count(*)`))
    .limit(12);
  const items = rows.filter((r) => r.category).map((r) => ({ category: r.category, count: r.count }));
  const out = { items, sectionTitle: "Popular Categories", seeAllLink: "/categories" };
  cache.set(KEY, out, 3600);
  return out;
}

// 2. recommended (auth) — last 5 viewed categories + last 3 searches, conversionRate DESC.
//    Fallback to top-rated gigs when there is no history / no match. No cache (user-specific).
export async function getRecommended(userId: string) {
  const catRows = await db
    .select({ c: categoryViews.category })
    .from(categoryViews)
    .where(eq(categoryViews.userId, userId))
    .orderBy(desc(categoryViews.createdAt))
    .limit(20);
  const cats = Array.from(new Set(catRows.map((r) => r.c).filter(Boolean))).slice(0, 5) as string[];

  const searchRows = await db
    .select({ q: searchLog.query })
    .from(searchLog)
    .where(eq(searchLog.userId, userId))
    .orderBy(desc(searchLog.createdAt))
    .limit(10);
  const terms = Array.from(new Set(searchRows.map((r) => (r.q || "").trim()).filter(Boolean))).slice(0, 3);

  let items: any[] = [];
  if (cats.length || terms.length) {
    const ors: any[] = [];
    if (cats.length) {
      // Exact match is the strong signal, but the browsed-category taxonomy
      // (e.g. "Skilled Trades") rarely equals the stored gig category token
      // (e.g. "trades"). Also token-match each category word (>=4 chars) as a
      // substring against category/title/description so real browses contribute.
      ors.push(inArray(servicePackages.category, cats));
      for (const c of cats) {
        for (const tok of c.split(/[^a-z0-9]+/i).filter((w) => w.length >= 4)) {
          const like = `%${tok}%`;
          ors.push(sql`(${servicePackages.category} ILIKE ${like} OR ${servicePackages.title} ILIKE ${like} OR ${servicePackages.description} ILIKE ${like})`);
        }
      }
    }
    for (const t of terms) {
      const like = `%${t}%`;
      ors.push(sql`(${servicePackages.title} ILIKE ${like} OR ${servicePackages.description} ILIKE ${like} OR ${servicePackages.category} ILIKE ${like})`);
    }
    const rows = await gigQuery()
      .where(and(ACTIVE, or(...ors)))
      .orderBy(desc(servicePackages.conversionRate), desc(servicePackages.bookingCount))
      .limit(12);
    items = rows.map(mapGigCard);
  }

  if (items.length === 0) {
    const rows = await gigQuery()
      .where(ACTIVE)
      .orderBy(desc(profiles.rating), desc(servicePackages.bookingCount))
      .limit(12);
    items = rows.map(mapGigCard);
  }

  return { items, sectionTitle: "Recommended For You", seeAllLink: "/search" };
}

// 3. top-rated-week — Top Performer gigs ranked by completed orders (7d). Cache 6h.
export async function getTopRatedWeek() {
  const KEY = "home:top-rated-week";
  const cached = cache.get<any>(KEY);
  if (cached) return cached;
  const gigs = await gigQuery()
    .where(and(ACTIVE, eq(profiles.topPerformer, true)))
    .limit(40);
  let items: any[] = [];
  if (gigs.length) {
    const ids = gigs.map((g) => g.id);
    const ordersAgg = await db
      .select({ gigId: bookings.servicePackageId, orders: sql<number>`count(*)::int` })
      .from(bookings)
      .where(and(inArray(bookings.servicePackageId, ids), sql`${bookings.status} = 'completed' and ${bookings.createdAt} >= now() - interval '7 days'`))
      .groupBy(bookings.servicePackageId);
    const oMap = new Map(ordersAgg.filter((o) => o.gigId).map((o) => [o.gigId, o.orders]));
    items = gigs
      .map((g) => ({ g, orders: oMap.get(g.id) || 0 }))
      .sort((a, b) => b.orders - a.orders || (b.g.bookingCount || 0) - (a.g.bookingCount || 0) || (b.g.rating || 0) - (a.g.rating || 0))
      .slice(0, 10)
      .map((x) => ({ ...mapGigCard(x.g), orders7d: x.orders }));
  }
  const out = { items, sectionTitle: "Top Rated This Week", seeAllLink: "/search?sort=top-rated" };
  cache.set(KEY, out, 21600);
  return out;
}

// 4. trades-near-me — Skilled Trades freelancers, Pro > TopPerformer > SkillsVerified.
//    No lat/lng on profiles, so distance is not computable: best-effort text filter. Cache 10m.
const TRADE_RE = "plumb|electric|carpent|paint|weld|mechanic|build|construct|artisan|handyman|tiler|plaster|roof|garden|landscap|locksmith|hvac|air[ -]?con|renovat|trade";
export async function getTradesNearMe(location?: string) {
  const KEY = `home:trades-near-me:${(location || "all").toLowerCase()}`;
  const cached = cache.get<any>(KEY);
  if (cached) return cached;
  const conds: any[] = [
    sql`${profiles.publishedProfile} = true and ${profiles.deletedAt} is null`,
    sql`(${profiles.category} ~* ${TRADE_RE} OR ${profiles.title} ~* ${TRADE_RE} OR array_to_string(coalesce(${profiles.skills}, '{}'), ' ') ~* ${TRADE_RE})`,
  ];
  if (location) conds.push(sql`${profiles.location} ILIKE ${`%${location}%`}`);
  const rows = await db.select(flCols).from(profiles).leftJoin(users, eq(profiles.userId, users.id)).where(and(...conds)).limit(60);
  const sorted = rows
    .sort(
      (a, b) =>
        Number(b.isPro) - Number(a.isPro) ||
        Number(b.topPerformer) - Number(a.topPerformer) ||
        Number(b.skillsVerified) - Number(a.skillsVerified) ||
        (b.rating || 0) - (a.rating || 0),
    )
    .slice(0, 10)
    .map(mapFreelancerCard);
  const out = { items: sorted, sectionTitle: "Skilled Trades Near You", seeAllLink: "/find-talent?category=trades" };
  cache.set(KEY, out, 600);
  return out;
}

// 5. new-verified — joined < 90d, identityVerified, profile completion >= 60%, by completion DESC. Cache 1h.
export async function getNewVerified() {
  const KEY = "home:new-verified";
  const cached = cache.get<any>(KEY);
  if (cached) return cached;
  const rows = await db
    .select(flCols)
    .from(profiles)
    .leftJoin(users, eq(profiles.userId, users.id))
    .where(sql`${profiles.identityVerified} = true and ${profiles.publishedProfile} = true and ${profiles.deletedAt} is null and ${profiles.createdAt} >= now() - interval '90 days'`)
    .limit(60);
  const items = rows
    .map((r) => ({ r, score: evaluateProfileCompletion(r).score }))
    .filter((x) => x.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((x) => mapFreelancerCard(x.r));
  const out = { items, sectionTitle: "New & Verified Talent", seeAllLink: "/find-talent?filter=new-verified" };
  cache.set(KEY, out, 3600);
  return out;
}

// 6. recently-viewed (auth) — last 8 viewed gigs + 4 similar (same categories). No cache.
export async function getRecentlyViewed(userId: string) {
  const vids = await db
    .select({ gigId: gigViews.gigId, last: sql<string>`max(${gigViews.createdAt})` })
    .from(gigViews)
    .where(eq(gigViews.userId, userId))
    .groupBy(gigViews.gigId)
    .orderBy(desc(sql`max(${gigViews.createdAt})`))
    .limit(8);
  const ids = vids.map((v) => v.gigId);

  let viewedItems: any[] = [];
  if (ids.length) {
    const rows = await gigQuery().where(and(inArray(servicePackages.id, ids), ACTIVE));
    const byId = new Map(rows.map((r) => [r.id, r]));
    viewedItems = ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((r) => ({ ...mapGigCard(r), viewed: true }));
  }

  let similar: any[] = [];
  const cats = Array.from(new Set(viewedItems.map((v) => v.category).filter(Boolean))) as string[];
  if (cats.length) {
    const rows = await gigQuery()
      .where(and(inArray(servicePackages.category, cats), ACTIVE, ids.length ? notInArray(servicePackages.id, ids) : sql`true`))
      .orderBy(desc(servicePackages.bookingCount))
      .limit(4);
    similar = rows.map((r) => ({ ...mapGigCard(r), viewed: false }));
  }

  return { items: [...viewedItems, ...similar], sectionTitle: "Continue Where You Left Off", seeAllLink: "/explore" };
}

// 7. trending-sa — gigs with highest (views + orders*3) over 7d, SA filter. Cache 3h.
export async function getTrendingSa() {
  const KEY = "home:trending-sa";
  const cached = cache.get<any>(KEY);
  if (cached) return cached;
  const gigs = await gigQuery()
    .where(and(ACTIVE, sql`(${profiles.country} is null or ${profiles.country} ILIKE 'za%' or ${profiles.country} ILIKE '%south africa%' or ${profiles.location} ILIKE '%south africa%')`))
    .limit(200);
  let items: any[] = [];
  if (gigs.length) {
    const ids = gigs.map((g) => g.id);
    const viewsAgg = await db
      .select({ gigId: gigViews.gigId, v: sql<number>`count(*)::int` })
      .from(gigViews)
      .where(and(inArray(gigViews.gigId, ids), sql`${gigViews.createdAt} >= now() - interval '7 days'`))
      .groupBy(gigViews.gigId);
    const ordersAgg = await db
      .select({ gigId: bookings.servicePackageId, o: sql<number>`count(*)::int` })
      .from(bookings)
      .where(and(inArray(bookings.servicePackageId, ids), sql`${bookings.status} = 'completed' and ${bookings.createdAt} >= now() - interval '7 days'`))
      .groupBy(bookings.servicePackageId);
    const vMap = new Map(viewsAgg.map((x) => [x.gigId, x.v]));
    const oMap = new Map(ordersAgg.filter((x) => x.gigId).map((x) => [x.gigId, x.o]));
    items = gigs
      .map((g) => ({ g, score: (vMap.get(g.id) || 0) + (oMap.get(g.id) || 0) * 3 }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((x) => ({ ...mapGigCard(x.g), trendScore: x.score }));
  }
  const out = { items, sectionTitle: "Trending in South Africa", seeAllLink: "/search?trending=sa" };
  cache.set(KEY, out, 10800);
  return out;
}
