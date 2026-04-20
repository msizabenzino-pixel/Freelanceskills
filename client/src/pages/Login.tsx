import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Eye, EyeOff, ArrowRight, Shield, CheckCircle, Lock, Zap,
  Download, X, BadgeCheck, Globe, Star, Users, Briefcase, Smartphone
} from "lucide-react";
import { Link } from "wouter";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebaseAuth";
import { consumePendingAuthRedirect } from "@/lib/authRedirect";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [installedAsApp, setInstalledAsApp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authErr = params.get("auth_error");
    if (authErr) {
      setAuthError(authErr);
      window.history.replaceState({}, "", window.location.pathname);
    }
    const linkedinErr = params.get("linkedin_error");
    if (linkedinErr) {
      setAuthError(linkedinErr === "not_configured" ? "LinkedIn is not configured yet. Please add the redirect URL and try again." : linkedinErr);
      window.history.replaceState({}, "", window.location.pathname);
    }

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

  const handlePostAuthRedirect = () => {
    const redirect = consumePendingAuthRedirect();
    navigate(redirect ?? "/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    try {
      await loginWithEmail({ email, password });
      toast({ title: "Welcome back!", description: "You are now logged in." });
      handlePostAuthRedirect();
    } catch (err: any) {
      const message =
        err?.message?.includes("auth/invalid-credential") ||
        err?.message?.includes("auth/wrong-password") ||
        err?.message?.includes("auth/user-not-found")
          ? "Incorrect email or password. Please try again."
          : err?.message?.includes("auth/too-many-requests")
          ? "Too many failed attempts. Please wait a few minutes and try again."
          : err?.message || "Login failed. Please check your credentials and try again.";
      setAuthError(message);
      toast({ title: "Login failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuthSuccess = ({ user, isNewUser }: { user: any; isNewUser: boolean }) => {
    if (isNewUser) {
      toast({ title: "Welcome to FreelanceSkills! 🎉", description: "Let's build your profile — takes 60 seconds." });
      navigate("/cv-upload?welcome=1");
    } else {
      toast({ title: "Welcome back!", description: `Signed in as ${user?.email || "user"}.` });
      handlePostAuthRedirect();
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      handleSocialAuthSuccess(result);
    } catch (err: any) {
      const message =
        err?.message?.includes("popup-closed-by-user")
          ? "Sign-in was cancelled. Please try again."
          : err?.message || "Google sign-in failed. Please try again.";
      setAuthError(message);
      toast({ title: "Google sign-in failed", description: message, variant: "destructive" });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLinkedInLogin = () => {
    window.location.href = "/api/auth/linkedin";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />

      {/* Background glow elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <section
        className="relative flex-1 flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-12 pt-20"
        data-testid="section-login"
      >
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">

          {/* ── Left Panel ── */}
          <div className="hidden lg:flex flex-col justify-center" data-testid="panel-value-prop">

            {/* African-tech pattern */}
            <div className="absolute -z-10 inset-0 opacity-[0.06]">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <pattern id="geo-login" patternUnits="userSpaceOnUse" width="20" height="20">
                    <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
                    <circle cx="10" cy="10" r="1" fill="currentColor" className="text-emerald-500" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#geo-login)" />
              </svg>
            </div>

            <div className="mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6" data-testid="badge-africa-first">
                <Globe className="w-4 h-4" />
                Africa's #1 Skilled Freelance Marketplace
              </span>
              <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6" data-testid="heading-welcome">
                Welcome back to the future of{" "}
                <span className="text-emerald-400">skilled work</span> in Africa
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed" data-testid="text-subheadline">
                Log in to connect with verified talent and high-value opportunities — locally and globally.
              </p>
            </div>

            {/* Live stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-10 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl" data-testid="stats-bar">
              {[
                { value: "47K+", label: "Verified Freelancers", icon: Users },
                { value: "R2.3B+", label: "Escrow Protected", icon: Shield },
                { value: "4.9★", label: "Platform Rating", icon: Star },
              ].map(({ value, label, icon: Icon }, i) => (
                <div key={i} className="text-center" data-testid={`stat-${i + 1}`}>
                  <div className="flex justify-center mb-1.5">
                    <Icon className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">{value}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-tight">{label}</div>
                </div>
              ))}
            </div>

            {/* Trust Benefits */}
            <div className="space-y-4 mb-10" data-testid="benefits-list">
              {[
                { icon: BadgeCheck, text: "AI-proctored vetting — 5-tier verified talent system" },
                { icon: CheckCircle, text: "PayFast escrow & instant ZAR payouts on every project" },
                { icon: Zap, text: "AI smart matching + industry-leading 10% transparent fees" },
                { icon: Lock, text: "POPIA compliant — SA-based 24/7 support team" },
                { icon: Briefcase, text: "Part of the platform empowering 1 million Africans by 2031" },
              ].map(({ icon: Icon, text }, i) => (
                <div className="flex items-start gap-4" key={i} data-testid={`benefit-${i + 1}`}>
                  <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-slate-300 text-sm leading-relaxed">{text}</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-500 italic" data-testid="trust-line">
              Trusted by professionals across Johannesburg, Cape Town, Durban, Lagos, Nairobi & beyond
            </p>
          </div>

          {/* ── Right Panel: Login Form ── */}
          <div className="w-full" data-testid="panel-form">
            <div
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/40 backdrop-blur-sm"
              data-testid="card-login"
            >
              {/* Logo */}
              <div className="mb-8 flex justify-center">
                <BrandLogo imageClassName="h-12 md:h-14 max-w-[260px]" />
              </div>

              <h2 className="text-3xl font-bold mb-2 text-center" data-testid="heading-login">
                Log in to your account
              </h2>
              <p className="text-slate-400 text-sm text-center mb-8" data-testid="subtext-login">
                New here?{" "}
                <Link href="/auth?mode=register">
                  <a className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                    Create a free account
                  </a>
                </Link>
              </p>

              {/* Error Banner */}
              {authError && (
                <div
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
                  data-testid="banner-auth-error"
                >
                  <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm leading-relaxed">{authError}</p>
                </div>
              )}

              {/* Social Login Buttons */}
              <div className="mb-8 space-y-2.5" data-testid="social-login-section">
                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-slate-700 bg-white/[0.03] hover:bg-white/[0.07] hover:border-slate-500 transition-all text-slate-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
                  data-testid="button-social-google"
                >
                  {isGoogleLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  {isGoogleLoading ? "Signing in..." : "Continue with Google"}
                </button>

                {/* LinkedIn */}
                <button
                  onClick={handleLinkedInLogin}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-[#0077B5]/40 bg-[#0077B5]/5 hover:bg-[#0077B5]/15 hover:border-[#0077B5]/70 transition-all text-slate-100 font-semibold active:scale-[0.98] shadow-sm"
                  data-testid="button-social-linkedin"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#0077B5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Continue with LinkedIn
                </button>

              </div>

              {/* Divider */}
              <div className="relative mb-8" data-testid="divider-or">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/80" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-slate-900/70 text-slate-500 uppercase tracking-wider font-medium">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleLogin} className="space-y-5" data-testid="form-login">

                {/* Email */}
                <div data-testid="field-email">
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    data-testid="input-email"
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div data-testid="field-password">
                  <label htmlFor="password" className="block text-sm font-medium mb-2 text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none pr-12"
                      data-testid="input-password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      data-testid="button-toggle-password"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1" data-testid="form-options">
                  <label className="flex items-center gap-2 cursor-pointer" data-testid="checkbox-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border border-slate-600 text-emerald-500 focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                    />
                    <span className="text-sm text-slate-400">Remember me</span>
                  </label>
                  <Link href="/auth?mode=forgot">
                    <a className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors" data-testid="link-forgot-password">
                      Forgot password?
                    </a>
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-emerald-500 text-slate-950 rounded-xl font-semibold hover:bg-emerald-400 disabled:bg-emerald-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-emerald-500/25 mt-2 text-base"
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Log in to FreelanceSkills
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* PWA Install — always visible, not just on prompt */}
              {!installedAsApp && (
                <div
                  className="mt-8 p-5 bg-gradient-to-r from-emerald-500/10 to-slate-900/50 border border-emerald-500/20 rounded-xl"
                  data-testid="pwa-install-section"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-50 mb-1 text-sm" data-testid="heading-install">
                        Install the FreelanceSkills app
                      </h3>
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed" data-testid="text-install-desc">
                        Home-screen access, offline browsing &amp; instant match notifications. Native-app feel.
                      </p>
                      {showInstallPrompt ? (
                        <button
                          onClick={handleInstallClick}
                          className="w-full px-4 py-2.5 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 transition-all text-sm shadow-md shadow-emerald-500/20"
                          data-testid="button-install-app"
                        >
                          Install FreelanceSkills App
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowFallbackModal(true)}
                          className="w-full px-4 py-2.5 border border-emerald-500/40 text-emerald-400 rounded-lg font-medium hover:bg-emerald-500/10 transition-all text-sm"
                          data-testid="button-install-manual"
                        >
                          How to install on my device
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sign Up Links */}
              <div className="mt-8 pt-6 border-t border-slate-800 text-center" data-testid="signup-section">
                <p className="text-slate-400 mb-4 text-sm">Need an account?</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/auth?mode=register" asChild>
                    <Button
                      variant="outline"
                      className="flex-1 border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                      data-testid="button-join-freelancer"
                    >
                      Sign up as Freelancer
                    </Button>
                  </Link>
                  <Link href="/auth?mode=register" asChild>
                    <Button
                      variant="outline"
                      className="flex-1 border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                      data-testid="button-join-client"
                    >
                      Sign up as Client
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-t border-slate-800/60 bg-slate-900/40 px-4 sm:px-6 lg:px-8 py-5" data-testid="section-trust-bar">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center justify-center text-xs text-slate-500">
            {[
              { icon: Shield, label: "256-bit SSL Encrypted" },
              { icon: Lock, label: "POPIA Compliant" },
              { icon: BadgeCheck, label: "PayFast Escrow Protected" },
              { icon: CheckCircle, label: "CIPC Registered 2026/070509/09" },
              { icon: Globe, label: "Cape Town, South Africa" },
            ].map(({ icon: Icon, label }, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-emerald-500/70" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

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
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-slate-300 mb-8 text-sm leading-relaxed" data-testid="text-fallback-intro">
              Get home-screen access, offline browsing, and instant match notifications. Here's how to install:
            </p>

            <div className="space-y-6 mb-8">
              <div data-testid="instructions-chrome">
                <h4 className="font-semibold text-emerald-400 mb-2 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-xs font-bold">C</span>
                  Chrome on Android
                </h4>
                <ol className="text-slate-400 text-sm space-y-1.5 ml-7 list-decimal">
                  <li>Tap the <strong className="text-slate-300">⋮ menu</strong> in the top-right corner</li>
                  <li>Select <strong className="text-slate-300">"Install app"</strong> and confirm</li>
                </ol>
              </div>

              <div data-testid="instructions-safari">
                <h4 className="font-semibold text-emerald-400 mb-2 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-xs font-bold">S</span>
                  Safari on iPhone / iPad
                </h4>
                <ol className="text-slate-400 text-sm space-y-1.5 ml-7 list-decimal">
                  <li>Tap the <strong className="text-slate-300">Share button</strong> (square with arrow ↑)</li>
                  <li>Tap <strong className="text-slate-300">"Add to Home Screen"</strong> and tap Add</li>
                </ol>
              </div>

              <div data-testid="instructions-desktop">
                <h4 className="font-semibold text-emerald-400 mb-2 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-xs font-bold">D</span>
                  Desktop (Chrome / Edge)
                </h4>
                <ol className="text-slate-400 text-sm space-y-1.5 ml-7 list-decimal">
                  <li>Click the <strong className="text-slate-300">install icon</strong> in the address bar</li>
                  <li>Select <strong className="text-slate-300">"Install"</strong> in the dialog</li>
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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </div>
  );
}
