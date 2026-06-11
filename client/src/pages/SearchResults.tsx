import { useMemo, useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trackCategory } from "@/lib/track";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { GigCard, GigCardSkeleton } from "@/components/GigCard";
import { serviceToGigCard, deslugify } from "@/lib/gigMappers";

type SortKey = "sellerLevel" | "deliveryTime" | "budget" | "location" | "rating";

const FILTER_PILLS: { key: SortKey; label: string }[] = [
  { key: "sellerLevel", label: "Seller Level" },
  { key: "deliveryTime", label: "Delivery Time" },
  { key: "budget", label: "Budget" },
  { key: "location", label: "Location" },
  { key: "rating", label: "Rating" },
];

export default function SearchResults() {
  const params = useParams<{ cat: string; subcat: string }>();
  const [, navigate] = useLocation();
  const cat = params.cat || "";
  const subcat = params.subcat || "";
  const title = deslugify(subcat) || deslugify(cat);

  useEffect(() => {
    // Log human-readable names (not URL slugs) for Recommended-feed matching.
    if (cat) trackCategory(deslugify(cat), deslugify(subcat));
  }, [cat, subcat]);

  const [activeSort, setActiveSort] = useState<SortKey | null>(null);
  const [activeSubType, setActiveSubType] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ services: any[]; total: number }>({
    queryKey: ["/api/services/search", "category", subcat || cat],
    queryFn: async () => {
      const term = deslugify(subcat) || deslugify(cat);
      const res = await fetch(`/api/services/search?q=${encodeURIComponent(term)}`, { credentials: "include" });
      if (!res.ok) return { services: [], total: 0 };
      return res.json();
    },
  });

  const allServices = data?.services || [];

  // Sub-type tiles derived from REAL distinct categories present in the results
  const subTypes = useMemo(() => {
    const set = new Map<string, number>();
    for (const s of allServices) {
      const c = (s.category || "").trim();
      if (c) set.set(c, (set.get(c) || 0) + 1);
    }
    return Array.from(set.entries()).sort((a, b) => b[1] - a[1]).map(([c]) => c);
  }, [allServices]);

  const services = useMemo(() => {
    let list = [...allServices];
    if (activeSubType) list = list.filter((s) => (s.category || "") === activeSubType);
    switch (activeSort) {
      case "rating":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "budget":
        list.sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));
        break;
      case "deliveryTime": {
        const dur = (d: any) => {
          const n = parseFloat(String(d ?? "").match(/[\d.]+/)?.[0] || "");
          return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
        };
        list.sort((a, b) => dur(a.duration) - dur(b.duration));
        break;
      }
      case "sellerLevel":
        list.sort((a, b) => Number(b.verified) - Number(a.verified) || Number(b.isPro) - Number(a.isPro));
        break;
      case "location":
        list.sort((a, b) => (a.location || "").localeCompare(b.location || ""));
        break;
    }
    return list;
  }, [allServices, activeSubType, activeSort]);

  return (
    <main className="min-h-screen bg-[#0D1117]" data-testid="page-search-results">
      {/* Header: back | title (truncate 24) | search */}
      <header className="sticky top-0 z-30 bg-[#0D1117]/95 backdrop-blur border-b border-[#1F2937]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => (window.history.length > 1 ? window.history.back() : navigate(`/categories/${cat}`))}
            className="p-1 -ml-1 text-white"
            data-testid="button-back"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-base font-semibold text-white truncate" data-testid="text-title">
            {title.length > 24 ? title.slice(0, 24) + "…" : title}
          </h1>
          <Link href="/search" className="p-1 text-white" data-testid="link-search" aria-label="Search">
            <SearchIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Filter pills — horizontal scroll, no right padding (peek) */}
        <div className="flex gap-2 overflow-x-auto pl-4 pr-0 pb-3" style={{ scrollbarWidth: "none" }}>
          {FILTER_PILLS.map((pill) => {
            const active = activeSort === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => setActiveSort(active ? null : pill.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-transparent border-[#374151] text-slate-300"
                }`}
                data-testid={`pill-${pill.key}`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Sub-type tiles (derived from real categories) */}
      {subTypes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pl-4 pr-0 py-3" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setActiveSubType(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border ${
              !activeSubType ? "bg-emerald-600/15 border-emerald-600 text-emerald-400" : "bg-[#1F2937] border-[#374151] text-slate-300"
            }`}
            data-testid="subtype-all"
          >
            All
          </button>
          {subTypes.map((st) => (
            <button
              key={st}
              onClick={() => setActiveSubType(activeSubType === st ? null : st)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                activeSubType === st
                  ? "bg-emerald-600/15 border-emerald-600 text-emerald-400"
                  : "bg-[#1F2937] border-[#374151] text-slate-300"
              }`}
              data-testid={`subtype-${st}`}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="px-4 py-4">
        <p className="text-sm text-slate-400 mb-3" data-testid="text-result-count">
          {isLoading ? "Loading…" : `${services.length} service${services.length === 1 ? "" : "s"}`}
        </p>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <GigCardSkeleton key={i} />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((s) => (
              <Link key={s.id} href={`/gig/${s.id}`}>
                <GigCard gig={serviceToGigCard(s)} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center" data-testid="empty-results">
            <p className="text-white font-semibold">No services in {title} yet</p>
            <p className="text-sm text-slate-500 mt-1">Check back soon or browse other categories.</p>
            <Link
              href="/categories"
              className="inline-block mt-4 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold"
              data-testid="link-all-categories"
            >
              All categories
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
