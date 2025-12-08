# System Architecture Document

**Project:** Resonate  
**Version:** 0.2.0  
**Last Updated:** December 8, 2025  
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Principles](#architecture-principles)
4. [Technology Stack](#technology-stack)
5. [System Architecture](#system-architecture)
6. [Component Architecture](#component-architecture)
7. [Data Architecture](#data-architecture)
8. [Authentication & Authorization](#authentication--authorization)
9. [API Architecture](#api-architecture)
10. [Frontend Architecture](#frontend-architecture)
11. [State Management](#state-management)
12. [Routing & Navigation](#routing--navigation)
13. [Security Architecture](#security-architecture)
14. [Performance Considerations](#performance-considerations)
15. [Deployment Architecture](#deployment-architecture)
16. [Monitoring & Logging](#monitoring--logging)
17. [Scalability Considerations](#scalability-considerations)
18. [Future Enhancements](#future-enhancements)

---

## Executive Summary

**Resonate** is an AI-powered web application designed to help users preserve and maintain their unique communication identity across different platforms and contexts. The system leverages modern web technologies, secure authentication, and multi-model AI capabilities to analyze, store, and transform user communication patterns while maintaining their authentic voice.

### Key Features
- Secure user authentication with multiple providers
- Multi-Model AI support (OpenAI + Gemini)
- Real-time dashboard analytics
- Identity profile management (v1.1 Schema)
- Context-aware text transformation (RAG + Instructions)
- Multi-persona support with cloning
- Data export functionality

---

## System Overview

### Purpose
The Resonate system enables users to:
- Capture and analyze their unique communication style
- Transform content while preserving their identity
- Track identity alignment over time
- Manage multiple communication personas
- Maintain consistency across platforms

### Target Users
- Content creators
- Professional communicators
- Multi-platform users
- Brand managers
- Anyone seeking communication consistency

---

## Architecture Principles

The system is built on the following core principles:

1. **User-Centric Design**: Intuitive, responsive UI with minimal friction
2. **Security First**: Authentication and data protection at every layer
3. **Modularity**: Loosely coupled components for maintainability
4. **Scalability**: Architecture supports growth in users and features
5. **Performance**: Fast load times and responsive interactions
6. **Accessibility**: WCAG-compliant interfaces
7. **Type Safety**: TypeScript throughout for reliability

---

## Technology Stack

### Frontend Framework
- **Next.js 16.0.7**: React framework with App Router
- **React 19.2.1**: Component-based UI library
- **TypeScript 5.8.2**: Type-safe JavaScript

### Styling & UI
- **Tailwind CSS 4.1.17**: Utility-first CSS framework
- **PostCSS 8.5.6**: CSS processing
- **Framer Motion 11.0.8**: Animation library
- **Lucide React 0.555.0**: Icon library
- **clsx 2.1.1**: Conditional className utility
- **tailwind-merge 3.4.0**: Tailwind class merging

### Data Visualization
- **Recharts 3.5.1**: Charting library for analytics

### Authentication & Backend
- **Supabase 2.86.0**: Backend-as-a-Service
  - Authentication
  - Database (PostgreSQL)
  - Real-time subscriptions
  - Storage
- **AI SDKs**:
  - `openai`: For GPT-4o / Embbeddings
  - `@google/generative-ai`: For Gemini Models

### Development Tools
- **Vite 6.2.0**: Build tool
- **TypeScript**: Static typing
- **ESLint**: Code linting

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js App Router                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Pages    │  │ Components │  │  Contexts  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     API/Service Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Next.js API Routes / Supabase Services           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │    Auth    │  │ LLM Factory│  │  Memory    │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            PostgreSQL Database                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │ Identities │  │ Transforms │  │   Memory   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Layers

#### 1. Presentation Layer
- **Responsibility**: User interface and user experience
- **Components**: React server/client components, layouts
- **Technologies**: React, Tailwind CSS, Framer Motion

#### 2. Application Layer
- **Responsibility**: Business logic and state management
- **Components**: Contexts, hooks, utilities, `LLMFactory`
- **Technologies**: React Context, custom hooks

#### 3. Service Layer
- **Responsibility**: External service integration (AI, Database)
- **Components**: Supabase client, OpenAI/Gemini SDKs
- **Technologies**: Supabase SDK, AI SDKs

#### 4. Data Layer
- **Responsibility**: Data persistence and retrieval
- **Components**: Database, storage, Vector Store (pgvector)
- **Technologies**: PostgreSQL, Supabase Storage

---

## Component Architecture

### Directory Structure

```
resonate/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Auth handlers
│   │   ├── onboarding/           # Identity generation
│   │   ├── personas/             # Persona management
│   │   ├── transform/            # Transformation logic
│   │   └── settings/             # Export/Settings
│   ├── auth/                     # Auth Data Pages
│   ├── dashboard/                # Main app views
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Design system components
│   └── ...                       # Feature components
│
├── contexts/                     # React Context providers
│   └── AuthContext.tsx           # Authentication context
│
├── hooks/                        # Custom React hooks
├── lib/                          # Core libraries
│   ├── ai.ts                     # AI helper functions
│   ├── llm/                      # LLM Factory & Providers
│   ├── prompts.ts                # System prompts
│   └── supabase.ts               # Supabase config
│
├── docs/                         # Documentation
├── types.ts                      # TypeScript type definitions
└── package.json                  # Dependencies
```

---

## Data Architecture

### Data Models (TypeScript)

#### IdentityProfile (v1.1)
```typescript
interface IdentityProfile {
  tone: string;
  tone_description: string;
  formality: "Casual" | "Neutral" | "Formal";
  directness: "Concise" | "Balanced" | "Elaborate";
  vocabulary: {
    frequent_words: string[];
    avoid_words: string[];
  };
  values: string[];
  rules: {
    always: string[];
    never: string[];
  };
  sentence_structure: {
    typical_length: string;
    patterns: string[];
  };
  formatting_preferences: {
    default: string;
    structure: string;
    prefers_summaries: boolean;
  };
}
```

### Database Schema (Supabase/PostgreSQL)

```sql
-- Users table (managed by Supabase Auth)
auth.users

-- Identities Table (Core Persona Data)
public.identities
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - name (text)
  - description (text)
  - identity_json (jsonb) -- Stores IdentityProfile
  - is_active (boolean)
  - last_used_at (timestamp)
  - created_at (timestamp)

-- Transformations (Usage Logs)
public.transformations
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - input_text (text)
  - final_output (text)
  - model_used (text)
  - alignment_score (numeric)
  - processing_time_ms (integer)
  - created_at (timestamp)

-- Memories (RAG Knowledge Base)
public.memories
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - content (text)
  - embedding (vector)
  - is_active (boolean)
  - created_at (timestamp)

-- Identity Versions (History)
public.identity_versions
  - id (uuid, primary key)
  - identity_id (uuid, foreign key)
  - identity_json (jsonb)
  - change_summary (text)
  - created_at (timestamp)
```

---

## Authentication & Authorization

### Authentication Architecture

See [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) for detailed authentication flow.

#### Authentication Methods
1. **Email/Password**: Traditional credentials
2. **OAuth - Google**: Social authentication
3. **OAuth - GitHub**: Developer-focused authentication

---

## API Architecture

### Key Endpoints

#### AI Services
- `POST /api/transform` - Text transformation (Supports Multi-Model & Instructions)
- `POST /api/onboarding/generate` - Generate Identity from raw input

#### Data Management
- `GET /api/personas/list` - List user personas
- `POST /api/personas/create` - Create/Clone personas
- `GET /api/settings/export` - Export user data

---

## Frontend Architecture

### App Router Structure

- `app/page.tsx`: Landing Page (Public)
- `app/login/page.tsx`: Auth Page
- `app/dashboard/page.tsx`: Main User Dashboard
- `app/transform/page.tsx`: Transformation Interface
- `app/personas/page.tsx`: Persona Management

### Component Design Patterns

#### 1. Server Components
Used for data fetching and layout structure where interactivity is not needed.

#### 2. Client Components (`'use client'`)
Used for interactive forms, AI streaming, and dynamic UI updates (charts).

---

## Future Enhancements

### Planned Features

#### Phase 1: Core Enhancements (Active)
- [x] Real-time collaboration
- [x] Advanced analytics dashboard
- [x] Export/import functionality
- [ ] Mobile responsive improvements

#### Phase 2: AI Integration (Active)
- [x] Multi-Model Support (OpenAI + Gemini)
- [x] Contextual Refinements
- [ ] Custom AI model fine-tuning
- [ ] Style transfer algorithms

#### Phase 3: Platform Expansion
- [ ] Browser extension
- [ ] Mobile applications (React Native)
- [ ] API for third-party integrations

#### Phase 4: Enterprise Features
- [ ] Team collaboration
- [ ] Admin dashboard
- [ ] Usage analytics
- [ ] SSO integration

### Technical Debt
- [ ] Add comprehensive unit tests (Jest/Vitest)
- [ ] Implement E2E testing (Playwright)
- [ ] Improve error handling edge cases
- [ ] Add loading states
- [ ] Implement retry logic

#### Performance Improvements
- [ ] Implement service workers
- [ ] Add offline support
- [ ] Optimize bundle size
- [ ] Implement virtual scrolling
- [ ] Add request debouncing

---

## Appendices

### A. Related Documentation
- [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) - Authentication details
- [AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md) - Implementation guide
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase configuration
- [README.md](../README.md) - Project overview

### B. External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### C. Glossary

- **RLS**: Row Level Security - Database security feature
- **JWT**: JSON Web Token - Authentication token format
- **OAuth**: Open Authorization - Third-party authentication protocol
- **SSR**: Server-Side Rendering - Next.js rendering strategy
- **SPA**: Single Page Application - Client-side routing
- **CDN**: Content Delivery Network - Asset distribution

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-04 | System | Initial creation |

**Review Schedule**: Quarterly or upon major architectural changes

**Contact**: For questions or updates to this document, please contact the development team.
