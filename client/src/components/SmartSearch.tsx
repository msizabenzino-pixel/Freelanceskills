import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, TrendingUp, Clock, ArrowRight, Tag, User } from "lucide-react";
import { useLocation } from "wouter";

interface Suggestion {
  id: string;
  text: string;
  type: "popular" | "history" | "category" | "freelancer" | "gig";
  meta?: string;
  cat?: string;
}

// Exact popular list from FSN spec (Command 11)
const POPULAR: Suggestion[] = [
  { id: "p1", text: "Electrician Cape Town", type: "popular", cat: "skilled-trades" },
  { id: "p2", text: "WordPress Developer", type: "popular", cat: "programming-tech" },
  { id: "p3", text: "Logo Design", type: "popular", cat: "graphics-design" },
  { id: "p4", text: "Accountant Johannesburg", type: "popular", cat: "finance-accounting" },
  { id: "p5", text: "Plumber Pretoria", type: "popular", cat: "skilled-trades" },
  { id: "p6", text: "Social Media Manager", type: "popular", cat: "digital-marketing" },
];

// Lightweight client-side category matcher → pre-applies the cat filter on submit.
const CATEGORY_MATCH: Array<{ keys: string[]; cat: string }> = [
  { keys: ["logo", "graphic", "brand", "design"], cat: "graphics-design" },
  { keys: ["website", "developer", "wordpress", "app", "programming", "tech"], cat: "programming-tech" },
  { keys: ["electric", "plumb", "build", "construction", "solar", "trade"], cat: "skilled-trades" },
  { keys: ["seo", "social media", "marketing", "ads"], cat: "digital-marketing" },
  { keys: ["writing", "copywrit", "article", "cv", "translation"], cat: "writing-translation" },
  { keys: ["account", "bookkeep", "tax", "sars", "finance"], cat: "finance-accounting" },
];

function matchCategory(q: string): string | undefined {
  const lower = q.toLowerCase();
  for (const c of CATEGORY_MATCH) {
    if (c.keys.some((k) => lower.includes(k))) return c.cat;
  }
  return undefined;
}

export default function SmartSearch({
  placeholder = "Find a freelancer, trade, or skill...",
  onSelect,
  compact = false,
  autoFocus = false,
}: {
  placeholder?: string;
  onSelect?: (q: string) => void;
  compact?: boolean;
  autoFocus?: boolean;
}) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce query at 300ms (FSN spec)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: apiData, isFetching } = useQuery({
    queryKey: ["/api/search/suggestions", debounced],
    queryFn: async () => {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debounced)}`, {
        credentials: "include",
      });
      if (!res.ok) return { suggestions: [] };
      return res.json();
    },
    enabled: debounced.length >= 2,
    staleTime: 30000,
  });

  const isTyping = query.trim().length >= 2;
  const loadingSuggestions = isTyping && (isFetching || debounced !== query.trim());

  const recent = (JSON.parse(localStorage.getItem("search_history") || "[]") as string[]).slice(0, 5);

  const autoItems: Suggestion[] = (apiData?.suggestions || []).map((s: any, i: number) => ({
    id: s.id || `a${i}`,
    text: s.term || s.text || s.title || s.name,
    type: (s.type as Suggestion["type"]) || "category",
    meta: s.searchVolume ? `${s.searchVolume} searches` : s.subLabel || s.category,
    cat: s.cat || s.categorySlug,
  })).filter((s: Suggestion) => s.text);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goToSearch = (q: string, cat?: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const hist = JSON.parse(localStorage.getItem("search_history") || "[]") as string[];
    const next = [trimmed, ...hist.filter((h) => h !== trimmed)].slice(0, 10);
    localStorage.setItem("search_history", JSON.stringify(next));
    setOpen(false);
    setFocused(false);
    onSelect?.(trimmed);
    const resolvedCat = cat || matchCategory(trimmed);
    navigate(`/search?q=${encodeURIComponent(trimmed)}${resolvedCat ? `&cat=${resolvedCat}` : ""}`);
  };

  const flatItems: Suggestion[] = isTyping
    ? autoItems
    : [
        ...recent.map((h, i) => ({ id: `h${i}`, text: h, type: "history" as const, meta: "Recent" })),
        ...POPULAR,
      ];

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = highlighted >= 0 ? flatItems[highlighted] : undefined;
      if (item) goToSearch(item.text, item.cat);
      else goToSearch(query);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full" data-testid="smart-search">
      <div
        className={[
          "flex items-center gap-2 bg-[#1F2937] transition-colors",
          compact ? "px-3 py-2" : "px-4 py-3",
          focused ? "border border-[#10b981]" : "border border-[#374151]",
        ].join(" ")}
        style={{ borderRadius: 24 }}
      >
        <Search className={`text-slate-400 flex-shrink-0 ${compact ? "w-4 h-4" : "w-5 h-5"}`} />
        <input
          ref={inputRef}
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => {
            setOpen(true);
            setFocused(true);
          }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm outline-none"
          data-testid="input-search"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="p-1 hover:bg-slate-700 rounded-full"
            data-testid="button-clear-search"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-[#1F2937] border border-[#374151] rounded-2xl shadow-2xl overflow-hidden z-50"
          data-testid="search-dropdown"
        >
          {loadingSuggestions ? (
            <div className="py-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5" data-testid={`skeleton-suggestion-${i}`}>
                  <div className="w-4 h-4 rounded bg-slate-700 animate-pulse flex-shrink-0" />
                  <div className="h-3.5 bg-slate-700 rounded animate-pulse" style={{ width: `${60 - i * 8}%` }} />
                </div>
              ))}
            </div>
          ) : isTyping ? (
            flatItems.length > 0 ? (
              flatItems.map((item, i) => (
                <SuggestionRow key={item.id} item={item} active={i === highlighted} onClick={() => goToSearch(item.text, item.cat)} />
              ))
            ) : (
              <div className="px-4 py-4 text-sm text-slate-500" data-testid="text-no-suggestions">
                No matches — press Enter to search "{query}"
              </div>
            )
          ) : (
            <>
              {recent.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Recent searches
                  </p>
                  {recent.map((h, i) => (
                    <SuggestionRow
                      key={`h${i}`}
                      item={{ id: `h${i}`, text: h, type: "history", meta: "Recent" }}
                      active={highlighted === i}
                      onClick={() => goToSearch(h)}
                    />
                  ))}
                </>
              )}
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Popular searches
              </p>
              {POPULAR.map((item, i) => (
                <SuggestionRow
                  key={item.id}
                  item={item}
                  active={highlighted === recent.length + i}
                  onClick={() => goToSearch(item.text, item.cat)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionRow({ item, active, onClick }: { item: Suggestion; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-700/60 ${
        active ? "bg-slate-700/60" : ""
      }`}
      data-testid={`suggestion-${item.id}`}
    >
      {item.type === "popular" && <TrendingUp className="w-4 h-4 text-orange-400 flex-shrink-0" />}
      {item.type === "history" && <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      {item.type === "category" && <Tag className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
      {(item.type === "freelancer" || item.type === "gig") && <User className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-white truncate">{item.text}</span>
        {item.meta && <span className="text-xs text-slate-500 ml-2">{item.meta}</span>}
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
    </button>
  );
}
