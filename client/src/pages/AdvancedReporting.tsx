import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function AdvancedReporting() {
  const [tab, setTab] = useState<"dashboard"|"templates">("dashboard");
  const { toast } = useToast();
  const { data: dash } = useQuery({ queryKey:["/api/reporting/dashboard"], queryFn:()=>fetch("/api/reporting/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: templates } = useQuery({ queryKey:["/api/reporting/templates"], queryFn:()=>fetch("/api/reporting/templates",{credentials:"include"}).then(r=>r.json()), staleTime:30000, enabled:tab==="templates" });
  const genMut = useMutation({ mutationFn:(templateId:string)=>fetch("/api/reporting/generate",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({templateId})}).then(r=>r.json()), onSuccess:(d)=>toast({title:`"${d.job?.template}" generating — ETA ${d.job?.eta}`}) });
  const d=(dash as any)||{};
  const catColor=(c:string)=>({executive:"#6366f1",investor:"#1DBF73",compliance:"#eab308",operations:"#f97316",finance:"#a855f7",government:"#06b6d4"}[c]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Advanced Reporting Suite</h1>
        <p className="text-sm text-gray-500 mb-5">Board Pack · Investor Update · POPIA · DTIC · P&amp;L · Weekly KPIs · Custom Builder</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Templates",v:d.templates||0,c:"#6366f1"},{l:"Generated",v:d.generated||0,c:"#1DBF73"},{l:"Scheduled",v:d.scheduled||0,c:"#eab308"},{l:"Categories",v:d.categories||0,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","templates"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        {tab==="templates"&&<div className="space-y-2">{((templates as any)?.templates||[]).map((tpl:any)=><div key={tpl.id} data-testid={`report-tpl-${tpl.id}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${catColor(tpl.category)}15`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-0.5"><span className="font-bold text-white">{tpl.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize" style={{background:`${catColor(tpl.category)}20`,color:catColor(tpl.category)}}>{tpl.category}</span></div><div className="text-xs text-gray-500">{tpl.sections} sections · {tpl.schedule}</div><div className="text-xs text-gray-600">Last: {new Date(tpl.lastGenerated).toLocaleDateString()}</div></div><button data-testid={`gen-${tpl.id}`} onClick={()=>genMut.mutate(tpl.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-700 ml-2">Generate</button></div></div>)}</div>}
        {tab==="dashboard"&&<div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)"}}><div className="text-4xl font-black text-indigo-400">{d.templates||0}</div><div className="text-sm text-gray-400 mt-1">Report Templates</div></div><div className="rounded-2xl p-6" style={{background:"rgba(29,191,115,0.06)",border:"1px solid rgba(29,191,115,0.2)"}}><div className="text-4xl font-black text-emerald-400">{d.generated||0}</div><div className="text-sm text-gray-400 mt-1">Reports Generated</div></div></div>}
      </div>
    </div>
  );
}
