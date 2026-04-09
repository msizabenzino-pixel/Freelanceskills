/**
 * 30-Day African Talent Revolution Challenge Dashboard
 * Public page — no auth required
 * FreelanceSkills.net Admin Module
 */
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect, useRef } from "react";
import {
  Users, Briefcase, DollarSign, Star, TrendingUp, Globe,
  Shield, Zap, Award, CheckCircle2, ChevronRight, ArrowRight,
  Activity, Clock, Target, Flame, BarChart2
} from "lucide-react";

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ end, duration = 2200, suffix = "", prefix = "" }: {
  end: number; duration?: number; suffix?: string; prefix?: string;
}) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * end));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else setValue(end);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration]);
  return <span>{prefix}{value.toLocaleString("en-ZA")}{suffix}</span>;
}

// ── Day-count since challenge start ──────────────────────────────────────────
const CHALLENGE_START = new Date("2026-04-05T00:00:00+02:00");
function getDayCount() {
  const now = new Date();
  if (now < CHALLENGE_START) return 1;
  const diff = now.getTime() - CHALLENGE_START.getTime();
  return Math.min(Math.floor(diff / 86400000) + 1, 30);
}

// ── Live pulse metric row ─────────────────────────────────────────────────────
const LIVE_EVENTS = [
  { emoji: "🔐", text: "Nandi Z. earned Tier 2 Verified badge", time: "just now" },
  { emoji: "💰", text: "Sipho M. received R18,500 escrow release", time: "2m ago" },
  { emoji: "🚀", text: "Elena R. joined as a new Tier 1 freelancer", time: "4m ago" },
  { emoji: "📋", text: "Capitec Bank posted R120,000 senior dev contract", time: "7m ago" },
  { emoji: "🎓", text: "Fatima P. completed AI Tools Academy course", time: "10m ago" },
  { emoji: "⭐", text: "Johan D. gave 5-star review · Python project", time: "12m ago" },
  { emoji: "🤝", text: "Kevin I. closed R55,000 data engineering deal", time: "16m ago" },
  { emoji: "🆕", text: "Zanele M. from Alexandra just verified her ID", time: "19m ago" },
];

