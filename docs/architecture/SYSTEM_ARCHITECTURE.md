# System Architecture Document

**Project:** Resonate  
**Version:** 0.0.0  
**Last Updated:** December 4, 2025  
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

**Resonate** is an AI-powered web application designed to help users preserve and maintain their unique communication identity across different platforms and contexts. The system leverages modern web technologies, secure authentication, and AI capabilities to analyze, store, and transform user communication patterns while maintaining their authentic voice.

### Key Features
- Secure user authentication with multiple providers
- AI-powered identity analysis and transformation
- Real-time dashboard analytics
- Identity profile management
- Communication pattern tracking
- Multi-persona support

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
- **Next.js 16.0.7**: React framework with server-side rendering
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
│  │              Next.js Application                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Pages    │  │ Components │  │  Contexts  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     API/Service Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Supabase Services                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │    Auth    │  │  Database  │  │  Storage   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            PostgreSQL Database                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Users    │  │  Profiles  │  │   Memory   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Layers

#### 1. Presentation Layer
- **Responsibility**: User interface and user experience
- **Components**: React components, pages, layouts
- **Technologies**: React, Tailwind CSS, Framer Motion

#### 2. Application Layer
- **Responsibility**: Business logic and state management
- **Components**: Contexts, hooks, utilities
- **Technologies**: React Context, custom hooks

#### 3. Service Layer
- **Responsibility**: External service integration
- **Components**: Supabase client, API calls
- **Technologies**: Supabase SDK

#### 4. Data Layer
- **Responsibility**: Data persistence and retrieval
- **Components**: Database, storage
- **Technologies**: PostgreSQL, Supabase Storage

---

## Component Architecture

### Directory Structure

```
resonate/
├── app/                          # Next.js App Router
│   ├── auth/                     # Auth-related routes
│   │   └── callback/             # OAuth callback handler
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # Reusable UI components
│   ├── Components.tsx            # Shared UI components
│   └── Layout.tsx                # Layout components
│
├── contexts/                     # React Context providers
│   └── AuthContext.tsx           # Authentication context
│
├── hooks/                        # Custom React hooks
│   └── useAuth.ts                # Authentication hook
│
├── lib/                          # Utility libraries
│   └── supabase.ts               # Supabase client config
│
├── pages/                        # Application pages
│   ├── Dashboard.tsx             # Main dashboard
│   ├── Landing.tsx               # Landing page
│   ├── Login.tsx                 # Login page
│   ├── Signup.tsx                # Registration page
│   ├── Onboarding.tsx            # User onboarding
│   └── Transform.tsx             # Content transformation
│
├── docs/                         # Documentation
│   └── SYSTEM_ARCHITECTURE.md    # This document
│
├── App.tsx                       # Main application component
├── types.ts                      # TypeScript type definitions
├── constants.tsx                 # Application constants
└── package.json                  # Dependencies
```

### Component Hierarchy

```
App (Root)
├── AuthProvider (Context)
│   └── AppContent
│       ├── Layout
│       │   ├── Navbar
│       │   └── Footer
│       │
│       └── Page Router
│           ├── Landing (Public)
│           ├── Login (Public)
│           ├── Signup (Public)
│           ├── Onboarding (Semi-Protected)
│           └── Protected Routes
│               ├── Dashboard
│               ├── Transform
│               ├── Editor
│               ├── Analytics
│               ├── Memory
│               ├── Personas
│               └── Settings
```

---

## Data Architecture

### Data Models

#### User Profile
```typescript
interface IdentityProfile {
  id: string;
  name: string;
  version: string;
  tone: string[];
  vocabulary: {
    frequent: string[];
    avoid: string[];
  };
  values: string[];
  rules: {
    always: string[];
    never: string[];
  };
  alignmentScore: number;
}
```

#### Transformation Item
```typescript
interface TransformationItem {
  id: string;
  date: string;
  preview: string;
  score: number;
}
```

#### Memory Item
```typescript
interface MemoryItem {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  dateAdded: string;
}
```

#### Persona
```typescript
interface Persona {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  avatarColor: string;
}
```

### Database Schema (Supabase/PostgreSQL)

