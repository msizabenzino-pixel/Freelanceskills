import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useMemo, useState } from "react";
import {
  Star,
  Clock,
  ArrowLeft,
  Search as SearchIcon,
  ShieldCheck,
  MapPin,
  Bookmark,
  CheckCircle2,
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface PortfolioItem {
  title?: string;
  imageUrl?: string;
  image?: string;
  url?: string;
}

interface Pkg {
  id: string;
  title: string;
  price: number;
  duration?: number | string;
  description?: string;
}

function formatZar(rand: number): string {
  return (Number(rand) || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function GigDetail() {
  const [location] = useLocation();
  const id = location.split("/gig/")[1]?.split("/")[0] || "";
  const [saved, setSaved] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);

  const { data: gig, isLoading } = useQuery<any>({
    queryKey: ["/api/services", id],
    queryFn: async () => {
      const res = await fetch(`/api/services/${id}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id,
  });

  const { data: freelancerPackages } = useQuery<Pkg[]>({
    queryKey: ["/api/freelancers", gig?.taskerId, "packages"],
    queryFn: async () => {
      const res = await fetch(`/api/freelancers/${gig.taskerId}/packages`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!gig?.taskerId,
  });

  // Real packages only — this gig first, then any other packages from the seller.
  const packages: Pkg[] = useMemo(() => {
    if (!gig) return [];
    const self: Pkg = {
      id: gig.id,
      title: gig.title,
      price: gig.priceFrom,
      duration: gig.duration,
      description: gig.description,
    };
    const others = (freelancerPackages || []).filter((p) => p.id !== gig.id);
    return [self, ...others];
  }, [gig, freelancerPackages]);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  const reviews: Review[] = useMemo(() => {
    const list = [...((gig?.reviews as Review[]) || [])];
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [gig]);

  const ratingBreakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0 => 1 star ... index 4 => 5 star
    for (const r of reviews) {
      const star = Math.round(r.rating);
      if (star >= 1 && star <= 5) counts[star - 1]++;
    }
    return counts;
  }, [reviews]);

  const portfolio: PortfolioItem[] = Array.isArray(gig?.portfolioProjects) ? gig.portfolioProjects : [];

  if (isLoading) return <GigDetailSkeleton />;
  if (!gig) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-slate-400">
        <div className="text-center">
          <p className="mb-2">Gig not found</p>
          <Link href="/search" className="text-emerald-400 text-sm underline" data-testid="link-browse">
            Browse all gigs
          </Link>
        </div>
      </div>
    );
  }

  const hireHref = (pkg: Pkg) => {
    const qs = new URLSearchParams({
      serviceId: pkg.id,
      title: pkg.title || "",
      freelancer: gig.taskerName || "Freelancer",
      price: String(Math.round((Number(pkg.price) || 0) * 100)),
      duration: pkg.duration != null ? String(pkg.duration) : "",
      location: gig.location || "",
      rating: String(gig.rating || 0),
      reviews: String(reviews.length),
    });
    return `/hire/${pkg.id}/configure?${qs.toString()}`;
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0D1117] text-white" data-testid="page-gig-detail">
      {/* Header: back | search */}
      <header className="sticky top-0 z-30 bg-[#0D1117]/95 backdrop-blur border-b border-[#1F2937]">
        <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
          <Link href="/search" className="p-1 -ml-1 text-white" data-testid="button-back" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/search" className="p-1 text-white" data-testid="link-search" aria-label="Search">
            <SearchIcon className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-32">
        {/* Seller block */}
        <section className="flex items-start gap-4 pt-5">
          <div className="w-20 h-20 rounded-full bg-[#1F2937] overflow-hidden flex-shrink-0">
            {gig.photoUrl ? (
              <img src={gig.photoUrl} alt={gig.taskerName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-slate-500">
                {(gig.taskerName || "F").charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white" data-testid="text-seller-name">
                {gig.taskerName}
              </h2>
              {gig.verified && (
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold" data-testid="badge-verified">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
              {gig.isPro && (
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-emerald-500 text-white text-[10px] font-bold">
                  PRO
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                <span className="text-white font-semibold">{(gig.rating || 0).toFixed(1)}</span>
                <span className="text-slate-500">({reviews.length})</span>
              </span>
              {gig.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {gig.location}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Title */}
        <h1 className="text-xl font-bold text-white mt-5" data-testid="text-gig-title">
          {gig.title}
        </h1>

        {/* Portfolio peek scroll (real data only) */}
        {portfolio.length > 0 && (
          <section className="mt-5">
            <h3 className="text-sm font-semibold text-white mb-3">Portfolio</h3>
            <div className="flex gap-3 overflow-x-auto pr-0 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
              {portfolio.map((p, i) => {
                const img = p.imageUrl || p.image || (typeof p === "string" ? (p as string) : "");
                return (
                  <a
                    key={i}
                    href={p.url || img || "#"}
                    target={p.url ? "_blank" : undefined}
                    rel="noreferrer"
                    className="flex-shrink-0 w-[70%] max-w-[260px] rounded-xl overflow-hidden border border-[#1F2937] bg-[#1F2937]"
                    style={{ scrollSnapAlign: "start" }}
                    data-testid={`portfolio-item-${i}`}
                  >
                    {img ? (
                      <img src={img} alt={p.title || `Project ${i + 1}`} className="w-full aspect-video object-cover" />
                    ) : (
                      <div className="w-full aspect-video flex items-center justify-center text-slate-500 text-sm">
                        {p.title || "Project"}
                      </div>
                    )}
                    {p.title && <p className="px-3 py-2 text-xs text-slate-300 truncate">{p.title}</p>}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Package panel — real packages (tabs only when seller has multiple) */}
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-white mb-3">Package</h3>
          {packages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pr-0 mb-3" style={{ scrollbarWidth: "none" }}>
              {packages.map((p) => {
                const active = (selectedPkg?.id || packages[0].id) === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPkgId(p.id)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      active ? "bg-emerald-600 border-emerald-600 text-white" : "bg-transparent border-[#374151] text-slate-300"
                    }`}
                    data-testid={`pkg-tab-${p.id}`}
                  >
                    {p.title.length > 22 ? p.title.slice(0, 22) + "…" : p.title}
                  </button>
                );
              })}
            </div>
          )}
          <div className="rounded-xl border border-[#1F2937] bg-[#161B22] p-4" data-testid="package-panel">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">ZAR {formatZar(selectedPkg?.price ?? gig.priceFrom)}</span>
              {selectedPkg?.duration != null && selectedPkg.duration !== "" && (
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  {typeof selectedPkg.duration === "number" ? `${selectedPkg.duration} days` : selectedPkg.duration}
                </span>
              )}
            </div>
            {selectedPkg?.description && (
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">{selectedPkg.description}</p>
            )}
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Escrow-protected payment
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {gig.completedJobs || 0} jobs completed
              </div>
            </div>
          </div>
        </section>

        {/* About / bio — collapsible to 3 lines */}
        {gig.bio && (
          <section className="mt-6">
            <h3 className="text-sm font-semibold text-white mb-2">About this seller</h3>
            <p className={`text-sm text-slate-400 leading-relaxed ${bioExpanded ? "" : "line-clamp-3"}`} data-testid="text-bio">
              {gig.bio}
            </p>
            <button
              onClick={() => setBioExpanded((v) => !v)}
              className="text-emerald-400 text-sm font-semibold mt-1"
              data-testid="button-toggle-bio"
            >
              {bioExpanded ? "Show less" : "Read more"}
            </button>
          </section>
        )}

        {/* Skills chips */}
        {Array.isArray(gig.skills) && gig.skills.length > 0 && (
          <section className="mt-6">
            <h3 className="text-sm font-semibold text-white mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {gig.skills.map((s: string, i: number) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: "#1F2937", color: "#10b981", border: "1px solid #10b981" }}
                  data-testid={`chip-skill-${i}`}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Reviews — breakdown + latest 5 + see all */}
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-white mb-3">Reviews ({reviews.length})</h3>
          {reviews.length > 0 ? (
            <>
              {/* 5-star breakdown */}
              <div className="rounded-xl border border-[#1F2937] bg-[#161B22] p-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{(gig.rating || 0).toFixed(1)}</div>
                    <div className="flex justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className="w-3.5 h-3.5 text-amber-400"
                          fill={n <= Math.round(gig.rating || 0) ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{reviews.length} reviews</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingBreakdown[star - 1];
                      const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-3">{star}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Latest reviews */}
              <div className="space-y-4">
                {visibleReviews.map((r, i) => (
                  <div key={r.id || i} className="border-b border-[#1F2937] pb-4 last:border-0" data-testid={`review-${i}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className="w-3.5 h-3.5 text-amber-400" fill={n <= r.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{r.comment}</p>
                  </div>
                ))}
              </div>

              {reviews.length > 5 && (
                <button
                  onClick={() => setShowAllReviews((v) => !v)}
                  className="mt-3 w-full py-2.5 rounded-lg border border-[#374151] text-sm font-semibold text-white"
                  data-testid="button-see-all-reviews"
                >
                  {showAllReviews ? "Show fewer reviews" : `See all ${reviews.length} reviews`}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">No reviews yet. Be the first to book!</p>
          )}
        </section>
      </main>

      {/* Sticky Hire Now bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#1F2937] bg-[#0D1117]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        data-testid="hire-bar"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-500">From</div>
            <div className="text-lg font-black text-white truncate">ZAR {formatZar(selectedPkg?.price ?? gig.priceFrom)}</div>
          </div>
          <button
            onClick={() => setSaved((v) => !v)}
            className="p-2.5 rounded-lg border border-[#374151]"
            data-testid="button-save-gig"
            aria-label="Save"
          >
            <Bookmark className={`w-5 h-5 ${saved ? "text-emerald-400 fill-current" : "text-slate-400"}`} />
          </button>
          <Link
            href={hireHref(selectedPkg || packages[0])}
            className="flex-1 text-center px-5 py-3 rounded-lg font-bold text-white"
            style={{ background: "#10b981" }}
            data-testid="button-hire-now"
          >
            Hire Now
          </Link>
        </div>
      </div>
    </div>
  );
}

function GigDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="h-14 border-b border-[#1F2937]" />
      <div className="max-w-2xl mx-auto px-4 pt-5 animate-pulse">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-full bg-[#1F2937]" />
          <div className="flex-1 space-y-2 pt-2">
            <div className="h-5 w-40 bg-[#1F2937] rounded" />
            <div className="h-4 w-28 bg-[#1F2937] rounded" />
          </div>
        </div>
        <div className="h-6 w-3/4 bg-[#1F2937] rounded mt-6" />
        <div className="h-40 w-full bg-[#1F2937] rounded-xl mt-6" />
        <div className="h-24 w-full bg-[#1F2937] rounded-xl mt-6" />
      </div>
    </div>
  );
}
