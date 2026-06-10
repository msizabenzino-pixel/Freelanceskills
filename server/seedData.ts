/**
 * Comprehensive Seed Data System
 * FreelanceSkills.net — African marketplace data
 *
 * Seed categories, skills, jobs, service packages, gigs, and users.
 * All functions are idempotent (safe to run multiple times).
 * Called on server startup after migrations.
 */

import { db } from "./db";
import { sql, eq } from "drizzle-orm";

import { users } from "../shared/models/auth";
import { profiles } from "../shared/models/profiles";
import { jobs } from "../shared/models/jobs";
import { servicePackages } from "../shared/models/services";
import { taxonomyCategories, taxonomySkills } from "../shared/models/categories";
import { gigs } from "../shared/models/gigs";

// ───────────────────────────────────────────────────────────────────────────────
// 1. AFRICAN-MARKETPLACE SERVICE CATEGORIES
// ───────────────────────────────────────────────────────────────────────────────
const AFRICAN_CATEGORIES = [
  { slug: "development",      name: "Development",      icon: "💻", color: "#2563eb", description: "Software engineering, web development, mobile apps, DevOps, and cloud infrastructure.", sortOrder: 1 },
  { slug: "design",           name: "Design",           icon: "🎨", color: "#7c3aed", description: "Brand design, UI/UX, motion graphics, illustration, and creative direction.", sortOrder: 2 },
  { slug: "marketing",        name: "Marketing",        icon: "📈", color: "#db2777", description: "Digital marketing, social media, SEO, content strategy, and paid advertising.", sortOrder: 3 },
  { slug: "data-ai",          name: "Data & AI",        icon: "🤖", color: "#0891b2", description: "Data science, machine learning, business intelligence, and AI implementation.", sortOrder: 4 },
  { slug: "trades",           name: "Trades & Labour",  icon: "🔧", color: "#ea580c", description: "Skilled trades, construction, repairs, installations, and maintenance.", sortOrder: 5 },
  { slug: "business",         name: "Business",         icon: "💰", color: "#059669", description: "Business consulting, finance, legal, HR, and project management.", sortOrder: 6 },
  { slug: "education",        name: "Education",        icon: "📚", color: "#d97706", description: "Tutoring, curriculum design, e-learning, coaching, and training.", sortOrder: 7 },
  { slug: "healthcare",       name: "Healthcare",       icon: "🏥", color: "#dc2626", description: "Telehealth, therapy, medical writing, health coaching, and wellness.", sortOrder: 8 },
  { slug: "writing",          name: "Writing",          icon: "✍️", color: "#4f46e5", description: "Copywriting, content writing, technical writing, translation, and proofreading.", sortOrder: 9 },
  { slug: "media",            name: "Media & Video",    icon: "🎥", color: "#be185d", description: "Video production, editing, podcasting, photography, and voice-over.", sortOrder: 10 },
  { slug: "virtual-assistant", name: "Virtual Assistance", icon: "📧", color: "#6366f1", description: "Administrative support, scheduling, data entry, and customer service.", sortOrder: 11 },
  { slug: "translation",      name: "Translation",      icon: "🌍", color: "#14b8a6", description: "Translation, interpretation, and localization services.", sortOrder: 12 },
];

