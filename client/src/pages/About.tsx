import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, TrendingUp, Users, Globe, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-16" data-testid="section-hero">
        {/* Background Gradient with Geometric Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
          <div className="absolute inset-0 opacity-20">
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

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight" data-testid="heading-hero">
            The Future of Skilled Work in Africa and Beyond
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto" data-testid="text-hero-subheading">
            Freelance Skills is the trusted, skills-first marketplace that connects verified professionals with businesses — delivering quality, security, and real opportunity in the new world of work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse" asChild>
              <Button 
                size="lg"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 transition-colors cursor-pointer"
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
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 border-2 border-emerald-500 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-500/10 transition-colors cursor-pointer"
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
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50" data-testid="section-vision">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-10 text-center" data-testid="heading-vision">Building the Future of Freelancing</h2>
          
          <div className="space-y-6 text-slate-300 text-base sm:text-lg leading-relaxed">
            <p data-testid="text-vision-1">
              For too long, the freelance economy has been dominated by platforms that favor volume over quality, with high fees, poor matching, and little regard for the talent they claim to serve. We built Freelance Skills to change that. Our platform is designed from the ground up to prioritize skills, verification, and fairness — creating a marketplace where excellent work is recognized and rewarded.
            </p>
            
            <p data-testid="text-vision-2">
              Africa has extraordinary talent. Millions of skilled professionals are ready to deliver world-class work to global clients, yet barriers to entry, trust deficits, and poor access to opportunity have left many underutilized. Freelance Skills exists to unlock that potential — to connect verified African professionals with businesses that value quality and integrity, enabling them to build thriving careers in the global digital economy.
            </p>
            
            <p data-testid="text-vision-3">
              We believe the future of work is skills-first, transparent, and secure. It's about long-term relationships, fair compensation, and real economic opportunity. That's what Freelance Skills is building.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" data-testid="section-mission">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-center" data-testid="heading-mission">Our Mission</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors" data-testid="card-mission-talent">
              <Users className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Empower Verified African Talent</h3>
              <p className="text-slate-300">Give skilled professionals across Africa and the diaspora access to global opportunities with fair compensation and genuine recognition.</p>
            </div>

            <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors" data-testid="card-mission-business">
              <Globe className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Connect Business with Reliable Talent</h3>
              <p className="text-slate-300">Help organizations find skills-matched professionals they can trust, streamlining hiring and reducing risk through rigorous verification.</p>
            </div>

            <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors" data-testid="card-mission-ecosystem">
              <Shield className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Create Fair & Transparent Ecosystems</h3>
              <p className="text-slate-300">Build a marketplace where trust is earned through verification, security is guaranteed, and fees are competitive and clear.</p>
            </div>

            <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors" data-testid="card-mission-growth">
              <TrendingUp className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Drive Skills & Economic Growth</h3>
              <p className="text-slate-300">Enable long-term career development and wealth creation through intelligent matching, learning, and sustainable earning opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Freelance Skills */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50" data-testid="section-benefits">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-center" data-testid="heading-benefits">Why Choose Freelance Skills</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: CheckCircle, title: "Rigorous Verification & Skills Validation", desc: "Every profile is vetted. Every skill is tested. We ensure quality from day one." },
              { icon: Shield, title: "Secure Escrow & Milestone Payments", desc: "Protected transactions with escrow-backed payments ensure both parties feel safe." },
              { icon: Zap, title: "Transparent, Competitive Fees", desc: "No hidden charges. Industry-leading rates that reward hard work and quality." },
              { icon: Globe, title: "Intelligent Matching", desc: "Smart algorithms connect you with opportunities tailored to your exact skillset." },
              { icon: Users, title: "Local Expertise, Global Reach", desc: "Built for Africa with an international network. Your local advantage, globally." },
              { icon: TrendingUp, title: "Focus on Long-Term Success", desc: "We're not chasing volume — we're building careers and lasting business relationships." },
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-colors" data-testid={`card-benefit-${idx + 1}`}>
                <item.icon className="w-10 h-10 text-emerald-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Scale */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" data-testid="section-trust">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-center" data-testid="heading-trust">Trusted by Thousands</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { number: "2,500+", label: "Verified Professionals" },
              { number: "1,200+", label: "Completed Projects" },
              { number: "R50M+", label: "In Earnings Facilitated" },
              { number: "100%", label: "POPIA Compliant" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-gradient-to-br from-emerald-500/10 to-slate-900 border border-emerald-500/20 rounded-lg" data-testid={`stat-${idx + 1}`}>
                <div className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-2">{stat.number}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-4 gap-4 bg-slate-900/50 p-8 rounded-xl border border-slate-800" data-testid="trust-badges">
            {["Secure Payments", "Verified Profiles", "Dispute Protection", "Cape Town-Based"].map((badge, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2 p-4 bg-slate-950/50 rounded-lg border border-slate-700" data-testid={`badge-${idx + 1}`}>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-sm">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600/20 via-slate-950 to-slate-950 border-t border-emerald-500/20" data-testid="section-final-cta">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8" data-testid="heading-cta">Ready to Shape the Future of Work?</h2>
          <p className="text-lg text-slate-300 mb-10" data-testid="text-cta">Join thousands of skilled professionals and forward-thinking businesses building the new economy.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join" asChild>
              <Button 
                size="lg"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 transition-colors cursor-pointer"
                data-testid="button-join-freelancer"
              >
                Join as a Freelancer
              </Button>
            </Link>
            <Link href="/browse" asChild>
              <Button 
                variant="outline"
                size="lg"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 border-2 border-emerald-500 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-500/10 transition-colors cursor-pointer"
                data-testid="button-hire-talent"
              >
                Hire Talent Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
