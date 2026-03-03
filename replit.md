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
- **API Endpoints**: `/api/ai/analyze-task`, `/api/ai/generate-proposal`, `/api/cv/parse`, `/api/job-board`, `/api/opportunities/search`, etc.

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

### UI Components
- shadcn/ui with Radix UI.
- Lucide React for icons.
- Framer Motion for animations.
- Embla Carousel.
