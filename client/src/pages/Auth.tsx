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
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Shield, Zap, Globe } from "lucide-react";
import {
  loginWithEmail,
  loginWithGoogle,
  loginWithFacebook,
  loginWithApple,
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
    userType: "freelancer" as "client" | "freelancer" | "both",
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
      const skillList = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Profile write is best-effort — if it fails (e.g. Firestore permissions race
      // condition right after account creation) we still complete the auth flow.
      // The user will be directed to the onboarding wizard to fill in their profile.
      try {
        await upsertJobApplicationProfile({
          userId: user.id,
          email: user.email,
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          userType: formData.userType,
          phoneNumber: formData.phoneNumber.trim(),
          country: formData.country.trim(),
          location: formData.location.trim(),
          title: formData.title.trim(),
          bio: formData.bio.trim(),
          skills: skillList,
          yearsExperience: Number(formData.yearsExperience),
        });
      } catch (profileErr) {
        // Non-fatal — profile can be completed in onboarding wizard
        console.warn("[Auth] Profile save deferred to onboarding:", profileErr);
      }

      trackFirebaseEvent("sign_up", { method: "password" }).catch(() => {});
      queryClient.setQueryData(["/api/auth/user"], user);

      const isFreelancer = formData.userType !== "client";
      toast({
        title: "Account created! 🎉",
        description: isFreelancer
          ? "Your account is ready. Let's build your profile with AI — takes 60 seconds."
          : "Welcome! You can now post jobs and find talent.",
      });

      // Sync session BEFORE navigating so /cv-upload's first API call is never 401
      await syncSessionNow();
      // Freelancers → AI profile builder; clients → post a job
      navigate(isFreelancer ? "/cv-upload?welcome=1" : "/post-job");
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
    const isClient = formData.userType === "client";

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({ title: "Missing details", description: "First and last name are required.", variant: "destructive" });
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      toast({ title: "Missing details", description: "Phone number is required.", variant: "destructive" });
      return false;
    }
    if (!formData.location.trim()) {
      toast({ title: "Missing details", description: "Location is required.", variant: "destructive" });
      return false;
    }

    if (!isClient) {
      const skillsCount = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean).length;
      const years = Number(formData.yearsExperience);

      if (!formData.title.trim()) {
        toast({ title: "Missing details", description: "Professional title is required.", variant: "destructive" });
        return false;
      }
      if (skillsCount < 2) {
        toast({ title: "Missing details", description: "Add at least 2 skills (comma separated).", variant: "destructive" });
        return false;
      }
      if (Number.isNaN(years) || years < 0 || years > 50) {
        toast({ title: "Invalid value", description: "Years of experience must be between 0 and 50.", variant: "destructive" });
        return false;
      }
      if (formData.bio.trim().length < 40) {
        toast({ title: "Missing details", description: "Bio must be at least 40 characters for job applications.", variant: "destructive" });
        return false;
      }
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

  const socialAuthMutation = useMutation({
    mutationFn: async () => {
      return loginWithGoogle();
    },
    onSuccess: async (user) => {
      if (!isLogin) {
        const skillList = formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        upsertJobApplicationProfile({
          userId: user.id,
          email: user.email,
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          userType: formData.userType,
          phoneNumber: formData.phoneNumber.trim(),
          country: formData.country.trim(),
          location: formData.location.trim(),
          title: formData.title.trim(),
          bio: formData.bio.trim(),
          skills: skillList,
          yearsExperience: Number(formData.yearsExperience),
        }).catch(() => {});
        trackFirebaseEvent("sign_up", { method: "social" }).catch(() => {});
      } else {
        trackFirebaseEvent("login", { method: "social" }).catch(() => {});
      }
      queryClient.setQueryData(["/api/auth/user"], user);
      await completeAuthSuccess(user);
    },
    onError: (error: Error) => {
      toast({
        title: "Social sign-in failed",
        description: getSocialAuthErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  async function handleSocialAuth(provider: "facebook" | "apple") {
    if (!isFirebaseConfigured) {
      toast({ title: "Firebase not configured", description: "Set VITE_FIREBASE_* environment variables and restart.", variant: "destructive" });
      return;
    }
    if (!isLogin && !validateSignupProfile()) return;
    try {
      const user = provider === "facebook" ? await loginWithFacebook() : await loginWithApple();
      if (!isLogin) {
        const skillList = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
        upsertJobApplicationProfile({
          userId: user.id, email: user.email,
          firstName: formData.firstName || null, lastName: formData.lastName || null,
          userType: formData.userType, phoneNumber: formData.phoneNumber.trim(),
          country: formData.country.trim(), location: formData.location.trim(),
          title: formData.title.trim(), bio: formData.bio.trim(),
          skills: skillList, yearsExperience: Number(formData.yearsExperience),
        }).catch(() => {});
        trackFirebaseEvent("sign_up", { method: provider }).catch(() => {});
      } else {
        trackFirebaseEvent("login", { method: provider }).catch(() => {});
      }
      queryClient.setQueryData(["/api/auth/user"], user);
      await completeAuthSuccess(user);
    } catch (error: any) {
      toast({ title: `${provider === "facebook" ? "Facebook" : "Apple"} sign-in failed`, description: getSocialAuthErrorMessage(error), variant: "destructive" });
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                {isLogin ? "Welcome back" : "Join FreelanceSkills"}
              </h1>
              <p className="text-lg text-muted-foreground">
                {isLogin
                  ? "Sign in to access your dashboard, messages, and opportunities."
                  : "Create your account and start connecting with opportunities worldwide."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border shadow-sm">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Global Opportunities</h3>
                  <p className="text-sm text-muted-foreground">Access thousands of jobs from South Africa and worldwide</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border shadow-sm">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Zap className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">AI-Powered Matching</h3>
                  <p className="text-sm text-muted-foreground">Our AI finds the perfect opportunities for your skills</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border shadow-sm">
                <div className="p-2 rounded-lg bg-green-50">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Secure & Trusted</h3>
                  <p className="text-sm text-muted-foreground">Escrow-protected payments and verified professionals</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="shadow-xl border-border" data-testid="auth-card">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex justify-center">
                  <BrandLogo imageClassName="h-12 max-w-[220px]" />
                </div>
                <h2 className="text-2xl font-bold text-card-foreground" data-testid="text-auth-title">
                  {isForgotPassword ? "Reset Password" : (isLogin ? "Sign In" : "Create Account")}
                </h2>
                <p className="text-sm text-card-foreground/75 mt-1">
                  {isForgotPassword 
                    ? "Enter your email to receive a reset link" 
                    : (isLogin ? "Enter your credentials to continue" : "Fill in your details to get started")}
                </p>
              </div>

              {isForgotPassword ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="resetEmail" className="text-sm font-medium text-card-foreground">Email Address</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-card-foreground/60" />
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                        required
                        data-testid="input-reset-email"
                      />
                    </div>
                  </div>

                  {resetLink && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                      <p className="text-sm text-blue-800 font-medium" data-testid="link-reset-password">
                        {resetLink}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 font-semibold text-base gap-2 rounded-xl"
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
                      className="text-sm text-primary hover:underline font-medium"
                      data-testid="button-back-to-login"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium text-card-foreground">First Name</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-card-foreground/60" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="pl-10"
                            required
                            data-testid="input-first-name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium text-card-foreground">Last Name</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-card-foreground/60" />
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="pl-10"
                            required
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isLogin && (
                    <>
                      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-card-foreground/75">
                        Application Profile (required): this information is saved for job applications.
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="userType" className="text-sm font-medium text-card-foreground">Account Type</Label>
                          <select
                            id="userType"
                            value={formData.userType}
                            onChange={(e) => setFormData({ ...formData, userType: e.target.value as "client" | "freelancer" | "both" })}
                            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            data-testid="select-user-type"
                          >
                            <option value="freelancer">Freelancer</option>
                            <option value="client">Client</option>
                            <option value="both">Both</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="phoneNumber" className="text-sm font-medium text-card-foreground">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            placeholder="+27..."
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            required
                            data-testid="input-phone-number"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="country" className="text-sm font-medium text-card-foreground">Country</Label>
                          <Input
                            id="country"
                            placeholder="South Africa"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            required
                            data-testid="input-country"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location" className="text-sm font-medium text-card-foreground">City / Location</Label>
                          <Input
                            id="location"
                            placeholder="Cape Town"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                            data-testid="input-location"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="title" className="text-sm font-medium text-card-foreground">Professional Title</Label>
                          <Input
                            id="title"
                            placeholder="React Developer"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            data-testid="input-title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="yearsExperience" className="text-sm font-medium text-card-foreground">Years of Experience</Label>
                          <Input
                            id="yearsExperience"
                            type="number"
                            min={0}
                            max={50}
                            placeholder="3"
                            value={formData.yearsExperience}
                            onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                            required
                            data-testid="input-years-experience"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="skills" className="text-sm font-medium text-card-foreground">Key Skills</Label>
                        <Input
                          id="skills"
                          placeholder="React, TypeScript, Node.js"
                          value={formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          required
                          data-testid="input-skills"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bio" className="text-sm font-medium text-card-foreground">Short Bio</Label>
                        <textarea
                          id="bio"
                          placeholder="Tell clients about your experience, strengths, and what kind of jobs you are looking for."
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          className="mt-1 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                          data-testid="input-bio"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-card-foreground">Email Address</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-card-foreground/60" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-card-foreground">Password</Label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-xs text-primary hover:underline font-medium"
                          data-testid="button-forgot-password"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-card-foreground/60" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={isLogin ? "Enter your password" : "Min 6 characters"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-card-foreground/60 hover:text-card-foreground"
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 font-semibold text-base gap-2 rounded-xl"
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

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wide">
                      <span className="bg-card px-2 text-card-foreground/70">Or continue with</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Google — primary social CTA */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 rounded-xl font-semibold flex items-center gap-3 px-4 border-border hover:border-slate-400 hover:bg-muted/40 transition-all"
                      onClick={() => {
                        if (!isFirebaseConfigured) {
                          toast({
                            title: "Firebase not configured",
                            description: "Please set VITE_FIREBASE_* values and restart the dev server.",
                            variant: "destructive",
                          });
                          return;
                        }
                        if (!isLogin && !validateSignupProfile()) return;
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
                      <span className="flex-1 text-left text-sm">{isLogin ? "Sign in with Google" : "Sign up with Google"}</span>
                      {socialAuthMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Facebook */}
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl font-medium flex items-center gap-2 px-3 text-sm text-[#1877F2] border-[#1877F2]/25 hover:bg-[#1877F2]/8 hover:border-[#1877F2]/50 transition-all"
                        onClick={() => handleSocialAuth("facebook")}
                        data-testid="button-auth-facebook"
                      >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-xs font-semibold">Facebook</span>
                      </Button>

                      {/* Apple */}
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl font-medium flex items-center gap-2 px-3 text-sm text-foreground border-border hover:bg-muted/40 transition-all"
                        onClick={() => handleSocialAuth("apple")}
                        data-testid="button-auth-apple"
                      >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
                        </svg>
                        <span className="text-xs font-semibold">Apple</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground/60 mt-1">
                    Secured with Firebase Auth · 256-bit encryption
                  </p>
                </form>
              )}

              {!isForgotPassword && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-primary hover:underline font-medium"
                    data-testid="button-toggle-auth-mode"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
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
