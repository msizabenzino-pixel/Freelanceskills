/**
 * Analytics Deep Dive — FreelanceSkills.net Admin
 * $1B platform analytics brain — 5 tabs, real-time Socket.io, full export
 * Africa-first insights | Recharts | TanStack Query | date-fns
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, subDays, parseISO } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// ─── Brand / palette ──────────────────────────────────────────────────────────
const G = "#1DBF73";
const PALETTE = [G, "#60a5fa", "#f59e0b", "#ef4444", "#a78bfa", "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#06b6d4"];
const AFRICA = ["South Africa","Nigeria","Kenya","Zimbabwe","Namibia","Botswana","Zambia","Mozambique","Ghana","Tanzania","Uganda","Rwanda","Ethiopia","Senegal","Ivory Coast","Angola","Cameroon","Egypt","Morocco"];

// ─── Utils ────────────────────────────────────────────────────────────────────
const zarFmt = (c: number) => `R${(c / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const capFmt = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "";
const numFmt = (n: number) => n.toLocaleString("en-ZA");
const pctFmt = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%";

function TrendArrow({ change }: { change: number }) {
  if (change === 0) return <span className="text-gray-400 text-xs">—</span>;
  return change > 0
    ? <span className="text-emerald-600 text-xs font-bold">▲ {pctFmt(change)}</span>
    : <span className="text-red-500 text-xs font-bold">▼ {pctFmt(change)}</span>;
}

function KpiCard({ label, value, change, sub, prefix = "", color }: {
  label: string; value: string | number; change?: number; sub?: string; prefix?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-3xl font-bold text-gray-900" style={{ color: color || "#111" }}>{prefix}{value}</div>
      {change !== undefined && <TrendArrow change={change} />}
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-[15px]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-300">
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      <span className="text-sm">No data for this period</span>
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span className="font-bold">{numFmt(value)} <span className="text-gray-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, background: color }}></div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, isCents }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <div className="font-semibold text-gray-700 mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }}></span>
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>
            {isCents ? zarFmt(p.value) : numFmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── CSV Export helper ─────────────────────────────────────────────────────────
function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── Country emoji flags ────────────────────────────────────────────────────
const countryFlag: Record<string, string> = {
  "South Africa": "🇿🇦", "Nigeria": "🇳🇬", "Kenya": "🇰🇪", "Zimbabwe": "🇿🇼",
  "Namibia": "🇳🇦", "Botswana": "🇧🇼", "Zambia": "🇿🇲", "Mozambique": "🇲🇿",
  "Ghana": "🇬🇭", "Tanzania": "🇹🇿", "Uganda": "🇺🇬", "Rwanda": "🇷🇼",
  "Ethiopia": "🇪🇹", "Senegal": "🇸🇳", "Ivory Coast": "🇨🇮", "Angola": "🇦🇴",
  "Cameroon": "🇨🇲", "Egypt": "🇪🇬", "Morocco": "🇲🇦",
  "United Kingdom": "🇬🇧", "United States": "🇺🇸", "Germany": "🇩🇪",
  "Australia": "🇦🇺", "India": "🇮🇳", "Canada": "🇨🇦",
};

// ─── Saved Reports (localStorage) ─────────────────────────────────────────────
type SavedReport = { name: string; days: number; tab: string; savedAt: string };
function loadSavedReports(): SavedReport[] {
  try { return JSON.parse(localStorage.getItem("fs_analytics_reports") || "[]"); } catch { return []; }
}
function saveReport(r: SavedReport) {
  const all = loadSavedReports();
  all.unshift(r);
  localStorage.setItem("fs_analytics_reports", JSON.stringify(all.slice(0, 10)));
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsDeepDive() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  // Filters
  const [days, setDays] = useState(30);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [tab, setTab] = useState("users");

  // Live ticker
  const [liveData, setLiveData] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const socketRef = useRef<any>(null);

  // Saved reports
  const [savedReports, setSavedReports] = useState<SavedReport[]>(loadSavedReports);
  const [showSaved, setShowSaved] = useState(false);

  const queryParams = new URLSearchParams(
    useCustom && customFrom && customTo
      ? { from: customFrom, to: customTo }
      : { days: String(days) }
  ).toString();

  // ─── Socket.io live ticker ────────────────────────────────────────────────
  useEffect(() => {
    const socket = io({ transports: ["websocket"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("authenticate", (user as any)?.id || "admin");
      socket.emit("join_room", "analytics_room");
      setIsLive(true);
    });
    socket.on("analytics_live", (data: any) => {
      setLiveData(data);
      setLastUpdate(new Date().toLocaleTimeString("en-ZA"));
    });
    socket.on("disconnect", () => setIsLive(false));
    return () => { socket.disconnect(); };
  }, []);

  // ─── Data queries ──────────────────────────────────────────────────────────
  const { data: overview, isLoading: ovLoading } = useQuery({
    queryKey: ["/api/analytics/overview", queryParams],
    queryFn: () => fetch(`/api/analytics/overview?${queryParams}`).then(r => r.json()),
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const { data: userData, isLoading: uLoading } = useQuery({
    queryKey: ["/api/analytics/users", queryParams],
    queryFn: () => fetch(`/api/analytics/users?${queryParams}`).then(r => r.json()),
    enabled: tab === "users",
    staleTime: 60000,
  });

  const { data: mktData, isLoading: mktLoading } = useQuery({
    queryKey: ["/api/analytics/marketplace", queryParams],
    queryFn: () => fetch(`/api/analytics/marketplace?${queryParams}`).then(r => r.json()),
    enabled: tab === "marketplace",
    staleTime: 60000,
  });

  const { data: finData, isLoading: finLoading } = useQuery({
    queryKey: ["/api/analytics/financial", queryParams],
    queryFn: () => fetch(`/api/analytics/financial?${queryParams}`).then(r => r.json()),
    enabled: tab === "financial",
    staleTime: 60000,
  });

  const { data: acaData, isLoading: acaLoading } = useQuery({
    queryKey: ["/api/analytics/academy", queryParams],
    queryFn: () => fetch(`/api/analytics/academy?${queryParams}`).then(r => r.json()),
    enabled: tab === "academy",
    staleTime: 60000,
  });

  const { data: geoData, isLoading: geoLoading } = useQuery({
    queryKey: ["/api/analytics/geo", queryParams],
    queryFn: () => fetch(`/api/analytics/geo?${queryParams}`).then(r => r.json()),
    enabled: tab === "geo",
    staleTime: 60000,
  });

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ["/api/analytics"] });
    toast({ title: "Refreshed", description: "Analytics data updated" });
  };

  const handleSaveReport = () => {
    const r: SavedReport = { name: `${capFmt(tab)} – ${useCustom ? `${customFrom} to ${customTo}` : `Last ${days}d`}`, days, tab, savedAt: new Date().toISOString() };
    saveReport(r);
    setSavedReports(loadSavedReports());
    toast({ title: "Report Saved", description: r.name });
  };

  const handleExport = async (type: string) => {
    if (type === "pdf") { window.print(); return; }
    await fetch("/api/analytics/audit-log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: type, details: `Exported ${tab} analytics` }) });
    if (type === "users" && userData) {
      exportToCSV("users-analytics", ["Date", "New Users"], userData.timeSeries?.map((r: any) => [r.date, r.count]) || []);
    } else if (type === "geo" && geoData) {
      exportToCSV("geo-analytics", ["Country", "Users", "KYC Verified", "Completed Jobs", "Wallet (ZAR)"],
        geoData.byCountry?.map((r: any) => [r.country, r.users, r.kycVerified, r.completedJobs, (r.totalWalletCents / 100).toFixed(2)]) || []);
    } else if (type === "financial" && finData) {
      exportToCSV("financial-analytics", ["Date", "Credit (ZAR)", "Debit (ZAR)"],
        finData.timeSeries?.map((r: any) => [r.date, (r.creditCents / 100).toFixed(2), (r.debitCents / 100).toFixed(2)]) || []);
    } else if (type === "academy" && acaData) {
      exportToCSV("academy-analytics", ["Course", "Category", "Enrolled", "Certificates", "Completion %"],
        acaData.courseStats?.map((r: any) => [r.title, r.category, r.enrolled, r.certificates, r.completionRate]) || []);
    } else if (type === "marketplace" && mktData) {
      exportToCSV("marketplace-analytics", ["Category", "Jobs", "Total Budget (ZAR)"],
        mktData.byCategory?.map((r: any) => [r.category, r.count, (r.totalBudgetCents / 100).toFixed(2)]) || []);
    }
    toast({ title: "Exported", description: "CSV downloaded" });
  };

  const kpis = overview?.kpis;
  const totals = overview?.totals;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fafafa] print:bg-white">
      {/* Print header */}
      <div className="hidden print:block text-center pb-4 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">FreelanceSkills.net — Analytics Report</h1>
        <p className="text-sm text-gray-500">{format(new Date(), "d MMMM yyyy HH:mm")}</p>
      </div>

      {/* ─── Top Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm print:hidden">
        <div className="max-w-screen-2xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: G }}>
              <span className="text-white font-bold text-xs">FS</span>
            </div>
            <span className="font-bold text-[15px] text-gray-900">Analytics</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500">Deep Dive</span>
            {isLive && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE {lastUpdate && `· ${lastUpdate}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button data-testid="btn-refresh" onClick={handleRefresh}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
            <button data-testid="btn-save-report" onClick={handleSaveReport}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              💾 Save Report
            </button>
            <div className="relative">
              <button data-testid="btn-saved-reports" onClick={() => setShowSaved(s => !s)}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                📋 Saved ({savedReports.length})
              </button>
              {showSaved && savedReports.length > 0 && (
                <div className="absolute right-0 top-9 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-72">
                  {savedReports.map((r, i) => (
                    <button key={i} onClick={() => { setTab(r.tab); setDays(r.days); setShowSaved(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 border-b border-gray-50 last:border-0">
                      <div className="font-semibold text-gray-800">{r.name}</div>
                      <div className="text-gray-400">{format(new Date(r.savedAt), "d MMM yyyy")}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => handleExport("pdf")} data-testid="btn-export-pdf"
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              🖨️ Print PDF
            </button>
            <button onClick={() => handleExport(tab)} data-testid="btn-export-csv"
              className="text-xs px-3 py-1.5 rounded-lg text-white font-semibold transition-colors" style={{ background: G }}>
              ⬇ Export CSV
            </button>
            <button onClick={() => navigate("/admin")}
              className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              ← Admin
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-5 py-6 space-y-5">

        {/* ─── Global Filters ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Period</span>
            {[7, 30, 90, 365].map(d => (
              <button key={d} data-testid={`filter-${d}d`}
                onClick={() => { setDays(d); setUseCustom(false); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors ${!useCustom && days === d ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                style={!useCustom && days === d ? { background: G, borderColor: G } : {}}>
                {d === 365 ? "1Y" : `${d}d`}
              </button>
            ))}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <input type="date" value={customFrom} onChange={e => { setCustomFrom(e.target.value); setUseCustom(true); }} data-testid="filter-from"
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30" />
              <span className="text-gray-400 text-xs">to</span>
              <input type="date" value={customTo} onChange={e => { setCustomTo(e.target.value); setUseCustom(true); }} data-testid="filter-to"
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/30" />
            </div>
            {overview?.period && (
              <span className="text-xs text-gray-400 ml-auto">
                {format(parseISO(overview.period.from), "d MMM yyyy")} – {format(parseISO(overview.period.to), "d MMM yyyy")}
              </span>
            )}
          </div>
        </div>

        {/* ─── Live Ticker ──────────────────────────────────────────────────── */}
        {Object.keys(liveData).length > 0 && (
          <div className="bg-gradient-to-r from-[#f0fdf7] to-[#ecfdf5] border border-[#1DBF73]/20 rounded-2xl px-5 py-3 flex flex-wrap items-center gap-6 print:hidden">
            <span className="text-[11px] font-bold text-[#1a9155] uppercase tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Platform Data
            </span>
            {[
              { label: "Total Users", val: numFmt(liveData.totalUsers || 0), testId: "live-users" },
              { label: "KYC Verified", val: numFmt(liveData.kycVerified || 0), testId: "live-kyc" },
              { label: "Open Jobs", val: numFmt(liveData.openJobs || 0), testId: "live-jobs" },
              { label: "Certificates", val: numFmt(liveData.totalCerts || 0), testId: "live-certs" },
              { label: "Total Wallet", val: zarFmt(liveData.totalWalletCents || 0), testId: "live-wallet" },
            ].map(({ label, val, testId }) => (
              <div key={label} data-testid={testId} className="text-sm">
                <span className="text-gray-500">{label}: </span>
                <span className="font-bold text-gray-900">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* ─── Overview KPI Cards ───────────────────────────────────────────── */}
        {ovLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : kpis && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard data-testid="kpi-new-users" label="New Users" value={numFmt(kpis.newUsers?.value)} change={kpis.newUsers?.change} sub={`vs ${numFmt(kpis.newUsers?.prev)} prev period`} color={G} />
            <KpiCard label="Jobs Completed" value={numFmt(kpis.completedJobs?.value)} change={kpis.completedJobs?.change} sub={`vs ${numFmt(kpis.completedJobs?.prev)} prev period`} />
            <KpiCard label="Certs Issued" value={numFmt(kpis.certificates?.value)} change={kpis.certificates?.change} sub="in period" color="#f59e0b" />
            <KpiCard label="Gross Revenue" value={zarFmt(kpis.grossRevenueCents?.value)} change={kpis.grossRevenueCents?.change} sub="wallet credits" color={G} />
            <KpiCard label="Total Users" value={numFmt(totals?.totalUsers)} sub={`${numFmt(totals?.activeUsers)} active`} />
            <KpiCard label="KYC Verified" value={`${totals?.totalUsers > 0 ? Math.round((totals?.kycVerified / totals?.totalUsers) * 100) : 0}%`} sub={`${numFmt(totals?.kycVerified)} of ${numFmt(totals?.totalUsers)}`} color={G} />
          </div>
        )}

        {/* ─── Navigation Tabs ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { id: "users", icon: "👥", label: "User Analytics" },
              { id: "marketplace", icon: "🏪", label: "Marketplace" },
              { id: "financial", icon: "💰", label: "Financial" },
              { id: "academy", icon: "🎓", label: "Academy" },
              { id: "geo", icon: "🌍", label: "Geographic" },
            ].map(({ id, icon, label }) => (
              <button key={id} data-testid={`tab-${id}`} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${tab === id ? "border-[#1DBF73] text-[#1a9155] bg-[#f0fdf7]" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* ─── User Analytics ─────────────────────────────────────────────── */}
          {tab === "users" && (
            <div className="p-5 space-y-5">
              {uLoading ? <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${G} transparent transparent transparent` }}></div></div> : (
                <>
                  {/* Acquisition Funnel */}
                  <ChartCard title="🎯 Acquisition Funnel">
                    {userData?.funnel ? (
                      <div className="space-y-3">
                        {[
                          { label: "Registered", value: userData.funnel.registered, color: G },
                          { label: "KYC Verified", value: userData.funnel.verified, color: "#60a5fa" },
                          { label: "First Job Completed", value: userData.funnel.withJobs, color: "#f59e0b" },
                          { label: "First Earnings", value: userData.funnel.withEarnings, color: "#a78bfa" },
                        ].map(p => (
                          <FunnelBar key={p.label} {...p} max={userData.funnel.registered} />
                        ))}
                      </div>
                    ) : <EmptyChart />}
                  </ChartCard>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Registration over time */}
                    <ChartCard title="📈 New Registrations Over Time">
                      {userData?.timeSeries?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={userData.timeSeries}>
                            <defs>
                              <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={G} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={G} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => format(parseISO(d), "d MMM")} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="count" name="New Users" stroke={G} strokeWidth={2} fill="url(#gGreen)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : <EmptyChart />}
                    </ChartCard>

                    {/* By Role */}
                    <ChartCard title="🎭 Users by Role">
                      {userData?.byRole?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie data={userData.byRole} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={80} label={({ role, count }) => `${capFmt(role)}: ${numFmt(count)}`} labelLine={false}>
                              {userData.byRole.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: any) => numFmt(v)} />
                            <Legend formatter={capFmt} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <EmptyChart />}
                    </ChartCard>

                    {/* KYC Status */}
                    <ChartCard title="🆔 KYC Status Distribution">
                      {userData?.byKycStatus?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={userData.byKycStatus} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="status" tick={{ fontSize: 11 }} tickFormatter={capFmt} width={90} />
                            <Tooltip formatter={(v: any) => numFmt(v)} labelFormatter={capFmt} />
                            <Bar dataKey="count" name="Users" radius={[0, 4, 4, 0]}>
                              {userData.byKycStatus.map((r: any, i: number) => (
                                <Cell key={i} fill={r.status === "verified" ? G : r.status === "pending" ? "#f59e0b" : r.status === "rejected" ? "#ef4444" : "#d1d5db"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <EmptyChart />}
                    </ChartCard>

                    {/* Account Status */}
                    <ChartCard title="⚡ Account Status Distribution">
                      {userData?.byStatus?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={userData.byStatus.map((r: any) => ({ ...r, status: capFmt(r.status) }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(v: any) => numFmt(v)} />
                            <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]}>
                              {userData.byStatus.map((r: any, i: number) => (
                                <Cell key={i} fill={r.status === "active" ? G : r.status === "suspended" ? "#f59e0b" : r.status === "banned" ? "#ef4444" : "#d1d5db"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <EmptyChart />}
                    </ChartCard>
                  </div>

                  {/* User Type */}
                  {userData?.byUserType?.length > 0 && (
                    <ChartCard title="🧑‍💼 User Type Split">
                      <div className="flex flex-wrap gap-4">
                        {userData.byUserType.map((r: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                            <div className="w-3 h-3 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }}></div>
                            <span className="text-sm font-semibold text-gray-700">{capFmt(r.type)}</span>
                            <span className="text-2xl font-bold" style={{ color: PALETTE[i % PALETTE.length] }}>{numFmt(r.count)}</span>
                          </div>
                        ))}
                      </div>
                    </ChartCard>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── Marketplace Analytics ─────────────────────────────────────── */}
          {tab === "marketplace" && (
            <div className="p-5 space-y-5">
              {mktLoading ? <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${G} transparent transparent transparent` }}></div></div> : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Jobs over time */}
                    <ChartCard title="📊 Job Postings Over Time">
                      {mktData?.timeSeries?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={mktData.timeSeries}>
                            <defs>
                              <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => format(parseISO(d), "d MMM")} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="posted" name="Jobs Posted" stroke="#60a5fa" strokeWidth={2} fill="url(#gBlue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : <EmptyChart />}
                    </ChartCard>

                    {/* Job Status */}
                    <ChartCard title="🔄 Job Status Breakdown">
                      {mktData?.byStatus?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie data={mktData.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }) => `${capFmt(status)}: ${numFmt(count)}`}>
                              {mktData.byStatus.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: any) => numFmt(v)} />
                            <Legend formatter={capFmt} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <EmptyChart />}
                    </ChartCard>
                  </div>

                  {/* Category Performance */}
                  <ChartCard title="🏆 Top 10 Categories by Jobs Posted">
                    {mktData?.byCategory?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={mktData.byCategory} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={140} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" name="Jobs" radius={[0, 4, 4, 0]} fill={G} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart />}
                  </ChartCard>

                  {/* Average Budget by Category */}
                  {mktData?.avgBudgets?.length > 0 && (
                    <ChartCard title="💵 Average Job Budget by Category (ZAR)">
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={mktData.avgBudgets}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="category" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R${(v / 100).toFixed(0)}`} />
                          <Tooltip content={<CustomTooltip isCents />} />
                          <Bar dataKey="avgBudgetCents" name="Avg Budget" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── Financial Analytics ─────────────────────────────────────────── */}
          {tab === "financial" && (
            <div className="p-5 space-y-5">
              {finLoading ? <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${G} transparent transparent transparent` }}></div></div> : (
                <>
                  {/* Job Budget Summary cards */}
                  {finData?.jobStats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <KpiCard label="Total Job Budget" value={zarFmt(finData.jobStats.totalBudgetCents)} sub="In period" color={G} />
                      <KpiCard label="Avg Job Budget" value={zarFmt(finData.jobStats.avgBudgetCents)} sub="Per job" />
                      <KpiCard label="Largest Job" value={zarFmt(finData.jobStats.maxBudgetCents)} sub="Single project" color="#f59e0b" />
                      <KpiCard label="Total Jobs" value={numFmt(finData.jobStats.jobCount)} sub="In period" />
                    </div>
                  )}

                  {/* Revenue timeseries */}
                  <ChartCard title="📈 Daily Wallet Flow (ZAR)">
                    {finData?.timeSeries?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={finData.timeSeries}>
                          <defs>
                            <linearGradient id="gCredit" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={G} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={G} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gDebit" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => format(parseISO(d), "d MMM")} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R${(v / 100).toFixed(0)}`} />
                          <Tooltip content={<CustomTooltip isCents />} />
                          <Legend />
                          <Area type="monotone" dataKey="creditCents" name="Credits" stroke={G} strokeWidth={2} fill="url(#gCredit)" />
                          <Area type="monotone" dataKey="debitCents" name="Debits" stroke="#ef4444" strokeWidth={2} fill="url(#gDebit)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart />}
                  </ChartCard>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Transaction type breakdown */}
                    <ChartCard title="💳 Transaction Types">
                      {finData?.byType?.length > 0 ? (
                        <div className="space-y-2">
                          {finData.byType.map((r: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }}></div>
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-800">{capFmt(r.type)}</div>
                                <div className="text-xs text-gray-400">{numFmt(r.count)} transactions</div>
                              </div>
                              <div className="text-sm font-bold" style={{ color: PALETTE[i % PALETTE.length] }}>
                                {zarFmt(Math.abs(r.totalCents))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <EmptyChart />}
                    </ChartCard>

                    {/* Top wallet holders */}
                    <ChartCard title="🏦 Top Wallet Holders">
                      {finData?.topWallets?.length > 0 ? (
                        <div className="space-y-2">
                          {finData.topWallets.map((r: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                              <div className="text-sm font-bold text-gray-400 w-5 text-center">{i + 1}</div>
                              <div className="flex-1 text-xs text-gray-500 font-mono truncate">{r.userId.substring(0, 18)}…</div>
                              <div className="font-bold text-sm" style={{ color: G }}>{zarFmt(r.balanceCents)}</div>
                            </div>
                          ))}
                        </div>
                      ) : <EmptyChart />}
                    </ChartCard>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── Academy Analytics ────────────────────────────────────────────── */}
          {tab === "academy" && (
            <div className="p-5 space-y-5">
              {acaLoading ? <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${G} transparent transparent transparent` }}></div></div> : (
                <>
                  {/* Academy KPIs */}
                  {acaData?.totals && (
                    <div className="grid grid-cols-3 gap-3">
                      <KpiCard label="Total Courses" value={numFmt(acaData.totals.totalCourses)} color={G} />
                      <KpiCard label="Total Enrolled" value={numFmt(acaData.totals.totalEnrolled)} sub="Unique learners" />
                      <KpiCard label="Certificates Issued" value={numFmt(acaData.totals.totalCerts)} color="#f59e0b" sub="All time" />
                    </div>
                  )}

                  {/* Certificates over time */}
                  <ChartCard title="🏆 Certificates Issued Over Time">
                    {acaData?.certsByDate?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={acaData.certsByDate}>
                          <defs>
                            <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => format(parseISO(d), "d MMM")} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="count" name="Certificates" stroke="#f59e0b" strokeWidth={2} fill="url(#gGold)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart />}
                  </ChartCard>

                  {/* Course Performance */}
                  {acaData?.courseStats?.length > 0 && (
                    <>
                      <ChartCard title="📚 Course Enrollment vs Completion">
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={acaData.courseStats.slice(0, 8)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="title" tick={{ fontSize: 9 }} width={130} />
                            <Tooltip formatter={(v: any) => numFmt(v)} />
                            <Legend />
                            <Bar dataKey="enrolled" name="Enrolled" fill="#60a5fa" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="certificates" name="Certified" fill={G} radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartCard>

                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800 text-[15px]">📊 Completion Rates per Course</h3>
                        {acaData.courseStats.map((c: any) => (
                          <div key={c.courseId} data-testid={`course-${c.courseId}`}
                            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-800 text-sm truncate">{c.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${c.isFree ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>{c.isFree ? "FREE" : "PAID"}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{c.difficulty}</span>
                              </div>
                              <div className="text-xs text-gray-400">{c.category} · {c.duration}</div>
                              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                <div className="h-2 rounded-full transition-all" style={{ width: `${c.completionRate}%`, background: c.completionRate >= 70 ? G : c.completionRate >= 40 ? "#f59e0b" : "#ef4444" }}></div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-2xl font-bold" style={{ color: c.completionRate >= 70 ? G : c.completionRate >= 40 ? "#f59e0b" : "#ef4444" }}>{c.completionRate}%</div>
                              <div className="text-[11px] text-gray-400">{numFmt(c.enrolled)} enrolled</div>
                              <div className="text-[11px] text-gray-400">🏆 {numFmt(c.certificates)} certs</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {!acaData?.courseStats?.length && <EmptyChart />}
                </>
              )}
            </div>
          )}

          {/* ─── Geographic Analytics ─────────────────────────────────────────── */}
          {tab === "geo" && (
            <div className="p-5 space-y-5">
              {geoLoading ? <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${G} transparent transparent transparent` }}></div></div> : (
                <>
                  {geoData?.byCountry?.length > 0 ? (
                    <>
                      {/* Africa-first bar chart */}
                      <ChartCard title="🌍 Users by Country (Top 15)">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={geoData.byCountry.slice(0, 15)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="country" tick={{ fontSize: 10 }} width={110} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="users" name="Users" radius={[0, 4, 4, 0]}>
                              {geoData.byCountry.slice(0, 15).map((r: any, i: number) => (
                                <Cell key={i} fill={r.isAfrica ? G : "#d1d5db"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: G }}></span> Africa</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-300"></span> Other</span>
                        </div>
                      </ChartCard>

                      {/* Country table */}
                      <ChartCard title="📊 Country Breakdown">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                {["Country", "Users", "KYC Verified", "Completed Jobs", "Total Wallet", "Pro Users"].map(h => (
                                  <th key={h} className="py-2.5 px-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {geoData.byCountry.map((r: any, i: number) => (
                                <tr key={i} data-testid={`geo-${r.country.replace(/\s/g, "-")}`}
                                  className={`hover:bg-gray-50 ${r.isAfrica ? "bg-[#fafff9]" : ""}`}>
                                  <td className="py-3 px-4 font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="text-lg">{countryFlag[r.country] || "🏳"}</span>
                                    {r.country}
                                    {r.isAfrica && <span className="text-[10px] bg-[#1DBF73]/10 text-[#1a9155] px-1.5 py-0.5 rounded font-semibold">Africa</span>}
                                  </td>
                                  <td className="py-3 px-4 font-semibold" style={{ color: G }}>{numFmt(r.users)}</td>
                                  <td className="py-3 px-4 text-gray-600">{numFmt(r.kycVerified)}</td>
                                  <td className="py-3 px-4 text-gray-600">{numFmt(r.completedJobs)}</td>
                                  <td className="py-3 px-4 font-mono text-sm text-gray-700">{zarFmt(r.totalWalletCents)}</td>
                                  <td className="py-3 px-4 text-gray-600">{numFmt(r.pro)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </ChartCard>

                      {/* Wallet by country */}
                      {geoData.byCountry.filter((r: any) => r.totalWalletCents > 0).length > 0 && (
                        <ChartCard title="💰 Wallet Value by Country (ZAR)">
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={geoData.byCountry.filter((r: any) => r.totalWalletCents > 0).slice(0, 10)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="country" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={45} />
                              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R${(v / 100 / 1000).toFixed(0)}k`} />
                              <Tooltip content={<CustomTooltip isCents />} />
                              <Bar dataKey="totalWalletCents" name="Total Wallet" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartCard>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-5xl mb-4">🌍</div>
                      <p className="text-gray-500 text-sm">No geographic data yet — users need to set their country in their profile.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Print-only footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        FreelanceSkills.net — Confidential Analytics Report · Generated {format(new Date(), "d MMMM yyyy HH:mm")}
      </div>
    </div>
  );
}
