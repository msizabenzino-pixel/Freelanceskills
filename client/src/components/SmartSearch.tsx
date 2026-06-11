import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface Suggestion {
  id: string;
  text: string;
  type: "trending" | "history" | "category" | "freelancer";
  meta?: string;
}

export default function SmartSearch({ 
  placeholder = "Search for any service...",
  onSelect,
  compact = false,
}: { 
  placeholder?: string;
  onSelect?: (q: string) => void;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ["/api/search/suggestions", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: query.length > 1,
    staleTime: 30000,
  });

  const history = JSON.parse(localStorage.getItem("search_history") || "[]") as string[];
  const trending = [
    { id: "t1", text: "Website design", type: "trending" as const, meta: "2.4k searches" },
    { id: "t2", text: "Social media marketing", type: "trending" as const, meta: "1.8k searches" },
    { id: "t3", text: "SEO optimization", type: "trending" as const, meta: "1.5k searches" },
    { id: "t4", text: "Logo design", type: "trending" as const, meta: "1.2k searches" },
  ];

  const displayItems: Suggestion[] = query.length > 1
    ? (suggestions?.suggestions || []).map((s: any) => ({ id: s.id, text: s.term, type: "category", meta: s.searchVolume ? `${s.searchVolume} searches` : undefined }))
    : [
        ...history.slice(0, 4).map((h, i) => ({ id: `h${i}`, text: h, type: "history" as const, meta: "Recent" })),
        ...trending,
      ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(i => Math.min(i + 1, displayItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && displayItems[highlighted]) {
      selectItem(displayItems[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectItem = (item: Suggestion) => {
    setQuery(item.text);
    setOpen(false);
    if (item.type !== "history" && item.type !== "trending") {
      const hist = JSON.parse(localStorage.getItem("search_history") || "[]") as string[];
      const next = [item.text, ...hist.filter(h => h !== item.text)].slice(0, 10);
      localStorage.setItem("search_history", JSON.stringify(next));
    }
    onSelect?.(item.text);
    // Navigate to search results
    window.location.href = `/explore?q=${encodeURIComponent(item.text)}`;
  };

  return (
    <div ref={containerRef} className="relative w-full" data-testid="smart-search">
      <div className={cn(
        "flex items-center gap-2 bg-white rounded-lg border border-gray-200 transition-all",
        compact ? "px-3 py-2" : "px-4 py-3",
        open && "ring-2 ring-emerald-500/30 border-emerald-500"
      )}>
        <Search className={cn("text-gray-400 flex-shrink-0", compact ? "w-4 h-4" : "w-5 h-5")} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setHighlighted(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 text-sm outline-none"
          data-testid="input-search"
        />
        {query && (
          <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {open && displayItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50">
          {displayItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => selectItem(item)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors",
                i === highlighted && "bg-gray-50"
              )}
              data-testid={`suggestion-${item.id}`}
            >
              {item.type === "trending" && <TrendingUp className="w-4 h-4 text-orange-400 flex-shrink-0" />}
              {item.type === "history" && <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              {item.type === "category" && <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-900 truncate">{item.text}</span>
                {item.meta && <span className="text-xs text-gray-400 ml-2">{item.meta}</span>}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
