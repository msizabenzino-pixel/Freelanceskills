import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
export default function MultiCurrency() {
  const [tab, setTab] = useState<"dashboard"|"rates">("dashboard");
  const [from, setFrom] = useState("USD"); const [to, setTo] = useState("ZAR"); const [amount, setAmount] = useState(1000);
  const { toast } = useToast();
  const { data: dash } = useQuery({ queryKey:["/api/currency/dashboard"], queryFn:()=>fetch("/api/currency/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:10000 });
  const { data: rates } = useQuery({ queryKey:["/api/currency/rates"], queryFn:()=>fetch("/api/currency/rates",{credentials:"include"}).then(r=>r.json()), staleTime:10000, enabled:tab==="rates" });
  const convertMut = useMutation({ mutationFn:(body:any)=>fetch("/api/currency/convert",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(body)}).then(r=>r.json()), onSuccess:(d)=>toast({title:`Converted: R${(d.conversion?.result||0).toLocaleString()} ZAR`}) });
  const d=(dash as any)||{}; const r=(rates as any)||{};
  const dirColor=(dir:string)=>dir==="up"?"#1DBF73":"#ef4444";
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Multi-Currency Exchange</h1>
        <p className="text-sm text-gray-500 mb-5">USD · GBP · EUR · KES · NGN · GHS · Live SARB Rates · FX Exposure Management</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[{l:"Currencies",v:(d.rates||[]).length||0,c:"#6366f1"},{l:"ZAR Revenue",v:`R${((d.exposure?.zarRevenue||0)/1000000).toFixed(0)}M`,c:"#1DBF73"},{l:"FX Risk",v:(d.exposure?.fxRisk||"—").toUpperCase(),c:"#eab308"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","rates"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
        </div>
        <div className="rounded-2xl p-5 mb-4" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><div className="text-sm font-bold text-gray-400 mb-3">Currency Converter</div><div className="flex items-center gap-3"><input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="flex-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm" /><select value={from} onChange={e=>setFrom(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm">{["USD","GBP","EUR","KES","NGN","GHS"].map(c=><option key={c}>{c}</option>)}</select><span className="text-gray-500">→</span><select value={to} onChange={e=>setTo(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm">{["ZAR","USD","GBP","EUR"].map(c=><option key={c}>{c}</option>)}</select><button onClick={()=>convertMut.mutate({from,to,amount})} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-indigo-700">Convert</button></div></div>
        {tab==="rates"&&<div className="space-y-2">{((r.rates||[]) as any[]).map((rt:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between items-center"><div className="font-mono font-bold text-white">{rt.pair}</div><div className="flex items-center gap-2"><span className="text-sm font-bold text-white">{rt.rate}</span><span style={{color:dirColor(rt.direction)}}>{rt.direction==="up"?"↑":"↓"} {Math.abs(rt.change).toFixed(3)}</span></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="space-y-2">{((d.rates||[]) as any[]).map((rt:any,i:number)=><div key={i} className="rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="flex justify-between"><div className="font-mono text-white">{rt.pair}</div><div><span className="font-bold text-white">{rt.rate}</span><span className="ml-2" style={{color:dirColor(rt.direction)}}>{rt.direction==="up"?"↑":"↓"}</span></div></div></div>)}</div>}
      </div>
    </div>
  );
}
