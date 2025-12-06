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

## Endpoints

### 1. Transform Text
**Endpoint**: `POST /api/transform`

Transforms input text to match the user's active identity using a self-healing correction loop.

#### Headers
- `Authorization`: Bearer <token> (optional if cookie is present)
- `Content-Type`: `application/json`

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `inputText` | string | Yes | The raw text to be rewritten. |
| `temperature` | number | No | Creativity control (0.0 - 1.5). Default: 0.7. |

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
  "attempts": 1
}
```

#### Errors
- `401 Unauthorized`: User not logged in.
- `400 Bad Request`: Missing `inputText`.
- `404 Not Found`: User has no active identity (needs onboarding).
- `500 Internal Server Error`: Transformation failed or OpenAI error.

---

### 2. Generate Identity Profile
**Endpoint**: `POST /api/onboarding/generate`

Analyzes raw user input (values, vocabulary, writing samples) to generate a structured Identity JSON profile.

#### Headers
- `Authorization`: Bearer <token> (optional if cookie is present)
- `Content-Type`: `application/json`

#### Request Body
Accepts a JSON object containing the user's raw inputs. Common fields included:
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
    "tone": "Professional, Direct",
    "formality": "High",
    "directness": "To the point",
    "sentence_structure": { ... },
    "vocabulary": { ... },
    "values": [ ... ],
    "ethics": [ ... ],
    "humour": "...",
    "formatting_preferences": { ... },
    "decision_style": "...",
    "rules": {
      "always": [ ... ],
      "never": [ ... ]
    }
  }
}
```

#### Errors
- `401 Unauthorized`: User not logged in.
- `500 Internal Server Error`: Generation failed.

---

### 3. Get Documentation
**Endpoint**: `GET /api/docs`

Retrieves all markdown documentation files from the server's `docs` directory. This is used to populate the internal Documentation page.

#### Response
**Status**: `200 OK`
```json
[
  {
    "name": "API_SPECIFICATION",
    "title": "API Specification",
    "content": "# API Specification...",
    "category": "general"
  },
  ...
]
```

#### Errors
- `404 Not Found`: Documentation directory missing.
- `500 Internal Server Error`: Failed to read files.
