// Client-side activity tracking (Command 15). All calls are fire-and-forget:
// they never throw and never block the UI. The server derives the trusted
// fields (userId/sessionId) and writes to gig_views / search_log /
// saved_gigs / category_views.

import { apiFetch } from "@/lib/api";

function fire(url: string, body: unknown): void {
  try {
    void apiFetch(url, { method: "POST", json: body }).catch(() => {});
  } catch {
    /* never let tracking break a page */
  }
}

export function trackGigView(gigId: string): void {
  if (!gigId) return;
  fire("/api/track/gig-view", { gigId });
}

export function trackSearch(query: string, category?: string, resultsCount?: number): void {
  if (!query && !category) return;
  fire("/api/track/search", { query: query || "", category: category || "", resultsCount: resultsCount ?? 0 });
}

export function trackCategory(category: string, subcategory?: string): void {
  if (!category) return;
  fire("/api/track/category", { category, subcategory: subcategory || "" });
}

// Toggle a saved gig. Returns the new saved state (best-effort; false on failure).
export async function toggleSaveGig(gigId: string): Promise<boolean> {
  if (!gigId) return false;
  try {
    const res = await apiFetch(`/api/gigs/${gigId}/save`, { method: "POST", json: {} });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => ({}))) as { saved?: boolean };
    return Boolean(data?.saved);
  } catch {
    return false;
  }
}