const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  development: [
    "React", "Node.js", "TypeScript", "Python", "Next.js", "Laravel", "Flutter",
    "React Native", "Swift", "Kotlin", "AWS", "Google Cloud", "Firebase",
    "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "Terraform", "CI/CD",
    "Web3", "Solidity", "Rust", "Go", "PHP", "WordPress", "Shopify", "WooCommerce",
  ],
  design: [
    "Figma", "Adobe XD", "Illustrator", "Photoshop", "Canva", "Brand Design",
    "Logo Design", "UI Design", "UX Research", "Webflow", "Framer",
    "Motion Design", "After Effects", "Lottie", "Procreate", "Design Systems",
  ],
  marketing: [
    "Google Ads", "Meta Ads", "TikTok Ads", "SEO", "Content Strategy",
    "Email Marketing", "Social Media", "Community Management", "Influencer",
    "HubSpot", "Analytics", "Affiliate Marketing", "Growth Hacking", "PR",
  ],
  "data-ai": [
    "Python", "TensorFlow", "PyTorch", "Pandas", "SQL", "Power BI", "Tableau",
    "Machine Learning", "NLP", "Computer Vision", "ChatGPT", "LangChain",
    "Data Engineering", "Snowflake", "BigQuery", "ETL", "A/B Testing",
  ],
  trades: [
    "Electrician", "Plumbing", "Carpentry", "Painting", "HVAC", "Tiling",
    "Landscaping", "Security Installation", "Solar Panels", "Welding",
    "Bricklaying", "Roofing", "Flooring", "Ceiling", "CCTV", "Gate Motor",
  ],
  business: [
    "Business Consulting", "Financial Modelling", "Excel", "Pitch Decks",
    "Business Plans", "Tax Advisory", "Bookkeeping", "HR Consulting",
    "Project Management", "Agile", "Scrum", "Change Management", "Legal Drafting",
  ],
  education: [
    "Mathematics Tutoring", "Science Tutoring", "English Tutoring",
    "Zulu Tutoring", "Afrikaans Tutoring", "Xhosa Tutoring", "Exam Prep",
    "IELTS Coaching", "Curriculum Design", "E-Learning", "Corporate Training",
  ],
  healthcare: [
    "Telehealth", "Nutrition Consulting", "Mental Health Coaching", "Yoga",
    "Personal Training", "Medical Writing", "Pharmaceutical", "Rehabilitation",
  ],
  writing: [
    "SEO Writing", "Copywriting", "Blog Writing", "Technical Writing",
    "Ghostwriting", "Academic Writing", "Editing", "Proofreading", "Translation",
  ],
  media: [
    "Video Editing", "Animation", "Podcast Production", "Voice Over",
    "Photography", "Drone Photography", "Live Streaming", "YouTube",
  ],
  "virtual-assistant": [
    "Data Entry", "Calendar Management", "Email Management", "CRM",
    "Customer Support", "Cold Calling", "Lead Generation", "Research",
  ],
  translation: [
    "English → Zulu", "English → Afrikaans", "English → Xhosa", "English → Swahili",
    "English → French", "English → Arabic", "Localization", "Transcription",
  ],
};

// ───────────────────────────────────────────────────────────────────────────────
// 2. DEMO CLIENTS
// ───────────────────────────────────────────────────────────────────────────────
const DEMO_CLIENTS = [
  {
    firstName: "Thabo", lastName: "Mokwena",
    email: "demo.thabo.mokwena@freelanceskills.net",
    title: "Startup Founder",
    bio: "Founder of a fintech startup in Sandton. Looking for full-stack developers and UI designers.",
    company: "PayTech SA",
    location: "Sandton, South Africa",
    country: "ZA",
    walletBalance: 500000, // R5,000
  },
  {
    firstName: "Aisha", lastName: "Osei",
    email: "demo.aisha.osei@freelanceskills.net",
    title: "Marketing Director",
    bio: "Leading digital marketing at a pan-African e-commerce company. Need SEO and content teams.",
    company: "AfriCart",
    location: "Accra, Ghana",
    country: "GH",
    walletBalance: 750000,
  },
  {
    firstName: "Jean", lastName: "Nkurunziza",
    email: "demo.jean.nkurunziza@freelanceskills.net",
    title: "Product Manager",
    bio: "Building a mobile logistics platform for East Africa. Hiring Flutter and backend devs.",
    company: "LogiEast",
    location: "Nairobi, Kenya",
    country: "KE",
    walletBalance: 300000,
  },
  {
    firstName: "Lerato", lastName: "Dlamini",
    email: "demo.lerato.dlamini@freelanceskills.net",
    title: "Operations Lead",
    bio: "Running a property management company in Cape Town. Need tradespeople and virtual assistants.",
    company: "CapeSpaces",
    location: "Cape Town, South Africa",
    country: "ZA",
    walletBalance: 200000,
  },
];

