import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

const slides = [
  {
    title: "Welcome to FreelanceSkills",
    description: "South Africa's #1 AI-powered freelance jobs platform connecting local talent with great opportunities.",
    image: "/hero-bg.png",
  },
  {
    title: "Verify Your Identity",
    description: "Build trust in our community. Verified profiles get 3x more job invitations and faster payments.",
    image: "/icons/icon-512x512.png",
  },
  {
    title: "Post a Job or Create a Profile",
    description: "Whether you're looking to hire or looking for work, we've got the tools to help you succeed.",
    image: "/icons/icon-512x512.png",
  },
  {
    title: "Get Paid Securely",
    description: "Our escrow system ensures that freelancers get paid for their work and clients get what they paid for.",
    image: "/icons/icon-512x512.png",
  },
];

const AUTH_PATHS = ["/login", "/auth", "/cv-upload", "/onboarding", "/freelancer-onboarding", "/profile-builder", "/signup"];

export function OnboardingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const isAuthPage = AUTH_PATHS.some((p) => path.startsWith(p));
    if (isAuthPage) return;
    const completed = localStorage.getItem("onboarding_completed");
    if (!completed) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-2xl"
        data-testid="onboarding-carousel"
      >
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
              data-testid={`onboarding-slide-${currentSlide}`}
            >
              <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl bg-muted">
                <img 
                  src={slides[currentSlide].image} 
                  alt={slides[currentSlide].title}
                  className="h-full w-full object-cover"
                />
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                {slides[currentSlide].title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentSlide ? "bg-primary w-4" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex w-full items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleSkip}
                data-testid="onboarding-skip"
              >
                Skip
              </Button>
              
              <div className="flex gap-2">
                {currentSlide > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                
                {currentSlide === slides.length - 1 ? (
                  <Button 
                    onClick={handleComplete}
                    className="gap-2"
                    data-testid="onboarding-start"
                  >
                    Get Started <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    className="gap-2"
                    data-testid="onboarding-next"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
