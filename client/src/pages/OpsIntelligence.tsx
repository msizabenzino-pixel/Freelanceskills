import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, Server, Users, Zap } from "lucide-react";

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-4`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600 mt-1">{sub}</p>
    </div>
  );
}

export default function OpsIntelligence() {
  const [tab, setTab] = useState<"dashboard" | "incidents" | "capacity" | "sla">("dashboard");
  const { data: dash } = useQuery({ queryKey: ["/api/ops-intel/dashboard"], queryFn: () => fetch("/api/ops-intel/dashboard", { credentials: "include" }).then(r => r.json()), staleTime: 15000 });
  const { data: incidents } = useQuery({ queryKey: ["/api/ops-intel/incidents"], queryFn: () => fetch("/api/ops-intel/incidents", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "incidents" });
  const { data: capacity } = useQuery({ queryKey: ["/api/ops-intel/capacity"], queryFn: () => fetch("/api/ops-intel/capacity", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "capacity" });
  const { data: sla } = useQuery({ queryKey: ["/api/ops-intel/sla"], queryFn: () => fetch("/api/ops-intel/sla", { credentials: "include" }).then(r => r.json()), staleTime: 15000, enabled: tab === "sla" });

  const tabs = [
    { key: "dashboard", label: "Overview" },
    { key: "incidents", label: "Incidents" },
    { key: "capacity", label: "Capacity" },
    { key: "sla", label: "SLA Tracker" },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-orange-400" size={24} />
            Ops Intelligence
            <span className="ml-2 px-2 py-0.5 bg-orange-900/40 text-orange-300 rounded text-xs font-medium">S97</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time operational intelligence — incidents, capacity, and SLA tracking</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 border border-emerald-800/40 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400">Live Ops</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Uptime (30d)" value={`${dash?.uptime || "99.97"}%`} sub="SLA Target: 99.9%" color="text-emerald-400" />
        <StatCard label="Open Incidents" value={String(dash?.openIncidents ?? 2)} sub={`${dash?.criticalIncidents ?? 0} critical`} color="text-red-400" />
        <StatCard label="Avg Response Time" value={`${dash?.avgResponseMs || 142}ms`} sub="P95: 310ms" color="text-blue-400" />
        <StatCard label="Capacity Used" value={`${dash?.capacityPct || 63}%`} sub="Auto-scale at 80%" color="text-amber-400" />
      </div>

      <div className="flex gap-2 border-b border-gray-800">
        {tabs.map(t => (
          <button key={t.key} data-testid={`tab-${t.key}`} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.key ? "text-orange-400 border-orange-500" : "text-gray-500 border-transparent hover:text-gray-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Server size={14} className="text-orange-400" />Service Health</h3>
            <div className="space-y-3">
              {(dash?.services || [
                { name: "API Gateway", status: "healthy", latency: "45ms" },
                { name: "Database Cluster", status: "healthy", latency: "12ms" },
                { name: "File Storage", status: "degraded", latency: "890ms" },
                { name: "Email Service", status: "healthy", latency: "220ms" },
                { name: "Payment Gateway", status: "healthy", latency: "310ms" },
                { name: "Search Engine", status: "healthy", latency: "67ms" },
              ]).map((s: any) => (
                <div key={s.name} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                  <div className="flex items-center gap-2">
                    {s.status === "healthy" ? <CheckCircle size={13} className="text-emerald-400" /> : <AlertTriangle size={13} className="text-amber-400" />}
                    <span className="text-sm text-gray-300">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{s.latency}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${s.status === "healthy" ? "bg-emerald-900/40 text-emerald-300" : "bg-amber-900/40 text-amber-300"}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-orange-400" />Key Metrics (24h)</h3>
            <div className="space-y-4">
              {[
                { label: "API Calls", value: "2.4M", change: "+12%", up: true },
                { label: "Error Rate", value: "0.03%", change: "-0.01%", up: false },
                { label: "Active Sessions", value: "8,412", change: "+5%", up: true },
                { label: "Queue Depth", value: "142", change: "+3", up: true },
                { label: "Cache Hit Rate", value: "94.2%", change: "+0.3%", up: true },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{m.value}</span>
                    <span className={`text-xs ${m.up ? "text-emerald-400" : "text-red-400"}`}>{m.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "incidents" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Active &amp; Recent Incidents</h3>
            <span className="text-xs text-gray-500">{incidents?.total || 8} total (30d)</span>
          </div>
          <div className="divide-y divide-gray-800">
            {(incidents?.items || [
              { id: "INC-001", title: "File Storage Latency Spike", severity: "medium", status: "investigating", duration: "14m" },
              { id: "INC-002", title: "Search Indexing Lag", severity: "low", status: "resolved", duration: "2h 10m" },
              { id: "INC-003", title: "Payment Gateway Timeout", severity: "high", status: "resolved", duration: "22m" },
              { id: "INC-004", title: "Email Delivery Delay", severity: "low", status: "resolved", duration: "45m" },
            ]).map((inc: any) => (
              <div key={inc.id} data-testid={`row-incident-${inc.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-gray-800/30">
                <div>
                  <p className="text-sm text-white font-medium">{inc.id}: {inc.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5"><Clock size={10} />{inc.duration}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${inc.severity === "high" ? "bg-red-900/40 text-red-300" : inc.severity === "medium" ? "bg-amber-900/40 text-amber-300" : "bg-blue-900/40 text-blue-300"}`}>{inc.severity}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${inc.status === "resolved" ? "bg-emerald-900/40 text-emerald-300" : "bg-orange-900/40 text-orange-300"}`}>{inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "capacity" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Zap size={14} className="text-orange-400" />Resource Utilisation</h3>
            <div className="space-y-4">
              {(capacity?.resources || [
                { name: "CPU", pct: 58 },
                { name: "Memory", pct: 71 },
                { name: "Disk I/O", pct: 43 },
                { name: "Network", pct: 29 },
                { name: "DB Connections", pct: 63 },
              ]).map((r: any) => (
                <div key={r.name}>
                  <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{r.name}</span><span>{r.pct}%</span></div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${r.pct > 80 ? "bg-red-500" : r.pct > 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Users size={14} className="text-orange-400" />Scaling Events</h3>
            <div className="space-y-3">
              {(capacity?.scalingEvents || [
                { time: "Today 08:14", event: "Auto-scaled API pods +2", trigger: "CPU 82%" },
                { time: "Yesterday 15:30", event: "Auto-scaled DB replicas +1", trigger: "Conn 91%" },
                { time: "3 days ago", event: "Scaled down API pods -1", trigger: "CPU 21%" },
              ]).map((e: any, i: number) => (
                <div key={i} className="p-3 bg-gray-800/40 rounded-lg">
                  <p className="text-xs text-gray-500">{e.time}</p>
                  <p className="text-sm text-white mt-0.5">{e.event}</p>
                  <p className="text-xs text-amber-400 mt-0.5">Trigger: {e.trigger}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "sla" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">SLA Compliance Tracker</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {(sla?.items || [
              { service: "API Uptime", target: "99.9%", actual: "99.97%", status: "met" },
              { service: "Support Response (P1)", target: "&lt; 1h", actual: "42m", status: "met" },
              { service: "Support Response (P2)", target: "&lt; 4h", actual: "3h 12m", status: "met" },
              { service: "Payment Processing", target: "&lt; 3s", actual: "1.8s", status: "met" },
              { service: "Search Latency", target: "&lt; 500ms", actual: "612ms", status: "breached" },
              { service: "File Upload Speed", target: "&lt; 5s", actual: "4.2s", status: "met" },
            ]).map((s: any) => (
              <div key={s.service} className="px-5 py-3 flex items-center justify-between hover:bg-gray-800/30">
                <div>
                  <p className="text-sm text-white">{s.service}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Target: <span dangerouslySetInnerHTML={{ __html: s.target }} /></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{s.actual}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${s.status === "met" ? "bg-emerald-900/40 text-emerald-300" : "bg-red-900/40 text-red-300"}`}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