// ───────────────────────────────────────────────────────────────────────────────
// 3. DEMO JOBS (posted by clients)
// ───────────────────────────────────────────────────────────────────────────────
const DEMO_JOBS: Array<{
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  locationType: string;
  urgency: string;
  skills: string[];
  clientEmail: string;
}> = [
  {
    title: "Build a Mobile Payments App (Flutter + Firebase)",
    description: "We need a senior Flutter developer to build a mobile payments app for the African market.\n\nRequirements:\n- 3+ years Flutter experience\n- Firebase Auth, Firestore, Cloud Functions\n- Integration with PayFast and M-Pesa\n- Biometric authentication (fingerprint/face)\n\nDeliverables:\n- iOS and Android builds\n- Admin dashboard (web)\n- API documentation\n- 3-month maintenance period",
    category: "Development",
    budget: 450000, // R45,000
    location: "Sandton, South Africa",
    locationType: "remote",
    urgency: "normal",
    skills: ["Flutter", "Firebase", "TypeScript", "PayFast", "Biometric Auth"],
    clientEmail: "demo.thabo.mokwena@freelanceskills.net",
  },
  {
    title: "SEO & Content Strategy for Pan-African E-Commerce",
    description: "AfriCart is expanding into 5 new African markets. We need a comprehensive SEO and content strategy.\n\nScope:\n- Keyword research for Nigeria, Kenya, Ghana, South Africa, Egypt\n- 30 blog posts (2,000 words each)\n- Technical SEO audit and fixes\n- Link-building strategy\n- Monthly reporting dashboard\n\nTimeline: 6 months",
    category: "Marketing",
    budget: 180000,
    location: "Accra, Ghana",
    locationType: "remote",
    urgency: "urgent",
    skills: ["SEO", "Content Strategy", "Google Analytics", "Ahrefs", "Copywriting"],
    clientEmail: "demo.aisha.osei@freelanceskills.net",
  },
  {
    title: "Flutter Developer for Logistics Platform",
    description: "LogiEast is building a real-time logistics tracking platform for East African trucking companies.\n\nStack:\n- Flutter (mobile)\n- Node.js + Express (backend)\n- PostgreSQL + PostGIS (routing)\n- Mapbox (maps)\n- Socket.io (real-time tracking)\n\nMust have experience with GPS tracking and route optimization.",
    category: "Development",
    budget: 320000,
    location: "Nairobi, Kenya",
    locationType: "hybrid",
    urgency: "normal",
    skills: ["Flutter", "Node.js", "PostgreSQL", "Mapbox", "Socket.io"],
    clientEmail: "demo.jean.nkurunziza@freelanceskills.net",
  },
  {
    title: "Brand Identity for Cape Town Property Management",
    description: "CapeSpaces needs a complete brand overhaul.\n\nDeliverables:\n- Logo design (primary + variants)\n- Brand guidelines (colours, typography, voice)\n- Business card templates\n- Social media templates\n- Property listing template designs\n\nWe want a clean, modern, trust-inspiring aesthetic that appeals to young professionals.",
    category: "Design",
    budget: 95000,
    location: "Cape Town, South Africa",
    locationType: "remote",
    urgency: "normal",
    skills: ["Brand Design", "Logo Design", "Figma", "Canva", "Social Media"],
    clientEmail: "demo.lerato.dlamini@freelanceskills.net",
  },
  {
    title: "Data Scientist for Demand Forecasting Model",
    description: "We need a data scientist to build a demand forecasting model for our FMCG distribution network.\n\nData sources:\n- Historical sales (3 years, 50+ products)\n- Seasonality patterns\n- Weather data\n- Economic indicators (GDP, inflation)\n\nOutput: Python model + Power BI dashboard for weekly forecasts.\nAccuracy target: >85% for 4-week ahead predictions.",
    category: "Data & AI",
    budget: 250000,
    location: "Johannesburg, South Africa",
    locationType: "remote",
    urgency: "urgent",
    skills: ["Python", "Pandas", "TensorFlow", "Power BI", "Statistical Modelling"],
    clientEmail: "demo.thabo.mokwena@freelanceskills.net",
  },
  {
    title: "Zulu and Xhosa Translation for Educational App",
    description: "An educational app needs 200+ UI strings and 5 lesson scripts translated into Zulu and Xhosa.\n\nRequirements:\n- Native or fluent speaker\n- Education sector experience preferred\n- Consistent terminology across all strings\n- Cultural sensitivity (avoid literal translations)\n- Delivery in JSON format\n\nBudget: per-language rate. Please quote.",
    category: "Translation",
    budget: 60000,
    location: "South Africa (remote)",
    locationType: "remote",
    urgency: "normal",
    skills: ["English → Zulu", "English → Xhosa", "Localization", "Translation"],
    clientEmail: "demo.lerato.dlamini@freelanceskills.net",
  },
  {
    title: "Full-Stack Developer for SA Government Portal",
    description: "Build a citizen services portal for a provincial government department.\n\nRequirements:\n- WCAG 2.1 AA accessibility compliance\n- Bilingual (English + Afrikaans)\n- PostgreSQL, Next.js, Node.js\n- Integration with existing SAP systems\n- Security audit (POPIA compliance)\n\nContract: 6 months, full-time.",
    category: "Development",
    budget: 720000,
    location: "Pretoria, South Africa",
    locationType: "onsite",
    urgency: "normal",
    skills: ["Next.js", "Node.js", "PostgreSQL", "WCAG", "POPIA", "Afrikaans"],
    clientEmail: "demo.jean.nkurunziza@freelanceskills.net",
  },
];

