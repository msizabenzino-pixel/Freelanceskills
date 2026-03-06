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
- **Key Models**: Users (with password field), Profiles, Jobs, Aggregated Jobs, Service Packages, Bookings, Reviews, Messages, AI Conversations.

### AI Features
- **AI Task Recommendation Engine**: Recommends categories, budget estimates, skills, and task breakdowns.
- **AI Proposal Assistant**: Helps freelancers generate and improve proposals.
- **AI Job Post Helper**: Assists clients in creating professional job posts.
- **AI Profile Optimization**: Enhances freelancer profiles for discoverability.
- **AI CV Parser** (`/cv-upload`): Upload/paste CV text, AI extracts profile data (name, skills, experience, rate) and creates a profile.
- **Global Job Board** (`/job-board`): AI-powered global job intelligence agent sources 15-20 worldwide + SA jobs per refresh, auto-seeds on first load if DB is empty.
- **AI Opportunity Finder** (`/opportunity-finder`): AI agent that sources jobs, apprenticeships, bursaries, learnerships, internships, and graduate programmes matching user profile.
- **AI Cover Letter Generator**: Generates tailored cover letters for job applications.
- **AI Support Chat Bot** (`SupportChat.tsx`): Floating chat widget (bottom-right) powered by OpenAI gpt-4o-mini. Answers platform questions intelligently. Hands off to WhatsApp (wa.me/27601234567) after 3 messages or on request.
- **API Endpoints**: `/api/ai/analyze-task`, `/api/ai/generate-proposal`, `/api/ai/support-chat`, `/api/cv/parse`, `/api/job-board`, `/api/opportunities/search`, etc.

### Authentication Flow
- Custom email/password auth (POST `/api/auth/register`, POST `/api/auth/login`, POST `/api/auth/logout`, GET `/api/auth/user`)
- bcryptjs for password hashing (12 rounds)
- PostgreSQL-backed session store
- Frontend auth page at `/auth` with login/signup toggle
- No Replit OIDC — completely custom auth with zero third-party branding

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
- Server: `server/stripe.ts` with Payment Intents API
- Client: `@stripe/stripe-js` for Stripe Elements card input
- Routes: `GET /api/stripe/config`, `POST /api/stripe/create-payment-intent`, `GET /api/stripe/payment/:id`
- Environment: `STRIPE_SECRET_KEY` (server) + `STRIPE_PUBLISHABLE_KEY` (exposed to client)
- CSP updated to allow `js.stripe.com` and `hooks.stripe.com`
- No PayPal, Ozow, PayFast, or other payment methods

### UI Components
- shadcn/ui with Radix UI.
- Lucide React for icons.
- Framer Motion for animations.
- Embla Carousel.

### Key Pages & Navigation
- **Navbar**: 5 main items — Find Work (dropdown: Job Board, Browse Jobs, AI Finder, Upload CV), Services, Explore, AI Assistant, Pricing
- **Home** (`/`): Hero, categories grid linking to Explore, featured freelancers, trending projects
- **Explore** (`/explore`): Category filtering with icon grid, filters freelancers/projects, "View Services" links to /services?category=X
- **Pricing** (`/pricing`): Free (R0, 10% commission) / Premium Talent (R79/mo, 5% commission, visually prominent) / Enterprise (custom)
- **Services** (`/services`): TaskRabbit-style service packages with booking
- **Auth** (`/auth`): Custom login/signup with email+password, no third-party branding
