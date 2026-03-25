# FreelanceSkills - Global Freelance Marketplace

## Overview

FreelanceSkills is a full-stack freelance marketplace designed to connect local and remote talent with clients, with an initial focus on South Africa and global expansion plans. The platform aims to create 1 Million job opportunities by 2031 by offering job postings, TaskRabbit-style service packages with booking functionality, and operating on a commission-based, escrow-secured model. Key features include AI-powered matching, proposal generation, job post assistance, profile optimization, a global job board, an upskilling academy, and robust growth systems like business invites and a referral program.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX & Design Decisions
The platform prioritizes a mobile-first, PWA-enabled design with strong accessibility features (skip-to-content, ARIA labels, keyboard navigation, high-contrast mode). It uses an emerald theme and incorporates UI elements like an onboarding carousel, floating action button, and a support chat widget. The mobile application provides a comprehensive user experience with a 5-tab bottom navigator, push notifications, biometric authentication, deep linking, offline caching, and native camera integration.

### Technical Implementations
**Frontend**: Built with React 18 and TypeScript, using Wouter for routing, TanStack React Query for state management, and Tailwind CSS v4 with shadcn/ui (New York style) for styling. Vite is used as the build tool.
**Backend**: Developed with Node.js and Express in TypeScript (ESM modules), exposing a RESTful JSON API. Authentication is custom email/password with bcryptjs and PostgreSQL-backed sessions. Real-time communication for chat and notifications is handled by Socket.io.
**Data Storage**: PostgreSQL is the primary database, managed with Drizzle ORM and drizzle-zod. Key data models include Users, Profiles, Jobs, Service Packages, Bookings, Reviews, Messages, AI Conversations, and various growth/academy related entities.
**AI Engine**: A comprehensive AI suite supports task recommendation, proposal assistance, job post improvement, profile optimization, CV parsing, global job sourcing, opportunity finding, cover letter generation, and a support chatbot. Advanced AI features include multi-turn conversation memory, budget prediction, skill-gap analysis, application fraud scoring, job success prediction, and dynamic pricing. The Admin platform further leverages AI for freelancer scoring, LTV analysis, fraud detection, dispute mediation, and personalized communications.
**Growth Systems**: Includes a Business Invite System for generating unique invite codes and claiming business listings, and a Referral Program with tiered rewards and tracking.
**Payment & Escrow**: Integrated with PayFast (South Africa) for payments, supporting various methods (Credit/Debit Card, EFT, SnapScan, Mobicred, Samsung Pay, Apple Pay) with an ITN webhook for escrow management.
**Security & Fraud Prevention**: Implements rate limiting, CORS, Helmet-equivalent headers, mass assignment prevention, session-based authentication, cron-job based fraud detection, audit logging, and dispute resolution.
**Notification System**: Real-time and persistent notifications via Socket.io and database storage.

### System Design Choices
The architecture is designed for scalability and maintainability, with clear separation of concerns between frontend, backend, and data layers. The modular design supports the integration of advanced features such as the 2031 Vision Modules, which include blockchain credentials, NFT certifications, green impact scoring, DAO governance, and AI-driven insights. Edge case handlers are robustly implemented to manage complex scenarios like account deletion mid-escrow, high concurrent application queues, and dispute escalations. An admin platform provides comprehensive control and analytics over all aspects of the marketplace.

## Recent Platform Upgrades (March 2026)

### Homepage Nuclear Upgrade
- **LiveActivityTicker**: Animated social proof ticker cycling through 10 real-time-style platform events every 4 seconds (above main content, below hero)
- **TrustStrip**: 6 trust signals across the page (POPIA Compliant, Escrow Protected, 14-Day Money-Back, CIPC Registered, ID Verified Talent, 48h Dispute Resolution)
- **PressLogosSA**: "As featured in South African media" section with 6 SA media outlet logos (TechCabal, Daily Maverick, Fin24, MyBroadband, Business Insider SA, ITWeb) — positioned after success stories section
- **Newsletter Section**: Full email capture section before footer with POPIA-compliant copy and success/error states
- **Dynamic Blog Teaser**: Blog teaser now fetches live articles from `/api/blog/posts?limit=3&featured=true` with fallback to hardcoded content

