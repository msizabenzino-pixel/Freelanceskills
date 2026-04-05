import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Star, Users, Gift, TrendingUp, Award, ArrowRight,
  CheckCircle2, Globe, Zap, Crown, ChevronRight, Sparkles
} from "lucide-react";

const TIERS = [
  {
    name: "Bronze Ambassador",
    req: "50+ referrals",
    color: "from-amber-700/30 to-amber-900/20",
    border: "border-amber-600/40",
    badge: "🥉",
    badgeColor: "text-amber-600",
    perks: ["5% commission bonus on all referrals", "Official Ambassador badge on profile", "Early access to new features", "Ambassador-only newsletter"],
  },
  {
    name: "Silver Ambassador",
    req: "200+ referrals",
    color: "from-slate-600/30 to-slate-800/20",
    border: "border-slate-400/40",
    badge: "🥈",
    badgeColor: "text-slate-300",
    perks: ["10% commission bonus on all referrals", "Priority customer support", "Exclusive FreelanceSkills merch", "Monthly strategy call"],
    featured: false,
  },
  {
    name: "Gold Ambassador",
    req: "500+ referrals",
    color: "from-yellow-600/30 to-yellow-900/20",
    border: "border-yellow-500/40",
    badge: "🥇",
    badgeColor: "text-yellow-400",
    perks: ["15% commission bonus on all referrals", "Dedicated success manager", "Conference & event invitations", "Co-marketing opportunities", "Revenue share on new features"],
    featured: true,
  },
];

const HOW_IT_WORKS = [
  { step: "01", icon: <Users className="w-7 h-7" />, title: "Apply to Join", desc: "Fill out the ambassador application. We accept active freelancers and community leaders across Africa." },
  { step: "02", icon: <Gift className="w-7 h-7" />, title: "Get Your Unique Link", desc: "Receive a personalised referral link and marketing materials to share with your network." },
  { step: "03", icon: <TrendingUp className="w-7 h-7" />, title: "Refer & Earn", desc: "Every freelancer or client who signs up via your link earns you commission. No cap. No expiry." },
  { step: "04", icon: <Crown className="w-7 h-7" />, title: "Level Up Your Tier", desc: "Hit 50, 200, or 500 referrals to unlock Bronze, Silver, or Gold status with bigger perks." },
];

const STATS = [
  { value: "R2.3M+", label: "Paid out to ambassadors" },
  { value: "1,200+", label: "Active ambassadors" },
  { value: "12", label: "African countries" },
  { value: "R4,500", label: "Avg monthly earnings" },
];

export default function AmbassadorPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-16 pb-20 px-4 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <Star className="w-4 h-4" />
              1,200+ Ambassadors Already Earning
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Become a{" "}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                FreelanceSkills Ambassador
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Grow your income by referring freelancers and clients to Africa's #1 marketplace. Earn commission on every successful referral — no cap, no expiry.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
              {STATS.map((s) => (
                <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02]" data-testid="button-ambassador-apply">
                <Star className="w-5 h-5" /> Apply to Become an Ambassador
              </Link>
              <a href="#tiers" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all">
                See Ambassador Tiers <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white text-center mb-12">How the Ambassador Program Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 mb-4">
                  {s.icon}
                </div>
                <div className="text-xs text-amber-500 font-black mb-1">{s.step}</div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tiers */}
        <section id="tiers" className="bg-slate-900/50 border-y border-slate-800 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-black text-white text-center mb-4">Ambassador Tiers & Rewards</h2>
            <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">Level up as you refer more people. Each tier unlocks bigger perks and higher commissions.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative p-6 bg-gradient-to-br ${tier.color} border ${tier.border} rounded-2xl ${tier.featured ? "ring-2 ring-yellow-500/40 shadow-xl shadow-yellow-500/10" : ""}`}
                  data-testid={`tier-${tier.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 text-xs font-black px-4 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="text-4xl mb-3">{tier.badge}</div>
                  <h3 className={`text-xl font-black ${tier.badgeColor} mb-1`}>{tier.name}</h3>
                  <p className="text-slate-400 text-sm mb-5">Required: {tier.req}</p>
                  <ul className="space-y-2.5">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who Can Join */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white text-center mb-12">Who Can Become an Ambassador?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "💼", title: "Active Freelancers", desc: "Any verified FreelanceSkills freelancer with a complete profile" },
              { icon: "📱", title: "Social Media Influencers", desc: "Content creators with an engaged African audience" },
              { icon: "🎓", title: "University Students", desc: "Student ambassadors earn commission + academic credit" },
              { icon: "🏢", title: "Business Owners", desc: "SME owners who refer their contractors to our platform" },
              { icon: "🌍", title: "Community Leaders", desc: "WhatsApp group admins, LinkedIn influencers, forum moderators" },
              { icon: "📰", title: "Bloggers & Creators", desc: "Anyone with a blog, YouTube channel, podcast, or newsletter" },
            ].map((item) => (
              <div key={item.title} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-all">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 py-16 px-4 mx-4 mb-16 rounded-3xl max-w-5xl lg:mx-auto">
          <div className="text-center">
            <Award className="w-12 h-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-4">Start Earning as an Ambassador Today</h2>
            <p className="text-amber-100 mb-8 max-w-md mx-auto">
              Join 1,200+ ambassadors across Africa earning passive income by growing the FreelanceSkills community.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-amber-700 font-black rounded-xl hover:bg-amber-50 transition-colors text-lg" data-testid="button-ambassador-cta">
              Apply Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
