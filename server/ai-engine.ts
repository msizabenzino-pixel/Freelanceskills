import { storage } from "./storage";

const AI_API_KEY = () => process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const AI_BASE_URL = () => process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";

async function aiChat(systemPrompt: string, messages: { role: string; content: string }[], temperature = 0.7): Promise<string> {
  const response = await fetch(`${AI_BASE_URL()}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${AI_API_KEY()}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, ...messages], temperature }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function aiJSON<T = any>(systemPrompt: string, userMessage: string): Promise<T> {
  const raw = await aiChat(systemPrompt + "\n\nRespond ONLY with valid JSON, no markdown.", [{ role: "user", content: userMessage }], 0.3);
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

// ===== #21 CONVERSATION MEMORY =====
const conversationMemory = new Map<string, { role: string; content: string; timestamp: number }[]>();
const MAX_MEMORY = 10;
const MEMORY_TTL = 30 * 60 * 1000;

export function storeConversation(sessionId: string, role: string, content: string) {
  const history = conversationMemory.get(sessionId) || [];
  history.push({ role, content, timestamp: Date.now() });
  if (history.length > MAX_MEMORY) history.shift();
  conversationMemory.set(sessionId, history);
}

export function getConversationHistory(sessionId: string): { role: string; content: string }[] {
  const history = conversationMemory.get(sessionId) || [];
  const cutoff = Date.now() - MEMORY_TTL;
  const valid = history.filter(h => h.timestamp > cutoff);
  conversationMemory.set(sessionId, valid);
  return valid.map(({ role, content }) => ({ role, content }));
}

export function clearConversation(sessionId: string) {
  conversationMemory.delete(sessionId);
}

// ===== #22 BUDGET PREDICTION =====
const SA_MARKET_RATES: Record<string, { min: number; max: number }> = {
  "web development": { min: 400, max: 1500 },
  "mobile development": { min: 500, max: 2000 },
  "graphic design": { min: 250, max: 800 },
  "content writing": { min: 200, max: 600 },
  "plumbing": { min: 350, max: 800 },
  "electrical": { min: 400, max: 900 },
  "cleaning": { min: 150, max: 350 },
  "photography": { min: 300, max: 1200 },
  "video editing": { min: 350, max: 1000 },
  "seo": { min: 300, max: 1000 },
  "data entry": { min: 100, max: 300 },
  "accounting": { min: 400, max: 1200 },
  "legal": { min: 800, max: 2500 },
  "consulting": { min: 600, max: 2500 },
  "tutoring": { min: 200, max: 600 },
  "translation": { min: 250, max: 700 },
  "marketing": { min: 350, max: 1200 },
  default: { min: 250, max: 800 },
};

export async function predictBudget(clientStatement: string, category?: string): Promise<{
  parsedRange: { min: number; max: number };
  suggestedRange: { min: number; max: number };
  marketRate: { min: number; max: number };
  advice: string;
  confidence: number;
}> {
  const numberMatches = clientStatement.match(/R?\s?(\d[\d,\s]*)/g);
  let parsedMin = 0, parsedMax = 0;
  if (numberMatches) {
    const nums = numberMatches.map(n => parseInt(n.replace(/[R,\s]/g, "")));
    parsedMin = Math.min(...nums);
    parsedMax = Math.max(...nums);
    if (parsedMin === parsedMax) { parsedMin = Math.round(parsedMax * 0.8); }
  }

  const cat = (category || "").toLowerCase();
  const marketRate = Object.entries(SA_MARKET_RATES).find(([k]) => cat.includes(k))?.[1] || SA_MARKET_RATES.default;

  const suggestedMin = Math.max(parsedMin, marketRate.min);
  const suggestedMax = parsedMax > 0 ? Math.max(parsedMax, marketRate.min) : marketRate.max;
  const confidence = parsedMax > 0 ? (parsedMax >= marketRate.min ? 0.85 : 0.5) : 0.4;

  let advice = "";
  if (parsedMax > 0 && parsedMax < marketRate.min) {
    advice = `Your budget of R${parsedMax}/hr is below the SA market rate of R${marketRate.min}-R${marketRate.max}/hr. You may attract fewer quality freelancers. Consider raising to at least R${marketRate.min}/hr.`;
  } else if (parsedMin >= marketRate.max) {
    advice = `Your budget of R${parsedMin}+/hr is above market rate. You'll attract premium talent quickly.`;
  } else {
    advice = `Your budget is within the SA market range. Good balance of affordability and quality.`;
  }

  return { parsedRange: { min: parsedMin, max: parsedMax }, suggestedRange: { min: suggestedMin, max: suggestedMax }, marketRate, advice, confidence };
}

