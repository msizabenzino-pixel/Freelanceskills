// Shared profile-completion scoring (Command 12 + check-readiness route).
// Single source of truth so the readiness route and the search filter never drift.
// 7 equal-weight checks; score = round(passed / 7 * 100). >= 60 means >= 5 of 7.

export interface CompletionCheck {
  field: string;
  label: string;
  critical: boolean;
  href: string;
  passed: boolean;
}

export function evaluateProfileCompletion(profile: any): {
  checks: CompletionCheck[];
  score: number;
  completedCount: number;
  total: number;
} {
  const isPublished = Boolean(profile?.publishedProfile);
  const raw = [
    { field: "title", label: "Professional title", critical: true, href: "/cv-upload#basics", value: profile?.title },
    { field: "bio", label: "Professional bio (2+ sentences)", critical: true, href: "/cv-upload#basics", value: profile?.bio && (profile.bio as string).length > 40 ? profile.bio : null },
    { field: "skills", label: "At least 3 skills listed", critical: true, href: "/cv-upload#skills", value: Array.isArray(profile?.skills) && profile.skills.length >= 3 ? profile.skills : null },
    { field: "hourlyRate", label: "Hourly rate (ZAR)", critical: true, href: "/cv-upload#rates", value: profile?.hourlyRate && profile.hourlyRate > 0 ? profile.hourlyRate : null },
    { field: "location", label: "Your location", critical: false, href: "/cv-upload#basics", value: profile?.location },
    { field: "category", label: "Work category", critical: false, href: "/cv-upload#basics", value: profile?.category },
    { field: "publishedProfile", label: "Profile published (visible to employers)", critical: true, href: "/cv-upload#preview", value: isPublished ? true : null },
  ];

  const checks: CompletionCheck[] = raw.map((c) => ({
    field: c.field,
    label: c.label,
    critical: c.critical,
    href: c.href,
    passed: Boolean(c.value),
  }));

  const completedCount = checks.filter((c) => c.passed).length;
  const total = checks.length;
  const score = Math.round((completedCount / total) * 100);
  return { checks, score, completedCount, total };
}

export function profileCompletionScore(profile: any): number {
  return evaluateProfileCompletion(profile).score;
}
