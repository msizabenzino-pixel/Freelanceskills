import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ArrowRight, CheckCircle2, Shield, Sparkles, GraduationCap, TrendingUp, Users,
  Building2, Brain, Globe, ShieldCheck, Lock, Headphones, Star, Quote, Send,
  Zap, Bell, Clock, CheckCheck, Activity, X, Flame, Cpu, MapPin, Briefcase,
  Search, ChevronRight, BadgeCheck, Banknote, Award, Target, Rocket,
  ExternalLink, ThumbsUp, UserCheck, FileText, PenLine, BarChart2
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useCurrency } from "@/lib/currency";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion, AnimatePresence } from "framer-motion";

// ── Live Activity Ticker ───────────────────────────────────────────────────────
const LIVE_ACTIVITIES = [
  { emoji: "🔧", text: "Sipho from Soweto just hired a Plumber", time: "2m ago" },
  { emoji: "💰", text: "Lerato M. completed a Branding project · R4,500 earned", time: "5m ago" },
  { emoji: "📋", text: "Johan D. posted a new tender worth R85,000", time: "8m ago" },
  { emoji: "🎓", text: "Fatima P. from Durban enrolled in AI Academy", time: "11m ago" },
  { emoji: "⭐", text: "Elena R. received a 5-star review from FinTech client", time: "14m ago" },
  { emoji: "🤝", text: "David K. just closed a R22,000 mobile app contract", time: "17m ago" },
  { emoji: "🆕", text: "Zanele M. from Cape Town just joined FreelanceSkills", time: "20m ago" },
  { emoji: "💳", text: "Thabo N. received a ZAR payout of R12,500", time: "23m ago" },
  { emoji: "📝", text: "Nandi Z. won her first government tender · R45,000", time: "26m ago" },
  { emoji: "🚀", text: "Kevin I. upgraded to Premium · profile views up 400%", time: "30m ago" },
];

function LiveActivityTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIndex(p => (p + 1) % LIVE_ACTIVITIES.length); setVisible(true); }, 280);
    }, 4000);
    return () => clearInterval(iv);
  }, []);
  const a = LIVE_ACTIVITIES[index];
  return (
    <div className="bg-emerald-950/60 border-b border-emerald-900/50 py-2.5 px-4 overflow-hidden" aria-live="polite">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 hidden sm:inline">Live</span>
        </div>
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div key={index} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}
              className="flex items-center gap-2 text-sm">
              <span>{a.emoji}</span>
              <span className="text-white/80 font-medium">{a.text}</span>
              <span className="text-white/35 text-xs flex-shrink-0">· {a.time}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Instant Apply Modal ────────────────────────────────────────────────────────
function InstantApplyModal({ job, onClose }: { job: { title: string; company: string; budget: string; location: string } | null; onClose: () => void }) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [note, setNote] = useState("");
  const confettiRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (step === "success" && confettiRef.current) {
      const colors = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];
      for (let i = 0; i < 60; i++) {
        const el = document.createElement("div");
        el.style.cssText = `position:absolute;width:7px;height:7px;border-radius:2px;background:${colors[i % colors.length]};left:${Math.random()*100}%;top:${Math.random()*30}%;animation:confettiFall ${1+Math.random()*2}s ease-out forwards;transform:rotate(${Math.random()*360}deg);animation-delay:${Math.random()*0.5}s;`;
        confettiRef.current.appendChild(el);
      }
    }
  }, [step]);
  if (!job) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} data-testid="modal-instant-apply">
        <motion.div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} onClick={e => e.stopPropagation()}>
          <style>{`@keyframes confettiFall{to{transform:translateY(200px) rotate(720deg);opacity:0;}}`}</style>
          {step === "success" ? (
            <div ref={confettiRef} className="relative p-8 text-center overflow-hidden">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-white mb-2" data-testid="text-apply-success-title">Application Sent!</h3>
              <p className="text-slate-400 text-sm mb-2">Your proposal for <span className="font-semibold text-white">{job.title}</span> has been sent.</p>
              <p className="text-emerald-400 text-xs font-semibold mb-6">Verified freelancers get responses 3× faster →</p>
              <div className="flex gap-3">
                <Link href="/vetting" className="flex-1 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm text-center hover:bg-emerald-400 transition-all" data-testid="button-apply-success-verify">Get Verified</Link>
                <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all" data-testid="button-apply-success-close">Done</button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight" data-testid="text-apply-modal-title">{job.title}</h3>
                  <p className="text-sm text-slate-400">{job.company}</p>
                </div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 transition-all" data-testid="button-apply-modal-close"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="flex gap-3 text-xs text-slate-400 mb-5">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Flame className="w-3.5 h-3.5" />{job.budget}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-5 flex items-start gap-3">
                <Cpu className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-emerald-400 mb-0.5">AI Pre-filled Proposal</div>
                  <div className="text-slate-400">Based on your profile, skills, and SA market rates.</div>
                </div>
              </div>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                className="w-full h-24 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 mb-4 placeholder:text-slate-500"
                placeholder="Hi, I'm interested in this role..." data-testid="textarea-apply-proposal" />
              <button onClick={() => { if (!note.trim()) setNote("I have the skills and availability to deliver this project on time."); setStep("success"); }}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2" data-testid="button-apply-submit">
                <Send className="w-4 h-4" /> Send Application
              </button>
              <p className="text-xs text-slate-500 text-center mt-3">Verified freelancers get 3× more interview invites</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── PWA Install Button ─────────────────────────────────────────────────────────
function PWAInstallButton() {
  const [installState, setInstallState] = useState<"idle" | "available" | "installed">("idle");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showFallback, setShowFallback] = useState(false);
  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); setInstallState("available"); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstallState("installed"));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstallState("installed");
      setDeferredPrompt(null);
    } else { setShowFallback(true); }
  };
  if (installState === "installed") return (
    <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
      <CheckCircle2 className="w-4 h-4" /> App installed! Open from your home screen.
    </div>
  );
  return (
    <>
      <button onClick={handleInstall}
        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        data-testid="button-pwa-install">
        <Zap className="w-4 h-4" /> Install the App — Free
      </button>
      {showFallback && (
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm">
          <p className="font-semibold mb-2 text-white">How to install:</p>
          <ul className="space-y-1 text-white/50 text-xs">
            <li>• <strong className="text-white/70">Chrome/Android:</strong> Menu (⋮) → "Add to Home Screen"</li>
            <li>• <strong className="text-white/70">Safari/iOS:</strong> Share (↑) → "Add to Home Screen"</li>
            <li>• <strong className="text-white/70">Desktop:</strong> Click install icon (⊕) in address bar</li>
          </ul>
          <button onClick={() => setShowFallback(false)} className="mt-3 text-xs text-emerald-400">Close</button>
        </div>
      )}
    </>
  );
}

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1800 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0; const end = value;
    if (start === end) return;
    const step = Math.max(10, duration / end * 2);
    const inc = Math.ceil(end / (duration / step));
    const timer = setInterval(() => {
      start += inc;
      if (start >= end) { setCount(end); clearInterval(timer); } else { setCount(start); }
    }, step);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count.toLocaleString()}</span>;
}