// ===== #23 SKILL-GAP ANALYSIS =====
export async function analyzeSkillGaps(jobSkills: string[], freelancerSkills: string[]): Promise<{
  matched: string[];
  missing: string[];
  partial: string[];
  matchPercentage: number;
  recommendation: string;
}> {
  const normalize = (s: string) => s.toLowerCase().trim();
  const jobNorm = jobSkills.map(normalize);
  const freelancerNorm = freelancerSkills.map(normalize);

  const synonyms: Record<string, string[]> = {
    "react": ["reactjs", "react.js"],
    "node": ["nodejs", "node.js"],
    "typescript": ["ts"],
    "javascript": ["js", "es6"],
    "python": ["py", "python3"],
    "css": ["css3", "styling"],
    "html": ["html5"],
    "postgresql": ["postgres", "psql"],
    "mongodb": ["mongo"],
    "vue": ["vuejs", "vue.js"],
    "angular": ["angularjs"],
    "aws": ["amazon web services"],
    "gcp": ["google cloud"],
    "docker": ["containerization"],
    "kubernetes": ["k8s"],
    "figma": ["ui design", "ux design"],
  };

  const matched: string[] = [];
  const missing: string[] = [];
  const partial: string[] = [];

  for (const skill of jobNorm) {
    const syns = Object.entries(synonyms).find(([k, v]) => k === skill || v.includes(skill));
    const allVariants = syns ? [syns[0], ...syns[1]] : [skill];

    if (freelancerNorm.some(fs => allVariants.some(v => fs.includes(v) || v.includes(fs)))) {
      matched.push(jobSkills[jobNorm.indexOf(skill)]);
    } else if (freelancerNorm.some(fs => {
      const words = skill.split(/\s+/);
      return words.some(w => w.length > 2 && fs.includes(w));
    })) {
      partial.push(jobSkills[jobNorm.indexOf(skill)]);
    } else {
      missing.push(jobSkills[jobNorm.indexOf(skill)]);
    }
  }

  const matchPercentage = jobSkills.length > 0 ? Math.round(((matched.length + partial.length * 0.5) / jobSkills.length) * 100) : 0;

  let recommendation = "";
  if (missing.length === 0) recommendation = "Perfect skill match! This freelancer has all required skills.";
  else if (matchPercentage >= 70) recommendation = `Strong match. Missing ${missing.join(", ")} — consider if these are learnable or critical.`;
  else if (matchPercentage >= 40) recommendation = `Partial match. Key gaps in ${missing.slice(0, 3).join(", ")}. May need additional training.`;
  else recommendation = `Weak match. Significant skill gaps. Consider other candidates.`;

  return { matched, missing, partial, matchPercentage, recommendation };
}

// ===== #24 APPLICATION FRAUD/RISK SCORING =====
const applicationTracker = new Map<string, { jobIds: string[]; timestamps: number[] }>();

export async function scoreApplicationRisk(userId: string, jobId: string, profileData?: any): Promise<{
  riskScore: number;
  flags: string[];
  recommendation: "approve" | "review" | "reject";
  details: Record<string, any>;
}> {
  let riskScore = 0;
  const flags: string[] = [];

  const now = Date.now();
  const tracker = applicationTracker.get(userId) || { jobIds: [], timestamps: [] };
  tracker.jobIds.push(jobId);
  tracker.timestamps.push(now);
  const recentWindow = now - 60 * 60 * 1000;
  tracker.timestamps = tracker.timestamps.filter(t => t > recentWindow);
  tracker.jobIds = tracker.jobIds.slice(-50);
  applicationTracker.set(userId, tracker);

  if (tracker.timestamps.length > 20) {
    riskScore += 45;
    flags.push(`Mass apply: ${tracker.timestamps.length} applications in 1 hour`);
  } else if (tracker.timestamps.length > 10) {
    riskScore += 25;
    flags.push(`High volume: ${tracker.timestamps.length} applications in 1 hour`);
  }

  const uniqueJobs = new Set(tracker.jobIds);
  if (tracker.jobIds.length > uniqueJobs.size * 1.5) {
    riskScore += 30;
    flags.push("Duplicate applications detected");
  }

  if (profileData) {
    if (!profileData.bio || profileData.bio.length < 20) {
      riskScore += 15;
      flags.push("Incomplete profile: no bio");
    }
    if (!profileData.skills || profileData.skills.length === 0) {
      riskScore += 15;
      flags.push("No skills listed");
    }
    if (profileData.completedJobs === 0 && profileData.rating === 0) {
      riskScore += 10;
      flags.push("New account with no history");
    }
  }

  const recommendation = riskScore >= 60 ? "reject" : riskScore >= 30 ? "review" : "approve";
  return { riskScore: Math.min(riskScore, 100), flags, recommendation, details: { applicationsLastHour: tracker.timestamps.length, uniqueJobs: uniqueJobs.size } };
}

