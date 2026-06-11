import { cn } from "@/lib/utils";
import { ShieldCheck, Award, Crown, BadgeCheck } from "lucide-react";

export type BadgeTier = "identity" | "skills" | "top_performer";

interface VerificationBadgeProps {
  tier: BadgeTier;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const BADGE_CONFIG: Record<BadgeTier, {
  label: string;
  shortLabel: string;
  Icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
  ring: string;
  tooltip: string;
}> = {
  identity: {
    label: "Identity Verified",
    shortLabel: "ID Verified",
    Icon: ShieldCheck,
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    border: "border-emerald-500/30",
    ring: "ring-emerald-500/20",
    tooltip: "South African ID or Passport verified + selfie liveness check + mobile OTP confirmed",
  },
  skills: {
    label: "Skills Verified",
    shortLabel: "Skills Verified",
    Icon: Award,
    bg: "bg-sky-500/10",
    text: "text-sky-600",
    border: "border-sky-500/30",
    ring: "ring-sky-500/20",
    tooltip: "Passed a category-specific skills assessment with 75%+ score",
  },
  top_performer: {
    label: "Top Performer",
    shortLabel: "Top Rated",
    Icon: Crown,
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-amber-500/30",
    ring: "ring-amber-500/20",
    tooltip: "10+ completed projects · 4.7+ star average · 90%+ response rate · 85%+ on-time delivery",
  },
};

export function VerificationBadge({ tier, size = "sm", showLabel = true, className }: VerificationBadgeProps) {
  const config = BADGE_CONFIG[tier];
  const Icon = config.Icon;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px] gap-1",
    sm: "px-2 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2.5",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
      title={config.tooltip}
      data-testid={`badge-${tier}`}
    >
      <Icon className={cn(iconSizes[size], "shrink-0")} />
      {showLabel && <span>{size === "xs" ? config.shortLabel : config.label}</span>}
    </span>
  );
}

export function BadgeStack({
  identityVerified,
  skillsVerified,
  topPerformer,
  size = "sm",
  className,
}: {
  identityVerified?: boolean;
  skillsVerified?: boolean;
  topPerformer?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const badges: BadgeTier[] = [];
  if (identityVerified) badges.push("identity");
  if (skillsVerified) badges.push("skills");
  if (topPerformer) badges.push("top_performer");

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex items-center flex-wrap gap-1.5", className)} data-testid="badge-stack">
      {badges.map((tier) => (
        <VerificationBadge key={tier} tier={tier} size={size} />
      ))}
    </div>
  );
}

export function BadgeTierDisplay({
  identityVerified,
  skillsVerified,
  topPerformer,
  size = "md",
  className,
}: {
  identityVerified?: boolean;
  skillsVerified?: boolean;
  topPerformer?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const count = [identityVerified, skillsVerified, topPerformer].filter(Boolean).length;
  if (count === 0) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)} data-testid="badge-none">
        <BadgeCheck className="w-3.5 h-3.5" />
        Not yet verified
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)} data-testid="badge-tier-display">
      <div className="flex items-center">
        {identityVerified && (
          <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" title="Identity Verified" />
        )}
        {skillsVerified && (
          <div className="w-3 h-3 rounded-full bg-sky-500 border-2 border-white -ml-1" title="Skills Verified" />
        )}
        {topPerformer && (
          <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white -ml-1" title="Top Performer" />
        )}
      </div>
      <span className="text-xs font-semibold text-foreground">
        {count === 3 ? "Fully Verified" : count === 2 ? "2 of 3 Verified" : "1 of 3 Verified"}
      </span>
    </div>
  );
}
