import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, Zap, LogOut, HelpCircle, Users, Briefcase, ChevronDown, Sparkles, Moon, Sun, Mic } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { VoiceSearch } from "./VoiceSearch";
import { CountrySelector } from "./CountrySelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [location, navigate] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Explore", href: "/explore", highlight: true },
    { name: "AI Assistant", href: "/task-assistant", icon: Sparkles },
    { name: "Book a Tasker", href: "/services" },
    { name: "Global Job Board", href: "/job-board" },
    { name: "Find Work", href: "/jobs" },
    { name: "Pricing", href: "/pricing" },
    { name: "Upload CV", href: "/cv-upload" },
    { name: "AI Finder", href: "/opportunity-finder" },
    ...(isAuthenticated ? [
      { name: "Messages", href: "/messages" },
      { name: "Dashboard", href: "/dashboard" },
    ] : []),
  ];

  const HelpMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={cn(
            "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isScrolled || location !== "/" 
              ? "text-muted-foreground hover:text-primary hover:bg-muted" 
              : "text-white/90 hover:text-white hover:bg-white/10"
          )}
          data-testid="button-help-menu"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <Link href="/how-it-works">
          <DropdownMenuItem className="cursor-pointer py-3" data-testid="link-how-it-works">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium">How It Works</div>
                <div className="text-xs text-muted-foreground">Learn the basics</div>
              </div>
            </div>
          </DropdownMenuItem>
        </Link>
        <Link href="/how-to-hire">
          <DropdownMenuItem className="cursor-pointer py-3" data-testid="link-how-to-hire">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <div className="font-medium">I Need to Hire Someone</div>
                <div className="text-xs text-muted-foreground">Find & book professionals</div>
              </div>
            </div>
          </DropdownMenuItem>
        </Link>
        <Link href="/how-to-get-hired">
          <DropdownMenuItem className="cursor-pointer py-3" data-testid="link-how-to-get-hired">
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <div className="font-medium">I Want to Find Work</div>
                <div className="text-xs text-muted-foreground">Start earning money</div>
              </div>
            </div>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled || location !== "/"
          ? "bg-background/95 backdrop-blur-md border-border py-3 shadow-sm"
          : "bg-transparent py-5 text-white"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-colors",
                 isScrolled || location !== "/" ? "bg-primary text-white" : "bg-white text-primary"
              )}>
                F
              </div>
              <span className={cn(
                "font-display font-bold text-xl tracking-tight",
                isScrolled || location !== "/" ? "text-primary" : "text-white"
              )}>
                FreelanceSkills
              </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link key={link.name} href={link.href} className={cn(
                  "text-sm font-medium transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 relative",
                  isScrolled || location !== "/"
                    ? isActive
                      ? "text-primary bg-primary/8 font-semibold"
                      : "text-muted-foreground hover:text-primary hover:bg-muted/60"
                    : isActive
                      ? "text-white font-semibold bg-white/15"
                      : "text-white/90 hover:text-white hover:bg-white/10",
                  link.icon && !isActive && (isScrolled || location !== "/" ? "text-primary" : "text-accent")
                )}>
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.name}
                  {isActive && (
                    <span className={cn(
                      "absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full",
                      isScrolled || location !== "/" ? "bg-primary" : "bg-accent"
                    )} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setShowVoiceSearch(true)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isScrolled || location !== "/"
                ? "text-muted-foreground hover:bg-muted hover:text-primary"
                : "text-white/90 hover:bg-white/10"
            )}
            aria-label="Voice Search"
            data-testid="button-voice-search-navbar"
          >
            <Mic className="h-4 w-4" />
          </button>
          <HelpMenu />
          <button
            onClick={toggleDarkMode}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isScrolled || location !== "/"
                ? "text-muted-foreground hover:bg-muted"
                : "text-white/90 hover:bg-white/10"
            )}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="button-dark-mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className={cn(
            isScrolled || location !== "/" ? "text-muted-foreground" : "text-white/90"
          )}>
            <CountrySelector />
          </div>
          <Button 
              variant="ghost" 
              className={cn(
                "hover:text-accent hover:bg-transparent font-medium",
                isScrolled || location !== "/" ? "text-primary" : "text-white"
              )}
              data-testid="button-post-job"
              onClick={() => navigate("/post-job")}
            >
              Post a Job
            </Button>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span className={cn(
                  "text-sm font-medium",
                  isScrolled || location !== "/" ? "text-foreground" : "text-white"
                )}>
                  {user?.firstName || "User"}
                </span>
              </div>
              <a href="/api/logout">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "hover:text-red-500",
                    isScrolled || location !== "/" ? "text-muted-foreground" : "text-white/80"
                  )}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </a>
            </div>
          ) : (
            <>
              <a href="/api/login">
                <Button 
                  variant="ghost"
                  className={cn(
                    "hover:text-accent hover:bg-transparent font-medium",
                    isScrolled || location !== "/" ? "text-primary" : "text-white"
                  )}
                  data-testid="button-login"
                >
                  Log In
                </Button>
              </a>
              <a href="/api/login">
                <Button 
                  className={cn(
                    "font-semibold shadow-lg transition-all hover:scale-105 active:scale-95",
                    isScrolled || location !== "/" 
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "bg-accent text-primary hover:bg-accent/90"
                  )}
                  data-testid="button-signup"
                >
                  Sign Up
                </Button>
              </a>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="button-mobile-menu-toggle"
        >
          {isMobileMenuOpen ? (
            <X className={cn("w-6 h-6", isScrolled || location !== "/" ? "text-primary" : "text-white")} />
          ) : (
            <Menu className={cn("w-6 h-6", isScrolled || location !== "/" ? "text-primary" : "text-white")} />
          )}
        </button>
      </div>

      {showVoiceSearch && (
        <VoiceSearch variant="navbar" onClose={() => setShowVoiceSearch(false)} />
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 shadow-xl md:hidden animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link key={link.name} href={link.href} className={cn(
                "text-foreground/80 hover:text-primary font-medium p-2 block bg-muted/30 rounded-md flex items-center gap-2",
                link.icon && "text-primary"
              )} data-testid={`link-mobile-nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.name}
              </Link>
            );
          })}
          <Link href="/post-job" className="text-foreground/80 hover:text-primary font-medium p-2 block bg-muted/30 rounded-md" data-testid="link-mobile-post-job">
              Post a Job
          </Link>
          <div className="h-px bg-border my-2" />
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
            <span className="text-sm text-muted-foreground">Region & Currency</span>
            <CountrySelector />
          </div>
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-between p-2 bg-muted/30 rounded-md text-foreground/80"
            data-testid="button-dark-mode-mobile"
          >
            <span className="text-sm font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="h-px bg-border my-2" />
          {isAuthenticated ? (
            <a href="/api/logout">
              <Button variant="outline" className="w-full justify-center text-red-500 border-red-200 hover:bg-red-50" data-testid="button-mobile-logout">
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </Button>
            </a>
          ) : (
            <>
              <a href="/api/login">
                <Button variant="outline" className="w-full justify-center" data-testid="button-mobile-login">Log In</Button>
              </a>
              <a href="/api/login">
                <Button className="w-full justify-center bg-primary text-white" data-testid="button-mobile-signup">Sign Up</Button>
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  );
}