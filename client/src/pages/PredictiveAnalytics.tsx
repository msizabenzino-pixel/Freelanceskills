import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function PredictiveAnalytics() {
  const [tab, setTab] = useState<"dashboard"|"revenue"|"churn"|"demand">("dashboard");
  const { data: dash } = useQuery({ queryKey:["/api/predictive/dashboard"], queryFn:()=>fetch("/api/predictive/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:30000 });
  const { data: revenue } = useQuery({ queryKey:["/api/predictive/revenue"], queryFn:()=>fetch("/api/predictive/revenue",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="revenue" });
  const { data: churn } = useQuery({ queryKey:["/api/predictive/churn"], queryFn:()=>fetch("/api/predictive/churn",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="churn" });
  const { data: demand } = useQuery({ queryKey:["/api/predictive/demand"], queryFn:()=>fetch("/api/predictive/demand",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="demand" });
  const d=(dash as any)||{}; const r=(revenue as any)||{}; const c=(churn as any)||{}; const dm=(demand as any)||{};
  const churnColor=(p:number)=>p>0.6?"#ef4444":p>0.3?"#f97316":"#1DBF73";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Predictive Analytics</h1>
        <p className="text-sm text-gray-500 mb-5">Revenue Forecasting · Churn Prediction · Demand Forecasting · Pricing Optimisation · ML Models</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Revenue Next 3M",v:`R${((d.revenueNext3M||0)/1000000).toFixed(1)}M`,c:"#1DBF73"},{l:"Churn At Risk",v:d.churnAtRisk||0,c:"#ef4444"},{l:"Demand Forecasts",v:d.demandForecastsCount||0,c:"#6366f1"},{l:"Avg Confidence",v:`${d.avgForecastConfidence||0}%`,c:"#eab308"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","revenue","churn","demand"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="revenue"&&<div className="rounded-2xl p-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">12-Month Revenue Forecast</div><div className="flex items-end gap-1 h-24">{((r.forecasts||[]) as any[]).map((f:any,i:number)=><div key={i} className="flex-1 flex flex-col items-center gap-0.5"><div className="w-full rounded-t" style={{height:`${(f.predicted/12000000)*100}%`,background:`rgba(29,191,115,${0.3+i*0.05})`}} /><div className="text-[8px] text-gray-600">M{f.month}</div></div>)}</div></div>}
        {tab==="churn"&&<div className="space-y-2">{((c.predictions||[]) as any[]).map((p:any,i:number)=><div key={i} data-testid={`churn-${i}`} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${churnColor(p.churnProbability)}20`}}><div className="flex justify-between items-center"><div><div className="text-sm font-bold text-white">{p.name}</div><div className="text-xs text-gray-500">{p.reason}</div></div><div className="text-right"><div className="text-lg font-black" style={{color:churnColor(p.churnProbability)}}>{(p.churnProbability*100).toFixed(0)}%</div><div className="text-[10px] text-gray-500">churn prob</div></div></div></div>)}</div>}
        {tab==="demand"&&<div className="space-y-2">{((dm.forecasts||[]) as any[]).map((f:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between items-center"><div><div className="text-sm font-bold text-white">{f.skill}</div><div className="text-xs text-gray-500">Current: {f.currentDemand} · Confidence: {f.confidence}%</div></div><div className="text-emerald-400 font-bold">→ {f.predictedNextMonth}</div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">R{((d.revenueNext3M||0)/1000000).toFixed(1)}M</div><div className="text-sm text-gray-400 mt-1">Revenue Forecast — Next 3 Months</div></div><div className="rounded-2xl p-6" style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)"}}><div className="text-4xl font-black text-red-400">{d.churnAtRisk||0}</div><div className="text-sm text-gray-400 mt-1">Users at Churn Risk</div></div></div>}
      </div>
    </div>
  );
}
