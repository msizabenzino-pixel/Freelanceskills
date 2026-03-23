import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
export default function BlockchainVerification() {
  const [tab, setTab] = useState<"dashboard"|"credentials">("dashboard");
  const { toast } = useToast();
  const { data: dash } = useQuery({ queryKey:["/api/blockchain/dashboard"], queryFn:()=>fetch("/api/blockchain/dashboard",{credentials:"include"}).then(r=>r.json()), staleTime:20000 });
  const { data: credentials } = useQuery({ queryKey:["/api/blockchain/credentials"], queryFn:()=>fetch("/api/blockchain/credentials",{credentials:"include"}).then(r=>r.json()), staleTime:15000, enabled:tab==="credentials" });
  const mintMut = useMutation({ mutationFn:(body:any)=>fetch("/api/blockchain/mint",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(body)}).then(r=>r.json()), onSuccess:(d)=>toast({title:`NFT Credential Minted — Tx: ${d.credential?.txHash?.slice(0,12)}…`}) });
  const d=(dash as any)||{};
  const typeColor=(t:string)=>({skill_cert:"#6366f1",work_history:"#1DBF73",identity:"#eab308",qualification:"#f97316"}[t]||"#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{background:"#080d1a"}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">Blockchain Verification</h1>
        <p className="text-sm text-gray-500 mb-5">NFT Credentials · Polygon Network · Immutable Work History · Smart Contracts · Verifiable Badges</p>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{l:"Total Minted",v:(d.totalMinted||0).toLocaleString(),c:"#6366f1"},{l:"Verified",v:(d.totalVerified||0).toLocaleString(),c:"#1DBF73"},{l:"Avg Verify",v:`${((d.avgVerifyMs||0)/1000).toFixed(1)}s`,c:"#eab308"},{l:"Gas Spent",v:`$${d.gasUsedUSD||0}`,c:"#f97316"}].map((s,i)=>(
            <div key={i} className="rounded-xl p-4" style={{background:`${s.c}10`,border:`1px solid ${s.c}25`}}><div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard","credentials"] as const).map(t=><button key={t} onClick={()=>setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold capitalize" style={{background:tab===t?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.04)",color:tab===t?"#818cf8":"#6b7280",border:tab===t?"1px solid rgba(99,102,241,0.3)":"1px solid rgba(255,255,255,0.08)"}}>{t}</button>)}
          <button onClick={()=>mintMut.mutate({holder:"Test Freelancer",type:"skill_cert"})} className="ml-auto px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-700">⛓ Mint Credential</button>
        </div>
        {tab==="credentials"&&<div className="space-y-2">{((credentials as any)?.credentials||[]).map((c:any,i:number)=><div key={i} data-testid={`cred-${i}`} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${typeColor(c.type)}20`}}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-bold text-white">{c.holder}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:`${typeColor(c.type)}20`,color:typeColor(c.type)}}>{(c.type||"").replace("_"," ")}</span>{c.verified&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">✓ VERIFIED</span>}</div><div className="font-mono text-[10px] text-indigo-400">{(c.txHash||"").slice(0,24)}…</div><div className="text-xs text-gray-500 mt-0.5">Issued: {format(new Date(c.issuedAt),"MMM d, yyyy")} · {c.network}</div></div></div></div>)}</div>}
        {tab==="dashboard"&&<div className="space-y-3"><div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="text-xs text-gray-500 mb-1">Smart Contract</div><div className="font-mono text-xs text-indigo-400">{d.smartContractAddress||"—"}</div></div><div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}><div className="text-xs text-gray-500 mb-1">Network</div><div className="text-sm font-bold text-white">{d.network||"Polygon Mainnet"}</div></div></div>}
      </div>
    </div>
  );
}