```sql
-- Users table (managed by Supabase Auth)
auth.users
  - id (uuid, primary key)
  - email (text)
  - encrypted_password (text)
  - email_confirmed_at (timestamp)
  - created_at (timestamp)
  - updated_at (timestamp)
  - user_metadata (jsonb)

-- Identity Profiles
public.identity_profiles
  - id (uuid, primary key)
  - user_id (uuid, foreign key → auth.users)
  - name (text)
  - version (text)
  - tone (text[])
  - vocabulary (jsonb)
  - values (text[])
  - rules (jsonb)
  - alignment_score (numeric)
  - created_at (timestamp)
  - updated_at (timestamp)

-- Transformations
public.transformations
  - id (uuid, primary key)
  - user_id (uuid, foreign key → auth.users)
  - profile_id (uuid, foreign key → identity_profiles)
  - original_content (text)
  - transformed_content (text)
  - score (numeric)
  - created_at (timestamp)

-- Memory Items
public.memory_items
  - id (uuid, primary key)
  - user_id (uuid, foreign key → auth.users)
  - title (text)
  - content (text)
  - is_active (boolean)
  - created_at (timestamp)
  - updated_at (timestamp)

-- Personas
public.personas
  - id (uuid, primary key)
  - user_id (uuid, foreign key → auth.users)
  - name (text)
  - description (text)
  - is_active (boolean)
  - avatar_color (text)
  - created_at (timestamp)
  - updated_at (timestamp)
```

---

## Authentication & Authorization

### Authentication Architecture

See [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) for detailed authentication flow.

#### Authentication Methods
1. **Email/Password**: Traditional credentials
2. **OAuth - Google**: Social authentication
3. **OAuth - GitHub**: Developer-focused authentication

#### Authentication Flow

```
User Request → Login/Signup Page
    ↓
Form Submission → useAuth Hook
    ↓
AuthContext → Supabase Client
    ↓
Supabase Auth API
    ↓
Session Created → Token Issued
    ↓
Context State Updated
    ↓
Protected Route Access Granted
```

#### Session Management
- **Token Storage**: HTTP-only cookies (secure)
- **Token Refresh**: Automatic via Supabase
- **Session Duration**: Configurable (default: 1 hour)
- **Refresh Token**: 30-day expiration

#### Authorization Levels
1. **Public**: Landing, Login, Signup
2. **Authenticated**: Dashboard, Transform, Settings
3. **Admin**: (Future) User management, analytics

---

## API Architecture

### Supabase API Integration

#### Authentication Endpoints
```
POST /auth/v1/signup          - User registration
POST /auth/v1/token           - User login
POST /auth/v1/logout          - User logout
POST /auth/v1/recover         - Password reset
GET  /auth/v1/user            - Get current user
GET  /auth/v1/authorize       - OAuth initiation
GET  /auth/v1/callback        - OAuth callback
```

#### Database Endpoints (Auto-generated)
```
GET    /rest/v1/identity_profiles    - List profiles
POST   /rest/v1/identity_profiles    - Create profile
PATCH  /rest/v1/identity_profiles    - Update profile
DELETE /rest/v1/identity_profiles    - Delete profile
```

### API Client Configuration

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Frontend Architecture

### Page Structure

#### Landing Page (`pages/Landing.tsx`)
- Hero section with value proposition
- Feature highlights
- Call-to-action buttons
- Responsive design

#### Dashboard (`pages/Dashboard.tsx`)
- Identity profile overview
- Recent transformations
- Analytics charts
- Quick actions

#### Transform Page (`pages/Transform.tsx`)
- Content input area
- Transformation controls
- Preview pane
- History sidebar

#### Login/Signup (`pages/Login.tsx`, `pages/Signup.tsx`)
- Form validation
- Error handling
- OAuth buttons
- Password strength indicator

### Component Design Patterns

#### 1. Compound Components
```typescript
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

#### 2. Render Props
```typescript
<DataFetcher
  render={(data, loading, error) => (
    loading ? <Spinner /> : <DataDisplay data={data} />
  )}
/>
```

#### 3. Custom Hooks
```typescript
const { user, loading, signIn, signOut } = useAuth();
```

---

## State Management

### Context-Based State

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

### Local Component State
- Form inputs
- UI toggles
- Temporary data

### Server State (Supabase)
- User data
- Identity profiles
- Transformations
- Persistent settings

---

## Routing & Navigation

### Page Types
```typescript
type PageView =
  | 'landing'      // Public landing page
  | 'login'        // Authentication
  | 'signup'       // Registration
  | 'onboarding'   // Initial setup
  | 'dashboard'    // Main dashboard
  | 'transform'    // Content transformation
  | 'editor'       // Profile editor
  | 'analytics'    // Analytics view
  | 'memory'       // Memory management
  | 'personas'     // Persona management
  | 'settings';    // User settings