// ===== #25 PREDICTIVE JOB SUCCESS SCORE =====
export async function predictJobSuccess(freelancerId: string, jobId: string): Promise<{
  successScore: number;
  factors: { name: string; score: number; weight: number; detail: string }[];
  prediction: string;
  confidence: number;
}> {
  const profile = await storage.getProfile(freelancerId);
  const bookings = await storage.getUserBookings(freelancerId);
  const reviews = await storage.getReviewsForUser(freelancerId);

  const completedBookings = bookings.filter(b => b.status === "completed");
  const totalBookings = bookings.length;
  const completionRate = totalBookings > 0 ? completedBookings.length / totalBookings : 0;

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const recentReviews = reviews.slice(-5);
  const recentAvg = recentReviews.length > 0 ? recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length : 0;
  const ratingTrend = recentReviews.length >= 3 ? (recentAvg - avgRating) : 0;

  const factors = [
    { name: "Skill Match", score: profile?.skills?.length ? Math.min(profile.skills.length * 10, 100) : 30, weight: 0.25, detail: `${profile?.skills?.length || 0} skills listed` },
    { name: "Completion Rate", score: Math.round(completionRate * 100), weight: 0.25, detail: `${completedBookings.length}/${totalBookings} jobs completed` },
    { name: "Average Rating", score: Math.round((avgRating / 5) * 100), weight: 0.20, detail: `${avgRating.toFixed(1)}/5.0 average` },
    { name: "Rating Trend", score: Math.round(50 + ratingTrend * 25), weight: 0.15, detail: ratingTrend > 0 ? "Improving" : ratingTrend < 0 ? "Declining" : "Stable" },
    { name: "Experience Level", score: Math.min(completedBookings.length * 5, 100), weight: 0.15, detail: `${completedBookings.length} completed jobs` },
  ];

  const successScore = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0));
  const confidence = Math.min(0.3 + (completedBookings.length * 0.07), 0.95);

  let prediction = "";
  if (successScore >= 80) prediction = "High probability of successful completion. Highly recommended.";
  else if (successScore >= 60) prediction = "Good chance of success. Solid candidate.";
  else if (successScore >= 40) prediction = "Moderate success probability. Consider verifying specific requirements.";
  else prediction = "Lower success probability. Review carefully before hiring.";

  return { successScore, factors, prediction, confidence };
}

// ===== #26 AUTO-SUGGEST JOB POST IMPROVEMENTS =====
export async function suggestJobPostImprovements(job: { title?: string; description?: string; budget?: number; deadline?: string; skills?: string[]; location?: string }): Promise<{
  suggestions: { tip: string; impact: string; priority: "high" | "medium" | "low" }[];
  overallScore: number;
  improvedTitle?: string;
}> {
  const suggestions: { tip: string; impact: string; priority: "high" | "medium" | "low" }[] = [];
  let score = 50;

  if (!job.deadline) {
    suggestions.push({ tip: "Add a deadline to get 40% more applications", impact: "+40% applications", priority: "high" });
  } else { score += 10; }

  if (!job.budget || job.budget === 0) {
    suggestions.push({ tip: "Include a budget range — posts with budgets get 60% more quality applicants", impact: "+60% quality applicants", priority: "high" });
  } else { score += 10; }

  if (!job.skills || job.skills.length === 0) {
    suggestions.push({ tip: "List 3-5 required skills to attract qualified freelancers", impact: "+35% qualified matches", priority: "high" });
  } else if (job.skills.length < 3) {
    suggestions.push({ tip: "Add more skills (aim for 3-5) for better matching", impact: "+20% better matches", priority: "medium" });
    score += 5;
  } else { score += 10; }

  if (!job.description || job.description.length < 100) {
    suggestions.push({ tip: "Write a detailed description (at least 200 words) — longer descriptions get 50% more applies", impact: "+50% applications", priority: "high" });
  } else if (job.description.length < 300) {
    suggestions.push({ tip: "Expand your description with deliverables and timeline for better matches", impact: "+25% applications", priority: "medium" });
    score += 5;
  } else { score += 10; }

  if (!job.location) {
    suggestions.push({ tip: "Specify location or 'Remote' to reach the right freelancers", impact: "+30% relevant applies", priority: "medium" });
  } else { score += 5; }

  if (job.title && job.title.length < 10) {
    suggestions.push({ tip: "Use a descriptive title (e.g., 'React Developer for E-commerce App' instead of 'Developer Needed')", impact: "+25% click-through", priority: "medium" });
  } else { score += 5; }

  if (job.description && !job.description.toLowerCase().includes("deliverable")) {
    suggestions.push({ tip: "List specific deliverables so freelancers know exactly what to deliver", impact: "+20% completion rate", priority: "low" });
  }

  if (job.description && !job.description.match(/milestone|phase|stage/i)) {
    suggestions.push({ tip: "Break the project into milestones for easier management", impact: "+15% on-time delivery", priority: "low" });
  }

  return { suggestions: suggestions.slice(0, 6), overallScore: Math.min(score, 100) };
}

