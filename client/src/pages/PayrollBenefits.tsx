import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function PayrollBenefits() {
  const [tab, setTab] = useState<"dashboard"|"runs"|"benefits">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/payroll/dashboard"], queryFn:()=>fetch("/api/payroll/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: runs } = useQuery({ queryKey:["/api/payroll/runs"], queryFn:()=>fetch("/api/payroll/runs",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="runs" });
  const { data: benefits } = useQuery({ queryKey:["/api/payroll/benefits"], queryFn:()=>fetch("/api/payroll/benefits",{credentials:"include"}).then(r=>r.json()), staleTime:60000, enabled:tab==="benefits" });
  const approveMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/payroll/${id}/approve`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Payroll approved ✓"}); qc.invalidateQueries({queryKey:["/api/payroll"]}); } });
  const payMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/payroll/${id}/pay`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Payroll disbursed 💸 All freelancers notified"}); qc.invalidateQueries({queryKey:["/api/payroll"]}); } });
  const d=(dash as any)||{};
  const statusColor=(s:string)=>({draft:"#eab308",approved:"#6366f1",paid:"#1DBF73",failed:"#ef4444"}[s]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Payroll & Benefits</h1>
        <p className="text-sm text-gray-500 mb-5">Automated Payroll · PAYE · UIF · SDL · Medical Aid · Group Life · Income Protection · EFT</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Total Disbursed",v:`R${((d.totalDisbursed||0)/100/1000000).toFixed(1)}M`,c:"#1DBF73"},{l:"Payroll Runs",v:d.totalRuns||0,c:"#6366f1"},{l:"Benefits",v:d.benefits||0,c:"#eab308"},{l:"Benefit Enrolled",v:(d.totalBenefitEnrolled||0).toLocaleString(),c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","runs","benefits"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(29,191,115,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#1DBF73":"#6b7280",border:tab===t?"1px solid rgba(29,191,115,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="runs"&&<div className="space-y-2">{((runs as any)?.runs||[]).map((r:any)=><div key={r.id} data-testid={`payroll-${r.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{r.period}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${statusColor(r.status)}20`,color:statusColor(r.status)}}>{r.status}</span></div><div className="text-xs text-gray-500">{(r.freelancers||0).toLocaleString()} freelancers · Net: R{((r.totalNet||0)/100/1000000).toFixed(1)}M</div></div><div className="flex gap-1">{r.status==="draft"&&<button onClick={()=>approveMut.mutate(r.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-700 text-white">Approve</button>}{r.status==="approved"&&<button onClick={()=>payMut.mutate(r.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-700 text-white">Pay All</button>}</div></div></div>)}</div>}
        {tab==="benefits"&&<div className="space-y-2">{((benefits as any)?.benefits||[]).map((b:any,i:number)=><div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between"><div><div className="font-bold text-white">{b.name}</div><div className="text-xs text-gray-500">{b.provider} · {b.coverage}</div></div><div className="text-right"><div className="text-sm font-bold text-white">R{((b.monthlyContrib||0)/100).toLocaleString()}/mo</div><div className="text-xs text-emerald-400">{b.enrolled} enrolled</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.07)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">R{((d.totalDisbursed||0)/100/1000000).toFixed(1)}M</div><div className="text-sm text-gray-400 mt-1">Total Disbursed (All Time)</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{d.paid||0}</div><div className="text-sm text-gray-400 mt-1">Completed Payroll Runs</div></div></div>}
      </div>
    </div>
  );
}
