import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Sparkles, Shield, Users } from "lucide-react";
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
    <div className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-background.png')" }}
      >
        <div className="absolute inset-0 bg-primary/82 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-background/60" />
        <div className="absolute inset-0 animated-gradient-bg opacity-60" />
      </div>

      {/* Decorative orbs for premium feel */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 pt-24" role="banner">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark border border-white/20 text-white/90 text-sm font-medium mb-8 shadow-lg">
              <span className="live-dot">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
              </span>
              #1 Marketplace for Local Pros & Global Talent
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-[1.08]">
              Find the perfect <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-orange-300 to-yellow-200">
                expert near you.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
          >
            From local plumbers and safety officers to remote developers and accountants.
            FreelanceSkills connects you with trusted professionals instantly.
          </motion.p>

          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-center justify-center gap-3 w-full max-w-xl mx-auto glass-dark p-2.5 rounded-2xl border border-white/15 shadow-2xl"
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
              <label htmlFor="hero-search" className="sr-only">Search for services or professionals</label>
              <input
                id="hero-search"
                type="text"
                placeholder="Plumber, Safety Officer, Web Dev..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent/40 transition-all text-base"
                aria-label="Search for services or professionals"
                data-testid="input-hero-search"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto h-12 rounded-xl bg-accent hover:bg-accent/90 text-primary font-bold px-8 shadow-lg shadow-accent/30 whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98]"
              data-testid="button-hero-search"
            >
              Search Now
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-white/60 text-sm font-medium pt-2"
          >
            <span className="text-white/40">Popular:</span>
            {["Plumbing", "Safety Officer", "Tender Consulting", "Web Dev"].map((term) => (
              <button
                key={term}
                onClick={() => handlePopularClick(term)}
                className="hover:text-accent transition-colors underline decoration-dotted cursor-pointer hover:underline-offset-4"
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
            className="flex justify-center"
          >
            <VoiceSearch variant="hero" />
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 pt-4 text-white/50 text-xs font-medium"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-accent/70" /> Escrow-Protected Payments
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-accent/70" /> 50,000+ Verified Professionals
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent/70" /> AI-Powered Matching
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
