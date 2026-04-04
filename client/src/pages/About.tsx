import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Shield, Zap, TrendingUp, Users, Globe, CheckCircle,
  Download, X, Lock, BadgeCheck, Smartphone, Bot, FileCheck,
  BarChart3, Cpu, Star, Briefcase, ChevronRight
} from "lucide-react";
import { Link } from "wouter";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function About() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [installedAsApp, setInstalledAsApp] = useState(false);

  useEffect(() => {
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setInstalledAsApp(isInstalled);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setInstalledAsApp(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } else {
      setShowFallbackModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />

      {/* Fixed background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/3 -left-64 w-[800px] h-[800px] bg-emerald-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 w-[700px] h-[700px] bg-emerald-500/[0.025] rounded-full blur-3xl" />
      </div>

      {/* ── Hero ── */}
      <section
        className="relative min-h-[100vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-28"
        data-testid="section-hero"
      >
        {/* African-tech pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <pattern id="geo-about" patternUnits="userSpaceOnUse" width="20" height="20">
                <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
                <circle cx="10" cy="10" r="1" fill="currentColor" className="text-emerald-500" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#geo-about)" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950" />

        <div className="relative z-10 max-w-5xl mx-auto text-center" data-testid="hero-content">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8"
            data-testid="badge-our-story"
          >
            <Globe className="w-4 h-4" />
            Our Story &amp; Mission
          </span>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            data-testid="heading-hero"
          >
            The Future of Skilled Work{" "}
            <span className="text-emerald-400">in Africa and Beyond</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto"
            data-testid="text-hero-subheadline"
          >
            FreelanceSkills is the trusted, AI-powered marketplace connecting verified professionals
            with businesses worldwide — delivering quality, security, and real opportunity in the
            new era of digital work.
          </p>

          {/* Hero stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto" data-testid="hero-stats">
            {[
              { value: "47K+", label: "Verified Freelancers", icon: Users },
              { value: "R2.3B+", label: "Escrow Processed", icon: Shield },
              { value: "92K+", label: "Projects Completed", icon: Briefcase },
              { value: "4.9★", label: "Platform Rating", icon: Star },
            ].map(({ value, label, icon: Icon }, i) => (
              <div
                key={i}
                className="text-center p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-colors"
                data-testid={`hero-stat-${i + 1}`}
              >
                <Icon className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{value}</div>
                <div className="text-xs text-slate-400 mt-0.5 leading-tight">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/freelancers" asChild>
              <Button
                size="lg"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-slate-950 rounded-xl font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                data-testid="button-browse-talent"
              >
                Browse Verified Talent
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/post-job" asChild>
              <Button
                variant="outline"
                size="lg"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-emerald-500/60 text-emerald-400 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all hover:-translate-y-0.5"
                data-testid="button-post-project"
              >
                Post a Project
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Vision / Story ── */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/40" data-testid="section-vision">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center" data-testid="heading-vision">
            Building the Future of Freelancing
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">
            Why we exist, what drives us, and where we're taking the African workforce
          </p>

          <div className="space-y-8 text-slate-300 text-base sm:text-lg leading-relaxed">
            <p data-testid="text-vision-1">
              For too long, the global freelance economy has been dominated by platforms that favour
              volume over quality — charging excessive fees, providing shallow vetting, and leaving
              talented professionals undervalued. We built FreelanceSkills to change that. Our
              platform is designed from the ground up to prioritise skills, verification, and
              fairness — creating a marketplace where excellent work is recognized and rewarded.
            </p>

            <p data-testid="text-vision-2">
              Africa has extraordinary talent. Millions of skilled professionals are ready to deliver
              world-class work to global clients, yet barriers to entry, trust deficits, and limited
              access to opportunity have left many underutilised. FreelanceSkills exists to unlock
              that potential — connecting AI-verified African professionals with businesses that value
              quality and integrity, enabling them to build thriving careers in the global digital economy.
            </p>

            <p data-testid="text-vision-3">
              We believe the future of work is skills-first, transparent, and AI-powered. It's about
              long-term relationships, fair compensation at just 10% fees, and real economic
              opportunity for the next generation of African professionals. That's what
              FreelanceSkills is building — and by 2031 we aim to empower 1 million Africans.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission Grid ── */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8" data-testid="section-mission">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center" data-testid="heading-mission">
            Our Mission
          </h2>
          <p className="text-slate-400 text-center mb-20 max-w-xl mx-auto">
            Four pillars that guide every product decision we make
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Users,
                title: "Empower Verified African Talent",
                desc: "Give skilled professionals across Africa and the diaspora access to global opportunities with fair compensation, genuine recognition, and career-building tools.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Globe,
                title: "Connect Businesses with Reliable Talent",
                desc: "Help organisations find skills-matched professionals they can trust, streamlining hiring and reducing risk through our rigorous 5-step Nuclear Vetting System.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: Shield,
                title: "Create Fair & Transparent Ecosystems",
                desc: "Build a marketplace where trust is earned through verification, security is guaranteed through PayFast escrow, and fees are a transparent flat 10%.",
                color: "text-violet-400",
                bg: "bg-violet-500/10",
              },
              {
                icon: TrendingUp,
                title: "Drive Skills & Economic Growth",
                desc: "Enable long-term career development and wealth creation through intelligent AI matching, ongoing learning resources, and sustainable earning opportunities.",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-8 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/[0.07] transition-all hover:-translate-y-1"
                data-testid={`card-mission-${idx + 1}`}
              >
                <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-6`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nuclear Vetting System ── */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/40" data-testid="section-vetting">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <BadgeCheck className="w-4 h-4" />
              Industry-Leading Verification
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="heading-vetting">
              The Nuclear Vetting System™
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our AI-proctored 5-step vetting process ensures every freelancer on the platform meets
              the highest standard — giving clients total confidence in who they hire.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 mb-12">
            {[
              { step: "01", icon: FileCheck, title: "ID Verification", desc: "Government-issued ID + liveness check via AI biometrics", tier: "Tier 0" },
              { step: "02", icon: Bot, title: "AI Proctored Skills Test", desc: "Live, browser-locked skills assessment — no cheating possible", tier: "Tier 1" },
              { step: "03", icon: BarChart3, title: "Portfolio Review", desc: "Expert panel + AI evaluates real work samples", tier: "Tier 2" },
              { step: "04", icon: Cpu, title: "Reference & Background", desc: "Digital reference verification + employment history", tier: "Tier 2+" },
              { step: "05", icon: BadgeCheck, title: "Blockchain Credential", desc: "Immutable on-chain badge issued — permanent proof of vetting", tier: "Tier 3" },
            ].map((item, i) => (
              <div
                key={i}
                className="relative p-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500/40 transition-all group"
                data-testid={`vetting-step-${i + 1}`}
              >
                <div className="text-xs font-bold text-emerald-500/60 mb-3 font-mono tracking-wider">{item.step}</div>
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <item.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold mb-2 leading-tight">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">{item.desc}</p>
                <span className="inline-block px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs font-medium">
                  {item.tier}
                </span>
                {i < 4 && (
                  <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 z-10" />
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 text-sm" data-testid="vetting-popia-note">
            All verification data is processed in compliance with <span className="text-emerald-400">POPIA</span> — 
            stored securely, never sold, and deletable on request.
          </p>
        </div>
      </section>

      {/* ── Why Choose FreelanceSkills ── */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8" data-testid="section-benefits">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center" data-testid="heading-benefits">
            Why Choose FreelanceSkills
          </h2>
          <p className="text-slate-400 text-center mb-20 max-w-xl mx-auto">
            Everything you need — nothing you don't. Built for Africa, open to the world.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BadgeCheck, title: "Rigorous Verification & Skills Validation", desc: "Every profile is vetted. Every skill is tested. We ensure quality from day one with our 5-step Nuclear Vetting System." },
              { icon: Shield, title: "Secure Escrow & PayFast Payouts", desc: "Protected transactions and instant ZAR payouts via PayFast ensure both parties feel completely secure." },
              { icon: Zap, title: "Transparent 10% Fees", desc: "No hidden charges. Industry-leading rates that reward hard work and quality output." },
              { icon: Globe, title: "AI Smart Matching", desc: "Intelligent algorithms connect you with opportunities perfectly tailored to your verified skillset and experience level." },
              { icon: Users, title: "Local Expertise, Global Reach", desc: "Built for Africa with an international network. Your local advantage, globally positioned." },
              { icon: TrendingUp, title: "Focus on Long-Term Success", desc: "We're not chasing volume — we're building careers, lasting relationships, and sustainable economic growth." },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/[0.07] transition-all hover:-translate-y-1"
                data-testid={`card-benefit-${idx + 1}`}
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/40" data-testid="section-trust">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center" data-testid="heading-trust">
            Real Impact. Real Numbers.
          </h2>
          <p className="text-slate-400 text-center mb-20 max-w-xl mx-auto">
            Trusted by thousands of professionals and businesses across Africa and the globe
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { number: "47,000+", label: "Verified Professionals", sub: "AI-vetted, POPIA-compliant" },
              { number: "92,000+", label: "Projects Completed", sub: "On time, on budget" },
              { number: "R2.3B+", label: "In Escrow Processed", sub: "PayFast-secured payments" },
              { number: "100%", label: "POPIA Compliant", sub: "South African data law" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-8 bg-gradient-to-br from-emerald-500/10 to-slate-900 border border-emerald-500/20 rounded-2xl hover:border-emerald-500/40 transition-colors"
                data-testid={`stat-${idx + 1}`}
              >
                <div className="text-4xl sm:text-5xl font-bold text-emerald-400 mb-3">{stat.number}</div>
                <div className="text-slate-200 font-semibold mb-1">{stat.label}</div>
                <div className="text-slate-500 text-xs">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Credential badges */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="trust-badges">
            {[
              { icon: Shield, label: "Secure Payments", sub: "256-bit SSL + PayFast" },
              { icon: BadgeCheck, label: "Verified Profiles", sub: "5-step Nuclear Vetting" },
              { icon: Lock, label: "POPIA Compliant", sub: "SA data protection law" },
              { icon: Globe, label: "Cape Town-Based", sub: "CIPC Reg: 2026/070509/09" },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-5 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-colors"
                data-testid={`badge-${idx + 1}`}
              >
                <div className="w-10 h-10 flex-shrink-0 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <badge.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-100">{badge.label}</div>
                  <div className="text-slate-500 text-xs">{badge.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PWA Install Section ── always visible */}
      <section
        className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        data-testid="section-pwa"
      >
        <div className="absolute inset-0 opacity-[0.06]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <pattern id="geo-pwa" patternUnits="userSpaceOnUse" width="20" height="20">
                <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#geo-pwa)" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-slate-950 to-slate-950" />

        <div className="relative max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
                <Smartphone className="w-3.5 h-3.5" />
                Available as a Native App
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="heading-pwa">
                Take FreelanceSkills Everywhere
              </h2>
              <p className="text-slate-300 mb-8 leading-relaxed" data-testid="text-pwa">
                Install the FreelanceSkills app for home-screen access, offline job browsing,
                instant match notifications, and one-tap apply. A native-app feel — no download required.
              </p>

              <div className="space-y-3 mb-8" data-testid="pwa-benefits">
                {[
                  "Instant push notifications for new job matches",
                  "Offline browsing — optimised for SA network conditions",
                  "Home-screen shortcut — zero loading friction",
                  "Full dashboard access from any device",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-300" data-testid={`pwa-benefit-${i + 1}`}>
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>

              {!installedAsApp && (
                showInstallPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-slate-950 rounded-xl font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
                    data-testid="button-install-app"
                  >
                    <Download className="w-5 h-5" />
                    Install FreelanceSkills App
                  </button>
                ) : (
                  <button
                    onClick={() => setShowFallbackModal(true)}
                    className="inline-flex items-center gap-2 px-8 py-4 border-2 border-emerald-500/60 text-emerald-400 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all hover:-translate-y-0.5"
                    data-testid="button-install-manual"
                  >
                    <Smartphone className="w-5 h-5" />
                    How to Install on My Device
                  </button>
                )
              )}

              {installedAsApp && (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" data-testid="installed-message">
                  <BadgeCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-300 font-medium">FreelanceSkills is installed on your device</span>
                </div>
              )}
            </div>

            {/* Right: App mockup */}
            <div className="flex justify-center" data-testid="pwa-mockup">
              <div className="relative">
                <div className="w-64 bg-slate-900 border-4 border-slate-700 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/60">
                  <div className="h-8 bg-slate-800 flex items-center justify-center">
                    <div className="w-20 h-1.5 bg-slate-700 rounded-full" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center px-3 gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-emerald-300 font-medium">FreelanceSkills</span>
                    </div>
                    {[
                      { label: "New match: React Developer", tag: "R850/hr" },
                      { label: "Payment released: R12,400", tag: "✓" },
                      { label: "Job match: UI/UX Designer", tag: "R720/hr" },
                    ].map((item, i) => (
                      <div key={i} className="h-14 bg-slate-800 rounded-xl flex items-center justify-between px-3 gap-2">
                        <span className="text-slate-300 text-xs leading-tight flex-1">{item.label}</span>
                        <span className="text-emerald-400 text-xs font-semibold flex-shrink-0">{item.tag}</span>
                      </div>
                    ))}
                    <div className="h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <span className="text-slate-950 text-xs font-bold">Apply Now</span>
                    </div>
                  </div>
                  <div className="h-6 bg-slate-800 flex items-center justify-center gap-4">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? "bg-emerald-400" : "bg-slate-600"}`} />
                    ))}
                  </div>
                </div>
                {/* Notification bubble */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce">
                  <span className="text-slate-950 text-xs font-bold">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600/15 via-slate-950 to-slate-950 border-t border-emerald-500/20"
        data-testid="section-final-cta"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="heading-cta">
            Ready to Shape the Future of Work?
          </h2>
          <p className="text-lg text-slate-300 mb-12 max-w-xl mx-auto" data-testid="text-cta">
            Join 47,000+ verified professionals and forward-thinking businesses building Africa's
            new economy — one skill at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?mode=register" asChild>
              <Button
                size="lg"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-slate-950 rounded-xl font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
                data-testid="button-join-freelancer"
              >
                Join as a Freelancer — It's Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/freelancers" asChild>
              <Button
                variant="outline"
                size="lg"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-emerald-500/60 text-emerald-400 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all hover:-translate-y-0.5"
                data-testid="button-hire-talent"
              >
                Hire Verified Talent Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-t border-slate-800/60 bg-slate-900/40 px-4 sm:px-6 lg:px-8 py-5" data-testid="section-trust-bar">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center justify-center text-xs text-slate-500">
            {[
              { icon: Shield, label: "Secure Payments" },
              { icon: BadgeCheck, label: "POPIA Compliant" },
              { icon: Lock, label: "PayFast Escrow" },
              { icon: CheckCircle, label: "ID Verified Talent" },
              { icon: Globe, label: "Cape Town, South Africa" },
            ].map(({ icon: Icon, label }, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-emerald-500/70" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* PWA Fallback Modal */}
      {showFallbackModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          data-testid="modal-pwa-fallback"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold" data-testid="heading-fallback-modal">Install FreelanceSkills</h3>
              </div>
              <button
                onClick={() => setShowFallbackModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                data-testid="button-close-fallback"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-slate-300 mb-8 text-sm leading-relaxed" data-testid="text-fallback-intro">
              Get home-screen access, offline browsing, and instant match notifications:
            </p>

            <div className="space-y-6 mb-8">
              <div data-testid="instructions-chrome">
                <h4 className="font-semibold text-emerald-400 mb-2 text-sm">Chrome on Android</h4>
                <ol className="text-slate-400 text-sm space-y-1.5 ml-4 list-decimal">
                  <li>Tap the <strong className="text-slate-300">⋮ menu</strong> in the top-right</li>
                  <li>Select <strong className="text-slate-300">"Install app"</strong> and confirm</li>
                </ol>
              </div>

              <div data-testid="instructions-safari">
                <h4 className="font-semibold text-emerald-400 mb-2 text-sm">Safari on iPhone / iPad</h4>
                <ol className="text-slate-400 text-sm space-y-1.5 ml-4 list-decimal">
                  <li>Tap the <strong className="text-slate-300">Share button ↑</strong></li>
                  <li>Tap <strong className="text-slate-300">"Add to Home Screen"</strong> → Add</li>
                </ol>
              </div>

              <div data-testid="instructions-desktop">
                <h4 className="font-semibold text-emerald-400 mb-2 text-sm">Desktop (Chrome / Edge)</h4>
                <ol className="text-slate-400 text-sm space-y-1.5 ml-4 list-decimal">
                  <li>Click the <strong className="text-slate-300">install icon</strong> in the address bar</li>
                  <li>Select <strong className="text-slate-300">"Install"</strong></li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowFallbackModal(false)}
              className="w-full px-6 py-3.5 bg-emerald-500 text-slate-950 rounded-xl font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25"
              data-testid="button-got-it"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.3s ease; }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </div>
  );
}
