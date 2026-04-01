import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, TrendingUp, Users, Globe, CheckCircle, Download, X } from "lucide-react";
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
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches ||
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

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-24" data-testid="section-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
          <div className="absolute inset-0 opacity-[0.08]">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <pattern id="geo" patternUnits="userSpaceOnUse" width="20" height="20">
                  <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500"/>
                  <circle cx="10" cy="10" r="2" fill="currentColor" className="text-emerald-500"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#geo)"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in-up">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight" data-testid="heading-hero">
            The Future of Skilled Work in Africa and Beyond
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto" data-testid="text-hero-subheadline">
            FreelanceSkills is the trusted, skills-first marketplace that connects verified professionals with businesses — delivering quality, security, and real opportunity in the new world of work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse" asChild>
              <Button 
                size="lg"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                data-testid="button-browse-talent"
              >
                Browse Verified Talent
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/jobs/post" asChild>
              <Button 
                variant="outline"
                size="lg"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-emerald-500 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-500/10 transition-all"
                data-testid="button-post-project"
              >
                Post a Project
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/50" data-testid="section-vision">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-center" data-testid="heading-vision">Building the Future of Freelancing</h2>
          
          <div className="space-y-8 text-slate-300 text-base sm:text-lg leading-relaxed">
            <p data-testid="text-vision-1">
              For too long, the freelance economy has been dominated by platforms that favor volume over quality, with high fees, poor matching, and little regard for the talent they claim to serve. We built FreelanceSkills to change that. Our platform is designed from the ground up to prioritize skills, verification, and fairness — creating a marketplace where excellent work is recognized and rewarded.
            </p>
            
            <p data-testid="text-vision-2">
              Africa has extraordinary talent. Millions of skilled professionals are ready to deliver world-class work to global clients, yet barriers to entry, trust deficits, and poor access to opportunity have left many underutilized. FreelanceSkills exists to unlock that potential — to connect verified African professionals with businesses that value quality and integrity, enabling them to build thriving careers in the global digital economy.
            </p>
            
            <p data-testid="text-vision-3">
              We believe the future of work is skills-first, transparent, and secure. It's about long-term relationships, fair compensation, and real economic opportunity. That's what FreelanceSkills is building.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8" data-testid="section-mission">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-20 text-center" data-testid="heading-mission">Our Mission</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all hover:-translate-y-1" data-testid="card-mission-talent">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Empower Verified African Talent</h3>
              <p className="text-slate-400">Give skilled professionals across Africa and the diaspora access to global opportunities with fair compensation and genuine recognition.</p>
            </div>

            <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all hover:-translate-y-1" data-testid="card-mission-business">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect Business with Reliable Talent</h3>
              <p className="text-slate-400">Help organizations find skills-matched professionals they can trust, streamlining hiring and reducing risk through rigorous verification.</p>
            </div>

            <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all hover:-translate-y-1" data-testid="card-mission-ecosystem">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Fair & Transparent Ecosystems</h3>
              <p className="text-slate-400">Build a marketplace where trust is earned through verification, security is guaranteed, and fees are competitive and clear.</p>
            </div>

            <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all hover:-translate-y-1" data-testid="card-mission-growth">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Drive Skills & Economic Growth</h3>
              <p className="text-slate-400">Enable long-term career development and wealth creation through intelligent matching, learning, and sustainable earning opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/50" data-testid="section-benefits">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-20 text-center" data-testid="heading-benefits">Why Choose FreelanceSkills</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: CheckCircle, title: "Rigorous Verification & Skills Validation", desc: "Every profile is vetted. Every skill is tested. We ensure quality from day one." },
              { icon: Shield, title: "Secure Escrow & PayFast Payouts", desc: "Protected transactions and instant ZAR payouts via PayFast ensure both parties feel secure." },
              { icon: Zap, title: "Transparent 10% Fees", desc: "No hidden charges. Industry-leading rates that reward hard work and quality." },
              { icon: Globe, title: "AI Smart Matching", desc: "Intelligent algorithms connect you with opportunities perfectly tailored to your skillset." },
              { icon: Users, title: "Local Expertise, Global Reach", desc: "Built for Africa with an international network. Your local advantage, globally." },
              { icon: TrendingUp, title: "Focus on Long-Term Success", desc: "We're not chasing volume — we're building careers and lasting business relationships." },
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all hover:-translate-y-1" data-testid={`card-benefit-${idx + 1}`}>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Impact Section */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8" data-testid="section-trust">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-20 text-center" data-testid="heading-trust">Trusted by Thousands</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { number: "2,500+", label: "Verified Professionals" },
              { number: "1,200+", label: "Completed Projects" },
              { number: "R50M+", label: "In Earnings Facilitated" },
              { number: "100%", label: "POPIA Compliant" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-8 bg-gradient-to-br from-emerald-500/10 to-slate-900 border border-emerald-500/20 rounded-lg" data-testid={`stat-${idx + 1}`}>
                <div className="text-5xl font-bold text-emerald-400 mb-3">{stat.number}</div>
                <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-4 gap-4 bg-slate-900/50 p-8 rounded-xl border border-slate-800" data-testid="trust-badges">
            {["Secure Payments", "Verified Profiles", "POPIA Compliant", "Cape Town-Based"].map((badge, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2 p-4 bg-slate-950/50 rounded-lg border border-slate-700/50 hover:border-emerald-500/30 transition-colors" data-testid={`badge-${idx + 1}`}>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-sm">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section with PWA */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600/15 via-slate-950 to-slate-950 border-t border-emerald-500/20" data-testid="section-final-cta">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center">Ready to Shape the Future of Work?</h2>
          <p className="text-lg text-slate-300 mb-12 text-center">Join thousands of skilled professionals and forward-thinking businesses building the new economy.</p>
          
          {/* PWA Install Promotion */}
          {showInstallPrompt && !installedAsApp && (
            <div className="mb-12 p-6 bg-gradient-to-r from-emerald-500/10 to-slate-900 border border-emerald-500/30 rounded-lg shadow-lg animate-slide-up" data-testid="pwa-install-section">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                  <Download className="w-8 h-8 text-emerald-400 mt-1" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">For the best experience, install as an app on your phone</h3>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">Get home-screen access, faster loading, offline job browsing, instant match notifications, and quick apply — feels exactly like a native app.</p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full px-6 py-3 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25"
                    data-testid="button-install-app"
                  >
                    Install FreelanceSkills App
                  </button>
                </div>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
                  data-testid="button-close-install"
                  aria-label="Close PWA install prompt"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join/freelancer" asChild>
              <Button 
                size="lg"
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25"
                data-testid="button-join-freelancer"
              >
                Join as a Freelancer
              </Button>
            </Link>
            <Link href="/browse" asChild>
              <Button 
                variant="outline"
                size="lg"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-emerald-500 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-500/10 transition-all"
                data-testid="button-hire-talent"
              >
                Hire Talent Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-t border-slate-800 bg-slate-900/50 px-4 sm:px-6 lg:px-8 py-8" data-testid="section-trust-bar">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-slate-400 text-center lg:text-left" data-testid="text-trust-bar">
            <span className="flex flex-col lg:flex-row gap-2 lg:gap-6 items-center lg:items-center flex-wrap justify-center lg:justify-start">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Secure login
              </span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <span>POPIA compliant</span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <span>PayFast escrow protection</span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <span>Industry-leading encryption</span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <span>Cape Town, South Africa</span>
            </span>
          </p>
        </div>
      </section>

      <Footer />

      {/* PWA Fallback Modal */}
      {showFallbackModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" data-testid="modal-pwa-fallback">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold" data-testid="heading-fallback-modal">Install FreelanceSkills</h3>
              <button
                onClick={() => setShowFallbackModal(false)}
                className="text-slate-400 hover:text-slate-300 transition-colors"
                data-testid="button-close-fallback"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-slate-300 mb-8">Get the best experience with our app. Here's how to install on your device:</p>

            <div className="space-y-8">
              <div>
                <h4 className="font-semibold text-emerald-400 mb-3 text-sm">Chrome on Android</h4>
                <ol className="text-slate-400 text-sm space-y-2 ml-4 list-decimal">
                  <li>Tap the menu <strong className="text-slate-300">(three dots)</strong> in the top-right corner</li>
                  <li>Select <strong className="text-slate-300">"Install app"</strong> and confirm</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-emerald-400 mb-3 text-sm">Safari on iPhone/iPad</h4>
                <ol className="text-slate-400 text-sm space-y-2 ml-4 list-decimal">
                  <li>Tap the <strong className="text-slate-300">Share button</strong> (square with arrow)</li>
                  <li>Tap <strong className="text-slate-300">"Add to Home Screen"</strong></li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowFallbackModal(false)}
              className="w-full mt-8 px-6 py-3 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 transition-colors"
              data-testid="button-got-it"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
