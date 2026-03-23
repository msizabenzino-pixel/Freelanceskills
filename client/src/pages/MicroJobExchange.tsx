import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function MicroJobExchange() {
  const [tab, setTab] = useState<"dashboard"|"jobs">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/micro-jobs/dashboard"], queryFn:()=>fetch("/api/micro-jobs/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: jobs } = useQuery({ queryKey:["/api/micro-jobs/list"], queryFn:()=>fetch("/api/micro-jobs/list",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="jobs" });
  const d=(dash as any)||{};
  const deliveryColor=(h:number)=>h<=2?"#1DBF73":h<=8?"#eab308":"#f97316";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Micro-Job Exchange</h1>
        <p className="text-sm text-gray-500 mb-5">Quick Gigs &lt; R500 · Instant Matching · 2h–48h Delivery · Africa-First Pricing</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Active Jobs",v:d.active||0,c:"#1DBF73"},{l:"Avg Price",v:`R${((d.avgPrice||0)/100).toLocaleString()}`,c:"#6366f1"},{l:"Avg Delivery",v:`${d.avgDelivery||0}h`,c:"#eab308"},{l:"Categories",v:d.categories||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","jobs"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="jobs"&&<div className="space-y-2">{((jobs as any)?.jobs||[]).map((j:any)=><div key={j.id} data-testid={`microjob-${j.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{j.title}</span><span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:`${deliveryColor(j.deliveryHours)}20`,color:deliveryColor(j.deliveryHours)}}>{j.deliveryHours}h delivery</span></div><div className="text-xs text-gray-500">{j.seller} · {j.category}</div><div className="text-xs text-gray-400 mt-0.5">{j.description}</div><div className="flex gap-1 mt-1">{(j.tags||[]).map((tag:string)=><span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{tag}</span>)}</div></div><div className="text-right ml-4"><div className="text-xl font-black text-emerald-400">R{((j.price||0)/100).toLocaleString()}</div><div className="text-xs text-gray-500">★ {j.rating} ({j.reviews})</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Micro-Jobs</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">R{((d.avgPrice||0)/100).toLocaleString()}</div><div className="text-sm text-gray-400 mt-1">Average Price</div></div></div>}
      </div>
    </div>
  );
}
