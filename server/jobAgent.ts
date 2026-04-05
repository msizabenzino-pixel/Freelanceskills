/**
 * ════════════════════════════════════════════════════════════════════════════
 * FreelanceSkills — AI JOB INTELLIGENCE AGENT v3.0
 * Beats LinkedIn, Career24, PNet, Indeed SA, OfferZen until 2031
 *
 * Capabilities:
 *  • AI-generates diverse, realistic SA job listings via OpenAI
 *  • Auto-expires jobs past their deadline
 *  • Auto-upgrades (bumps) active quality jobs
 *  • 100-point quality scoring on every job
 *  • Multi-source simulation: PNet, Career24, LinkedIn, OfferZen, Indeed SA...
 *  • 100% SA-first: ZAR salaries, 9 provinces, BEE levels, SA companies
 *  • Self-healing: detects stale jobs and refreshes them
 * ════════════════════════════════════════════════════════════════════════════
 */

import OpenAI from "openai";
import { storage } from "./storage";
import { log } from "./index";
import type { InsertAggregatedJob } from "@shared/models/jobs";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// ── Constants ────────────────────────────────────────────────────────────────

const SA_PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Limpopo", "Mpumalanga", "Free State", "North West", "Northern Cape",
];

const SA_CITIES: Record<string, string[]> = {
  "Gauteng": ["Johannesburg", "Pretoria", "Sandton", "Midrand", "Centurion", "Soweto", "Randburg", "Roodepoort"],
  "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "George", "Bellville", "Hermanus", "Somerset West"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay", "Empangeni", "Ladysmith", "Newcastle"],
  "Eastern Cape": ["Port Elizabeth", "East London", "Gqeberha", "Mthatha", "Uitenhage", "Grahamstown"],
  "Limpopo": ["Polokwane", "Tzaneen", "Phalaborwa", "Louis Trichardt", "Mokopane"],
  "Mpumalanga": ["Nelspruit", "Witbank", "Secunda", "Barberton", "Standerton"],
  "Free State": ["Bloemfontein", "Welkom", "Sasolburg", "Phuthaditjhaba", "Kroonstad"],
  "North West": ["Rustenburg", "Klerksdorp", "Potchefstroom", "Mahikeng", "Brits"],
  "Northern Cape": ["Kimberley", "Upington", "Springbok", "Kuruman", "Kathu"],
};

const JOB_SOURCES = [
  "PNet", "Career24", "LinkedIn", "Indeed SA", "CareerJunction",
  "OfferZen", "Bizcommunity", "JobMail", "Government Vacancies", "BestJobs",
];

const CATEGORIES = [
  "Software Engineering", "Data Science & AI", "Cybersecurity", "Cloud & DevOps",
  "Finance & Accounting", "Sales & Business Development", "Marketing & Digital",
  "Healthcare & Medical", "Legal & Compliance", "Engineering (Civil/Structural)",
  "Engineering (Electrical)", "Engineering (Mechanical)", "Mining & Resources",
  "Trades (Plumbing)", "Trades (Electrical)", "Trades (Construction)",
  "Education & Training", "Human Resources", "Supply Chain & Logistics",
  "Retail & FMCG", "Hospitality & Tourism", "Agriculture & Farming",
  "Banking & Insurance", "Project Management", "Creative & Design",
  "Customer Service", "Operations & Admin", "Environmental & ESG",
  "Manufacturing", "Government & Public Sector",
];

const JOB_TYPES = ["full-time", "part-time", "contract", "freelance", "internship", "learnership"] as const;
const EXPERIENCE_LEVELS = ["entry", "junior", "mid", "senior", "executive"] as const;
const COMPANY_SIZES = ["startup (1-10)", "small (11-50)", "medium (51-200)", "large (201-1000)", "enterprise (1000+)"];
const BEE_LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4", "Exempt Micro Enterprise"];

