import type { GigCardData } from "@/components/GigCard";

/**
 * Maps a /api/services/search (or /api/services/:id) payload row into GigCardData.
 * NOTE: DB stores `price` in whole Rand, while GigCard divides priceCents/100 —
 * so we multiply by 100 here to render the true Rand amount (never rounded).
 */
export function serviceToGigCard(s: any): GigCardData {
  const tier: 0 | 1 | 2 | 3 = s.verified ? (s.isPro ? 2 : 1) : 0;
  return {
    id: s.id,
    title: s.title,
    thumbnail: s.thumbnail || "",
    sellerName: s.taskerName || "Freelancer",
    sellerAvatar: s.photoUrl || "",
    sellerLevel: "",
    verificationTier: tier,
    isProVerified: !!s.isPro,
    isPromoted: !!s.isPromoted,
    rating: typeof s.rating === "number" ? s.rating : 0,
    reviewCount: typeof s.reviewCount === "number" ? s.reviewCount : 0,
    priceCents: Math.round((Number(s.priceFrom) || 0) * 100),
  };
}

export function deslugify(slug: string): string {
  return (slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
