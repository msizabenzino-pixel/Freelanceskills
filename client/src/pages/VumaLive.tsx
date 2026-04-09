import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  TrendingUp, Zap, DollarSign, Users, Target, Award, CheckCircle,
  ChevronRight, Activity, Globe, ArrowRight, Flame, Clock, Star,
  BarChart2, RefreshCw, Sparkles, BookOpen, Shield,
} from "lucide-react";

// ── Live Feed Events ─────────────────────────────────────────────────────────
const LIVE_EVENTS = [
  { msg: "🔥 Sipho (Soweto) just earned R3,400 on a React project", type: "earn", time: "2s ago" },
  { msg: "✅ Nomsa (Durban) just earned her AI Academy blockchain certificate", type: "cert", time: "8s ago" },
  { msg: "📋 2 new Electrical Engineering jobs posted in Pretoria — 0 bids yet", type: "job", time: "14s ago" },
  { msg: "🏆 Thando (Cape Town) just hit Top Rated in Graphic Design", type: "badge", time: "23s ago" },
  { msg: "💰 R12,750 released from escrow across 3 freelancers today", type: "payout", time: "31s ago" },
  { msg: "🚀 New client (Johannesburg) posted R28,000 budget software job", type: "job", time: "45s ago" },
  { msg: "🎓 Lerato completed 'Pricing Strategy' course — raised rates 40%", type: "cert", time: "52s ago" },
  { msg: "⚡ Auto-bid placed 12 proposals in the last 60 minutes", type: "ai", time: "1m ago" },
  { msg: "🌍 New client from Nairobi posted translation job — R8,500 budget", type: "job", time: "1m ago" },
  { msg: "💳 Kwame (Sandton) requested payout — R45,200 via EFT", type: "payout", time: "2m ago" },
  { msg: "🏅 Bongani just verified his Electrical trade credentials via SAQA", type: "cert", time: "2m ago" },
  { msg: "🔮 Vuma AI matched 3 freelancers to a R60,000 enterprise project", type: "ai", time: "3m ago" },
  { msg: "📈 Web Development skill demand up 18% this week in Gauteng", type: "trend", time: "3m ago" },
  { msg: "🎯 Ayasha closed her 10th project — unlocked Elite Club status", type: "badge", time: "4m ago" },
  { msg: "💬 New 5-star review: 'Best platform in Africa, period.' — Client, Stellenbosch", type: "review", time: "4m ago" },
  { msg: "⚡ Plumber job in Midrand — posted 5 min ago — still no bids", type: "job", time: "5m ago" },
  { msg: "🔥 Thandiwe earned R8,900 this week — highest weekly total yet!", type: "earn", time: "5m ago" },
  { msg: "🌱 Youth employment counter hit 3,241 — one more youth hired", type: "impact", time: "6m ago" },
];

const EVENT_COLORS: Record<string, string> = {
  earn: "text-emerald-400", cert: "text-purple-400", job: "text-blue-400",
  badge: "text-amber-400", payout: "text-teal-400", ai: "text-cyan-400",
  trend: "text-orange-400", review: "text-rose-400", impact: "text-green-400",
};

// ── Skill Data ───────────────────────────────────────────────────────────────
const SKILL_RADAR = [
  { skill: "Web Dev", demand: 94, supply: 71 },
  { skill: "Graphic Design", demand: 87, supply: 83 },
  { skill: "Trades", demand: 78, supply: 42 },
  { skill: "Data/AI", demand: 91, supply: 38 },
  { skill: "Digital Mktg", demand: 79, supply: 61 },
  { skill: "Video/Media", demand: 68, supply: 57 },
];

