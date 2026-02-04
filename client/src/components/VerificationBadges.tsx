import { 
  Shield, 
  CheckCircle, 
  Award, 
  BadgeCheck, 
  Clock, 
  Star,
  FileCheck,
  UserCheck,
  Building
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerificationStatus {
  verificationLevel: string;
  verificationScore: number;
  identityVerified: boolean;
  qualificationsVerified: boolean;
  experienceVerified: boolean;
  professionalBodyVerified: boolean;
  backgroundCheckCompleted: boolean;
  professionalBodyName?: string;
  verifiedYearsExperience?: number;
}

const LEVEL_STYLES = {
  unverified: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
  basic: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  verified: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  pro_verified: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  elite: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

const LEVEL_LABELS: Record<string, string> = {
  unverified: "Unverified",
  basic: "Basic Verified",
  verified: "Verified",
  pro_verified: "Pro Verified",
  elite: "Elite",
};

export function VerificationLevelBadge({ level, score }: { level: string; score: number }) {
  const style = LEVEL_STYLES[level as keyof typeof LEVEL_STYLES] || LEVEL_STYLES.unverified;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
          {level === 'elite' && <Award className="h-3.5 w-3.5" />}
          {level === 'pro_verified' && <BadgeCheck className="h-3.5 w-3.5" />}
          {level === 'verified' && <CheckCircle className="h-3.5 w-3.5" />}
          {level === 'basic' && <Shield className="h-3.5 w-3.5" />}
          {level === 'unverified' && <Clock className="h-3.5 w-3.5" />}
          {LEVEL_LABELS[level] || "Unknown"}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">Trust Score: {score}/100</p>
        <p className="text-xs text-muted-foreground">Higher scores = more verified credentials</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function VerificationBadges({ verification }: { verification: VerificationStatus }) {
  const badges = [];

  if (verification.identityVerified) {
    badges.push({
      icon: UserCheck,
      label: "ID Verified",
      description: "Identity verified with government ID",
      color: "text-green-600 bg-green-50",
    });
  }

  if (verification.qualificationsVerified) {
    badges.push({
      icon: FileCheck,
      label: "Qualifications",
      description: "Professional qualifications verified",
      color: "text-blue-600 bg-blue-50",
    });
  }

  if (verification.experienceVerified) {
    badges.push({
      icon: Star,
      label: `${verification.verifiedYearsExperience || '?'}yr Experience`,
      description: "Work experience verified with references",
      color: "text-amber-600 bg-amber-50",
    });
  }

  if (verification.professionalBodyVerified) {
    badges.push({
      icon: Building,
      label: verification.professionalBodyName || "Registered",
      description: `Registered with ${verification.professionalBodyName || 'professional body'}`,
      color: "text-purple-600 bg-purple-50",
    });
  }

  if (verification.backgroundCheckCompleted) {
    badges.push({
      icon: Shield,
      label: "Background Checked",
      description: "Criminal background check completed",
      color: "text-emerald-600 bg-emerald-50",
    });
  }

  if (badges.length === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>Pending verification</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge, i) => (
        <Tooltip key={i}>
          <TooltipTrigger asChild>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
              <badge.icon className="h-3 w-3" />
              {badge.label}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{badge.description}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export function TrustScoreIndicator({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 90) return "text-purple-600";
    if (s >= 75) return "text-amber-600";
    if (s >= 50) return "text-green-600";
    if (s >= 20) return "text-blue-600";
    return "text-gray-400";
  };

  const getLabel = (s: number) => {
    if (s >= 90) return "Elite";
    if (s >= 75) return "Pro Verified";
    if (s >= 50) return "Verified";
    if (s >= 20) return "Basic";
    return "New";
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`text-lg font-bold ${getColor(score)}`}>
        {score}
      </div>
      <div className="text-xs text-muted-foreground">
        Trust Score
        <div className={`font-medium ${getColor(score)}`}>{getLabel(score)}</div>
      </div>
    </div>
  );
}