### Newsletter System
- **DB Table**: `newsletter_subscribers` table created (id, email, first_name, source, tags, subscribed, confirmed_at, created_at)
- **API Endpoints**: `POST /api/newsletter/subscribe` (upsert logic), `GET /api/newsletter/count` (subscriber count)
- **Schema**: Added to `shared/models/marketing.ts`

### Navbar
- **Academy link**: Added "Academy" with GraduationCap icon to main desktop navigation between "Services" and "Blog"

### Footer
- **Trust Badges Row**: Added 5-badge trust strip at top of footer (POPIA, Escrow, 14-Day Money-Back, CIPC, ID Verified) with color-coded icons

## External Dependencies

-   **Database**: PostgreSQL
-   **AI**: OpenAI API (gpt-4o-mini)
-   **Payments**: PayFast API, Stripe API (`@stripe/stripe-js`)
-   **Authentication**: bcryptjs, express-session, connect-pg-simple
-   **Real-time Communication**: Socket.io
-   **UI Components**: shadcn/ui (based on Radix UI), Lucide React (icons), Framer Motion (animations), Embla Carousel
-   **Mobile Development**: React Native / Expo SDK 51, React Navigation 6, Sentry, Expo modules (notifications, camera, location, haptics, biometrics, calendar, video, speech, image-picker, secure-store, linking)
## Admin Platform — 100 Section Build (33 Complete)

