import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function TimeTracking() {
  const [tab, setTab] = useState<"dashboard"|"timesheets">("dashboard");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/timesheets/dashboard"], queryFn:()=>fetch("/api/timesheets/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: timesheets } = useQuery({ queryKey:["/api/timesheets/list",statusFilter], queryFn:()=>fetch(`/api/timesheets/list${statusFilter?`?status=${statusFilter}`:""}`,{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="timesheets" });
  const approveMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/timesheets/${id}/approve`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Timesheet approved ✓"}); qc.invalidateQueries({queryKey:["/api/timesheets"]}); } });
  const payMut = useMutation({ mutationFn:(id:string)=>fetch(`/api/timesheets/${id}/pay`,{method:"POST",credentials:"include"}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Payment initiated 💸"}); qc.invalidateQueries({queryKey:["/api/timesheets"]}); } });
  const d=(dash as any)||{};
  const statusColor=(s:string)=>({pending:"#eab308",approved:"#6366f1",paid:"#1DBF73",rejected:"#ef4444"}[s]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Time Tracking & Timesheets</h1>
        <p className="text-sm text-gray-500 mb-5">Hourly Billing · Weekly Timesheets · Approval Workflow · Payroll Integration</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Pending",v:d.pending||0,c:"#eab308"},{l:"Total Hours",v:`${(d.totalHours||0).toFixed(1)}h`,c:"#6366f1"},{l:"Total Amount",v:`R${((d.totalAmount||0)/100).toLocaleString()}`,c:"#1DBF73"},{l:"Paid",v:d.paid||0,c:"#1DBF73"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","timesheets"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="timesheets"&&<div className="space-y-2"><div className="flex gap-2 mb-3">{["","pending","approved","paid"].map(s=><button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${statusFilter===s?"bg-indigo-700 text-white":"bg-gray-800 text-gray-400"}`}>{s||"All"}</button>)}</div>{((timesheets as any)?.timesheets||[]).map((t:any)=><div key={t.id} data-testid={`timesheet-${t.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{t.freelancerName}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${statusColor(t.status)}20`,color:statusColor(t.status)}}>{t.status}</span></div><div className="text-xs text-gray-500">{t.clientName} · {t.week}</div><div className="text-xs text-gray-600">{t.hours.toFixed(1)}h · R{(t.rate/100).toLocaleString()}/hr</div></div><div className="text-right"><div className="text-sm font-bold text-white">R{(t.amount/100).toLocaleString()}</div><div className="flex gap-1 mt-1">{t.status==="pending"&&<button onClick={()=>approveMut.mutate(t.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-700 text-white">Approve</button>}{t.status==="approved"&&<button onClick={()=>payMut.mutate(t.id)} className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-700 text-white">Pay</button>}</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-indigo-400">{d.total||0}</div><div className="text-sm text-gray-400 mt-1">Total Timesheets</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">R{((d.totalAmount||0)/100).toLocaleString()}</div><div className="text-sm text-gray-400 mt-1">Total Billable</div></div></div>}
      </div>
    </div>
  );
}