```

### Route Protection

```typescript
const protectedPages: PageView[] = [
  'dashboard',
  'transform',
  'editor',
  'analytics',
  'memory',
  'personas',
  'settings'
];

const handleNavigate = (page: PageView) => {
  if (protectedPages.includes(page) && !user) {
    setCurrentPage('login');
    return;
  }
  setCurrentPage(page);
};
```

---

## Security Architecture

### Security Layers

#### 1. Client-Side Security
- Input validation
- XSS prevention
- CSRF protection
- Secure form handling

#### 2. Network Security
- HTTPS enforcement
- Secure headers
- CORS configuration
- Rate limiting (Supabase)

#### 3. Authentication Security
- Password hashing (bcrypt)
- JWT tokens
- Secure session storage
- OAuth 2.0 compliance

#### 4. Database Security
- Row Level Security (RLS)
- Prepared statements
- SQL injection prevention
- Encrypted storage

### Environment Variables

```env
# Public (client-side accessible)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

---

## Performance Considerations

### Optimization Strategies

#### 1. Code Splitting
- Next.js automatic code splitting
- Dynamic imports for heavy components
- Route-based splitting

#### 2. Asset Optimization
- Image optimization (Next.js Image)
- CSS minification
- JavaScript bundling

#### 3. Caching
- Browser caching
- API response caching
- Static page generation

#### 4. Lazy Loading
- Component lazy loading
- Image lazy loading
- Data pagination

#### 5. Performance Monitoring
- Core Web Vitals tracking
- Load time monitoring
- User interaction metrics

---

## Deployment Architecture

### Deployment Strategy

#### Development Environment
```
Local Machine
├── npm run dev (Next.js dev server)
├── Hot module replacement
└── Local Supabase instance (optional)
```

#### Staging Environment
```
Vercel Preview Deployment
├── Automatic PR deployments
├── Preview URLs
└── Staging Supabase project
```

#### Production Environment
```
Vercel Production
├── Optimized build
├── CDN distribution
├── Production Supabase project
└── Custom domain
```

### CI/CD Pipeline

```
Git Push → GitHub
    ↓
Trigger Vercel Build
    ↓
Run Tests (if configured)
    ↓
Build Next.js App
    ↓
Deploy to Vercel
    ↓
Update DNS/CDN
    ↓
Production Live
```

### Environment Configuration

```
Development:
  - .env.local (gitignored)
  - Local database
  - Debug mode enabled

Staging:
  - Vercel environment variables
  - Staging database
  - Error tracking enabled

Production:
  - Vercel environment variables
  - Production database
  - Performance monitoring
  - Error tracking
```

---

## Monitoring & Logging

### Monitoring Strategy

#### 1. Application Monitoring
- Error tracking (Sentry/similar)
- Performance monitoring
- User analytics

#### 2. Infrastructure Monitoring
- Vercel analytics
- Supabase dashboard
- Uptime monitoring

#### 3. User Monitoring
- Session tracking
- Feature usage
- Conversion funnels

### Logging Levels

```
ERROR   - Critical failures
WARN    - Potential issues
INFO    - General information
DEBUG   - Detailed debugging (dev only)
```

---

## Scalability Considerations

### Current Capacity
- **Users**: Unlimited (Supabase managed)
- **Storage**: Based on Supabase plan
- **Bandwidth**: Vercel limits apply

### Scaling Strategy

#### Horizontal Scaling
- Serverless functions (automatic)
- CDN edge caching
- Database read replicas (Supabase Pro)

#### Vertical Scaling
- Upgrade Supabase plan
- Optimize database queries
- Implement caching layers

#### Future Considerations
- Microservices architecture
- Dedicated AI service
- Message queue for async tasks
- Redis for session management

---

## Future Enhancements

### Planned Features

#### Phase 1: Core Enhancements
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Export/import functionality
- [ ] Mobile responsive improvements

#### Phase 2: AI Integration
- [ ] Custom AI model training
- [ ] Advanced NLP analysis
- [ ] Sentiment analysis
- [ ] Style transfer algorithms

#### Phase 3: Platform Expansion
- [ ] Browser extension
- [ ] Mobile applications (React Native)
- [ ] API for third-party integrations
- [ ] Webhook support

#### Phase 4: Enterprise Features
- [ ] Team collaboration
- [ ] Admin dashboard
- [ ] Usage analytics
- [ ] Custom branding
- [ ] SSO integration

### Technical Debt

#### Current Items
- [ ] Add comprehensive unit tests
- [ ] Implement E2E testing
- [ ] Add API documentation
- [ ] Improve error handling
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
