import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Heart, Brain, Shield, Zap, Users, Star, ArrowRight,
  Sun, Moon, Coffee, Clock, TrendingUp, CheckCircle2,
  Smile, Activity, BookOpen, HeartHandshake
} from "lucide-react";

const PILLARS = [
  {
    emoji: "🧠",
    title: "Mental Health Support",
    desc: "Free access to licensed therapists specialising in freelancer burnout, anxiety, and imposter syndrome. 24/7 crisis chat available.",
    features: ["3 free therapy sessions/month", "Burnout prevention toolkit", "Mindfulness exercises", "Stress tracking dashboard"],
    color: "from-violet-600/20 to-violet-800/20 border-violet-500/30",
  },
  {
    emoji: "💪",
    title: "Financial Wellness",
    desc: "Stop the feast-and-famine cycle. Learn how to manage irregular income, save for retirement, and build financial resilience.",
    features: ["Income smoothing calculator", "Emergency fund planner", "SARS tax calendar", "Investment starter guide"],
    color: "from-emerald-600/20 to-emerald-800/20 border-emerald-500/30",
  },
  {
    emoji: "⚡",
    title: "Energy & Productivity",
    desc: "Optimise your work patterns to avoid burnout. Track your deep work hours, rest periods, and peak performance windows.",
    features: ["Pomodoro integration", "Deep work tracker", "Ultradian rhythm guide", "Digital detox planner"],
    color: "from-amber-600/20 to-amber-800/20 border-amber-500/30",
  },
  {
    emoji: "🤝",
    title: "Community Connection",
    desc: "Loneliness is the #1 challenge for remote freelancers. Connect with accountability partners and virtual co-working rooms.",
    features: ["Accountability partnerships", "Virtual co-working rooms", "Peer support groups", "Monthly meetups (SA cities)"],
    color: "from-blue-600/20 to-blue-800/20 border-blue-500/30",
  },
];

const RESOURCES = [
  { icon: "📋", title: "Burnout Self-Assessment", desc: "10-minute questionnaire to detect early warning signs", cta: "Take the test" },
  { icon: "🎧", title: "Guided Meditations", desc: "15-minute sessions designed for freelancers between meetings", cta: "Listen now" },
  { icon: "📖", title: "Freelancer Financial Guide", desc: "SARS tax, VAT, retirement annuities — SA-specific guide", cta: "Read guide" },
  { icon: "💬", title: "Peer Support Circle", desc: "Weekly group sessions with fellow South African freelancers", cta: "Join a session" },
  { icon: "🧘", title: "Work-Life Boundary Toolkit", desc: "Templates for client boundaries, working hours, and off-days", cta: "Download free" },
  { icon: "📊", title: "Wellness Tracker", desc: "Log your mood, energy, and productivity. Spot patterns over time", cta: "Start tracking" },
];

const STATS = [
  { value: "68%", label: "of freelancers report burnout in their first year" },
  { value: "43%", label: "struggle with financial stress weekly" },
  { value: "91%", label: "report improved wellbeing after using FreelanceSkills support" },
  { value: "Free", label: "All wellbeing resources for verified members" },
];

export default function WellbeingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-16 pb-20 px-4 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <Heart className="w-4 h-4" />
              Your Wellbeing Matters to Us
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Freelancer{" "}
              <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                Wellbeing & Balance
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Sustainable freelance careers require more than skills. We support your mental health, financial wellness, energy management, and community connection — for free.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
              {STATS.map((s) => (
                <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-xl font-black text-rose-400">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl shadow-xl shadow-rose-500/20 transition-all hover:scale-[1.02]" data-testid="button-wellbeing-join">
                <Heart className="w-5 h-5" /> Access Free Resources
              </Link>
              <a href="#resources" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all">
                See All Resources
              </a>
            </div>
          </div>
        </section>

        {/* Four Pillars */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white text-center mb-4">The Four Pillars of Freelancer Wellness</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">Comprehensive support designed specifically for the African freelance context — load-shedding stress, client payment delays, isolation, and all.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className={`p-7 bg-gradient-to-br ${p.color} border rounded-2xl group hover:scale-[1.01] transition-all`}>
                <div className="text-4xl mb-4">{p.emoji}</div>
                <h3 className="text-xl font-black text-white mb-3">{p.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">{p.desc}</p>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section id="resources" className="bg-slate-900/50 border-y border-slate-800 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-black text-white text-center mb-4">Free Wellbeing Resources</h2>
            <p className="text-slate-400 text-center mb-12">All resources are 100% free for verified FreelanceSkills members.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {RESOURCES.map((r) => (
                <Link href="/signup" key={r.title} data-testid={`resource-${r.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="p-6 bg-slate-900 border border-slate-800 hover:border-rose-500/30 rounded-2xl transition-all cursor-pointer group h-full">
                    <div className="text-3xl mb-3">{r.icon}</div>
                    <h3 className="font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">{r.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{r.desc}</p>
                    <span className="text-xs text-rose-400 font-bold flex items-center gap-1">
                      {r.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SA-specific context */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10">
            <div className="text-5xl mb-6">🇿🇦</div>
            <h2 className="text-2xl font-black text-white mb-4">Built for South African Reality</h2>
            <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8">
              Load-shedding disrupting your workflow? Late client payments causing financial anxiety? Feeling isolated working from home in Soweto or Stellenbosch? Our resources are built for <em className="text-white not-italic">your</em> context — not Silicon Valley's.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: "⚡", title: "Load-shedding toolkit", desc: "Work plans, battery backup guides, mobile data optimisation" },
                { icon: "💳", title: "Late payment support", desc: "Legal templates, mediation contacts, bridge financing options" },
                { icon: "🌆", title: "SA city co-working", desc: "Free co-working desk partnerships in JHB, CPT, DBN, PTA" },
              ].map((i) => (
                <div key={i.title} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-left">
                  <div className="text-2xl mb-2">{i.icon}</div>
                  <div className="font-bold text-white text-sm mb-1">{i.title}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{i.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-rose-700 via-rose-600 to-pink-600 py-16 px-4 mx-4 mb-16 rounded-3xl max-w-5xl lg:mx-auto">
          <div className="text-center">
            <Heart className="w-12 h-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-4">Your Mental Health is a Business Asset</h2>
            <p className="text-rose-100 mb-8 max-w-md mx-auto">
              Sign up free and unlock all wellbeing resources. Your mental and financial health directly impacts your freelance success.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-rose-700 font-black rounded-xl hover:bg-rose-50 transition-colors text-lg" data-testid="button-wellbeing-cta">
              Access Resources Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
