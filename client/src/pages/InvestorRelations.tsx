import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function InvestorRelations() {
  const [tab, setTab] = useState<"dashboard"|"funding"|"cap-table">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/investor-relations/dashboard"], queryFn:()=>fetch("/api/investor-relations/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:30000 });
  const { data: funding } = useQuery({ queryKey:["/api/investor-relations/funding"], queryFn:()=>fetch("/api/investor-relations/funding",{credentials:"include"}).then(r=>r.json()), staleTime:60000, enabled:tab==="funding" });
  const { data: capTable } = useQuery({ queryKey:["/api/investor-relations/cap-table"], queryFn:()=>fetch("/api/investor-relations/cap-table",{credentials:"include"}).then(r=>r.json()), staleTime:60000, enabled:tab==="cap-table" });
  const d=(dash as any)||{}; const f=(funding as any)||{}; const ct=(capTable as any)||{};
  const typeColor=(t:string)=>({institutional:"#6366f1",vc:"#1DBF73",strategic:"#eab308",founders:"#f97316"}[t]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Investor Relations</h1>
        <p className="text-sm text-gray-500 mb-5">ARR · GMV · MRR · Funding Rounds · Cap Table · Investor Updates · Board Pack · Naspers Foundry</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"ARR",v:`R${((d.arr||0)/1000000).toFixed(1)}M`,c:"#1DBF73"},{l:"GMV",v:`R${((d.gmv||0)/1000000).toFixed(0)}M`,c:"#6366f1"},{l:"NPS",v:d.nps||0,c:"#eab308"},{l:"Monthly Growth",v:`${d.monthlyGrowth||0}%`,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","funding","cap-table"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t.replace("-"," ")}</button>)}
        </div>
        {tab==="funding"&&<div className="space-y-3">{((f.rounds||[]) as any[]).map((r:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between items-start"><div><div className="flex items-center gap-2 mb-1"><span className="text-emerald-400 font-black text-lg">{r.round}</span><span className="text-xs text-gray-500">{r.date}</span></div><div className="text-xs text-gray-400">{(r.investors||[]).join(" · ")}</div></div><div className="text-right"><div className="text-xl font-black text-white">R{(r.amount/1000000).toFixed(0)}M</div><div className="text-xs text-gray-500">Val: R{(r.valuation/1000000).toFixed(0)}M</div></div></div></div>)}</div>}
        {tab==="cap-table"&&<div className="space-y-2">{((ct.investors||[]) as any[]).map((inv:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between items-center"><div><span className="text-sm font-bold text-white">{inv.name}</span><span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${typeColor(inv.type)}20`,color:typeColor(inv.type)}}>{inv.type}</span></div><span className="text-lg font-black text-emerald-400">{inv.stake}%</span></div><div className="mt-1 h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full" style={{width:`${inv.stake}%`,background:typeColor(inv.type)}} /></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4">{[{l:"CAC",v:`R${((d.cac||0)/100).toLocaleString()}`},{l:"LTV",v:`R${((d.ltv||0)/100).toLocaleString()}`},{l:"Churn Rate",v:`${d.churnRate||0}%`},{l:"LTV:CAC Ratio",v:`${(((d.ltv||0)/(d.cac||1))).toFixed(1)}x`}].map((m,i)=><div key={i} className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-2xl font-black text-white">{m.v}</div><div className="text-xs text-gray-500 mt-1">{m.l}</div></div>)}</div>}
      </div>
    </div>
  );
}
