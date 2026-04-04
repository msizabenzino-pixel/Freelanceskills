import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Shield, Users, Sparkles, Briefcase, User, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";
import { VoiceSearch } from "./VoiceSearch";

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/services");
    }
  };

  const handlePopularClick = (term: string) => {
    navigate(`/services?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-background.png')" }}
      >
        <div className="absolute inset-0 bg-slate-950/88 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/80" />
        <div className="absolute inset-0 animated-gradient-bg opacity-40" />
      </div>

      {/* Geometric African-tech pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/6 w-[600px] h-[600px] bg-emerald-500/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] bg-blue-500/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/3 rounded-full blur-[160px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 py-20 md:py-28" role="banner">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/8 border border-white/15 text-white/85 text-sm font-medium shadow-lg backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Africa's #1 AI-Powered Skills Marketplace · Live 2026
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-[1.07] mb-6"
          >
            The Future of Skilled Work{" "}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200">
              in Africa and Beyond
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            FreelanceSkills is the trusted, skills-first AI-powered marketplace connecting verified African talent with businesses locally and globally — delivering quality, security, and real opportunity.
          </motion.p>

          {/* Search bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.26, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-2xl mx-auto bg-white/8 backdrop-blur-md p-2.5 rounded-2xl border border-white/15 shadow-2xl mb-6"
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5 pointer-events-none" />
              <label htmlFor="hero-search" className="sr-only">Search for services or professionals</label>
              <input
                id="hero-search"
                type="text"
                placeholder="Plumber, Safety Officer, Developer, Designer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/40 transition-all text-base"
                aria-label="Search for services or professionals"
                data-testid="input-hero-search"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/25 whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0 min-h-[48px]"
              data-testid="button-hero-search"
            >
              <Search className="w-4 h-4" />
              Find Talent
            </button>
          </motion.form>

          {/* Primary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.34, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-md mx-auto mb-10"
          >
            <button
              onClick={() => navigate("/onboarding")}
              className="flex-1 h-14 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 min-h-[56px]"
              data-testid="button-get-hired-free"
            >
              <User className="w-5 h-5" />
              Get Hired Free
            </button>
            <button
              onClick={() => navigate("/post-job")}
              className="flex-1 h-14 rounded-xl bg-white/12 hover:bg-white/20 border border-white/20 hover:border-white/35 text-white font-bold text-base backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 min-h-[56px]"
              data-testid="button-post-a-job"
            >
              <Briefcase className="w-5 h-5" />
              Post a Job
            </button>
          </motion.div>

          {/* Popular searches */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/55 text-sm font-medium mb-6"
          >
            <span className="text-white/35">Popular:</span>
            {["Plumbing", "Safety Officer", "Tender Consulting", "Web Dev", "Design"].map((term) => (
              <button
                key={term}
                onClick={() => handlePopularClick(term)}
                className="hover:text-emerald-400 transition-colors underline decoration-dotted underline-offset-2 cursor-pointer"
                data-testid={`link-popular-${term.toLowerCase().replace(/\s/g, '-')}`}
              >
                {term}
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex justify-center mb-8"
          >
            <VoiceSearch variant="hero" />
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/45 text-xs font-medium"
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500/70" />
              47K+ Verified Freelancers
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500/70" />
              R2.3B+ Escrow Protected
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500/70" />
              POPIA Compliant · AI-Powered
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
