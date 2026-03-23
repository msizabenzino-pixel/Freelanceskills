import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function SearchDiscovery() {
  const [tab, setTab] = useState<"dashboard"|"queries"|"suggestions">("dashboard");
  const { toast } = useToast();
  const { data: dash } = useQuery({ queryKey: ["/api/search-ai/dashboard"], queryFn: () => fetch("/api/search-ai/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: queries } = useQuery({ queryKey: ["/api/search-ai/queries"], queryFn: () => fetch("/api/search-ai/queries", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "queries" });
  const { data: suggestions } = useQuery({ queryKey: ["/api/search-ai/suggestions"], queryFn: () => fetch("/api/search-ai/suggestions", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "suggestions" });
  const reindexMut = useMutation({ mutationFn: () => fetch("/api/search-ai/reindex", { method: "POST", credentials: "include" }).then(r => r.json()), onSuccess: () => toast({ title: "Reindex triggered ⚡" }) });
  const d = (dash as any) || {};
  const tabs = ["dashboard","queries","suggestions"] as const;
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">AI Search & Discovery</h1>
        <p className="text-sm text-gray-500 mb-5">Semantic NLP · 11 Languages · 124K+ Documents · Real-time Suggestions</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{ l:"Total Docs", v: (d.totalDocuments||0).toLocaleString(), c:"#6366f1" },{ l:"Avg Query", v:`${d.avgQueryMs||0}ms`, c:"#1DBF73" },{ l:"Cache Hit", v:`${d.cacheHitRate||0}%`, c:"#eab308" },{ l:"Avg CTR", v:`${d.avgCTR||0}%`, c:"#f97316" }].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{ background:`${s.c}10`, border:`1px solid ${s.c}25` }}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {tabs.map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{ background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)", color:tab===t?"#818cf8":"#6b7280", border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)" }}>{t}</button>)}
          <button onClick={()=>reindexMut.mutate()} className="ml-auto px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-700">↺ Full Reindex</button>
        </div>
        {tab==="dashboard" && <div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm text-gray-500 mb-1">Top Query</div><div className="text-lg font-bold text-white">{d.topQuery}</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm text-gray-500 mb-1">Semantic NLP</div><div className="text-lg font-bold text-emerald-400">{d.semanticEnabled?"Active":"Disabled"}</div></div></div>}
        {tab==="queries" && <div className="space-y-2">{((queries as any)?.queries||[]).map((q:any)=><div key={q.id} data-testid={`query-${q.id}`} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between"><span className="text-sm text-white">{q.query}</span><div className="flex gap-3"><span className="text-xs text-indigo-400">{q.clickThrough.toFixed(1)}% CTR</span><span className="text-xs text-gray-500">{q.resultsCount} results</span></div></div><div className="text-xs text-gray-600 mt-0.5">{q.category}</div></div>)}</div>}
        {tab==="suggestions" && <div className="space-y-2">{((suggestions as any)?.suggestions||[]).map((s:any)=><div key={s.id} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between"><span className="text-sm text-white">{s.term}</span><div className="flex gap-2">{s.trending&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-900/40 text-orange-400 font-bold">TRENDING</span>}<span className="text-xs text-indigo-400">{s.searchVolume.toLocaleString()} searches</span></div></div></div>)}</div>}
      </div>
    </div>
  );
}
