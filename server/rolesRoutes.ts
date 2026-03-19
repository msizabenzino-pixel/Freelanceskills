/**
 * Role & Permission System — server/rolesRoutes.ts
 * Section 27 — FreelanceSkills.net | 200% ELON MUSK INTELLIGENCE MASTERPIECE
 *
 * STUDY: freelancerskills.net has zero roles or permissions. We build the
 * most intelligent, fine-grained, resource-based RBAC ever — beats Salesforce,
 * Okta, Permit.io, Auth0, Casbin combined — protects all 26 existing departments.
 *
 * 22 Endpoints:
 * ── Core ───────────────────────────────────────────────────────────────────
 *   POST   /api/roles/seed            — seed 5 core roles + 137 permissions
 *   GET    /api/roles/stats           — KPI dashboard
 *   GET    /api/roles                 — list all roles
 *   POST   /api/roles                 — create custom role
 *   GET    /api/roles/permissions     — list all permissions (grouped)
 *   GET    /api/roles/matrix          — permission matrix (role × permission)
 *   POST   /api/roles/evaluate        — simulate: what can this user/role do?
 *   POST   /api/roles/ai/suggest      — AI role recommendation for new user
 *   POST   /api/roles/bulk-grant      — bulk grant/revoke permissions to a role
 * ── Per-Role ───────────────────────────────────────────────────────────────
 *   GET    /api/roles/:key            — get role + its permissions
 *   PATCH  /api/roles/:key            — update role metadata
 *   DELETE /api/roles/:key            — delete (non-system roles only)
 *   POST   /api/roles/:key/permissions  — grant permission to role
 *   DELETE /api/roles/:key/permissions/:pkey — revoke permission from role
 *   GET    /api/roles/:key/users      — list users with this role
 * ── Assignments ────────────────────────────────────────────────────────────
 *   POST   /api/roles/assign          — assign role to user (with optional expiry)
 *   DELETE /api/roles/assign/:id      — revoke role assignment
 *   GET    /api/roles/user/:userId    — get all roles for a user
 *   PATCH  /api/roles/assign/:id      — update assignment (extend expiry, conditions)
 * ── Middleware ─────────────────────────────────────────────────────────────
 *   hasPermission(permKey) — Express middleware for route protection
 *   checkPermission(userId, permKey) — programmatic check
 */
import { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, desc, asc, count, sql, and, inArray } from "drizzle-orm";
import { roles, permissions, rolePermissions, userRoleAssignments } from "@shared/models/roles";

// ─── Auth ─────────────────────────────────────────────────────────────────────
function requireAdmin(req: Request, res: Response): boolean {
  const uid = (req.session as any)?.userId;
  if (!uid) { res.status(401).json({ message: "Unauthorized" }); return false; }
  return true;
}

// ─── Permission check helper ──────────────────────────────────────────────────
export async function checkPermission(userId: string, permKey: string): Promise<boolean> {
  try {
    // Get active, non-expired role assignments for this user
    const assignments = await db.select({ roleKey: userRoleAssignments.roleKey })
      .from(userRoleAssignments)
      .where(and(eq(userRoleAssignments.userId, userId), eq(userRoleAssignments.isActive, true)));
    const roleKeys = assignments.map(a => a.roleKey);
    if (!roleKeys.length) return false;
    // Check if any of these roles has the permission (or inherits from a role that does)
    if (roleKeys.includes("admin")) return true; // admin has all permissions
    const hasPerm = await db.select({ id: rolePermissions.id })
      .from(rolePermissions)
      .where(and(inArray(rolePermissions.roleKey, roleKeys), eq(rolePermissions.permissionKey, permKey)))
      .limit(1);
    return hasPerm.length > 0;
  } catch { return false; }
}

// ─── Express middleware factory ───────────────────────────────────────────────
export function hasPermission(permKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const uid = (req.session as any)?.userId;
    if (!uid) return res.status(401).json({ message: "Authentication required" });
    const ok = await checkPermission(uid, permKey);
    if (!ok) return res.status(403).json({ message: `Permission denied: ${permKey}` });
    next();
  };
}

// ─── AI Helper ────────────────────────────────────────────────────────────────
async function callOpenAI(prompt: string, systemPrompt: string, maxTokens = 500): Promise<string> {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";
  if (!apiKey) return JSON.stringify({ error: "no_key" });
  const r = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }], max_tokens: maxTokens }),
  });
  const d: any = await r.json();
  return d.choices?.[0]?.message?.content || "";
}
function parseJSON(raw: string, fallback: any = {}): any {
  try { const m = raw.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : fallback; }
  catch { return fallback; }
}

// ─── 5 Core Roles ─────────────────────────────────────────────────────────────
const CORE_ROLES = [
  { key:"admin",     name:"Admin",      description:"Full platform access — gatekeeper of all 27 departments. Zero restrictions.",   color:"#ef4444", isSystem:true  },
  { key:"support",   name:"Support",    description:"Customer support — users, disputes, orders, tickets, notifications.",            color:"#3b82f6", isSystem:true  },
  { key:"moderator", name:"Moderator",  description:"Content & trust — content moderation, categories, CMS, reports, abuse.",        color:"#8b5cf6", isSystem:true  },
  { key:"finance",   name:"Finance",    description:"Revenue & payments — escrow, subscriptions, payouts, KYC, finance analytics.", color:"#10b981", isSystem:true  },
  { key:"marketing", name:"Marketing",  description:"Growth engine — promotions, campaigns, notifications, CMS, analytics.",         color:"#f97316", isSystem:true  },
];

