import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function CompetitiveIntel() {
  const [tab, setTab] = useState<"dashboard"|"competitors"|"swot">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/competitive-intel/dashboard"], queryFn:()=>fetch("/api/competitive-intel/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:30000 });
  const { data: competitors } = useQuery({ queryKey:["/api/competitive-intel/competitors"], queryFn:()=>fetch("/api/competitive-intel/competitors",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="competitors" });
  const { data: swot } = useQuery({ queryKey:["/api/competitive-intel/swot"], queryFn:()=>fetch("/api/competitive-intel/swot",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="swot" });
  const d=(dash as any)||{}; const c=(competitors as any)||{}; const sw=(swot as any)||{};
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Competitive Intelligence</h1>
        <p className="text-sm text-gray-500 mb-5">Competitor Tracking · SWOT Analysis · Market Positioning · Pricing Comparison · Our Advantages</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[{l:"Competitors Tracked",v:d.competitors||0,c:"#ef4444"},{l:"Our Advantages",v:d.ourAdvantages||0,c:"#1DBF73"},{l:"Market Position",v:"#1 SA",c:"#6366f1"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","competitors","swot"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold uppercase" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="competitors"&&<div className="space-y-4"><div className="space-y-2">{((c.competitors||[]) as any[]).map((comp:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between items-start"><div><div className="font-bold text-white text-base">{comp.name}</div><div className="text-xs text-gray-500">{comp.region} · {comp.commission} commission</div><div className="mt-1 flex gap-1">{(comp.weaknesses||[]).map((w:string,j:number)=><span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400">{w}</span>)}</div></div><div className="text-right"><div className="text-2xl font-black text-red-400">{comp.rating}⭐</div><div className="text-xs text-gray-500">{(comp.monthlyVisits/1000000).toFixed(1)}M visits/mo</div></div></div></div>)}<div className="rounded-xl p-4" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-sm font-bold text-emerald-400 mb-2">Our Advantages</div><div className="flex flex-wrap gap-1">{((c.ourAdvantages||[]) as string[]).map((a:string,i:number)=><span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">{a}</span>)}</div></div></div></div>}
        {tab==="swot"&&<div className="grid grid-cols-2 gap-4">{([{title:"Strengths",key:"strengths",c:"#1DBF73"},{title:"Weaknesses",key:"weaknesses",c:"#ef4444"},{title:"Opportunities",key:"opportunities",c:"#6366f1"},{title:"Threats",key:"threats",c:"#f97316"}] as {title:string;key:string;c:string}[]).map(({title,key,c})=><div key={key} className="rounded-2xl p-4" style={{background:`${c}08`,border:`1px solid ${c}20`}}><div className="font-bold mb-2" style={{color:c}}>{title}</div>{(sw[key]||[]).map((item:string,i:number)=><div key={i} className="text-xs text-gray-400 mb-1">• {item}</div>)}</div>)}</div>}
        {tab==="dashboard"&&<div className="rounded-2xl p-8" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-center"><div className="text-6xl mb-2">🏆</div><div className="text-3xl font-black text-white">#1 South African Freelance Platform</div><div className="text-sm text-gray-400 mt-2">Tracking {d.competitors} global competitors · {d.ourAdvantages} competitive advantages</div></div></div>}
      </div>
    </div>
  );
}