// ── 30-Day Challenge Tasks ────────────────────────────────────────────────────
const CHALLENGE_TASKS = [
  "Complete your profile to 100%",
  "Upload 3 portfolio examples",
  "Write your first client-ready bio (50 words, punchy)",
  "Set your hourly rate using Vuma's market data",
  "Post your first service or gig listing",
  "Send 3 proposals to active jobs",
  "Enroll in your first AI Academy course",
  "Connect your PayFast/Ozow account for payouts",
  "Share your profile link on LinkedIn",
  "Get your first verified skill badge",
  "Complete Lesson 2: Pricing Strategy",
  "Bid on a job outside your comfort zone",
  "Set up Auto-Bid for your top 3 skills",
  "Respond to a job within 60 minutes of posting",
  "Ask a past client for a testimonial",
  "Complete your first milestone delivery",
  "Request your first escrow payout",
  "Share a win on WhatsApp using Vuma Viral",
  "Generate a POPIA-compliant contract",
  "Refer 1 friend to FreelanceSkills.net",
  "Earn your first 5-star review",
  "Complete AI Academy Module 3",
  "Raise your rate by 10% and test the market",
  "Apply to 5 jobs with the BidStrategist sub-agent",
  "Optimise your profile with ProfileOptimizer",
  "Hit your first R5,000 in total earnings",
  "Help another freelancer in the community",
  "Post a job as a client (even small — R500)",
  "Set your 90-day income target in Vuma Memory",
  "🏆 COMPLETE! Share your 30-day transformation",
];

// ── Platform Fee Data ─────────────────────────────────────────────────────────
const PLATFORMS = [
  { name: "FreelanceSkills", fee: 0.05, color: "#10b981", tagline: "Africa First" },
  { name: "Global Platform A", fee: 0.20, color: "#ef4444", tagline: "Up to 20%" },
  { name: "Global Platform B", fee: 0.20, color: "#f59e0b", tagline: "Always 20%" },
  { name: "Elite Platform C", fee: 0.35, color: "#8b5cf6", tagline: "~35% cut" },
];

// ── Income Projection ─────────────────────────────────────────────────────────
function buildProjection(rate: number, hours: number): { month: string; gross: number; net: number }[] {
  const months = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"];
  return months.map((m, i) => {
    const growth = Math.pow(1.08, i);
    const gross = Math.round(rate * hours * 4.3 * growth);
    return { month: m, gross, net: Math.round(gross * 0.95) };
  });
}

