# Development Roadmap (The "Living" Plan)

**Status**: Active
**Last Updated**: 2025-12-08
**Purpose**: This document tracks the strategic direction of Resonate. It is a living document and changes as we learn more from our users.

---

## 🟢 Phase 1: Foundation (Current Focus)
**Goal**: Validate the core "Identity Engine" with a working MVP.

- [x] **Project Setup**: Next.js + Tailwind + Supabase initialization.
- [x] **Authentication**: Email/Password & OAuth (Google/GitHub) flows.
- [x] **Landing Page**: Premium, "Hypnotic" aesthetics with `HeroBackground`.
- [x] **Documentation System**: Dynamic markdown rendering for internal docs.
- [x] **Onboarding Flow**:
  - [x] "The Interview": Interactive chat interface (Voice Calibrator & Smart Analysis).
  - [x] "Extraction": Visualizing the AI analyzing user data.
  - [x] "Review": Editable JSON profile before saving.
- [x] **Core Transformation API**:
  - [x] Basic Prompt Logic.
  - [x] "Self-Healing" Loop (Evaluation Mechanism).
  - [x] Multi-Model Support (OpenAI GPT-4o & Google Gemini).
- [x] **Dashboard & Management**:
  - [x] Central hub for identities.
  - [x] CRUD operations (Create, Edit, Delete, Duplicate).
  - [x] Data Export (Download `identity_json`).

---

## 🟡 Phase 2: User Experience & Stability
**Goal**: Turn the MVP into a daily-driver tool.

- [x] **Advanced Persona Features**:
  - [x] Persona Duplication (Backend & Frontend).
  - [x] Contextual "Memory" Store.
- [x] **Identity Version Control**:
  - [x] UI to view historical versions of an identity.
  - [x] "Rollback" functionality.
- [ ] **Chrome Extension (Lite)**:
  - [ ] Highlight text -> "Resonate" context menu option.
  - [ ] Popup to quick-switch active identity.
- [x] **Analytics & Drift Detection**:
  - [x] "Voice Consistency Score" over time.
  - [x] Detailed logs and insights.
- [ ] **Billing Integration**: Stripe setup for "Pro" tiers.
- [ ] **Context-Aware "Smart Switching"**: Auto-detect context (Email vs Tweet) to suggest identity.
- [ ] **"Active Learning" Loop**: A/B testing feedback to refine identity weights.
- [ ] **"Living" Identity Visualization**: Dynamic abstract avatar representing tone.
- [ ] **Advanced Chrome Extension**: "Ghostwriter" overlay for in-place rewrites.

---

## 🔴 Phase 3: Advanced Intelligence
**Goal**: Deep personalization and team features.

- [ ] **"Style Ingestion"**: Upload a PDF/Blog archive and have the AI auto-extract the style (bypassing the interview).
- [ ] **Team Identities**: Shared JSON profiles for companies (e.g., "Brand Voice").
- [ ] **Multimodal "Voice"**: TTS generation matches the user's cloning style.
- [ ] **"Devil's Advocate" Mode**: Rewrite text as the opposite identity for perspective.
- [ ] **Resonate SDK**: API layer for external agents to use the Identity Engine.

---

## 🧊 Icebox (Future Ideas)
- **Slack Bot**: Real-time tone correction in Slack.
- **Mobile App**: iOS Share Sheet integration.
- **Enterprise SSO**: SAML support.