// ───────────────────────────────────────────────────────────────────────────────
// 4. DEMO SERVICE PACKAGES (TaskRabbit-style fixed-price services)
// ───────────────────────────────────────────────────────────────────────────────
const DEMO_PACKAGES: Array<{
  title: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  freelancerEmail: string;
}> = [
  {
    title: "React Landing Page (5 pages)",
    description: "A fast, responsive landing page with hero, features, testimonials, pricing, and contact sections. Built with React + Tailwind CSS. Includes 2 revision rounds.",
    category: "Development",
    price: 85000,
    duration: "3 days",
    freelancerEmail: "demo.amara.osei@freelanceskills.net",
  },
  {
    title: "Brand Identity Package",
    description: "Logo (3 concepts), brand colours, typography, business card design, and social media kit. Includes brand guidelines PDF.",
    category: "Design",
    price: 65000,
    duration: "5 days",
    freelancerEmail: "demo.fatima.diallo@freelanceskills.net",
  },
  {
    title: "Google Ads Campaign Setup",
    description: "Full Google Ads account setup: keyword research, ad copywriting (3 variants), landing page recommendations, conversion tracking, and 2-week optimization.",
    category: "Marketing",
    price: 45000,
    duration: "1 day",
    freelancerEmail: "demo.sipho.dlamini@freelanceskills.net",
  },
  {
    title: "Python Data Analysis Report",
    description: "Analyze your dataset (up to 100,000 rows) and deliver a 20-page PDF report with visualizations, statistical insights, and actionable recommendations.",
    category: "Data & AI",
    price: 55000,
    duration: "4 days",
    freelancerEmail: "demo.zanele.mokoena@freelanceskills.net",
  },
  {
    title: "Flutter Mobile App (MVP)",
    description: "A Flutter MVP with authentication, CRUD operations, push notifications, and 3 screens. Backend using Firebase or your API.",
    category: "Development",
    price: 120000,
    duration: "10 days",
    freelancerEmail: "demo.kwame.asante@freelanceskills.net",
  },
  {
    title: "SEO Content (10 Blog Posts)",
    description: "10 SEO-optimized blog posts (1,500–2,000 words each) targeting your keywords. Includes meta descriptions, internal linking suggestions, and featured images.",
    category: "Writing",
    price: 50000,
    duration: "7 days",
    freelancerEmail: "demo.naledi.sithole@freelanceskills.net",
  },
  {
    title: "Cloud Infrastructure Setup (AWS)",
    description: "Production-ready AWS infrastructure: VPC, EC2, RDS, S3, CloudFront, SSL, backups, and monitoring. Includes Terraform code and deployment guide.",
    category: "Development",
    price: 95000,
    duration: "5 days",
    freelancerEmail: "demo.ibrahim.traore@freelanceskills.net",
  },
  {
    title: "Financial Model & Pitch Deck",
    description: "A 3-statement financial model (5-year forecast) + investor pitch deck (12 slides). Includes sensitivity analysis and key metrics.",
    category: "Business",
    price: 75000,
    duration: "6 days",
    freelancerEmail: "demo.chioma.eze@freelanceskills.net",
  },
];

