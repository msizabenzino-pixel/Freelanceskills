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

## External Dependencies

-   **Database**: PostgreSQL
-   **AI**: OpenAI API (gpt-4o-mini)
-   **Payments**: PayFast API, Stripe API (`@stripe/stripe-js`)
-   **Authentication**: bcryptjs, express-session, connect-pg-simple
-   **Real-time Communication**: Socket.io
-   **UI Components**: shadcn/ui (based on Radix UI), Lucide React (icons), Framer Motion (animations), Embla Carousel
-   **Mobile Development**: React Native / Expo SDK 51, React Navigation 6, Sentry, Expo modules (notifications, camera, location, haptics, biometrics, calendar, video, speech, image-picker, secure-store, linking)