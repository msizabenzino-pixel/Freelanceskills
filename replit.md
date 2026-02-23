# FreelanceSkills - South African Freelance Marketplace

## Overview

FreelanceSkills is a full-stack freelance marketplace platform targeting the South African market. It connects local professionals (plumbers, electricians, safety officers) and remote digital talent (developers, designers) with clients seeking their services. The platform supports both job postings and TaskRabbit-style service packages with booking functionality.

The revenue model is commission-based (10% on completed jobs) with no upfront subscription fees. The platform handles the complete job lifecycle: open → hired → in_progress → delivered → completed, with escrow-style payment release only after completion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **Build Tool**: Vite with custom plugins for Replit integration
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Authentication**: Replit OpenID Connect (OIDC) with Passport.js
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` exports all models from `shared/models/`
- **Migrations**: Drizzle Kit with `db:push` command

### Key Data Models
- **Users/Sessions**: Authentication and identity (required for Replit Auth)
- **Profiles**: Extended user data with freelancer details, skills, hourly rates
- **Jobs**: Client-posted work with lifecycle status tracking
- **Service Packages**: TaskRabbit-style pre-defined services freelancers offer
- **Bookings**: Scheduled work tied to packages or jobs
- **Reviews**: Feedback system tied to completed bookings
- **Messages/Conversations**: Direct messaging between users
- **AI Conversations/Messages**: Separate tables for AI chat functionality (aiConversations, aiMessages)

### AI Features
- **AI Task Recommendation Engine**: Located at `/task-assistant`, helps clients describe their needs and get AI-powered recommendations for:
  - Relevant service categories (from 16 predefined categories in `shared/categories.ts`, including AI Services)
  - Budget estimates in ZAR based on South African market rates
  - Required skills for the task
  - Task breakdown into steps
  - Pro tips for hiring

- **AI Proposal Assistant**: Helps freelancers write compelling proposals with:
  - Full proposal generation based on job details and freelancer skills
  - Cover letter generation
  - Key points highlighting
  - Improvement suggestions

- **AI Job Post Helper**: Assists clients in creating professional job posts with:
  - Title and description generation
  - Category and budget suggestions
  - Screening questions
  - Post improvement recommendations

- **AI Profile Optimization**: Enhances freelancer profiles with:
  - Bio optimization for SEO
  - Title suggestions
  - Skill recommendations
  - Keyword suggestions for discoverability

- **AI Content Quality Check**: Analyzes content for:
  - Originality detection (AI-generated probability)
  - Plagiarism risk assessment
  - Quality metrics (clarity, professionalism, relevance, grammar)
  - Improvement suggestions

- **API Endpoints**: 
  - `POST /api/ai/analyze-task` - Analyzes task descriptions
  - `POST /api/ai/match-packages` - Matches tasks to service packages
  - `POST /api/ai/generate-proposal` - Generates proposal for freelancers
  - `POST /api/ai/improve-proposal` - Improves existing proposals
  - `POST /api/ai/generate-job-post` - Generates job posts for clients
  - `POST /api/ai/improve-job-post` - Improves existing job posts
  - `POST /api/ai/check-quality` - Checks content quality
  - `POST /api/ai/optimize-profile` - Optimizes freelancer profiles

- **Implementation**: `server/replit_integrations/recommendations/`

### Authentication Flow
- Replit OIDC handles login/logout at `/api/login` and `/api/logout`
- Session middleware validates requests via `isAuthenticated` guard
- User data automatically synced to database on login via `upsertUser`

### Build & Deployment
- **Development**: Vite dev server with HMR, Express API on same port
- **Production**: Vite builds to `dist/public/`, esbuild bundles server to `dist/index.cjs`
- Server serves static files and falls back to `index.html` for SPA routing

## External Dependencies

### Database
- PostgreSQL via `DATABASE_URL` environment variable
- Session table `sessions` must exist (created by Drizzle schema)

### Authentication
- Replit OIDC provider at `ISSUER_URL` (defaults to `https://replit.com/oidc`)
- Requires `REPL_ID` and `SESSION_SECRET` environment variables

### UI Components
- shadcn/ui with Radix UI primitives
- Lucide React for icons
- Framer Motion for animations
- Embla Carousel for carousels

### Development Tools
- Replit-specific Vite plugins for dev banner, cartographer, and runtime error overlay
- Custom meta images plugin for OpenGraph tags

## Recent Changes (February 2026)