// Salary ranges per category (ZAR per month)
const SALARY_RANGES: Record<string, [number, number]> = {
  "Software Engineering": [35000, 120000],
  "Data Science & AI": [40000, 140000],
  "Cybersecurity": [45000, 130000],
  "Cloud & DevOps": [40000, 120000],
  "Finance & Accounting": [25000, 95000],
  "Sales & Business Development": [20000, 80000],
  "Marketing & Digital": [18000, 75000],
  "Healthcare & Medical": [22000, 100000],
  "Legal & Compliance": [30000, 120000],
  "Engineering (Civil/Structural)": [30000, 100000],
  "Engineering (Electrical)": [28000, 95000],
  "Engineering (Mechanical)": [28000, 90000],
  "Mining & Resources": [25000, 110000],
  "Trades (Plumbing)": [15000, 45000],
  "Trades (Electrical)": [15000, 50000],
  "Trades (Construction)": [12000, 40000],
  "Education & Training": [14000, 55000],
  "Human Resources": [18000, 70000],
  "Supply Chain & Logistics": [18000, 65000],
  "Retail & FMCG": [8000, 35000],
  "Hospitality & Tourism": [8000, 30000],
  "Agriculture & Farming": [8000, 25000],
  "Banking & Insurance": [22000, 90000],
  "Project Management": [35000, 110000],
  "Creative & Design": [15000, 70000],
  "Customer Service": [8000, 28000],
  "Operations & Admin": [10000, 45000],
  "Environmental & ESG": [25000, 80000],
  "Manufacturing": [12000, 50000],
  "Government & Public Sector": [14000, 60000],
};

// ── AI Score Calculator ───────────────────────────────────────────────────────

function calculateAIScore(job: Partial<InsertAggregatedJob>): number {
  let score = 50;

  // Description quality
  if (job.description && job.description.length > 300) score += 10;
  if (job.description && job.description.length > 600) score += 5;

  // Requirements provided
  if (job.requirements && job.requirements.length > 100) score += 8;

  // Salary transparency
  if (job.salaryMin && job.salaryMax) score += 12;
  if (job.salaryMin && !job.salaryMax) score += 5;

  // Skills listed
  if (job.skills && job.skills.split(",").length >= 3) score += 8;
  if (job.skills && job.skills.split(",").length >= 6) score += 4;

  // Experience level specified
  if (job.experienceLevel) score += 5;

  // Company size info
  if (job.companySize) score += 3;

  // BEE level
  if (job.beeLevel) score += 3;

  // Urgency (creates urgency for applicants)
  if (job.isUrgent) score += 2;

  // Cap at 100
  return Math.min(100, score);
}

// ── OpenAI Job Generation ─────────────────────────────────────────────────────

interface GeneratedJob {
  title: string;
  company: string;
  description: string;
  requirements: string;
  skills: string;
  salaryMin: number;
  salaryMax: number;
  isUrgent: boolean;
  companySize: string;
  beeLevel: string;
}

async function generateJobsWithAI(
  category: string,
  province: string,
  count: number = 3,
): Promise<GeneratedJob[]> {
  const city = SA_CITIES[province]?.[Math.floor(Math.random() * (SA_CITIES[province]?.length ?? 1))] ?? province;
  const salaryRange = SALARY_RANGES[category] || [15000, 60000];
  const minSal = salaryRange[0];
  const maxSal = salaryRange[1];

  const prompt = `You are a senior SA recruitment expert. Generate ${count} realistic, diverse job listings for the category "${category}" based in ${city}, ${province}, South Africa.

IMPORTANT RULES:
- South African context: use local companies, SA legislation references (BCEA, LRA, Skills Development Act), ZAR salaries
- Make each job distinct — different seniority levels, different companies
- Company names must be realistic SA companies (not fictional)
- Salaries in ZAR/month, range: R${minSal.toLocaleString()} – R${maxSal.toLocaleString()}
- Skills should be comma-separated, specific and market-relevant
- Requirements should be practical and specific to SA job market

Respond ONLY with a valid JSON array. No markdown, no preamble.
Format: [{"title":"...","company":"...","description":"...","requirements":"...","skills":"skill1,skill2,skill3,skill4,skill5","salaryMin":30000,"salaryMax":55000,"isUrgent":false,"companySize":"medium (51-200)","beeLevel":"Level 2"}]`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85,
    max_tokens: 2500,
  });

  const raw = resp.choices[0]?.message?.content?.trim() || "[]";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed: GeneratedJob[] = JSON.parse(cleaned);
  return Array.isArray(parsed) ? parsed.slice(0, count) : [];
}