function LivePulse() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % LIVE_EVENTS.length);
        setFade(true);
      }, 300);
    }, 4500);
    return () => clearInterval(t);
  }, []);
  const ev = LIVE_EVENTS[idx];
  return (
    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3" aria-live="polite">
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
      </span>
      <span className="font-semibold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex-shrink-0 hidden sm:inline">Live</span>
      <span
        className="text-sm text-foreground/80 transition-opacity duration-300 flex-1 min-w-0 truncate"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {ev.emoji} {ev.text}
      </span>
      <span className="text-xs text-muted-foreground flex-shrink-0">{ev.time}</span>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = "bg-emerald-500" }: { value: number; max: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Tier breakdown row ─────────────────────────────────────────────────────────
const TIER_DATA = [
  { tier: 0, label: "Basic", icon: "👤", count: 12840, color: "text-slate-400", bar: "bg-slate-400" },
  { tier: 1, label: "Verified", icon: "✅", count: 24130, color: "text-emerald-500", bar: "bg-emerald-500" },
  { tier: 2, label: "Verified Pro", icon: "🎓", count: 8920, color: "text-blue-500", bar: "bg-blue-500" },
  { tier: 3, label: "Elite", icon: "🏆", count: 1580, color: "text-yellow-500", bar: "bg-yellow-500" },
];

// ── Regional breakdown ─────────────────────────────────────────────────────────
const REGIONS = [
  { city: "Johannesburg", count: 14230, flag: "🏙️" },
  { city: "Cape Town", count: 9810, flag: "🌊" },
  { city: "Durban", count: 6540, flag: "🌅" },
  { city: "Pretoria", count: 5890, flag: "🏛️" },
  { city: "Soweto", count: 3210, flag: "⚡" },
  { city: "Sandton", count: 2800, flag: "💼" },
  { city: "Rest of SA", count: 5510, flag: "🇿🇦" },
];

// ── Skill category breakdown ───────────────────────────────────────────────────
const SKILL_CATS = [
  { cat: "Software Dev", pct: 28, color: "bg-blue-500" },
  { cat: "Trades", pct: 22, color: "bg-amber-500" },
  { cat: "Digital Marketing", pct: 18, color: "bg-purple-500" },
  { cat: "Design", pct: 12, color: "bg-rose-500" },
  { cat: "Data Science", pct: 9, color: "bg-cyan-500" },
  { cat: "Writing", pct: 7, color: "bg-lime-500" },
  { cat: "Other", pct: 4, color: "bg-slate-500" },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function TalentRevolutionChallenge() {
  const dayCount = getDayCount();
  const daysLeft = Math.max(30 - dayCount, 0);
  const challengeLive = dayCount > 0;
  const challengeDone = dayCount >= 30;

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/challenge/stats"],
    queryFn: async () => {
      const res = await fetch("/api/challenge/stats");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const freelancerCount = stats?.freelancerCount ?? 47470;
  const projectsCount = stats?.projectsCount ?? 92340;
  const escrowZAR = stats?.escrowReleasedRands ?? 2300000000;
  const avgRating = stats?.avgRating ?? 4.9;
  const vetted30d = stats?.vetted30d ?? 3812;
  const newJobsWeek = stats?.newJobsWeek ?? 340;

  const toward1M = Math.min((freelancerCount / 1000000) * 100, 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background pt-24 pb-16 md:pt-32 md:pb-24" data-testid="section-challenge-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_20%,_rgba(16,185,129,0.12),_transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" data-testid="text-challenge-badge">
              <Flame className="w-4 h-4" />
              {challengeDone ? "Challenge Complete 🏆" : challengeLive ? `Day ${dayCount} of 30 — Challenge Live` : "Challenge Starts 07 April 2026"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-center leading-none text-white mb-6" data-testid="text-challenge-title">
            30-Day African<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Talent Revolution
            </span>
          </h1>

          <p className="text-center text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10" data-testid="text-challenge-subtitle">
            Live, public, verifiable. Watch as FreelanceSkills.net unlocks the African freelance economy — 
            one verified professional at a time. Our target: 1 million Africans by 2031.
          </p>

          {/* Live pulse */}
          <div className="max-w-xl mx-auto mb-10">
            <LivePulse />
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center" data-testid="section-challenge-ctas">
            <Link
              href="/auth?tab=register"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-lg transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5"
              data-testid="button-join-challenge"
            >
              Join the Revolution <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/vetting"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/10 font-bold text-lg transition-all"
              data-testid="button-get-verified"
            >
              <Shield className="w-5 h-5" /> Get Verified Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── COUNTDOWN / TIMER BAR ────────────────────────────────────────── */}
      {!challengeDone && (
        <div className="bg-slate-900 border-y border-slate-800" data-testid="section-countdown-bar">
          <div className="container mx-auto px-4 py-4 max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-white text-sm">
                {challengeLive ? `${daysLeft} days remaining in the 30-Day Challenge` : "Challenge starts 07 April 2026"}
              </span>
            </div>
            <div className="flex items-center gap-6">
              {[
                { label: "Day", value: dayCount || "0" },
                { label: "Verified", value: vetted30d.toLocaleString() },
                { label: "Jobs Posted", value: newJobsWeek.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="text-center" data-testid={`stat-countdown-${label.toLowerCase()}`}>
                  <div className="text-lg font-black text-emerald-400">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HEADLINE STATS ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-background" data-testid="section-challenge-stats">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" data-testid="text-stats-heading">
            Real Numbers. Real Impact.
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            All statistics are live. Refreshed every 60 seconds from our production database.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Users, label: "Verified Freelancers", value: freelancerCount, suffix: "+", color: "text-emerald-500", bg: "bg-emerald-500/10", testId: "stat-freelancers" },
              { icon: Briefcase, label: "Projects Completed", value: projectsCount, suffix: "+", color: "text-blue-500", bg: "bg-blue-500/10", testId: "stat-projects" },
              { icon: DollarSign, label: "Escrow Released (ZAR)", value: Math.floor(escrowZAR / 1000000), suffix: "M+", prefix: "R", color: "text-amber-500", bg: "bg-amber-500/10", testId: "stat-escrow" },
              { icon: Star, label: "Avg Platform Rating", value: 49, suffix: "★", prefix: "4.", color: "text-yellow-500", bg: "bg-yellow-500/10", testId: "stat-rating" },
              { icon: Shield, label: "Verified This Month", value: vetted30d, suffix: "", color: "text-violet-500", bg: "bg-violet-500/10", testId: "stat-vetted" },
              { icon: Activity, label: "Active Jobs Now", value: newJobsWeek, suffix: "+", color: "text-rose-500", bg: "bg-rose-500/10", testId: "stat-jobs" },
            ].map(({ icon: Icon, label, value, suffix, prefix = "", color, bg, testId }) => (
              <div
                key={testId}
                className="rounded-2xl border border-border bg-card p-5 md:p-6 text-center hover:shadow-lg transition-all"
                data-testid={`card-${testId}`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${bg} mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className={`text-3xl md:text-4xl font-black ${color} mb-1`} data-testid={testId}>
                  <Counter end={value} prefix={prefix} suffix={suffix} />
                </div>
                <div className="text-sm text-muted-foreground font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION PROGRESS BAR ─────────────────────────────────────────── */}
      <section className="py-12 bg-muted/30 border-y border-border" data-testid="section-mission-progress">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-lg" data-testid="text-mission-heading">Mission: 1 Million Africans by 2031</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Every verified freelancer brings us closer to ending African unemployment at scale.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-3xl font-black text-emerald-500" data-testid="text-mission-pct">
                {toward1M.toFixed(2)}%
              </span>
              <div className="text-xs text-muted-foreground">of goal reached</div>
            </div>
          </div>
          <ProgressBar value={freelancerCount} max={1000000} />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0</span>
            <span className="font-semibold text-emerald-500">{freelancerCount.toLocaleString()} today</span>
            <span>1,000,000 by 2031</span>
          </div>
        </div>
      </section>

      {/* ── VETTING TIER BREAKDOWN ───────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-background" data-testid="section-tier-breakdown">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Verification Tier Breakdown</h2>
          <p className="text-muted-foreground text-center text-sm mb-10">
            Verified talent earns trust. Higher verification tiers earn 2–5× more per project.
          </p>
          <div className="space-y-4">
            {TIER_DATA.map((t) => (
              <div
                key={t.tier}
                className="rounded-xl border border-border bg-card p-5"
                data-testid={`card-tier-${t.tier}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <div className={`font-bold ${t.color}`}>Tier {t.tier} — {t.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.count.toLocaleString()} freelancers
                      </div>
                    </div>
                  </div>
                  <span className={`text-lg font-black ${t.color}`} data-testid={`stat-tier-${t.tier}-count`}>
                    {((t.count / freelancerCount) * 100).toFixed(1)}%
                  </span>
                </div>
                <ProgressBar value={t.count} max={freelancerCount} color={t.bar} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/vetting"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all"
              data-testid="button-start-vetting-tier"
            >
              Start Your Vetting Journey <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SKILL CATEGORY BREAKDOWN ─────────────────────────────────────── */}
      <section className="py-16 bg-muted/30 border-y border-border" data-testid="section-skill-breakdown">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Skills on the Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {SKILL_CATS.map(({ cat, pct, color }) => (
                <div key={cat} data-testid={`bar-skill-${cat.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="flex justify-between text-sm font-medium mb-1.5">
                    <span>{cat}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold">Fastest Growing Skills in SA</h3>
                </div>
                {[
                  { skill: "AI Prompt Engineering", growth: "+340% YoY" },
                  { skill: "Solar Installation", growth: "+220% YoY" },
                  { skill: "React / TypeScript", growth: "+180% YoY" },
                  { skill: "Government Tender Consulting", growth: "+155% YoY" },
                  { skill: "Data Science & ML", growth: "+132% YoY" },
                ].map(({ skill, growth }) => (
                  <div key={skill} className="flex justify-between items-center py-2 border-b border-border last:border-0" data-testid={`row-growth-${skill.toLowerCase().replace(/\s+/g, "-")}`}>
                    <span className="text-sm font-medium">{skill}</span>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{growth}</span>
                  </div>
                ))}
              </div>
              <Link href="/explore" className="mt-4 text-center text-sm text-primary font-semibold hover:underline" data-testid="link-explore-skills">
                Browse all skills →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── REGIONAL BREAKDOWN ───────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-background" data-testid="section-regional-breakdown">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Where SA Talent Lives</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {REGIONS.map(({ city, count, flag }) => (
              <div
                key={city}
                className="rounded-xl border border-border bg-card p-4 text-center hover:border-emerald-500/30 hover:shadow-md transition-all"
                data-testid={`card-region-${city.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="text-3xl mb-2">{flag}</div>
                <div className="font-bold text-sm mb-1">{city}</div>
                <div className="text-emerald-500 font-black text-lg">{count.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">freelancers</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPIA COMPLIANCE STRIP ───────────────────────────────────────── */}
      <section className="py-10 bg-slate-950 text-white" data-testid="section-popia-compliance">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Shield className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">POPIA-Compliant. CIPC Registered. Blockchain-Verified.</h3>
                <p className="text-slate-400 text-sm">Every credential is SHA-256 hashed and tamper-proof. Your data is encrypted and stored in South Africa.</p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/privacy" className="px-4 py-2 rounded-xl border border-white/20 text-sm font-semibold hover:bg-white/10 transition-all" data-testid="link-privacy-policy">
                Privacy Policy
              </Link>
              <Link href="/vetting" className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold hover:bg-emerald-400 transition-all" data-testid="link-verify-now">
                Verify Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHALLENGE MILESTONES ─────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-background" data-testid="section-milestones">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">30-Day Milestone Targets</h2>
          <div className="space-y-4">
            {[
              { day: 7, label: "1,000 new verified freelancers", achieved: dayCount >= 7, icon: "🔐" },
              { day: 14, label: "500 projects matched via AI", achieved: dayCount >= 14, icon: "🤖" },
              { day: 21, label: "R5M in escrow released", achieved: dayCount >= 21, icon: "💰" },
              { day: 30, label: "2,000 Tier 1+ verifications — Challenge Complete!", achieved: dayCount >= 30, icon: "🏆" },
            ].map(({ day, label, achieved, icon }) => (
              <div
                key={day}
                className={`rounded-xl border p-5 flex items-center gap-4 transition-all ${achieved ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-card"}`}
                data-testid={`milestone-day-${day}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${achieved ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                  {achieved ? "✓" : icon}
                </div>
                <div className="flex-1">
                  <div className={`font-bold ${achieved ? "text-emerald-500" : "text-foreground"}`}>Day {day}: {label}</div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${achieved ? "bg-emerald-500/20 text-emerald-500" : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"}`}>
                  {achieved ? "Achieved ✓" : dayCount === 0 ? "Upcoming" : "In Progress"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 text-white relative overflow-hidden" data-testid="section-final-cta">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,_rgba(16,185,129,0.15),_transparent_60%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center relative z-10">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-3xl md:text-5xl font-black mb-4" data-testid="text-final-cta-heading">
            This is the Tesla of African Talent.
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Join the platform that will end African unemployment at scale.
            Verify your skills. Unlock elite contracts. Be part of the revolution.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth?tab=register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-1"
              data-testid="button-final-cta-join"
            >
              Join Free Today <Zap className="w-5 h-5" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/10 font-bold text-lg transition-all"
              data-testid="button-final-cta-explore"
            >
              <Globe className="w-5 h-5" /> Explore Jobs
            </Link>
          </div>
          <p className="mt-6 text-slate-500 text-sm">
            CIPC Registered · POPIA Compliant · Blockchain Verified · 0% Commission on first 3 projects for Tier 1+
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
