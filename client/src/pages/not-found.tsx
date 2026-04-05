import { Link } from "wouter";
import { Home, Search, ArrowLeft, Compass, GraduationCap, Briefcase, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const QUICK_LINKS = [
  { icon: <Home className="w-5 h-5" />, label: "Home", href: "/" },
  { icon: <Search className="w-5 h-5" />, label: "Find Talent", href: "/find-talent" },
  { icon: <Briefcase className="w-5 h-5" />, label: "Browse Jobs", href: "/explore" },
  { icon: <GraduationCap className="w-5 h-5" />, label: "Academy", href: "/academy" },
  { icon: <Compass className="w-5 h-5" />, label: "AI Match", href: "/ai-match" },
  { icon: <Sparkles className="w-5 h-5" />, label: "Get Vetted", href: "/vetting" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative mb-8 inline-block">
            <div className="text-[9rem] sm:text-[12rem] font-black leading-none bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                <Compass className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-400" />
              </div>
            </div>
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
            This page took a freelance day off
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist — but 47,000+ freelancers and 92,000+ projects are waiting for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-xl shadow-emerald-500/20 text-base"
              data-testid="button-404-home"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all border border-slate-700 text-base"
              data-testid="button-404-back"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-5">Popular Destinations</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QUICK_LINKS.map(({ icon, label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/40 rounded-xl transition-all group text-left"
                  data-testid={`link-404-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">{icon}</span>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-sm mt-8">
            Need help?{" "}
            <Link href="/contact" className="text-emerald-500 hover:text-emerald-400 font-medium">
              Contact our team
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
