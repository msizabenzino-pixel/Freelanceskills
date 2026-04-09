import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Crown, Star, Trophy, Shield, Zap, Award, Users, TrendingUp,
  CheckCircle2, ArrowRight, Lock, Gift, Globe, ChevronRight
} from "lucide-react";

const BENEFITS = [
  { icon: <Zap className="w-5 h-5" />, title: "Priority Matching", desc: "Elite members appear first in search results and AI job matches — up to 3× more visibility", badge: "3× Visibility" },
  { icon: <Shield className="w-5 h-5" />, title: "Gold Verification Badge", desc: "A gold crown badge on your profile signals premium quality to every client", badge: "Trust Signal" },
  { icon: <TrendingUp className="w-5 h-5" />, title: "Reduced Platform Fee", desc: "Elite members pay only 8% platform fee instead of the standard 10%", badge: "Save 2%" },
  { icon: <Award className="w-5 h-5" />, title: "Dedicated Account Manager", desc: "One-on-one support from your own FreelanceSkills success manager", badge: "VIP Support" },
  { icon: <Gift className="w-5 h-5" />, title: "Academy Pro Access", desc: "Free access to all 47 premium Academy courses worth R12,000+/year", badge: "R12K Value" },
  { icon: <Users className="w-5 h-5" />, title: "Elite Network Access", desc: "Private Slack community with Africa's top 1% of freelancers and Forbes-listed clients", badge: "Exclusive" },
  { icon: <Globe className="w-5 h-5" />, title: "International Job Access", desc: "First access to USD, EUR, GBP projects from global enterprise clients", badge: "Global" },
  { icon: <Crown className="w-5 h-5" />, title: "Hall of Fame Feature", desc: "Monthly spotlight on our homepage and social channels reaching 200K+ professionals", badge: "200K Reach" },
];

const REQUIREMENTS = [
  { label: "Completed Projects", value: "50+", desc: "Successfully completed projects on the platform" },
  { label: "Minimum Rating", value: "4.8★", desc: "Consistent 5-star delivery over time" },
  { label: "Response Rate", value: ">95%", desc: "Respond to clients within 24 hours" },
  { label: "Vetting Level", value: "Level 3+", desc: "5-step verification at minimum level 3" },
];

const HALL_OF_FAME = [
  { name: "Sipho M.", skill: "Full-Stack Dev", city: "Johannesburg", earned: "R2.4M", rating: "5.0★" },
  { name: "Nandi Z.", skill: "Brand Designer", city: "Cape Town", earned: "R1.8M", rating: "5.0★" },
  { name: "David K.", skill: "AI Engineer", city: "Durban", earned: "R3.1M", rating: "5.0★" },
  { name: "Lerato N.", skill: "Copywriter", city: "Pretoria", earned: "R890K", rating: "5.0★" },
  { name: "Thabo W.", skill: "Project Manager", city: "Port Elizabeth", earned: "R1.2M", rating: "5.0★" },
  { name: "Ayesha P.", skill: "UX Designer", city: "Cape Town", earned: "R1.5M", rating: "5.0★" },
];

export default function EliteClubPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-16 pb-20 px-4 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <Crown className="w-4 h-4" />
              Top 1% of African Freelancers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              The FreelanceSkills{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Elite Club
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Africa's most exclusive freelance network. Reserved for the top 1% of earners — verified experts who consistently deliver world-class work.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
              {[
                { value: "2,300+", label: "Elite Members" },
                { value: "R4.8M", label: "Avg annual earnings" },
                { value: "8%", label: "Platform fee (vs 10%)" },
                { value: "3×", label: "More job visibility" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-xl font-black text-yellow-400">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-yellow-500/20 transition-all hover:scale-[1.02]" data-testid="button-elite-apply">
                <Crown className="w-5 h-5" /> Apply for Elite Status
              </Link>
              <a href="#requirements" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all">
                See Requirements <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white text-center mb-4">Elite Member Benefits</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">Exclusive perks that give you an unfair advantage in Africa's most competitive freelance market.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b, i) => (
              <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-yellow-500/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500/20 transition-all">
                    {b.icon}
                  </div>
                  <span className="text-[10px] font-black bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full">{b.badge}</span>
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{b.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section id="requirements" className="bg-slate-900/50 border-y border-slate-800 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-white text-center mb-4">How to Qualify</h2>
            <p className="text-slate-400 text-center mb-12">Elite membership is automatically awarded when you meet all four criteria.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {REQUIREMENTS.map((r) => (
                <div key={r.label} className="text-center p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-yellow-500/30 transition-all">
                  <div className="text-3xl font-black text-yellow-400 mb-2">{r.value}</div>
                  <div className="font-bold text-white mb-2 text-sm">{r.label}</div>
                  <div className="text-slate-400 text-xs">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hall of Fame */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-black text-white">Hall of Fame — Top Earners</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HALL_OF_FAME.map((member) => (
              <div key={member.name} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-yellow-500/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-xl flex items-center justify-center text-yellow-400 font-black text-lg">
                    {member.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{member.name}</span>
                      <Crown className="w-3.5 h-3.5 text-yellow-400" />
                    </div>
                    <div className="text-sm text-slate-400">{member.skill} · {member.city}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-emerald-400 font-bold text-sm">{member.earned} earned</span>
                      <span className="text-yellow-400 text-xs font-bold">{member.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-yellow-700 via-amber-600 to-yellow-600 py-16 px-4 mx-4 mb-16 rounded-3xl max-w-5xl lg:mx-auto">
          <div className="text-center">
            <Crown className="w-12 h-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-4">Ready to Join the Elite Club?</h2>
            <p className="text-yellow-100 mb-8 max-w-md mx-auto">
              Start delivering excellent work today. When you reach 50 projects with a 4.8★ rating, you'll be automatically nominated.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-amber-700 font-black rounded-xl hover:bg-amber-50 transition-colors text-lg" data-testid="button-elite-cta">
                Start Your Journey <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/community" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-800/50 border border-white/20 text-white font-semibold rounded-xl hover:bg-amber-800 transition-all">
                Join the Community
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