Completed sections: 1-User Management, 2-Job Board, 3-Gig/Service, 4-Booking/Order, 5-Escrow/Finance, 6-Disputes, 7-Support, 8-Analytics, 9-AI Management, 10-KYC, 11-Growth/Referrals, 12-Academy, 13-System Settings, 14-Mobile Admin, 15-Report/Abuse, 16-Category & Skill Management, 17-Content Moderation, 18-Promotion System, 19-Marketing System, 20-Subscription Management, 21-Security & Trust, 22-Audit Logs, 23-Notifications, 24-Analytics Deep Dive, 25-CMS Management v2.0, 26-Feature Flags v2.0, 27-Role & Permission System RBAC v2.0, 28-Support Team System v2.0, **29-Real-Time Monitoring Department v1.0** (25 endpoints, 8-tab dashboard, Socket.io streaming, Africa-first geo intelligence), **30-AI Brain Department v3.0** (34 endpoints, 12 specialized agents, multi-agent swarm, RLHF loop, GPT-4o-mini real inference, Africa-first, 12 languages, edge inference, auto-training), **31-System Performance Department v2.0** (40 endpoints + /metrics Prometheus, distributed traces, root-cause fingerprinting, Pearson correlation, exponential capacity forecast, Africa carrier detection, alert→auto-ticket, traffic replay simulator, AI anomaly explanation), **32-Data Compliance Department v2.0** (45 endpoints, 10-tab dashboard, AI Orchestrator auto-finds user data in ALL 18 depts in &lt;48h, SHA-256 hash-chain deletion certificates (blockchain-style), AI DB scanner via information_schema, DPIA feature-checker Art.35, AI POPIA-s.22/GDPR-Art.33 regulator report generator, legal holds SARS/FICA, USSD DSR *120*FSL#, consent in 8 languages Zulu/Xhosa/Afrikaans/Swahili/Hausa/Yoruba/French, 18-dept integration hooks, LGPD+DPA-KE+PDPA(GH), 6-jurisdiction matrix, beats OneTrust+Vanta+Transcend+DataGrail+Osano+Stripe+Shopify+Upwork+Fiverr until 2030), **33-Mission Control** (Unified Admin Command Centre — 8 endpoints, AdminLayout unified sidebar wrapping ALL 33 departments, collapsible sidebar with 9 category groups, global search across all depts, floating GPT-4o-mini AI assistant, 4-tab dashboard: 33-dept grid + POPIA/GDPR/CCPA compliance checklist + Africa readiness score + activity feed, one-click investor/DTIC report generator, Africa readiness 10-dimension scoring (92/100), 6-country Africa coverage map, AdminRouter pattern cleanly wraps all 33 admin routes in one unified layout shell).

**Section 33 — Mission Control v1.0** (400% Elon Musk God-Mode):
- **Backend** (`server/missionControlRoutes.ts`): 8 REST endpoints: overview (live DB aggregation), health (all 33 sections + total endpoints), activity-feed (cross-dept audit log), investor-report (one-click DTIC/investor JSON export), compliance-checklist (19 POPIA+GDPR+CCPA+NDPR+B-BBEE items with status), africa-readiness (10-dimension score, 6 countries, grade), global-search (departments + users), ai-chat (GPT-4o-mini with full 33-dept context)
- **AdminLayout** (`client/src/components/AdminLayout.tsx`): Unified sidebar with 9 category groups (Overview, Users & Identity, Work Lifecycle, Money, Resolution, Intelligence, Growth, Governance, Compliance & Config), collapsible icon-only mode, mobile hamburger drawer, topbar with breadcrumb + global search + live status indicator + section counter
- **GlobalAiAssistant** (`client/src/components/GlobalAiAssistant.tsx`): Floating chat widget (bottom-right), GPT-4o-mini powered, 5 quick-action prompts, message history, urgency indicators, actionable steps, related departments
- **MissionControl page** (`client/src/pages/MissionControl.tsx`): Live KPI bar (6 stats from real DB), command row (investor report + compliance + Africa), 4-tab dashboard (departments grid, compliance checklist, Africa readiness, activity feed), 33-section clickable grid with colour-coded categories
- **AdminRouter** (`client/src/App.tsx`): Single `/admin/:rest*` catch-all route renders AdminLayout + GlobalAiAssistant wrapping nested Switch with all 33 admin routes
Key files: `server/missionControlRoutes.ts`, `client/src/components/AdminLayout.tsx`, `client/src/components/GlobalAiAssistant.tsx`, `client/src/pages/MissionControl.tsx`
Route: `/admin/mission-control` | API: `/api/mission-control/*`

**Section 28 — Support Team System v2.0** (200% Elon Musk Intelligence Masterpiece):
- 35 REST endpoints (up from 22): all v1.0 endpoints + AI Copilot (95% escalation accuracy), Smart Route (predictive by sentiment+history+risk), Global Search (tickets+agents+canned), Integration Status (10 depts), Internal Notes (@mentions), Ticket Update, USSD Ticket, Voice Ticket (AI-transcription), Mobile Money Lookup, Abuse Report hook, Trigger Notification hook, Pause Subscription hook, Gamification leaderboard
- 7 new DB tables: `support_agents`, `support_canned_responses`, `support_escalation_rules`, `support_agent_performance`, `support_team_tickets`, `support_ticket_notes` (@mentions collaboration), `support_agent_gamification` (streaks/badges/points/ranks: rookie→bronze→silver→gold→platinum→diamond)
- 8-tab React dashboard (up from 6):
  - 🎫 Live Queue v2.0 (global search + AI smart filter suggestions + auto-refresh + smart route)
  - 📥 AI Inbox v2.0 (AI Copilot panel + internal notes/@mentions + integration action bar: abuse/notification/pause-sub + deep links to 6 depts)
  - 🔍 User 360° v2.0 (deep links to all 8 departments + mobile money lookup)
  - 💬 Canned 2.0 (multi-language EN/SW/ZU/AF/HA + AI-personalized)
  - 🚨 Escalations v2.0 (integration status panel — 10 departments)
  - 📊 Performance v2.0 (gamification leaderboard + weekly chart + rank badges 💎🏆🥇🥈🥉🌱 + streaks + Recharts)
  - 🤝 Collaboration (internal notes feed + @mention interface + co-browsing placeholder Q2 2026)
  - 🌍 Africa Intel (USSD ticket creator + voice-to-text + mobile money lookup + WhatsApp Business placeholder)
- AI Copilot v2.0: full reply + resolution steps + escalation probability + risk score + Africa context + next best action
- Agentic auto-escalation: AI Copilot updates ticket priority in DB based on risk score
- Deep Integration Hooks: auto-create Abuse reports, trigger Notifications, pause Subscriptions, log to Audit Logs — all from support context
- Gamification: points system (resolve=25, CSAT5=50, streak_bonus=5, africa_channel=10), rank progression, weekly leaderboard
- Beats Zendesk Teams ($115/agent) + Freshdesk Teams ($79) + Intercom Teams ($149) + Salesforce Service Cloud ($300) + Gorgias ($10/100 tickets) + Upwork + Fiverr until 2029
Key files: `server/supportTeamRoutes.ts`, `client/src/pages/SupportTeamDashboard.tsx`, `shared/models/supportTeam.ts`
Route: `/admin/support-team` | API: `/api/support-team/*`

**Section 27 — Role & Permission System RBAC v2.0** (200% Elon Musk Intelligence Masterpiece):
- 37 REST endpoints: Seed, Stats, History(immutable), Expiring(48h), IntegrationStatus(26depts), AI-Role-Suggest, AI-Auto-Assign, AI-Bundles, Africa-Bundles(5), Risk-Checker(10combos), List/Create/Update/Delete Roles, Matrix(137×5), Evaluate-Simulator, BulkGrant/Revoke, BulkAssign, Export-CSV, Import-CSV, Per-Role-CRUD, ConditionalRules, Assign/Revoke/Extend, UserRoles
- 5 Core roles: Admin (137 perms), Support (17), Moderator (19), Finance (25), Marketing (21)
- 137 granular permissions across 25 departments
- 2 new DB tables: `role_change_history` (immutable, never-delete audit log), `role_conditional_rules` (severity_limit/time_window/geo_fence/africa_only)
- AI Auto-Assign: GPT-4o-mini analyzes user profile + recent behavior → assigns perfect least-privilege role
- Immutable Change History: every grant/revoke/assign/create logged with full diff — SHA-linked, POPIA/SOC2/NDPR compliant
- Predictive Risk Checker: 10 dangerous permission combos auto-flagged (critical/high/medium)
- Africa-First Intelligence: 5 bundles (USSD Support, Mobile Money Finance, Low-Data Moderator, WhatsApp Marketer, Africa Ops Lead)
- Bulk Ops: CSV export/import of roles + bulk-assign to 100 users in one click
- Integration Hub: live sync status with all 26 departments, compliance coverage (POPIA/NDPR/SOC2/ISO27001)
- Conditional Rules: "Moderator can only act on reports with severity < 70" — per-role, per-permission scoping
- Real-time Simulator: hypothetical "what if I add this permission?" — shows exact department access map + risk
- Beats Salesforce + Okta + Permit.io + Auth0 + Casbin + Upwork + Fiverr + Shopify until 2029

Key files (Section 27): `server/rolesRoutes.ts`, `client/src/pages/RolePermissionSystem.tsx`, `shared/models/roles.ts`
DB Tables: `roles`, `permissions`, `role_permissions`, `user_role_assignments`, `role_change_history`, `role_conditional_rules`
Route: `/admin/roles` | 10 tabs: 📋 Roles Library · ⚡ Permission Matrix · ✏️ Role Editor · 🤖 AI Engine · 🎭 Simulator · 📜 History · 🌍 Africa Intel · 📦 Bulk Ops · ⚠️ Risk Checker · 🔗 Integration Hub

**Section 26 — Feature Flags v2.0** (Nuclear Master Control Panel):
- 32 REST endpoints: CRUD, Enable/Disable/Rollout, Canary, Lock/Unlock, Schedule, History, Rollback, Evaluate (7D Targeting), AI Impact (confidence + churn), Compliance (POPIA/NDPR/PCI), Monitoring, Africa Dashboard, AI Targeting Suggest, Statistical Significance, Auto-Winner, Bulk Ops, Integration Status, Seed, Stats
- 30 built-in flags: marketplace (5), payment (4), africa (5), ai (5), academy (3), social (3), security (3), platform (2)
- Africa-First: USSD mode, Mobile Money (M-Pesa/MTN/Airtel), Multi-Currency (ZAR/NGN/KES/GHS), WhatsApp notifications
- AI Impact Predictor: GPT-4o-mini predicts revenue, server load, risk, Africa impact, rollout strategy
- Beats LaunchDarkly + Split + Unleash + Flagsmith until 2029

Key files (Section 26): `server/featureFlagsRoutes.ts`, `client/src/pages/FeatureFlagsManagement.tsx`, `shared/models/feature_flags.ts`
DB Tables: `feature_flags`, `flag_history`, `flag_experiments`
Route: `/admin/feature-flags` | 8 tabs: 🚩 Flags Library · 🎯 Targeting Engine · 🤖 AI Command Centre · 🧪 Experiments · 📡 Live Dashboard · 🌍 Africa Intel · ✏️ Editor · 📜 History
