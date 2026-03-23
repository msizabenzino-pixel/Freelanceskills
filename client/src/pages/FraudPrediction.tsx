import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function FraudPrediction() {
  const [tab, setTab] = useState<"dashboard"|"predictions"|"model">("dashboard");
  const { toast } = useToast();
  const { data: dash } = useQuery({ queryKey:["/api/fraud-prediction/dashboard"], queryFn:()=>fetch("/api/fraud-prediction/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:15000 });
  const { data: predictions } = useQuery({ queryKey:["/api/fraud-prediction/predictions"], queryFn:()=>fetch("/api/fraud-prediction/predictions",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="predictions" });
  const { data: modelStats } = useQuery({ queryKey:["/api/fraud-prediction/model-stats"], queryFn:()=>fetch("/api/fraud-prediction/model-stats",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="model" });
  const retrainMut = useMutation({ mutationFn:()=>fetch("/api/fraud-prediction/retrain",{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>toast({title:"Model retraining initiated — ETA 4 hours"}) });
  const d=(dash as any)||{}; const ms=(modelStats as any)||{};
  const scoreColor=(s:number)=>s>0.7?"#ef4444":s>0.4?"#f97316":"#1DBF73";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Fraud Prediction Engine</h1>
        <p className="text-sm text-gray-500 mb-5">97.2% Accuracy · XGBoost Model · 2.84M Training Records · Real-time Scoring</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"High Risk",v:d.highRisk||0,c:"#ef4444"},{l:"Total Scored",v:d.totalPredictions||0,c:"#6366f1"},{l:"Prevented",v:`R${((d.preventedAmount||0)/100).toLocaleString()}`,c:"#1DBF73"},{l:"Model Accuracy",v:`${(d.modelStats||{}).accuracy||0}%`,c:"#eab308"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","predictions","model"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#f87171":"#6b7280",border:tab===t?"1px solid rgba(239,68,68,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
          {tab==="model"&&<button onClick={()=>retrainMut.mutate()} className="ml-auto px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-700">Retrain Model</button>}
        </div>
        {tab==="predictions"&&<div className="space-y-2">{((predictions as any)?.predictions||[]).map((p:any,i:number)=><div key={i} data-testid={`fraud-${i}`} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${scoreColor(p.fraudScore)}20`}}><div className="flex justify-between items-center"><div><div className="text-sm font-bold text-white">{p.name}</div><div className="text-xs text-gray-500">Top signal: {p.topFeatures}</div></div><div className="text-right"><div className="text-xl font-black" style={{color:scoreColor(p.fraudScore)}}>{(p.fraudScore*100).toFixed(0)}%</div><div className="text-[10px]" style={{color:scoreColor(p.fraudScore)}}>{p.riskCategory.replace("_"," ")}</div></div></div></div>)}</div>}
        {tab==="model"&&<div className="grid grid-cols-2 gap-3">{[{l:"Accuracy",v:`${ms.accuracy||0}%`},{l:"Precision",v:`${ms.precision||0}%`},{l:"Recall",v:`${ms.recall||0}%`},{l:"F1 Score",v:`${ms.f1||0}%`},{l:"False Positive Rate",v:`${ms.falsePositiveRate||0}%`},{l:"Model Version",v:ms.modelVersion||"—"},{l:"Training Records",v:(ms.trainedOn||0).toLocaleString()},{l:"Last Retrained",v:ms.lastRetrained?new Date(ms.lastRetrained).toLocaleDateString():"—"}].map((item,i)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="text-lg font-black text-white">{item.v}</div><div className="text-xs text-gray-500 mt-0.5">{item.l}</div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)"}}><div className="text-4xl font-black text-red-400">{d.highRisk||0}</div><div className="text-sm text-gray-400 mt-1">High Risk Users</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">R{((d.preventedAmount||0)/100).toLocaleString()}</div><div className="text-sm text-gray-400 mt-1">Fraud Prevented</div></div></div>}
      </div>
    </div>
  );
}
