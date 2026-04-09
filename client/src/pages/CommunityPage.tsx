import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  MessageSquare, Users, TrendingUp, Star, BookOpen, Award,
  Zap, Globe, Heart, ArrowRight, Flame, ChevronRight,
  Hash, Bell, PenTool, Sparkles, Shield, Trophy
} from "lucide-react";

const FORUM_CATEGORIES = [
  { icon: "💼", name: "Freelance Hustles", desc: "Tips, wins, and client stories", posts: "4.2K", color: "from-emerald-600/20 to-emerald-800/20 border-emerald-500/30" },
  { icon: "🤖", name: "AI & Tech Tools", desc: "ChatGPT, Claude, automation tricks", posts: "3.8K", color: "from-violet-600/20 to-violet-800/20 border-violet-500/30" },
  { icon: "💰", name: "Rates & Pricing", desc: "SA market rates, negotiation, invoicing", posts: "2.9K", color: "from-amber-600/20 to-amber-800/20 border-amber-500/30" },
  { icon: "🏛️", name: "Government Tenders", desc: "CIDB, CSD, bid strategies", posts: "2.1K", color: "from-blue-600/20 to-blue-800/20 border-blue-500/30" },
  { icon: "🎨", name: "Creative Corner", desc: "Designers, writers, videographers", posts: "1.9K", color: "from-pink-600/20 to-pink-800/20 border-pink-500/30" },
  { icon: "📊", name: "Business & Growth", desc: "Scale your freelance business", posts: "1.7K", color: "from-teal-600/20 to-teal-800/20 border-teal-500/30" },
  { icon: "🔧", name: "Trades & Services", desc: "Plumbers, electricians, builders", posts: "1.5K", color: "from-orange-600/20 to-orange-800/20 border-orange-500/30" },
  { icon: "🤝", name: "Find a Partner", desc: "Collab, sub-contract, co-found", posts: "1.2K", color: "from-rose-600/20 to-rose-800/20 border-rose-500/30" },
];

const TOP_DISCUSSIONS = [
  { tag: "HOT", title: "How I went from R8k to R45k/month in 6 months using AI tools", author: "Sipho M.", replies: 87, likes: 214, category: "AI & Tech Tools" },
  { tag: "NEW", title: "Complete guide to CSD tender registration 2026 — step by step", author: "Nandi Z.", replies: 42, likes: 156, category: "Government Tenders" },
  { tag: "HOT", title: "What rates are SA developers charging in 2026? Share yours", author: "David K.", replies: 134, likes: 298, category: "Rates & Pricing" },
  { tag: "PINNED", title: "The ultimate client red flag checklist — things to watch for", author: "Lerato N.", replies: 65, likes: 445, category: "Freelance Hustles" },
  { tag: "NEW", title: "My first R100K month — here's what changed", author: "Thabo W.", replies: 29, likes: 381, category: "Business & Growth" },
];

const COMMUNITY_STATS = [
  { icon: <Users className="w-6 h-6" />, value: "47K+", label: "Community Members" },
  { icon: <MessageSquare className="w-6 h-6" />, value: "18K+", label: "Discussions" },
  { icon: <Globe className="w-6 h-6" />, value: "12", label: "African Countries" },
  { icon: <Star className="w-6 h-6" />, value: "4.9★", label: "Member Satisfaction" },
];

export default function CommunityPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-16 pb-20 px-4 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <Flame className="w-4 h-4" />
              47,000+ African Freelancers · Live Discussions Daily
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Africa's{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Freelance Community
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with 47,000+ freelancers across South Africa and the continent. Share wins, get advice, find collaborators, and grow together.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
              {COMMUNITY_STATS.map((s) => (
                <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-emerald-400 flex justify-center mb-2">{s.icon}</div>
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02]" data-testid="button-community-join">
                <Users className="w-5 h-5" /> Join the Community Free
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all" data-testid="button-community-login">
                Already a member? Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Forum Categories */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black text-white">Discussion Categories</h2>
              <p className="text-slate-400 text-sm mt-1">Find your community — 8 active categories</p>
            </div>
            <Link href="/signup" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors">
              Browse All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FORUM_CATEGORIES.map((cat) => (
              <Link href="/signup" key={cat.name} data-testid={`category-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className={`p-5 bg-gradient-to-br ${cat.color} border rounded-2xl hover:scale-[1.02] transition-all cursor-pointer group`}>
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h3 className="font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">{cat.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">{cat.desc}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {cat.posts} posts
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Discussions */}
        <section className="bg-slate-900/50 border-y border-slate-800 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-black text-white">Trending Discussions</h2>
            </div>
            <div className="space-y-4">
              {TOP_DISCUSSIONS.map((d, i) => (
                <Link href="/signup" key={i} data-testid={`discussion-${i}`}>
                  <div className="p-5 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                          d.tag === "HOT" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                          d.tag === "PINNED" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                          "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}>{d.tag}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug mb-2">{d.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>by <span className="text-slate-300 font-medium">{d.author}</span></span>
                          <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{d.category}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{d.replies} replies</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" />{d.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 hover:border-emerald-500/40 text-white font-semibold rounded-xl transition-all" data-testid="button-community-see-all">
                Join to See All Discussions <ArrowRight className="w-4 h-4 text-emerald-400" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white text-center mb-12">Community Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <MessageSquare className="w-6 h-6" />, title: "Forum Discussions", desc: "Deep-dive conversations across 8 categories with AI moderation for quality" },
              { icon: <Bell className="w-6 h-6" />, title: "Real-Time Notifications", desc: "Get notified when someone replies to your post or mentions you" },
              { icon: <Trophy className="w-6 h-6" />, title: "Community Leaderboard", desc: "Earn points for helpful posts. Top contributors earn Elite Club membership" },
              { icon: <Shield className="w-6 h-6" />, title: "Verified Members Only", desc: "Posts by verified freelancers are marked for extra credibility" },
              { icon: <Sparkles className="w-6 h-6" />, title: "AI-Moderated Quality", desc: "Our AI removes spam and flags unhelpful content automatically" },
              { icon: <Globe className="w-6 h-6" />, title: "Pan-African Reach", desc: "12 countries. English, Zulu, Xhosa, Afrikaans, Swahili, French, Hausa, Arabic, and Nigerian Pidgin" },
            ].map((f, i) => (
              <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/30 transition-all group">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500/20 transition-all">
                  {f.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 py-16 px-4 mx-4 mb-16 rounded-3xl max-w-5xl lg:mx-auto">
          <div className="text-center">
            <Users className="w-12 h-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-4">Join 47,000+ African Freelancers</h2>
            <p className="text-emerald-100 mb-8 max-w-md mx-auto">
              Free membership. Post discussions, get expert advice, and build your network across Africa.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-emerald-700 font-black rounded-xl hover:bg-emerald-50 transition-colors text-lg" data-testid="button-community-cta">
              Join the Community Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
