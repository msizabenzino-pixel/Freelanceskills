import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Plus, Briefcase, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasUrgentJobs, setHasUrgentJobs] = useState(true); // Mocking for now, could be passed as prop or fetched

  useEffect(() => {
    const handleScroll = () => {
      // Show FAB after scrolling down 300px (past hero)
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className="flex flex-col items-end gap-3 mb-2"
              >
                <Link href="/post-job">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg gap-2 pr-6"
                    data-testid="fab-post-job"
                    onClick={() => setIsOpen(false)}
                  >
                    <Briefcase className="w-5 h-5" />
                    Post a Job
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg gap-2 pr-6"
                    data-testid="fab-find-work"
                    onClick={() => setIsOpen(false)}
                  >
                    <Search className="w-5 h-5" />
                    Find Work
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            {hasUrgentJobs && !isOpen && (
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-400"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            <Button
              size="icon"
              className={cn(
                "w-14 h-14 rounded-full shadow-2xl transition-transform active:scale-95 z-10",
                isOpen ? "bg-slate-800 hover:bg-slate-900" : "bg-emerald-600 hover:bg-emerald-700"
              )}
              onClick={() => setIsOpen(!isOpen)}
              data-testid="fab-main"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Plus className="w-8 h-8 text-white" />
              )}
            </Button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
