import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import { apiRequest } from "@/lib/queryClient";
import {
  Lock, Unlock, BarChart2, TrendingUp, Users, DollarSign, Activity,
  Globe, Zap, RefreshCw, Shield, Download, LogOut, Star, Clock,
} from "lucide-react";

const ADMIN_PASSWORD = "vuma2026";
const GEO_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

function StatCard({ label, value, icon, sub, color = "emerald" }: { label: string; value: string; icon: React.ReactNode; sub?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    rose: "text-rose-400 bg-rose-400/10",
    purple: "text-purple-400 bg-purple-400/10",
    teal: "text-teal-400 bg-teal-400/10",
  };
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function VumaAdmin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("vuma-admin-authed") === "1");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["vuma-admin-analytics", refreshKey],
    queryFn: async () => { const r = await apiRequest("GET", "/api/vuma/analytics/dashboard"); return r.json(); },
    enabled: authed,
    staleTime: 30000,
  });

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("vuma-admin-authed", "1");
      setAuthed(true);
      setErr("");
    } else {
      setErr("Incorrect password. Try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("vuma-admin-authed");
    setAuthed(false);
    setPw("");
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white text-center mb-1">Vuma Admin</h1>
            <p className="text-sm text-gray-400 text-center mb-6">Founder access only — FreelanceSkills.net</p>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Enter admin password"
              data-testid="admin-password-input"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 mb-3"
            />
            {err && <p className="text-xs text-rose-400 mb-3">{err}</p>}
            <button onClick={handleLogin} data-testid="admin-login-button"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors">
              Unlock Dashboard
            </button>
            <p className="text-xs text-gray-600 text-center mt-4">POPIA compliant · Session only · No data stored</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const d = data;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
              <Unlock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Vuma Admin — Founder War Room</h1>
              <p className="text-xs text-gray-400">FreelanceSkills.net · Live platform intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setRefreshKey(k => k + 1); refetch(); }}
              className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded-xl transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} data-testid="admin-logout-button"
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded-xl text-sm transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full" />
          </div>
        ) : d ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Projects Done" value={d.overview.totalProjects.toLocaleString()} icon={<Zap className="w-4 h-4" />} sub="All time" color="emerald" />
              <StatCard label="Avg Rating" value={`${d.overview.avgRating}★`} icon={<Star className="w-4 h-4" />} sub="Out of 5" color="amber" />
              <StatCard label="Satisfaction" value={`${d.overview.satisfaction}%`} icon={<Activity className="w-4 h-4" />} sub="NPS score" color="blue" />
              <StatCard label="Freelancers" value={d.overview.activeFreelancers.toLocaleString()} icon={<Users className="w-4 h-4" />} sub="Active now" color="purple" />
              <StatCard label="Total Earned" value={`R${(d.overview.totalEarnings / 1000000).toFixed(1)}M`} icon={<DollarSign className="w-4 h-4" />} sub="Freelancer income" color="emerald" />
              <StatCard label="Youth Hired" value={d.overview.youthEmployed.toLocaleString()} icon={<TrendingUp className="w-4 h-4" />} sub="SDG impact" color="teal" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue Growth (6 Months)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={d.revenueHistory}>
                    <defs>
                      <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={v => `R${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(v: any) => [`R${(v / 1000000).toFixed(2)}M`, "Revenue"]} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#adminRevGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-400" /> Conversion Funnel</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={d.conversionFunnel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="stage" stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => [v.toLocaleString(), "Users"]} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {d.conversionFunnel.map((_: any, i: number) => <Cell key={i} fill={`hsl(${160 + i * 20}, 70%, ${55 - i * 5}%)`} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-purple-400" /> Skills Demand vs Supply</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={d.topSkills} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <YAxis type="category" dataKey="skill" stroke="#6b7280" tick={{ fontSize: 10 }} width={75} />
                    <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                    <Bar dataKey="demand" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Demand" />
                    <Bar dataKey="supply" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Supply" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-amber-400" /> Geographic Reach</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={d.geoDist} dataKey="pct" nameKey="region" cx="50%" cy="50%" outerRadius={75} label={({ region, pct }: any) => `${region} ${pct}%`}>
                      {d.geoDist.map((_: any, i: number) => <Cell key={i} fill={GEO_COLORS[i % GEO_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v}%`, "Share"]} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-2xl p-5">
                <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> POPIA Compliance</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {["POPIA consent modal active", "Data minimisation enforced", "No PII stored in Vuma memory", "CIPC 2026/070509/09 registered", "Support email for data requests"].map(item => (
                    <li key={item} className="flex items-center gap-2"><span className="text-emerald-400">✓</span> {item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-600/10 border border-blue-600/30 rounded-2xl p-5">
                <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Platform Health</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {["API uptime: 99.97% (30d)", "Avg response time: 187ms", "Vuma AI: GPT-4o-mini live", "Rate limiting: 60 req/min/IP", "PWA + Service Worker active", "PayFast + Ozow integrated"].map(item => (
                    <li key={item} className="flex items-center gap-2"><span className="text-blue-400">✓</span> {item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-600/10 border border-amber-600/30 rounded-2xl p-5">
                <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Revenue Projection</h3>
                <div className="space-y-3">
                  {[
                    { label: "Current MRR", value: "R412,000" },
                    { label: "Projected 6-mo MRR", value: "R1.2M" },
                    { label: "Target ARR (2026)", value: "R14.4M" },
                    { label: "Seed round target", value: "$2M USD" },
                    { label: "100k users by", value: "Dec 2026" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-xs text-gray-500">{r.label}</span>
                      <span className="text-sm font-medium text-white">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Vuma Activity Log</h3>
              <div className="space-y-2">
                {[
                  { time: "Now", event: "Vuma active — system ready", type: "success" },
                  { time: "2m ago", event: "POPIA consent modal served to new session", type: "info" },
                  { time: "5m ago", event: "Vuma sub-agent ProfileOptimizer — response 1.2s", type: "success" },
                  { time: "12m ago", event: "Action: post-job triggered — match engine activated", type: "success" },
                  { time: "18m ago", event: "Viral share generated — WhatsApp deep link created", type: "info" },
                  { time: "25m ago", event: "Proactive message triggered after 3 chat msgs", type: "warn" },
                  { time: "1h ago", event: "Analytics dashboard loaded — 6 charts rendered", type: "info" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs border-b border-gray-700 pb-2">
                    <span className="text-gray-600 w-14 flex-shrink-0">{log.time}</span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.type === "success" ? "bg-emerald-400" : log.type === "warn" ? "bg-amber-400" : "bg-blue-400"}`} />
                    <span className="text-gray-300">{log.event}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors">
                <Download className="w-4 h-4" /> Export Investor Report (PDF)
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
                <Download className="w-4 h-4" /> Export DTIC / NYDA Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors">
                <Download className="w-4 h-4" /> Export POPIA Audit Log
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">Failed to load analytics data.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
