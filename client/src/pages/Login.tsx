import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowRight, Shield, CheckCircle, Lock, Zap, Download, X, Verified } from "lucide-react";
import { Link } from "wouter";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const socialButtons = [
    { name: "Google", icon: "G" },
    { name: "Apple", icon: "⌘" },
    { name: "LinkedIn", icon: "in" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8" data-testid="section-login">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Panel - Value Proposition */}
          <div className="hidden lg:flex flex-col justify-center relative" data-testid="panel-value-prop">
            <div className="absolute -z-10 inset-0 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <pattern id="geo-login" patternUnits="userSpaceOnUse" width="20" height="20">
                    <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#geo-login)"/>
              </svg>
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-tight" data-testid="heading-welcome">
              Welcome back to the future of skilled work in Africa
            </h1>
            
            <p className="text-lg text-slate-300 mb-10 leading-relaxed" data-testid="text-subheadline">
              Log in to connect verified talent with high-value opportunities — locally and globally.
            </p>

            {/* Trust Benefits */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Verified, text: "Verified ID & skills-vetted professionals" },
                { icon: Shield, text: "Secure escrow & instant ZAR payouts" },
                { icon: Zap, text: "AI smart matching + transparent 10% fees" },
                { icon: Lock, text: "POPIA compliant & 24/7 local SA support" },
                { icon: CheckCircle, text: "Part of the platform empowering 1 million Africans" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4" data-testid={`benefit-${idx + 1}`}>
                  <item.icon className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-400 italic" data-testid="trust-line">
              Trusted by thousands across Johannesburg, Cape Town, Durban & beyond
            </p>
          </div>

          {/* Right Panel - Login Form */}
          <div className="w-full" data-testid="panel-form">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-2xl" data-testid="card-login">
              
              <h2 className="text-3xl font-bold mb-8 text-center" data-testid="heading-login">
                Log in to your account
              </h2>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-8" data-testid="social-login-section">
                {socialButtons.map((btn, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors text-slate-100 font-medium"
                    data-testid={`button-social-${btn.name.toLowerCase()}`}
                  >
                    <span className="text-lg font-semibold">{btn.icon}</span>
                    Continue with {btn.name}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="relative mb-8" data-testid="divider-or">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900/50 text-slate-400">or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleLogin} className="space-y-4" data-testid="form-login">
                
                {/* Email Field */}
                <div data-testid="field-email">
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-colors"
                    data-testid="input-email"
                    required
                  />
                </div>

                {/* Password Field */}
                <div data-testid="field-password">
                  <label htmlFor="password" className="block text-sm font-medium mb-2 text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-colors"
                      data-testid="input-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                      data-testid="button-toggle-password"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between" data-testid="form-options">
                  <label className="flex items-center gap-2 cursor-pointer" data-testid="checkbox-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border border-slate-700 text-emerald-500 focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                    />
                    <span className="text-sm text-slate-400">Remember me</span>
                  </label>
                  <Link href="/forgot-password">
                    <a className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors" data-testid="link-forgot-password">
                      Forgot password?
                    </a>
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 disabled:bg-emerald-600 disabled:cursor-not-allowed transition-colors mt-6"
                  data-testid="button-login"
                >
                  {isLoading ? "Logging in..." : "Log in"}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              {/* PWA Install Promotion */}
              {showInstallPrompt && !installedAsApp && (
                <div className="mt-8 pt-8 border-t border-slate-700" data-testid="pwa-install-section">
                  <div className="bg-gradient-to-r from-emerald-500/10 to-slate-900 border border-emerald-500/30 rounded-lg p-5" data-testid="pwa-install-card">
                    <div className="flex items-start gap-4">
                      <Download className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-50 mb-2" data-testid="heading-install">
                          For the best experience, install FreelanceSkills as an app on your phone
                        </h3>
                        <p className="text-sm text-slate-400 mb-4" data-testid="text-install-desc">
                          Get home-screen access, faster loading, offline job browsing, instant match notifications, and quick apply — feels exactly like a native app.
                        </p>
                        <button
                          onClick={handleInstallClick}
                          className="w-full px-4 py-2 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 transition-colors text-sm"
                          data-testid="button-install-app"
                        >
                          Install as App
                        </button>
                      </div>
                      <button
                        onClick={() => setShowInstallPrompt(false)}
                        className="text-slate-400 hover:text-slate-300 transition-colors flex-shrink-0"
                        data-testid="button-close-install"
                        aria-label="Close install prompt"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sign Up Link */}
              <div className="mt-8 pt-6 border-t border-slate-800 text-center" data-testid="signup-section">
                <p className="text-slate-400 mb-4 text-sm">
                  Don't have an account?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/join/freelancer" asChild>
                    <Button
                      variant="outline"
                      className="flex-1 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                      data-testid="button-join-freelancer"
                    >
                      Join as Freelancer
                    </Button>
                  </Link>
                  <Link href="/join/client" asChild>
                    <Button
                      variant="outline"
                      className="flex-1 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                      data-testid="button-join-client"
                    >
                      Join as Client
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* PWA Fallback Modal */}
      {showFallbackModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="modal-pwa-fallback">
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

            <p className="text-slate-300 mb-6" data-testid="text-fallback-intro">
              Get the best experience with our app. Here's how to install on your device:
            </p>

            {/* Chrome/Android Instructions */}
            <div className="mb-6" data-testid="instructions-chrome">
              <h4 className="font-semibold text-emerald-400 mb-2">Chrome on Android</h4>
              <ol className="text-slate-400 text-sm space-y-1 ml-4 list-decimal">
                <li>Tap the menu (three dots) in the top-right corner</li>
                <li>Select "Install app" and confirm</li>
              </ol>
            </div>

            {/* Safari/iOS Instructions */}
            <div className="mb-6" data-testid="instructions-safari">
              <h4 className="font-semibold text-emerald-400 mb-2">Safari on iPhone/iPad</h4>
              <ol className="text-slate-400 text-sm space-y-1 ml-4 list-decimal">
                <li>Tap the Share button (square with arrow)</li>
                <li>Tap "Add to Home Screen"</li>
              </ol>
            </div>

            <button
              onClick={() => setShowFallbackModal(false)}
              className="w-full px-4 py-3 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 transition-colors"
              data-testid="button-got-it"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Trust Bar */}
      <div className="border-t border-slate-800 bg-slate-900/30 px-4 sm:px-6 lg:px-8 py-6" data-testid="section-trust-bar">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-slate-400 text-center lg:text-left" data-testid="text-trust-bar">
            <span className="flex flex-col lg:flex-row gap-2 lg:gap-4 items-center lg:items-start flex-wrap justify-center lg:justify-start">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-500" />
                Secure login
              </span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <span>POPIA compliant</span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <span>PayFast Escrow</span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <span>Industry-leading encryption</span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <span>Cape Town, South Africa</span>
            </span>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
