# API Specification

This document outlines the API endpoints available in the Resonate application.

## Base URL
All API routes are prefixed with `/api`.

---

## Authentication
Most endpoints require authentication. Authentication is handled via Supabase Auth.
You can authenticate using either:
1. **Authorization Header**: `Authorization: Bearer <access_token>`
2. **Session Cookie**: Standard Supabase session cookies (handled automatically by browser for client-side requests).

---

## Internationalization
The Resonate API currently operates primarily in **English**.
- **Response Data**: System messages, errors, and logic-based text are returned in English.
- **Frontend Handling**: The client application (Next.js) handles localization for **English (en)**, **French (fr)**, and **German (de)** using `next-intl`.
- **Future Support**: Future API versions may support the `Accept-Language` header to return localized error messages.

---

## Endpoints

### 1. Transform Text
**Endpoint**: `POST /api/transform`

Transforms input text to match the user's active identity using a self-healing correction loop. Now supports multi-model selection and contextual instructions.

#### Headers
- `Authorization`: Bearer <token> (optional if cookie is present)
- `Content-Type`: `application/json`

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `inputText` | string | Yes | The raw text to be rewritten. |
| `temperature` | number | No | Creativity control (0.0 - 1.5). Default: 0.7. |
| `instructions` | string | No | Specific contextual instructions for this run (e.g., "Make it punchy for Slack"). |
| `model_id` | string | No | The LLM to use: `gpt-4o-mini`, `gpt-4o`, `gemini-1.5-flash`. |

#### Response
**Status**: `200 OK`
```json
{
  "output": "The transformed text matching your identity...",
  "evaluation": {
    "score": 8.5,
    "reasoning": "Matches tone and vocabulary well.",
    "suggestions": ""
  },
  "attempts": 1,
  "used_memory": true
}
```

#### Errors
- `401 Unauthorized`: User not logged in.
- `400 Bad Request`: Missing `inputText` or validation error.
- `404 Not Found`: User has no active identity.
- `429 Too Many Requests`: Rate limit exceeded.

---

### 2. Generate Identity Profile
**Endpoint**: `POST /api/onboarding/generate`

Analyzes raw user input (values, vocabulary, writing samples) to generate a structured Identity JSON profile.

#### Request Body
| Field | Type | Description |
|---|---|---|
| `values` | any | User's core values and rules. |
| `vocabulary` | any | Tone preferences and word usage. |
| `writingSamples` | string | Raw text samples for analysis. |
| `hatedWords` | array | (Optional) Words to avoid. |
| `formattingPreference` | string | (Optional) Preferred formatting style. |

#### Response
**Status**: `200 OK`
```json
{
  "data": {
    "tone": "Professional, Direct, Empathetic",
    "tone_description": "Generally formal but uses emojis in internal chats.",
    "formality": "Neutral",
    "directness": "Balanced",
    "sentence_structure": {
        "typical_length": "Medium",
        "patterns": ["Starts sentences with verbs"]
    },
    "vocabulary": { 
        "frequent_words": ["..."],
        "avoid_words": ["..."]
    },
    "values": [ ... ],
    "ethics": [ ... ],
    "humour": "Dry, Sarcastic",
    "formatting_preferences": { ... },
    "decision_style": "Analytical",
    "rules": {
      "always": [ ... ],
      "never": [ ... ]
    }
  }
}
```

---

### 3. Persona Management

#### List Personas
**Endpoint**: `GET /api/personas/list`
Retrieves all identity personas for the authenticated user.

#### Create Persona
**Endpoint**: `POST /api/personas/create`
Creates a new persona.
- `baseConfig`: 'clone' (to copy active) or 'default'.
- `name`: Name of the new persona.

#### Duplicate Persona
**Endpoint**: `POST /api/personas/duplicate`
Duplicates a specific persona by ID.
**Body**: `{ "id": "uuid-of-source-persona" }`

---

### 4. Billing & Subscription

#### Create Checkout Session
**Endpoint**: `POST /api/billing/checkout`
Creates a Stripe Checkout session for upgrading to a Pro plan.

**Response**:
```json
{
  "sessionId": "cs_test_..."
}
```

#### Customer Portal
**Endpoint**: `POST /api/billing/portal`
Creates a session for the Stripe Customer Portal where users can manage their subscription (downgrade, cancel, update payment methods).

**Response**:
```json
{
  "url": "https://billing.stripe.com/..."
}
```

#### Stripe Webhooks
**Endpoint**: `POST /api/webhooks/stripe`
Handles asynchronous events from Stripe (e.g., `checkout.session.completed`, `customer.subscription.updated`). Verified via Stripe signature.

---

### 5. Data Export
**Endpoint**: `GET /api/settings/export`

Downloads all user data (profiles, identities, memories, transformations) in a JSON format. Cleaned of internal system fields.

#### Response
**Status**: `200 OK`
```json
{
  "profiles": [ ... ],
  "identities": [ ... ],
  "memories": [ ... ],
  "transformations": [ ... ],
  "metadata": {
      "export_date": "2024-12-08T...",
      "version": "1.0"
    }
  }
```

---

### 6. Get Documentation
**Endpoint**: `GET /api/docs`

Retrieves all markdown documentation files from the server's `docs` directory.

#### Response
```json
[
  {
    "name": "API_SPECIFICATION",
    "title": "API Specification",
    "content": "# API Specification...",
    "category": "general"
  }
]
```
