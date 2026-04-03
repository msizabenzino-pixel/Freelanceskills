import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Shield, Zap, Globe } from "lucide-react";
import {
  loginWithApple,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  sendFirebaseResetEmail,
} from "@/lib/firebaseAuth";
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

      trackFirebaseEvent("sign_up", { method: "password" }).catch(() => {});
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({ title: "Account created!", description: "Profile saved and ready for job applications." });
      await completeAuthSuccess(user);
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: sendFirebaseResetEmail,
    onSuccess: () => {
      setResetLink("Check your email inbox for the reset link.");
      toast({ 
        title: "Reset email sent",
        description: "If this email exists, Firebase has sent a password reset link."
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const validateSignupProfile = (): boolean => {
    const skillsCount = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean).length;
    const years = Number(formData.yearsExperience);

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
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      toast({
        title: "Firebase not configured",
        description: "Please set VITE_FIREBASE_* values and restart the dev server.",
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
    mutationFn: async (provider: "google" | "apple") => {
      if (provider === "google") return loginWithGoogle();
      return loginWithApple();
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
      toast({ title: "Social sign-in failed", description: error.message, variant: "destructive" });
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
                <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  F
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl font-medium"
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
                        socialAuthMutation.mutate("google");
                      }}
                      disabled={socialAuthMutation.isPending}
                      data-testid="button-auth-google"
                    >
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white border border-border text-[11px] font-bold text-slate-900">
                        G
                      </span>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl font-medium"
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
                        socialAuthMutation.mutate("apple");
                      }}
                      disabled={socialAuthMutation.isPending}
                      data-testid="button-auth-apple"
                    >
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                        A
                      </span>
                      Apple
                    </Button>
                  </div>
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
