# FreelanceSkills - South African Freelance Marketplace

## Overview

FreelanceSkills is a full-stack freelance marketplace platform designed for the South African market. It connects local professionals and remote digital talent with clients. The platform facilitates both job postings and TaskRabbit-style service packages with booking functionality. It operates on a commission-based revenue model (10% on completed jobs) with an escrow-style payment system. The project aims to empower freelancers and businesses, with a vision to create 1 Million job opportunities by 2031.

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
- **Authentication**: Replit OpenID Connect (OIDC) with Passport.js
- **Session Storage**: PostgreSQL-backed sessions

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod
- **Key Models**: Users, Profiles, Jobs, Service Packages, Bookings, Reviews, Messages, AI Conversations.

### AI Features
- **AI Task Recommendation Engine**: Recommends categories, budget estimates, skills, and task breakdowns.
- **AI Proposal Assistant**: Helps freelancers generate and improve proposals.
- **AI Job Post Helper**: Assists clients in creating professional job posts.
- **AI Profile Optimization**: Enhances freelancer profiles for discoverability.
- **AI Content Quality Check**: Analyzes content for originality, plagiarism risk, and quality.
- **AI CV Parser** (`/cv-upload`): Upload/paste CV text, AI extracts profile data (name, skills, experience, rate) and creates a profile.
- **AI Job Board Aggregator** (`/job-board`): Aggregates SA job listings from PNet, CareerJunction, LinkedIn, Indeed SA, Careers24, etc. with auto-refresh and AI cover letter generation.
- **AI Opportunity Finder** (`/opportunity-finder`): AI agent that sources jobs, apprenticeships, bursaries, learnerships, internships, and graduate programmes matching user profile.
- **AI Cover Letter Generator**: Generates tailored cover letters for job applications.
- **API Endpoints**: Dedicated endpoints for various AI functionalities, e.g., `/api/ai/analyze-task`, `/api/ai/generate-proposal`, `/api/cv/parse`, `/api/job-board`, `/api/opportunities/search`.

### Authentication Flow
- Replit OIDC for login/logout.
- Session middleware for request validation.
- User data synchronization with the database on login.

### Build & Deployment
- **Development**: Vite dev server with HMR.
- **Production**: Vite builds to `dist/public/`, esbuild bundles server.

### Strategic Initiatives (2031 Vision)
- **Social Impact Dashboard**: Tracks jobs created and income generated.
- **AI Upskilling Academy**: Offers tiered AI courses.
- **Enterprise & Government Solutions**: Provides bulk hiring and tender integration.
- **Referral Program**: Tiered rewards for referrals.
- **AI Smart Matching & Autonomous Agents**: AI-powered freelancer matching and auto-hire features.
- **Blockchain Credentials**: Verifiable credentials with blockchain integration.
- **Multi-Currency & Crypto Payments Hub**: Support for multiple currencies and cryptocurrencies, including mobile money.
- **Voice & Natural Language Search**: Voice-activated search with multilingual support.
- **Freelancer Analytics Dashboard**: Performance metrics, earnings trends, and AI-powered insights.
- **Green Sustainability Score**: Carbon footprint calculation and green badging system.
- **Multi-Language & Accessibility Hub**: Support for 14 languages and 8 accessibility features.

## External Dependencies

### Database
- PostgreSQL (via `DATABASE_URL`).

### Authentication
- Replit OIDC provider (via `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`).

### UI Components
- shadcn/ui with Radix UI.
- Lucide React for icons.
- Framer Motion for animations.
- Embla Carousel.

### Development Tools
- Replit-specific Vite plugins.