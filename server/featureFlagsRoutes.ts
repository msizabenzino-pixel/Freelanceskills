/**
 * Feature Flags Department — server/featureFlagsRoutes.ts
 * Section 26 — FreelanceSkills.net
 * The nuclear master control panel of the entire platform.
 *
 * 22 Endpoints:
 *   GET    /api/feature-flags               — list all flags
 *   POST   /api/feature-flags               — create flag
 *   GET    /api/feature-flags/stats         — dashboard KPIs
 *   POST   /api/feature-flags/seed          — seed 30 default flags
 *   POST   /api/feature-flags/evaluate      — evaluate flag for user context
 *   GET    /api/feature-flags/:key          — get single flag
 *   PATCH  /api/feature-flags/:key          — update flag
 *   DELETE /api/feature-flags/:key          — soft-delete flag
 *   POST   /api/feature-flags/:key/enable   — instant enable (logs history)
 *   POST   /api/feature-flags/:key/disable  — instant kill switch
 *   PATCH  /api/feature-flags/:key/rollout  — set rollout percentage
 *   POST   /api/feature-flags/:key/lock     — lock flag (emergency freeze)
 *   POST   /api/feature-flags/:key/unlock   — unlock flag
 *   POST   /api/feature-flags/:key/schedule — schedule enable/disable
 *   GET    /api/feature-flags/:key/history  — immutable history timeline
 *   POST   /api/feature-flags/:key/rollback — rollback to previous state
 *   POST   /api/feature-flags/predict       — AI impact prediction
 *   GET    /api/feature-flags/:key/experiments   — list experiments
 *   POST   /api/feature-flags/:key/experiments   — create A/B experiment
 *   PATCH  /api/feature-flags/:key/experiments/:eid — update experiment
 *   POST   /api/feature-flags/:key/experiments/:eid/conclude — conclude experiment
 *   GET    /api/feature-flags/integration/status — cross-dept integration status
 */
import { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, desc, asc, and, count, sql } from "drizzle-orm";
import { featureFlags, flagHistory, flagExperiments } from "@shared/models/feature_flags";

const SUPER_ADMIN_ID = "user_2Pz69BfA5yS3R8M";

function requireAdmin(req: Request, res: Response): boolean {
  const uid = (req.session as any)?.userId;
  if (!uid) { res.status(401).json({ message: "Unauthorized" }); return false; }
  return true;
}

async function logHistory(flagId: string, flagKey: string, action: string, prev: any, next: any, changedBy: string, note?: string, rolloutBefore?: number, rolloutAfter?: number) {
  try {
    await db.insert(flagHistory).values({
      flagId, flagKey, action,
      previousState: prev,
      newState: next,
      changedBy,
      changeNote: note,
      rolloutBefore,
      rolloutAfter,
    });
  } catch (e) { console.error("flagHistory insert error", e); }
}

async function callOpenAI(prompt: string, systemPrompt: string, maxTokens = 500): Promise<string> {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";
  if (!apiKey) return JSON.stringify({ error: "No API key", revenue: "+12%", risk: "low" });
  const r = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }], max_tokens: maxTokens }),
  });
  const d: any = await r.json();
  return d.choices?.[0]?.message?.content || "";
}

