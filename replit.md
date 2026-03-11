# FreelanceSkills - Global Freelance Marketplace

## Overview

FreelanceSkills is a full-stack freelance marketplace platform with a strong South African focus and global reach. It connects local professionals and remote digital talent with clients. The platform facilitates both job postings and TaskRabbit-style service packages with booking functionality. It operates on a commission-based revenue model (10% on completed jobs) with an escrow-style payment system. The project aims to empower freelancers and businesses, with a vision to create 1 Million job opportunities by 2031.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS v4 with shadcn/ui (New York style)
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API
- **Authentication**: Custom email/password auth with bcryptjs password hashing
- **Session Storage**: PostgreSQL-backed sessions (connect-pg-simple)

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod
- **Key Models**: Users (with password field), Profiles, Jobs, Aggregated Jobs, Service Packages, Bookings, Reviews, Messages, AI Conversations, Business Invitations, Referrals, Courses, Lessons, Course Progress, Certificates, Notifications, Password Reset Tokens.

### Growth System
- **Business Invite System**: `/invite-businesses` page for adding businesses and generating unique invite codes
- **Claim Business Flow**: `/claim-business?code=XXX` page for businesses to claim their listing
- **Database**: `business_invitations` table with invite codes, status (pending/claimed), province/city/category
- **API Routes**: POST/GET `/api/business-invitations`, POST `/api/business-invitations/bulk`, GET `/api/business-invitations/stats`, POST `/api/business-invitations/:code/claim`
- **Share channels**: WhatsApp (pre-filled message), Email (mailto), Copy link
- **Referral Program**: `/referral` page with tiered rewards (Bronze/Silver/Gold/Platinum), DB-backed tracking with `referrals` table, real referral codes, stats API, claim-on-signup flow

### AI Features (v1)
- **AI Task Recommendation Engine**: Recommends categories, budget estimates, skills, and task breakdowns.
- **AI Proposal Assistant**: Helps freelancers generate and improve proposals.
- **AI Job Post Helper**: Assists clients in creating professional job posts.
- **AI Profile Optimization**: Enhances freelancer profiles for discoverability.
- **AI CV Parser** (`/cv-upload`): Upload/paste CV text, AI extracts profile data (name, skills, experience, rate) and creates a profile.
- **Global Job Board** (`/job-board`): AI-powered global job intelligence agent sources 15-20 worldwide + SA jobs per refresh, auto-seeds on first load if DB is empty.
- **AI Opportunity Finder** (`/opportunity-finder`): AI agent that sources jobs, apprenticeships, bursaries, learnerships, internships, and graduate programmes matching user profile.
- **AI Cover Letter Generator**: Generates tailored cover letters for job applications.
- **AI Support Chat Bot** (`SupportChat.tsx`): Floating chat widget (bottom-right) powered by OpenAI gpt-4o-mini. Answers platform questions intelligently. Hands off to WhatsApp (wa.me/27601234567) after 3 messages or on request.
- **AI Task Chat** (`/api/ai/task-chat`): Multi-turn conversational task analysis with context memory, budget refinement, and skill-gap identification.
- **AI Fraud Detection** (`/api/ai/fraud-check`): Rule-based risk scoring for applications (new account age, application velocity, spam patterns). Returns riskScore, flags, recommendation.

