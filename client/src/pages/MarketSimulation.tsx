import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function MarketSimulation() {
  const [tab, setTab] = useState<"dashboard"|"scenarios">("dashboard");
  const { toast } = useToast();
  const { data: dash } = useQuery({ queryKey:["/api/simulation/dashboard"], queryFn:()=>fetch("/api/simulation/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: scenarios } = useQuery({ queryKey:["/api/simulation/scenarios"], queryFn:()=>fetch("/api/simulation/scenarios",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="scenarios" });
  const runMut = useMutation({ mutationFn:(scenario:string)=>fetch("/api/simulation/run",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({scenario})}).then(r=>r.json()), onSuccess:(d)=>toast({title:`Monte Carlo simulation running — ${d.etaSeconds}s`}) });
  const d=(dash as any)||{};
  const reactionColor=(r:string)=>r==="positive"?"#1DBF73":r==="negative"?"#ef4444":"#eab308";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Marketplace Simulation</h1>
        <p className="text-sm text-gray-500 mb-5">What-If Scenarios · Monte Carlo (10K iterations) · Commission Simulation · Market Launch · Pricing Models</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[{l:"Scenarios",v:d.scenarios||0,c:"#6366f1"},{l:"Avg Confidence",v:`${d.avgConfidence||0}%`,c:"#1DBF73"},{l:"Last Run",v:d.lastRun?new Date(d.lastRun).toLocaleDateString():"—",c:"#eab308"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","scenarios"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="scenarios"&&<div className="space-y-3">{((scenarios as any)||[]).map((sc:any)=><div key={sc.id} data-testid={`sim-${sc.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-start justify-between"><div><div className="font-bold text-white mb-1">{sc.name}</div><div className="flex gap-3 text-xs"><span className="text-gray-500">Confidence: <span className="text-white">{sc.confidence}%</span></span>{sc.results.mrrImpact&&<span className="text-emerald-400">MRR +R{((sc.results.mrrImpact||0)/100).toLocaleString()}</span>}{sc.results.newUsers6M&&<span className="text-blue-400">{sc.results.newUsers6M?.toLocaleString()} users/6mo</span>}{sc.results.churnImpact&&<span style={{color:reactionColor(sc.results.freelancerReaction)}}>{sc.results.churnImpact}% churn</span>}</div></div><button onClick={()=>runMut.mutate(sc.name)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-700 ml-2">▶ Run</button></div></div>)}</div>}
        {tab==="dashboard"&&<div className="rounded-2xl p-8" style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)"}}><div className="text-center"><div className="text-6xl font-black text-indigo-400">{d.scenarios||0}</div><div className="text-white mt-2">Simulation Scenarios Ready</div><div className="text-sm text-gray-500 mt-1">Monte Carlo · 10,000 iterations per run · Avg confidence {d.avgConfidence}%</div></div></div>}
      </div>
    </div>
  );
}
