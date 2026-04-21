import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check, Briefcase, Users, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

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
    description: "Africa's #1 AI-powered freelance platform connecting exceptional talent with great opportunities — across every industry, every country.",
    icon: <Zap className="h-16 w-16 text-primary" />,
    gradient: "from-primary/10 to-emerald-500/10",
  },
  {
    title: "Verified & Trusted",
    description: "Every profile is background-checked and skill-verified. Build trust fast — verified freelancers earn 3× more invitations and get paid faster.",
    icon: <Shield className="h-16 w-16 text-emerald-500" />,
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    title: "Secure Payments",
    description: "Our escrow system protects both sides. Funds are released only when work is approved — no disputes, no surprises.",
    icon: <Check className="h-16 w-16 text-blue-500" />,
    gradient: "from-blue-500/10 to-indigo-500/10",
  },
];

const AUTH_PATHS = ["/login", "/auth", "/onboarding", "/profile-builder", "/signup"];

export function OnboardingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showRoleStep, setShowRoleStep] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (AUTH_PATHS.some((p) => path.startsWith(p))) return;
    if (!localStorage.getItem("onboarding_completed")) {
      setTimeout(() => setIsVisible(true), 800);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setShowRoleStep(true);
    }
  };

  const handlePrev = () => {
    if (showRoleStep) {
      setShowRoleStep(false);
    } else if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleComplete = (role?: Role) => {
    const r = role ?? selectedRole;
    localStorage.setItem("onboarding_completed", "true");
    if (r) localStorage.setItem("user_role_preference", r);
    setIsVisible(false);

    if (r === "freelancer") {
      setTimeout(() => { window.location.href = "/cv-upload"; }, 200);
    } else if (r === "client") {
      setTimeout(() => { window.location.href = "/post-job"; }, 200);
    }
  };

  if (!isVisible) return null;

  const totalSteps = slides.length + 1;
  const currentStep = showRoleStep ? slides.length : currentSlide;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[150] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-2xl"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          data-testid="onboarding-carousel"
        >
          <div className="p-8 md:p-10">
            <AnimatePresence mode="wait">
              {!showRoleStep ? (
                <motion.div
                  key={`slide-${currentSlide}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center"
                  data-testid={`onboarding-slide-${currentSlide}`}
                >
                  <div className={cn("mb-8 flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br", slides[currentSlide].gradient)}>
                    {slides[currentSlide].icon}
                  </div>
                  <h2 className="mb-3 text-2xl font-bold tracking-tight">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="role-step"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center"
                  data-testid="onboarding-role-step"
                >
                  <h2 className="mb-2 text-2xl font-bold tracking-tight">What brings you here?</h2>
                  <p className="mb-8 text-muted-foreground text-sm">We'll personalise your experience based on your goal.</p>
                  <div className="grid w-full grid-cols-2 gap-4">
                    <button
                      onClick={() => { setSelectedRole("freelancer"); }}
                      className={cn(
                        "group flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:border-primary hover:bg-primary/5",
                        selectedRole === "freelancer" ? "border-primary bg-primary/10" : "border-border"
                      )}
                      data-testid="onboarding-role-freelancer"
                    >
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                        selectedRole === "freelancer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      )}>
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">I'm a Freelancer</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Find work & get paid</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setSelectedRole("client"); }}
                      className={cn(
                        "group flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:border-primary hover:bg-primary/5",
                        selectedRole === "client" ? "border-primary bg-primary/10" : "border-border"
                      )}
                      data-testid="onboarding-role-client"
                    >
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                        selectedRole === "client" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      )}>
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">I'm Hiring</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Post jobs & hire talent</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 flex flex-col items-center gap-5">
              <div className="flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentStep ? "bg-primary w-6" : i < currentStep ? "bg-primary/40 w-3" : "bg-muted w-3"
                    )}
                  />
                ))}
              </div>

              <div className="flex w-full items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleComplete(null)}
                  data-testid="onboarding-skip"
                  className="text-muted-foreground"
                >
                  Skip
                </Button>

                <div className="flex gap-2">
                  {(currentSlide > 0 || showRoleStep) && (
                    <Button variant="outline" size="icon" onClick={handlePrev} data-testid="onboarding-prev">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}

                  {showRoleStep ? (
                    <Button
                      onClick={() => handleComplete(selectedRole)}
                      disabled={!selectedRole}
                      className="gap-2 px-6"
                      data-testid="onboarding-finish"
                    >
                      Get Started <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleNext} className="gap-2 px-6" data-testid="onboarding-next">
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