// ===== #27 LOCATION-AWARE MATCHING BOOST =====
const SA_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "cape town": { lat: -33.9249, lng: 18.4241 },
  "johannesburg": { lat: -26.2041, lng: 28.0473 },
  "pretoria": { lat: -25.7479, lng: 28.2293 },
  "durban": { lat: -29.8587, lng: 31.0218 },
  "port elizabeth": { lat: -33.9608, lng: 25.6022 },
  "gqeberha": { lat: -33.9608, lng: 25.6022 },
  "bloemfontein": { lat: -29.0852, lng: 26.1596 },
  "east london": { lat: -33.0292, lng: 27.8546 },
  "polokwane": { lat: -23.9045, lng: 29.4689 },
  "nelspruit": { lat: -25.4753, lng: 30.9694 },
  "mbombela": { lat: -25.4753, lng: 30.9694 },
  "kimberley": { lat: -28.7282, lng: 24.7499 },
  "pietermaritzburg": { lat: -29.6006, lng: 30.3794 },
  "sandton": { lat: -26.1076, lng: 28.0567 },
  "tableview": { lat: -33.8258, lng: 18.5126 },
  "stellenbosch": { lat: -33.9321, lng: 18.8602 },
  "centurion": { lat: -25.8603, lng: 28.1894 },
};