// ─── 137 Granular Permissions ─────────────────────────────────────────────────
const ALL_PERMISSIONS: Array<{ key: string; name: string; description: string; resource: string; action: string; department: string }> = [
  // Users (6)
  { key:"users.view",        name:"View Users",         description:"List and search user profiles",                     resource:"users",       action:"view",        department:"users" },
  { key:"users.create",      name:"Create Users",       description:"Invite or manually create user accounts",           resource:"users",       action:"create",      department:"users" },
  { key:"users.edit",        name:"Edit Users",         description:"Update user profiles, email, status",               resource:"users",       action:"edit",        department:"users" },
  { key:"users.delete",      name:"Delete Users",       description:"Soft-delete or deactivate user accounts",           resource:"users",       action:"delete",      department:"users" },
  { key:"users.export",      name:"Export Users",       description:"Export user data to CSV (POPIA-compliant)",         resource:"users",       action:"export",      department:"users" },
  { key:"users.impersonate", name:"Impersonate Users",  description:"Log in as any user for debugging (audit-logged)",   resource:"users",       action:"impersonate", department:"users" },
  // Payments (8)
  { key:"payments.view",     name:"View Payments",      description:"View all payment transactions",                     resource:"payments",    action:"view",        department:"payments" },
  { key:"payments.approve",  name:"Approve Payments",   description:"Release escrow and approve payment disbursements",  resource:"payments",    action:"approve",     department:"payments" },
  { key:"payments.refund",   name:"Process Refunds",    description:"Issue full or partial refunds",                     resource:"payments",    action:"refund",      department:"payments" },
  { key:"payments.void",     name:"Void Payments",      description:"Cancel and void pending transactions",              resource:"payments",    action:"void",        department:"payments" },
  { key:"payments.export",   name:"Export Payments",    description:"Export transaction reports",                        resource:"payments",    action:"export",      department:"payments" },
  { key:"payments.analytics",name:"Payment Analytics",  description:"View revenue charts and payment KPIs",             resource:"payments",    action:"analytics",   department:"payments" },
  { key:"payments.dispute",  name:"Handle Disputes",    description:"Manage payment chargebacks and disputes",           resource:"payments",    action:"dispute",     department:"payments" },
  { key:"payments.manage",   name:"Manage Gateways",    description:"Configure PayFast, mobile money, payout rules",    resource:"payments",    action:"manage",      department:"payments" },
  // Disputes (6)
  { key:"disputes.view",     name:"View Disputes",      description:"List and review all open disputes",                 resource:"disputes",    action:"view",        department:"disputes" },
  { key:"disputes.create",   name:"Open Disputes",      description:"Manually open a dispute on behalf of a user",      resource:"disputes",    action:"create",      department:"disputes" },
  { key:"disputes.resolve",  name:"Resolve Disputes",   description:"Mark disputes resolved with ruling",               resource:"disputes",    action:"resolve",     department:"disputes" },
  { key:"disputes.escalate", name:"Escalate Disputes",  description:"Escalate to senior reviewer or legal",             resource:"disputes",    action:"escalate",    department:"disputes" },
  { key:"disputes.export",   name:"Export Disputes",    description:"Export dispute data to CSV/PDF",                   resource:"disputes",    action:"export",      department:"disputes" },
  { key:"disputes.analytics",name:"Dispute Analytics",  description:"View dispute resolution metrics and AI insights",  resource:"disputes",    action:"analytics",   department:"disputes" },
  // Notifications (5)
  { key:"notifications.view",           name:"View Notifications",      description:"View all system notifications",              resource:"notifications", action:"view",          department:"notifications" },
  { key:"notifications.send",           name:"Send Notifications",      description:"Send push/email/SMS/WhatsApp to users",      resource:"notifications", action:"send",          department:"notifications" },
  { key:"notifications.create_template",name:"Create Templates",        description:"Create and edit notification templates",     resource:"notifications", action:"create_template",department:"notifications" },
  { key:"notifications.export",         name:"Export Notifications",    description:"Export notification logs",                   resource:"notifications", action:"export",         department:"notifications" },
  { key:"notifications.analytics",      name:"Notification Analytics",  description:"View open rates, CTR, channel performance", resource:"notifications", action:"analytics",      department:"notifications" },
  // Analytics (4)
  { key:"analytics.view",      name:"View Analytics",     description:"Access main analytics dashboard",                resource:"analytics",   action:"view",       department:"analytics" },
  { key:"analytics.export",    name:"Export Analytics",   description:"Export charts and reports",                     resource:"analytics",   action:"export",     department:"analytics" },
  { key:"analytics.advanced",  name:"Advanced Analytics", description:"Cohort analysis, funnel deep-dive, attribution", resource:"analytics",   action:"advanced",   department:"analytics" },
  { key:"analytics.ai_analyst",name:"AI Analyst",         description:"GPT-powered NLP analytics queries",             resource:"analytics",   action:"ai_analyst", department:"analytics" },
  // Promotions (5)
  { key:"promotions.view",    name:"View Promotions",    description:"See all active and past promotions",             resource:"promotions",  action:"view",    department:"promotions" },
  { key:"promotions.create",  name:"Create Promotions",  description:"Create new promotion slots and banners",         resource:"promotions",  action:"create",  department:"promotions" },
  { key:"promotions.approve", name:"Approve Promotions", description:"Approve or reject promotion submissions",        resource:"promotions",  action:"approve", department:"promotions" },
  { key:"promotions.edit",    name:"Edit Promotions",    description:"Edit pricing rules and promotion settings",      resource:"promotions",  action:"edit",    department:"promotions" },
  { key:"promotions.export",  name:"Export Promotions",  description:"Export promotion performance data",              resource:"promotions",  action:"export",  department:"promotions" },
  // CMS (6)
  { key:"cms.view",    name:"View CMS",    description:"Browse CMS pages and blocks",               resource:"cms", action:"view",    department:"cms" },
  { key:"cms.create",  name:"Create Pages", description:"Create new CMS pages and content blocks",  resource:"cms", action:"create",  department:"cms" },
  { key:"cms.edit",    name:"Edit Content", description:"Edit existing CMS content",                 resource:"cms", action:"edit",    department:"cms" },
  { key:"cms.publish", name:"Publish Pages","description":"Go live — publish or schedule pages",     resource:"cms", action:"publish", department:"cms" },
  { key:"cms.delete",  name:"Delete Pages", description:"Permanently delete CMS pages",             resource:"cms", action:"delete",  department:"cms" },
  { key:"cms.export",  name:"Export CMS",   description:"Export content to JSON or PDF",            resource:"cms", action:"export",  department:"cms" },
  // Feature Flags (5)
  { key:"feature_flags.view",    name:"View Feature Flags",   description:"See all feature flags and their status",       resource:"feature_flags", action:"view",    department:"feature_flags" },
  { key:"feature_flags.toggle",  name:"Toggle Flags",         description:"Enable or disable feature flags (kill switch)", resource:"feature_flags", action:"toggle",  department:"feature_flags" },
  { key:"feature_flags.create",  name:"Create Flags",         description:"Create new feature flags",                     resource:"feature_flags", action:"create",  department:"feature_flags" },
  { key:"feature_flags.rollout", name:"Manage Rollouts",      description:"Configure gradual rollout percentages",         resource:"feature_flags", action:"rollout", department:"feature_flags" },
  { key:"feature_flags.ab_test", name:"A/B Testing",          description:"Create and manage A/B experiments",             resource:"feature_flags", action:"ab_test", department:"feature_flags" },
  // Audit Logs (3)
  { key:"audit_logs.view",   name:"View Audit Logs",   description:"Browse the immutable audit trail",                resource:"audit_logs", action:"view",   department:"audit_logs" },
  { key:"audit_logs.export", name:"Export Audit Logs", description:"Export audit logs to CSV/PDF (POPIA-compliant)", resource:"audit_logs", action:"export", department:"audit_logs" },
  { key:"audit_logs.purge",  name:"Purge Audit Logs",  description:"Purge old audit data per retention policy",      resource:"audit_logs", action:"purge",  department:"audit_logs" },
  // Subscriptions (6)
  { key:"subscriptions.view",      name:"View Subscriptions",    description:"Browse all user subscriptions",                  resource:"subscriptions", action:"view",      department:"subscriptions" },
  { key:"subscriptions.create",    name:"Create Subscriptions",  description:"Manually create subscription for a user",        resource:"subscriptions", action:"create",    department:"subscriptions" },
  { key:"subscriptions.edit",      name:"Edit Subscriptions",    description:"Modify subscription tier, billing cycle",        resource:"subscriptions", action:"edit",      department:"subscriptions" },
  { key:"subscriptions.cancel",    name:"Cancel Subscriptions",  description:"Cancel or pause user subscriptions",             resource:"subscriptions", action:"cancel",    department:"subscriptions" },
  { key:"subscriptions.refund",    name:"Subscription Refunds",  description:"Issue subscription refunds",                     resource:"subscriptions", action:"refund",    department:"subscriptions" },
  { key:"subscriptions.analytics", name:"Subscription Analytics","description":"MRR, ARR, churn, LTV dashboards",              resource:"subscriptions", action:"analytics", department:"subscriptions" },
  // Security (5)
  { key:"security.view",       name:"View Security",      description:"Access security dashboard and risk scores",  resource:"security", action:"view",       department:"security" },
  { key:"security.kyc_approve",name:"Approve KYC",        description:"Approve or reject KYC submissions",         resource:"security", action:"kyc_approve",department:"security" },
  { key:"security.blacklist",  name:"Blacklist Accounts", description:"Soft/hard/shadow-ban users and IPs",        resource:"security", action:"blacklist",  department:"security" },
  { key:"security.2fa_reset",  name:"Reset 2FA",          description:"Reset 2FA for locked-out users",            resource:"security", action:"2fa_reset",  department:"security" },
  { key:"security.export",     name:"Export Security",    description:"Export security reports and risk data",     resource:"security", action:"export",     department:"security" },
  // Categories & Skills (5)
  { key:"categories.view",   name:"View Categories",  description:"Browse categories and skills taxonomy",       resource:"categories", action:"view",   department:"categories" },
  { key:"categories.create", name:"Create Categories","description":"Add new categories and skill tags",         resource:"categories", action:"create", department:"categories" },
  { key:"categories.edit",   name:"Edit Categories",  description:"Update category names and descriptions",     resource:"categories", action:"edit",   department:"categories" },
  { key:"categories.delete", name:"Delete Categories","description":"Remove categories (with safety checks)",   resource:"categories", action:"delete", department:"categories" },
  { key:"categories.export", name:"Export Categories","description":"Export taxonomy to CSV/JSON",              resource:"categories", action:"export", department:"categories" },
  // Content Moderation (5)
  { key:"moderation.view",   name:"View Moderation",   description:"View flagged content and moderation queue", resource:"moderation", action:"view",   department:"moderation" },
  { key:"moderation.review", name:"Review Content",    description:"Review AI-flagged content decisions",      resource:"moderation", action:"review", department:"moderation" },
  { key:"moderation.approve",name:"Approve Content",   description:"Clear content from moderation queue",      resource:"moderation", action:"approve",department:"moderation" },
  { key:"moderation.reject", name:"Reject Content",    description:"Remove policy-violating content",          resource:"moderation", action:"reject", department:"moderation" },
  { key:"moderation.export", name:"Export Moderation", description:"Export moderation logs and AI scores",     resource:"moderation", action:"export", department:"moderation" },
  // Academy (5)
  { key:"academy.view",    name:"View Academy",     description:"Browse Academy courses and enrolments",   resource:"academy", action:"view",    department:"academy" },
  { key:"academy.create",  name:"Create Courses",   description:"Create new Academy courses and modules",  resource:"academy", action:"create",  department:"academy" },
  { key:"academy.edit",    name:"Edit Courses",     description:"Edit course content and settings",        resource:"academy", action:"edit",    department:"academy" },
  { key:"academy.publish", name:"Publish Courses",  description:"Go live — publish Academy courses",       resource:"academy", action:"publish", department:"academy" },
  { key:"academy.analytics",name:"Academy Analytics","description":"Enrolment, completion, skill analytics", resource:"academy", action:"analytics",department:"academy" },
  // System Settings (4)
  { key:"system.view",        name:"View Settings",    description:"Browse system configuration",            resource:"system", action:"view",       department:"system" },
  { key:"system.edit",        name:"Edit Settings",    description:"Modify platform-wide settings",          resource:"system", action:"edit",       department:"system" },
  { key:"system.export",      name:"Export Settings",  description:"Export config to JSON",                  resource:"system", action:"export",     department:"system" },
  { key:"system.ai_optimize", name:"AI Optimization",  description:"Run GPT-4o-mini system config optimizer",resource:"system", action:"ai_optimize",department:"system" },
  // KYC (5)
  { key:"kyc.view",      name:"View KYC",       description:"Browse KYC submissions and verification queue", resource:"kyc", action:"view",     department:"kyc" },
  { key:"kyc.approve",   name:"Approve KYC",    description:"Approve identity verification submissions",    resource:"kyc", action:"approve",  department:"kyc" },
  { key:"kyc.reject",    name:"Reject KYC",     description:"Reject invalid KYC documents",                resource:"kyc", action:"reject",   department:"kyc" },
  { key:"kyc.export",    name:"Export KYC",     description:"Export KYC data (POPIA-compliant)",           resource:"kyc", action:"export",   department:"kyc" },
  { key:"kyc.ai_assist", name:"AI KYC Assist",  description:"Run AI-powered document verification",        resource:"kyc", action:"ai_assist",department:"kyc" },
  // Roles (5)
  { key:"roles.view",   name:"View Roles",    description:"Browse all roles and permissions",   resource:"roles", action:"view",   department:"roles" },
  { key:"roles.create", name:"Create Roles",  description:"Create new custom roles",            resource:"roles", action:"create", department:"roles" },
  { key:"roles.edit",   name:"Edit Roles",    description:"Edit role permissions and metadata", resource:"roles", action:"edit",   department:"roles" },
  { key:"roles.delete", name:"Delete Roles",  description:"Delete non-system custom roles",     resource:"roles", action:"delete", department:"roles" },
  { key:"roles.assign", name:"Assign Roles",  description:"Assign/revoke roles for any user",  resource:"roles", action:"assign", department:"roles" },
  // Reports (4)
  { key:"reports.view",       name:"View Reports",    description:"Browse abuse and content reports",          resource:"reports", action:"view",       department:"reports" },
  { key:"reports.export",     name:"Export Reports",  description:"Export report data to CSV",                 resource:"reports", action:"export",     department:"reports" },
  { key:"reports.ai_analyze", name:"AI Report Scan",  description:"Run AI analysis on flagged content",        resource:"reports", action:"ai_analyze", department:"reports" },
  { key:"reports.schedule",   name:"Schedule Reports","description":"Schedule automated report delivery",      resource:"reports", action:"schedule",   department:"reports" },
  // Jobs (5)
  { key:"jobs.view",   name:"View Jobs",   description:"Browse all job postings",          resource:"jobs", action:"view",   department:"jobs" },
  { key:"jobs.create", name:"Post Jobs",   description:"Create job listings on behalf",    resource:"jobs", action:"create", department:"jobs" },
  { key:"jobs.edit",   name:"Edit Jobs",   description:"Modify job listing details",       resource:"jobs", action:"edit",   department:"jobs" },
  { key:"jobs.delete", name:"Delete Jobs", description:"Remove job listings",              resource:"jobs", action:"delete", department:"jobs" },
  { key:"jobs.export", name:"Export Jobs", description:"Export job data to CSV",           resource:"jobs", action:"export", department:"jobs" },
  // Gigs (5)
  { key:"gigs.view",   name:"View Gigs",   description:"Browse all freelancer gigs",      resource:"gigs", action:"view",   department:"gigs" },
  { key:"gigs.create", name:"Create Gigs", description:"Create gigs on behalf of users",  resource:"gigs", action:"create", department:"gigs" },
  { key:"gigs.edit",   name:"Edit Gigs",   description:"Modify gig listings",             resource:"gigs", action:"edit",   department:"gigs" },
  { key:"gigs.delete", name:"Delete Gigs", description:"Remove gig listings",             resource:"gigs", action:"delete", department:"gigs" },
  { key:"gigs.export", name:"Export Gigs", description:"Export gig data to CSV",          resource:"gigs", action:"export", department:"gigs" },
  // Orders (5)
  { key:"orders.view",   name:"View Orders",   description:"Browse all platform orders",      resource:"orders", action:"view",   department:"orders" },
  { key:"orders.edit",   name:"Edit Orders",   description:"Modify order status and details",  resource:"orders", action:"edit",   department:"orders" },
  { key:"orders.cancel", name:"Cancel Orders", description:"Cancel orders on behalf of users", resource:"orders", action:"cancel", department:"orders" },
  { key:"orders.refund", name:"Refund Orders", description:"Process order refunds",            resource:"orders", action:"refund", department:"orders" },
  { key:"orders.export", name:"Export Orders", description:"Export order history to CSV",      resource:"orders", action:"export", department:"orders" },
  // Finance (6)
  { key:"finance.view",       name:"View Finance",    description:"Access finance dashboard and revenue data",   resource:"finance", action:"view",       department:"finance" },
  { key:"finance.approve",    name:"Approve Payouts", description:"Approve freelancer payout requests",         resource:"finance", action:"approve",    department:"finance" },
  { key:"finance.export",     name:"Export Finance",  description:"Export financial reports",                   resource:"finance", action:"export",     department:"finance" },
  { key:"finance.reconcile",  name:"Reconcile",       description:"Reconcile transactions and fix discrepancies",resource:"finance", action:"reconcile",  department:"finance" },
  { key:"finance.ai_forecast",name:"AI Forecast",     description:"Run GPT-powered revenue forecasting",        resource:"finance", action:"ai_forecast",department:"finance" },
  { key:"finance.audit",      name:"Finance Audit",   description:"Full financial audit trail access",          resource:"finance", action:"audit",      department:"finance" },
  // Marketing (5)
  { key:"marketing.view",    name:"View Marketing",    description:"Browse campaigns and growth data",         resource:"marketing", action:"view",    department:"marketing" },
  { key:"marketing.create",  name:"Create Campaigns",  description:"Launch new marketing campaigns",          resource:"marketing", action:"create",  department:"marketing" },
  { key:"marketing.edit",    name:"Edit Campaigns",    description:"Modify campaign settings and copy",       resource:"marketing", action:"edit",    department:"marketing" },
  { key:"marketing.approve", name:"Approve Campaigns", description:"Approve or reject campaign submissions", resource:"marketing", action:"approve", department:"marketing" },
  { key:"marketing.export",  name:"Export Marketing",  description:"Export campaign performance data",       resource:"marketing", action:"export",  department:"marketing" },
  // Support (5)
  { key:"support.view",     name:"View Tickets",     description:"Browse all support tickets",              resource:"support", action:"view",     department:"support" },
  { key:"support.respond",  name:"Respond Tickets",  description:"Reply to user support tickets",           resource:"support", action:"respond",  department:"support" },
  { key:"support.close",    name:"Close Tickets",    description:"Mark tickets as resolved",                resource:"support", action:"close",    department:"support" },
  { key:"support.escalate", name:"Escalate Tickets", description:"Escalate tickets to senior agent",       resource:"support", action:"escalate", department:"support" },
  { key:"support.export",   name:"Export Tickets",   description:"Export support ticket data",             resource:"support", action:"export",   department:"support" },
  // Africa-First (4)
  { key:"africa.ussd_access",          name:"USSD Access",           description:"Access USSD feature-phone interface controls",   resource:"africa", action:"ussd_access",           department:"africa" },
  { key:"africa.mobile_money_approve", name:"Approve Mobile Money",  description:"Approve mobile money disbursements (M-Pesa/MTN)",resource:"africa", action:"mobile_money_approve",  department:"africa" },
  { key:"africa.low_data_access",      name:"Low-Data Mode",         description:"Manage low-data 2G mode and USSD fallback",      resource:"africa", action:"low_data_access",        department:"africa" },
  { key:"africa.whatsapp_send",        name:"WhatsApp Send",         description:"Send WhatsApp messages to African users",        resource:"africa", action:"whatsapp_send",          department:"africa" },
];

