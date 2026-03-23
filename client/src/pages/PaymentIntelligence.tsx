import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function PaymentIntelligence() {
  const [tab, setTab] = useState<"dashboard"|"risks"|"chargebacks">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey: ["/api/payment-intel/dashboard"], queryFn: () => fetch("/api/payment-intel/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: risks } = useQuery({ queryKey: ["/api/payment-intel/risks"], queryFn: () => fetch("/api/payment-intel/risks",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="risks" });
  const { data: chargebacks } = useQuery({ queryKey: ["/api/payment-intel/chargebacks"], queryFn: () => fetch("/api/payment-intel/chargebacks",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="chargebacks" });
  const clearMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/payment-intel/risks/${id}/clear`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Transaction cleared ✓"}); qc.invalidateQueries({queryKey:["/api/payment-intel"]}); } });
  const blockMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/payment-intel/risks/${id}/block`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Transaction blocked"}); qc.invalidateQueries({queryKey:["/api/payment-intel"]}); } });
  const d=(dash as any)||{};
  const riskColor=(r:string)=>r==="critical"?"#ef4444":r==="high"?"#f97316":r==="medium"?"#eab308":"#1DBF73";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Payment Intelligence</h1>
        <p className="text-sm text-gray-500 mb-5">Fraud Detection · Velocity Rules · Chargeback Management · Blocked Transactions</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Fraud Prevented",v:`R${((d.fraudPrevented||"R0").replace("R",""))}`,c:"#1DBF73"},{l:"Critical Flags",v:d.critical||0,c:"#ef4444"},{l:"Chargebacks",v:d.chargebacks||0,c:"#f97316"},{l:"Chargeback Rate",v:d.chargebackRate||"0%",c:"#6366f1"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","risks","chargebacks"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#f87171":"#6b7280",border:tab===t?"1px solid rgba(239,68,68,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="risks" && <div className="space-y-2">{((risks as any)?.risks||[]).map((r:any)=><div key={r.id} data-testid={`risk-${r.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${riskColor(r.risk)}20`}}><div className="flex items-start justify-between"><div><div className="flex gap-2 mb-1"><span className="font-mono text-sm text-blue-400">{r.txId}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${riskColor(r.risk)}20`,color:riskColor(r.risk)}}>{r.risk}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-bold">{r.status}</span></div><div className="text-xs text-gray-500">{r.reason} · {r.method} · {r.country}</div></div><div className="flex gap-1 ml-2">{r.status!=="cleared"&&<button onClick={()=>clearMut.mutate(r.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-700 text-white">Clear</button>}{r.status!=="blocked"&&<button onClick={()=>blockMut.mutate(r.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-red-700 text-white">Block</button>}</div></div></div>)}</div>}
        {tab==="chargebacks" && <div className="space-y-2">{((chargebacks as any)?.chargebacks||[]).map((c:any)=><div key={c.id} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between"><div><div className="text-sm font-bold text-white">{c.txId}</div><div className="text-xs text-gray-500">{c.reason} · {c.merchant}</div></div><div className="text-right"><div className="text-sm font-bold text-red-400">R{(c.amount/100).toLocaleString()}</div><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:c.status==="won"?"rgba(29,191,115,0.2)":c.status==="lost"?"rgba(239,68,68,0.2)":"rgba(107,114,128,0.2)",color:c.status==="won"?"#1DBF73":c.status==="lost"?"#ef4444":"#9ca3af"}}>{c.status}</span></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-3 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)"}}><div className="text-4xl font-black text-red-400">{d.blocked||0}</div><div className="text-sm text-gray-400 mt-1">Blocked Transactions</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-orange-400">{d.flagged||0}</div><div className="text-sm text-gray-400 mt-1">Flagged for Review</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Monitored</div></div></div>}
      </div>
    </div>
  );
}