// ───────────────────────────────────────────────────────────────────────────────
// 5. DEMO GIGS
// ───────────────────────────────────────────────────────────────────────────────
const DEMO_GIGS: Array<{
  title: string;
  description: string;
  category: string;
  skills: string[];
  deliveryTimeHours: number;
  freelancerEmail: string;
}> = [
  {
    title: "I will fix your WordPress website bugs",
    description: "Experienced WordPress developer fixing bugs, errors, broken layouts, and plugin conflicts. Fast turnaround.",
    category: "Development",
    skills: ["WordPress", "PHP", "CSS"],
    deliveryTimeHours: 24,
    freelancerEmail: "demo.amara.osei@freelanceskills.net",
  },
  {
    title: "I will design a modern logo for your African brand",
    description: "Professional logo design with 3 initial concepts, unlimited revisions, and full brand files (AI, PDF, PNG, SVG).",
    category: "Design",
    skills: ["Logo Design", "Illustrator", "Branding"],
    deliveryTimeHours: 72,
    freelancerEmail: "demo.fatima.diallo@freelanceskills.net",
  },
  {
    title: "I will run a 2-week Google Ads campaign for your SA business",
    description: "Targeted Google Ads campaign for South African businesses. Includes keyword research, ad copy, landing page suggestions, and weekly reporting.",
    category: "Marketing",
    skills: ["Google Ads", "Analytics", "Copywriting"],
    deliveryTimeHours: 336,
    freelancerEmail: "demo.sipho.dlamini@freelanceskills.net",
  },
  {
    title: "I will build a machine learning model for your business data",
    description: "Custom ML model for prediction, classification, or clustering. Includes data cleaning, model training, evaluation, and a Python notebook.",
    category: "Data & AI",
    skills: ["Python", "Machine Learning", "Pandas"],
    deliveryTimeHours: 120,
    freelancerEmail: "demo.zanele.mokoena@freelanceskills.net",
  },
  {
    title: "I will build a cross-platform mobile app with Flutter",
    description: "Full Flutter app development with Firebase backend. Includes authentication, database, push notifications, and app store submission.",
    category: "Development",
    skills: ["Flutter", "Firebase", "Dart"],
    deliveryTimeHours: 240,
    freelancerEmail: "demo.kwame.asante@freelanceskills.net",
  },
  {
    title: "I will write 5 SEO-optimized blog posts for your website",
    description: "Research-driven, SEO-optimized blog posts for your niche. Includes keyword research, meta descriptions, and internal linking.",
    category: "Writing",
    skills: ["SEO Writing", "Content Strategy", "Keyword Research"],
    deliveryTimeHours: 72,
    freelancerEmail: "demo.naledi.sithole@freelanceskills.net",
  },
];

// ───────────────────────────────────────────────────────────────────────────────
// SEEDING FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────────

async function seedCategories(): Promise<void> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(taxonomyCategories);
  if (Number(count) > 0) {
    console.log("[seed] Categories already exist — skipping");
    return;
  }

  console.log("[seed] Seeding categories…");
  for (const cat of AFRICAN_CATEGORIES) {
    await db.insert(taxonomyCategories).values(cat).onConflictDoNothing();
  }
  console.log(`[seed] ✓ Seeded ${AFRICAN_CATEGORIES.length} categories`);
}

async function seedSkills(): Promise<void> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(taxonomySkills);
  if (Number(count) > 0) {
    console.log("[seed] Skills already exist — skipping");
    return;
  }

  // Build category ID lookup
  const categoryRows = await db.select().from(taxonomyCategories);
  const categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  console.log("[seed] Seeding skills…");
  let seeded = 0;
  for (const [slug, skillList] of Object.entries(SKILLS_BY_CATEGORY)) {
    const categoryId = categoryIdBySlug.get(slug);
    if (!categoryId) continue;

    for (const name of skillList) {
      const slugBase = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      await db.insert(taxonomySkills).values({
        name,
        slug: `${slugBase}-${Math.random().toString(36).slice(2, 8)}`,
        categoryId,
        icon: "🚀",
      }).onConflictDoNothing();
      seeded++;
    }
  }
  console.log(`[seed] ✓ Seeded ${seeded} skills`);
}

async function seedClients(): Promise<Map<string, string>> {
  const emailToId = new Map<string, string>();

  for (const c of DEMO_CLIENTS) {
    const existing = await db.select().from(users).where(eq(users.email, c.email));
    if (existing.length > 0) {
      emailToId.set(c.email, existing[0].id);
      continue;
    }

    const [user] = await db.insert(users).values({
      email: c.email,
      firstName: c.firstName,
      lastName: c.lastName,
    }).returning();

    if (user) {
      emailToId.set(c.email, user.id);
      await db.insert(profiles).values({
        userId: user.id,
        userType: "client",
        title: c.title,
        bio: c.bio,
        location: c.location,
        country: c.country,
        walletBalance: c.walletBalance,
        status: "active",
        role: "client",
        publishedProfile: true,
      }).onConflictDoNothing();
    }
  }

  console.log(`[seed] ✓ Seeded ${DEMO_CLIENTS.length} clients`);
  return emailToId;
}

