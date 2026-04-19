/**
 * Seed demo freelancer profiles.
 * Runs on server startup only when zero active freelancer profiles exist.
 * Safe to call multiple times — idempotent via the pre-check.
 */
import { db } from "./db";
import { users } from "../shared/models/auth";
import { profiles } from "../shared/models/profiles";
import { eq, and, sql } from "drizzle-orm";

const DEMO_FREELANCERS = [
  {
    firstName: "Amara", lastName: "Osei",
    email: "demo.amara.osei@freelanceskills.net",
    title: "Full-Stack Developer",
    bio: "React, Node.js and PostgreSQL specialist. 6 years building SaaS products for African fintech and e-commerce startups. Remote-first.",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker"],
    location: "Accra, Ghana",
    country: "GH",
    hourlyRate: 52000,
    rating: 490,
    completedJobs: 43,
  },
  {
    firstName: "Fatima", lastName: "Diallo",
    email: "demo.fatima.diallo@freelanceskills.net",
    title: "Brand & UI Designer",
    bio: "Award-winning designer with a focus on African brands. Figma, identity systems, motion design and Webflow builds.",
    skills: ["Figma", "Branding", "Motion Design", "Webflow", "Illustrator"],
    location: "Lagos, Nigeria",
    country: "NG",
    hourlyRate: 42000,
    rating: 500,
    completedJobs: 61,
  },
  {
    firstName: "Sipho", lastName: "Dlamini",
    email: "demo.sipho.dlamini@freelanceskills.net",
    title: "Digital Marketing Strategist",
    bio: "Google Ads, Meta Ads and SEO specialist. Managed R12M+ in ad spend across SA, Nigeria and Kenya. Performance-only approach.",
    skills: ["Google Ads", "Meta Ads", "SEO", "Email Marketing", "Analytics"],
    location: "Johannesburg, South Africa",
    country: "ZA",
    hourlyRate: 38000,
    rating: 480,
    completedJobs: 29,
  },
  {
    firstName: "Zanele", lastName: "Mokoena",
    email: "demo.zanele.mokoena@freelanceskills.net",
    title: "Data Scientist & ML Engineer",
    bio: "Python, TensorFlow and Power BI. Built demand-forecasting models for FMCG clients and NLP tools for SA legal firms.",
    skills: ["Python", "TensorFlow", "Power BI", "SQL", "Machine Learning"],
    location: "Cape Town, South Africa",
    country: "ZA",
    hourlyRate: 65000,
    rating: 490,
    completedJobs: 37,
  },
  {
    firstName: "Kwame", lastName: "Asante",
    email: "demo.kwame.asante@freelanceskills.net",
    title: "Mobile Developer (iOS & Android)",
    bio: "Flutter and React Native expert. Shipped 14 apps to the App Store and Play Store for startups across West Africa.",
    skills: ["Flutter", "React Native", "Swift", "Firebase", "Dart"],
    location: "Kumasi, Ghana",
    country: "GH",
    hourlyRate: 58000,
    rating: 495,
    completedJobs: 52,
  },
  {
    firstName: "Naledi", lastName: "Sithole",
    email: "demo.naledi.sithole@freelanceskills.net",
    title: "Content Writer & Copywriter",
    bio: "SEO content, thought leadership and conversion copy for B2B SaaS and financial services. 8 years, 2M+ words published.",
    skills: ["SEO Writing", "Copywriting", "Content Strategy", "Blog Writing", "LinkedIn"],
    location: "Pretoria, South Africa",
    country: "ZA",
    hourlyRate: 28000,
    rating: 470,
    completedJobs: 88,
  },
  {
    firstName: "Ibrahim", lastName: "Traore",
    email: "demo.ibrahim.traore@freelanceskills.net",
    title: "DevOps & Cloud Engineer",
    bio: "AWS Solutions Architect and Kubernetes specialist. CI/CD pipelines, infrastructure-as-code, and cost optimisation for African startups.",
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Linux"],
    location: "Nairobi, Kenya",
    country: "KE",
    hourlyRate: 72000,
    rating: 500,
    completedJobs: 31,
  },
  {
    firstName: "Chioma", lastName: "Eze",
    email: "demo.chioma.eze@freelanceskills.net",
    title: "Finance & Business Analyst",
    bio: "CFA charterholder. Financial modelling, business plans, pitch decks and startup valuations for African founders seeking funding.",
    skills: ["Financial Modelling", "Excel", "PowerPoint", "Business Plans", "Valuation"],
    location: "Abuja, Nigeria",
    country: "NG",
    hourlyRate: 45000,
    rating: 485,
    completedJobs: 24,
  },
];

export async function seedFreelancersIfEmpty(): Promise<void> {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(and(eq(profiles.userType, "freelancer"), eq(profiles.status, "active")));

    if (Number(count) > 0) return;

    console.log("[seed] No active freelancers found — seeding demo profiles…");

    for (const f of DEMO_FREELANCERS) {
      const [user] = await db
        .insert(users)
        .values({
          email: f.email,
          firstName: f.firstName,
          lastName: f.lastName,
          profileImageUrl: null,
        })
        .onConflictDoNothing()
        .returning();

      if (!user) continue;

      await db
        .insert(profiles)
        .values({
          userId: user.id,
          userType: "freelancer",
          title: f.title,
          bio: f.bio,
          skills: f.skills,
          location: f.location,
          country: f.country,
          hourlyRate: f.hourlyRate,
          rating: f.rating,
          completedJobs: f.completedJobs,
          status: "active",
          role: "freelancer",
          kycStatus: "verified",
          isPro: f.completedJobs >= 40,
          publishedProfile: true,
          responseRate: 90 + Math.floor(Math.random() * 10),
        })
        .onConflictDoNothing();
    }

    console.log(`[seed] ✓ Seeded ${DEMO_FREELANCERS.length} demo freelancer profiles`);
  } catch (err) {
    console.error("[seed] Failed to seed freelancers:", err);
  }
}