// ── Fallback: Deterministic Job Generator (no AI needed) ────────────────────

const COMPANIES_BY_CATEGORY: Record<string, string[]> = {
  "Software Engineering": ["DVT", "EOH", "iOCO", "BBD Software", "Synthesis Software", "C2 Digital", "Derivco", "Dariel Software"],
  "Data Science & AI": ["Standard Bank", "Nedbank", "Discovery Health", "MultiChoice", "Vodacom SA", "MTN", "DataOrbis", "Aerobotics"],
  "Finance & Accounting": ["Deloitte SA", "PwC South Africa", "KPMG SA", "Grant Thornton", "BDO South Africa", "Nkonki Inc", "Sizwe Ntsaluba Gobodo"],
  "Healthcare & Medical": ["Netcare", "Mediclinic", "Life Healthcare", "Discovery Health", "GEMS", "National Health Laboratory Service"],
  "Mining & Resources": ["Anglo American", "Sibanye-Stillwater", "Impala Platinum", "Gold Fields", "Exxaro Resources", "African Rainbow Minerals"],
  "Trades (Plumbing)": ["ABB SA", "Servest", "G4S South Africa", "WBHO Construction", "Murray & Roberts"],
  "Trades (Electrical)": ["Energize Electrical", "Zest WEG", "Powertech Transformers", "ABB SA", "Siemens SA"],
  "Education & Training": ["Wits University", "UCT", "Stellenbosch University", "UNISA", "Curro Holdings", "ADvTECH"],
  "Legal & Compliance": ["ENSafrica", "Webber Wentzel", "Bowmans", "Cliffe Dekker Hofmeyr", "Norton Rose Fulbright"],
  "Engineering (Civil/Structural)": ["WBHO", "Murray & Roberts", "Aveng Group", "Stefanutti Stocks", "Group Five", "Aurecon"],
  "Marketing & Digital": ["Ogilvy SA", "TBWA South Africa", "JWT South Africa", "Digitas Liquorice", "Retroviral", "Flow Communications"],
  "Government & Public Sector": ["City of Cape Town", "City of Johannesburg", "Eskom", "Transnet", "SARS", "DPSA"],
  "Banking & Insurance": ["Standard Bank", "FNB", "ABSA", "Nedbank", "Capitec", "Old Mutual", "Sanlam", "Momentum"],
  "Agriculture & Farming": ["Tongaat Hulett", "Afgri", "Senwes", "GWK", "NWK", "Pioneer Foods", "Tiger Brands"],
  "Retail & FMCG": ["Woolworths SA", "Shoprite", "Pick n Pay", "Spar Group", "Massmart", "TFG", "The Foschini Group"],
  "Hospitality & Tourism": ["Sun International", "Tsogo Sun", "City Lodge Hotels", "Protea Hotels", "Southern Sun"],
  "Human Resources": ["LabourNet", "Workforce Holdings", "Adcorp", "Kelly Group", "Manpower SA"],
  "Supply Chain & Logistics": ["Imperial Logistics", "Barloworld Logistics", "Unitrans", "DHL South Africa", "Bidvest Logistics"],
  "Project Management": ["Aurecon", "WSP Africa", "Zutari", "SRK Consulting", "Hatch", "SMEC South Africa"],
  "Creative & Design": ["Nando's SA (Design)", "Reprise Digital", "The Jupiter Drawing Room", "Joe Public United"],
  "Sales & Business Development": ["Salesforce SA", "Microsoft SA", "SAP Africa", "Oracle SA", "Huawei SA"],
  "Cybersecurity": ["Dimension Data", "NEC XON", "BDO IT", "Deloitte Cyber", "Accenture SA", "Liquid C2"],
  "Cloud & DevOps": ["Amazon SA", "Microsoft Azure SA", "Google Cloud SA", "Accenture SA", "Dimension Data"],
  "Customer Service": ["Teleperformance SA", "WNS SA", "Webhelp SA", "iContact BPO", "CCI Call Centre"],
  "Operations & Admin": ["Bidvest Services", "Tsebo Solutions", "Servest SA", "G4S South Africa", "ISS Facility Services"],
  "Environmental & ESG": ["CSIR", "SANBI", "Zutari", "Royal HaskoningDHV", "WSP Africa"],
  "Manufacturing": ["Toyota SA", "Volkswagen SA", "BMW SA", "Sasol", "AECI", "PPC Cement"],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getCompanyForCategory(category: string): string {
  const pool = COMPANIES_BY_CATEGORY[category];
  if (pool && pool.length > 0) return pickRandom(pool);
  return pickRandom([
    "Accenture SA", "Deloitte SA", "PwC South Africa", "KPMG SA",
    "Standard Bank", "FNB", "Vodacom SA", "MTN SA", "Capitec Bank",
    "Shoprite Holdings", "Old Mutual", "Sanlam", "Anglo American",
    "Naspers", "MultiChoice SA", "Pick n Pay", "Woolworths SA",
  ]);
}

function generateFallbackJob(category: string, province: string, source: string): InsertAggregatedJob {
  const cityList = SA_CITIES[province] || [province];
  const city = pickRandom(cityList);
  const salaryRange = SALARY_RANGES[category] || [15000, 60000];
  const expLevel = pickRandom(EXPERIENCE_LEVELS as unknown as string[]);
  const jobType = pickRandom(JOB_TYPES as unknown as string[]);
  const company = getCompanyForCategory(category);
  const isRemote = Math.random() < 0.35;
  const isUrgent = Math.random() < 0.2;

  const salFactor = expLevel === "entry" ? 0.5 : expLevel === "junior" ? 0.65 : expLevel === "mid" ? 0.8 : expLevel === "senior" ? 0.95 : 1.1;
  const salMin = Math.round(salaryRange[0] * salFactor / 1000) * 1000;
  const salMax = Math.round(salaryRange[1] * salFactor / 1000) * 1000;

  const skillsPool: Record<string, string[]> = {
    "Software Engineering": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS", "Python", "REST APIs", "Git"],
    "Data Science & AI": ["Python", "R", "SQL", "TensorFlow", "scikit-learn", "Power BI", "Tableau", "Machine Learning", "NLP", "Spark"],
    "Finance & Accounting": ["IFRS", "GAAP", "Pastel", "Xero", "Excel", "Financial Modelling", "Tax Compliance", "Audit", "Management Accounts"],
    "Healthcare & Medical": ["Patient Assessment", "Clinical Documentation", "HPCSA Registration", "BLS", "EMR Systems", "ICD-10 Coding"],
    "Legal & Compliance": ["POPIA", "Companies Act", "Contract Drafting", "Litigation", "FICA", "Due Diligence", "LegalEase"],
    "Engineering (Civil/Structural)": ["AutoCAD", "Revit", "STAAD Pro", "MS Project", "Primavera", "SANS Standards", "Earthworks"],
    "Marketing & Digital": ["Google Ads", "Meta Ads", "SEO", "Copywriting", "HubSpot", "Salesforce Marketing", "Content Strategy", "GA4"],
    "Mining & Resources": ["Blast Design", "Ventilation", "Rock Mechanics", "Mine Planning", "SHE Management", "ISO 45001"],
    "Trades (Plumbing)": ["Pipe Fitting", "Geyser Installation", "COC Certificate", "Drainage", "Gas Installation", "PIRB Registration"],
    "Trades (Electrical)": ["Wiring", "DB Board", "Motor Control", "ECSA Registration", "COC Certificate", "PLC Programming"],
    "Human Resources": ["Recruitment", "BCEA", "LRA", "Payroll", "HRIS", "Training & Development", "IR", "Employment Equity"],
    "Project Management": ["PMP", "PRINCE2", "Agile", "Scrum", "MS Project", "Risk Management", "Stakeholder Management"],
    "Cybersecurity": ["SIEM", "Penetration Testing", "ISO 27001", "POPIA", "Threat Intelligence", "CEH", "CISSP", "Incident Response"],
  };

  const skills = (skillsPool[category] || ["MS Office", "Communication", "Problem Solving", "Teamwork", "Analytical Thinking"]);
  const selectedSkills = skills.sort(() => Math.random() - 0.5).slice(0, Math.min(6, skills.length)).join(", ");

  const titlePrefixes: Record<string, string[]> = {
    "entry": ["Junior", "Graduate", "Trainee", "Associate", "Entry-Level"],
    "junior": ["Junior", "Associate", "Assistant"],
    "mid": ["", "Experienced", "Specialist"],
    "senior": ["Senior", "Lead", "Principal"],
    "executive": ["Head of", "Director of", "Chief", "VP of"],
  };
  const prefix = pickRandom(titlePrefixes[expLevel] || [""]);
  const baseTitle = category.replace(/\s*\(.*\)/, "").split(" ").slice(-2).join(" ");
  const title = prefix ? `${prefix} ${baseTitle} Specialist` : `${baseTitle} Specialist`;

  const description = `${company} is seeking a ${expLevel}-level ${title} to join our ${province} team${isRemote ? " (Remote)" : ` based in ${city}`}.

This is an exciting opportunity to work with one of South Africa's leading organisations in the ${category} sector. ${isUrgent ? "⚡ URGENT: This position needs to be filled immediately." : ""}

Key Responsibilities:
• Lead and deliver ${category.toLowerCase()} projects from inception to completion
• Collaborate with cross-functional teams across our SA operations
• Ensure compliance with relevant South African legislation and industry standards
• Contribute to the organisation's transformation and BEE objectives
• Mentor junior team members and share expertise

What We Offer:
• Market-related salary: R${salMin.toLocaleString()} – R${salMax.toLocaleString()} per month CTC
• Performance bonuses & 13th cheque
• Medical aid & provident fund contribution
• Professional development budget
• Hybrid/flexible working arrangements
• 21 days annual leave`;

  const requirements = `Minimum Requirements:
• ${expLevel === "entry" ? "Relevant degree/diploma in progress or completed" : `${expLevel === "junior" ? "1-2" : expLevel === "mid" ? "3-5" : expLevel === "senior" ? "6-10" : "10+"} years' experience in ${category}`}
• ${expLevel === "entry" ? "Willingness to learn and grow" : `Proven track record in ${category.toLowerCase()}`}
• South African citizenship or valid work permit
• ${isRemote ? "Reliable internet connection and home office setup" : `Own reliable transport or based in ${city}`}
• Strong communication skills (English; additional SA language an advantage)
• Commitment to transformation and EE objectives`;

  const daysUntilExpiry = isUrgent ? 7 : Math.floor(Math.random() * 21) + 10;
  const expiresAt = new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000);

  const job: InsertAggregatedJob & { aiScore?: number; skills?: string; isUrgent?: boolean; isRemote?: boolean; companySize?: string; beeLevel?: string; agentGenerated?: boolean } = {
    title,
    company,
    description,
    requirements,
    location: isRemote ? "Remote" : city,
    province,
    salaryMin: salMin,
    salaryMax: salMax,
    salaryPeriod: "month",
    source,
    sourceUrl: `https://${source.toLowerCase().replace(/\s+/g, "")}.co.za/jobs`,
    category,
    jobType,
    experienceLevel: expLevel,
    postedDate: new Date(),
    expiresAt,
    isActive: true,
    aiScore: 0,
    skills: selectedSkills,
    isUrgent,
    isRemote,
    applicationCount: Math.floor(Math.random() * 45),
    viewCount: Math.floor(Math.random() * 200) + 10,
    upgradeCount: 0,
    companySize: pickRandom(COMPANY_SIZES),
    beeLevel: pickRandom(BEE_LEVELS),
    agentGenerated: true,
  };

  (job as any).aiScore = calculateAIScore(job);
  return job as InsertAggregatedJob;
}

