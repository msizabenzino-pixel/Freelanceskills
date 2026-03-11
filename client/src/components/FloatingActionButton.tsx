import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Plus, Briefcase, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 200;
      setIsVisible(scrolled);
      if (!scrolled) setIsOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[45] flex flex-col items-end gap-3 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      )}
      data-testid="fab-container"
    >
      {isOpen && (
        <div className="flex flex-col items-end gap-3 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
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
        </div>
      )}

      <div className="relative">
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
        )}
        <Button
          size="icon"
          className={cn(
            "w-14 h-14 rounded-full shadow-2xl transition-transform active:scale-95 relative",
            isOpen ? "bg-slate-800 hover:bg-slate-900" : "bg-emerald-600 hover:bg-emerald-700"
          )}
          onClick={() => setIsOpen(!isOpen)}
          data-testid="fab-main"
          aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-8 h-8 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}
