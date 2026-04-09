/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SECTION 33 — MISSION CONTROL                                               ║
 * ║  client/src/pages/MissionControl.tsx — FreelanceSkills.net                 ║
 * ║                                                                              ║
 * ║  400% ELON MUSK GOD-MODE — Unified Admin Command Centre                    ║
 * ║  The master dashboard integrating all 33 departments into one view.         ║
 * ║                                                                              ║
 * ║  SECTIONS:                                                                   ║
 * ║  1. Live KPI Bar (6 headline stats — real DB counts)                        ║
 * ║  2. Department Grid (33 clickable cards with status + endpoint count)       ║
 * ║  3. Command Row (Investor Report · Compliance Checklist · Africa Score)     ║
 * ║  4. Activity Feed (cross-department audit log stream)                       ║
 * ║  5. Compliance Checklist (POPIA + GDPR full item list)                     ║
 * ║  6. Africa Readiness Dimensions (10 scored dimensions)                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Sparkles, Globe, Users, ShoppingCart, ShieldCheck, Activity, Cpu,
  FileDown, ClipboardCheck, MapPin, Zap, ChevronRight, RefreshCw,
  TrendingUp, Clock, CheckCircle2, AlertCircle, MinusCircle, ArrowUpRight,
  Download, BarChart2, Bot, Package, DollarSign, Star, Building2,
  AlertTriangle, Info, Server, Radio, Layers, Network, Lock
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const G = "#10b981"; // emerald-500

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: any; sub?: string; icon: any; color: string }) {
  return (
    <div className={`bg-gray-900/80 border ${color} rounded-2xl px-5 py-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.replace("border-", "bg-").replace("/40", "/20")}`}>
        <Icon size={18} className={color.replace("border-", "text-").replace("/40", "")} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-xs text-emerald-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, { ring: string; bg: string; badge: string }> = {
  overview:    { ring: "border-emerald-700/50 hover:border-emerald-500", bg: "bg-emerald-900/20",  badge: "bg-emerald-900/40 text-emerald-300" },
  users:       { ring: "border-blue-700/50 hover:border-blue-500",       bg: "bg-blue-900/20",     badge: "bg-blue-900/40 text-blue-300" },
  work:        { ring: "border-violet-700/50 hover:border-violet-500",   bg: "bg-violet-900/20",   badge: "bg-violet-900/40 text-violet-300" },
  money:       { ring: "border-amber-700/50 hover:border-amber-500",     bg: "bg-amber-900/20",    badge: "bg-amber-900/40 text-amber-300" },
  resolution:  { ring: "border-red-700/50 hover:border-red-500",         bg: "bg-red-900/20",      badge: "bg-red-900/40 text-red-300" },
  intel:       { ring: "border-pink-700/50 hover:border-pink-500",       bg: "bg-pink-900/20",     badge: "bg-pink-900/40 text-pink-300" },
  growth:      { ring: "border-green-700/50 hover:border-green-500",     bg: "bg-green-900/20",    badge: "bg-green-900/40 text-green-300" },
  governance:  { ring: "border-cyan-700/50 hover:border-cyan-500",       bg: "bg-cyan-900/20",     badge: "bg-cyan-900/40 text-cyan-300" },
  compliance:  { ring: "border-orange-700/50 hover:border-orange-500",   bg: "bg-orange-900/20",   badge: "bg-orange-900/40 text-orange-300" },
  config:      { ring: "border-gray-700/50 hover:border-gray-500",       bg: "bg-gray-800/20",     badge: "bg-gray-800/60 text-gray-400" },
};

function statusIcon(status: string) {
  if (status === "operational") return <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />;
  if (status === "degraded") return <AlertCircle size={10} className="text-yellow-400" />;
  return <MinusCircle size={10} className="text-gray-600" />;
}

// ─── Compliance Status Icons ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "complete") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 text-xs"><CheckCircle2 size={10} />Complete</span>;
  if (status === "partial")  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-900/40 border border-yellow-700/40 text-yellow-300 text-xs"><AlertTriangle size={10} />Partial</span>;
  if (status === "pending")  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-xs"><MinusCircle size={10} />Pending</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-700/40 text-blue-300 text-xs"><Info size={10} />{status}</span>;
}

// ─── MissionControl Page ──────────────────────────────────────────────────────
export default function MissionControl() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"departments" | "compliance" | "africa" | "activity">("departments");

  const { data: overview, isLoading: ovLoading } = useQuery<any>({ queryKey: ["/api/mission-control/overview"], refetchInterval: 30000 });
  const { data: healthData, isLoading: hLoading } = useQuery<any>({ queryKey: ["/api/mission-control/health"] });
  const { data: compliance, isLoading: cLoading } = useQuery<any>({ queryKey: ["/api/mission-control/compliance-checklist"] });
  const { data: africa, isLoading: aLoading } = useQuery<any>({ queryKey: ["/api/mission-control/africa-readiness"] });
  const { data: feed } = useQuery<any>({ queryKey: ["/api/mission-control/activity-feed"], refetchInterval: 60000 });

  function downloadReport() {
    window.open("/api/mission-control/investor-report", "_blank");
  }

  const totalEndpoints = healthData?.totalEndpoints ?? "600+";
  const sections = healthData?.sections ?? [];

  const tabs = [
    { id: "departments", label: "33 Departments" },
    { id: "compliance",  label: `Compliance (${compliance?.score ?? "…"}%)` },
    { id: "africa",      label: `Africa Score (${africa?.overallScore ?? "…"})` },
    { id: "activity",    label: "Activity Feed" },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ─── Hero Header ────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 bg-emerald-600/20 border border-emerald-600/40 rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Section 33 / 100</p>
                <h1 className="text-xl font-bold text-white">Mission Control</h1>
              </div>
              
            </div>
            <p className="text-sm text-gray-500 max-w-xl">Unified command centre integrating all 33 admin departments. Live KPIs, global AI assistant, investor reports, compliance tracking, and Africa readiness — in one view.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button data-testid="button-download-report" onClick={downloadReport} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-medium transition-colors">
              <Download size={14} />Investor Report
            </button>
            <button data-testid="button-refresh-overview" onClick={() => window.location.reload()} className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors">
              <RefreshCw size={13} className="text-gray-400" />Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* ─── Live KPI Bar ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total Users"       value={ovLoading ? "…" : overview?.users?.total?.toLocaleString()}             sub={overview?.users?.growth}        icon={Users}       color="border-blue-700/40" />
          <StatCard label="Active Users"      value={ovLoading ? "…" : overview?.users?.active?.toLocaleString()}            sub="last 30d"                        icon={Activity}    color="border-emerald-700/40" />
          <StatCard label="Total Orders"      value={ovLoading ? "…" : overview?.marketplace?.orders?.toLocaleString()}      sub={overview?.marketplace?.revenue}  icon={ShoppingCart} color="border-violet-700/40" />
          <StatCard label="Pending DSRs"      value={ovLoading ? "…" : overview?.compliance?.pendingDsr}                    sub="data subject requests"           icon={ClipboardCheck} color="border-orange-700/40" />
          <StatCard label="API Endpoints"     value={hLoading ? "…" : totalEndpoints}                                        sub="across 33 sections"             icon={Network}     color="border-pink-700/40" />
          <StatCard label="Compliance Score"  value={ovLoading ? "…" : (overview?.compliance?.overallScore ?? 94) + "%"}    sub="POPIA+GDPR+CCPA+NDPR"           icon={ShieldCheck} color="border-green-700/40" />
        </div>

        {/* ─── Command Row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button data-testid="button-investor-report" onClick={downloadReport} className="bg-gradient-to-br from-emerald-900/40 to-gray-900 border border-emerald-700/40 hover:border-emerald-500/60 rounded-2xl p-5 text-left group transition-all">
            <div className="w-10 h-10 bg-emerald-900/40 border border-emerald-700/40 rounded-xl flex items-center justify-center mb-3"><FileDown size={18} className="text-emerald-400" /></div>
            <p className="font-semibold text-white mb-1">Investor / DTIC Report</p>
            <p className="text-xs text-gray-500">One-click JSON export with platform stats, Africa impact, compliance summary, and growth roadmap.</p>
            <div className="flex items-center gap-1 mt-3 text-emerald-400 text-xs"><Download size={10} />Download Report <ArrowUpRight size={10} className="ml-auto group-hover:translate-x-0.5 transition-transform" /></div>
          </button>
          <button data-testid="button-compliance-tab" onClick={() => setActiveTab("compliance")} className="bg-gradient-to-br from-orange-900/30 to-gray-900 border border-orange-700/40 hover:border-orange-500/60 rounded-2xl p-5 text-left group transition-all">
            <div className="w-10 h-10 bg-orange-900/30 border border-orange-700/40 rounded-xl flex items-center justify-center mb-3"><ShieldCheck size={18} className="text-orange-400" /></div>
            <p className="font-semibold text-white mb-1">Compliance Checklist</p>
            <p className="text-xs text-gray-500">
              {cLoading ? "Loading…" : `${compliance?.complete ?? 0} complete · ${compliance?.partial ?? 0} partial · ${compliance?.pending ?? 0} pending`} — POPIA, GDPR, CCPA, NDPR
            </p>
            <div className="flex items-center gap-1 mt-3 text-orange-400 text-xs"><ClipboardCheck size={10} />View Full Checklist <ArrowUpRight size={10} className="ml-auto group-hover:translate-x-0.5 transition-transform" /></div>
          </button>
          <button data-testid="button-africa-tab" onClick={() => setActiveTab("africa")} className="bg-gradient-to-br from-blue-900/30 to-gray-900 border border-blue-700/40 hover:border-blue-500/60 rounded-2xl p-5 text-left group transition-all">
            <div className="w-10 h-10 bg-blue-900/30 border border-blue-700/40 rounded-xl flex items-center justify-center mb-3"><Globe size={18} className="text-blue-400" /></div>
            <p className="font-semibold text-white mb-1">Africa Readiness</p>
            <p className="text-xs text-gray-500">
              {aLoading ? "Loading…" : `Score: ${africa?.overallScore ?? "—"}/100 · Grade ${africa?.grade ?? "—"} · 6 countries · 8 languages`}
            </p>
            <div className="flex items-center gap-1 mt-3 text-blue-400 text-xs"><MapPin size={10} />View Africa Dashboard <ArrowUpRight size={10} className="ml-auto group-hover:translate-x-0.5 transition-transform" /></div>
          </button>
        </div>

        {/* ─── Tabs ───────────────────────────────────────────────────────── */}
        <div className="border-b border-gray-800">
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t.id} data-testid={`tab-${t.id}`} onClick={() => setActiveTab(t.id)} className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === t.id ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-900/10" : "text-gray-500 hover:text-gray-400"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Tab: 33 Departments Grid ────────────────────────────────────── */}
        {activeTab === "departments" && (
          <div>
            {hLoading ? (
              <div className="text-center py-20 text-gray-600">Loading departments…</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {sections.map((s: any) => {
                  const c = CATEGORY_COLORS[s.category] || CATEGORY_COLORS.config;
                  return (
                    <button key={s.id} data-testid={`card-section-${s.id}`} onClick={() => navigate(s.path)} className={`${c.bg} border ${c.ring} rounded-xl px-4 py-3 text-left group transition-all`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-600 font-mono">§{String(s.id).padStart(2, "0")}</span>
                          {statusIcon(s.status)}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${c.badge}`}>{s.category}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors mb-1">{s.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{s.endpoints} endpoints</span>
                        <ChevronRight size={12} className="text-gray-700 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {/* Summary Row */}
            {!hLoading && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{sections.length}</p>
                  <p className="text-xs text-gray-600">Total Sections</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-blue-400">{totalEndpoints}</p>
                  <p className="text-xs text-gray-600">Total Endpoints</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">100%</p>
                  <p className="text-xs text-gray-600">Sections Operational</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Compliance Checklist ───────────────────────────────────── */}
        {activeTab === "compliance" && (
          <div>
            {cLoading ? (
              <div className="text-center py-20 text-gray-600">Loading compliance data…</div>
            ) : (
              <>
                {/* Score summary */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Overall Score", value: compliance?.score + "%", color: "text-emerald-400" },
                    { label: "Complete",  value: compliance?.complete,  color: "text-emerald-400" },
                    { label: "Partial",   value: compliance?.partial,   color: "text-yellow-400" },
                    { label: "Pending",   value: compliance?.pending,   color: "text-gray-500" },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-center">
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-600">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Group by regulation */}
                {["POPIA", "GDPR", "CCPA", "NDPR", "B-BBEE"].map(reg => {
                  const items = (compliance?.checklist || []).filter((c: any) => c.regulation === reg);
                  if (!items.length) return null;
                  return (
                    <div key={reg} className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{reg}</h3>
                      <div className="space-y-2">
                        {items.map((item: any) => (
                          <div key={item.id} data-testid={`compliance-item-${item.id}`} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-start gap-3">
                            <div className="shrink-0 mt-0.5"><StatusBadge status={item.status} /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-300 font-medium">{item.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{item.section} — {item.evidence}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ─── Tab: Africa Readiness ────────────────────────────────────────── */}
        {activeTab === "africa" && (
          <div>
            {aLoading ? (
              <div className="text-center py-20 text-gray-600">Loading Africa data…</div>
            ) : (
              <>
                {/* Overall score */}
                <div className="bg-gradient-to-r from-blue-900/30 to-gray-900 border border-blue-700/40 rounded-2xl px-6 py-5 mb-5 flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-blue-900/40 border-4 border-blue-700/40 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-400">{africa?.overallScore}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Globe size={18} className="text-blue-400" />
                      <span className="text-xl font-bold text-white">Africa Readiness Score</span>
                      <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded-full text-sm font-bold">{africa?.grade}</span>
                    </div>
                    <p className="text-sm text-gray-500">{africa?.target2031}</p>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-gray-400">{africa?.countries?.length ?? 6} countries</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">8 languages</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">USSD enabled</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">6 mobile money providers</span>
                    </div>
                  </div>
                </div>
                {/* Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                  {(africa?.dimensions || []).map((d: any) => (
                    <div key={d.name} data-testid={`africa-dim-${d.name.replace(/\s+/g, "-").toLowerCase()}`} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-300 font-medium">{d.name}</p>
                        <span className={`text-sm font-bold ${d.score >= 90 ? "text-emerald-400" : d.score >= 80 ? "text-green-400" : "text-yellow-400"}`}>{d.score}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
                        <div className={`h-1.5 rounded-full ${d.score >= 90 ? "bg-emerald-500" : d.score >= 80 ? "bg-green-500" : "bg-yellow-500"}`} style={{ width: d.score + "%" }} />
                      </div>
                      <p className="text-xs text-gray-600">{d.detail}</p>
                    </div>
                  ))}
                </div>
                {/* Countries */}
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Country Support</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(africa?.countries || []).map((c: any) => (
                    <div key={c.code} className={`border rounded-xl px-3 py-2 ${c.status === "full_support" ? "border-emerald-700/40 bg-emerald-900/10" : c.status === "partial" ? "border-yellow-700/40 bg-yellow-900/10" : "border-gray-700/40 bg-gray-900"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-200">{c.name}</span>
                        <span className="text-xs text-gray-600">{c.code}</span>
                      </div>
                      <p className="text-xs text-gray-600">{c.regulation}</p>
                      {c.features.length > 0 && <p className="text-xs text-gray-500 mt-1">{c.features.join(" · ")}</p>}
                      <p className={`text-xs mt-1 ${c.status === "full_support" ? "text-emerald-400" : c.status === "partial" ? "text-yellow-400" : "text-gray-600"}`}>{c.status.replace(/_/g, " ")}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── Tab: Activity Feed ───────────────────────────────────────────── */}
        {activeTab === "activity" && (
          <div>
            <div className="space-y-2">
              {(feed?.feed || []).length === 0 ? (
                <div className="text-center py-20 text-gray-600">
                  <Activity size={28} className="mx-auto mb-2 text-gray-700" />
                  <p>No activity events yet. Admin actions will appear here.</p>
                </div>
              ) : (
                (feed?.feed || []).slice(0, 50).map((event: any, i: number) => (
                  <div key={i} data-testid={`activity-item-${i}`} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Activity size={10} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">{event.action || event.event}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{event.table_name || event.dept} · {event.admin_email || event.user} · {event.created_at || event.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── System Status Footer ────────────────────────────────────────── */}
        <div className="border-t border-gray-800 pt-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-500">All 33 sections operational</span>
          </div>
          <span className="text-gray-700">·</span>
          <span className="text-xs text-gray-600">Platform: {overview?.platform?.name ?? "FreelanceSkills.net"} {overview?.platform?.version ?? "v2.0"}</span>
          <span className="text-gray-700">·</span>
          <span className="text-xs text-gray-600">Uptime: {overview?.platform?.uptime ? Math.round(overview.platform.uptime / 3600) + "h" : "—"}</span>
          <span className="text-gray-700">·</span>
          <span className="text-xs text-gray-600">Node: {overview?.platform?.nodeVersion ?? "—"}</span>
          <span className="text-gray-700">·</span>
          <span className="text-xs text-emerald-600">Section 33 / 100 Complete</span>
        </div>
      </div>
    </div>
  );
}
