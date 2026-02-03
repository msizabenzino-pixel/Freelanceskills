import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Find Talent", href: "/freelancers" },
    { name: "Find Work", href: "/jobs" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled || location !== "/"
          ? "bg-background/95 backdrop-blur-md border-border py-3 shadow-sm"
          : "bg-transparent py-5 text-white"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 group">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-colors",
               isScrolled || location !== "/" ? "bg-primary text-white" : "bg-white text-primary"
            )}>
              I
            </div>
            <span className={cn(
              "font-display font-bold text-xl tracking-tight",
              isScrolled || location !== "/" ? "text-primary" : "text-white"
            )}>
              FreelanceSkill<span className="text-accent">.</span>
            </span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <a className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                isScrolled || location !== "/" ? "text-muted-foreground" : "text-white/90"
              )}>
                {link.name}
              </a>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/post-job">
            <Button 
              variant="ghost" 
              className={cn(
                "hover:text-accent hover:bg-transparent font-medium",
                isScrolled || location !== "/" ? "text-primary" : "text-white"
              )}
            >
              Post a Job
            </Button>
          </Link>
          <Button 
            className={cn(
              "font-semibold shadow-lg transition-all hover:scale-105 active:scale-95",
              isScrolled || location !== "/" 
                ? "bg-primary text-white hover:bg-primary/90" 
                : "bg-accent text-primary hover:bg-accent/90"
            )}
          >
            Sign Up
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={cn("w-6 h-6", isScrolled || location !== "/" ? "text-primary" : "text-white")} />
          ) : (
            <Menu className={cn("w-6 h-6", isScrolled || location !== "/" ? "text-primary" : "text-white")} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 shadow-xl md:hidden animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <a className="text-foreground/80 hover:text-primary font-medium p-2 block bg-muted/30 rounded-md">
                {link.name}
              </a>
            </Link>
          ))}
          <Link href="/post-job">
            <a className="text-foreground/80 hover:text-primary font-medium p-2 block bg-muted/30 rounded-md">
              Post a Job
            </a>
          </Link>
          <div className="h-px bg-border my-2" />
          <Button variant="outline" className="w-full justify-center">Log In</Button>
          <Button className="w-full justify-center bg-primary text-white">Sign Up</Button>
        </div>
      )}
    </nav>
  );
}