async function seedJobs(clientMap: Map<string, string>): Promise<void> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(jobs);
  if (Number(count) > 0) {
    console.log("[seed] Jobs already exist — skipping");
    return;
  }

  console.log("[seed] Seeding jobs…");
  for (const j of DEMO_JOBS) {
    const clientId = clientMap.get(j.clientEmail);
    if (!clientId) continue;

    await db.insert(jobs).values({
      clientId,
      title: j.title,
      description: j.description,
      category: j.category,
      budget: j.budget,
      location: j.location,
      locationType: j.locationType as any,
      urgency: j.urgency as any,
      status: "open",
    });
  }
  console.log(`[seed] ✓ Seeded ${DEMO_JOBS.length} jobs`);
}

async function seedServicePackages(clientMap: Map<string, string>): Promise<void> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(servicePackages);
  if (Number(count) > 0) {
    console.log("[seed] Service packages already exist — skipping");
    return;
  }

  // Build freelancer email -> userId map
  const freelancerEmailMap = new Map<string, string>();
  const freelancerEmails = [
    "demo.amara.osei@freelanceskills.net",
    "demo.fatima.diallo@freelanceskills.net",
    "demo.sipho.dlamini@freelanceskills.net",
    "demo.zanele.mokoena@freelanceskills.net",
    "demo.kwame.asante@freelanceskills.net",
    "demo.naledi.sithole@freelanceskills.net",
    "demo.ibrahim.traore@freelanceskills.net",
    "demo.chioma.eze@freelanceskills.net",
  ];
  for (const email of freelancerEmails) {
    const rows = await db.select().from(users).where(eq(users.email, email));
    if (rows.length > 0) freelancerEmailMap.set(email, rows[0].id);
  }

  console.log("[seed] Seeding service packages…");
  for (const p of DEMO_PACKAGES) {
    const freelancerId = freelancerEmailMap.get(p.freelancerEmail);
    if (!freelancerId) continue;

    await db.insert(servicePackages).values({
      freelancerId,
      title: p.title,
      description: p.description,
      category: p.category,
      price: p.price,
      duration: p.duration,
    });
  }
  console.log(`[seed] ✓ Seeded ${DEMO_PACKAGES.length} service packages`);
}

async function seedGigs(): Promise<void> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(gigs);
  if (Number(count) > 0) {
    console.log("[seed] Gigs already exist — skipping");
    return;
  }

  // Build freelancer email -> userId map
  const freelancerEmailMap = new Map<string, string>();
  const freelancerEmails = [
    "demo.amara.osei@freelanceskills.net",
    "demo.fatima.diallo@freelanceskills.net",
    "demo.sipho.dlamini@freelanceskills.net",
    "demo.zanele.mokoena@freelanceskills.net",
    "demo.kwame.asante@freelanceskills.net",
    "demo.naledi.sithole@freelanceskills.net",
  ];
  for (const email of freelancerEmails) {
    const rows = await db.select().from(users).where(eq(users.email, email));
    if (rows.length > 0) freelancerEmailMap.set(email, rows[0].id);
  }

  console.log("[seed] Seeding gigs…");
  for (const g of DEMO_GIGS) {
    const freelancerId = freelancerEmailMap.get(g.freelancerEmail);
    if (!freelancerId) continue;

    await db.insert(gigs).values({
      freelancerId,
      title: g.title,
      description: g.description,
      category: g.category,
      skills: g.skills as any,
      deliveryTimeHours: g.deliveryTimeHours,
      status: "active",
    });
  }
  console.log(`[seed] ✓ Seeded ${DEMO_GIGS.length} gigs`);
}

// ───────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY
// ───────────────────────────────────────────────────────────────────────────────

export async function seedAllData(): Promise<void> {
  try {
    console.log("[seed] 🌱 Starting comprehensive seed…");

    await seedCategories();
    await seedSkills();
    const clientMap = await seedClients();
    await seedJobs(clientMap);
    await seedServicePackages(clientMap);
    await seedGigs();

    console.log("[seed] ✅ All seed data complete");
  } catch (err) {
    console.error("[seed] ❌ Seed failed:", err);
  }
}
