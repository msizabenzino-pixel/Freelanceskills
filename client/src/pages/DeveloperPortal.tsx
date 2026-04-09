/**
 * Section 49 — API Gateway & Developer Portal v4.0
 * FreelanceSkills.net Admin Module
 * API Key Management · Webhooks · Rate Limiting · Scopes · SDK Docs
 * Beats Kong + Apigee + AWS API Gateway + MuleSoft until 2030
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function DeveloperPortal() {
  const [tab, setTab] = useState<"dashboard" | "apikeys" | "webhooks" | "docs">("dashboard");
  const { toast } = useToast(); const qc = useQueryClient();
  const { data: dash } = useQuery({ queryKey: ["/api/developer/dashboard"], queryFn: () => fetch("/api/developer/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 20000 });
  const { data: keys } = useQuery({ queryKey: ["/api/developer/api-keys"], queryFn: () => fetch("/api/developer/api-keys", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "apikeys" });
  const { data: webhooks } = useQuery({ queryKey: ["/api/developer/webhooks"], queryFn: () => fetch("/api/developer/webhooks", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "webhooks" });
  const { data: docs } = useQuery({ queryKey: ["/api/developer/docs"], queryFn: () => fetch("/api/developer/docs", { credentials: "include" }).then(r => r.json()), staleTime: 60000, enabled: tab === "docs" });
  const revokeKey = useMutation({ mutationFn: (id: string) => fetch(`/api/developer/api-keys/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "API key revoked" }); qc.invalidateQueries({ queryKey: ["/api/developer/api-keys"] }); } });
  const deleteWebhook = useMutation({ mutationFn: (id: string) => fetch(`/api/developer/webhooks/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()), onSuccess: () => { toast({ title: "Webhook deleted" }); qc.invalidateQueries({ queryKey: ["/api/developer/webhooks"] }); } });
  const d = (dash as any) || {};
  const planColor = (p: string) => ({ enterprise: "#FFD700", pro: "#1DBF73", starter: "#6366f1", free: "#6b7280" }[p] || "#9ca3af");
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">API Gateway & Developer Portal</h1>
        <p className="text-sm text-gray-500 mb-6">API Keys · Webhooks · Rate Limiting · Scopes · SDK Docs · 300+ Endpoints</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "API Keys", value: d.apiKeys || 0, icon: "🔑" }, { label: "Total Requests", value: (d.totalRequests || 0).toLocaleString(), icon: "🌐" }, { label: "Webhooks", value: d.webhooks || 0, icon: "🔗" }, { label: "Failure Rate", value: `${d.failureRate || 0}%`, icon: "⚠" }].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(["dashboard", "apikeys", "webhooks", "docs"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: tab === t ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.04)", color: tab === t ? "#06b6d4" : "#6b7280", border: tab === t ? "1px solid rgba(6,182,212,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>{t === "dashboard" ? "📊 Overview" : t === "apikeys" ? "🔑 API Keys" : t === "webhooks" ? "🔗 Webhooks" : "📖 Docs"}</button>)}
        </div>
        {tab === "apikeys" && (
          <div className="space-y-2">
            {((keys as any)?.keys || []).map((k: any) => (
              <div key={k.id} data-testid={`apikey-${k.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{k.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: `${planColor(k.plan)}20`, color: planColor(k.plan) }}>{k.plan}</span>
                    </div>
                    <div className="font-mono text-xs text-gray-400 mb-1">{k.key}</div>
                    <div className="text-xs text-gray-500">{k.owner} · {k.requests.toLocaleString()} requests · Rate: {k.rateLimit}/min</div>
                    <div className="flex gap-1 mt-1 flex-wrap">{(k.scopes || []).map((s: string) => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-cyan-400">{s}</span>)}</div>
                  </div>
                  <button data-testid={`revoke-${k.id}`} onClick={() => revokeKey.mutate(k.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-900/40 text-red-400 ml-2">Revoke</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "webhooks" && (
          <div className="space-y-2">
            {((webhooks as any)?.webhooks || []).map((w: any) => (
              <div key={w.id} data-testid={`webhook-${w.id}`} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-sm text-cyan-400 mb-1">{w.url}</div>
                    <div className="text-xs text-gray-500">{w.owner} · {w.deliveries.toLocaleString()} deliveries · {w.failures} failures</div>
                    <div className="flex gap-1 mt-1 flex-wrap">{(w.events || []).map((e: string) => <span key={e} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{e}</span>)}</div>
                  </div>
                  <button data-testid={`del-webhook-${w.id}`} onClick={() => deleteWebhook.mutate(w.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-900/40 text-red-400 ml-2">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "docs" && (
          <div className="space-y-3">
            <div className="rounded-xl p-5" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <div className="text-white font-black text-lg mb-2">FreelanceSkills API {(docs as any)?.version}</div>
              <div className="text-xs text-cyan-400 font-mono mb-3">{(docs as any)?.baseUrl}</div>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                <div>🔐 Auth: {(docs as any)?.auth}</div>
                <div>⚡ Endpoints: {(docs as any)?.endpoints}+</div>
                <div>⏱ Rate: {(docs as any)?.rateLimit}</div>
                <div>🌍 Global: Africa-First</div>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-xs font-bold text-white mb-2">SDKs</div>
              <div className="flex gap-2 flex-wrap">{((docs as any)?.sdks || []).map((s: string) => <span key={s} className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-bold">{s}</span>)}</div>
            </div>
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-xs font-bold text-white mb-2">Webhook Events</div>
              <div className="grid grid-cols-2 gap-1">{((docs as any)?.events || []).map((e: string) => <div key={e} className="font-mono text-[10px] text-cyan-400">{e}</div>)}</div>
            </div>
          </div>
        )}
        {tab === "dashboard" && <div className="grid grid-cols-2 gap-4"><div className="rounded-2xl p-6" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}><div className="text-4xl font-black text-cyan-400">{d.totalRequests?.toLocaleString() || 0}</div><div className="text-sm text-gray-400 mt-1">Total API Requests</div></div><div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}><div className="text-4xl font-black text-white">{d.activeApps || 0}</div><div className="text-sm text-gray-400 mt-1">Active Apps</div></div></div>}
      </div>
    </div>
  );
}
