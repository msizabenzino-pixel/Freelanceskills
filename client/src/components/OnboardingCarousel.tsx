import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight, ChevronLeft, Check, Briefcase, Users, Zap, Shield,
  DollarSign, Tag, Star, Building2, Code2, Palette, Megaphone,
  Database, Wrench, BookOpen, X, Link as LinkIcon, MapPin, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Role = "freelancer" | "client" | null;

interface Slide {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const slides: Slide[] = [
  {
    title: "Welcome to FreelanceSkills",
    description: "Africa's all-in-one freelance platform — find work, hire talent, and grow your career across every industry.",
    icon: <Zap className="h-16 w-16 text-primary" />,
    gradient: "from-primary/10 to-emerald-500/10",
  },
  {
    title: "Verified & Trusted",
    description: "Every profile is background-checked and skill-verified. Verified freelancers earn 3× more invitations and get paid faster.",
    icon: <Shield className="h-16 w-16 text-emerald-500" />,
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    title: "Secure Escrow Payments",
    description: "Funds are held in escrow and released only when work is approved — protecting both sides on every project.",
    icon: <Check className="h-16 w-16 text-blue-500" />,
    gradient: "from-blue-500/10 to-indigo-500/10",
  },
];

const SKILL_CATEGORIES = [
  { label: "Development & Tech", icon: Code2, skills: ["React", "Node.js", "Python", "SQL", "TypeScript", "Flutter", "Java", "PHP"] },
  { label: "Design & Creative", icon: Palette, skills: ["Figma", "UI/UX", "Logo Design", "Branding", "Motion Graphics", "Illustration"] },
  { label: "Marketing & Growth", icon: Megaphone, skills: ["SEO", "Google Ads", "Social Media", "Email Marketing", "Copywriting", "Analytics"] },
  { label: "Data & AI", icon: Database, skills: ["Data Analysis", "Machine Learning", "Power BI", "Excel", "Tableau", "Python ML"] },
  { label: "Trades & Field", icon: Wrench, skills: ["Plumbing", "Electrical", "HVAC", "Construction", "Carpentry", "Safety Officer"] },
  { label: "Business & Finance", icon: Building2, skills: ["Bookkeeping", "Tax", "Project Management", "Business Analysis", "HR"] },
  { label: "Education & Writing", icon: BookOpen, skills: ["Tutoring", "Content Writing", "Editing", "Translation", "Research"] },
];

const RATE_PRESETS = [
  { label: "Entry Level", range: "R150–R350/hr", min: 150 },
  { label: "Mid Level", range: "R350–R700/hr", min: 350 },
  { label: "Senior Level", range: "R700–R1,500/hr", min: 700 },
  { label: "Expert", range: "R1,500+/hr", min: 1500 },
];

const BUDGET_RANGES = [
  { label: "Small project", range: "Under R5,000" },
  { label: "Medium project", range: "R5,000–R25,000" },
  { label: "Large project", range: "R25,000–R100,000" },
  { label: "Enterprise", range: "R100,000+" },
];

const HIRE_TYPES = [
  { label: "Freelance / Gig", icon: Zap },
  { label: "Part-time contract", icon: Briefcase },
  { label: "Full-time hire", icon: Users },
  { label: "Ongoing retainer", icon: Star },
];

const AUTH_PATHS = ["/login", "/auth", "/onboarding", "/profile-builder", "/signup"];
const HOME_ONLY = true; // Only show carousel on the home page ("/"), never block content pages

type Step = "slides" | "role" | "skills" | "rate" | "location" | "bio" | "portfolio" | "verify" | "hire_type" | "budget";

export function OnboardingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<Step>("slides");
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const profileCheckedRef = useRef(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Freelancer state
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [customSkill, setCustomSkill] = useState("");
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(["", "", ""]);
  const [portfolioUrlErrors, setPortfolioUrlErrors] = useState<boolean[]>([false, false, false]);

  // Client state
  const [selectedHireType, setSelectedHireType] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    // Never block auth pages or CV upload flow
    if (AUTH_PATHS.some((p) => path.startsWith(p))) return;
    // Only show carousel on the home page — never block /jobs, /find-talent, etc.
    if (HOME_ONLY && path !== "/") return;

    // Fast path: already dismissed/completed
    if (localStorage.getItem("onboarding_completed")) return;

    // Wait until auth state is resolved before deciding
    if (isLoading) return;

    // Clean up any stale timeout on re-run
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    // For authenticated users: check the DB before showing.
    // If they already have a real profile, mark done and skip.
    if (isAuthenticated && !profileCheckedRef.current) {
      profileCheckedRef.current = true;
      apiFetch("/api/profile")
        .then(r => {
          if (r.status === 401) {
            // Session expired/unauthenticated — don't show carousel
            return { __skip: true };
          }
          if (!r.ok) {
            // Other API errors — don't annoy user with carousel
            return { __skip: true };
          }
          return r.json();
        })
        .then(profile => {
          if (profile && (profile as any).__skip) return;
          if (profile && profile.id) {
            localStorage.setItem("onboarding_completed", "true");
            setIsVisible(false);
          } else {
            showTimeoutRef.current = setTimeout(() => setIsVisible(true), 800);
          }
        })
        .catch(() => {
          // Network error — don't show carousel
          setIsVisible(false);
        });
      return;
    }

    // Unauthenticated visitors always see the intro
    if (!isAuthenticated) {
      showTimeoutRef.current = setTimeout(() => setIsVisible(true), 800);
    }

    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
    };
  }, [isAuthenticated, isLoading]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : prev.length < 10 ? [...prev, skill] : prev
    );
  };

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !selectedSkills.includes(s) && selectedSkills.length < 10) {
      setSelectedSkills(prev => [...prev, s]);
      setCustomSkill("");
    }
  };

  const handleComplete = async () => {
    // 1. Persist preferences locally (always works, even offline)
    localStorage.setItem("onboarding_completed", "true");
    if (selectedRole) localStorage.setItem("user_role_preference", selectedRole);
    if (selectedSkills.length) localStorage.setItem("onboarding_skills", JSON.stringify(selectedSkills));
    if (selectedRate) localStorage.setItem("onboarding_rate", selectedRate);
    if (location) localStorage.setItem("onboarding_location", location);
    if (bio) localStorage.setItem("onboarding_bio", bio);
    if (headline) localStorage.setItem("onboarding_headline", headline);
    const filledUrls = portfolioUrls.filter(u => u.trim());
    if (filledUrls.length) localStorage.setItem("onboarding_portfolio", JSON.stringify(filledUrls));

    // 2. If authenticated, persist to the DB so Dashboard never shows false "No Profile"
    if (isAuthenticated) {
      try {
        const { apiPost } = await import("@/lib/api");
        await apiPost("/api/onboarding/complete", {
          role: selectedRole || "client",
          skills: selectedSkills,
          rateMinCents: selectedRate ? Number(selectedRate) : 0,
          location: location === "Other" ? customLocation || "Other" : location,
          bio,
          headline,
          portfolioUrls: filledUrls,
        });
      } catch (err: any) {
        console.warn("[onboarding] DB save failed:", err?.message || err);
        // Non-fatal — still navigate, but warn user data is local only
        toast({ variant: "destructive", title: "Profile save failed", description: "Your choices were saved locally. Please try again later." });
      }
    }

    // 3. Navigate
    setIsVisible(false);
    setTimeout(() => {
      if (selectedRole === "freelancer") window.location.assign("/cv-upload");
      else if (selectedRole === "client") window.location.assign("/post-job");
    }, 200);
  };

  const handleNext = () => {
    if (step === "slides") {
      if (currentSlide < slides.length - 1) setCurrentSlide(p => p + 1);
      else setStep("role");
    } else if (step === "role") {
      if (selectedRole === "freelancer") setStep("skills");
      else if (selectedRole === "client") setStep("hire_type");
    } else if (step === "skills") {
      setStep("rate");
    } else if (step === "rate") {
      setStep("location");
    } else if (step === "location") {
      setStep("bio");
    } else if (step === "bio") {
      setStep("portfolio");
    } else if (step === "portfolio") {
      handleComplete();
    } else if (step === "hire_type") {
      setStep("budget");
    } else if (step === "budget") {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (step === "role") { setStep("slides"); setCurrentSlide(slides.length - 1); }
    else if (step === "skills") setStep("role");
    else if (step === "rate") setStep("skills");
    else if (step === "location") setStep("rate");
    else if (step === "bio") setStep("location");
    else if (step === "portfolio") setStep("bio");
    else if (step === "hire_type") setStep("role");
    else if (step === "budget") setStep("hire_type");
    else if (step === "slides" && currentSlide > 0) setCurrentSlide(p => p - 1);
  };

  const canGoNext = () => {
    if (step === "slides") return true;
    if (step === "role") return !!selectedRole;
    if (step === "skills") return selectedSkills.length >= 1;
    if (step === "rate") return !!selectedRate;
    if (step === "location") return location.length > 0;
    if (step === "bio") return headline.length > 0;
    if (step === "portfolio") return true;
    if (step === "hire_type") return !!selectedHireType;
    if (step === "budget") return !!selectedBudget;
    return false;
  };

  // Calculate progress dot count + active index
  const FREELANCER_STEPS: Step[] = ["slides", "role", "skills", "rate", "location", "bio", "portfolio"];
  const CLIENT_STEPS: Step[] = ["slides", "role", "hire_type", "budget"];
  const allSteps = selectedRole === "client" ? CLIENT_STEPS : FREELANCER_STEPS;
  const totalDots = slides.length + (allSteps.length - 1);
  const activeDot = step === "slides" ? currentSlide : slides.length + allSteps.indexOf(step) - 1;

  const reduced = useReducedMotion();

  if (!isVisible) return null;

  const motionProps = reduced ? { initial: false, animate: false, exit: false, transition: { duration: 0 } } : {};
  const slideProps = reduced ? { initial: false, animate: false, exit: false, transition: { duration: 0 } } : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.25 } };
  const stepProps = reduced ? { initial: false, animate: false, exit: false, transition: { duration: 0 } } : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.25 } };
  const progressPercent = Math.max(0, Math.min(100, (activeDot / Math.max(1, totalDots - 1)) * 100));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[150] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        {...motionProps}
      >
        <motion.div
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-2xl"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          data-testid="onboarding-carousel"
        >
          <div className="p-8 md:p-10">
            {/* Progress bar */}
            <div className="mb-6" aria-label={`Onboarding progress: ${Math.round(progressPercent)}% complete`}>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-semibold">Step {activeDot + 1} of {totalDots}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <AnimatePresence mode="wait">

              {/* ── Intro slides ────────────────────────────── */}
              {step === "slides" && (
                <motion.div
                  key={`slide-${currentSlide}`}
                  className="flex flex-col items-center text-center"
                  data-testid={`onboarding-slide-${currentSlide}`}
                  {...slideProps}
                >
                  <div className={cn("mb-8 flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br", slides[currentSlide].gradient)}>
                    {slides[currentSlide].icon}
                  </div>
                  <h2 className="mb-3 text-2xl font-bold tracking-tight">{slides[currentSlide].title}</h2>
                  <p className="text-base text-muted-foreground leading-relaxed">{slides[currentSlide].description}</p>
                </motion.div>
              )}

              {/* ── Role selection ─────────────────────────── */}
              {step === "role" && (
                <motion.div
                  key="role-step"
                  className="flex flex-col items-center text-center"
                  data-testid="onboarding-role-step"
                  {...slideProps}
                >
                  <h2 className="mb-2 text-2xl font-bold tracking-tight">What brings you here?</h2>
                  <p className="mb-8 text-muted-foreground text-sm">We'll personalise your experience based on your goal.</p>
                  <div className="grid w-full grid-cols-2 gap-4">
                    {[
                      { role: "freelancer" as Role, icon: Briefcase, title: "I'm a Freelancer", sub: "Find work & get paid" },
                      { role: "client" as Role, icon: Users, title: "I'm Hiring", sub: "Post jobs & hire talent" },
                    ].map(({ role, icon: Icon, title, sub }) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                          "group flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:border-primary hover:bg-primary/5",
                          selectedRole === role ? "border-primary bg-primary/10" : "border-border"
                        )}
                        data-testid={`onboarding-role-${role}`}
                      >
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                          selectedRole === role ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Freelancer: skills ────────────────────── */}
              {step === "skills" && (
                <motion.div
                  key="skills-step"
                  data-testid="onboarding-skills-step"
                  {...stepProps}
                >
                  <h2 className="text-xl font-bold mb-1">What are your top skills?</h2>
                  <p className="text-sm text-muted-foreground mb-4">Pick up to 10 — we'll match you to the right jobs first.</p>

                  {/* Selected skill chips */}
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                      {selectedSkills.map(s => (
                        <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium" data-testid={`skill-chip-${s}`}>
                          {s}
                          <button onClick={() => toggleSkill(s)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Category browser */}
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {SKILL_CATEGORIES.map(({ label, icon: Icon, skills }) => (
                      <div key={label}>
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === label ? null : label)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium text-left transition-colors"
                          data-testid={`skill-category-${label}`}
                        >
                          <Icon className="w-4 h-4 text-primary shrink-0" />
                          <span className="flex-1">{label}</span>
                          <span className="text-xs text-muted-foreground">{expandedCategory === label ? "▲" : "▼"}</span>
                        </button>
                        {expandedCategory === label && (
                          <div className="flex flex-wrap gap-1.5 px-3 py-2">
                            {skills.map(skill => (
                              <button
                                key={skill}
                                onClick={() => toggleSkill(skill)}
                                className={cn(
                                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                                  selectedSkills.includes(skill)
                                    ? "bg-primary/15 border-primary/40 text-primary"
                                    : "bg-muted border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                                )}
                                data-testid={`skill-option-${skill}`}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Custom skill input */}
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Add a custom skill…"
                      value={customSkill}
                      onChange={e => setCustomSkill(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                      className="h-8 text-sm"
                      data-testid="input-custom-skill"
                    />
                    <Button size="sm" variant="outline" onClick={addCustomSkill} className="h-8 px-3" data-testid="button-add-skill">
                      <Tag className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{selectedSkills.length}/10 selected</p>
                </motion.div>
              )}

              {/* ── Freelancer: rate ─────────────────────── */}
              {step === "rate" && (
                <motion.div
                  key="rate-step"
                  data-testid="onboarding-rate-step"
                  {...stepProps}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-bold">What's your rate?</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Clients will see this on your profile. You can always adjust it later.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {RATE_PRESETS.map(({ label, range, min }) => (
                      <button
                        key={label}
                        onClick={() => setSelectedRate(`${min}`)}
                        className={cn(
                          "flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all text-left hover:border-primary hover:bg-primary/5",
                          selectedRate === `${min}` ? "border-primary bg-primary/10" : "border-border"
                        )}
                        data-testid={`rate-option-${label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{range}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Verified freelancers at all levels earn consistently on FreelanceSkills.
                  </p>
                </motion.div>
              )}

              {/* ── Freelancer: portfolio ────────────────── */}
              {step === "location" && (
                <motion.div
                  key="location-step"
                  data-testid="onboarding-location-step"
                  {...stepProps}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-bold">Where are you based?</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Clients prefer local talent. You can work remotely too.</p>
                  <div className="space-y-3">
                    {["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "Remote / Anywhere", "Other"].map(city => (
                      <button
                        key={city}
                        onClick={() => {
                          setLocation(city);
                          if (city === "Other") { setShowCustomLocation(true); } else { setShowCustomLocation(false); }
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left hover:border-primary hover:bg-primary/5",
                          location === city ? "border-primary bg-primary/10" : "border-border"
                        )}
                      >
                        <MapPin className={cn("w-4 h-4", location === city ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm font-medium">{city}</span>
                      </button>
                    ))}
                    {showCustomLocation && (
                      <div className="mt-2">
                        <Input
                          placeholder="e.g. Polokwane, East London, Accra..."
                          value={customLocation}
                          onChange={e => setCustomLocation(e.target.value)}
                          className="h-10"
                          data-testid="input-custom-location"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Tell us where you are — we'll match you with nearby clients.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === "bio" && (
                <motion.div
                  key="bio-step"
                  data-testid="onboarding-bio-step"
                  {...stepProps}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-bold">Tell clients about yourself</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">A strong headline and bio get you 3x more invites.</p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="onboarding-headline" className="text-xs font-semibold text-muted-foreground mb-1.5 block">Professional Headline</label>
                      <span id="bio-label" className="sr-only">Bio about your professional experience</span>
                      <Input
                        id="onboarding-headline"
                        placeholder="e.g. Senior React Developer & UI Designer"
                        value={headline}
                        onChange={e => setHeadline(e.target.value)}
                        className="h-10"
                        data-testid="input-headline"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Bio (2+ sentences)</label>
                      <textarea
                        id="onboarding-bio"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="I help startups build fast, beautiful web apps..."
                        className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        data-testid="input-bio"
                        aria-labelledby="bio-label"
                        aria-describedby="bio-hint"
                      />
                      <span id="bio-hint" className="sr-only">Write a short bio about your professional experience. Minimum 2 sentences recommended.</span>
                      <p className="text-xs text-muted-foreground mt-1">{bio.length} characters</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "portfolio" && (
                <motion.div
                  key="portfolio-step"
                  data-testid="onboarding-portfolio-step"
                  {...stepProps}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <LinkIcon className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-bold">Add your portfolio</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">Optional — paste links to your GitHub, Behance, Dribbble, or any project URL. You can always add more later.</p>
                  <div className="space-y-3">
                    {portfolioUrls.map((url, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                          <Input
                            placeholder={i === 0 ? "https://github.com/yourname" : i === 1 ? "https://behance.net/yourname" : "https://yourproject.com"}
                            value={url}
                            onChange={e => {
                              const updated = [...portfolioUrls];
                              updated[i] = e.target.value;
                              setPortfolioUrls(updated);
                              const isValid = !e.target.value || e.target.value.match(/^https?:\/\/.+/);
                              const errs = [...portfolioUrlErrors]; errs[i] = !isValid; setPortfolioUrlErrors(errs);
                            }}
                            className={cn("h-9 text-sm", portfolioUrlErrors[i] && "border-red-500 focus-visible:ring-red-500")}
                            data-testid={`portfolio-url-${i}`}
                          />
                        </div>
                        {portfolioUrlErrors[i] && (
                          <p className="text-xs text-red-500 ml-8 mt-1">Please enter a valid URL (https://...)</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Freelancers with portfolio links get <span className="text-emerald-500 font-semibold">4× more</span> client views.
                  </p>
                </motion.div>
              )}

              {/* ── Client: hire type ────────────────────── */}
              {step === "hire_type" && (
                <motion.div
                  key="hire-type-step"
                  data-testid="onboarding-hire-type-step"
                  {...stepProps}
                >
                  <h2 className="text-xl font-bold mb-1">What kind of help do you need?</h2>
                  <p className="text-sm text-muted-foreground mb-6">This helps us show you the right freelancers.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {HIRE_TYPES.map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() => setSelectedHireType(label)}
                        className={cn(
                          "flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left hover:border-primary hover:bg-primary/5",
                          selectedHireType === label ? "border-primary bg-primary/10" : "border-border"
                        )}
                        data-testid={`hire-type-${label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Icon className={cn("w-5 h-5", selectedHireType === label ? "text-primary" : "text-muted-foreground")} />
                        <p className="font-semibold text-sm leading-tight">{label}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Client: budget ──────────────────────── */}
              {step === "budget" && (
                <motion.div
                  key="budget-step"
                  data-testid="onboarding-budget-step"
                  {...stepProps}
                >
                  <h2 className="text-xl font-bold mb-1">What's your budget range?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Helps us match you to freelancers in your range.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {BUDGET_RANGES.map(({ label, range }) => (
                      <button
                        key={label}
                        onClick={() => setSelectedBudget(label)}
                        className={cn(
                          "flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all text-left hover:border-primary hover:bg-primary/5",
                          selectedBudget === label ? "border-primary bg-primary/10" : "border-border"
                        )}
                        data-testid={`budget-${label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{range}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Progress dots + nav */}
            <div className="mt-8 flex flex-col items-center gap-5">
              <div className="flex gap-1.5">
                {Array.from({ length: totalDots }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === activeDot ? "bg-primary w-6" : i < activeDot ? "bg-primary/40 w-3" : "bg-muted w-3"
                    )}
                  />
                ))}
              </div>

              <div className="flex w-full items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem("onboarding_completed", "true");
                    setIsVisible(false);
                  }}
                  data-testid="onboarding-skip"
                  className="text-muted-foreground"
                >
                  Skip
                </Button>

                <div className="flex gap-2">
                  {(step !== "slides" || currentSlide > 0) && (
                    <Button variant="outline" size="icon" onClick={handlePrev} data-testid="onboarding-prev">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  {(step === "portfolio" || step === "budget") ? (
                    <Button
                      onClick={handleComplete}
                      disabled={!canGoNext()}
                      className="gap-2 px-6"
                      data-testid="onboarding-finish"
                    >
                      Get Started <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!canGoNext()}
                      className="gap-2 px-6"
                      data-testid="onboarding-next"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
