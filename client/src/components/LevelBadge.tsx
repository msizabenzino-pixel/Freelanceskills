import { cn } from "@/lib/utils";
import { Star, TrendingUp, Award, Zap, Crown, BadgeCheck } from "lucide-react";

export type FreelancerLevel = "new" | "rising" | "level1" | "level2" | "top_rated" | "pro";

interface LevelBadgeProps {
  level: FreelancerLevel;
  size?: "xs" | "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const LEVEL_CONFIG: Record<FreelancerLevel, {
  label: string;
  Icon: React.ElementType | null;
  bg: string;
  text: string;
  border: string;
  ring: string;
  glow: string;
}> = {
  new: {
    label: "New",
    Icon: null,
    bg: "bg-slate-800",
    text: "text-slate-400",
    border: "border-slate-600",
    ring: "ring-slate-700",
    glow: "",
  },
  rising: {
    label: "Rising Star",
    Icon: Star,
    bg: "bg-amber-950/80",
    text: "text-amber-400",
    border: "border-amber-700/60",
    ring: "ring-amber-800/40",
    glow: "shadow-amber-500/20",
  },
  level1: {
    label: "Level 1",
    Icon: TrendingUp,
    bg: "bg-sky-950/80",
    text: "text-sky-400",
    border: "border-sky-700/60",
    ring: "ring-sky-800/40",
    glow: "shadow-sky-500/20",
  },
  level2: {
    label: "Level 2",
    Icon: Award,
    bg: "bg-violet-950/80",
    text: "text-violet-400",
    border: "border-violet-700/60",
    ring: "ring-violet-800/40",
    glow: "shadow-violet-500/20",
  },
  top_rated: {
    label: "Top Rated",
    Icon: Crown,
    bg: "bg-emerald-950/80",
    text: "text-emerald-400",
    border: "border-emerald-600/60",
    ring: "ring-emerald-700/40",
    glow: "shadow-emerald-500/25",
  },
  pro: {
    label: "Pro Verified",
    Icon: BadgeCheck,
    bg: "bg-gradient-to-r from-violet-950/90 to-emerald-950/90",
    text: "text-violet-300",
    border: "border-violet-500/60",
    ring: "ring-violet-600/40",
    glow: "shadow-violet-500/30",
  },
};

const SIZE_CLASSES = {
  xs: { badge: "px-1.5 py-0.5 text-[10px] gap-0.5", icon: "w-2.5 h-2.5" },
  sm: { badge: "px-2 py-0.5 text-xs gap-1", icon: "w-3 h-3" },
  md: { badge: "px-3 py-1 text-sm gap-1.5", icon: "w-3.5 h-3.5" },
  lg: { badge: "px-4 py-1.5 text-base gap-2", icon: "w-4 h-4" },
};

export function LevelBadge({ level, size = "sm", showIcon = true, className }: LevelBadgeProps) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG["new"];
  const sz = SIZE_CLASSES[size];
  const { Icon } = cfg;

  if (level === "new") return null;
  const isPro = level === "pro";

  return (
    <span
      data-testid={`level-badge-${level}`}
      className={cn(
        "inline-flex items-center font-semibold rounded-full border",
        cfg.bg, cfg.text, cfg.border,
        sz.badge,
        cfg.glow && `shadow-md ${cfg.glow}`,
        isPro && "ring-1 ring-violet-500/40",
        className
      )}
    >
      {showIcon && Icon && <Icon className={sz.icon} aria-hidden />}
      {cfg.label}
    </span>
  );
}

export function getLevelFromStats(completedJobs: number, rating: number, totalEarningsCents: number): FreelancerLevel {
  if (completedJobs >= 50 && rating >= 4.8 && totalEarningsCents >= 500000) return "top_rated";
  if (completedJobs >= 20 && rating >= 4.5 && totalEarningsCents >= 200000) return "level2";
  if (completedJobs >= 5 && rating >= 4.0) return "level1";
  if (completedJobs >= 1) return "rising";
  return "new";
}

export function getLevelProgress(level: FreelancerLevel): { current: number; next: string; tip: string } {
  switch (level) {
    case "new": return { current: 0, next: "Rising Star", tip: "Complete 1 job to reach Rising Star" };
    case "rising": return { current: 20, next: "Level 1", tip: "Complete 5 jobs with 4.0+ rating" };
    case "level1": return { current: 45, next: "Level 2", tip: "Complete 20 jobs with 4.5+ rating" };
    case "level2": return { current: 70, next: "Top Rated", tip: "Complete 50 jobs with 4.8+ rating & R5,000+ earned" };
    case "top_rated": return { current: 90, next: "Pro Verified", tip: "Apply for Pro verification through the vetting programme" };
    case "pro": return { current: 100, next: "Pro Verified", tip: "You hold the highest Pro Verified status!" };
  }
}
