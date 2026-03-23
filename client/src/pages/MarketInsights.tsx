import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function MarketInsights() {
  const [tab, setTab] = useState<"dashboard"|"skills"|"pricing">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/insights/dashboard"], queryFn:()=>fetch("/api/insights/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:30000 });
  const { data: skills } = useQuery({ queryKey:["/api/insights/skills"], queryFn:()=>fetch("/api/insights/skills",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="skills" });
  const { data: pricing } = useQuery({ queryKey:["/api/insights/pricing"], queryFn:()=>fetch("/api/insights/pricing",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="pricing" });
  const d=(dash as any)||{}; const sk=(skills as any)||{}; const pr=(pricing as any)||{};
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Marketplace Insights</h1>
        <p className="text-sm text-gray-500 mb-5">Skill Demand · Pricing Benchmarks · Supply/Demand Gaps · Category Trends</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[{l:"Skills Tracked",v:d.totalSkillsTracked||0,c:"#6366f1"},{l:"Markets Analysed",v:d.marketsAnalyzed||0,c:"#1DBF73"},{l:"Weekly Signups",v:(d.signupTrend||[]).reduce((s:number,n:number)=>s+n,0),c:"#eab308"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","skills","pricing"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="dashboard"&&<div className="space-y-4"><div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">Weekly Signup Trend</div><div className="flex items-end gap-1 h-20">{(d.signupTrend||[]).map((v:number,i:number)=><div key={i} className="flex-1 rounded-t" style={{height:`${(v/250)*100}%`,background:"rgba(99,102,241,0.6)"}} />)}</div><div className="flex justify-between text-[9px] text-gray-600 mt-1">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day=><span key={day}>{day}</span>)}</div></div></div>}
        {tab==="skills"&&<div className="space-y-4"><div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">Top Growing Skills</div>{(sk.topGrowing||[]).map((s:any,i:number)=><div key={i} className="flex justify-between items-center mb-2"><div><div className="text-sm text-white">{s.skill}</div><div className="text-xs text-gray-500">{s.demand.toLocaleString()} active demands</div></div><span className="text-emerald-400 font-bold text-sm">+{s.growth}%</span></div>)}</div><div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">Supply/Demand Gaps</div>{(sk.gaps||[]).map((g:any,i:number)=><div key={i} className="mb-3"><div className="flex justify-between text-sm mb-1"><span className="text-white">{g.skill}</span><span className="text-red-400 font-bold">Gap: {g.gap}</span></div><div className="h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full bg-red-500" style={{width:`${(g.demand/(g.demand+g.supply))*100}%`}} /></div></div>)}</div></div>}
        {tab==="pricing"&&<div className="space-y-2">{(pr.benchmarks||[]).map((b:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between items-center"><div className="text-sm font-bold text-white">{b.category}</div><div className="flex gap-4"><div className="text-center"><div className="text-xs text-gray-500">Low</div><div className="text-sm text-gray-400">R{(b.low/100).toLocaleString()}</div></div><div className="text-center"><div className="text-xs text-gray-500">Avg</div><div className="text-sm font-bold text-emerald-400">R{(b.avg/100).toLocaleString()}</div></div><div className="text-center"><div className="text-xs text-gray-500">High</div><div className="text-sm text-indigo-400">R{(b.high/100).toLocaleString()}</div></div></div></div></div>)}</div>}
      </div>
    </div>
  );
}
