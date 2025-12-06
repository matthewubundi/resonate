# Identity JSON Schema Registry

**Version**: 1.0.0
**Status**: Active
**Purpose**: The single source of truth for the `identity_json` structure stored in the `identities` table. The application relies on this exact structure for the "Identity Construction" and "Transformation" phases.

---

## 1. Schema Definition (v1.0)

The `identity_json` column MUST adhere to this structure.

```json
{
  "tone": "string",
  "formality": "string",
  "directness": "string",
  "sentence_structure": {
    "typical_length": "string",
    "patterns": ["string"]
  },
  "vocabulary": {
    "frequent_words": ["string"],
    "avoid_words": ["string"]
  },
  "values": ["string"],
  "ethics": ["string"],
  "humour": "string",
  "formatting_preferences": {
    "default": "string",
    "structure": "string",
    "prefers_summaries": "boolean"
  },
  "decision_style": "string",
  "rules": {
    "always": ["string"],
    "never": ["string"]
  }
}
```

---

## 2. Field Definitions & Validation

### Root Fields

| Field | Type | Required | Description | Validation Rule |
|---|---|---|---|---|
| `tone` | string | Yes | High-level summary of the user's voice. | Max 100 chars. |
| `formality` | string | Yes | The level of formal address. | distinct enum: "High", "Medium", "Low". |
| `directness` | string | Yes | How straight-forward the writing is. | e.g., "To the point", "Narrative". |
| `humour` | string | Yes | Analysis of wit/humour. | e.g., "Dry", "None", "Sarcastic". |
| `decision_style`| string | Yes | How they approach conclusions. | e.g., "Analytical", "Intuitive". |

### Nested Objects

#### `sentence_structure`
Describes the user's syntactical habits.
- `typical_length` (string): e.g., "Short and punchy" or "Long, complex compound sentences".
- `patterns` (array<string>): Specific observed habits (e.g., "Frequently uses em-dashes").

#### `vocabulary`
- `frequent_words` (array<string>): Signature words the user loves.
- `avoid_words` (array<string>): **Critical List**. Words the user explicitly hates (User Input: `hatedWords`).

#### `values` & `ethics`
- `values` (array<string>): Core operating principles (User Input: `coreValues`).
- `ethics` (array<string>): Inferred ethical frameworks.

#### `formatting_preferences`
- `default` (string): General layout preference (e.g., "Bullet points over paragraphs").
- `structure` (string): Paragraph composition style.
- `prefers_summaries` (boolean): Default `false`.

#### `rules` (**High Priority**)
The "Evaluation Engine" heavily weights these fields during the audit loop.
- `always` (array<string>): Rules that must never be broken.
- `never` (array<string>): Negative constraints.

---

## 3. Transformations & Usage

This JSON is injected into the:
1.  **Transformation System Prompt**: To guide the "Writer" agent.
2.  **Assessment System Prompt**: To guide the "Auditor" agent in scoring the output.

**Drift Warning**:
Changing the `identity_json` structure (e.g., renaming `vocabulary` to `lexicon`) without updating the sub-agents' system prompts **will cause the transformation accuracy to drop to 0**.

---

## 4. Migration Guide

### Current Version: v1.0.0

### Future: v1.1.0 (Draft)
*Proposed changes:*
- Add `examples: []` array to root to store "Fixed-Shot" examples for the LLM.
- Split `tone` into `emotional_tone` and `intellectual_tone`.

**Migration Strategy**:
1.  **Database**: No schema change needed (`jsonb` allows flexibility), but old records need back-filling if new fields are required.
2.  **App Logic**: Update `types.ts` interface `IdentityProfile`.
3.  **Prompts**: Update `TRANSFORMATION_SYSTEM_PROMPT` to reference new keys.
