import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function PerformanceBenchmarking() {
  const [tab, setTab] = useState<"dashboard"|"api-latency"|"benchmarks">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/benchmarking/dashboard"], queryFn:()=>fetch("/api/benchmarking/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:15000 });
  const { data: api } = useQuery({ queryKey:["/api/benchmarking/api-latency"], queryFn:()=>fetch("/api/benchmarking/api-latency",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="api-latency" });
  const { data: benchmarks } = useQuery({ queryKey:["/api/benchmarking/competitors"], queryFn:()=>fetch("/api/benchmarking/competitors",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="benchmarks" });
  const d=(dash as any)||{}; const a=(api as any)||{}; const b=(benchmarks as any)||{};
  const loadColor=(ms:number)=>ms<1000?"#1DBF73":ms<2000?"#eab308":"#ef4444";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Performance Benchmarking</h1>
        <p className="text-sm text-gray-500 mb-5">Page Load · API Latency · Uptime (99.94%) · Apdex Score · Competitor Benchmarks</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"P50 Page Load",v:`${(d.pageLoad||{}).p50||0}ms`,c:"#1DBF73"},{l:"Uptime (30d)",v:`${(d.uptime||{}).last30d||0}%`,c:"#6366f1"},{l:"Apdex",v:(d.apdex||{}).score||0,c:"#eab308"},{l:"Throughput",v:`${(d.throughput||{}).rps||0} RPS`,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","api-latency","benchmarks"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t.replace("-"," ")}</button>)}
        </div>
        {tab==="api-latency"&&<div className="space-y-2">{((a.endpoints||[]) as any[]).map((ep:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="font-mono text-sm text-indigo-400 mb-2">{ep.endpoint}</div><div className="flex gap-4"><div className="text-center"><div className="text-xs text-gray-500">P50</div><div className="font-bold" style={{color:loadColor(ep.p50)}}>{ep.p50}ms</div></div><div className="text-center"><div className="text-xs text-gray-500">P95</div><div className="font-bold" style={{color:loadColor(ep.p95)}}>{ep.p95}ms</div></div><div className="text-center"><div className="text-xs text-gray-500">P99</div><div className="font-bold" style={{color:loadColor(ep.p99)}}>{ep.p99}ms</div></div></div></div>)}</div>}
        {tab==="benchmarks"&&<div className="space-y-2">{((b.competitors||[]) as any[]).map((c:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:c.us?"rgba(29,191,115,0.08)":"rgba(255,255,255,0.04)",border:c.us?"1px solid rgba(29,191,115,0.2)":"1px solid rgba(255,255,255,0.07)"}}><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-sm font-bold text-white">{c.name}</span>{c.us&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">US ✓</span>}</div><div className="text-right"><div className="text-sm font-bold" style={{color:loadColor(c.pageLoad)}}>{c.pageLoad}ms</div><div className="text-xs text-gray-500">page load</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="space-y-4"><div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">Page Load Percentiles</div>{[{l:"P50 (median)",v:(d.pageLoad||{}).p50,t:2000},{l:"P95",v:(d.pageLoad||{}).p95,t:2000},{l:"P99",v:(d.pageLoad||{}).p99,t:2000}].map((item,i)=><div key={i} className="mb-2"><div className="flex justify-between text-xs mb-0.5"><span className="text-gray-400">{item.l}</span><span style={{color:loadColor(item.v||0)}}>{item.v||0}ms</span></div><div className="h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full" style={{width:`${Math.min((item.v||0)/3000*100,100)}%`,background:loadColor(item.v||0)}} /></div></div>)}</div></div>}
      </div>
    </div>
  );
}
