# Documentation

This directory contains one-source-of-truth documentation for the Resonate application.

## 📚 Structure

The documentation is organized into the following sections:

### 1. General
- **README** (This file): High-level overview of the documentation structure.

### 2. Architecture (`/docs/architecture`)
- **System Architecture**: High-level system design, Next.js + Supabase integration, and component relationships.
- **Auth Architecture**: Detailed authentication flows (Magic Link, OAuth) and security measures.
- **Supabase Setup**: Prerequisite setup guide for database connectivity.

### 3. API Reference (`/docs/api`)
- **API Specification**: Definitions for `/api/transform`, `/api/onboarding`, and `/api/docs` endpoints.
- **Database Schema**: Comprehensive reference for `users`, `identities`, `identity_versions`, and `transform_logs` tables.

### 4. AI Logic (`/docs/ai-logic`)
- **Identity JSON Schema**: The strict JSON definition (v1.0) used for all identity profiles.
- **Prompt Registry**: Versioned source code for the "Extraction", "Transformation", and "Evaluation" prompts.
- **Evaluation Framework**: The "8/10 Threshold" logic and the scoring rubric used by the Auditor agent.

### 5. Design System (`/docs/design`)
- **UI Kit**: Usage guidelines for our Azure Blue/Slate palette, Inter typography, and functional components.

### 6. Planning (`/docs/planning`)
- **Roadmap**: The "Living Plan" tracking our progress through Phase 1 (Foundation), Phase 2 (UX), and Phase 3 (AI).
- **Product Requirements (PRD)**: The original detailed functional specification for the MVP.

---

## 🚀 How to Use

The full documentation is available within the app at `/documentation`.

- **Developers**: Start with **API Reference** and **Database Schema** to understand the data layer.
- **Prompt Engineers**: Focus on the **AI Logic** folder to tweak the "Identity Engine".
- **Designers**: Refer to the **Design System** for consistency.