### AI Engine v2 (`server/ai-engine.ts`) — 20 New Features (#21-#40)
- **#21 Multi-turn Conversation Memory** (`/api/ai/task-chat-v2`): Stores last 10 messages per session (30-min TTL), full context passed to OpenAI
- **#22 Budget Prediction** (`/api/ai/predict-budget`): Parses "R500-800" client statements, compares to SA market rates, suggests realistic ranges
- **#23 Skill-Gap Analysis** (`/api/ai/skill-gap`): Compares job vs freelancer skills with synonym matching (React=ReactJS, etc.), returns matched/missing/partial
- **#24 Application Fraud Scoring** (`/api/ai/application-risk`): Detects mass-apply (>20/hr), duplicate applications, incomplete profiles
- **#25 Job Success Prediction** (`/api/ai/predict-success`): Multi-factor scoring (skill match, completion rate, rating trend, experience)
- **#26 Job Post Improvements** (`/api/ai/improve-listing`): Auto-suggests adding deadline (+40% applies), budget (+60%), skills (+35%), etc.
- **#27 Location-Aware Matching** (`/api/ai/location-boost`): Haversine distance between SA cities, 25pts for <10km, 15pts for <50km
- **#28 Urgency Escalation** (`/api/ai/urgency-check`): Jobs >48h with <3 applies get visibility boost suggestions (R49-R99)
- **#29 Negative Feedback Loop** (`/api/ai/reputation/:id`): Low-rated freelancers (-30 score), excellent ones (+10 boost)
- **#30 Referral Trust Multiplier** (`/api/ai/referral-trust/:id`): Referred freelancers get +10-20% based on referrer tier
- **#31 Course Completion Boost** (`/api/ai/course-boost/:id`): Academy grads get +5-20% visibility boost, higher for relevant courses
- **#32 Availability Check** (`/api/ai/availability/:id`): Calendar stub — set/get freelancer availability, timezone, busy slots
- **#33 Multi-Skill Weighting** (`/api/ai/skill-weight-match`): React 70% + Node 30% → weighted scoring per skill priority
- **#34 Client Satisfaction Prediction** (`/api/ai/predict-satisfaction`): Based on past hires of same freelancer by same client
- **#35 Auto-Reply Templates** (`/api/ai/auto-reply-templates`): 5 pre-written templates (Quick Start, Professional, Budget Flex, Portfolio, Same Day)
- **#36 Voice-to-Text Stub** (`/api/ai/voice-to-text`): Mobile mic → text job post stub (EN, AF, ZU, XH)
- **#37 Image Recognition Stub** (`/api/ai/image-recognition`): Upload photo → detect job type (pool, garden, kitchen, office)
- **#38 Sentiment Analysis** (`/api/ai/review-sentiment`): Toxic pattern detection in reviews (scam, threats, discrimination flags)
- **#39 Dynamic Pricing** (`/api/ai/dynamic-pricing`): Suggests rates based on supply/demand in freelancer's category
- **#40 2031 Vision Stubs**: Blockchain credential mock (`/api/ai/blockchain-credential`), Green Impact badge (`/api/ai/green-impact/:id`)
- **Enhanced Matching Engine** (`/api/ai/enhanced-match`, `/api/ai/enhanced-match-all`): Combines location boost (#27), reputation (#29), referral trust (#30), course boost (#31), skill weighting (#33) into a single composite score

### AI API Endpoints (complete list)
- v1: `/api/ai/analyze-task`, `/api/ai/task-chat`, `/api/ai/fraud-check`, `/api/ai/generate-proposal`, `/api/ai/support-chat`, `/api/cv/parse`, `/api/job-board`, `/api/opportunities/search`
- v2: `/api/ai/task-chat-v2`, `/api/ai/predict-budget`, `/api/ai/skill-gap`, `/api/ai/application-risk`, `/api/ai/predict-success`, `/api/ai/improve-listing`, `/api/ai/location-boost`, `/api/ai/urgency-check`, `/api/ai/reputation/:id`, `/api/ai/referral-trust/:id`, `/api/ai/course-boost/:id`, `/api/ai/availability/:id`, `/api/ai/skill-weight-match`, `/api/ai/predict-satisfaction`, `/api/ai/auto-reply-templates`, `/api/ai/voice-to-text`, `/api/ai/image-recognition`, `/api/ai/review-sentiment`, `/api/ai/dynamic-pricing`, `/api/ai/blockchain-credential`, `/api/ai/green-impact/:id`, `/api/ai/enhanced-match`, `/api/ai/enhanced-match-all`
- Rate limit: 60 AI requests/hr per IP

### Authentication Flow
- Custom email/password auth (POST `/api/auth/register`, POST `/api/auth/login`, POST `/api/auth/logout`, GET `/api/auth/user`)
- bcryptjs for password hashing (12 rounds)
- PostgreSQL-backed session store
- Frontend auth page at `/auth` with login/signup toggle
- No Replit OIDC — completely custom auth with zero third-party branding
- **Password Reset Flow**: POST `/api/auth/forgot-password` (generates token), POST `/api/auth/reset-password` (validates token, updates password)
- `password_reset_tokens` table with expiry (1 hour)
- Reset page at `/reset-password/:token`

### Privacy & Compliance
- **Cookie Consent Banner**: POPIA/GDPR compliant, `CookieConsent.tsx` component, persists choice in localStorage
- Privacy policy at `/privacy`, Terms at `/terms`
- **POPIA Data Export**: `GET /api/account/export` — downloads all user data as JSON
- **POPIA Account Deletion**: `DELETE /api/account/delete` — soft-deletes account, anonymizes PII

### Notification System
- **NotificationBell** component in Navbar (authenticated users only)
- `notifications` DB table with type (job_match/message/payment/system), read status, link
- API: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`, `GET /api/notifications/unread-count`
- Polls every 30 seconds for new notifications

### Upskilling Academy
- DB tables: `courses`, `lessons`, `course_progress`, `certificates`
- 3 seeded starter courses with real lesson content (auto-seeded on server start)
- Course player with lesson navigation, content viewer, progress tracking
- Certificate generation on course completion with unique codes
- API: `GET /api/courses`, `GET /api/courses/:id`, `POST /api/courses/:courseId/lessons/:lessonId/complete`, `GET /api/courses/:courseId/certificate`, `GET /api/certificates/my`

### Infrastructure & Monitoring
- **Health endpoint**: `GET /api/health` — returns DB status, dependency checks, uptime, version
- **Metrics endpoint**: `GET /api/metrics` — platform stats, memory usage, request counts
- **Structured logging**: JSON-formatted logs with timestamp, level, source, method, path, statusCode, duration
- **Request tracking**: In-memory counter middleware tracking total requests and per-endpoint prefix counts

### Enterprise Features
- **Enterprise Dashboard** (`/enterprise-dashboard`): Bulk job posting, spending overview, active jobs table, team management stub
- **Enterprise Lead Form** (`/enterprise`): Contact form for sales enquiries

### Investor Resources
- `/INVESTOR_PITCH_DECK.md` — Full markdown pitch deck (Problem → Solution → Traction → Ask)
- `/DEMO_SCRIPT.md` — 60-second demo walkthrough with timestamps
- `/CNAME_SETUP.md` — Custom domain setup instructions

### Real-Time Chat (Socket.io)
- **Server**: `server/socket.ts` — Socket.io attached to Express HTTP server
- Events: `join_conversation`, `send_message`, `typing`, `stop_typing`, `mark_read`
- Tracks online users (Map<userId, socketId>), emits `user_online`/`user_offline`
- Messages saved to DB + broadcast to conversation room in real-time
- Safety checks run on socket messages before persistence

### Mobile App Skeleton
- **Directory**: `mobile/` — React Native / Expo project skeleton
- Screens: Home, Jobs, Messages, Profile, Login with bottom tab navigation
- API client pointing to https://freelanceskills.net/api
- Socket.io client for real-time chat
- Auth hook using expo-secure-store
- Dark theme matching web app
- Setup: `cd mobile && npm install && expo start`

### Security & Fraud Prevention
- Rate limiting: custom middleware in `server/index.ts` (100 req/min general, 10 req/hr AI, 5 req/hr expensive ops)
- Profile PATCH strips `userId`, `id`, `isPro` fields to prevent mass assignment
- Session-based auth: all protected routes use `(req.session as any).userId`
- SESSION_SECRET env var for session signing (no hardcoded fallback in production)
- **Fraud detection**: `/api/ai/fraud-check` with hardened rules:
  - Velocity checks (>5 booking attempts/hour)
  - Amount anomaly (>3x user average)
  - Geographic mismatch detection
  - Duplicate booking detection
  - Scam keyword pattern matching
- **Auto-fraud gating**: Bookings auto-checked on creation (reject >70, flag 40-70, approve <40)
- **Escrow release safety**: `POST /api/bookings/:id/release` checks fraud flags before releasing funds
- **High-value alerts**: Stripe webhook flags payments >R100,000
- **Admin fraud dashboard**: `/admin/fraud` for reviewing and resolving flagged transactions
- `fraud_flags` DB table with resolution tracking

### Build & Deployment
- **Development**: Vite dev server with HMR.
- **Production**: Vite builds to `dist/public/`, esbuild bundles server to `dist/index.cjs`.
- **Build command**: `npx tsx script/build.ts`
- **Run command**: `NODE_ENV=production node dist/index.cjs`

## External Dependencies

### Database
- PostgreSQL (via `DATABASE_URL`).

### Authentication
- bcryptjs for password hashing
- express-session + connect-pg-simple for sessions
- SESSION_SECRET env var for session signing

### AI
- OpenAI API via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`
- Model: gpt-4o-mini

### Payments
- **Stripe** is the ONLY payment system (card payments only)
- Server: `server/stripe.ts` with Payment Intents API + webhook handler
- Client: `@stripe/stripe-js` for Stripe Elements card input
- Routes: `GET /api/stripe/config`, `POST /api/stripe/create-payment-intent`, `GET /api/stripe/payment/:id`, `POST /api/stripe/webhook`
- Webhook handles: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`
- Environment: `STRIPE_SECRET_KEY` (server) + `STRIPE_PUBLISHABLE_KEY` (exposed to client) + `STRIPE_WEBHOOK_SECRET` (webhook signature verification)
- CSP updated to allow `js.stripe.com` and `hooks.stripe.com`
- Raw body preserved via `req.rawBody` for webhook signature verification
- No PayPal, Ozow, PayFast, or other payment methods

### UI Components
- shadcn/ui with Radix UI.
- Lucide React for icons.
- Framer Motion for animations.
- Embla Carousel.

### Mobile & PWA
- **PWA Manifest**: `client/public/manifest.json` with standalone display, emerald theme, app icons
- **Offline Screen**: `OfflineScreen.tsx` with retry button, shown when `navigator.onLine` is false
- **Onboarding Carousel**: `OnboardingCarousel.tsx` — 4-slide first-visit overlay (Welcome, Verify, Post/Profile, Escrow), skip/next, stored in localStorage
- **Floating Action Button**: `FloatingActionButton.tsx` — emerald FAB at bottom-right, appears on scroll, expands to Post a Job / Find Work
- **Support Chat**: `SupportChat.tsx` — positioned above FAB (bottom-24), AI-powered support widget
- **Cookie Consent**: Mobile-optimized with 44px min-height buttons
- **Footer**: Touch-optimized links with py-2 block styling for adequate tap targets
- **Viewport**: `viewport-fit=cover` for notched devices, theme-color meta tag

### Dashboard
- **Client View**: Active jobs, escrow status cards, freelancer ratings, quick stats (Total Spent, Active Projects, Avg Rating)
- **Freelancer View**: Earnings overview (Total/Pending/Monthly), referral stats, active gigs, 6-month earnings chart
- **Role Toggle**: Client/Freelancer tabs on dashboard

### Portfolio
- **PortfolioUploader.tsx**: Drag-and-drop file upload with react-dropzone
- **Validation**: Max 10 files, 5MB each, image/* and .pdf only
- **Gallery**: Grid preview with lightbox, remove per item, progress bars

### Key Pages & Navigation
- **Navbar**: 5 main items — Find Work (dropdown: Job Board, Browse Jobs, AI Finder, Upload CV), Services, Explore, AI Assistant, Pricing
- **Home** (`/`): Hero, categories grid linking to Explore, featured freelancers, trending projects
- **Explore** (`/explore`): Category filtering with icon grid, filter chips (rate/urgency/location), infinite scroll with IntersectionObserver
- **Pricing** (`/pricing`): Free (R0, 10% commission) / Premium Talent (R79/mo, 5% commission, visually prominent) / Enterprise (custom)
- **Services** (`/services`): TaskRabbit-style service packages with booking
- **Auth** (`/auth`): Custom login/signup with email+password, no third-party branding
- **Jobs** (`/jobs`): Mobile-first job cards with swipe gestures (right=apply, left=save)

### Accessibility
- Skip-to-content link, ARIA labels on all interactive elements
- Keyboard navigation for dropdowns (arrow keys, Escape)
- High-contrast mode toggle (localStorage persisted)
- Focus ring styles, aria-live regions for dynamic content
- Lazy-loaded images, React.memo on list components, React.lazy for heavy pages
