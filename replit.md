# FreelanceSkills - Global Freelance Marketplace

## Overview

FreelanceSkills is a full-stack freelance marketplace platform focusing on connecting local professionals and remote digital talent with clients, particularly in South Africa, with global ambitions. It facilitates job postings and TaskRabbit-style service packages with booking functionality. The platform operates on a commission-based model with an escrow payment system, aiming to create 1 Million job opportunities by 2031. Key capabilities include comprehensive AI-powered matching, proposal generation, job post assistance, profile optimization, a global job board, an upskilling academy, and robust growth systems like business invites and a referral program.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS v4 with shadcn/ui (New York style)
- **Build Tool**: Vite
- **UI/UX**: Focus on mobile-first design, PWA features, accessibility (skip-to-content, ARIA labels, keyboard navigation, high-contrast mode), and an emerald theme. Features like an onboarding carousel, floating action button, and a support chat widget enhance user experience.

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API
- **Authentication**: Custom email/password authentication with bcryptjs and PostgreSQL-backed sessions. Includes a password reset flow.
- **Real-Time Communication**: Socket.io for real-time chat, notifications, and user online status.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod
- **Key Data Models**: Users, Profiles, Jobs, Service Packages, Bookings, Reviews, Messages, AI Conversations, Business Invitations, Referrals, Courses, Notifications, and various audit/security related tables.

