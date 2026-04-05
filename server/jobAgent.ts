/**
 * ════════════════════════════════════════════════════════════════════════════
 * FreelanceSkills — AI JOB INTELLIGENCE AGENT v4.0 (PAN-AFRICAN)
 * The most powerful job intelligence system on the African continent.
 *
 * Capabilities:
 *  • AI-generates diverse, realistic job listings across ALL of Africa
 *  • Covers 17 African countries, 80+ cities, 30+ categories
 *  • Auto-expires jobs past their deadline
 *  • Auto-upgrades (bumps) active quality jobs
 *  • 95-point quality scoring on every job
 *  • ZAR salaries for SA; local context for all African markets
 *  • Self-healing: detects stale jobs and refreshes them
 * ════════════════════════════════════════════════════════════════════════════
 */

import OpenAI from "openai";
import { storage } from "./storage";
import { log } from "./logger";
import type { InsertAggregatedJob } from "@shared/models/jobs";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// ── Constants ────────────────────────────────────────────────────────────────

// ── Pan-African Geography ─────────────────────────────────────────────────────

const AFRICAN_LOCATIONS: { region: string; cities: string[] }[] = [
  // South Africa (primary market)
  { region: "Gauteng", cities: ["Johannesburg", "Pretoria", "Sandton", "Midrand", "Centurion", "Soweto", "Randburg"] },
  { region: "Western Cape", cities: ["Cape Town", "Stellenbosch", "Paarl", "George", "Bellville", "Somerset West"] },
  { region: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg", "Richards Bay", "Empangeni", "Newcastle"] },
  { region: "Eastern Cape", cities: ["Gqeberha", "East London", "Mthatha", "Uitenhage", "Grahamstown"] },
  { region: "Limpopo", cities: ["Polokwane", "Tzaneen", "Phalaborwa", "Louis Trichardt"] },
  { region: "Mpumalanga", cities: ["Nelspruit", "Witbank", "Secunda", "Standerton"] },
  { region: "Free State", cities: ["Bloemfontein", "Welkom", "Sasolburg", "Kroonstad"] },
  { region: "North West", cities: ["Rustenburg", "Klerksdorp", "Potchefstroom", "Mahikeng"] },
  { region: "Northern Cape", cities: ["Kimberley", "Upington", "Springbok", "Kathu"] },
  // Nigeria
  { region: "Nigeria", cities: ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Kaduna"] },
  // Kenya
  { region: "Kenya", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"] },
  // Ghana
  { region: "Ghana", cities: ["Accra", "Kumasi", "Takoradi", "Tema", "Cape Coast"] },
  // Egypt
  { region: "Egypt", cities: ["Cairo", "Alexandria", "Giza", "Sharm El-Sheikh", "Hurghada"] },
  // Morocco
  { region: "Morocco", cities: ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier"] },
  // Ethiopia
  { region: "Ethiopia", cities: ["Addis Ababa", "Dire Dawa", "Mekelle", "Bahir Dar"] },
  // Tanzania
  { region: "Tanzania", cities: ["Dar es Salaam", "Arusha", "Mwanza", "Zanzibar City"] },
  // Uganda
  { region: "Uganda", cities: ["Kampala", "Entebbe", "Gulu", "Mbarara"] },
  // Rwanda
  { region: "Rwanda", cities: ["Kigali", "Butare", "Gitarama", "Musanze"] },
  // Senegal
  { region: "Senegal", cities: ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor"] },
  // Côte d'Ivoire
  { region: "Côte d'Ivoire", cities: ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa"] },
  // Zimbabwe
  { region: "Zimbabwe", cities: ["Harare", "Bulawayo", "Mutare", "Gweru"] },
  // Zambia
  { region: "Zambia", cities: ["Lusaka", "Ndola", "Kitwe", "Livingstone"] },
  // Botswana
  { region: "Botswana", cities: ["Gaborone", "Francistown", "Maun", "Serowe"] },
  // Namibia
  { region: "Namibia", cities: ["Windhoek", "Walvis Bay", "Swakopmund", "Oshakati"] },
  // Mozambique
  { region: "Mozambique", cities: ["Maputo", "Beira", "Nampula", "Tete"] },
];

// SA provinces kept for backward compatibility with existing schema queries
const SA_PROVINCES = AFRICAN_LOCATIONS.slice(0, 9).map(l => l.region);

// Legacy compatibility: SA_CITIES for fallback generator
const SA_CITIES: Record<string, string[]> = Object.fromEntries(
  AFRICAN_LOCATIONS.map(l => [l.region, l.cities])
);

// ── Internal Source Labels (no third-party brand names) ───────────────────────
// These are internal quality/trust tiers — no affiliation with any external platform.
const INTERNAL_SOURCES = [
  "FreelanceSkills AI",
  "Verified Employer",
  "Featured Listing",
  "Tech Hub Africa",
  "Government Portal",
  "Remote-First",
  "Startup Ecosystem",
  "Enterprise Direct",
  "Professional Network",
  "Industry Partner",
];

// All jobs point to FreelanceSkills apply flow
function getSourceUrl(_source: string): string {
  return "https://freelanceskills.net/jobs";
}

// Legacy alias for backward compat
const JOB_SOURCES = INTERNAL_SOURCES;

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
  "Fintech & Payments", "Telecommunications", "Property & Real Estate",
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

// ── Experience Level Inference ────────────────────────────────────────────────

/**
 * Infers experience level from job title to ensure title/level consistency.
 * Falls back to a random level if no keyword match is found.
 */
function inferExperienceLevelFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (/\b(chief|cto|cfo|coo|ceo|vp |vice president|director|head of|gm |general manager)\b/.test(t)) return "executive";
  if (/\b(senior|lead|principal|specialist|manager|architect|expert|master)\b/.test(t)) return "senior";
  if (/\b(junior|graduate|trainee|intern|learner|entry|entry-level|associate)\b/.test(t)) return "entry";
  if (/\b(assistant|coordinator)\b/.test(t)) return "junior";
  // Default: mid for untitled / generic roles
  const mids = ["mid", "senior", "junior"]; // weighted toward mid
  return mids[Math.floor(Math.random() * mids.length)];
}

// ── AI Score Calculator (Realistic Bell Curve) ────────────────────────────────

/**
 * Produces a realistic score distribution:
 *  • Most jobs: 65–82 (good, not exceptional)
 *  • Strong jobs: 82–90 (competitive salary, complete data)
 *  • Top jobs: 90–95 (rare, truly standout listings)
 *  • No job scores > 95 — nothing is perfect
 *
 * Key factors: salary competitiveness, description depth, skills specificity,
 *              data consistency (title vs level), category desirability.
 */
function calculateAIScore(job: Partial<InsertAggregatedJob & { category?: string }>): number {
  // Base: 42 — below-average starting point
  let score = 42;

  // ── 1. Salary competitiveness vs category median (+0 to +20) ─────────────
  if (job.salaryMin && job.salaryMax) {
    const range = SALARY_RANGES[(job as any).category || ""] || [15000, 60000];
    const categoryMid = (range[0] + range[1]) / 2;
    const jobMid = (job.salaryMin + job.salaryMax) / 2;
    const ratio = jobMid / categoryMid;
    if (ratio >= 1.25) score += 20;       // Top-quartile pay
    else if (ratio >= 1.05) score += 15;  // Above median
    else if (ratio >= 0.85) score += 10;  // At median
    else if (ratio >= 0.65) score += 5;   // Below median
    else score += 1;                       // Low pay
  } else if (job.salaryMin || job.salaryMax) {
    score += 4;  // Partial salary — partial credit
  }

  // ── 2. Description depth (+0 to +14) ─────────────────────────────────────
  const descLen = job.description?.length ?? 0;
  if (descLen > 900) score += 14;
  else if (descLen > 600) score += 10;
  else if (descLen > 350) score += 7;
  else if (descLen > 150) score += 3;

  // ── 3. Skills specificity (+0 to +10) ─────────────────────────────────────
  const skillCount = job.skills ? job.skills.split(",").filter(Boolean).length : 0;
  if (skillCount >= 7) score += 10;
  else if (skillCount >= 5) score += 8;
  else if (skillCount >= 3) score += 5;
  else if (skillCount >= 1) score += 2;

  // ── 4. Requirements detail (+0 to +8) ─────────────────────────────────────
  const reqLen = job.requirements?.length ?? 0;
  if (reqLen > 400) score += 8;
  else if (reqLen > 200) score += 5;
  else if (reqLen > 80) score += 3;

  // ── 5. Data completeness (+0 to +5) ──────────────────────────────────────
  if (job.experienceLevel) score += 1;
  if (job.companySize) score += 1;
  if (job.beeLevel) score += 1;
  if (job.jobType) score += 1;
  if (job.isRemote !== undefined && job.isRemote !== null) score += 1;

  // ── 6. Natural variance to prevent clustering (±8) ────────────────────────
  // Use seeded variance from company name length so it's deterministic per job
  const seed = (job.company?.length ?? 5) + (job.title?.length ?? 8);
  const variance = (seed % 17) - 8;  // -8 to +8
  score += variance;

  // ── 7. Deductions for data quality issues ─────────────────────────────────
  const title = (job.title || "").toLowerCase();
  const level = job.experienceLevel || "";

  // Title/level contradictions
  const isJuniorTitle = /\b(junior|trainee|graduate|intern|entry)\b/.test(title);
  const isSeniorTitle = /\b(senior|lead|principal|director|head of|chief|vp)\b/.test(title);

  if (isJuniorTitle && (level === "senior" || level === "executive")) score -= 12;
  if (isJuniorTitle && level === "mid") score -= 5;
  if (isSeniorTitle && (level === "entry" || level === "junior")) score -= 10;

  // Remote + hands-on trades = suspicious  
  if (job.isRemote && title.includes("electrician")) score -= 6;
  if (job.isRemote && title.includes("plumb")) score -= 6;
  if (job.isRemote && title.includes("site")) score -= 4;

  // Salary/seniority mismatch (senior title, entry salary)
  if (isSeniorTitle && job.salaryMax && job.salaryMax < 25000) score -= 8;

  // ── 8. Hard cap: min 45, max 95 ──────────────────────────────────────────
  return Math.min(95, Math.max(45, score));
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

  // Determine if this is a SA province or another African country
  const isSAJob = SA_PROVINCES.includes(province);
  const locationLabel = isSAJob ? `${city}, ${province}, South Africa` : `${city}, ${province}`;
  const currencyNote = isSAJob
    ? `ZAR salaries in range R${minSal.toLocaleString()} – R${maxSal.toLocaleString()}/month`
    : `Local currency equivalent to R${minSal.toLocaleString()} – R${maxSal.toLocaleString()} ZAR/month; mention currency in description if needed`;
  const contextNote = isSAJob
    ? "Reference SA legislation (BCEA, LRA, Skills Development Act, POPIA) where relevant."
    : `Reference local ${province} business context, labour laws, and market realities where relevant.`;
  const companyNote = isSAJob
    ? "Use realistic South African companies (not fictional)."
    : `Use realistic companies operating in ${province} — both local African companies and multinationals present in the region.`;

  const prompt = `You are a pan-African recruitment intelligence expert. Generate ${count} realistic, diverse, high-quality job listings for the category "${category}" located in ${locationLabel}.

RULES:
- ${companyNote}
- ${contextNote}
- ${currencyNote}
- Make each job distinct — different seniority levels, different companies, varied scopes
- Skills must be comma-separated, specific, and market-relevant for the African region
- Requirements must be practical and specific to the local job market
- Descriptions should be 3-4 sentences: role overview, responsibilities, why it's a great opportunity
- Avoid generic filler — every sentence should add real information

Respond ONLY with a valid JSON array. No markdown, no preamble. No explanation.
Format: [{"title":"...","company":"...","description":"...","requirements":"...","skills":"skill1,skill2,skill3,skill4,skill5","salaryMin":${minSal},"salaryMax":${maxSal},"isUrgent":false,"companySize":"medium (51-200)","beeLevel":"Level 2"}]`;

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
  // South Africa
  "Software Engineering": ["DVT", "EOH", "iOCO", "BBD Software", "Synthesis Software", "C2 Digital", "Derivco", "Dariel Software", "Flutterwave", "Paystack", "Andela", "Ushahidi"],
  "Data Science & AI": ["Standard Bank", "Nedbank", "Discovery Health", "MultiChoice", "Vodacom SA", "MTN", "DataOrbis", "Aerobotics", "Safaricom", "OCP Group", "Interswitch"],
  "Finance & Accounting": ["Deloitte SA", "PwC South Africa", "KPMG SA", "Grant Thornton", "BDO South Africa", "Nkonki Inc", "Access Bank", "Equity Bank Kenya", "Zenith Bank", "Ecobank"],
  "Healthcare & Medical": ["Netcare", "Mediclinic", "Life Healthcare", "Discovery Health", "GEMS", "National Health Laboratory Service", "Aga Khan Health Service", "AAR Healthcare"],
  "Mining & Resources": ["Anglo American", "Sibanye-Stillwater", "Impala Platinum", "Gold Fields", "Exxaro Resources", "African Rainbow Minerals", "Dangote Group", "OCP Morocco"],
  "Trades (Plumbing)": ["ABB SA", "Servest", "G4S South Africa", "WBHO Construction", "Murray & Roberts", "Julius Berger Nigeria"],
  "Trades (Electrical)": ["Energize Electrical", "Zest WEG", "Powertech Transformers", "ABB SA", "Siemens SA", "CEC Zambia", "Kenya Power"],
  "Education & Training": ["Wits University", "UCT", "Stellenbosch University", "UNISA", "Curro Holdings", "ADvTECH", "University of Nairobi", "Lagos Business School", "University of Ghana"],
  "Legal & Compliance": ["ENSafrica", "Webber Wentzel", "Bowmans", "Cliffe Dekker Hofmeyr", "Norton Rose Fulbright", "Udo Udoma & Belo-Osagie", "ALN Africa"],
  "Engineering (Civil/Structural)": ["WBHO", "Murray & Roberts", "Aveng Group", "Stefanutti Stocks", "Group Five", "Aurecon", "Julius Berger", "SEACOM"],
  "Marketing & Digital": ["Ogilvy SA", "TBWA South Africa", "JWT South Africa", "Digitas Liquorice", "Retroviral", "Flow Communications", "Noah's Ark Communications", "WPP Africa"],
  "Government & Public Sector": ["City of Cape Town", "City of Johannesburg", "Eskom", "Transnet", "SARS", "DPSA", "Kenya Revenue Authority", "National Communications Authority Ghana"],
  "Banking & Insurance": ["Standard Bank", "FNB", "ABSA", "Nedbank", "Capitec", "Old Mutual", "Sanlam", "Momentum", "Access Bank", "GTBank", "Equity Bank", "KCB Group", "Attijariwafa Bank"],
  "Agriculture & Farming": ["Tongaat Hulett", "Afgri", "Senwes", "GWK", "NWK", "Pioneer Foods", "Tiger Brands", "Twiga Foods", "Farmerline", "Hello Tractor"],
  "Retail & FMCG": ["Woolworths SA", "Shoprite", "Pick n Pay", "Spar Group", "Massmart", "TFG", "The Foschini Group", "Jumia", "Konga", "Melcom Ghana"],
  "Hospitality & Tourism": ["Sun International", "Tsogo Sun", "City Lodge Hotels", "Protea Hotels", "Southern Sun", "Sarova Hotels", "Serena Hotels", "Radisson Blu Africa"],
  "Human Resources": ["LabourNet", "Workforce Holdings", "Adcorp", "Kelly Group", "Manpower SA", "Frank Management Consult", "PeopleTree Group"],
  "Supply Chain & Logistics": ["Imperial Logistics", "Barloworld Logistics", "Unitrans", "DHL South Africa", "Bidvest Logistics", "Sendy", "Kobo360", "Lori Systems"],
  "Project Management": ["Aurecon", "WSP Africa", "Zutari", "SRK Consulting", "Hatch", "SMEC South Africa", "AFCONS Infrastructure", "Bechtel Africa"],
  "Creative & Design": ["Nando's SA (Design)", "Reprise Digital", "The Jupiter Drawing Room", "Joe Public United", "Ogilvy Africa", "Leo Burnett Africa"],
  "Sales & Business Development": ["Salesforce SA", "Microsoft SA", "SAP Africa", "Oracle SA", "Huawei Africa", "MTN Group", "Airtel Africa", "Safaricom"],
  "Cybersecurity": ["Dimension Data", "NEC XON", "BDO IT", "Deloitte Cyber", "Accenture SA", "Liquid C2", "Serianu", "CyberSafe Foundation"],
  "Cloud & DevOps": ["Amazon SA", "Microsoft Azure SA", "Google Cloud SA", "Accenture SA", "Dimension Data", "Andela", "Cellulant"],
  "Customer Service": ["Teleperformance SA", "WNS SA", "Webhelp SA", "iContact BPO", "CCI Call Centre", "Capita Africa", "Merchants"],
  "Operations & Admin": ["Bidvest Services", "Tsebo Solutions", "Servest SA", "G4S South Africa", "ISS Facility Services", "Ecobank Group", "I&M Group"],
  "Environmental & ESG": ["CSIR", "SANBI", "Zutari", "Royal HaskoningDHV", "WSP Africa", "African Wildlife Foundation", "GreenCape"],
  "Manufacturing": ["Toyota SA", "Volkswagen SA", "BMW SA", "Sasol", "AECI", "PPC Cement", "Dangote Cement", "Bamburi Cement Kenya"],
  // Pan-African / Fintech specific
  "Fintech & Payments": ["Flutterwave", "Paystack", "Interswitch", "OPay", "Wave", "Chipper Cash", "MFS Africa", "PalmPay", "M-Pesa", "Fawry", "Paymob"],
  "Telecommunications": ["MTN Group", "Airtel Africa", "Safaricom", "Vodacom", "Orange Africa", "Liquid Telecom", "SEACOM", "Telkom SA"],
  "Property & Real Estate": ["Growthpoint Properties", "Redefine Properties", "Attacq", "Atterbury", "Rawson Properties", "Broll Property Group"],
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
    "entry": ["Junior", "Graduate", "Trainee", "Associate"],
    "junior": ["Junior", "Assistant", "Associate"],
    "mid": ["", "Specialist", "Experienced"],
    "senior": ["Senior", "Lead", "Principal"],
    "executive": ["Head of", "Director of", "Chief", "VP of"],
  };
  const prefix = pickRandom(titlePrefixes[expLevel] || [""]);
  // Strip parenthetical (Civil/Structural) then take the primary part before " & "
  const baseCat = category.replace(/\s*\(.*\)/, "").split(" & ")[0].trim();
  // For executive roles don't append "Specialist" — "Head of Finance" reads better than "Head of Finance Specialist"
  const title = expLevel === "executive"
    ? (prefix ? `${prefix} ${baseCat}` : `${baseCat} Director`)
    : (prefix ? `${prefix} ${baseCat} Specialist` : `${baseCat} Specialist`);

  const isSA = SA_PROVINCES.includes(province);
  const orgLabel = isSA ? "South Africa's" : `${province}'s`;
  const description = `${company} is seeking a ${expLevel}-level ${title} to join our ${province} team${isRemote ? " (Remote)" : ` based in ${city}`}.

This is an exciting opportunity to work with one of ${orgLabel} leading organisations in the ${category} sector. ${isUrgent ? "⚡ URGENT: This position needs to be filled immediately." : ""}

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
    sourceUrl: getSourceUrl(source),
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

  (job as any).aiScore = calculateAIScore({ ...job, category });
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
    // Pick from the full pan-African location pool (weighted 60% SA, 40% rest of Africa)
    const locationPool = Math.random() < 0.60
      ? AFRICAN_LOCATIONS.slice(0, 9)   // SA provinces
      : AFRICAN_LOCATIONS.slice(9);      // Rest of Africa
    const location = pickRandom(locationPool);
    const province = location.region;
    const source = pickRandom(INTERNAL_SOURCES);

    if (useAI && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      try {
        const aiJobs = await generateJobsWithAI(category, province, 2);
        for (const aj of aiJobs) {
          const city = location.cities[0] ?? province;
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
            sourceUrl: getSourceUrl(source),
            category,
            jobType: pickRandom(JOB_TYPES as unknown as string[]),
            experienceLevel: inferExperienceLevelFromTitle(aj.title),
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

    // 3. Generate fresh AI jobs
    const genResult = await runJobGenerationAgent(batchSize, true);
    generated = genResult.generated;
    errors.push(...genResult.errors);

    // 4. Pull live jobs from external APIs
    try {
      const { fetchAndStoreLiveJobs } = await import("./liveJobFetcher");
      const liveResult = await fetchAndStoreLiveJobs();
      generated += liveResult.inserted;
      log(`[JobAgent] Live fetch added ${liveResult.inserted} new real jobs`, "agent");
    } catch (e: any) {
      log(`[JobAgent] Live fetch error: ${e.message}`, "warn");
    }

    // 5. Clean jobs older than 30 days
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
 * Initial seed: populate the database with 150 diverse pan-African jobs.
 * Called once on first startup if DB is empty (or below threshold).
 */
export async function seedInitialJobs(): Promise<void> {
  try {
    const currentCount = await storage.getAggregatedJobCount();
    if (currentCount >= 300) {
      log(`[JobAgent] DB already has ${currentCount} active jobs — skipping seed`, "agent");
      return;
    }

    log(`[JobAgent] Seeding pan-African jobs (current: ${currentCount}, target: 350)...`, "agent");

    const allJobs: InsertAggregatedJob[] = [];

    // Generate 350 jobs across all categories and ALL African regions
    for (let i = 0; i < 350; i++) {
      const category = CATEGORIES[i % CATEGORIES.length];
      // Weighted: 60% SA provinces, 40% rest of Africa
      const locationPool = i % 5 < 3
        ? AFRICAN_LOCATIONS.slice(0, 9)    // SA provinces (3 of every 5)
        : AFRICAN_LOCATIONS.slice(9);       // Rest of Africa (2 of every 5)
      const location = locationPool[i % locationPool.length];
      const source = INTERNAL_SOURCES[i % INTERNAL_SOURCES.length];
      allJobs.push(generateFallbackJob(category, location.region, source));
    }

    // Insert in batches of 25
    for (let i = 0; i < allJobs.length; i += 25) {
      await storage.createManyAggregatedJobs(allJobs.slice(i, i + 25));
    }

    log(`[JobAgent] Seeded 150 initial pan-African jobs successfully`, "agent");
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

  // Country-level counts for all non-SA African countries
  const OTHER_COUNTRIES = ["Nigeria","Kenya","Ghana","Egypt","Morocco","Ethiopia","Tanzania","Uganda","Rwanda","Senegal","Côte d'Ivoire","Zimbabwe","Zambia","Botswana","Namibia","Mozambique"];
  const byCountry: Record<string, number> = {};
  // SA count = sum of provinces
  byCountry["South Africa"] = SA_PROVINCES.reduce((s, p) => s + (byProvince[p] || 0), 0);
  for (const country of OTHER_COUNTRIES) {
    byCountry[country] = allJobs.filter(j => (j as any).country === country).length;
  }

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
    byCountry,
    byCategory,
    lastUpdated: new Date().toISOString(),
  };
}