// ── Hero Floating Profile Card ─────────────────────────────────────────────────
function HeroProfileCard({ name, title, rate, img, delay }: { name: string; title: string; rate: string; img: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-4 py-3 shadow-xl shadow-black/40 w-56"
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10 border-2 border-emerald-500/40">
          <AvatarImage src={img} alt={name} />
          <AvatarFallback className="bg-emerald-900 text-emerald-300 font-bold text-sm">{name[0]}</AvatarFallback>
        </Avatar>
        {/* Open to Work ring */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-xs truncate">{name}</div>
        <div className="text-slate-400 text-[10px] truncate">{title}</div>
        <div className="text-emerald-400 text-[10px] font-bold mt-0.5">{rate}/hr</div>
      </div>
    </motion.div>
  );
}

// ── Real Job Card (with AI match score) ───────────────────────────────────────
function RealJobCard({ job, onApply }: { job: any; onApply: () => void }) {
  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "Recently";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const salaryLabel = () => {
    if (job.salaryMin && job.salaryMax) return `R${(job.salaryMin / 100).toLocaleString()}–R${(job.salaryMax / 100).toLocaleString()}`;
    if (job.salaryMin) return `From R${(job.salaryMin / 100).toLocaleString()}`;
    return "Competitive";
  };

  const skills = Array.isArray(job.skills) ? job.skills.slice(0, 3) : [];
  const matchScore: number | null = job.aiScore && job.aiScore > 0 ? Math.min(99, Math.round(job.aiScore)) : null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-colors duration-200 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col gap-3"
      data-testid={`card-real-job-${job.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {job.isUrgent && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">Urgent</span>}
            {job.isRemote && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">Remote</span>}
            {job.experienceLevel === "entry" && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Entry Level</span>}
          </div>
          <h3 className="font-bold text-white text-sm leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">{job.title}</h3>
          <p className="text-slate-400 text-xs mt-1 font-medium">{job.company}</p>
        </div>
        {/* AI Match Score badge */}
        {matchScore !== null ? (
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-400 font-black text-sm leading-none">{matchScore}%</span>
            <span className="text-emerald-600 text-[8px] font-bold uppercase tracking-wider leading-none mt-0.5">Match</span>
          </div>
        ) : (
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location || job.country || "Worldwide"}</span>
        <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Banknote className="w-3 h-3" />{salaryLabel()}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(job.postedDate)}</span>
      </div>

      {skills.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {skills.map((s: string, i: number) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">{s}</span>
          ))}
        </div>
      )}

      {/* Source badge */}
      {job.source && (
        <div className="text-[10px] text-slate-600 font-medium">via {job.source}</div>
      )}

      <div className="flex gap-2 pt-1 mt-auto">
        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5"
          data-testid={`button-apply-job-${job.id}`}>
          <ExternalLink className="w-3.5 h-3.5" /> Apply Now
        </a>
        <button onClick={onApply}
          className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 font-bold text-xs transition-all"
          data-testid={`button-quick-apply-${job.id}`}>
          Quick Apply
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Home Component ────────────────────────────────────────────────────────
export default function Home() {
  const { formatAmount } = useCurrency();
  const [, navigate] = useLocation();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [applyJob, setApplyJob] = useState<{ title: string; company: string; budget: string; location: string } | null>(null);
  const [profileCompletion] = useState(42); // demo completion %

  const { data: realJobsData } = useQuery<any>({
    queryKey: ["/api/aggregated-jobs", { limit: 6, sortBy: "recent" }],
    queryFn: async () => {
      const res = await fetch("/api/aggregated-jobs?limit=6&sortBy=recent");
      if (!res.ok) return { jobs: [], total: 0 };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const realJobs: any[] = realJobsData?.jobs || [];
  const totalJobs: number = realJobsData?.total || 11400;

  const { data: liveBlogPosts } = useQuery<any[]>({
    queryKey: ["/api/blog/posts", { limit: 3, featured: true }],
    queryFn: async () => {
      const res = await fetch("/api/blog/posts?limit=3&featured=true");
      if (!res.ok) return null;
      const data = await res.json();
      return data.posts || data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail, source: "homepage" }),
      });
      const data = await res.json();
      if (res.ok && data.success) { setNewsletterStatus("success"); setNewsletterMsg(data.message || "You're subscribed!"); setNewsletterEmail(""); }
      else { setNewsletterStatus("error"); setNewsletterMsg(data.error || "Something went wrong. Please try again."); }
    } catch { setNewsletterStatus("error"); setNewsletterMsg("Network error. Please try again."); }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/jobs?q=${encodeURIComponent(searchQuery.trim())}` : "/jobs");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col overflow-x-hidden" style={{ paddingTop: 56 }}>
      {applyJob && <InstantApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
      <Navbar topOffset={0} />

      {/* ══ HERO ══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[94vh] flex items-center justify-center overflow-hidden" data-testid="section-hero">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/20" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute top-1/4 -left-20 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-500/4 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-emerald-500/2 rounded-full blur-[180px] pointer-events-none" />

        {/* Floating profile cards — desktop only */}
        <div className="hidden xl:flex absolute left-8 2xl:left-16 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
          <HeroProfileCard name="Thabo M." title="Senior Dev · Soweto" rate={formatAmount(750)} img="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=80&h=80" delay={0.7} />
          <HeroProfileCard name="Lerato D." title="Brand Designer · CT" rate={formatAmount(600)} img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80" delay={0.85} />
        </div>
        <div className="hidden xl:flex absolute right-8 2xl:right-16 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
          <HeroProfileCard name="Nandi Z." title="Digital Marketing · DBN" rate={formatAmount(450)} img="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=80&h=80" delay={1.0} />
          <HeroProfileCard name="David K." title="Mobile Dev · JHB" rate={formatAmount(800)} img="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=80&h=80" delay={1.1} />
        </div>

        <div className="container relative z-10 px-4 md:px-6 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Live jobs badge */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-semibold mb-8 shadow-lg">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <AnimatedCounter value={totalJobs} duration={1500} />+ Real Jobs · Updated Every 30 Min · Verified Marketplace
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06] mb-6">
              <span className="text-white">Your Professional</span><br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                Freelance Future
              </span><br />
              <span className="text-white/90">Starts Here</span>
            </motion.h1>

            {/* Sub */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Skills-first network. AI matching. Secure escrow payments. Real opportunity.<br />
              <span className="text-emerald-400 font-semibold">Find work. Hire fast. Get paid safely.</span>
            </motion.p>

            {/* Search */}
            <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8" data-testid="form-hero-search">
              <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700 hover:border-emerald-500/40 focus-within:border-emerald-500/60 rounded-2xl px-4 py-3 shadow-2xl transition-all">
                <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, skills, or companies across Africa..."
                  className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-base focus:outline-none"
                  data-testid="input-hero-search" />
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex-shrink-0" data-testid="button-hero-search">
                  Search
                </button>
              </div>
              {/* Search suggestions */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {["React Developer", "Plumber", "Brand Designer", "Remote Finance", "Government Tender"].map((s, i) => (
                  <button key={i} type="button" onClick={() => { setSearchQuery(s); navigate(`/jobs?q=${encodeURIComponent(s)}`); }}
                    className="text-[11px] px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 text-slate-500 hover:text-emerald-400 transition-all"
                    data-testid={`search-suggestion-${i}`}>{s}</button>
                ))}
              </div>
            </motion.form>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 flex-wrap">
              <Link href="/freelancer-onboarding"
                className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                data-testid="button-hero-create-profile">
                <BadgeCheck className="w-5 h-5" /> Create Free Professional Profile
              </Link>
              <Link href="/jobs"
                className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-bold text-base backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                data-testid="button-hero-browse-jobs">
                Browse Opportunities <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/post-job"
                className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 font-semibold text-base transition-all hover:bg-emerald-500/5"
                data-testid="button-hero-post-project">
                <Briefcase className="w-5 h-5" /> Hire Verified Talent
              </Link>
            </motion.div>

            {/* Open to Freelance badge */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.55 }}
              className="flex items-center justify-center">
              <button onClick={() => navigate("/freelancer-onboarding")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all group"
                data-testid="badge-open-to-work">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-400 text-xs font-medium group-hover:text-slate-300 transition-colors">
                  Set yourself as <span className="text-emerald-400 font-bold">"Open to Freelance Gigs"</span> — like LinkedIn's Open to Work, but for Africa
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-2">
              {[
                { value: 11400, suffix: "+", label: "Live Jobs" },
                { value: 12, suffix: " Sources", label: "Verified Sources" },
                { value: 54, suffix: " Countries", label: "African Reach" },
                { value: 10, suffix: "%", label: "Transparent Fees" },
              ].map((stat, i) => (
                <div key={i} className="text-center" data-testid={`stat-hero-${i}`}>
                  <div className="text-lg font-black text-emerald-400"><AnimatedCounter value={stat.value} duration={2000} />{stat.suffix}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Ticker */}
      <LiveActivityTicker />

      {/* ── TRUST STRIP ─────────────────────────────────────────────────────────── */}
      <div className="py-4 bg-slate-900/50 border-b border-slate-800/60" aria-label="Trust signals">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {[
              { icon: ShieldCheck, label: "POPIA Compliant", color: "text-emerald-400" },
              { icon: Lock, label: "Escrow Protected", color: "text-blue-400" },
              { icon: Clock, label: "14-Day Money-Back", color: "text-amber-400" },
              { icon: CheckCheck, label: "CIPC Registered", color: "text-violet-400" },
              { icon: Shield, label: "ID Verified Talent", color: "text-emerald-400" },
              { icon: Activity, label: "48h Dispute Resolution", color: "text-rose-400" },
            ].map(({ icon: Icon, label, color }, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400" data-testid={`trust-${i}`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="font-medium whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main id="main-content" role="main">

        {/* ══ OPEN TO GIGS NETWORK LAYER (NEW — LinkedIn killer) ════════════════ */}
        <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900/60 border-b border-slate-800/50" aria-labelledby="network-heading" data-testid="section-open-to-gigs">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-14 items-center">
              {/* Left: messaging */}
              <div className="flex-1 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-5">
                  <UserCheck className="w-3.5 h-3.5" /> Your Professional Freelance Identity
                </div>
                <h2 id="network-heading" className="text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
                  Not Just a Profile — <span className="text-blue-400">Your Digital Freelance CV</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Show verified skills, reviews, and availability so clients can hire you fast.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: BadgeCheck, title: "Skills Endorsements", desc: "Peers and clients endorse your skills — stronger than LinkedIn recommendations", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    { icon: PenLine, title: "AI-Assisted Profile Builder", desc: "10-minute setup. AI writes your headline, summary, and skill tags from your experience", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { icon: BarChart2, title: "Profile Strength Score", desc: "Real-time score showing how discoverable you are to clients — with action tips", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
                    { icon: FileText, title: "Open to Freelance Gigs Badge", desc: "Signal availability like LinkedIn's Open to Work — but for freelance projects, not jobs", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                  ].map(({ icon: Icon, title, desc, color, bg }, i) => (
                    <div key={i} className="flex items-start gap-3" data-testid={`network-feature-${i}`}>
                      <div className={`w-9 h-9 rounded-xl border ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{title}</div>
                        <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/freelancer-onboarding")}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
                  data-testid="button-build-profile">
                  <PenLine className="w-4 h-4" /> Build My Professional Profile →
                </button>
              </div>

              {/* Right: Interactive mock profile card */}
              <div className="flex-1 max-w-sm w-full mx-auto">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Cover */}
                  <div className="h-20 bg-gradient-to-r from-emerald-900/60 via-teal-900/40 to-blue-900/60 relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2310b981' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }} />
                  </div>
                  <div className="px-5 pb-5">
                    {/* Avatar + Open to Gigs badge */}
                    <div className="flex items-end justify-between -mt-8 mb-3">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border-4 border-slate-900 shadow-xl">
                          <AvatarImage src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=120&h=120" alt="Profile" />
                          <AvatarFallback className="bg-emerald-900 text-emerald-300 font-black text-lg">T</AvatarFallback>
                        </Avatar>
                        {/* Open to Gigs ring */}
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full px-1.5 py-0.5 flex items-center gap-1 border-2 border-slate-900">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span className="text-[8px] text-slate-950 font-black">Open to Gigs</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">✓ ID Verified</span>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold">⭐ Top Rated</span>
                      </div>
                    </div>

                    <h3 className="font-black text-white text-base">Thabo M.</h3>
                    <p className="text-slate-400 text-xs mb-1">Senior Full-Stack Developer · Soweto, Gauteng</p>
                    <p className="text-emerald-400 text-xs font-bold mb-3">R750/hr · Available Immediately</p>

                    {/* Profile strength bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Profile Strength</span>
                        <span className="text-[10px] text-emerald-400 font-bold">{profileCompletion}% — Add portfolio to reach All-Star</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${profileCompletion}%` }} transition={{ duration: 1.2, delay: 0.5 }} />
                      </div>
                    </div>

                    {/* Skills with endorsements */}
                    <div className="mb-4">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">Skills & Endorsements</div>
                      <div className="space-y-1.5">
                        {[
                          { skill: "React / TypeScript", count: 34, width: "85%" },
                          { skill: "Node.js / PostgreSQL", count: 27, width: "68%" },
                          { skill: "AWS / DevOps", count: 19, width: "47%" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-white text-[11px] font-medium">{item.skill}</span>
                                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                                  <ThumbsUp className="w-2.5 h-2.5" /> {item.count}
                                </span>
                              </div>
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-emerald-500/60 rounded-full"
                                  initial={{ width: 0 }} animate={{ width: item.width }} transition={{ duration: 1, delay: 0.8 + i * 0.1 }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { val: "42", label: "Reviews", color: "text-amber-400" },
                        { val: "5.0", label: "Rating", color: "text-amber-400" },
                        { val: "R120k", label: "Earned", color: "text-emerald-400" },
                      ].map((s, i) => (
                        <div key={i} className="bg-slate-800/60 rounded-xl p-2 text-center">
                          <div className={`font-black text-sm ${s.color}`}>{s.val}</div>
                          <div className="text-slate-600 text-[9px] uppercase tracking-wider">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => navigate("/freelancer-onboarding")}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                      data-testid="button-profile-cta">
                      Build a Profile Like This →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ RECOMMENDED JOBS (Real Data) ══════════════════════════════════════ */}
        <section className="py-20 bg-slate-950" aria-labelledby="recommended-jobs-heading" data-testid="section-recommended-jobs">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> Real Opportunities — Updated Every 30 Minutes
                </div>
                <h2 id="recommended-jobs-heading" className="text-3xl md:text-4xl font-black text-white mb-2">
                  Recommended for You
                </h2>
                <p className="text-slate-400 text-base">AI-matched from <span className="text-emerald-400 font-semibold">{totalJobs.toLocaleString()}+ live jobs</span> across Africa and globally. Match % shown per job.</p>
              </div>
              <button onClick={() => navigate("/jobs")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 font-semibold text-sm transition-all" data-testid="button-view-all-jobs">
                View All Jobs <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {realJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {realJobs.map((job: any) => (
                  <RealJobCard key={job.id} job={job}
                    onApply={() => setApplyJob({ title: job.title, company: job.company, budget: job.salaryMin ? `R${(job.salaryMin/100).toLocaleString()}+` : "Competitive", location: job.location || job.country || "Remote" })} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-pulse h-56" />
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-8" aria-label="Job category filters">
              {["Remote", "South Africa", "Entry Level", "Tech & Dev", "Design", "Marketing", "Finance", "Writing"].map((chip, i) => (
                <button key={i} onClick={() => navigate(`/jobs?q=${encodeURIComponent(chip)}`)}
                  className="px-4 py-2 rounded-full border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 text-sm font-medium transition-all hover:bg-emerald-500/5"
                  data-testid={`chip-category-${i}`}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ══ VALUE PILLARS ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-gradient-to-b from-slate-900/40 to-slate-950 border-y border-slate-800/50" aria-labelledby="pillars-heading" data-testid="section-value-pillars">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-5">
              <h2 id="pillars-heading" className="text-3xl md:text-4xl font-black text-white mb-4">Why FreelanceSkills Beats LinkedIn for Freelancers</h2>
              <p className="text-slate-400 text-lg">Every feature was built for Africa's reality — not Silicon Valley's assumptions.</p>
            </div>
            {/* vs LinkedIn comparison row */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-px bg-slate-800 flex-1 max-w-[120px]" />
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-500 font-medium">LinkedIn</div>
                <div className="text-slate-700">vs</div>
                <div className="text-xs text-emerald-400 font-bold">FreelanceSkills ✓</div>
              </div>
              <div className="h-px bg-slate-800 flex-1 max-w-[120px]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: BadgeCheck, color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20", iconColor: "text-emerald-400",
                  title: "Verified Skills & Endorsements", badge: "Stronger than LinkedIn recommendations",
                  vs: "LinkedIn: Anyone can endorse", ours: "We: Skills-tested + ID-verified",
                  desc: "Multi-layer verification: ID, skills assessments, and portfolio review. Not just soft endorsements — real, tested proof.",
                },
                {
                  icon: Lock, color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20", iconColor: "text-blue-400",
                  title: "Secure Escrow & Instant ZAR Payouts", badge: "100% payment protection",
                  vs: "LinkedIn: No payment layer", ours: "We: Escrow → instant bank transfer",
                  desc: "Funds held in escrow until work is approved. Instant ZAR bank transfers. No ghost clients, no unpaid invoices.",
                },
                {
                  icon: Brain, color: "from-violet-500/20 to-purple-500/10 border-violet-500/20", iconColor: "text-violet-400",
                  title: "AI Smart Matching + Skills Path", badge: "Your personal career AI",
                  vs: "LinkedIn: Algorithm shows you ads", ours: "We: AI matches you to revenue",
                  desc: "Our AI surfaces the highest-ROI opportunities + builds a personalised learning path to get you there faster.",
                },
                {
                  icon: Banknote, color: "from-amber-500/20 to-orange-500/10 border-amber-500/20", iconColor: "text-amber-400",
                  title: "Transparent 10% Fees Only", badge: "No hidden charges, ever",
                  vs: "LinkedIn Premium: R600+/month", ours: "We: Only 10% when you earn",
                  desc: "Nothing until you get paid. Flat 10% on success. Industry-leading rates for African freelancers.",
                },
                {
                  icon: Globe, color: "from-teal-500/20 to-emerald-500/10 border-teal-500/20", iconColor: "text-teal-400",
                  title: "Built for Africa — Local + Global", badge: "54 countries, one platform",
                  vs: "LinkedIn: US-dollar payments", ours: "We: ZAR + M-Pesa + mobile money",
                  desc: "SA escrow, Kenyan mobile money, Nigerian bank transfers. We handle cross-border African payments so you don't have to.",
                },
                {
                  icon: Headphones, color: "from-rose-500/20 to-pink-500/10 border-rose-500/20", iconColor: "text-rose-400",
                  title: "24/7 SA Support + 48h Disputes", badge: "Real humans, real help",
                  vs: "LinkedIn: Chatbot only", ours: "We: SA humans, 48h resolution",
                  desc: "WhatsApp, call, or live chat. Our team understands SARS, CIPC, and BEE. Disputes resolved in under 48 hours.",
                },
              ].map((pillar, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className={`bg-gradient-to-br ${pillar.color} border rounded-2xl p-6 hover:shadow-xl transition-all duration-200 group`} data-testid={`card-pillar-${i}`}>
                  <div className="w-11 h-11 rounded-xl bg-slate-950/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <pillar.icon className={`w-5 h-5 ${pillar.iconColor}`} />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">{pillar.badge}</div>
                  <h3 className="font-black text-white text-lg mb-3 leading-snug">{pillar.title}</h3>
                  {/* vs comparison */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 font-black text-[8px]">✕</span>
                      </span>
                      <span className="text-slate-500">{pillar.vs}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 font-black text-[8px]">✓</span>
                      </span>
                      <span className="text-emerald-400 font-semibold">{pillar.ours}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FOR BEGINNERS ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-slate-950" aria-labelledby="beginners-heading" data-testid="section-for-beginners">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-5">
                  <Rocket className="w-3.5 h-3.5" /> Perfect for Beginners
                </div>
                <h2 id="beginners-heading" className="text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
                  Land Your First Paid Gig — <span className="text-amber-400">No Experience Required</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Everyone starts somewhere. FreelanceSkills has hundreds of entry-level projects designed for first-timers. Build your portfolio. Earn real money. Grow from there.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: Target, text: "Browse 'No Experience Required' projects", color: "text-emerald-400" },
                    { icon: GraduationCap, text: "Free micro-courses to qualify for gigs instantly", color: "text-blue-400" },
                    { icon: BadgeCheck, text: "Build a verified profile in minutes", color: "text-violet-400" },
                    { icon: Award, text: "Earn your first 5-star review — unlock higher-paying gigs", color: "text-amber-400" },
                  ].map(({ icon: Icon, text, color }, i) => (
                    <div key={i} className="flex items-center gap-3" data-testid={`beginner-step-${i}`}>
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <span className="text-slate-300 font-medium text-sm">{text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => navigate("/jobs?level=entry")}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                    data-testid="button-beginner-browse">
                    Browse Entry-Level Jobs <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate("/academy")}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 font-semibold text-sm transition-all"
                    data-testid="button-beginner-learn">
                    <GraduationCap className="w-4 h-4" /> Learn & Earn
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full max-w-md">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Quick-Start Projects — Zero Experience Needed</div>
                <div className="space-y-3">
                  {[
                    { title: "Data Entry & Admin Support", pay: "R250–R800/hr", badge: "Beginner Friendly", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
                    { title: "Social Media Content Creator", pay: "R1,500–R5,000/project", badge: "No Portfolio Needed", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
                    { title: "Junior Logo & Brand Design", pay: "R500–R2,000/project", badge: "Learn & Earn", color: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
                    { title: "Virtual Assistant (Remote)", pay: "R150–R400/hr", badge: "No Experience", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
                    { title: "Article & Blog Writing", pay: "R200–R600/article", badge: "Beginner Friendly", color: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
                  ].map((item, i) => (
                    <motion.button key={i} onClick={() => navigate("/jobs")} whileHover={{ x: 4 }}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-colors text-left group"
                      data-testid={`card-quick-start-${i}`}>
                      <div>
                        <div className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">{item.title}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{item.pay}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${item.color} flex-shrink-0 ml-3`}>{item.badge}</span>
                    </motion.button>
                  ))}
                </div>
                <button onClick={() => navigate("/jobs?level=entry")} className="w-full mt-4 py-3 rounded-xl border border-slate-800 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 text-sm font-medium transition-all" data-testid="button-see-all-beginner">
                  See all beginner opportunities →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TOP VERIFIED PROFESSIONALS ════════════════════════════════════════ */}
        <section className="py-20 bg-slate-900/30 border-y border-slate-800/50" aria-labelledby="top-freelancers-heading" data-testid="section-top-freelancers">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <Award className="w-3.5 h-3.5" /> Verified Top Professionals
                </div>
                <h2 id="top-freelancers-heading" className="text-3xl md:text-4xl font-black text-white mb-2">
                  Meet Africa's Best Freelancers
                </h2>
                <p className="text-slate-400">ID-verified. Skills-tested. Endorsed by real clients.</p>
              </div>
              <button onClick={() => navigate("/find-talent")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 hover:border-blue-500/40 text-slate-300 hover:text-blue-400 font-semibold text-sm transition-all" data-testid="button-browse-talent">
                Browse All Talent <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Thabo M.", title: "Senior Software Engineer", location: "Soweto, GP", rate: formatAmount(750), rating: 5.0, reviews: 42, endorsements: 48, skills: ["Python", "Django", "React"], img: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200&h=200", badge: "Top Rated", openToWork: true },
                { name: "Sarah L.", title: "Brand Strategist & Designer", location: "Cape Town, WC", rate: formatAmount(600), rating: 4.9, reviews: 85, endorsements: 62, skills: ["Branding", "Logo", "Adobe CC"], img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200", badge: "Expert", openToWork: true },
                { name: "David K.", title: "Mobile App Developer", location: "Johannesburg, GP", rate: formatAmount(800), rating: 4.8, reviews: 29, endorsements: 31, skills: ["Flutter", "iOS", "Firebase"], img: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200&h=200", badge: "Rising Star", openToWork: false },
                { name: "Nandi Z.", title: "Digital Marketing Specialist", location: "Durban, KZN", rate: formatAmount(450), rating: 5.0, reviews: 63, endorsements: 55, skills: ["SEO", "Google Ads", "Social"], img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200", badge: "Top Rated", openToWork: true },
              ].map((f, i) => (
                <motion.button key={i} onClick={() => navigate("/find-talent")} whileHover={{ y: -3 }}
                  className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-5 text-left transition-colors duration-200 hover:shadow-xl hover:shadow-emerald-500/5"
                  data-testid={`card-freelancer-${i}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      {/* Open to Work ring — green border */}
                      <div className={`p-0.5 rounded-full ${f.openToWork ? "bg-gradient-to-br from-emerald-500 to-teal-400" : "bg-slate-700"}`}>
                        <Avatar className="h-13 w-13 border-2 border-slate-900">
                          <AvatarImage src={f.img} alt={f.name} />
                          <AvatarFallback className="bg-emerald-900 text-emerald-300 font-bold">{f.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      {f.openToWork && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 rounded-full px-1.5 py-0.5 whitespace-nowrap">
                          <span className="text-[7px] text-slate-950 font-black">Open to Gigs</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{f.badge}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors mt-2">{f.name}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{f.title}</p>
                  <p className="text-slate-600 text-[10px] mt-0.5">{f.location}</p>
                  <div className="flex items-center gap-1 my-2.5">
                    {[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 ${j < Math.floor(f.rating) ? "fill-amber-400 text-amber-400" : "text-slate-700"}`} />)}
                    <span className="text-slate-500 text-xs ml-1">{f.rating} ({f.reviews})</span>
                  </div>
                  {/* Endorsements badge */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <ThumbsUp className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-400 text-xs font-bold">{f.endorsements} Endorsements</span>
                    <span className="text-slate-700 text-[10px]">· ✓ Skills Verified</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {f.skills.map((s, j) => <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">{s}</span>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-black text-sm">{f.rate}/hr</span>
                    <span className="text-xs text-slate-600 group-hover:text-emerald-500 font-medium transition-colors">View Profile →</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SUCCESS STORIES ═══════════════════════════════════════════════════ */}
        <section className="py-20 bg-slate-950" aria-labelledby="success-heading" data-testid="section-success-stories">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider mb-5">
                <TrendingUp className="w-3.5 h-3.5" /> Real Wins, Real People
              </div>
              <h2 id="success-heading" className="text-3xl md:text-4xl font-black text-white mb-4">Professional Growth Stories</h2>
              <p className="text-slate-400 text-lg">From unemployed graduate to six-figure freelancer. These are real African stories.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  name: "Thabo Nkosi", location: "Johannesburg, GP", emoji: "🧑‍💻",
                  before: "Unemployed developer, 8 months job hunting with no results.",
                  after: "R120,000/month remote senior dev — working for UK FinTech from Soweto.",
                  growth: "R0 → R120k/month in 6 months",
                  quote: "The AI matched me to jobs I didn't know I qualified for. Escrow made my first international client trust me immediately.",
                  endorsements: 34, color: "border-emerald-500/20"
                },
                {
                  name: "Lerato Dlamini", location: "Cape Town, WC", emoji: "🎨",
                  before: "Freelance designer charging R150/hr with no way to prove skills.",
                  after: "Top-rated brand designer, verified portfolio, R45,000/month average.",
                  growth: "R150/hr → R650/hr",
                  quote: "The verification badge changed everything. Clients stopped negotiating my rates — they just hired me.",
                  endorsements: 62, color: "border-blue-500/20"
                },
                {
                  name: "Zanele Khoza", location: "Durban, KZN", emoji: "🧹",
                  before: "Started with one vacuum cleaner and a dream to be her own boss.",
                  after: "CEO of 12-person cleaning company with R800k annual turnover.",
                  growth: "1 person → 12-person company",
                  quote: "I started with one vacuum cleaner and the FreelanceSkills app. Today I'm financially independent and employing other women.",
                  endorsements: 45, color: "border-amber-500/20"
                },
              ].map((story, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`bg-slate-900 border ${story.color} rounded-2xl p-6 flex flex-col`} data-testid={`card-success-${i}`}>
                  <div className="text-4xl mb-4">{story.emoji}</div>
                  <div className="mb-4">
                    <h3 className="font-black text-white text-lg">{story.name}</h3>
                    <p className="text-slate-500 text-sm">{story.location}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <ThumbsUp className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-400 text-xs font-bold">{story.endorsements} Skills Endorsements</span>
                    </div>
                  </div>
                  <div className="space-y-3 mb-5 flex-1">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <p className="text-slate-400 text-sm leading-relaxed">{story.before}</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">{story.after}</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4">
                    <TrendingUp className="w-3.5 h-3.5" /> {story.growth}
                  </div>
                  <div className="border-t border-slate-800 pt-4">
                    <Quote className="w-5 h-5 text-slate-700 mb-2" />
                    <p className="text-slate-400 italic text-sm leading-relaxed">"{story.quote}"</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ AFRICA COVERAGE ═══════════════════════════════════════════════════ */}
        <section className="py-16 bg-gradient-to-b from-slate-900/30 to-slate-950 border-y border-slate-800/50" data-testid="section-africa-coverage">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-5">
                  <Globe className="w-3.5 h-3.5" /> Pan-African Reach
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Local. Continental. Global.</h2>
                <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                  Localised payment rails, currency support, and compliance for each African market. One platform, the whole continent.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { country: "🇿🇦 South Africa", status: "Full support · ZAR · PayFast · POPIA", primary: true },
                    { country: "🇰🇪 Kenya", status: "M-Pesa · KES · Live", primary: true },
                    { country: "🇳🇬 Nigeria", status: "NGN · Bank Transfer · Live", primary: true },
                    { country: "🇬🇭 Ghana", status: "GHS · Mobile Money", primary: false },
                    { country: "🇪🇬 Egypt", status: "EGP · Coming Soon", primary: false },
                    { country: "🌍 + 49 Countries", status: "Global Remote Jobs", primary: false },
                  ].map((c, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${c.primary ? "border-emerald-500/20 bg-emerald-500/5" : "border-slate-800 bg-slate-900/50"}`} data-testid={`coverage-country-${i}`}>
                      <div className="font-bold text-white text-sm">{c.country}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{c.status}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 max-w-sm mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: "11,400+", label: "Live Jobs", color: "text-emerald-400" },
                    { val: "54", label: "Countries Covered", color: "text-blue-400" },
                    { val: "R2.4M+", label: "Paid Out Monthly", color: "text-amber-400" },
                    { val: "1M", label: "Africans by 2031", color: "text-violet-400" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center" data-testid={`coverage-stat-${i}`}>
                      <div className={`text-2xl font-black ${stat.color} mb-1`}>{stat.val}</div>
                      <div className="text-slate-500 text-xs leading-snug">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-slate-950 overflow-hidden" data-testid="section-testimonials">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Trusted by Thousands Across SA</h2>
              <p className="text-slate-400 text-lg">Freelancers and businesses growing together.</p>
            </div>
            <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto" data-testid="carousel-testimonials">
              <CarouselContent>
                {[
                  { name: "Sipho Khumalo", role: "General Contractor", location: "Soweto, GP", rating: 5, quote: "FreelanceSkills changed my business. I used to struggle with payments — now everything is secure through escrow.", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120&h=120" },
                  { name: "Lerato Mokoena", role: "Graphic Designer", location: "Sandton, GP", rating: 5, quote: "The AI profile builder helped me showcase my skills perfectly. I landed my first big corporate client within a week.", photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=120&h=120" },
                  { name: "Johan van der Merwe", role: "SME Owner", location: "Stellenbosch, WC", rating: 4, quote: "Finding reliable developers in South Africa was a challenge until I found this platform. Highly recommended.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120" },
                  { name: "Fatima Patel", role: "Digital Marketer", location: "Durban, KZN", rating: 5, quote: "I love the local support team. They actually understand the SA market and help with tax invoicing questions.", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120" },
                  { name: "Thandiwe Dlamini", role: "Content Writer", location: "Mbombela, MP", rating: 5, quote: "As a remote freelancer, having a platform that handles South African bank transfers easily is a lifesaver.", photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=120&h=120" },
                  { name: "Kevin Naidoo", role: "IT Consultant", location: "Umhlanga, KZN", rating: 5, quote: "The verification process adds so much trust. Clients know they're hiring a professional, not just anyone.", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120" },
                ].map((t, i) => (
                  <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3 pl-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col" data-testid={`card-testimonial-${i}`}>
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, j) => <Star key={j} className={`w-3.5 h-3.5 ${j < t.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"}`} />)}
                      </div>
                      <p className="text-slate-400 italic text-sm leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-emerald-500/20">
                          <AvatarImage src={t.photo} alt={t.name} />
                          <AvatarFallback className="bg-emerald-900 text-emerald-300 font-bold text-sm">{t.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-white text-sm" data-testid={`text-testimonial-name-${i}`}>{t.name}</div>
                          <div className="text-slate-500 text-xs">{t.role} · {t.location}</div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block"><CarouselPrevious className="-left-12 border-slate-700 bg-slate-900 text-white hover:bg-slate-800" /><CarouselNext className="-right-12 border-slate-700 bg-slate-900 text-white hover:bg-slate-800" /></div>
            </Carousel>
          </div>
        </section>

        {/* ══ PRESS LOGOS ════════════════════════════════════════════════════════ */}
        <section className="py-10 border-y border-slate-800/50 bg-slate-900/20" data-testid="section-press">
          <div className="container mx-auto px-4 md:px-6">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-6">As featured in South African media</p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {[
                { name: "TechCabal", abbr: "TC", color: "from-blue-600 to-blue-800" },
                { name: "Daily Maverick", abbr: "DM", color: "from-slate-600 to-slate-800" },
                { name: "Fin24", abbr: "F24", color: "from-green-600 to-green-800" },
                { name: "MyBroadband", abbr: "MB", color: "from-orange-500 to-red-600" },
                { name: "Business Insider SA", abbr: "BI", color: "from-blue-500 to-blue-700" },
                { name: "ITWeb", abbr: "IW", color: "from-violet-600 to-violet-800" },
              ].map((logo, i) => (
                <div key={i} className="flex items-center gap-2 opacity-40 hover:opacity-60 transition-opacity" data-testid={`press-logo-${i}`} title={logo.name}>
                  <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${logo.color} flex items-center justify-center`}>
                    <span className="text-white text-[8px] font-black">{logo.abbr}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-400 hidden sm:inline">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PWA SECTION ════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-gradient-to-br from-slate-950 via-emerald-950/15 to-slate-950 relative overflow-hidden" data-testid="section-pwa">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <Zap className="w-3.5 h-3.5" /> Progressive Web App
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                    Use FreelanceSkills as a Native App
                  </h2>
                  <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                    Install in seconds — no app store required. Works offline, loads instantly, real-time job notifications. Faster than any competitor app.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {[
                      { icon: Zap, text: "Loads 10× faster than the website" },
                      { icon: Bell, text: "Instant job match notifications" },
                      { icon: Globe, text: "Works offline — browse saved jobs" },
                      { icon: Shield, text: "No app store tracking" },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                  <PWAInstallButton />
                  <p className="text-slate-600 text-xs mt-3">Android · iOS · Windows · macOS · Linux</p>
                </div>
                {/* Phone mockup */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="w-52 h-[420px] bg-slate-900 border border-slate-700 rounded-[3rem] shadow-2xl shadow-black/50 overflow-hidden relative">
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-full" />
                    <div className="absolute inset-3 top-14 bg-slate-950 rounded-[2.5rem] overflow-hidden flex flex-col">
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 h-14 flex items-center justify-center">
                        <span className="text-white font-black text-sm">FreelanceSkills</span>
                      </div>
                      <div className="flex-1 p-3 space-y-2.5">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="bg-slate-800 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-5 h-5 rounded-lg bg-emerald-500/20" />
                              <div className="h-2 bg-slate-700 rounded flex-1" />
                            </div>
                            <div className="h-1.5 bg-slate-700/60 rounded w-2/3" />
                          </div>
                        ))}
                      </div>
                      <div className="h-14 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-6">
                        {[...Array(4)].map((_, i) => <div key={i} className="w-5 h-5 bg-slate-700 rounded-md" />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ BLOG ════════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-slate-900/20 border-y border-slate-800/50" data-testid="section-blog">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <TrendingUp className="w-3.5 h-3.5" /> Knowledge Hub
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Learn. Earn. Grow.</h2>
                <p className="text-slate-400 text-base max-w-xl">South Africa's most practical freelancing guides — from winning tenders to filing for SARS.</p>
              </div>
              <button onClick={() => navigate("/blog")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 font-semibold text-sm transition-all" data-testid="button-view-blog">
                Visit Blog <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(liveBlogPosts && liveBlogPosts.length > 0
                ? liveBlogPosts.slice(0, 3).map((post: any, i: number) => ({
                    category: post.category_name || "Freelancing",
                    title: post.title, excerpt: post.excerpt || post.meta_description || "",
                    readTime: `${post.read_time_minutes || 5} min read`,
                    color: ["text-blue-400 bg-blue-500/10 border-blue-500/20", "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", "text-violet-400 bg-violet-500/10 border-violet-500/20"][i],
                    href: `/blog/${post.slug}`,
                  }))
                : [
                    { category: "AI Tools", title: "10 AI Tools That Will 10x Your Freelance Income in 2026", excerpt: "ChatGPT, Midjourney, and Copilot are just the start. We break down 10 advanced AI tools SA freelancers use to triple their rates.", readTime: "8 min read", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", href: "/blog" },
                    { category: "SA Tax & Legal", title: "The Complete SARS Tax Guide for South African Freelancers", excerpt: "Provisional tax, VAT, allowable deductions — everything you need to stay legal and keep more of your money.", readTime: "12 min read", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", href: "/blog" },
                    { category: "Tenders & Government", title: "How to Win Your First Government Tender as a Freelancer", excerpt: "Step-by-step: CSD registration, finding open tenders, and crafting a compliant bid that stands out.", readTime: "15 min read", color: "text-violet-400 bg-violet-500/10 border-violet-500/20", href: "/blog" },
                  ]
              ).map((article, i) => (
                <button key={i} onClick={() => navigate(article.href)}
                  className="text-left bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-6 hover:shadow-lg transition-all group"
                  data-testid={`card-blog-${i}`}>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full mb-4 border ${article.color}`}>{article.category}</span>
                  <h3 className="font-bold text-white text-base mb-3 leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">{article.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>{article.readTime}</span><span>·</span>
                    <span className="text-emerald-500 font-semibold group-hover:underline">Read →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ════════════════════════════════════════════════════════════ */}
        <section className="py-24 bg-slate-950 relative overflow-hidden" data-testid="section-final-cta">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                Your Professional Future <span className="text-emerald-400">Starts Here</span>
              </h2>
              <p className="text-slate-400 text-xl leading-relaxed">
                Join Africa's fastest-growing professional network. Whether you're a freelancer looking for your next gig, or a business looking for verified top talent — we've got you covered.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/20 rounded-2xl p-8 flex flex-col" data-testid="cta-card-freelancer">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">For Freelancers</div>
                <h3 className="text-2xl font-black text-white mb-3">Start Earning Today</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                  Create your verified professional profile, get AI-matched to top opportunities, and earn in ZAR or global currencies — all with escrow protection.
                </p>
                <ul className="space-y-2 mb-6">
                  {["Free profile forever", "AI job matching", "Escrow-protected payments", "Skills verification + endorsements"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate("/freelancer-onboarding")}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all hover:shadow-lg hover:shadow-emerald-500/20"
                  data-testid="button-cta-freelancer">
                  Create Free Profile →
                </button>
              </div>
              <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/20 rounded-2xl p-8 flex flex-col" data-testid="cta-card-client">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mb-5">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">For Clients & Businesses</div>
                <h3 className="text-2xl font-black text-white mb-3">Hire Verified Talent</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                  Post a project and receive proposals from ID-verified, skills-endorsed African freelancers. Secure escrow, clear contracts, real results.
                </p>
                <ul className="space-y-2 mb-6">
                  {["Post free — pay only on hire", "ID-verified + endorsed talent", "Escrow payment protection", "24/7 SA support team"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate("/post-job")}
                  className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-sm transition-all hover:shadow-lg hover:shadow-blue-500/20"
                  data-testid="button-cta-client">
                  Post a Project →
                </button>
              </div>
            </div>
            <p className="text-center text-slate-600 text-xs mt-10">
              FreelanceSkills (Pty) Ltd · CIPC Reg: 2026/070509/09 · POPIA Compliant · All rights reserved © {new Date().getFullYear()}
            </p>
          </div>
        </section>

        {/* ══ NEWSLETTER ══════════════════════════════════════════════════════════ */}
        <section className="py-14 border-t border-slate-800/60 bg-slate-950" data-testid="section-newsletter">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold mb-4">
                <Bell className="w-3.5 h-3.5 text-emerald-400" /> Weekly SA Freelance Digest
              </div>
              <h3 className="text-xl font-black text-white mb-2">Stay Ahead of the Market</h3>
              <p className="text-slate-500 text-sm mb-6">Top jobs, rate benchmarks, and freelance strategy — every Monday.</p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2" data-testid="form-newsletter">
                <input value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} type="email"
                  placeholder="your@email.com" required
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500/50 text-white placeholder:text-slate-600 text-sm focus:outline-none transition-colors"
                  data-testid="input-newsletter-email" />
                <button type="submit" disabled={newsletterStatus === "loading"}
                  className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm transition-all flex-shrink-0"
                  data-testid="button-newsletter-submit">
                  {newsletterStatus === "loading" ? "..." : "Subscribe"}
                </button>
              </form>
              {newsletterMsg && (
                <p className={`text-xs mt-3 ${newsletterStatus === "success" ? "text-emerald-400" : "text-red-400"}`} data-testid="text-newsletter-message">
                  {newsletterMsg}
                </p>
              )}
              <p className="text-slate-700 text-xs mt-3">No spam. Unsubscribe anytime. POPIA compliant.</p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