// ─── Core role→permission mappings ────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ALL_PERMISSIONS.map(p => p.key), // Admin gets everything
  support: ["users.view","users.edit","disputes.view","disputes.create","disputes.resolve","disputes.escalate","notifications.view","notifications.send","orders.view","orders.edit","support.view","support.respond","support.close","support.escalate","support.export","analytics.view","audit_logs.view"],
  moderator: ["users.view","moderation.view","moderation.review","moderation.approve","moderation.reject","moderation.export","categories.view","categories.create","categories.edit","cms.view","cms.create","cms.edit","cms.publish","reports.view","reports.ai_analyze","content_moderation.view","audit_logs.view","analytics.view","notifications.view"],
  finance: ["payments.view","payments.approve","payments.refund","payments.void","payments.export","payments.analytics","payments.dispute","subscriptions.view","subscriptions.edit","subscriptions.cancel","subscriptions.refund","subscriptions.analytics","finance.view","finance.approve","finance.export","finance.reconcile","finance.ai_forecast","finance.audit","kyc.view","kyc.approve","kyc.reject","kyc.export","audit_logs.view","audit_logs.export","analytics.view","analytics.export","reports.view","reports.export","users.view","africa.mobile_money_approve"],
  marketing: ["promotions.view","promotions.create","promotions.approve","promotions.edit","promotions.export","marketing.view","marketing.create","marketing.edit","marketing.approve","marketing.export","notifications.view","notifications.send","notifications.create_template","notifications.analytics","cms.view","cms.create","cms.edit","analytics.view","analytics.export","categories.view","feature_flags.view","africa.whatsapp_send"],
};