// ── Public Agent Functions ────────────────────────────────────────────────────

export interface AgentSyncResult {
  generated: number;
  expired: number;
  upgraded: number;
  errors: string[];
  duration: number;
  totalActive: number;
}

/**
 * Generate a batch of new jobs using AI or fallback deterministic generator.
 * @param batchSize How many jobs to create (default: 20)
 * @param useAI Whether to use OpenAI (slower, higher quality) or deterministic fallback
 */
export async function runJobGenerationAgent(
  batchSize: number = 20,
  useAI: boolean = true,
): Promise<{ generated: number; errors: string[] }> {
  const errors: string[] = [];
  let generated = 0;
  const jobsToInsert: InsertAggregatedJob[] = [];

  const selectedCategories = CATEGORIES.sort(() => Math.random() - 0.5).slice(0, Math.min(batchSize, CATEGORIES.length));

  for (const category of selectedCategories) {
    const province = pickRandom(SA_PROVINCES);
    const source = pickRandom(JOB_SOURCES);

    if (useAI && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      try {
        const aiJobs = await generateJobsWithAI(category, province, 2);
        for (const aj of aiJobs) {
          const city = SA_CITIES[province]?.[0] ?? province;
          const salaryRange = SALARY_RANGES[category] || [15000, 60000];
          const isUrgent = Math.random() < 0.2;
          const isRemote = Math.random() < 0.3;

          const job: InsertAggregatedJob & Record<string, any> = {
            title: aj.title,
            company: aj.company,
            description: aj.description,
            requirements: aj.requirements,
            location: isRemote ? "Remote" : city,
            province,
            salaryMin: aj.salaryMin || salaryRange[0],
            salaryMax: aj.salaryMax || salaryRange[1],
            salaryPeriod: "month",
            source,
            sourceUrl: `https://${source.toLowerCase().replace(/\s+/g, "")}.co.za/jobs`,
            category,
            jobType: pickRandom(JOB_TYPES as unknown as string[]),
            experienceLevel: pickRandom(EXPERIENCE_LEVELS as unknown as string[]),
            postedDate: new Date(),
            expiresAt: new Date(Date.now() + (isUrgent ? 7 : Math.floor(Math.random() * 21) + 10) * 86400000),
            isActive: true,
            skills: aj.skills,
            isUrgent: aj.isUrgent ?? isUrgent,
            isRemote,
            applicationCount: Math.floor(Math.random() * 40),
            viewCount: Math.floor(Math.random() * 180) + 10,
            upgradeCount: 0,
            companySize: aj.companySize || pickRandom(COMPANY_SIZES),
            beeLevel: aj.beeLevel || pickRandom(BEE_LEVELS),
            agentGenerated: true,
          };
          job.aiScore = calculateAIScore(job);
          jobsToInsert.push(job);
        }
      } catch (err: any) {
        // Fallback to deterministic on AI error
        errors.push(`AI gen error (${category}): ${err.message} — using fallback`);
        jobsToInsert.push(generateFallbackJob(category, province, source));
      }
    } else {
      jobsToInsert.push(generateFallbackJob(category, province, source));
    }
  }

  // Batch insert
  if (jobsToInsert.length > 0) {
    try {
      await storage.createManyAggregatedJobs(jobsToInsert);
      generated = jobsToInsert.length;
    } catch (err: any) {
      errors.push(`DB insert error: ${err.message}`);
    }
  }

  log(`[JobAgent] Generated ${generated} jobs (${errors.length} errors)`, "agent");
  return { generated, errors };
}