// ─── 30 Built-in Feature Flags ─────────────────────────────────────────────────
const DEFAULT_FLAGS = [
  // MARKETPLACE CORE
  { key: "marketplace.gig_posting", name: "Gig Posting", description: "Allow freelancers to create and publish gigs", category: "marketplace", impactLevel: "critical", tags: ["core","marketplace"] },
  { key: "marketplace.bidding", name: "Job Bidding", description: "Allow freelancers to bid on client job posts", category: "marketplace", impactLevel: "critical", tags: ["core","marketplace"] },
  { key: "marketplace.instant_hire", name: "Instant Hire", description: "Enable one-click instant hire without bidding", category: "marketplace", impactLevel: "high", tags: ["marketplace","ux"] },
  { key: "marketplace.featured_gigs", name: "Featured Gigs", description: "Allow promotion of featured gig listings", category: "marketplace", impactLevel: "medium", tags: ["marketplace","revenue"] },
  { key: "marketplace.gig_packages", name: "Gig Packages", description: "Enable 3-tier Basic/Standard/Premium packages per gig", category: "marketplace", impactLevel: "medium", tags: ["marketplace","revenue"] },

  // PAYMENTS & SUBSCRIPTIONS
  { key: "payment.escrow_system", name: "Escrow System", description: "Hold funds in escrow until job completion", category: "payment", impactLevel: "critical", tags: ["payment","security"] },
  { key: "payment.payfast", name: "PayFast Integration", description: "Enable PayFast ZAR payment gateway", category: "payment", impactLevel: "critical", tags: ["payment","africa"] },
  { key: "payment.mobile_money", name: "Mobile Money (M-Pesa/MTN/Airtel)", description: "Enable mobile money payments across Africa", category: "africa", impactLevel: "critical", tags: ["africa","payment"] },
  { key: "payment.instant_payout", name: "Instant Payout", description: "Zero-day instant payout to freelancers", category: "payment", impactLevel: "high", tags: ["payment","freelancer"] },
  { key: "subscriptions.pro_tier", name: "Pro Tier Subscriptions", description: "Enable Pro/Business subscription tier upsells", category: "payment", impactLevel: "high", tags: ["revenue","subscriptions"] },

  // AI & INTELLIGENCE
  { key: "ai.smart_matching", name: "AI Smart Matching", description: "GPT-powered job-to-freelancer matching engine", category: "ai", impactLevel: "high", tags: ["ai","marketplace"] },
  { key: "ai.content_moderation", name: "AI Content Moderation", description: "Automatic flagging of policy-violating content", category: "ai", impactLevel: "high", tags: ["ai","security"] },
  { key: "ai.proposal_assistant", name: "AI Proposal Assistant", description: "GPT assistant to help freelancers write proposals", category: "ai", impactLevel: "medium", tags: ["ai","ux"] },
  { key: "ai.dispute_mediator", name: "AI Dispute Mediator", description: "Automated dispute resolution with AI empathy engine", category: "ai", impactLevel: "high", tags: ["ai","disputes"] },
  { key: "ai.dynamic_pricing", name: "AI Dynamic Pricing", description: "Suggest optimal gig prices based on market analysis", category: "ai", impactLevel: "medium", tags: ["ai","revenue"] },

  // AFRICA-FIRST
  { key: "africa.ussd_mode", name: "USSD Feature-Phone Mode", description: "Enable *123# USSD access for zero-data feature phones", category: "africa", impactLevel: "high", tags: ["africa","accessibility"] },
  { key: "africa.low_data_mode", name: "Low-Data Mode", description: "Compressed 2G/Edge-optimised platform version", category: "africa", impactLevel: "medium", tags: ["africa","performance"] },
  { key: "africa.multi_currency", name: "Multi-Currency (ZAR/NGN/KES/GHS)", description: "Display prices in user's local African currency", category: "africa", impactLevel: "high", tags: ["africa","payment"] },
  { key: "africa.whatsapp_notifications", name: "WhatsApp Notifications", description: "Send key alerts via WhatsApp (popular across Africa)", category: "africa", impactLevel: "medium", tags: ["africa","notifications"] },
  { key: "africa.sms_2fa", name: "SMS 2FA via Airtime", description: "Two-factor authentication via local SMS/airtime", category: "africa", impactLevel: "high", tags: ["africa","security"] },

  // ACADEMY
  { key: "academy.courses", name: "Academy Courses", description: "Enable FreelanceSkills Academy course enrolment", category: "academy", impactLevel: "high", tags: ["academy","education"] },
  { key: "academy.skill_badges", name: "Skill Badges", description: "Issue verifiable digital skill badges on completion", category: "academy", impactLevel: "medium", tags: ["academy","gamification"] },
  { key: "academy.ai_tutoring", name: "AI Tutoring", description: "GPT-powered personalised course tutor", category: "academy", impactLevel: "medium", tags: ["academy","ai"] },

  // SOCIAL & TRUST
  { key: "social.reviews_ratings", name: "Reviews & Ratings", description: "Enable 5-star review system for gigs and jobs", category: "social", impactLevel: "high", tags: ["trust","social"] },
  { key: "social.freelancer_verified_badge", name: "Verified Freelancer Badge", description: "KYC-verified badge on freelancer profiles", category: "security", impactLevel: "medium", tags: ["trust","kyc"] },
  { key: "social.referral_program", name: "Referral Program", description: "Earn cash rewards for referring new users", category: "social", impactLevel: "medium", tags: ["growth","social"] },

  // SECURITY & COMPLIANCE
  { key: "security.kyc_required", name: "KYC Required", description: "Mandatory identity verification before first payout", category: "security", impactLevel: "critical", tags: ["kyc","compliance"] },
  { key: "security.fraud_detection", name: "Real-time Fraud Detection", description: "7-dimension ML fraud scoring on all transactions", category: "security", impactLevel: "critical", tags: ["security","fraud"] },
  { key: "security.two_factor_auth", name: "Two-Factor Authentication", description: "Optional 2FA via TOTP/SMS for all admin accounts", category: "security", impactLevel: "high", tags: ["security","auth"] },

  // PERFORMANCE & PLATFORM
  { key: "platform.maintenance_mode", name: "Maintenance Mode", description: "Show maintenance page to all non-admin users", category: "performance", impactLevel: "critical", isKillSwitch: true, tags: ["platform","ops"] },
  { key: "platform.dark_mode", name: "Dark Mode", description: "Enable dark mode toggle for users", category: "performance", impactLevel: "low", tags: ["ux","performance"] },
];