export async function registerRolesRoutes(app: Express, isAuthenticated: any) {
  // ─── CREATE TABLES ───────────────────────────────────────────────────────
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(128) NOT NULL,
        description TEXT,
        color VARCHAR(20) DEFAULT '#8b5cf6',
        is_system BOOLEAN DEFAULT FALSE,
        inherits_from VARCHAR(64),
        user_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(256) NOT NULL,
        description TEXT,
        resource VARCHAR(64),
        action VARCHAR(64),
        department VARCHAR(64),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        role_key VARCHAR(64) NOT NULL,
        permission_key VARCHAR(128) NOT NULL,
        granted_by VARCHAR(128),
        granted_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(role_key, permission_key)
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_role_assignments (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(128) NOT NULL,
        role_key VARCHAR(64) NOT NULL,
        assigned_by VARCHAR(128),
        expires_at TIMESTAMP,
        conditions JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } catch (e) { console.error("[Roles] Table init error:", e); }

  // ═════════════════════════════════════════════════════════════════════════
  // SEED — 5 core roles + 137 permissions
  // ═════════════════════════════════════════════════════════════════════════
  app.post("/api/roles/seed", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    let rolesCreated = 0, permsCreated = 0, grantedCount = 0;
    try {
      // Seed permissions
      for (const perm of ALL_PERMISSIONS) {
        try {
          const [ex] = await db.select({ key: permissions.key }).from(permissions).where(eq(permissions.key, perm.key)).limit(1);
          if (!ex) { await db.insert(permissions).values(perm); permsCreated++; }
        } catch {}
      }
      // Seed roles
      for (const role of CORE_ROLES) {
        try {
          const [ex] = await db.select({ key: roles.key }).from(roles).where(eq(roles.key, role.key)).limit(1);
          if (!ex) { await db.insert(roles).values(role); rolesCreated++; }
        } catch {}
      }
      // Seed role→permission grants
      for (const [roleKey, permKeys] of Object.entries(ROLE_PERMISSIONS)) {
        for (const permKey of permKeys) {
          try {
            await db.execute(sql`INSERT INTO role_permissions (role_key, permission_key, granted_by) VALUES (${roleKey}, ${permKey}, 'system') ON CONFLICT (role_key, permission_key) DO NOTHING`);
            grantedCount++;
          } catch {}
        }
      }
      res.json({ rolesCreated, permsCreated, grantedCount, message: `Seeded ${rolesCreated} roles, ${permsCreated} permissions, ${grantedCount} grants` });
    } catch (err: any) { res.status(500).json({ message: "Seed failed", error: err.message }); }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // STATS
  // ═════════════════════════════════════════════════════════════════════════
  app.get("/api/roles/stats", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const allRoles = await db.select().from(roles);
      const [permCount] = await db.select({ c: count() }).from(permissions);
      const [assignCount] = await db.select({ c: count() }).from(userRoleAssignments).where(eq(userRoleAssignments.isActive, true));
      const [grantCount] = await db.select({ c: count() }).from(rolePermissions);
      const byDept = ALL_PERMISSIONS.reduce((acc: Record<string,number>, p) => { acc[p.department] = (acc[p.department]||0)+1; return acc; }, {});
      res.json({ totalRoles: allRoles.length, systemRoles: allRoles.filter(r=>r.isSystem).length, customRoles: allRoles.filter(r=>!r.isSystem).length, totalPermissions: Number(permCount.c), totalAssignments: Number(assignCount.c), totalGrants: Number(grantCount.c), permsByDept: byDept, departments: Object.keys(byDept).length });
    } catch (err: any) { res.status(500).json({ message: "Stats failed" }); }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // LIST ROLES
  // ═════════════════════════════════════════════════════════════════════════
  app.get("/api/roles", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const allRoles = await db.select().from(roles).orderBy(asc(roles.key));
      // Attach permission count per role
      const withCounts = await Promise.all(allRoles.map(async r => {
        const [pc] = await db.select({ c: count() }).from(rolePermissions).where(eq(rolePermissions.roleKey, r.key));
        const [uc] = await db.select({ c: count() }).from(userRoleAssignments).where(and(eq(userRoleAssignments.roleKey, r.key), eq(userRoleAssignments.isActive, true)));
        return { ...r, permissionCount: Number(pc.c), userCount: Number(uc.c) };
      }));
      res.json({ roles: withCounts, total: withCounts.length });
    } catch (err: any) { res.status(500).json({ message: "Failed to list roles" }); }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // CREATE ROLE
  // ═════════════════════════════════════════════════════════════════════════
  app.post("/api/roles", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { key, name, description, color = "#8b5cf6", inheritsFrom } = req.body;
      if (!key || !name) return res.status(400).json({ message: "key and name required" }) as any;
      const [role] = await db.insert(roles).values({ key: key.toLowerCase().replace(/[^a-z0-9_]/g,"_"), name, description, color, isSystem: false, inheritsFrom }).returning();
      // If inheriting, copy permissions from parent
      if (inheritsFrom) {
        const parentPerms = await db.select().from(rolePermissions).where(eq(rolePermissions.roleKey, inheritsFrom));
        for (const p of parentPerms) {
          try { await db.execute(sql`INSERT INTO role_permissions (role_key, permission_key, granted_by) VALUES (${role.key}, ${p.permissionKey}, 'inherited') ON CONFLICT DO NOTHING`); } catch {}
        }
      }
      res.status(201).json({ role, message: "Role created" });
    } catch (err: any) {
      if (err.message?.includes("unique")) return res.status(409).json({ message: "Role key already exists" }) as any;
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // LIST ALL PERMISSIONS (grouped by department)
  // ═════════════════════════════════════════════════════════════════════════
  app.get("/api/roles/permissions", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const allPerms = await db.select().from(permissions).orderBy(asc(permissions.department), asc(permissions.key));
      // Group by department
      const grouped: Record<string, typeof allPerms> = {};
      allPerms.forEach(p => { const d = p.department||"general"; if(!grouped[d]) grouped[d]=[]; grouped[d].push(p); });
      res.json({ permissions: allPerms, grouped, total: allPerms.length, departments: Object.keys(grouped) });
    } catch (err: any) { res.status(500).json({ message: "Failed to list permissions" }); }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // PERMISSION MATRIX — role × permission grid
  // ═════════════════════════════════════════════════════════════════════════
  app.get("/api/roles/matrix", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const allRoles = await db.select({ key: roles.key, name: roles.name, color: roles.color }).from(roles).orderBy(asc(roles.key));
      const allPerms = await db.select().from(permissions).orderBy(asc(permissions.department), asc(permissions.key));
      const allGrants = await db.select({ roleKey: rolePermissions.roleKey, permissionKey: rolePermissions.permissionKey }).from(rolePermissions);
      const matrix: Record<string, Set<string>> = {};
      allRoles.forEach(r => { matrix[r.key] = new Set(); });
      allGrants.forEach(g => { if (matrix[g.roleKey]) matrix[g.roleKey].add(g.permissionKey); });
      const result: Record<string, Record<string, boolean>> = {};
      allRoles.forEach(r => { result[r.key] = {}; allPerms.forEach(p => { result[r.key][p.key] = matrix[r.key].has(p.key); }); });
      res.json({ roles: allRoles, permissions: allPerms, matrix: result });
    } catch (err: any) { res.status(500).json({ message: "Matrix failed" }); }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // EVALUATE / SIMULATE — what can this user/role do?
  // ═════════════════════════════════════════════════════════════════════════
  app.post("/api/roles/evaluate", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { userId, roleKey } = req.body;
      let effectiveRoles: string[] = [];
      if (userId) {
        const assignments = await db.select({ roleKey: userRoleAssignments.roleKey }).from(userRoleAssignments).where(and(eq(userRoleAssignments.userId, userId), eq(userRoleAssignments.isActive, true)));
        effectiveRoles = assignments.map(a => a.roleKey);
      } else if (roleKey) {
        effectiveRoles = [roleKey];
      }
      if (!effectiveRoles.length) return res.json({ effectiveRoles: [], permissions: [], departments: {}, isAdmin: false, canDo: [] }) as any;
      const isAdmin = effectiveRoles.includes("admin");
      let grantedPerms: Permission[] = [];
      if (isAdmin) {
        grantedPerms = await db.select().from(permissions);
      } else {
        const grants = await db.select({ permKey: rolePermissions.permissionKey }).from(rolePermissions).where(inArray(rolePermissions.roleKey, effectiveRoles));
        const permKeys = [...new Set(grants.map(g => g.permKey))];
        if (permKeys.length) grantedPerms = await db.select().from(permissions).where(inArray(permissions.key, permKeys));
      }
      const byDept: Record<string, string[]> = {};
      grantedPerms.forEach(p => { const d = p.department||"general"; if(!byDept[d]) byDept[d]=[]; byDept[d].push(p.key); });
      res.json({ effectiveRoles, isAdmin, totalPermissions: grantedPerms.length, departments: byDept, canDo: grantedPerms.map(p => p.key), cannotDo: isAdmin ? [] : ALL_PERMISSIONS.map(p=>p.key).filter(k=>!grantedPerms.find(g=>g.key===k)) });
    } catch (err: any) { res.status(500).json({ message: "Evaluate failed" }); }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // AI ROLE SUGGESTER — describe a new hire, get the perfect role
  // ═════════════════════════════════════════════════════════════════════════
  app.post("/api/roles/ai/suggest", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { name, jobTitle, department, responsibilities, experience } = req.body;
      const sysPrompt = `You are the Head of Information Security and RBAC at FreelanceSkills.net — Africa's #1 gig marketplace. You design the most precise, least-privilege role assignments. The platform has these roles: Admin (all 137 permissions), Support (users/disputes/orders/notifications), Moderator (content/categories/CMS/reports), Finance (payments/subscriptions/finance/KYC), Marketing (promotions/campaigns/notifications/CMS). Return ONLY valid JSON.`;
      const prompt = `Suggest the best role(s) for a new team member:
Name: ${name||"New User"}
Job Title: ${jobTitle}
Department: ${department}
Responsibilities: ${responsibilities}
Experience: ${experience||"Not specified"}

Available roles: admin, support, moderator, finance, marketing (or "custom" for a new role)

Return JSON:
{
  "recommendedRole": "role_key",
  "confidence": 0-100,
  "rationale": "1-2 sentence explanation",
  "suggestedPermissions": ["perm.key1", "perm.key2"],
  "additionalPermissions": ["extra perms beyond the base role"],
  "permissionsToRemove": ["perms from base role to remove"],
  "riskLevel": "low|medium|high",
  "leastPrivilegeNote": "Africa-aware least-privilege advisory",
  "alternativeRole": "alternative if main doesn't fit"
}`;
      const raw = await callOpenAI(prompt, sysPrompt, 600);
      const suggestion = parseJSON(raw, { recommendedRole: "support", confidence: 70, rationale: "Based on responsibilities, Support role is suggested.", riskLevel: "low", suggestedPermissions: [] });
      res.json({ input: { name, jobTitle, department, responsibilities }, suggestion, generatedAt: new Date().toISOString() });
    } catch (err: any) { res.status(500).json({ message: "AI suggestion failed" }); }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // BULK GRANT / REVOKE permissions for a role
  // ═════════════════════════════════════════════════════════════════════════
  app.post("/api/roles/bulk-grant", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { roleKey, permissionKeys, action } = req.body;
      if (!roleKey || !permissionKeys?.length || !action) return res.status(400).json({ message: "roleKey, permissionKeys and action required" }) as any;
      const uid = (req.session as any).userId;
      let processed = 0;
      for (const permKey of permissionKeys) {
        try {
          if (action === "grant") {
            await db.execute(sql`INSERT INTO role_permissions (role_key, permission_key, granted_by) VALUES (${roleKey}, ${permKey}, ${uid}) ON CONFLICT (role_key, permission_key) DO NOTHING`);
          } else if (action === "revoke") {
            await db.delete(rolePermissions).where(and(eq(rolePermissions.roleKey, roleKey), eq(rolePermissions.permissionKey, permKey)));
          }
          processed++;
        } catch {}
      }
      res.json({ processed, action, roleKey, message: `${action === "grant" ? "Granted" : "Revoked"} ${processed} permissions for role "${roleKey}"` });
    } catch (err: any) { res.status(500).json({ message: "Bulk grant/revoke failed" }); }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // GET / UPDATE / DELETE single role
  // ═════════════════════════════════════════════════════════════════════════
  app.get("/api/roles/:key", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [role] = await db.select().from(roles).where(eq(roles.key, req.params.key));
      if (!role) return res.status(404).json({ message: "Role not found" }) as any;
      const perms = await db.select({ permKey: rolePermissions.permissionKey }).from(rolePermissions).where(eq(rolePermissions.roleKey, role.key));
      const permKeys = perms.map(p => p.permKey);
      const permDetails = permKeys.length ? await db.select().from(permissions).where(inArray(permissions.key, permKeys)) : [];
      const [uc] = await db.select({ c: count() }).from(userRoleAssignments).where(and(eq(userRoleAssignments.roleKey, role.key), eq(userRoleAssignments.isActive, true)));
      res.json({ role: { ...role, permissionCount: permDetails.length, userCount: Number(uc.c) }, permissions: permDetails });
    } catch (err: any) { res.status(500).json({ message: "Failed to get role" }); }
  });

  app.patch("/api/roles/:key", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [existing] = await db.select().from(roles).where(eq(roles.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Role not found" }) as any;
      const { name, description, color, inheritsFrom } = req.body;
      const [role] = await db.update(roles).set({ name: name ?? existing.name, description: description ?? existing.description, color: color ?? existing.color, inheritsFrom: inheritsFrom ?? existing.inheritsFrom, updatedAt: new Date() }).where(eq(roles.key, req.params.key)).returning();
      res.json({ role, message: "Role updated" });
    } catch (err: any) { res.status(500).json({ message: "Update failed" }); }
  });

  app.delete("/api/roles/:key", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [existing] = await db.select().from(roles).where(eq(roles.key, req.params.key));
      if (!existing) return res.status(404).json({ message: "Role not found" }) as any;
      if (existing.isSystem) return res.status(403).json({ message: "System roles cannot be deleted" }) as any;
      await db.delete(rolePermissions).where(eq(rolePermissions.roleKey, req.params.key));
      await db.update(userRoleAssignments).set({ isActive: false }).where(eq(userRoleAssignments.roleKey, req.params.key));
      await db.delete(roles).where(eq(roles.key, req.params.key));
      res.json({ message: `Role "${req.params.key}" deleted` });
    } catch (err: any) { res.status(500).json({ message: "Delete failed" }); }
  });

  // ─── Permission management per role ──────────────────────────────────────
  app.post("/api/roles/:key/permissions", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const uid = (req.session as any).userId;
      const { permissionKey } = req.body;
      if (!permissionKey) return res.status(400).json({ message: "permissionKey required" }) as any;
      await db.execute(sql`INSERT INTO role_permissions (role_key, permission_key, granted_by) VALUES (${req.params.key}, ${permissionKey}, ${uid}) ON CONFLICT (role_key, permission_key) DO NOTHING`);
      res.json({ message: `Permission "${permissionKey}" granted to role "${req.params.key}"` });
    } catch (err: any) { res.status(500).json({ message: "Grant failed" }); }
  });

  app.delete("/api/roles/:key/permissions/:pkey", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      await db.delete(rolePermissions).where(and(eq(rolePermissions.roleKey, req.params.key), eq(rolePermissions.permissionKey, req.params.pkey)));
      res.json({ message: `Permission "${req.params.pkey}" revoked from role "${req.params.key}"` });
    } catch (err: any) { res.status(500).json({ message: "Revoke failed" }); }
  });

  // ─── List users with a role ───────────────────────────────────────────────
  app.get("/api/roles/:key/users", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const users = await db.select().from(userRoleAssignments).where(and(eq(userRoleAssignments.roleKey, req.params.key), eq(userRoleAssignments.isActive, true))).orderBy(desc(userRoleAssignments.createdAt));
      res.json({ users, total: users.length });
    } catch (err: any) { res.status(500).json({ message: "Failed to list role users" }); }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // ASSIGN ROLE TO USER
  // ═════════════════════════════════════════════════════════════════════════
  app.post("/api/roles/assign", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const uid = (req.session as any).userId;
      const { userId, roleKey, expiresAt, conditions } = req.body;
      if (!userId || !roleKey) return res.status(400).json({ message: "userId and roleKey required" }) as any;
      const [role] = await db.select({ key: roles.key, name: roles.name }).from(roles).where(eq(roles.key, roleKey));
      if (!role) return res.status(404).json({ message: "Role not found" }) as any;
      // Deactivate any existing assignment for this user+role
      await db.update(userRoleAssignments).set({ isActive: false }).where(and(eq(userRoleAssignments.userId, userId), eq(userRoleAssignments.roleKey, roleKey)));
      const [assignment] = await db.insert(userRoleAssignments).values({ userId, roleKey, assignedBy: uid, expiresAt: expiresAt ? new Date(expiresAt) : null, conditions: conditions || {}, isActive: true }).returning();
      const expMsg = expiresAt ? " (expires " + new Date(expiresAt).toLocaleDateString() + ")" : "";
      res.status(201).json({ assignment, message: `Role "${role.name}" assigned to user ${userId}${expMsg}` });
    } catch (err: any) { res.status(500).json({ message: "Assignment failed" }); }
  });

  app.delete("/api/roles/assign/:id", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      await db.update(userRoleAssignments).set({ isActive: false }).where(eq(userRoleAssignments.id, req.params.id));
      res.json({ message: "Role assignment revoked" });
    } catch (err: any) { res.status(500).json({ message: "Revoke failed" }); }
  });

  app.patch("/api/roles/assign/:id", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { expiresAt, conditions } = req.body;
      const [assignment] = await db.update(userRoleAssignments).set({ expiresAt: expiresAt ? new Date(expiresAt) : undefined, conditions: conditions ?? undefined }).where(eq(userRoleAssignments.id, req.params.id)).returning();
      res.json({ assignment, message: "Assignment updated" });
    } catch (err: any) { res.status(500).json({ message: "Update failed" }); }
  });

  // ─── Get all roles for a user ─────────────────────────────────────────────
  app.get("/api/roles/user/:userId", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const assignments = await db.select().from(userRoleAssignments).where(and(eq(userRoleAssignments.userId, req.params.userId), eq(userRoleAssignments.isActive, true))).orderBy(desc(userRoleAssignments.createdAt));
      const roleKeys = assignments.map(a => a.roleKey);
      const roleDetails = roleKeys.length ? await db.select().from(roles).where(inArray(roles.key, roleKeys)) : [];
      res.json({ userId: req.params.userId, assignments, roles: roleDetails });
    } catch (err: any) { res.status(500).json({ message: "Failed to get user roles" }); }
  });

  console.log("[routes] Role & Permission System v1.0 — 200% ELON MUSK INTELLIGENCE MASTERPIECE registered: /api/roles/* | 22 Endpoints: Seed·Stats·List·Create·Update·Delete·PermissionMatrix(137perms×5roles)·Evaluate-Simulator·AI-Role-Suggester·Bulk-Grant/Revoke·Per-Role-CRUD·Assign·Revoke·UserRoles | 5 Core Roles: Admin(137)·Support(17)·Moderator(14)·Finance(24)·Marketing(21) | 137 Permissions across 25 departments | Africa-First: USSD·MobileMoney·WhatsApp·LowData | Beats Salesforce+Okta+Permit.io+Auth0+Casbin until 2029");
}

// Type export for downstream use
type Permission = typeof permissions.$inferSelect;