/**
 * Expire all aggregated jobs past their expiresAt date.
 */
export async function runJobExpiryAgent(): Promise<{ expired: number; errors: string[] }> {
  const errors: string[] = [];
  let expired = 0;

  try {
    const expiredCount = await storage.expireOverdueAggregatedJobs();
    expired = expiredCount;
    log(`[JobAgent] Expired ${expired} overdue jobs`, "agent");
  } catch (err: any) {
    errors.push(`Expiry error: ${err.message}`);
    log(`[JobAgent] Expiry error: ${err.message}`, "agent");
  }

  return { expired, errors };
}

/**
 * Upgrade (bump) top-scoring active jobs that are > 3 days old.
 * This keeps quality jobs visible without expiring them.
 */
export async function runJobUpgradeAgent(): Promise<{ upgraded: number; errors: string[] }> {
  const errors: string[] = [];
  let upgraded = 0;

  try {
    const upgradedCount = await storage.upgradeStaleAggregatedJobs();
    upgraded = upgradedCount;
    log(`[JobAgent] Upgraded ${upgraded} stale quality jobs`, "agent");
  } catch (err: any) {
    errors.push(`Upgrade error: ${err.message}`);
    log(`[JobAgent] Upgrade error: ${err.message}`, "agent");
  }

  return { upgraded, errors };
}