function getCoords(location: string): { lat: number; lng: number } | null {
  const loc = location.toLowerCase().trim();
  for (const [city, coords] of Object.entries(SA_CITY_COORDS)) {
    if (loc.includes(city)) return coords;
  }
  return null;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function locationBoost(jobLocation: string, freelancerLocation: string): { distance: number | null; boost: number; isLocal: boolean } {
  const jobCoords = getCoords(jobLocation);
  const freelancerCoords = getCoords(freelancerLocation);
  if (!jobCoords || !freelancerCoords) return { distance: null, boost: 0, isLocal: false };
  const distance = haversineDistance(jobCoords.lat, jobCoords.lng, freelancerCoords.lat, freelancerCoords.lng);
  let boost = 0;
  if (distance <= 10) boost = 25;
  else if (distance <= 25) boost = 20;
  else if (distance <= 50) boost = 15;
  else if (distance <= 100) boost = 10;
  else if (distance <= 200) boost = 5;
  return { distance: Math.round(distance), boost, isLocal: distance <= 50 };
}

// ===== #28 URGENCY ESCALATION =====
export function urgencyEscalation(jobCreatedAt: Date | string, applicationCount: number): {
  hoursPosted: number;
  isStale: boolean;
  suggestion: string;
  recommendedAction: string;
  visibilityBoostFee?: number;
} {
  const created = new Date(jobCreatedAt);
  const hoursPosted = Math.round((Date.now() - created.getTime()) / (1000 * 60 * 60));
  const isStale = hoursPosted > 48;

  if (!isStale && applicationCount >= 5) {
    return { hoursPosted, isStale: false, suggestion: "Your job is performing well with strong interest.", recommendedAction: "none" };
  }

  if (isStale && applicationCount < 3) {
    return {
      hoursPosted, isStale: true,
      suggestion: `Your job has been posted for ${hoursPosted}h with only ${applicationCount} applications. Boost visibility to attract more freelancers.`,
      recommendedAction: "boost",
      visibilityBoostFee: hoursPosted > 96 ? 9900 : 4900,
    };
  }

  if (isStale) {
    return {
      hoursPosted, isStale: true,
      suggestion: `Posted ${hoursPosted}h ago. Consider refreshing your listing or adjusting the budget.`,
      recommendedAction: "refresh",
    };
  }

  return { hoursPosted, isStale: false, suggestion: "Your job is still fresh. Give it more time.", recommendedAction: "wait" };
}

// ===== #29 NEGATIVE FEEDBACK LOOP =====
export async function getReputationModifier(freelancerId: string): Promise<{
  modifier: number;
  reason: string;
  recentRating: number;
  totalReviews: number;
  flagged: boolean;
}> {
  const reviews = await storage.getReviewsForUser(freelancerId);
  if (reviews.length === 0) return { modifier: 0, reason: "No reviews yet", recentRating: 0, totalReviews: 0, flagged: false };

  const recent = reviews.slice(-5);
  const recentAvg = recent.reduce((s, r) => s + r.rating, 0) / recent.length;
  const totalAvg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  let modifier = 0;
  let reason = "";
  let flagged = false;

  if (recentAvg < 2.0 && recent.length >= 3) {
    modifier = -30;
    reason = "Consistently low ratings — temporary match priority reduction";
    flagged = true;
  } else if (recentAvg < 3.0 && recent.length >= 3) {
    modifier = -15;
    reason = "Below-average recent ratings — slightly reduced visibility";
    flagged = true;
  } else if (recentAvg >= 4.5 && recent.length >= 3) {
    modifier = 10;
    reason = "Excellent recent ratings — boosted visibility";
  } else if (recentAvg >= 4.0) {
    modifier = 5;
    reason = "Good recent performance";
  }

  return { modifier, reason, recentRating: Math.round(recentAvg * 10) / 10, totalReviews: reviews.length, flagged };
}

// ===== #30 REFERRAL-BASED TRUST MULTIPLIER =====
export async function getReferralTrustBoost(freelancerId: string): Promise<{
  boost: number;
  isReferred: boolean;
  referrerTier: string | null;
  reason: string;
}> {
  try {
    const referrals = await storage.getReferralsByReferrer(freelancerId);
    const userReferral = referrals.find(r => r.referredUserId === freelancerId);

    if (userReferral && userReferral.status !== "pending") {
      const tierBoosts: Record<string, number> = { bronze: 10, silver: 12, gold: 15, platinum: 20 };
      const boost = tierBoosts[userReferral.tier || "bronze"] || 10;
      return { boost, isReferred: true, referrerTier: userReferral.tier, reason: `Referred user — +${boost}% trust score` };
    }

    if (referrals.length > 0) {
      const completedReferrals = referrals.filter(r => r.status === "completed");
      if (completedReferrals.length >= 5) return { boost: 15, isReferred: false, referrerTier: null, reason: "Active referrer with 5+ successful referrals" };
      if (completedReferrals.length >= 1) return { boost: 8, isReferred: false, referrerTier: null, reason: "Active referrer" };
    }
  } catch {}

  return { boost: 0, isReferred: false, referrerTier: null, reason: "No referral data" };
}

// ===== #31 COURSE COMPLETION BOOST =====
export async function getCourseCompletionBoost(freelancerId: string, jobCategory?: string): Promise<{
  boost: number;
  completedCourses: number;
  relevantCourses: string[];
  reason: string;
}> {
  try {
    const certificates = await storage.getUserCertificates(freelancerId);
    if (!certificates || certificates.length === 0) {
      return { boost: 0, completedCourses: 0, relevantCourses: [], reason: "No academy courses completed" };
    }

    const relevantCourses: string[] = [];
    for (const cert of certificates) {
      if (jobCategory && cert.courseName?.toLowerCase().includes(jobCategory.toLowerCase())) {
        relevantCourses.push(cert.courseName || "Unknown");
      }
    }

    const baseBoost = Math.min(certificates.length * 5, 15);
    const relevanceBoost = relevantCourses.length > 0 ? 20 : 0;
    const totalBoost = baseBoost + relevanceBoost;

    return {
      boost: totalBoost,
      completedCourses: certificates.length,
      relevantCourses,
      reason: relevantCourses.length > 0
        ? `Completed ${relevantCourses.length} relevant course(s) — +${totalBoost}% visibility`
        : `Completed ${certificates.length} academy course(s) — +${baseBoost}% visibility`,
    };
  } catch {
    return { boost: 0, completedCourses: 0, relevantCourses: [], reason: "Unable to check courses" };
  }
}

// ===== #32 REAL-TIME AVAILABILITY CHECK (STUB) =====
const availabilityCalendar = new Map<string, { available: boolean; nextSlot: string; timezone: string; busySlots: string[] }>();

export function setAvailability(freelancerId: string, data: { available: boolean; nextSlot?: string; timezone?: string; busySlots?: string[] }) {
  availabilityCalendar.set(freelancerId, {
    available: data.available,
    nextSlot: data.nextSlot || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    timezone: data.timezone || "Africa/Johannesburg",
    busySlots: data.busySlots || [],
  });
}

export function checkAvailability(freelancerId: string): { available: boolean; nextSlot: string; timezone: string; busySlots: string[] } {
  return availabilityCalendar.get(freelancerId) || { available: true, nextSlot: new Date().toISOString(), timezone: "Africa/Johannesburg", busySlots: [] };
}

// ===== #33 MULTI-SKILL WEIGHTING =====
export function multiSkillMatch(requiredSkills: { skill: string; weight: number }[], freelancerSkills: string[]): {
  weightedScore: number;
  breakdown: { skill: string; weight: number; matched: boolean; contribution: number }[];
  totalWeight: number;
} {
  const freelancerNorm = freelancerSkills.map(s => s.toLowerCase().trim());
  const breakdown = requiredSkills.map(({ skill, weight }) => {
    const skillNorm = skill.toLowerCase().trim();
    const matched = freelancerNorm.some(fs => fs.includes(skillNorm) || skillNorm.includes(fs));
    return { skill, weight, matched, contribution: matched ? weight : 0 };
  });

  const totalWeight = requiredSkills.reduce((s, r) => s + r.weight, 0);
  const achievedWeight = breakdown.reduce((s, b) => s + b.contribution, 0);
  const weightedScore = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;

  return { weightedScore, breakdown, totalWeight };
}

// ===== #34 CLIENT SATISFACTION PREDICTION =====
export async function predictClientSatisfaction(clientId: string, freelancerId: string): Promise<{
  satisfactionScore: number;
  basedOn: string;
  previousHires: number;
  avgRatingGiven: number;
  prediction: string;
}> {
  const reviews = await storage.getReviewsForUser(freelancerId);
  const clientReviews = reviews.filter(r => r.reviewerId === clientId);

  if (clientReviews.length > 0) {
    const avgRating = clientReviews.reduce((s, r) => s + r.rating, 0) / clientReviews.length;
    return {
      satisfactionScore: Math.round((avgRating / 5) * 100),
      basedOn: "Previous direct hire history",
      previousHires: clientReviews.length,
      avgRatingGiven: Math.round(avgRating * 10) / 10,
      prediction: avgRating >= 4 ? "High satisfaction expected — repeat client match" : "Mixed history — review previous feedback",
    };
  }

  const allReviews = reviews.filter(r => r.reviewerId !== freelancerId);
  if (allReviews.length > 0) {
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    return {
      satisfactionScore: Math.round((avgRating / 5) * 100),
      basedOn: "Overall freelancer ratings from all clients",
      previousHires: 0,
      avgRatingGiven: Math.round(avgRating * 10) / 10,
      prediction: avgRating >= 4 ? "Good satisfaction expected based on other clients' experience" : "Average satisfaction — verify skills match",
    };
  }

  return { satisfactionScore: 50, basedOn: "No review data available — default estimate", previousHires: 0, avgRatingGiven: 0, prediction: "Insufficient data for prediction" };
}

// ===== #35 AUTO-REPLY TEMPLATES =====
export function generateAutoReplyTemplates(freelancerName: string, hourlyRate: number, skills: string[]): {
  templates: { id: string; label: string; message: string; tone: string }[];
} {
  const rate = hourlyRate > 0 ? `R${hourlyRate}/hr` : "competitive rates";
  const topSkills = skills.slice(0, 3).join(", ") || "my expertise";
  return {
    templates: [
      { id: "quick-start", label: "Quick Start", message: `Hi! I'm ${freelancerName} and I can start tomorrow at ${rate}. I specialise in ${topSkills}. Let me know if you'd like to discuss the details!`, tone: "eager" },
      { id: "professional", label: "Professional", message: `Thank you for considering me. With experience in ${topSkills}, I'm confident I can deliver quality work at ${rate}. I'd love to discuss the project scope in more detail.`, tone: "formal" },
      { id: "budget-flex", label: "Budget Flexible", message: `Hi! I'm very interested in this project. My standard rate is ${rate}, but I'm flexible for the right opportunity. Shall we chat about the scope?`, tone: "friendly" },
      { id: "portfolio", label: "Portfolio Focus", message: `Hi! I specialise in ${topSkills} and have completed similar projects. Check out my portfolio and reviews — I'd be happy to provide references. Available at ${rate}.`, tone: "confident" },
      { id: "same-day", label: "Same Day Available", message: `I'm available today and can start immediately! My rate is ${rate} for ${topSkills}. Let's get this done.`, tone: "urgent" },
    ],
  };
}

// ===== #36 VOICE-TO-TEXT JOB POST STUB =====
export function voiceToTextStub(audioBlob?: any): {
  supported: boolean;
  instructions: string;
  sampleOutput: { title: string; description: string; category: string };
} {
  return {
    supported: true,
    instructions: "Use your device microphone to describe your job. We'll convert speech to text and create a job post. Supported languages: English, Afrikaans, Zulu, Xhosa.",
    sampleOutput: {
      title: "Plumber needed for bathroom renovation",
      description: "I need a plumber to install new fixtures in my bathroom including a shower, basin, and toilet. The pipes need to be replaced as well.",
      category: "trades",
    },
  };
}

// ===== #37 IMAGE RECOGNITION STUB =====
export function imageRecognitionStub(imageDescription?: string): {
  supported: boolean;
  instructions: string;
  detectedRequirements: { category: string; suggestedTitle: string; skills: string[]; estimatedBudget: { min: number; max: number } };
} {
  const samples: Record<string, { category: string; suggestedTitle: string; skills: string[]; estimatedBudget: { min: number; max: number } }> = {
    pool: { category: "trades", suggestedTitle: "Pool Maintenance & Cleaning", skills: ["Pool maintenance", "Water treatment", "Equipment repair"], estimatedBudget: { min: 500, max: 1500 } },
    garden: { category: "trades", suggestedTitle: "Garden Landscaping & Maintenance", skills: ["Landscaping", "Irrigation", "Plant care"], estimatedBudget: { min: 300, max: 1200 } },
    kitchen: { category: "trades", suggestedTitle: "Kitchen Renovation", skills: ["Carpentry", "Plumbing", "Tiling"], estimatedBudget: { min: 5000, max: 30000 } },
    office: { category: "cleaning", suggestedTitle: "Office Deep Clean", skills: ["Commercial cleaning", "Sanitisation"], estimatedBudget: { min: 800, max: 3000 } },
    default: { category: "trades", suggestedTitle: "General Maintenance Required", skills: ["Handyman", "General repair"], estimatedBudget: { min: 300, max: 1500 } },
  };

  const desc = (imageDescription || "").toLowerCase();
  const match = Object.entries(samples).find(([k]) => k !== "default" && desc.includes(k));
  return {
    supported: true,
    instructions: "Upload a photo of the area that needs work. Our AI will detect the type of job and suggest appropriate service categories, skills required, and estimated budget.",
    detectedRequirements: match?.[1] || samples.default,
  };
}

// ===== #38 SENTIMENT ANALYSIS ON CLIENT REVIEWS =====
export async function analyzeReviewSentiment(reviews: { rating: number; comment: string; reviewerId: string }[]): Promise<{
  overallSentiment: "positive" | "neutral" | "negative" | "mixed";
  toxicityScore: number;
  flaggedReviews: { comment: string; reason: string }[];
  insights: string;
}> {
  if (reviews.length === 0) return { overallSentiment: "neutral", toxicityScore: 0, flaggedReviews: [], insights: "No reviews to analyze" };

  const toxicPatterns = [
    /\b(scam|fraud|thief|steal|con\s?artist|cheat|liar|criminal)\b/i,
    /\b(idiot|stupid|dumb|useless|incompetent|worthless)\b/i,
    /\b(threat|threaten|harass|abuse|bully)\b/i,
    /\b(never\s+pay|refuse.*pay|won't\s+pay|didn't\s+pay)\b/i,
    /\b(racist|sexist|discriminat)/i,
    /\b(dangerous|unsafe|risk|hazard)\b/i,
  ];

  const flaggedReviews: { comment: string; reason: string }[] = [];
  let toxicCount = 0;

  for (const review of reviews) {
    for (const pattern of toxicPatterns) {
      if (pattern.test(review.comment)) {
        flaggedReviews.push({ comment: review.comment.substring(0, 200), reason: `Contains concerning language: ${pattern.source.replace(/\\b|\(|\)|\\s/g, "")}` });
        toxicCount++;
        break;
      }
    }
  }

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const toxicityScore = Math.round((toxicCount / reviews.length) * 100);

  let overallSentiment: "positive" | "neutral" | "negative" | "mixed" = "neutral";
  if (avgRating >= 4 && toxicityScore < 10) overallSentiment = "positive";
  else if (avgRating < 2.5 || toxicityScore > 30) overallSentiment = "negative";
  else if (toxicityScore > 15) overallSentiment = "mixed";

  const insights = toxicCount > 0
    ? `${toxicCount} of ${reviews.length} reviews contain concerning language. Average rating: ${avgRating.toFixed(1)}. This client may be difficult to work with.`
    : `${reviews.length} reviews analyzed. Average rating: ${avgRating.toFixed(1)}. No toxic patterns detected.`;

  return { overallSentiment, toxicityScore, flaggedReviews: flaggedReviews.slice(0, 5), insights };
}

// ===== #39 DYNAMIC PRICING SUGGESTION =====
export async function suggestDynamicPricing(freelancerCategory: string, freelancerRate: number, freelancerLocation: string): Promise<{
  currentRate: number;
  suggestedRange: { min: number; max: number };
  demandLevel: "low" | "moderate" | "high" | "very_high";
  adjustment: number;
  reasoning: string;
  trend: string;
}> {
  const freelancers = await storage.searchFreelancers(freelancerCategory, undefined);
  const categoryRates = freelancers.filter(f => f.hourlyRate && f.hourlyRate > 0).map(f => f.hourlyRate! / 100);

  let demandLevel: "low" | "moderate" | "high" | "very_high" = "moderate";
  let demandMultiplier = 1.0;

  const totalFreelancers = freelancers.length;
  if (totalFreelancers < 5) { demandLevel = "very_high"; demandMultiplier = 1.3; }
  else if (totalFreelancers < 15) { demandLevel = "high"; demandMultiplier = 1.15; }
  else if (totalFreelancers < 30) { demandLevel = "moderate"; demandMultiplier = 1.0; }
  else { demandLevel = "low"; demandMultiplier = 0.9; }

  const marketRate = SA_MARKET_RATES[freelancerCategory.toLowerCase()] || SA_MARKET_RATES.default;
  const suggestedMin = Math.round(marketRate.min * demandMultiplier);
  const suggestedMax = Math.round(marketRate.max * demandMultiplier);
  const adjustment = Math.round((demandMultiplier - 1) * 100);

  const categoryAvg = categoryRates.length > 0 ? categoryRates.reduce((a, b) => a + b, 0) / categoryRates.length : 0;
  const position = freelancerRate > 0 && categoryAvg > 0 ? (freelancerRate > categoryAvg ? "above" : "below") : "unknown";

  return {
    currentRate: freelancerRate,
    suggestedRange: { min: suggestedMin, max: suggestedMax },
    demandLevel,
    adjustment,
    reasoning: `Based on ${totalFreelancers} freelancers in ${freelancerCategory}. Demand is ${demandLevel}. Your rate is ${position} the category average of R${Math.round(categoryAvg)}/hr.`,
    trend: demandLevel === "very_high" || demandLevel === "high" ? "Consider raising your rate — demand is strong" : "Keep competitive pricing to attract more clients",
  };
}

// ===== #40 BLOCKCHAIN CREDENTIALS + GREEN IMPACT (2031 VISION STUBS) =====
export function blockchainCredentialMock(freelancerId: string, credential: { type: string; issuer: string; date: string }): {
  credentialId: string;
  blockchainHash: string;
  verified: boolean;
  issuer: string;
  type: string;
  issuedDate: string;
  verificationUrl: string;
  chain: string;
} {
  const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const credId = `FS-CRED-${Date.now().toString(36).toUpperCase()}`;
  return {
    credentialId: credId,
    blockchainHash: hash,
    verified: true,
    issuer: credential.issuer,
    type: credential.type,
    issuedDate: credential.date,
    verificationUrl: `https://verify.freelanceskills.net/credential/${credId}`,
    chain: "Polygon (Testnet — 2031 Mainnet Migration Planned)",
  };
}

export function greenImpactBadge(freelancerId: string): {
  badge: string;
  carbonOffset: number;
  remoteJobsCompleted: number;
  treesPlanted: number;
  impactStatement: string;
  tier: "seedling" | "sapling" | "tree" | "forest";
} {
  const remoteJobs = Math.floor(Math.random() * 20) + 1;
  const carbonOffset = remoteJobs * 12.5;
  const treesPlanted = Math.floor(carbonOffset / 25);
  let tier: "seedling" | "sapling" | "tree" | "forest" = "seedling";
  if (remoteJobs > 15) tier = "forest";
  else if (remoteJobs > 10) tier = "tree";
  else if (remoteJobs > 5) tier = "sapling";

  return {
    badge: `🌿 Green Impact ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
    carbonOffset: Math.round(carbonOffset * 10) / 10,
    remoteJobsCompleted: remoteJobs,
    treesPlanted,
    impactStatement: `By completing ${remoteJobs} remote jobs, you've saved approximately ${carbonOffset.toFixed(1)}kg of CO₂ emissions — equivalent to planting ${treesPlanted} trees.`,
    tier,
  };
}

// ===== ENHANCED MATCHING ENGINE (combines #27, #29, #30, #31, #33) =====
export async function enhancedMatch(
  job: { title: string; skills: string[]; location: string; budget: number; category?: string; requiredSkillWeights?: { skill: string; weight: number }[] },
  freelancer: { id: string; skills: string[]; location: string; hourlyRate: number; rating: number; completedJobs: number; isPro: boolean }
): Promise<{
  totalScore: number;
  breakdown: {
    baseScore: number;
    locationBoost: number;
    reputationModifier: number;
    referralBoost: number;
    courseBoost: number;
    skillWeightScore: number;
  };
  matchReasons: string[];
}> {
  let baseScore = 0;
  const matchReasons: string[] = [];

  const ratingScore = (freelancer.rating / 500) * 30;
  baseScore += ratingScore;
  if (ratingScore > 25) matchReasons.push("Top-rated professional");

  const expScore = Math.min(freelancer.completedJobs * 2.5, 25);
  baseScore += expScore;
  if (freelancer.completedJobs > 10) matchReasons.push(`${freelancer.completedJobs} completed jobs`);

  if (freelancer.isPro) { baseScore += 10; matchReasons.push("Pro verified"); }

  if (job.budget && freelancer.hourlyRate) {
    const ratio = job.budget / (freelancer.hourlyRate / 100);
    if (ratio >= 0.8 && ratio <= 1.5) { baseScore += 15; matchReasons.push("Within budget"); }
    else if (ratio >= 0.5) baseScore += 8;
  }

  const loc = locationBoost(job.location, freelancer.location);
  if (loc.boost > 0) matchReasons.push(`${loc.distance}km away — local priority`);

  const rep = await getReputationModifier(freelancer.id);
  if (rep.modifier > 0) matchReasons.push(rep.reason);
  if (rep.flagged) matchReasons.push("⚠ Recent low ratings");

  const ref = await getReferralTrustBoost(freelancer.id);
  if (ref.boost > 0) matchReasons.push(ref.reason);

  const course = await getCourseCompletionBoost(freelancer.id, job.category);
  if (course.boost > 0) matchReasons.push(course.reason);

  let skillWeightScore = 0;
  if (job.requiredSkillWeights && job.requiredSkillWeights.length > 0) {
    const { weightedScore } = multiSkillMatch(job.requiredSkillWeights, freelancer.skills);
    skillWeightScore = weightedScore * 0.2;
    if (weightedScore >= 80) matchReasons.push("Excellent skill match");
    else if (weightedScore >= 50) matchReasons.push("Good skill coverage");
  } else {
    const skillGaps = await analyzeSkillGaps(job.skills, freelancer.skills);
    skillWeightScore = skillGaps.matchPercentage * 0.2;
    if (skillGaps.matchPercentage >= 80) matchReasons.push("Strong skill match");
    if (skillGaps.missing.length > 0) matchReasons.push(`Missing: ${skillGaps.missing.slice(0, 2).join(", ")}`);
  }

  const totalScore = Math.min(Math.round(baseScore + loc.boost + rep.modifier + ref.boost + course.boost + skillWeightScore), 100);

  return {
    totalScore,
    breakdown: {
      baseScore: Math.round(baseScore),
      locationBoost: loc.boost,
      reputationModifier: rep.modifier,
      referralBoost: ref.boost,
      courseBoost: course.boost,
      skillWeightScore: Math.round(skillWeightScore),
    },
    matchReasons,
  };
}
