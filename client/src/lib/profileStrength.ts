/**
 * Shared profile strength scorer.
 * Used in CVUpload wizard, Dashboard, and ProfileStrengthMeter.
 */

export interface StrengthInput {
  firstName?: string;
  lastName?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  category?: string;
  hourlyRate?: string | number;
  location?: string;
  photo?: string;
  portfolioUrl?: string;
  languages?: string[];
  availability?: string;
}

export interface StrengthResult {
  score: number;          // 0-100
  label: string;          // "Starter" | "Good" | "Strong" | "Expert" | "Pro"
  color: string;          // tailwind colour token
  tips: string[];         // ordered list of biggest missing items
  motivational: string;   // encouraging micro-copy for current level
}

const LEVELS = [
  { min: 0,  label: "Starter",  color: "text-red-400",    bar: "bg-red-500",    motivational: "Every journey starts here — add your name and a title to unlock more." },
  { min: 30, label: "Good",     color: "text-amber-400",  bar: "bg-amber-500",  motivational: "You're on your way! Fill in your bio and skills to attract clients." },
  { min: 55, label: "Strong",   color: "text-blue-400",   bar: "bg-blue-500",   motivational: "Solid foundation! Add a photo and portfolio link to stand out further." },
  { min: 75, label: "Expert",   color: "text-emerald-400",bar: "bg-emerald-500",motivational: "Almost there! A few more details and you'll outshine most applicants." },
  { min: 90, label: "Pro",      color: "text-purple-400", bar: "bg-purple-500", motivational: "100% profile — you're in the top tier of FreelanceSkills talent! 🏆" },
] as const;

export function calcStrength(data: StrengthInput): StrengthResult {
  const tips: string[] = [];
  let score = 0;

  if (data.firstName && data.lastName) score += 10; else tips.push("Add your full name");
  if (data.title) score += 10; else tips.push("Add a professional title");

  const bioLen = (data.bio ?? "").length;
  if (bioLen > 80) score += 15;
  else if (bioLen > 20) { score += 7; tips.push("Expand your bio to 80+ characters"); }
  else tips.push("Write a bio (80+ characters)");

  const skillCount = (data.skills ?? []).length;
  if (skillCount >= 5) score += 15;
  else { score += Math.floor(skillCount * 3); tips.push(`Add ${5 - skillCount} more skill${5 - skillCount !== 1 ? "s" : ""}`); }

  if (data.category) score += 10; else tips.push("Select your service category");
  if (data.hourlyRate && Number(data.hourlyRate) > 0) score += 10; else tips.push("Set your hourly rate (ZAR)");
  if (data.location) score += 5; else tips.push("Add your location");
  if (data.photo) score += 10; else tips.push("Upload a profile photo");
  if (data.portfolioUrl) score += 5; else tips.push("Add a portfolio link");
  if ((data.languages ?? []).length > 0) score += 5; else tips.push("Add languages you speak");
  if (data.availability) score += 5; else tips.push("Set your availability");

  const level = [...LEVELS].reverse().find((l) => score >= l.min) ?? LEVELS[0];
  return {
    score,
    label: level.label,
    color: level.color,
    tips,
    motivational: level.motivational,
  };
}

/** Colour of the progress bar for a given score (0-100) */
export function barColor(score: number): string {
  const level = [...LEVELS].reverse().find((l) => score >= l.min) ?? LEVELS[0];
  return level.bar;
}
