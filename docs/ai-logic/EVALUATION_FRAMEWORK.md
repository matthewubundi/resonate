# Evaluation Framework Log

**Purpose**: Defines how quality is measured and tracked within Resonate. The core metric of the system is the **Alignment Score** (0-10).

---

## 1. The Threshold
The system considers a transformation **SUCCESSFUL** if it achieves a score of **>= 8.0**.

- **< 6.0**: Critical Failure. The system will retry immediately with "Critical Feedback".
- **6.0 - 7.9**: Acceptable but flawed. Often drift in tone or minor vocabulary issues.
- **>= 8.0**: High Fidelity. The text is considered "Identity-Aligned".

---

## 2. Scoring Rubric (Total: 10 Points)

The "Identity Auditor" agent uses this strict rubric:

### A. Tone Match (3 Points)
- **3/3**: Perfect capture of emotional/intellectual weight. Indistinguishable from user.
- **2/3**: General approximation (e.g., correct formality but incorrect emotion).
- **1/3**: Generic "ChatGPT" tone.
- **0/3**: Completely conflicting tone (e.g., Happy instead of Sad).

### B. Vocabulary (2 Points)
- **2/2**: Perfect usage of "frequent_words" and ZERO usage of "avoid_words".
- **1/2**: Missed opportunities for specific vocabulary or 1 minor slip.
- **0/2**: Used a banned word ("avoid_words") or completely generic lexicon.

### C. Structure (3 Points)
- **3/3**: Sentence length and paragraph structure perfectly mirrored (e.g., short punchy vs long academic).
- **2/3**: Right direction but inconsistent.
- **1/3**: Standard AI paragraph structure (Intro-Body-Conclusion) improperly applied.
- **0/3**: Ignored formatting rules (e.g., used bullet points when forbidden).

### D. Constraints (2 Points)
- **2/2**: All "Always/Never" rules followed.
- **0/2**: Any rule broken results in immediate 0 for this section.

---

## 3. Regression Test Suite ("Golden Tests")

Before deploying a new model (e.g., switching from GPT-4o-mini to Llama-3-70b), run these test cases.

### Case 1: The "Corporate Killer"
- **Identity**: Direct, Professional, No Fluff. Banned word: "delve", "tapestry".
- **Input**: "I think maybe we should look into this project deeper."
- **Expected Output**: "We must investigate this project."
- **Pass Criteria**: Score >= 9. No "delve". Short sentence.

### Case 2: The "Whimsical Writer"
- **Identity**: Flowery, Poetic, Long sentences. Value: "Beauty".
- **Input**: "The sun is hot today."
- **Expected Output**: "The golden orb hangs heavy in the sky, casting its relentless warmth upon the parched earth."
- **Pass Criteria**: Score >= 8. Significant expansion of length.

### Case 3: The "Rule Breaker" Check
- **Identity**: Rule: "Never use the letter 'e' (Oulipo style)".
- **Input**: "Hello there everyone."
- **Expected Output**: "Hi all." (or similar constraint satisfaction).
- **Pass Criteria**: Score >= 8. Strict constraint adherence.
