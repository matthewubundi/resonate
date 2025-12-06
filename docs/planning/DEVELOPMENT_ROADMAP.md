# Development Roadmap (The "Living" Plan)

**Status**: Active
**Last Updated**: 2025-12-06
**Purpose**: This document tracks the strategic direction of Resonate. It is a living document and changes as we learn more from our users.

---

## 🟢 Phase 1: Foundation (Current Focus)
**Goal**: Validate the core "Identity Engine" with a working MVP.

- [x] **Project Setup**: Next.js + Tailwind + Supabase initialization.
- [x] **Authentication**: Email/Password & OAuth (Google/GitHub) flows.
- [x] **Landing Page**: Premium, "Hypnotic" aesthetics with `HeroBackground`.
- [x] **Documentation System**: Dynamic markdown rendering for internal docs.
- [ ] **Onboarding Flow**:
  - [ ] "The Interview": Interactive chat interface.
  - [ ] "Extraction": Visualizing the AI analyzing user data.
  - [ ] "Review": Editable JSON profile before saving.
- [ ] **Core Transformation API**:
  - [x] Basic Prompt Logic.
  - [x] "Self-Healing" Loop (Draft).
  - [ ] Supabase Logging (Drift Detection).

---

## 🟡 Phase 2: User Experience & Stability
**Goal**: Turn the MVP into a daily-driver tool.

- [ ] **Dashboard**: A central hub to manage multiple Identities (e.g., "Professional", "Creative").
- [ ] **Identity Version Control**:
  - [ ] UI to view historical versions of an identity.
  - [ ] "Rollback" functionality.
- [ ] **Chrome Extension (Lite)**:
  - [ ] Highlight text -> "Resonate" context menu option.
  - [ ] Popup to quick-switch active identity.
- [ ] **Billing Integration**: Stripe setup for "Pro" tiers.

---

## 🔴 Phase 3: Advanced Intelligence
**Goal**: Deep personalization and team features.

- [ ] **"Style Ingestion"**: Upload a PDF/Blog archive and have the AI auto-extract the style (bypassing the interview).
- [ ] **Team Identities**: Shared JSON profiles for companies (e.g., "Brand Voice").
- [ ] **Analytics**: "Voice Consistency Score" over time.

---

## 🧊 Icebox (Future Ideas)
- **Slack Bot**: Real-time tone correction in Slack.
- **Mobile App**: iOS Share Sheet integration.
- **Enterprise SSO**: SAML support.