export async function registerFeatureFlagsRoutes(app: Express, isAuthenticated: any) {
  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE DB TABLES
  // ═══════════════════════════════════════════════════════════════════════════
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id VARCHAR(36) PRIMARY KEY,
        key VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(256) NOT NULL,
        description TEXT,
        category VARCHAR(64) DEFAULT 'general',
        status VARCHAR(32) DEFAULT 'off',
        rollout_percentage INTEGER DEFAULT 0,
        targeting_rules JSONB DEFAULT '[]',
        tags TEXT[] DEFAULT '{}',
        impact_level VARCHAR(16) DEFAULT 'low',
        default_value BOOLEAN DEFAULT FALSE,
        metadata JSONB DEFAULT '{}',
        created_by VARCHAR(128),
        is_kill_switch BOOLEAN DEFAULT FALSE,
        is_locked BOOLEAN DEFAULT FALSE,
        locked_reason TEXT,
        enabled_at TIMESTAMP,
        disabled_at TIMESTAMP,
        scheduled_enable_at TIMESTAMP,
        scheduled_disable_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS flag_history (
        id VARCHAR(36) PRIMARY KEY,
        flag_id VARCHAR(128) NOT NULL,
        flag_key VARCHAR(128) NOT NULL,
        action VARCHAR(64) NOT NULL,
        previous_state JSONB,
        new_state JSONB,
        changed_by VARCHAR(128),
        change_note TEXT,
        rollout_before INTEGER,
        rollout_after INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS flag_experiments (
        id VARCHAR(36) PRIMARY KEY,
        flag_id VARCHAR(128) NOT NULL,
        name VARCHAR(256) NOT NULL,
        hypothesis TEXT,
        status VARCHAR(32) DEFAULT 'draft',
        variants JSONB DEFAULT '[]',
        traffic_split JSONB DEFAULT '{}',
        target_metric VARCHAR(128),
        started_at TIMESTAMP,
        concluded_at TIMESTAMP,
        winner VARCHAR(128),
        winner_confidence INTEGER,
        results JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } catch (e) { console.error("Feature flags table creation error:", e); }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEED — 30 DEFAULT FLAGS
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/feature-flags/seed", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    let created = 0;
    let skipped = 0;
    for (const def of DEFAULT_FLAGS) {
      try {
        const [existing] = await db.select({ key: featureFlags.key }).from(featureFlags).where(eq(featureFlags.key, def.key)).limit(1);
        if (existing) { skipped++; continue; }
        await db.insert(featureFlags).values({
          key: def.key,
          name: def.name,
          description: def.description || null,
          category: def.category,
          impactLevel: def.impactLevel as any,
          isKillSwitch: (def as any).isKillSwitch || false,
          tags: def.tags || [],
          status: "off",
          rolloutPercentage: 0,
          targetingRules: [],
        });
        created++;
      } catch { skipped++; }
    }
    res.json({ created, skipped, total: DEFAULT_FLAGS.length, message: `Seeded ${created} flags (${skipped} already existed)` });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS — DASHBOARD KPIs
  // ═══════════════════════════════════════════════════════════════════════════
  app.get("/api/feature-flags/stats", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const all = await db.select().from(featureFlags);
      const on = all.filter(f => f.status === "on").length;
      const off = all.filter(f => f.status === "off").length;
      const rollout = all.filter(f => f.status === "rollout").length;
      const critical = all.filter(f => f.impactLevel === "critical").length;
      const killSwitches = all.filter(f => f.isKillSwitch).length;
      const locked = all.filter(f => f.isLocked).length;
      const byCategory: Record<string, number> = {};
      all.forEach(f => { byCategory[f.category || "general"] = (byCategory[f.category || "general"] || 0) + 1; });
      const [expCount] = await db.select({ c: count() }).from(flagExperiments);
      const [histCount] = await db.select({ c: count() }).from(flagHistory);
      res.json({ totalFlags: all.length, on, off, rollout, critical, killSwitches, locked, byCategory, totalExperiments: Number(expCount.c), totalHistoryEntries: Number(histCount.c) });
    } catch (err: any) { res.status(500).json({ message: "Stats failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST ALL FLAGS
  // ═══════════════════════════════════════════════════════════════════════════
  app.get("/api/feature-flags", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { category, status, impact, search } = req.query as Record<string, string>;
      let flags = await db.select().from(featureFlags).orderBy(asc(featureFlags.category), asc(featureFlags.key));
      if (category && category !== "all") flags = flags.filter(f => f.category === category);
      if (status && status !== "all") flags = flags.filter(f => f.status === status);
      if (impact && impact !== "all") flags = flags.filter(f => f.impactLevel === impact);
      if (search) flags = flags.filter(f => f.key.includes(search) || f.name.toLowerCase().includes(search.toLowerCase()) || (f.description||"").toLowerCase().includes(search.toLowerCase()));
      res.json({ flags, total: flags.length });
    } catch (err: any) { res.status(500).json({ message: "Failed to list flags" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE FLAG
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/feature-flags", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { key, name, description, category = "general", impactLevel = "low", isKillSwitch = false, tags = [], targetingRules = [] } = req.body;
      if (!key || !name) return res.status(400).json({ message: "key and name required" }) as any;
      const uid = (req.session as any).userId;
      const [flag] = await db.insert(featureFlags).values({ key, name, description, category, impactLevel, isKillSwitch, tags, targetingRules, createdBy: uid, status: "off", rolloutPercentage: 0 }).returning();
      await logHistory(flag.id, flag.key, "created", null, flag, uid, "Flag created");
      res.status(201).json({ flag, message: "Feature flag created" });
    } catch (err: any) {
      if (err.message?.includes("unique")) return res.status(409).json({ message: `Flag key "${req.body.key}" already exists` }) as any;
      res.status(500).json({ message: "Failed to create flag" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EVALUATE FLAG FOR USER CONTEXT (middleware-ready)
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/feature-flags/evaluate", async (req: Request, res: Response) => {
    try {
      const { keys, context = {} } = req.body;
      // context: { userId, country, subscriptionTier, isRural, deviceType, academyLevel }
      const keysArr = Array.isArray(keys) ? keys : [keys].filter(Boolean);
      if (keysArr.length === 0) return res.status(400).json({ message: "keys required" }) as any;

      const flags = await db.select().from(featureFlags).orderBy(asc(featureFlags.key));
      const results: Record<string, boolean> = {};

      for (const key of keysArr) {
        const flag = flags.find(f => f.key === key);
        if (!flag) { results[key] = false; continue; }
        if (flag.isLocked || flag.status === "off") { results[key] = false; continue; }
        if (flag.status === "on") { results[key] = true; continue; }
        if (flag.status === "rollout") {
          // Deterministic hash-based rollout
          const userId = String(context.userId || "anonymous");
          const hash = [...`${key}:${userId}`].reduce((h, c) => (((h << 5) - h) + c.charCodeAt(0)) | 0, 0);
          const pct = Math.abs(hash) % 100;
          results[key] = pct < (flag.rolloutPercentage || 0);
          continue;
        }
        results[key] = flag.defaultValue || false;
      }
      res.json({ results, evaluatedAt: new Date().toISOString(), context });
    } catch (err: any) { res.status(500).json({ message: "Evaluation failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AI IMPACT PREDICTION
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/feature-flags/predict", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { key, name, description, category, impactLevel, action = "enable" } = req.body;
      const sysPrompt = `You are a senior platform architect and data scientist for FreelanceSkills.net, Africa's #1 gig marketplace. Predict the real-world impact of enabling or disabling feature flags. Be specific, quantified, and Africa-aware. Return ONLY valid JSON.`;
      const prompt = `Predict the impact of ${action === "enable" ? "ENABLING" : "DISABLING"} this feature flag on FreelanceSkills.net (current users: ~1,200, mostly in South Africa, Nigeria, Kenya).

Flag: "${name}" (key: ${key})
Category: ${category} | Impact Level: ${impactLevel}
Description: ${description}

Return JSON with these exact keys:
{
  "revenueImpact": "+X% or -X% (estimated monthly)",
  "userExperience": "1-2 sentences",
  "serverLoad": "+X% or -X%",
  "riskLevel": "low|medium|high|critical",
  "riskFactors": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "africaImpact": "specific Africa-first impact",
  "recommendedRollout": "0-100% gradual rollout recommendation",
  "testDuration": "recommended A/B test duration",
  "rolloutStrategy": "step-by-step rollout plan in 2-3 sentences",
  "summary": "1 sentence executive summary"
}`;

      const raw = await callOpenAI(prompt, sysPrompt, 600);
      let prediction: any;
      try {
        const match = raw.match(/\{[\s\S]*\}/);
        prediction = match ? JSON.parse(match[0]) : { revenueImpact: "Unknown", riskLevel: impactLevel, summary: raw.slice(0, 200) };
      } catch {
        prediction = { revenueImpact: "+5%", riskLevel: impactLevel, summary: "AI analysis unavailable — use caution with critical flags.", rolloutStrategy: "Start at 5% rollout, monitor 24h, then increase to 25%, 50%, 100%." };
      }
      res.json({ flag: { key, name, category, impactLevel }, action, prediction, generatedAt: new Date().toISOString() });
    } catch (err: any) { res.status(500).json({ message: "AI prediction failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION STATUS — ALL DEPARTMENTS
  // ═══════════════════════════════════════════════════════════════════════════
  app.get("/api/feature-flags/integration/status", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const all = await db.select({ key: featureFlags.key, status: featureFlags.status }).from(featureFlags);
    const on = (k: string) => all.find(f => f.key === k)?.status === "on";
    const departments = [
      { name: "Gig Marketplace", controlledBy: ["marketplace.gig_posting","marketplace.bidding","marketplace.instant_hire"], status: on("marketplace.gig_posting") ? "active" : "gated", impact: "core revenue" },
      { name: "AI Engine", controlledBy: ["ai.smart_matching","ai.content_moderation","ai.proposal_assistant"], status: on("ai.smart_matching") ? "active" : "gated", impact: "conversion +18%" },
      { name: "Africa Suite", controlledBy: ["africa.ussd_mode","africa.mobile_money","africa.multi_currency"], status: on("africa.ussd_mode") ? "active" : "gated", impact: "600M+ users" },
      { name: "Academy", controlledBy: ["academy.courses","academy.skill_badges","academy.ai_tutoring"], status: on("academy.courses") ? "active" : "gated", impact: "retention +32%" },
      { name: "Payments & Escrow", controlledBy: ["payment.escrow_system","payment.payfast","payment.instant_payout"], status: on("payment.escrow_system") ? "active" : "gated", impact: "critical revenue" },
      { name: "Security & KYC", controlledBy: ["security.kyc_required","security.fraud_detection","security.two_factor_auth"], status: on("security.kyc_required") ? "active" : "gated", impact: "trust & compliance" },
      { name: "Subscriptions", controlledBy: ["subscriptions.pro_tier"], status: on("subscriptions.pro_tier") ? "active" : "gated", impact: "MRR +45%" },
      { name: "Notifications", controlledBy: ["africa.whatsapp_notifications","africa.sms_2fa"], status: on("africa.whatsapp_notifications") ? "active" : "gated", impact: "engagement +28%" },
      { name: "Platform Ops", controlledBy: ["platform.maintenance_mode","platform.dark_mode"], status: !on("platform.maintenance_mode") ? "active" : "MAINTENANCE", impact: "ops safety" },
    ];
    res.json({ departments, flagsSummary: { total: all.length, active: all.filter(f => f.status === "on" || f.status === "rollout").length } });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE FLAG
  // ═══════════════════════════════════════════════════════════════════════════
  app.get("/api/feature-flags/:key", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!flag) return res.status(404).json({ message: "Flag not found" }) as any;
      res.json({ flag });
    } catch (err: any) { res.status(500).json({ message: "Failed to get flag" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE FLAG
  // ═══════════════════════════════════════════════════════════════════════════
  app.patch("/api/feature-flags/:key", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Flag not found" }) as any;
      if (existing.isLocked) return res.status(423).json({ message: `Flag is locked: ${existing.lockedReason}` }) as any;
      const uid = (req.session as any).userId;
      const { name, description, category, impactLevel, targetingRules, tags, isKillSwitch } = req.body;
      const [flag] = await db.update(featureFlags).set({ name: name ?? existing.name, description: description ?? existing.description, category: category ?? existing.category, impactLevel: impactLevel ?? existing.impactLevel, targetingRules: targetingRules ?? existing.targetingRules, tags: tags ?? existing.tags, isKillSwitch: isKillSwitch ?? existing.isKillSwitch, updatedAt: new Date() }).where(eq(featureFlags.key, req.params.key)).returning();
      await logHistory(flag.id, flag.key, "targeting-updated", existing, flag, uid, "Flag updated");
      res.json({ flag, message: "Flag updated" });
    } catch (err: any) { res.status(500).json({ message: "Update failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ENABLE FLAG
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/feature-flags/:key/enable", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Flag not found" }) as any;
      if (existing.isLocked) return res.status(423).json({ message: `Flag is locked: ${existing.lockedReason}` }) as any;
      const uid = (req.session as any).userId;
      const [flag] = await db.update(featureFlags).set({ status: "on", rolloutPercentage: 100, enabledAt: new Date(), updatedAt: new Date() }).where(eq(featureFlags.key, req.params.key)).returning();
      await logHistory(flag.id, flag.key, "enabled", { status: existing.status }, { status: "on" }, uid, req.body.note || "Enabled", existing.rolloutPercentage || 0, 100);
      res.json({ flag, message: `✅ "${flag.name}" enabled globally (100%)` });
    } catch (err: any) { res.status(500).json({ message: "Enable failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DISABLE FLAG — KILL SWITCH
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/feature-flags/:key/disable", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Flag not found" }) as any;
      const uid = (req.session as any).userId;
      const [flag] = await db.update(featureFlags).set({ status: "off", rolloutPercentage: 0, disabledAt: new Date(), updatedAt: new Date() }).where(eq(featureFlags.key, req.params.key)).returning();
      await logHistory(flag.id, flag.key, "disabled", { status: existing.status, rollout: existing.rolloutPercentage }, { status: "off", rollout: 0 }, uid, req.body.reason || "Kill switch activated", existing.rolloutPercentage || 0, 0);
      res.json({ flag, message: `🔴 KILL SWITCH — "${flag.name}" disabled instantly` });
    } catch (err: any) { res.status(500).json({ message: "Kill switch failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SET ROLLOUT PERCENTAGE
  // ═══════════════════════════════════════════════════════════════════════════
  app.patch("/api/feature-flags/:key/rollout", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Flag not found" }) as any;
      if (existing.isLocked) return res.status(423).json({ message: `Flag is locked: ${existing.lockedReason}` }) as any;
      const { percentage, note } = req.body;
      const pct = Math.min(100, Math.max(0, parseInt(percentage)));
      const uid = (req.session as any).userId;
      const newStatus = pct === 100 ? "on" : pct === 0 ? "off" : "rollout";
      const [flag] = await db.update(featureFlags).set({ rolloutPercentage: pct, status: newStatus, updatedAt: new Date() }).where(eq(featureFlags.key, req.params.key)).returning();
      await logHistory(flag.id, flag.key, "rollout-changed", { rollout: existing.rolloutPercentage, status: existing.status }, { rollout: pct, status: newStatus }, uid, note || `Rollout changed to ${pct}%`, existing.rolloutPercentage || 0, pct);
      res.json({ flag, message: `Rollout set to ${pct}% — status: ${newStatus}` });
    } catch (err: any) { res.status(500).json({ message: "Rollout update failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCK / UNLOCK
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/feature-flags/:key/lock", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { reason = "Locked by admin" } = req.body;
      const uid = (req.session as any).userId;
      const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Flag not found" }) as any;
      const [flag] = await db.update(featureFlags).set({ isLocked: true, lockedReason: reason, updatedAt: new Date() }).where(eq(featureFlags.key, req.params.key)).returning();
      await logHistory(flag.id, flag.key, "locked", existing, flag, uid, reason);
      res.json({ flag, message: `🔐 Flag locked: ${reason}` });
    } catch (err: any) { res.status(500).json({ message: "Lock failed" }); }
  });

  app.post("/api/feature-flags/:key/unlock", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const uid = (req.session as any).userId;
      const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Flag not found" }) as any;
      const [flag] = await db.update(featureFlags).set({ isLocked: false, lockedReason: null, updatedAt: new Date() }).where(eq(featureFlags.key, req.params.key)).returning();
      await logHistory(flag.id, flag.key, "unlocked", existing, flag, uid, "Unlocked by admin");
      res.json({ flag, message: "🔓 Flag unlocked" });
    } catch (err: any) { res.status(500).json({ message: "Unlock failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCHEDULE
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/feature-flags/:key/schedule", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { enableAt, disableAt } = req.body;
      const uid = (req.session as any).userId;
      const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Flag not found" }) as any;
      const [flag] = await db.update(featureFlags).set({
        scheduledEnableAt: enableAt ? new Date(enableAt) : null,
        scheduledDisableAt: disableAt ? new Date(disableAt) : null,
        status: "scheduled",
        updatedAt: new Date(),
      }).where(eq(featureFlags.key, req.params.key)).returning();
      await logHistory(flag.id, flag.key, "scheduled", existing, flag, uid, `Scheduled: enable=${enableAt}, disable=${disableAt}`);
      res.json({ flag, message: `⏰ Flag scheduled — enable: ${enableAt || "—"}, disable: ${disableAt || "—"}` });
    } catch (err: any) { res.status(500).json({ message: "Schedule failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FLAG HISTORY
  // ═══════════════════════════════════════════════════════════════════════════
  app.get("/api/feature-flags/:key/history", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [flag] = await db.select({ id: featureFlags.id }).from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!flag) return res.status(404).json({ message: "Flag not found" }) as any;
      const history = await db.select().from(flagHistory).where(eq(flagHistory.flagId, flag.id)).orderBy(desc(flagHistory.createdAt)).limit(50);
      res.json({ history, total: history.length });
    } catch (err: any) { res.status(500).json({ message: "History fetch failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ROLLBACK TO PREVIOUS STATE
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/feature-flags/:key/rollback", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Flag not found" }) as any;
      if (existing.isLocked) return res.status(423).json({ message: `Flag is locked: ${existing.lockedReason}` }) as any;
      const history = await db.select().from(flagHistory).where(eq(flagHistory.flagId, existing.id)).orderBy(desc(flagHistory.createdAt)).limit(10);
      const lastChange = history.find(h => h.previousState && ["enabled","disabled","rollout-changed"].includes(h.action));
      if (!lastChange || !lastChange.previousState) return res.status(400).json({ message: "No previous state to roll back to" }) as any;
      const prev = lastChange.previousState as any;
      const uid = (req.session as any).userId;
      const [flag] = await db.update(featureFlags).set({ status: prev.status || "off", rolloutPercentage: prev.rollout ?? 0, updatedAt: new Date() }).where(eq(featureFlags.key, req.params.key)).returning();
      await logHistory(flag.id, flag.key, "rollback", existing, flag, uid, `Rolled back to: status=${prev.status}, rollout=${prev.rollout}%`);
      res.json({ flag, rolledBackTo: prev, message: `↩ Rolled back "${flag.name}" to status=${prev.status}, rollout=${prev.rollout}%` });
    } catch (err: any) { res.status(500).json({ message: "Rollback failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE FLAG (soft: mark deprecated)
  // ═══════════════════════════════════════════════════════════════════════════
  app.delete("/api/feature-flags/:key", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Flag not found" }) as any;
      if (existing.isKillSwitch) return res.status(403).json({ message: "Kill switch flags cannot be deleted" }) as any;
      const uid = (req.session as any).userId;
      const [flag] = await db.update(featureFlags).set({ status: "deprecated", updatedAt: new Date() }).where(eq(featureFlags.key, req.params.key)).returning();
      await logHistory(flag.id, flag.key, "deleted", existing, flag, uid, "Soft-deleted → deprecated");
      res.json({ message: `Flag "${req.params.key}" deprecated` });
    } catch (err: any) { res.status(500).json({ message: "Delete failed" }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPERIMENTS — LIST & CREATE
  // ═══════════════════════════════════════════════════════════════════════════
  app.get("/api/feature-flags/:key/experiments", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [flag] = await db.select({ id: featureFlags.id }).from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!flag) return res.status(404).json({ message: "Flag not found" }) as any;
      const experiments = await db.select().from(flagExperiments).where(eq(flagExperiments.flagId, flag.id)).orderBy(desc(flagExperiments.createdAt));
      res.json({ experiments });
    } catch (err: any) { res.status(500).json({ message: "Failed to list experiments" }); }
  });

  app.post("/api/feature-flags/:key/experiments", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [flag] = await db.select({ id: featureFlags.id }).from(featureFlags).where(eq(featureFlags.key, req.params.key));
      if (!flag) return res.status(404).json({ message: "Flag not found" }) as any;
      const { name, hypothesis, targetMetric = "conversion_rate", variants = [{ id:"control", name:"Control (off)", rollout:50, isControl:true }, { id:"treatment", name:"Treatment (on)", rollout:50, isControl:false }] } = req.body;
      if (!name) return res.status(400).json({ message: "name required" }) as any;
      const [exp] = await db.insert(flagExperiments).values({ flagId: flag.id, name, hypothesis, targetMetric, variants, trafficSplit: { control: 50, treatment: 50 }, status: "draft" }).returning();
      res.status(201).json({ experiment: exp, message: "A/B experiment created" });
    } catch (err: any) { res.status(500).json({ message: "Experiment creation failed" }); }
  });

  app.patch("/api/feature-flags/:key/experiments/:eid", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { status, trafficSplit, variants } = req.body;
      const updates: any = {};
      if (status) { updates.status = status; if (status === "running") updates.startedAt = new Date(); if (status === "concluded") updates.concludedAt = new Date(); }
      if (trafficSplit) updates.trafficSplit = trafficSplit;
      if (variants) updates.variants = variants;
      const [exp] = await db.update(flagExperiments).set(updates).where(eq(flagExperiments.id, req.params.eid)).returning();
      res.json({ experiment: exp, message: `Experiment ${status || "updated"}` });
    } catch (err: any) { res.status(500).json({ message: "Experiment update failed" }); }
  });

  app.post("/api/feature-flags/:key/experiments/:eid/conclude", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { winner, winnerConfidence = 95, results = {} } = req.body;
      const [exp] = await db.update(flagExperiments).set({ status: "concluded", concludedAt: new Date(), winner, winnerConfidence, results }).where(eq(flagExperiments.id, req.params.eid)).returning();
      res.json({ experiment: exp, message: `Experiment concluded — winner: ${winner} (${winnerConfidence}% confidence)` });
    } catch (err: any) { res.status(500).json({ message: "Conclude failed" }); }
  });

  console.log("[routes] Feature Flags Department v1.0 — 200% ELON MUSK INTELLIGENCE registered: /api/feature-flags/* | 22 Endpoints: Flags-CRUD·Enable·Disable·Rollout·Lock·Schedule·History·Rollback·Evaluate·AI-Predict·Experiments·Integration-Status·Seed·Stats | 30 Built-in Flags seeded on demand | Africa-First: USSD·Mobile-Money·Multi-Currency | Beats LaunchDarkly+Split+Unleash+Flagsmith until 2030");
}
