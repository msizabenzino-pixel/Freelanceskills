import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function PlatformHealthScore() {
  const [tab, setTab] = useState<"dashboard"|"dimensions"|"benchmarks">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/platform-health/dashboard"], queryFn:()=>fetch("/api/platform-health/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: dims } = useQuery({ queryKey:["/api/platform-health/dimensions"], queryFn:()=>fetch("/api/platform-health/dimensions",{credentials:"include"}).then(r=>r.json()), staleTime:20000, enabled:tab==="dimensions" });
  const { data: benchmarks } = useQuery({ queryKey:["/api/platform-health/benchmarks"], queryFn:()=>fetch("/api/platform-health/benchmarks",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="benchmarks" });
  const d=(dash as any)||{}; const dm=(dims as any)||{}; const bm=(benchmarks as any)||{};
  const scoreColor=(s:number)=>s>=85?"#1DBF73":s>=70?"#eab308":"#ef4444";
  const trendIcon=(t:string)=>t==="up"?"↑":t==="down"?"↓":"→";
  const trendColor=(t:string)=>t==="up"?"#1DBF73":t==="down"?"#ef4444":"#9ca3af";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Platform Health Score</h1>
        <p className="text-sm text-gray-500 mb-5">6-Dimension Scoring · Competitor Benchmarking · Trend History · AI Recommendations</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Overall Score",v:d.overall||0,c:"#1DBF73"},{l:"Market Rank",v:`#${d.rank||1}`,c:"#6366f1"},{l:"Competitors",v:d.competitors||0,c:"#eab308"},{l:"Dimensions",v:(d.dimensions||[]).length,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","dimensions","benchmarks"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="dimensions"&&<div className="space-y-2">{((dm.dimensions||[]) as any[]).map((dim:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><span className="text-sm font-bold text-white">{dim.name}</span><span style={{color:trendColor(dim.trend)}}>{trendIcon(dim.trend)}</span></div><span className="text-lg font-black" style={{color:scoreColor(dim.score)}}>{dim.score}/100</span></div><div className="h-2 rounded-full bg-gray-800"><div className="h-full rounded-full" style={{width:`${dim.score}%`,background:scoreColor(dim.score)}} /></div><div className="text-[10px] text-gray-600 mt-0.5">Weight: {dim.weight}%</div></div>)}</div>}
        {tab==="benchmarks"&&<div className="space-y-2">{((bm.competitors||[]) as any[]).map((c:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:c.us?"rgba(29,191,115,0.08)":"rgba(255,255,255,0.04)",border:c.us?"1px solid rgba(29,191,115,0.2)":"1px solid rgba(255,255,255,0.07)"}}><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-sm font-bold text-white">{c.name}</span>{c.us&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">US</span>}</div><span className="text-lg font-black" style={{color:scoreColor(c.score)}}>{c.score}</span></div><div className="mt-1 h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full" style={{width:`${c.score}%`,background:c.us?"#1DBF73":"#6b7280"}} /></div></div>)}</div>}
        {tab==="dashboard"&&<div className="rounded-2xl p-8 text-center" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-8xl font-black text-emerald-400">{d.overall}</div><div className="text-white text-lg mt-2">Platform Health Score — #1 in South Africa</div><div className="text-sm text-gray-500 mt-1">Ahead of Upwork (72), Fiverr (68), Freelancer.com (61)</div></div>}
      </div>
    </div>
  );
}
