import { useMemo, useEffect } from "react";
import { useSearch, Link } from "wouter";
import { trackSearch } from "@/lib/track";
import { useQuery } from "@tanstack/react-query";
import SmartSearch from "@/components/SmartSearch";
import { GigCard, GigCardSkeleton } from "@/components/GigCard";
import { serviceToGigCard } from "@/lib/gigMappers";
import { SearchX } from "lucide-react";

export default function Search() {
  const searchString = useSearch();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const q = params.get("q") || "";
  const cat = params.get("cat") || "";

  const { data, isLoading } = useQuery<{ services: any[]; total: number }>({
    queryKey: ["/api/services/search", q, cat],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (cat) qs.set("category", cat);
      const res = await fetch(`/api/services/search?${qs.toString()}`, { credentials: "include" });
      if (!res.ok) return { services: [], total: 0 };
      return res.json();
    },
    enabled: q.length > 0 || cat.length > 0,
  });

  const services = data?.services || [];

  useEffect(() => {
    if (!isLoading && (q || cat)) trackSearch(q, cat, services.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, isLoading]);

  return (
    <main className="min-h-screen bg-[#0D1117]" data-testid="page-search">
      <div className="sticky top-0 z-30 bg-[#0D1117]/95 backdrop-blur border-b border-[#1F2937] px-4 py-3">
        <SmartSearch autoFocus />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        {q || cat ? (
          <>
            <p className="text-sm text-slate-400 mb-3" data-testid="text-search-summary">
              {isLoading
                ? "Searching…"
                : `${services.length} result${services.length === 1 ? "" : "s"}${q ? ` for "${q}"` : ""}`}
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
              <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="empty-search">
                <SearchX className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-white font-semibold">No services found</p>
                <p className="text-sm text-slate-500 mt-1">Try a different keyword or browse categories.</p>
                <Link
                  href="/categories"
                  className="mt-4 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold"
                  data-testid="link-browse-categories"
                >
                  Browse categories
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center" data-testid="search-prompt">
            <p className="text-white font-semibold">Find a freelancer, trade, or skill</p>
            <p className="text-sm text-slate-500 mt-1">Start typing above to search the marketplace.</p>
          </div>
        )}
      </div>
    </main>
  );
}
