import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Shield, Zap, Globe, Briefcase, Users } from "lucide-react";
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  sendFirebaseResetEmail,
} from "@/lib/firebaseAuth";
import { syncSessionNow } from "@/hooks/use-auth";
import { isFirebaseConfigured, trackFirebaseEvent } from "@/lib/firebase";
import { upsertJobApplicationProfile } from "@/lib/firebaseProfiles";
import {
  clearPendingPlanSelection,
  consumePendingAuthRedirect,
  readPendingPlanSelection,
  savePendingAuthRedirect,
} from "@/lib/authRedirect";
import { activateFreePlan } from "@/lib/firebaseAppData";

export default function Auth() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const detectAuthMode = (): boolean => {
    if (typeof window === "undefined") return true;
    const params = new URLSearchParams(window.location.search);
    const mode = (params.get("mode") || "").toLowerCase();
    const path = window.location.pathname.toLowerCase();
    if (path === "/signup") return false;
    if (path === "/login") return true;
    if (mode === "register" || mode === "signup") return false;
    if (mode === "login") return true;
    return true;
  };

  const [isLogin, setIsLogin] = useState(detectAuthMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    userType: "client" as "client" | "freelancer" | "both",
    phoneNumber: "",
    country: "South Africa",
    location: "",
    title: "",
    skills: "",
    yearsExperience: "",
    bio: "",
  });

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLink, setResetLink] = useState("");

  const getSocialAuthErrorMessage = (error: Error) => {
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("auth/internal-error")) {
      return "Social sign-in is not fully configured yet. Use email/password for now, or enable the provider in Firebase Auth.";
    }
    if (msg.includes("auth/unauthorized-domain")) {
      return "This domain is not authorized in Firebase Auth. Add localhost to Authorized domains.";
    }
    if (msg.includes("auth/operation-not-allowed")) {
      return "This sign-in provider is disabled in Firebase Authentication settings.";
    }
    if (msg.includes("firebase: error")) {
      return "Social sign-in failed. Please try again, or continue with email/password.";
    }
    return error.message;
  };

  const resolvePostAuthDestination = () => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("redirect");
    const fromStorage = consumePendingAuthRedirect();
    return fromQuery || fromStorage || "/dashboard";
  };

  const continuePendingPlanIfNeeded = async (userId: string) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const queryPlan = params.get("plan");
    const pendingPlan = readPendingPlanSelection();
    const shouldActivateFreePlan =
      queryPlan === "free" || pendingPlan?.planType === "free";

    if (shouldActivateFreePlan) {
      await activateFreePlan(userId);
      clearPendingPlanSelection();
    }
  };

  const completeAuthSuccess = async (user: { id: string; email: string | null }) => {
    await continuePendingPlanIfNeeded(user.id);
    // Sync the server session BEFORE navigating so the first API call on the
    // next page is never a 401. This closes the Firebase → Express session gap.
    await syncSessionNow();
    const destination = resolvePostAuthDestination();
    toast({ title: "Signed in", description: `Welcome, ${user.email || "user"}` });
    navigate(destination);
  };

  const loginMutation = useMutation({
    mutationFn: loginWithEmail,
    onSuccess: async (user) => {
      trackFirebaseEvent("login", { method: "password" }).catch(() => {});
      queryClient.setQueryData(["/api/auth/user"], user);
      await completeAuthSuccess(user);
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerWithEmail,
    onSuccess: async (user) => {
      try {
        await upsertJobApplicationProfile({
          userId: user.id,
          email: user.email,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          userType: formData.userType,
          phoneNumber: "",
          country: "",
          location: "",
          title: "",
          bio: "",
          skills: [],
          yearsExperience: 0,
        });
      } catch {}

      trackFirebaseEvent("sign_up", { method: "password" }).catch(() => {});
      queryClient.setQueryData(["/api/auth/user"], user);

      const isFreelancer = formData.userType !== "client";
      toast({
        title: "Account created! 🎉",
        description: isFreelancer
          ? "Your account is ready. Let's build your profile with AI — takes 60 seconds."
          : "Welcome! You can now post jobs and find talent.",
      });

      await syncSessionNow();
      setTimeout(() => {
        navigate(isFreelancer ? "/onboarding?welcome=1" : "/post-job");
      }, 50);
    },
    onError: (error: Error) => {
      const msg = error.message || "";
      const isEmailExists =
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("email-already-in-use") ||
        ("code" in error && (error as any).code === "EMAIL_EXISTS");

      if (isEmailExists) {
        // Auto-switch to login tab and show a helpful message
        setIsLogin(true);
        toast({
          title: "Account already exists",
          description: "We switched you to Sign In — use your existing password, or reset it below.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: sendFirebaseResetEmail,
    onSuccess: () => {
      setResetLink("Check your email inbox for the reset link.");
      toast({ 
        title: "Reset email sent",
        description: "If an account exists with this email, a reset link has been sent to your inbox."
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const validateSignupProfile = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({ title: "Missing details", description: "First and last name are required.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      toast({
        title: "Sign-in unavailable",
        description: "Authentication is temporarily unavailable. Please try again later or contact support.",
        variant: "destructive",
      });
      return;
    }
    if (isForgotPassword) {
      forgotPasswordMutation.mutate(resetEmail);
    } else if (isLogin) {
      loginMutation.mutate({ email: formData.email, password: formData.password });
    } else {
      if (!validateSignupProfile()) return;
      registerMutation.mutate(formData);
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending || forgotPasswordMutation.isPending;

  const handleSocialSuccess = async ({ user, isNewUser }: { user: any; isNewUser: boolean }, method: string) => {
    trackFirebaseEvent(isNewUser ? "sign_up" : "login", { method }).catch(() => {});
    queryClient.setQueryData(["/api/auth/user"], user);
    await syncSessionNow();
    if (isNewUser) {
      toast({ title: "Account created! 🎉", description: "Let's build your profile — takes 60 seconds." });
      setTimeout(() => {
        navigate(formData.userType !== "client" ? "/onboarding?welcome=1" : "/post-job");
      }, 50);
    } else {
      await completeAuthSuccess(user);
    }
  };

  const socialAuthMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (result) => handleSocialSuccess(result, "google"),
    onError: (error: Error) => {
      toast({ title: "Sign-in failed", description: getSocialAuthErrorMessage(error), variant: "destructive" });
    },
  });


  useEffect(() => {
    setIsLogin(detectAuthMode());
    setIsForgotPassword(false);
  }, [location]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) {
      savePendingAuthRedirect(redirect);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/20 flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">
          <div className="hidden md:block space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Africa's #1 Skilled Freelance Marketplace
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 leading-tight max-w-xl">
                {isLogin
                  ? "Welcome back. Pick up where you left off."
                  : "Create your account in under a minute."}
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                {isLogin
                  ? "Use Google, LinkedIn, or email to get back into your dashboard."
                  : "Clients start posting immediately. Freelancers build a profile in 60 seconds."}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-blue-500/10 flex-shrink-0">
                  <Globe className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Simple start</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Create a client or freelancer profile without friction.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-amber-500/10 flex-shrink-0">
                  <Zap className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Instant next step</h3>
                  <p className="text-sm text-slate-400 mt-0.5">New users go straight to profile setup or posting a job.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 flex-shrink-0">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Secure by default</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Verified sessions, escrow-protected payments, and dispute resolution.</p>
                </div>
              </div>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {["K","Z","T","L","N"].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">{l}</div>
                ))}
              </div>
              <p className="text-sm text-slate-400"><span className="font-semibold text-white">500,000+</span> professionals already joined</p>
            </div>
          </div>

          <Card className="shadow-2xl border-slate-700/60 bg-slate-900/95 backdrop-blur" data-testid="auth-card">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex justify-center">
                  <BrandLogo imageClassName="h-10 max-w-[200px]" />
                </div>
                <h2 className="text-xl font-bold text-white" data-testid="text-auth-title">
                  {isForgotPassword ? "Reset Password" : (isLogin ? "Sign in" : "Create account")}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {isForgotPassword 
                    ? "Enter your email to receive a reset link" 
                    : (isLogin ? "Use Google, LinkedIn, or email" : "Choose client or freelancer, then continue")}
                </p>
              </div>

              {isForgotPassword ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="resetEmail" className="text-sm font-medium text-slate-300">Email Address</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
                        required
                        autoComplete="email"
                        data-testid="input-reset-email"
                      />
                    </div>
                  </div>

                  {resetLink && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-2">
                      <p className="text-sm text-emerald-400 font-medium" data-testid="link-reset-password">
                        {resetLink}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base gap-2 rounded-xl border-0"
                    disabled={isLoading}
                    data-testid="button-forgot-password-submit"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Get Reset Link
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setResetLink("");
                      }}
                      className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
                      data-testid="button-back-to-login"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* ── Social logins at top — one tap to join ─────────────── */}
                  <div className="space-y-2.5">
                    {/* Google */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 rounded-xl font-semibold flex items-center gap-3 px-4 border-slate-700 bg-white/[0.03] hover:border-slate-500 hover:bg-white/[0.07] text-slate-100 transition-all"
                      onClick={() => {
                        if (!isFirebaseConfigured) {
                          toast({ title: "Firebase not configured", description: "Set VITE_FIREBASE_* and restart.", variant: "destructive" });
                          return;
                        }
                        socialAuthMutation.mutate();
                      }}
                      disabled={socialAuthMutation.isPending}
                      data-testid="button-auth-google"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="flex-1 text-left text-sm">{isLogin ? "Continue with Google" : "Start with Google"}</span>
                      {socialAuthMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 rounded-xl font-semibold flex items-center gap-3 px-4 border-[#0077B5]/30 text-[#0077B5] hover:bg-[#0077B5]/8 hover:border-[#0077B5]/60 transition-all"
                      onClick={() => { window.location.href = "/api/auth/linkedin"; }}
                      data-testid="button-auth-linkedin"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#0077B5" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="flex-1 text-left text-sm">{isLogin ? "Continue with LinkedIn" : "Start with LinkedIn"}</span>
                    </Button>

                    <div className="relative py-0.5">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase tracking-wide">
                        <span className="bg-slate-900 px-3 text-slate-500">Or use email</span>
                      </div>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium text-slate-300">First Name</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="pl-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
                            required
                            data-testid="input-first-name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium text-slate-300">Last Name</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="pl-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
                            required
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-3" data-testid="user-type-selector">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: "freelancer" })}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.userType === "freelancer" ? "border-emerald-500 bg-emerald-500/10 shadow-sm" : "border-slate-700 hover:border-slate-500"}`}
                        data-testid="btn-type-freelancer"
                      >
                        <Briefcase className={`w-5 h-5 mb-2 ${formData.userType === "freelancer" ? "text-emerald-400" : "text-slate-500"}`} />
                        <div className="font-semibold text-sm text-white">Freelancer</div>
                        <div className="text-xs text-slate-400 mt-0.5">Find work</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: "client" })}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.userType === "client" ? "border-blue-500 bg-blue-500/10 shadow-sm" : "border-slate-700 hover:border-slate-500"}`}
                        data-testid="btn-type-client"
                      >
                        <Users className={`w-5 h-5 mb-2 ${formData.userType === "client" ? "text-blue-400" : "text-slate-500"}`} />
                        <div className="font-semibold text-sm text-white">Client</div>
                        <div className="text-xs text-slate-400 mt-0.5">Hire talent</div>
                      </button>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
                        required
                        autoComplete="email"
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-300">Password</Label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
                          data-testid="button-forgot-password"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={isLogin ? "Enter your password" : "Min 6 characters"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
                        required
                        minLength={6}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base gap-2 rounded-xl border-0 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    disabled={isLoading}
                    data-testid="button-auth-submit"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-slate-600 mt-1">
                    Secured with Firebase Auth · 256-bit encryption
                  </p>
                </form>
              )}

              {!isForgotPassword && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
                    data-testid="button-toggle-auth-mode"
                  >
                    {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