/**
 * Full agent sync: generate + expire + upgrade.
 * Runs on cron schedule.
 */
export async function runFullJobAgentSync(batchSize: number = 20): Promise<AgentSyncResult> {
  const startedAt = Date.now();
  const errors: string[] = [];
  let generated = 0;
  let expired = 0;
  let upgraded = 0;

  try {
    // 1. Expire overdue jobs
    const expiryResult = await runJobExpiryAgent();
    expired = expiryResult.expired;
    errors.push(...expiryResult.errors);

    // 2. Upgrade stale quality jobs
    const upgradeResult = await runJobUpgradeAgent();
    upgraded = upgradeResult.upgraded;
    errors.push(...upgradeResult.errors);

    // 3. Generate fresh jobs
    const genResult = await runJobGenerationAgent(batchSize, true);
    generated = genResult.generated;
    errors.push(...genResult.errors);

    // 4. Clean jobs older than 30 days
    await storage.clearOldAggregatedJobs();

  } catch (err: any) {
    errors.push(`Full sync error: ${err.message}`);
    log(`[JobAgent] Full sync error: ${err.message}`, "agent");
  }

  const totalActive = await storage.getAggregatedJobCount();
  const duration = Date.now() - startedAt;

  log(`[JobAgent] Full sync: +${generated} generated, ${expired} expired, ${upgraded} upgraded in ${duration}ms`, "agent");

  return { generated, expired, upgraded, errors, duration, totalActive };
}

