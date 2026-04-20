import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, Lock, ArrowRight, ShieldCheck, MessageSquare, Briefcase } from "lucide-react";
import { useLocation } from "wouter";

interface AuthGuardProps {
  children: React.ReactNode;
  message?: string;
}

export function AuthGuard({ children, message = "Sign in to access this page." }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const currentPath =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" role="main" className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    const isMessages = path.includes("message");
    const isPostJob = path.includes("post-job");

    const context = isMessages
      ? {
          icon: MessageSquare,
          headline: "Your messages are waiting",
          sub: "Sign in to see your conversations, send proposals, and collaborate with clients.",
          features: [
            "Real-time messaging with read receipts",
            "Send proposals with escrow-protected terms",
            "Video calls built right into chat",
          ],
          accentColor: "from-blue-500/20 to-emerald-500/10",
          glowColor: "bg-blue-500/8",
        }
      : isPostJob
      ? {
          icon: Briefcase,
          headline: "Post a job in 2 minutes",
          sub: "Sign in to post your job brief and start receiving verified proposals from African talent.",
          features: [
            "AI writes your job brief from a sentence",
            "Receive proposals within hours",
            "Escrow-protected payments from day one",
          ],
          accentColor: "from-emerald-500/20 to-teal-500/10",
          glowColor: "bg-emerald-500/8",
        }
      : {
          icon: Lock,
          headline: "Sign in to continue",
          sub: message,
          features: [
            "Secure Firebase authentication",
            "Google & LinkedIn sign-in",
            "256-bit encrypted sessions",
          ],
          accentColor: "from-slate-800/60 to-slate-900/40",
          glowColor: "bg-slate-500/5",
        };

    const Icon = context.icon;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main id="main-content" role="main" className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center" data-testid="auth-guard-card">
            {/* Glow */}
            <div className={`absolute left-1/2 -translate-x-1/2 w-96 h-64 ${context.glowColor} rounded-full blur-[100px] pointer-events-none`} />

            {/* Icon */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${context.accentColor} border border-slate-700 flex items-center justify-center shadow-2xl`}>
                <Icon className="w-9 h-9 text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-slate-950" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-3" data-testid="auth-guard-heading">{context.headline}</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">{context.sub}</p>

            {/* Features */}
            <div className="space-y-2 mb-8 text-left">
              {context.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                onClick={() => navigate(`/auth?redirect=${encodeURIComponent(currentPath)}`)}
                data-testid="button-sign-in"
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
              <button
                className="w-full py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-300 font-medium text-sm transition-all"
                onClick={() => navigate(`/auth?mode=register&redirect=${encodeURIComponent(currentPath)}`)}
                data-testid="button-create-account"
              >
                Create a Free Account
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