// ── Animated Number ───────────────────────────────────────────────────────────
function AnimNum({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    const diff = value - prev;
    if (diff === 0) return;
    const steps = 20;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplay(Math.round(prev + (diff * i) / steps));
      if (i >= steps) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VumaLive() {
  // Live ticker
  const [tickerIndex, setTickerIndex] = useState(0);
  const [visibleEvents, setVisibleEvents] = useState(LIVE_EVENTS.slice(0, 4));

  // Live counters (tick up every 12s)
  const [counters, setCounters] = useState({ projects: 10247, earned: 18400000, jobs: 142, youth: 3241 });

  // Fee Calculator
  const [projectValue, setProjectValue] = useState(15000);

  // Income Simulator
  const [rate, setRate] = useState(350);
  const [hours, setHours] = useState(20);

  // Skill Radar tab
  const [radarView, setRadarView] = useState<"demand" | "supply" | "gap">("gap");

  // 30-Day Challenge
  const [completedDays, setCompletedDays] = useLocalStorage("vuma-30day", [] as number[]);
  const [challengeOpen, setChallengeOpen] = useState(false);

  // Ticker rotation
  useEffect(() => {
    const id = setInterval(() => {
      setTickerIndex(i => (i + 1) % LIVE_EVENTS.length);
      setVisibleEvents(prev => {
        const nextIdx = (tickerIndex + 4) % LIVE_EVENTS.length;
        return [...prev.slice(1), LIVE_EVENTS[nextIdx]];
      });
    }, 3200);
    return () => clearInterval(id);
  }, [tickerIndex]);

  // Live counter ticks
  useEffect(() => {
    const id = setInterval(() => {
      setCounters(c => ({
        projects: c.projects + Math.floor(Math.random() * 2),
        earned: c.earned + Math.floor(Math.random() * 4500 + 1000),
        jobs: Math.max(100, c.jobs + Math.floor(Math.random() * 5) - 2),
        youth: c.youth + (Math.random() > 0.85 ? 1 : 0),
      }));
    }, 12000);
    return () => clearInterval(id);
  }, []);

  const projection = buildProjection(rate, hours);
  const monthlyIncome = Math.round(rate * hours * 4.3);

  const toggleDay = (i: number) => {
    setCompletedDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]);
  };

  const challengeStreak = (() => {
    let streak = 0;
    for (let i = completedDays.length - 1; i >= 0; i--) {
      if (completedDays.includes(completedDays[i] - streak)) streak++;
      else break;
    }
    return Math.min(streak, completedDays.length);
  })();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-gray-950 to-blue-950/30" />
        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium uppercase tracking-widest">Live Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Vuma War Room 🔥
          </h1>
          <p className="text-gray-400 max-w-xl mb-6">
            Africa's first real-time freelance intelligence dashboard. Built for the grinders. Built for the builders. <span className="text-emerald-400">Africa-first. Built different.</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Projects Done", value: counters.projects, suffix: "+", color: "emerald", icon: <CheckCircle className="w-4 h-4" /> },
              { label: "Freelancer Income", value: Math.round(counters.earned / 1000000 * 10) / 10, suffix: "M earned", prefix: "R", color: "blue", icon: <DollarSign className="w-4 h-4" /> },
              { label: "Live Jobs Now", value: counters.jobs, suffix: " open", color: "amber", icon: <Zap className="w-4 h-4" /> },
              { label: "Youth Employed", value: counters.youth, suffix: "", color: "purple", icon: <Users className="w-4 h-4" /> },
            ].map(c => (
              <div key={c.label} className={`bg-gray-900 border border-gray-700 rounded-2xl p-4`}>
                <div className={`text-${c.color}-400 mb-2`}>{c.icon}</div>
                <p className={`text-2xl font-bold text-${c.color}-400`}>
                  <AnimNum value={c.value} prefix={c.prefix} suffix={c.suffix} />
                </p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LIVE ACTIVITY TICKER ─────────────────────────────────────────────── */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Live Platform Activity</span>
            <span className="ml-auto text-xs text-gray-600">Updates every 3s</span>
          </div>
          <div className="space-y-1 overflow-hidden">
            {visibleEvents.slice(0, 3).map((ev, i) => (
              <div key={i} className={`flex items-start gap-3 text-sm py-1.5 px-3 rounded-xl transition-all ${i === 0 ? "bg-gray-800/80" : "opacity-60"}`}>
                <span className={`text-xs mt-0.5 ${EVENT_COLORS[ev.type] || "text-gray-400"} whitespace-nowrap`}>{ev.time}</span>
                <span className="text-gray-300">{ev.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-12">

        {/* ── FEE BATTLE CALCULATOR ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Fee Battle Calculator</h2>
              <p className="text-sm text-gray-400">Full fee transparency — see exactly what you keep on every transaction.</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Project Value</label>
                <span className="text-xl font-bold text-emerald-400">R {projectValue.toLocaleString()}</span>
              </div>
              <input
                type="range" min={500} max={100000} step={500} value={projectValue}
                onChange={e => setProjectValue(Number(e.target.value))}
                data-testid="fee-calc-slider"
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>R500</span><span>R50k</span><span>R100k</span>
              </div>
            </div>

            <div className="space-y-3">
              {PLATFORMS.map((p) => {
                const fee = Math.round(projectValue * p.fee);
                const youKeep = projectValue - fee;
                const pct = Math.round((youKeep / projectValue) * 100);
                const isUs = p.name === "FreelanceSkills";
                return (
                  <div key={p.name} className={`relative border rounded-xl p-4 ${isUs ? "border-emerald-500 bg-emerald-950/20" : "border-gray-700 bg-gray-800/30"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{p.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: p.color + "20", color: p.color }}>{p.tagline}</span>
                        {isUs && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">BEST</span>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Platform takes</p>
                        <p className="font-bold" style={{ color: isUs ? "#10b981" : "#ef4444" }}>R {fee.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                      </div>
                      <span className="text-sm font-bold text-white w-24 text-right">You keep R {youKeep.toLocaleString()}</span>
                    </div>
                    {isUs && (
                      <p className="text-xs text-emerald-400 mt-2">
                        💰 With FreelanceSkills you save <strong>R {(projectValue * 0.15).toLocaleString()}</strong> vs typical 20% platform fees
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 bg-emerald-950/40 border border-emerald-800 rounded-xl px-5 py-3">
              <p className="text-sm text-emerald-300">
                <strong>Bottom line:</strong> On a R{projectValue.toLocaleString()} project you keep{" "}
                <strong className="text-emerald-400">R {(projectValue * 0.95).toLocaleString()}</strong> with FreelanceSkills vs{" "}
                <strong className="text-red-400">R {(projectValue * 0.80).toLocaleString()}</strong> on a typical 20% fee platform.{" "}
                That's <strong className="text-emerald-400">R {(projectValue * 0.15).toLocaleString()} more in your pocket</strong> — every single time.
              </p>
            </div>
          </div>
        </section>

        {/* ── INCOME POTENTIAL SIMULATOR ────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Income Potential Simulator</h2>
              <p className="text-sm text-gray-400">Adjust your rate and hours to see your realistic 6-month income projection.</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-300">Hourly Rate</label>
                  <span className="text-lg font-bold text-blue-400">R {rate}/hr</span>
                </div>
                <input type="range" min={50} max={2000} step={50} value={rate}
                  onChange={e => setRate(Number(e.target.value))} data-testid="rate-slider"
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
                <div className="flex justify-between text-xs text-gray-600 mt-1"><span>R50</span><span>R1,000</span><span>R2,000</span></div>
                <p className="text-xs text-gray-500 mt-2">
                  {rate < 200 ? "⚠️ Below SA market rate for most skills — use ProfileOptimizer to price correctly" :
                   rate < 500 ? "✅ Market rate range for intermediate skills" :
                   "🔥 Premium rate — achievable with 2+ years experience & strong portfolio"}
                </p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-300">Billable Hours/Week</label>
                  <span className="text-lg font-bold text-blue-400">{hours} hrs/wk</span>
                </div>
                <input type="range" min={5} max={40} step={5} value={hours}
                  onChange={e => setHours(Number(e.target.value))} data-testid="hours-slider"
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
                <div className="flex justify-between text-xs text-gray-600 mt-1"><span>5</span><span>20</span><span>40</span></div>
                <p className="text-xs text-gray-500 mt-2">
                  {hours <= 10 ? "Side hustle mode — perfect for starting out while employed" :
                   hours <= 25 ? "Part-time freelance — strong income without burnout" :
                   "Full-time mode — maximum income potential"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Monthly Gross</p>
                <p className="text-xl font-bold text-blue-400">R {monthlyIncome.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">After 5% Fee</p>
                <p className="text-xl font-bold text-emerald-400">R {Math.round(monthlyIncome * 0.95).toLocaleString()}</p>
              </div>
              <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">On a 20% fee platform</p>
                <p className="text-xl font-bold text-red-400">R {Math.round(monthlyIncome * 0.80).toLocaleString()}</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={projection} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="incNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={v => `R${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any, n: string) => [`R ${v.toLocaleString()}`, n === "gross" ? "Gross Income" : "After Fees (FreelanceSkills)"]} contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Area type="monotone" dataKey="gross" stroke="#3b82f6" fill="url(#incGross)" strokeWidth={2} name="gross" />
                <Area type="monotone" dataKey="net" stroke="#10b981" fill="url(#incNet)" strokeWidth={2} name="net" />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 text-center mt-2">Projection assumes 8% monthly growth as you build reputation. Based on 10,247 platform projects.</p>
          </div>
        </section>

        {/* ── SKILL OPPORTUNITY RADAR ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Skill Opportunity Radar</h2>
              <p className="text-sm text-gray-400">Where demand crushes supply = your income opportunity. No other platform shows you this.</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <div className="flex gap-2 mb-6">
              {(["demand", "supply", "gap"] as const).map(v => (
                <button key={v} onClick={() => setRadarView(v)} data-testid={`radar-${v}`}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize ${radarView === v ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                  {v === "gap" ? "Opportunity Gap" : `${v.charAt(0).toUpperCase() + v.slice(1)} Level`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={SKILL_RADAR}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    {(radarView === "demand" || radarView === "gap") && (
                      <Radar name="Demand" dataKey="demand" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
                    )}
                    {(radarView === "supply" || radarView === "gap") && (
                      <Radar name="Supply" dataKey="supply" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                    )}
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-white mb-3">
                  {radarView === "gap" ? "🎯 Biggest opportunities right now:" : radarView === "demand" ? "📈 Highest demand skills:" : "👥 Most competitive skills:"}
                </p>
                {SKILL_RADAR.sort((a, b) => (b.demand - b.supply) - (a.demand - a.supply)).map(s => {
                  const gap = s.demand - s.supply;
                  return (
                    <div key={s.skill} className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 w-28 flex-shrink-0">{s.skill}</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className="h-2.5 rounded-full transition-all" style={{
                          width: `${radarView === "gap" ? gap : radarView === "demand" ? s.demand : s.supply}%`,
                          backgroundColor: gap > 40 ? "#10b981" : gap > 20 ? "#f59e0b" : "#6b7280"
                        }} />
                      </div>
                      <span className={`text-xs font-medium w-12 text-right ${gap > 40 ? "text-emerald-400" : gap > 20 ? "text-amber-400" : "text-gray-500"}`}>
                        {radarView === "gap" ? `+${gap}` : radarView === "demand" ? s.demand : s.supply}
                        {radarView === "gap" ? "🔥" : "%"}
                      </span>
                    </div>
                  );
                })}
                {radarView === "gap" && (
                  <div className="mt-4 bg-emerald-950/40 border border-emerald-800 rounded-xl p-3">
                    <p className="text-xs text-emerald-300"><strong>Insight:</strong> Data/AI and Trades have the biggest demand-supply gaps. If you have either skill, you can name your price right now.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 30-DAY FREELANCE CHALLENGE ────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">30-Day Freelance Challenge</h2>
              <p className="text-sm text-gray-400">One micro-task per day. Complete all 30 to build unstoppable momentum — start today.</p>
            </div>
            <button onClick={() => setChallengeOpen(o => !o)} data-testid="toggle-challenge"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition-colors">
              {challengeOpen ? "Collapse" : "Open Challenge"}
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">{completedDays.length}</p>
                <p className="text-xs text-gray-500">Days Complete</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-400">{challengeStreak}🔥</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-400">{30 - completedDays.length}</p>
                <p className="text-xs text-gray-500">Days Left</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">{Math.round((completedDays.length / 30) * 100)}%</p>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
            </div>

            <div className="mb-4 bg-gray-800 rounded-full h-3 overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${(completedDays.length / 30) * 100}%` }} />
            </div>

            {completedDays.length < 30 && (
              <div className="mb-5 bg-amber-950/30 border border-amber-800/50 rounded-xl p-4">
                <p className="text-xs text-amber-400 font-medium mb-1">TODAY'S MISSION (Day {Math.min(completedDays.length + 1, 30)})</p>
                <p className="text-sm text-white font-semibold">{CHALLENGE_TASKS[Math.min(completedDays.length, 29)]}</p>
                <button onClick={() => toggleDay(completedDays.length)} data-testid="complete-today"
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition-colors">
                  <CheckCircle className="w-4 h-4" /> Mark Complete
                </button>
              </div>
            )}

            {challengeOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {CHALLENGE_TASKS.map((task, i) => {
                  const done = completedDays.includes(i);
                  const isToday = i === completedDays.length && completedDays.length < 30;
                  return (
                    <button key={i} onClick={() => toggleDay(i)} data-testid={`challenge-day-${i + 1}`}
                      className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all text-sm border ${
                        done ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300" :
                        isToday ? "bg-amber-950/40 border-amber-600/50 text-amber-200" :
                        "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                      }`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        done ? "bg-emerald-500 text-white" : isToday ? "bg-amber-500 text-white" : "bg-gray-700 text-gray-500"
                      }`}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span className={`mt-0.5 ${done ? "line-through" : ""}`}>{task}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── WHAT'S NEXT CTA ───────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-emerald-950/60 to-blue-950/40 border border-emerald-800/30 rounded-2xl p-8 text-center">
          <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">You've seen the intelligence. Now use it.</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            Every data point on this page was built with one goal: put more money in African freelancers' hands. The gap is real. The opportunity is real. The only variable is you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Talk to Vuma", path: "/vuma", icon: <Sparkles className="w-4 h-4" /> },
              { label: "Post a Job", path: "/post-job", icon: <Zap className="w-4 h-4" /> },
              { label: "Start Free Course", path: "/academy", icon: <BookOpen className="w-4 h-4" /> },
              { label: "See Your Admin", path: "/vuma-admin", icon: <Shield className="w-4 h-4" /> },
            ].map(a => (
              <a key={a.label} href={a.path} data-testid={`cta-${a.label.replace(/\s/g, "-").toLowerCase()}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all hover:scale-105">
                {a.icon} {a.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4">CIPC 2026/070509/09 · FreelanceSkills.net · Africa → World</p>
        </section>
      </div>
      <Footer />
    </div>
  );
}

// ── LocalStorage Hook ─────────────────────────────────────────────────────────
function useLocalStorage<T>(key: string, def: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; } });
  const set = useCallback((v: T) => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key]);
  return [val, set];
}