/**
 * Initial seed: populate the database with 100 diverse SA jobs.
 * Called once on first startup if DB is empty.
 */
export async function seedInitialJobs(): Promise<void> {
  try {
    const currentCount = await storage.getAggregatedJobCount();
    if (currentCount >= 80) {
      log(`[JobAgent] DB already has ${currentCount} active jobs — skipping seed`, "agent");
      return;
    }

    log(`[JobAgent] Seeding SA jobs (current: ${currentCount}, target: 100)...`, "agent");

    const allJobs: InsertAggregatedJob[] = [];

    // Generate 100 jobs across all categories and provinces
    for (let i = 0; i < 100; i++) {
      const category = CATEGORIES[i % CATEGORIES.length];
      const province = SA_PROVINCES[i % SA_PROVINCES.length];
      const source = JOB_SOURCES[i % JOB_SOURCES.length];
      allJobs.push(generateFallbackJob(category, province, source));
    }

    // Insert in batches of 25
    for (let i = 0; i < allJobs.length; i += 25) {
      await storage.createManyAggregatedJobs(allJobs.slice(i, i + 25));
    }

    log(`[JobAgent] Seeded 100 initial SA jobs successfully`, "agent");
  } catch (err: any) {
    log(`[JobAgent] Seed error: ${err.message}`, "agent");
  }
}

/**
 * Agent stats for admin dashboard.
 */
export async function getAgentStats() {
  const totalActive = await storage.getAggregatedJobCount();
  const allJobs = await storage.getAggregatedJobs();
  const urgent = allJobs.filter(j => (j as any).isUrgent).length;
  const remote = allJobs.filter(j => (j as any).isRemote).length;
  const aiGenerated = allJobs.filter(j => (j as any).agentGenerated).length;
  const avgScore = allJobs.length > 0
    ? Math.round(allJobs.reduce((s, j) => s + ((j as any).aiScore || 75), 0) / allJobs.length)
    : 0;

  const bySource = JOB_SOURCES.reduce((acc, src) => {
    acc[src] = allJobs.filter(j => j.source === src).length;
    return acc;
  }, {} as Record<string, number>);

  const byProvince = SA_PROVINCES.reduce((acc, p) => {
    acc[p] = allJobs.filter(j => j.province === p).length;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = CATEGORIES.reduce((acc, c) => {
    const count = allJobs.filter(j => j.category === c).length;
    if (count > 0) acc[c] = count;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalActive,
    urgent,
    remote,
    aiGenerated,
    avgScore,
    bySource,
    byProvince,
    byCategory,
    lastUpdated: new Date().toISOString(),
  };
}
