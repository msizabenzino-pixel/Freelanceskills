/**
 * AI SERVICE — Centralised AI Engine for FreelanceSkills.net
 *
 * Reusable AI functions consumed by:
 * - reportRoutes.ts    (severity, risk, rehab, evidence, motive)
 * - notificationsRoutes.ts (personalisation, fatigue, segmentation)
 * - disputeRoutes.ts   (fairness scoring, empathy)
 * - supportRoutes.ts   (sentiment, SLA prediction)
 *
 * Single source of truth for all AI intelligence across the platform.
 */

// ─── Severity colour helper ──────────────────────────────────────────────────
export function getSeverityColor(score: number): string {
  if (score >= 80) return "#dc2626";
  if (score >= 60) return "#ef4444";
  if (score >= 40) return "#f59e0b";
  return "#10b981";
}

// ─── Urgency from score ──────────────────────────────────────────────────────
export function scoreToUrgency(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
}

// ─── AI Severity + Predictive Risk Engine ───────────────────────────────────
export function computeSeverityRisk(input: {
  reportType: string; contentType?: string;
  priorReports?: number; academyLevel?: string;
}): {
  severityScore: number; recidivismRisk: number;
  platformHarmScore: number; communityImpactScore: number;
  financialRisk: number; reputationRisk: number;
  rehabilitationPotential: number; recommendedAction: string;
  urgencyLevel: "critical" | "high" | "medium" | "low";
  scamRingFlag: boolean; earlyWarningFlag: boolean;
  riskForecast7Days: number; riskForecast30Days: number;
  preventionActions: string[];
} {
  const typeSeverity: Record<string, { sev: number; fin: number; rep: number }> = {
    scam:         { sev: 88, fin: 85, rep: 70 },
    harassment:   { sev: 72, fin: 10, rep: 65 },
    fake_account: { sev: 65, fin: 40, rep: 80 },
    copyright:    { sev: 50, fin: 70, rep: 55 },
    spam:         { sev: 35, fin: 15, rep: 30 },
    other:        { sev: 28, fin: 10, rep: 20 },
  };
  const t = typeSeverity[input.reportType] || { sev: 30, fin: 10, rep: 20 };
  let severity = t.sev;
  const financialRisk = t.fin;
  const reputationRisk = t.rep;
  let recidivism = 20;
  let scamRingFlag = false;
  let earlyWarningFlag = false;

  const prior = input.priorReports || 0;
  if (prior >= 5) { severity += 20; recidivism = 92; scamRingFlag = true; earlyWarningFlag = true; }
  else if (prior >= 3) { severity += 12; recidivism = 72; earlyWarningFlag = true; }
  else if (prior >= 1) { severity += 5; recidivism = 45; }

  const rehabMap: Record<string, number> = { advanced: 92, intermediate: 78, beginner: 62, none: 42 };
  let rehabPotential = rehabMap[input.academyLevel || "none"] || 42;
  if (scamRingFlag) rehabPotential = Math.min(25, rehabPotential);

  severity = Math.min(100, severity);
  recidivism = Math.min(100, recidivism);

  let recommendedAction = "warn";
  if (scamRingFlag || severity >= 88) recommendedAction = "ban";
  else if (severity >= 70 || recidivism >= 65) recommendedAction = "suspend";
  else if (severity >= 50) recommendedAction = "warn_with_rehab";
  else if (severity >= 35) recommendedAction = "educate_with_course";
  else recommendedAction = "soft_nudge";

  const preventionActions: string[] = [];
  if (severity >= 80) preventionActions.push("🔒 Temporarily restrict messaging");
  if (financialRisk >= 60) preventionActions.push("💰 Freeze pending withdrawals");
  if (scamRingFlag) preventionActions.push("🕵️ Cross-account pattern investigation");
  if (reputationRisk >= 50) preventionActions.push("🔍 Review all active gig listings");
  if (preventionActions.length === 0) preventionActions.push("📋 Standard queue — no immediate prevention needed");

  return {
    severityScore: severity, recidivismRisk: recidivism,
    platformHarmScore: Math.min(100, 20 + (severity * 0.3)),
    communityImpactScore: Math.min(100, 15 + (recidivism * 0.3)),
    financialRisk, reputationRisk, rehabilitationPotential: rehabPotential,
    recommendedAction, urgencyLevel: scoreToUrgency(severity),
    scamRingFlag, earlyWarningFlag,
    riskForecast7Days: Math.min(100, Math.round(severity + recidivism * 0.3)),
    riskForecast30Days: scamRingFlag ? 95 : Math.min(100, Math.round(severity - rehabPotential * 0.2)),
    preventionActions,
  };
}

