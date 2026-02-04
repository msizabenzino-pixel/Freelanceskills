# FreelanceSkill - South African Freelance Marketplace

## Overview

FreelanceSkill is a full-stack freelance marketplace platform targeting the South African market. It connects local professionals (plumbers, electricians, safety officers) and remote digital talent (developers, designers) with clients seeking their services. The platform supports both job postings and TaskRabbit-style service packages with booking functionality.

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