# Database Schema Definition

This document serves as the reference for the Supabase database schema used in Resonate.

## Overview
The database is designed to track user identities, manage version control for those identities (to prevent "drift"), and log all transformations against the specific version of the identity that was used.

---

## Tables

### 1. `users`
This table extends the default `auth.users` table provided by Supabase. It stores public user profile information.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | No | | Primary Key. References `auth.users(id)`. |
| `email` | text | No | | User's email address. |
| `display_name` | text | Yes | | User's chosen display name. |
| `created_at` | timestamptz | No | `now()` | Account creation timestamp. |
| `updated_at` | timestamptz | No | `now()` | Last profile update timestamp. |

---

### 2. `identities`
Stores the **current, active** identity configuration for a user. This is what the user sees when they edit their "Identity" settings.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | Primary Key. |
| `user_id` | uuid | No | | Foreign Key -> `users.id`. Owner of this identity. |
| `identity_json` | jsonb | No | | The full structured JSON profile (values, tone, rules). |
| `is_active` | boolean | No | `true` | Whether this is the currently active identity for the user. |
| `created_at` | timestamptz | No | `now()` | |
| `updated_at` | timestamptz | No | `now()` | |

---

### 3. `identity_versions`
**Crucial for Drift Detection.**
Whenever the `identities` table is updated, a snapshot is saved here. This allows us to link every historical transformation to the *exact* set of rules that were active at that time.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | Primary Key. |
| `identity_id` | uuid | No | | Foreign Key -> `identities.id`. The parent identity record. |
| `version_number` | integer | No | | Incremental version number (1, 2, 3...). |
| `identity_snapshot` | jsonb | No | | The exact JSON content at this point in time. |
| `change_reason` | text | Yes | | Optional note on why this version was created (e.g., "Updated banned words"). |
| `created_at` | timestamptz | No | `now()` | Time of version creation. |

---

### 4. `transform_logs`
Logs every single transformation request processed by the system.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | Primary Key. |
| `user_id` | uuid | No | | Foreign Key -> `users.id`. |
| `identity_version_id` | uuid | No | | **Key Relationship.** FK -> `identity_versions.id`. Links this output to the specific ruleset used. |
| `input_text` | text | No | | The original text provided by the user. |
| `final_output` | text | No | | The transformed result. |
| `alignment_score` | numeric | Yes | | The final evaluation score (0-10) assigned by the Auditor. |
| `model_used` | text | No | `'gpt-4o'` | Model identifier. |
| `processing_time_ms` | integer | Yes | | Time taken to process in milliseconds. |
| `created_at` | timestamptz | No | `now()` | |

---

## Entity-Relationship Diagram (ERD) Setup

### Relationships

1. **User -> Identity**
   - `users.id` 1:N `identities.user_id`
   - *A user can technically have multiple identity profiles, but usually one is `is_active=true`.*

2. **Identity -> Identity Versions**
   - `identities.id` 1:N `identity_versions.identity_id`
   - *Every time an Identity is saved, a new Version is created.*

3. **Identity Version -> Transform Logs**
   - `identity_versions.id` 1:N `transform_logs.identity_version_id`
   - *This ensures that if a user changes their "Tone" from "Formal" to "Casual" today, we know that yesterday's emails were generated using the "Formal" version.*