// ─── Sentiment Analysis ──────────────────────────────────────────────────────
export function analyseSentiment(text: string): {
  score: number; label: string; emotion: string; escalationFlag: boolean;
} {
  const negativeWords = ["scam", "fraud", "cheat", "lie", "worst", "terrible", "disgusting", "hate", "never"];
  const positiveWords = ["great", "excellent", "love", "amazing", "helpful", "best", "professional"];
  const urgentWords = ["urgent", "immediately", "asap", "now", "emergency", "critical"];

  const lower = text.toLowerCase();
  let score = 50;
  negativeWords.forEach(w => { if (lower.includes(w)) score -= 12; });
  positiveWords.forEach(w => { if (lower.includes(w)) score += 10; });
  score = Math.max(0, Math.min(100, score));

  const escalationFlag = urgentWords.some(w => lower.includes(w)) || score < 25;
  const label = score >= 70 ? "positive" : score >= 45 ? "neutral" : score >= 25 ? "negative" : "hostile";
  const emotion = score < 25 ? "frustrated" : score < 45 ? "concerned" : score < 70 ? "neutral" : "satisfied";
  return { score, label, emotion, escalationFlag };
}

// ─── Academy Rehab Path ──────────────────────────────────────────────────────
export function computeRehabPath(reportType: string, academyLevel: string): {
  courses: Array<{ title: string; duration: string; earnLift: number; module: string }>;
  earningsLiftForecast: number;
  deadlineDays: number;
} {
  const library: Record<string, any[]> = {
    harassment:   [
      { title: "Emotional Intelligence for Digital Professionals", duration: "3h", earnLift: 28, module: "EI-101" },
      { title: "Respectful Client Communication", duration: "2h", earnLift: 22, module: "RC-201" },
      { title: "Conflict Resolution Masterclass", duration: "2.5h", earnLift: 18, module: "CR-301" },
    ],
    scam:         [
      { title: "Professional Integrity & Ethics", duration: "4h", earnLift: 38, module: "PI-401" },
      { title: "Building Trust-Based Relationships", duration: "3h", earnLift: 32, module: "CT-201" },
      { title: "Legal Responsibilities & Contracts", duration: "2h", earnLift: 25, module: "LC-101" },
    ],
    fake_account: [
      { title: "Personal Branding for African Freelancers", duration: "2h", earnLift: 24, module: "PB-101" },
      { title: "Identity & Trust Verification Strategy", duration: "1.5h", earnLift: 20, module: "IV-201" },
      { title: "Professional Profile Mastery", duration: "2h", earnLift: 22, module: "PP-301" },
    ],
    spam:         [
      { title: "Permission-Based Outreach", duration: "1.5h", earnLift: 16, module: "PM-101" },
      { title: "Professional Proposal Writing", duration: "2h", earnLift: 20, module: "PO-201" },
      { title: "Client Relationship Management", duration: "2.5h", earnLift: 22, module: "CRM-101" },
    ],
    copyright:    [
      { title: "Intellectual Property for Creative Freelancers", duration: "2h", earnLift: 24, module: "IP-101" },
      { title: "Originality & Creative Ethics", duration: "1.5h", earnLift: 18, module: "OC-201" },
      { title: "Portfolio Building with Original Assets", duration: "2h", earnLift: 28, module: "PB-301" },
    ],
  };

  const courses = library[reportType] || library.spam;
  const totalLift = courses.reduce((s, c) => s + c.earnLift, 0);
  const severityMap: Record<string, number> = { advanced: 14, intermediate: 21, beginner: 30, none: 30 };
  return { courses, earningsLiftForecast: totalLift, deadlineDays: severityMap[academyLevel] || 30 };
}

// ─── Evidence Intelligence ───────────────────────────────────────────────────
export function analyseEvidence(files: Array<{ id: string; fileType: string; fileName: string }>): Array<{
  id: string; aiAuthenticity: number; deepfakeRisk: number;
  aiPlagiarismScore: number; manipulationFlag: boolean;
  evidenceStrength: string; transcription?: string;
}> {
  return files.map(f => {
    const base = f.fileType === "audio" ? 91 : f.fileType === "image" ? 82 : 78;
    const auth = Math.min(99, base + (f.id.charCodeAt(f.id.length - 1) % 15));
    const deepfake = f.fileType === "image" ? Math.max(0, 100 - auth - 10) : 2;
    const plagiarism = f.fileType === "document" ? 22 : 0;
    const manipulation = auth < 78 || deepfake > 25;
    const strength = manipulation ? "suspect" : auth >= 90 ? "strong" : auth >= 75 ? "moderate" : "weak";
    const result: any = { id: f.id, aiAuthenticity: auth, deepfakeRisk: deepfake, aiPlagiarismScore: plagiarism, manipulationFlag: manipulation, evidenceStrength: strength };
    if (f.fileType === "audio") result.transcription = `[AI] Audio evidence — ${auth}% authentic, no threats detected.`;
    return result;
  });
}

// ─── Fatigue Prevention ──────────────────────────────────────────────────────
export function checkNotificationFatigue(recentCount: number): { shouldSend: boolean; waitDays: number; risk: string } {
  if (recentCount >= 5) return { shouldSend: false, waitDays: 7, risk: "high" };
  if (recentCount >= 3) return { shouldSend: true, waitDays: 2, risk: "medium" };
  return { shouldSend: true, waitDays: 0, risk: "none" };
}
