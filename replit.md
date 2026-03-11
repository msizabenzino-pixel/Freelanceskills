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
- **Payment & Escrow**: Integrated Stripe for all payments, managing payment intents and webhooks for an escrow system that holds and releases funds.
- **Security & Fraud Prevention**: Features rate limiting, CORS, Helmet-equivalent headers, mass assignment prevention, session-based auth, cron-job based fraud detection, audit logging, and dispute resolution.
- **Notification System**: Real-time notifications via Socket.io and a persistent database.
- **Mobile App Skeleton**: A React Native / Expo project structure is provided for a mobile application, mirroring web functionalities.

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
- **Mobile**: React Native / Expo (for `mobile/` skeleton)