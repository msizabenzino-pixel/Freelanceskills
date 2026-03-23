import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function DataExport() {
  const [tab, setTab] = useState<"dashboard"|"jobs"|"saved-reports">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey:["/api/data-export/dashboard"], queryFn:()=>fetch("/api/data-export/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: jobs } = useQuery({ queryKey:["/api/data-export/jobs"], queryFn:()=>fetch("/api/data-export/jobs",{credentials:"include"}).then(r=>r.json()), staleTime:10000, enabled:tab==="jobs" });
  const { data: reports } = useQuery({ queryKey:["/api/data-export/saved-reports"], queryFn:()=>fetch("/api/data-export/saved-reports",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="saved-reports" });
  const exportMut = useMutation({ mutationFn:(body:any)=>fetch("/api/data-export/export",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(body)}).then(r=>r.json()), onSuccess:()=>{ toast({title:"Export queued ✓"}); qc.invalidateQueries({queryKey:["/api/data-export"]}); } });
  const d=(dash as any)||{};
  const statusColor=(s:string)=>({completed:"#1DBF73",processing:"#6366f1",queued:"#eab308",failed:"#ef4444"}[s]||"#9ca3af");
  const typeIcon=(t:string)=>({csv:"📄",excel:"📊",json:"{ }",pdf:"📑"}[t]||"📁");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Data Export & BI</h1>
        <p className="text-sm text-gray-500 mb-5">CSV · Excel · JSON · PDF Export · Saved Reports · Scheduled Exports · BI Connectors</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Total Exports",v:d.totalExports||0,c:"#6366f1"},{l:"Rows Exported",v:(d.totalRowsExported||0).toLocaleString(),c:"#1DBF73"},{l:"Saved Reports",v:d.savedReports||0,c:"#eab308"},{l:"Processing",v:d.processing||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","jobs","saved-reports"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t.replace("-"," ")}</button>)}
          <button onClick={()=>exportMut.mutate({name:"Quick Export",type:"csv",dataset:"users"})} className="ml-auto px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-700">↓ Export Now</button>
        </div>
        {tab==="jobs"&&<div className="space-y-2">{((jobs as any)?.jobs||[]).map((j:any)=><div key={j.id} data-testid={`job-${j.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex items-center justify-between"><div><div className="flex items-center gap-2 mb-1"><span>{typeIcon(j.type)}</span><span className="font-bold text-white">{j.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{background:`${statusColor(j.status)}20`,color:statusColor(j.status)}}>{j.status}</span></div><div className="text-xs text-gray-500">{j.dataset} · {(j.rows||0).toLocaleString()} rows · {(j.fileSizeKb||0).toLocaleString()} KB</div></div>{j.downloadUrl&&<a href={j.downloadUrl} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700">↓ Download</a>}</div></div>)}</div>}
        {tab==="saved-reports"&&<div className="space-y-2">{((reports as any)?.reports||[]).map((r:any)=><div key={r.id} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="flex justify-between"><div><div className="text-sm font-bold text-white">{r.name}</div><div className="text-xs text-gray-500">{r.schedule}</div></div><div className="text-right"><div className="text-xs text-gray-500">Last run:</div><div className="text-xs text-white">{new Date(r.lastRun).toLocaleDateString()}</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-indigo-400">{d.totalExports||0}</div><div className="text-sm text-gray-400 mt-1">Export Jobs</div></div><div className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-4xl font-black text-white">{(d.totalRowsExported||0).toLocaleString()}</div><div className="text-sm text-gray-400 mt-1">Total Rows Exported</div></div></div>}
      </div>
    </div>
  );
}