### UX & Accessibility Improvements
- Removed intrusive country selector popup on first visit; defaults to South Africa; selector available in navbar and mobile menu
- Added skip-to-content link for keyboard users
- Added ARIA landmarks (nav, main, footer) across all pages
- Added proper labels and alt text for search inputs and images
- Added `id="main-content"` to all page routes

### Dark Mode
- Implemented dark mode with system preference detection and localStorage persistence
- Dark mode toggle (sun/moon icon) in desktop navbar and mobile menu
- All 15+ pages converted from hardcoded slate-* colors to theme-aware variables (text-muted-foreground, bg-card, bg-muted, etc.)
- CSS variables for dark theme already defined in index.css

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(self), microphone=(self), geolocation=(self)
- HSTS enabled in production

### SEO Optimization
- Added structured meta tags: title, description, keywords, author, canonical URL
- Open Graph locale set to en_ZA, site_name added
- Local search keywords for South African market

### PWA Support
- manifest.json with app icons (72x72 to 512x512)
- Service worker for offline caching
- Apple touch icon and mobile web app meta tags

### Elon-Inspired Strategic Pages (Feb 2026)
- **Social Impact Dashboard** (`/impact`): Public metrics (jobs created, income generated, communities reached), freelancer success stories, mission progress tracker ("1 Million Africans by 2031")
- **AI Upskilling Academy** (`/academy`): 3-tier course structure (Free AI Basics, Personalized Micro-Courses, Intensive Bootcamps), 6 course categories, earn-while-learn model, AI tutor teaser, blockchain certification concept, partner showcase
- **Enterprise & Government Solutions** (`/enterprise`): Bulk hiring dashboard, tender integration, verified talent pool, youth employment programs, trusted partner showcase
- **Referral Program** (`/referral`): 4-tier rewards (Bronze/Silver/Gold/Platinum), leaderboard, share mechanics (WhatsApp, Facebook, X, Email), FAQ
- **JSON-LD Structured Data**: Organization and WebSite schema markup in index.html for AI search engine visibility (ChatGPT, Gemini, Grok discovery)
- **Homepage Updates**: Impact metrics banner, "More Than a Marketplace" section with Academy/Enterprise/Referral CTAs
- **Footer Updates**: New "Company" column with links to all strategic pages

### Freelancer Features (Feb 2026)
- **Freelancer Onboarding** (`/onboarding`): 4-step profile creation flow (Basic Info, Skills & Expertise, Portfolio & Verification, Review & Submit) with progress indicator, category selection from SERVICE_CATEGORIES, skill badge input, hourly rate, availability settings
- **Service Package Creation**: Dashboard "My Services" tab allows freelancers to create service packages via POST `/api/packages` API - persisted to database with title, description, category, price, duration, features
- **Dashboard Navigation**: Sidebar nav now includes Overview, My Services, Messages, Payments, Settings sections with active state management

### Enterprise Contact Form (Feb 2026)
- Enterprise page "Contact Sales" buttons scroll to inline contact form
- Form fields: Company Name, Contact Person, Email, Phone, Company Size (dropdown), Message
- Client-side + server-side validation (Zod schema) on required fields
- Form persists to `enterprise_leads` table via POST `/api/enterprise/contact`
- Loading state during submission, error display, success confirmation message

### AI & Error Handling Improvements (Feb 2026)
- AI Task Assistant: Better error messages for API key issues, retry button with dismissible error card
- Server-side: Detects API key errors vs general failures and returns appropriate user-facing messages

### UX Audit Fixes (Feb 2026)
- **Functional Search**: Hero search navigates to /services?q=, Jobs page search filters results, Services page reads URL params
- **Working Filters & Sort**: Jobs page Job Type filter, Budget Range filter, Sort dropdown (Newest/Oldest/Budget High-Low/Low-High), Load More pagination
- **Fixed Navigation CTAs**: "Hire Talent Now" → /services, "Become a Tasker" → /onboarding, all dead # links replaced with proper routes
- **Client Names**: Jobs API returns clientName from profile data instead of raw IDs
- **Security Hardening**: CSP header (env-aware for dev WS), rate limiting (100 req/min/IP with TTL cleanup), HSTS with preload, right-click/source protection, text selection disabled on non-input elements
- **Meta Tags**: twitter:site updated to @FreelanceSkills, copyright meta, robots meta
- **Footer Consistency**: All public pages include Footer component