// Activity tracking engine (Command 15).
// trackEvent() is fire-and-forget; all writes derive trusted fields server-side
// and dedupe to protect the ranking metrics from poisoning.

import { db } from "./db";
import {
  gigViews,
  searchLog,
  savedGigs,
  categoryViews,
  servicePackages,
  bookings,
} from "@shared/schema";
import { and, eq, sql, isNull } from "drizzle-orm";

// Fire-and-forget: never blocks the request, never throws into the handler.
export function trackEvent(fn: () => Promise<void>): void {
  setImmediate(() => {
    fn().catch((err) => console.error("[trackEvent]", (err as Error).message));
  });
}

// gig_viewed: derive sellerId/category from the gig record (never trust client),
// dedupe per (userId|sessionId, gigId) within 24h, then atomically bump viewCount.
export async function recordGigView(opts: {
  gigId: string;
  userId?: string | null;
  sessionId?: string | null;
}): Promise<void> {
  const gigId = opts.gigId;
  const userId = opts.userId || null;
  const sessionId = opts.sessionId || null;
  if (!gigId) return;

  const [gig] = await db
    .select({ sellerId: servicePackages.freelancerId, category: servicePackages.category })
    .from(servicePackages)
    .where(eq(servicePackages.id, gigId))
    .limit(1);
  if (!gig) return; // unknown gig — ignore

  const dedupeCond = userId
    ? and(
        eq(gigViews.gigId, gigId),
        eq(gigViews.userId, userId),
        sql`${gigViews.createdAt} >= now() - interval '24 hours'`,
      )
    : sessionId
      ? and(
          eq(gigViews.gigId, gigId),
          eq(gigViews.sessionId, sessionId),
          sql`${gigViews.createdAt} >= now() - interval '24 hours'`,
        )
      : null;

  if (dedupeCond) {
    const [existing] = await db.select({ id: gigViews.id }).from(gigViews).where(dedupeCond).limit(1);
    if (existing) return; // already counted recently
  }

  await db.insert(gigViews).values({ gigId, sellerId: gig.sellerId, category: gig.category, userId, sessionId });
  await db
    .update(servicePackages)
    .set({ viewCount: sql`${servicePackages.viewCount} + 1` })
    .where(eq(servicePackages.id, gigId));
}

// search_performed
export async function recordSearch(opts: {
  query?: string | null;
  category?: string | null;
  resultsCount?: number;
  userId?: string | null;
  sessionId?: string | null;
}): Promise<void> {
  await db.insert(searchLog).values({
    query: opts.query || null,
    category: opts.category || null,
    resultsCount: opts.resultsCount ?? 0,
    userId: opts.userId || null,
    sessionId: opts.sessionId || null,
  });
}

// category_browsed
export async function recordCategoryView(opts: {
  category: string;
  subcategory?: string | null;
  userId?: string | null;
  sessionId?: string | null;
}): Promise<void> {
  if (!opts.category) return;
  await db.insert(categoryViews).values({
    category: opts.category,
    subcategory: opts.subcategory || null,
    userId: opts.userId || null,
    sessionId: opts.sessionId || null,
  });
}

// gig_saved toggle — returns the resulting saved state (true = now saved).
export async function toggleSavedGig(opts: { gigId: string; userId: string }): Promise<boolean> {
  const [existing] = await db
    .select({ id: savedGigs.id })
    .from(savedGigs)
    .where(and(eq(savedGigs.userId, opts.userId), eq(savedGigs.gigId, opts.gigId)))
    .limit(1);
  if (existing) {
    await db.delete(savedGigs).where(eq(savedGigs.id, existing.id));
    return false;
  }
  await db.insert(savedGigs).values({ gigId: opts.gigId, userId: opts.userId });
  return true;
}

// On login, claim anonymous activity recorded under the pre-auth sessionId.
// No session.regenerate in the auth flow, so the sessionID persists across login.
export async function mergeSessionActivity(
  sessionId: string | undefined | null,
  userId: string,
): Promise<void> {
  if (!sessionId || !userId) return;
  try {
    await db.update(gigViews).set({ userId }).where(and(eq(gigViews.sessionId, sessionId), isNull(gigViews.userId)));
    await db.update(searchLog).set({ userId }).where(and(eq(searchLog.sessionId, sessionId), isNull(searchLog.userId)));
    await db.update(categoryViews).set({ userId }).where(and(eq(categoryViews.sessionId, sessionId), isNull(categoryViews.userId)));
  } catch (err) {
    console.error("[mergeSessionActivity]", (err as Error).message);
  }
}

// Cron (every 6h): per-gig conversionRate = completed orders 90d / views 90d,
// requiring >= 10 views, else 0.0. Stored on the gig record.
export async function recomputeGigConversionRates(): Promise<{ updated: number }> {
  const viewsAgg = await db
    .select({ gigId: gigViews.gigId, views: sql<number>`count(*)::int` })
    .from(gigViews)
    .where(sql`${gigViews.createdAt} >= now() - interval '90 days'`)
    .groupBy(gigViews.gigId);

  const ordersAgg = await db
    .select({ gigId: bookings.servicePackageId, orders: sql<number>`count(*)::int` })
    .from(bookings)
    .where(sql`${bookings.status} = 'completed' and ${bookings.createdAt} >= now() - interval '90 days'`)
    .groupBy(bookings.servicePackageId);

  const ordersMap = new Map<string, number>();
  for (const o of ordersAgg) if (o.gigId) ordersMap.set(o.gigId, o.orders);

  let updated = 0;
  for (const v of viewsAgg) {
    const views = v.views || 0;
    const orders = ordersMap.get(v.gigId) || 0;
    const rate = views >= 10 ? orders / views : 0;
    await db.update(servicePackages).set({ conversionRate: rate }).where(eq(servicePackages.id, v.gigId));
    updated++;
  }
  return { updated };
}