### Core Features
- **AI Engine**: A comprehensive AI suite (v1 & v2) for task recommendation, proposal assistance, job post improvement, profile optimization, CV parsing, global job sourcing, opportunity finding, cover letter generation, and a support chatbot. Advanced AI features include multi-turn conversation memory, budget prediction, skill-gap analysis, application fraud scoring, job success prediction, and dynamic pricing.
- **Growth System**: Includes a Business Invite System for generating unique invite codes and claiming business listings, and a Referral Program with tiered rewards and robust tracking.
- **Upskilling Academy**: Offers online courses with lesson navigation, progress tracking, and certificate generation.
- **Payment & Escrow**: Integrated PayFast (South Africa's leading payment gateway) for all payments. Supports Credit/Debit Card, EFT, SnapScan, Mobicred, Samsung Pay, and Apple Pay. ITN webhook for escrow system that holds and releases funds. PayFast sandbox mode for development.
- **Security & Fraud Prevention**: Features rate limiting, CORS, Helmet-equivalent headers, mass assignment prevention, session-based auth, cron-job based fraud detection, audit logging, and dispute resolution.
- **Notification System**: Real-time notifications via Socket.io and a persistent database.
- **Mobile App (React Native/Expo)**: Full-featured mobile application in `mobile/` directory with:
  - **Navigation**: 5-tab bottom navigator (Home/Jobs/Messages/Academy/Profile) + stack screens for JobDetail, JobApply, Chat, Premium, Camera, CourseViewer
  - **Push Notifications**: Expo Notifications with handler for matches/messages, deep link navigation from push
  - **Biometric Auth**: FaceID/TouchID/Fingerprint login via expo-local-authentication
  - **Deep Linking**: `freelanceskills://` scheme + `https://freelanceskills.net` universal links for jobs, courses, chat
  - **Offline Cache**: AsyncStorage-based job caching with sync-when-online via useOfflineCache hook
  - **Camera**: ID verification + portfolio photos via expo-camera with front/back toggle
  - **Chat**: Full-screen real-time chat with Socket.io + image send via expo-image-picker
  - **Job Apply**: Resume upload + voice-to-text cover letter input
  - **Premium**: Subscription screen with Stripe payment sheet integration
  - **Academy**: Course browser + video player with progress tracking via expo-video
  - **Dark Mode**: Native sync via useColorScheme, automatic userInterfaceStyle
  - **Haptic Feedback**: On apply, message sent, payout received via expo-haptics
  - **Crashlytics**: Sentry integration for error tracking
  - **Analytics**: Screen views, job applications, premium purchases event tracking
  - **Rate Limiting UI**: Toast feedback when hitting free tier caps
  - **Voice Input**: Speech-to-text stub for job descriptions
  - **Location**: Nearby job alerts via expo-location
  - **Calendar**: Integration stub for job dates via expo-calendar
  - **PWA Bridge**: Fallback for PWA-to-native transition
  - **EAS Build**: eas.json with dev/preview/production profiles
  - **Store Docs**: App store listing copy, TestFlight guide, Google Play guide, submission checklist in `mobile/docs/`

### 2031 Vision Module (D1-D25)
- **Schema**: `shared/models/vision.ts` — 10 tables (blockchain_credentials, nft_badges, green_impact_scores, community_forum_posts/replies, dao_proposals/votes, ai_contracts, wellness_logs, mentor_matches)
- **API Routes**: `server/vision.ts` — `registerVisionRoutes(app, isAuthenticated)` wired in `server/routes.ts`
- **D1**: Blockchain Credential Verification — POST /api/vision/blockchain/verify, GET /api/vision/blockchain/credentials/:userId
- **D2**: NFT Badge/Certification — POST /api/vision/nft/mint-badge, GET /api/vision/nft/badges/:userId
- **D3**: Green Impact Scoring — POST /api/vision/green/calculate, GET /api/vision/green/score/:userId
- **D4**: Carbon Offset Partnership — POST /api/vision/green/offset, GET /api/vision/green/offsets
- **D5**: AI Video Interview Screening — POST /api/vision/ai/video-interview
- **D6**: Voice AI Job Post — POST /api/vision/ai/voice-job-post (NLP keyword detection for 8 categories)
- **D7**: AR Portfolio Preview — POST /api/vision/ar/portfolio-preview
- **D8**: Predictive Earnings Forecast — POST /api/vision/ai/earnings-forecast
- **D9**: Community Forum — GET /api/vision/forum/categories, GET/POST /api/vision/forum/posts, POST /api/vision/forum/posts/:id/reply
- **D10**: DAO Governance — GET/POST /api/vision/dao/proposals, POST /api/vision/dao/vote
- **D11**: Crypto Payout — GET /api/vision/crypto/rates, POST /api/vision/crypto/payout
- **D12**: AI Contract Generator — POST /api/vision/ai/contract
- **D13**: Reputation Score v2 — GET /api/vision/reputation/:userId
- **D14**: Talent Marketplace Heatmap — GET /api/vision/analytics/heatmap
- **D15**: Global Multi-Language — GET /api/vision/global/languages, GET /api/vision/global/currencies
- **D16**: Metaverse Job Fair — GET /api/vision/metaverse/job-fair, POST /api/vision/metaverse/register-booth
- **D17**: AI Dispute Mediator — POST /api/vision/ai/dispute-mediator
- **D18**: Wellness Tracker — POST /api/vision/wellness/log, GET /api/vision/wellness/stats
- **D19**: Impact NFT Collection — GET /api/vision/nft/impact-collection, POST /api/vision/nft/mint-impact
- **D20**: Zero-Knowledge Proofs — POST /api/vision/zkp/prove-earnings, POST /api/vision/zkp/verify
- **D21**: Quantum-Safe Encryption — GET /api/vision/security/quantum-status, POST /api/vision/security/quantum-encrypt
- **D22**: AI Mentor Matching — POST /api/vision/ai/mentor-match, GET /api/vision/ai/mentor-pairs
- **D23**: Sustainable Categories — GET /api/vision/sustainable/categories, GET /api/vision/sustainable/jobs
- **D24**: 2031 Roadmap — GET /api/vision/roadmap + frontend page at `/roadmap` (client/src/pages/roadmap-2031.tsx)
- **D25**: Demo Links — GET /api/vision/demo-links (all 25 features indexed)
- **Test Results**: 84/84 tests passing (100%)

### Edge Case Handlers (E1-E5) — `server/edge-cases.ts`
- **E1**: Input sanitization middleware (XSS, SQL injection, event handlers, protocol injection)
- **E2**: Account deletion mid-escrow protection (funds held, 30-day grace)
- **E3**: 10k concurrent application queue with position tracking
- **E4**: Premium expiry mid-job visibility downgrade (7-day grace)
- **E5**: Dispute escalation with conflicting evidence (admin review, 5-day SLA)

### Victory Lap Features (E6-E25) — `server/victory-lap.ts` + `content/`
- **E6-E10**: Press release, founder social scripts, teaser video script, investor one-pager, VC objection handler (in `content/`)
- **E11**: Beta feedback form with auto-email + NPS scoring (POST /api/feedback/beta)
- **E12**: Churn survey with win-back sequence (POST /api/feedback/churn-survey)
- **E13**: Viral challenge #MyFirstFreelanceJob (POST /api/challenge/first-job, GET /api/challenge/leaderboard)
- **E14**: Partner outreach templates — influencer, association, enterprise (in `content/`)
- **E15**: SEO audit with 10-point scoring (GET /api/seo/audit) + twitter:site fixed to @FreelanceSkills
- **E16**: Uptime monitor with service health (GET /api/monitor/uptime)
- **E17**: Security pentest report (OWASP Top 10, B+ rating, in `content/`)
- **E18**: Backup verification (GET /api/backup/verify, admin only)
- **E19**: Performance audit with API benchmarking (GET /api/performance/audit)
- **E20**: Mobile battery/performance check (GET /api/mobile/performance, Grade A)
- **E21**: Full regression E2E test suite (58/58 passing)
- **E22**: Git repo ready for GitHub export
- **E23**: Changelog with all versions (content/E23-changelog.md)
- **E24**: Final README architecture overview
- **E25**: Victory deploy ready

### Infrastructure & Monitoring
- **Health & Metrics**: Endpoints for API health checks, platform metrics, and Prometheus monitoring.
- **Logging**: Structured, JSON-formatted logging.
- **Cron Scheduler**: Automates tasks like purging expired data, fraud detection, and backups.

## External Dependencies

- **Database**: PostgreSQL
- **Authentication**: bcryptjs, express-session, connect-pg-simple
- **AI**: OpenAI API (gpt-4o-mini)
- **Payments**: Stripe API (`@stripe/stripe-js`)
- **UI Components**: shadcn/ui (Radix UI), Lucide React (icons), Framer Motion (animations), Embla Carousel
- **Mobile**: React Native / Expo SDK 51, React Navigation 6, Sentry, Expo modules (notifications, camera, location, haptics, biometrics, calendar, video, speech, image-picker, secure-store, linking)

## Key Files
- `server/routes.ts` — Main API routes (2980+ lines)
- `server/growth.ts` — Growth module (B1-B25)
- `server/vision.ts` — Vision module (D1-D25)
- `server/edge-cases.ts` — Edge case handlers (E1-E5)
- `server/victory-lap.ts` — Victory lap features (E6-E25)
- `server/fortify.ts` — Security, caching, monitoring
- `shared/schema.ts` — Drizzle ORM schema (exports all models)
- `shared/models/vision.ts` — Vision DB tables
- `client/src/App.tsx` — React app with lazy-loaded routes
- `client/src/pages/roadmap-2031.tsx` — 2031 vision roadmap page
- `mobile/` — React Native/Expo mobile app
- `content/` — Marketing materials (press release, scripts, templates)

## Test Results
- Growth module (B1-B25): 62/62 passing
- Vision module (D1-D25): 84/84 passing
- Victory lap (E1-E25): 58/58 passing
- **Total: 204/204 tests passing (100%)**