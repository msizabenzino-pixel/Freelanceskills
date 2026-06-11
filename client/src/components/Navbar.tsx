import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Menu, X, LogOut, Briefcase, Search, Bell, MessageSquare,
  User, ChevronDown, LayoutDashboard, Settings, Trophy, BookOpen,
  Sparkles, Globe, FileText, Moon, Sun, Wallet, Award
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useSocketNotifications } from "@/hooks/use-socket-notifications";
import { BrandLogo } from "@/components/BrandLogo";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavbarProps = {
  topOffset?: number;
};

export function Navbar({ topOffset = 0 }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileStatus, setProfileStatus] = useState<"none" | "draft" | "published" | "loading" | null>(null);
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const searchRef = useRef<HTMLInputElement>(null);

  // Activate socket notifications for real-time badge updates
  useSocketNotifications(user?.id);

  const { data: unreadMsgData } = useQuery<{ count: number }>({
    queryKey: ["/api/conversations/unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/conversations/unread-count", { credentials: "include" });
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const unreadMessages = unreadMsgData?.count ?? 0;

  const { data: rewardsData } = useQuery<{ balance: number }>({
    queryKey: ["/api/rewards", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/rewards?userId=${user?.id ?? ""}`, { credentials: "include" });
      if (!res.ok) return { balance: 0 };
      return res.json();
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const pointsBalance = rewardsData?.balance ?? 0;

  useEffect(() => {
    if (!isAuthenticated) { setProfileStatus(null); return; }
    apiFetch("/api/profile/check-readiness")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.profileStatus) setProfileStatus(d.profileStatus); })
      .catch(() => {});
  }, [isAuthenticated, location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const userInitials = user
    ? (user.firstName?.[0] || "") + (user.lastName?.[0] || "") || user.email?.[0]?.toUpperCase() || "U"
    : "U";
  const userName = user?.firstName ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}` : user?.email?.split("@")[0] || "User";

  const navLink = (href: string, label: string, testId: string) => {
    const active = location === href || location.startsWith(href + "?");
    return (
      <Link href={href}>
        <button
          className={cn(
            "px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
            active
              ? "text-primary bg-primary/8 font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          data-testid={testId}
        >
          {label}
        </button>
      </Link>
    );
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{ top: `${topOffset}px` }}
      className="fixed left-0 right-0 z-50 bg-background/92 backdrop-blur-xl border-b border-border/70"
    >
        <div className="container mx-auto px-4 md:px-6 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center" aria-label="FreelanceSkills home">
          <BrandLogo imageClassName="h-8 md:h-9 max-w-[180px]" />
        </Link>

        {/* Search bar — hidden on mobile, grows to fill space */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search skills, jobs, freelancers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-16 rounded-full bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              data-testid="input-nav-search"
            />
            <button
              type="button"
              title="Open command palette (⌘K)"
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-50 hover:opacity-100 transition-opacity"
              data-testid="button-cmd-palette-hint"
              tabIndex={-1}
            >
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌘K</kbd>
            </button>
          </div>
        </form>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {navLink("/jobs", "Find Work", "link-find-work")}
          {navLink("/find-talent", "Find Talent", "link-find-talent")}
          {navLink("/academy", "Learn", "link-academy")}
          {navLink("/pricing", "Pricing", "link-pricing")}
          {navLink("/why-us", "Why Us", "link-why-us")}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {/* Dark mode toggle — subtle icon */}
          <button
            onClick={toggleDarkMode}
            className="hidden md:flex p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="button-dark-mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Messages */}
              <Link href="/messages">
                <button
                  className="hidden md:flex p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors relative"
                  aria-label={unreadMessages > 0 ? `Messages (${unreadMessages} unread)` : "Messages"}
                  data-testid="link-messages-nav"
                >
                  <MessageSquare className="h-4 w-4" />
                  {unreadMessages > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
                      data-testid="badge-messages-unread"
                    >
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </button>
              </Link>

              {/* Notifications */}
              <div className="hidden md:flex text-muted-foreground">
                <NotificationBell />
              </div>

              {/* Points counter */}
              {pointsBalance > 0 && (
                <Link href="/rewards">
                  <button
                    className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-all text-[11px] font-bold text-amber-400"
                    data-testid="badge-points-balance"
                    title="Your reward points"
                  >
                    <Trophy className="h-3 w-3" />
                    {pointsBalance.toLocaleString()}
                  </button>
                </Link>
              )}

              {/* Profile status pill — only show when we have a definitive non-published status */}
              {profileStatus && profileStatus !== "published" && profileStatus !== "loading" && (
                <button
                  onClick={() => navigate("/cv-upload")}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-all text-[11px] font-semibold text-amber-500"
                  data-testid="badge-profile-draft"
                  title="Complete your profile"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {profileStatus === "draft" ? "Draft" : "Set up profile"}
                </button>
              )}

              {/* Avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-full hover:bg-muted px-2 py-1 transition-colors"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.profileImageUrl || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium text-foreground max-w-[100px] truncate">{userName}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:inline" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} data-testid="link-dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2 text-primary" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/cv-upload")} data-testid="link-my-profile">
                    <User className="h-4 w-4 mr-2 text-blue-500" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")} data-testid="link-messages-dropdown">
                    <MessageSquare className="h-4 w-4 mr-2 text-violet-500" /> Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/rewards")} data-testid="link-rewards-dropdown">
                    <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="flex-1">Rewards</span>
                    {pointsBalance > 0 && (
                      <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                        {pointsBalance.toLocaleString()} pts
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/post-job")} data-testid="link-post-job-dropdown">
                    <Briefcase className="h-4 w-4 mr-2 text-emerald-500" /> Post a Job
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-500 focus:text-red-500 focus:bg-red-50"
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/post-job">
                <button
                  className="hidden md:inline text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-full hover:bg-muted/70 transition-colors"
                  data-testid="button-post-job-navbar"
                >
                  Post a Job
                </button>
              </Link>
              <Link href="/auth">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex font-medium"
                  data-testid="button-login"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/auth?mode=register">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm"
                  data-testid="button-signup"
                >
                  Join Free
                </Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu-toggle"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-2.5">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search skills, jobs, freelancers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-full bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            data-testid="input-mobile-search"
          />
        </form>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-xl md:hidden animate-in slide-in-from-top-2 overflow-y-auto max-h-[80vh]">
          <div className="p-4 flex flex-col gap-1">
            {[
              { href: "/jobs", label: "Find Work", icon: Briefcase, color: "text-blue-500" },
              { href: "/find-talent", label: "Find Talent", icon: Globe, color: "text-violet-500" },
              { href: "/post-job", label: "Post a Job", icon: FileText, color: "text-emerald-500" },
              { href: "/academy", label: "Learn & Upskill", icon: BookOpen, color: "text-amber-500" },
              { href: "/explore", label: "Explore", icon: Sparkles, color: "text-pink-500" },
              { href: "/pricing", label: "Pricing", icon: Wallet, color: "text-emerald-500" },
              { href: "/why-us", label: "Why FreelanceSkills", icon: Award, color: "text-primary" },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href}>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted transition-colors text-left"
                  data-testid={`link-mobile-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className={cn("h-5 w-5", color)} />
                  <span className="font-medium">{label}</span>
                </button>
              </Link>
            ))}

            <div className="h-px bg-border my-2" />

            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
              data-testid="button-dark-mode-mobile"
            >
              {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-400" />}
              <span className="font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <div className="h-px bg-border my-2" />

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{userName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/cv-upload", label: "My Profile" },
                  { href: "/messages", label: "Messages" },
                  { href: "/rewards", label: "Rewards" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href}>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors flex items-center justify-between"
                      data-testid={`link-mobile-${label.toLowerCase()}`}
                    >
                      <span>{label}</span>
                      {label === "Messages" && unreadMessages > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center" data-testid="badge-mobile-messages-unread">
                          {unreadMessages > 9 ? "9+" : unreadMessages}
                        </span>
                      )}
                    </button>
                  </Link>
                ))}
                <Button
                  variant="outline"
                  className="w-full mt-2 text-red-500 border-red-200 hover:bg-red-50"
                  onClick={logout}
                  data-testid="button-mobile-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Log Out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full" data-testid="button-mobile-login">Log In</Button>
                </Link>
                <Link href="/auth?mode=register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary text-white" data-testid="button-mobile-signup">Join Free</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
