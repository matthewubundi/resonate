# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Version:** 1.2
**Owner:** Matt Schramm
**Status:** In Development
**Last Updated:** 2025-12-08

---

# **1. PRODUCT OVERVIEW**

## **1.1 Product Name**

**Resonate**
A system that rewrites AI-generated outputs to match a specific person’s identity, tone, communication style, values, and preferences.

## **1.2 Description**

Resonate is a platform that builds a **machine-readable identity layer** for individuals and uses it to filter AI outputs so that any response from an LLM aligns with how the user naturally communicates. It ensures that AI maintains the user's voice, values, and communication style across all workflows—including writing, summarisation, tasks, and agent actions.

This aligns with Ubundi’s broader goal: **embedding human identity into automated systems**.

## **1.3 Target Audience**

* Individual users wanting personalised AI outputs
* Professionals needing consistency across emails, documents, and messaging
* Developers integrating identity layers into agents
* Teams wanting unified brand or persona-based communication styles

## **1.4 Core Philosophy**

* **Human-first:** AI should reflect people, not replace them
* **Context-aware:** Identity is a persistent layer
* **Responsible:** Clear rules, no misalignment
* **Flexible:** Supports multiple personas and evolutions
* **Transparent:** Users can inspect, edit, and improve their identity_json

## **1.5 Design Aesthetics**

* **Philosophy:** Premium, Calm, Hypnotic, Structured.
* **Visuals:** High-end SaaS aesthetic with "Paper & Ink" theme (Paper background `#FFFFFF`, Ink text), Azure Blue accents (`#2563EB`), glassmorphism, smooth gradients, and subtle micro-animations.
* **Experience:** Interactive elements with hover effects, fluid transitions, and a "living" interface feel.

---

# **2. PRODUCT GOALS**

## **2.1 Primary Goals**

1. **Generate a structured identity_json** through an accessible onboarding interview.
2. **Transform any LLM-generated text** to match the created identity.
3. **Provide an evaluation mechanism** that scores identity alignment and automatically corrects low-quality outputs.
4. **Offer a dashboard** for daily usage, identity editing, and analytics.
5. **Enable long-term evolution** of the user’s identity profile.

## **2.2 Secondary Goals**

1. Allow multi-persona support (e.g., “work tone”, “informal tone”).
2. Enable optional long-term memory storage for contextual accuracy.
3. Provide an analytics dashboard for alignment insights.
4. Build foundations for agent integration.

## **2.3 Success Criteria**

* Text transformations consistently receiving ≥ 8/10 alignment score
* High user satisfaction with identity accuracy
* Time-to-transform under 3 seconds
* Onboarding completion rate > 85%
* Identity edits per user < 5 after initial onboarding (shows accuracy)

---

# **3. PRODUCT SCOPE**

## **3.1 Included in Scope**

* Onboarding interview flow
* Identity extraction and JSON creation
* Identity editing interface
* Transformation engine
* Evaluation loop
* Memory store (optional)
* Multi-persona system
* Versioning

* Baseline analytics
* **Public Landing Page** (Hero, Features, Onboarding preview, JSON transparency)
* **Documentation Page** (Markdown-based docs viewer)
* **Data Export** (Downloadable `identity_json`)

## **3.2 Out of Scope (for initial release)**

* Browser extension
* Email integration
* Multi-user enterprise roles
* Team identity sharing or governance
* Real-time agent task execution

These may be added in Phase 2 or 3.

---

# **4. USER STORIES**

## **4.1 Onboarding**

* As a user, I want to answer simple interview questions so that the system can learn my communication style.
* As a user, I want to provide writing samples to improve accuracy.
* As a user, I want to review and edit my identity_json before saving.

## **4.2 Transformation**

* As a user, I want to paste text and have it rewritten in my voice.
* As a user, I want to compare the original vs aligned text.
* As a user, I want to see why the changes were made.

## **4.3 Identity Management**

* As a user, I want to edit my identity_json at any time.
* As a user, I want to view differences between identity versions.
* As a user, I want to add banned words or favourite phrases.

## **4.4 Analytics**

* As a user, I want to see how consistent the system is over time.
* As a user, I want to know if my identity is drifting.
* As a user, I want suggestions to improve alignment.

## **4.5 Memory & Context**

* As a user, I want to enable/disable contextual memory.
* As a user, I want to see which memory items influence outputs.

## **4.6 Personas**

* As a user, I want multiple personas for different contexts.
* As a user, I want to switch personas instantly.

---

# **5. DETAILED FEATURE REQUIREMENTS**

---

# **5.1 Onboarding Interview (Required)**

### **Flow Steps**

1. Welcome screen
2. Communication style questions
3. Vocabulary and tone
4. Values and ethics
5. Structure and formatting
6. Writing samples
7. JSON generation
8. Review and edit
9. Save identity

### **Functional Requirements**

* 8–12 interview questions
* Automatic JSON generation via LLM
* Identity review screen
* Editable sections: tone, vocabulary, rules, structure, values

### **Technical Requirements**

* Frontend collects answers into a structured object
* Backend calls LLM to convert answers → identity_json
* Store JSON in Supabase or local

---

# **5.2 Identity JSON Format**

### **Core Schema**

```json
{
  "tone": "",
  "formality": "",
  "directness": "",
  "sentence_structure": {
    "typical_length": "",
    "patterns": []
  },
  "vocabulary": {
    "frequent_words": [],
    "avoid_words": []
  },
  "values": [],
  "ethics": [],
  "humour": "",
  "formatting_preferences": {
    "default": "",
    "structure": "",
    "prefers_summaries": false
  },
  "decision_style": "",
  "rules": {
    "always": [],
    "never": []
  }
}
```

### **Versioning**

* timestamp
* version ID
* change summary

---

# **5.3 Transformation Engine**

### **Flow**

```
Input text  
→ Raw LLM output  
→ Identity transformer (rewrite)  
→ Evaluation  
→ Correction loop (if < 8/10)  
→ Final aligned text  
```

### **Transformer Prompt**

* Inject identity_json
* Instruct LLM to rewrite without changing meaning
* Apply tone, structure, vocabulary, rules

### **Functional Requirements**

* Accept text input
* Display raw and aligned output
* Show alignment score
* Show highlight of differences
* Show reasoning

---

# **5.4 Evaluation Engine**

### **Scoring Categories**

* tone match
* vocabulary match
* structure match
* values alignment
* rule adherence
* total score

### **Threshold**

Default: 8/10 minimum

If score < threshold → run correction loop

### **Visual Representation**
* Display "Confidence Score" (e.g., "9.2/10 Match") to the user.
* Highlight the verification step to differentiate from standard LLM outputs.

---

# **5.5 Dashboard**

### **Components**

1. Identity Snapshot
2. Transform Text area
3. Recent Transformations
4. Analytics

### **Transform Page**

* Input box
* Output view
* Score panel
* Copy button
* Explanation panel

---

# **5.6 Identity Editor**

### **Features**

* Show identity_json sections
* Allow editing individual fields
* Allow LLM-enhanced regeneration
* Support diff view
* Save to new version

---

# **5.7 Analytics Dashboard**

### **Metrics**

* average alignment score
* drift detection
* common misalignments
* most used words
* tone variance

---

# **5.8 Memory & Context (Optional Phase 2)**

### **Features**

* Store important user messages
* Display memory items
* Delete or modify items
* Toggle memory usage

---

# **5.9 Personas (Optional Phase 2)**

### **Features**

* Create new personas
* Clone existing
* Run mini-interview
* Switch persona context

---

# **5.10 Public Website Features**

### **Landing Page**
* **Hero Section:** "Connected mesh" or "network" animation (Azure Blue particles).
* **3-Step Onboarding Display:** Visual explanation of "The Interview," "The Extraction," and "The Filter."
* **Under the Hood:** "Transparency" section featuring a floating JSON code snippet to show how identity is structured.

### **Documentation**
* Dedicated `/docs` route.
* Renders markdown files (e.g., Design System, Architecture) using `react-markdown`.
* Styled to match the premium application UI.

---

# **6. TECHNICAL REQUIREMENTS**

---

# **6.1 Frontend**

### **Tech Stack**

### **Tech Stack**

* **Vite + React**
* TypeScript
* TypeScript
* TailwindCSS for UI
* React Query for data fetching

---

# **6.2 Backend**

### **Tech Stack**

* Node.js (Express / Next.js API routes)
* Python FastAPI (optional)

### **Core Backend Responsibilities**

* LLM API calls
* identity_json generation
* transformation pipeline
* evaluation loop
* logging
* versioning

---

# **6.3 Data Storage**

### **Primary Storage**

* Supabase

  * identities
  * versions
  * transformations
  * analytics

### **Optional**

* Chroma DB for contextual memory

---

# **6.4 LLM Providers**

* OpenAI GPT-4o-mini / GPT-4o
* Google Gemini (gemini-1.5-flash)
* Optional: Anthropic Claude 3.5

### **Cost Target**

$5–$15 monthly for development
Under $30 monthly in production MVP

---

# **6.5 Logs & Observability**

Each transformation must log:

* raw input
* raw model output
* identity-aligned output
* score
* time taken
* persona used
* memory used (if enabled)

---

# **7. NON-FUNCTIONAL REQUIREMENTS**

### **Performance**

* Transformation under 3 seconds
* Onboarding generation under 5 seconds

### **Security**

* Identity JSON stored securely
* No external sharing
* All logs anonymised

### **Reliability**

* API failover
* Recovery from partial identity files

### **scalability**

* Multi-persona support ready in architecture
* Real-time agent integration optional later

---

# **8. RISKS + MITIGATION**

### **Risk 1:** Incorrect or shallow identity extraction

**Mitigation:**

* Provide sample generation preview
* Allow user editing
* Run JSON enhancement prompt

### **Risk 2:** High API costs

**Mitigation:**

* Use GPT-4o-mini
* Cache transformations
* Allow user to set “low cost” mode

### **Risk 3:** Misalignment in outputs

**Mitigation:**

* Evaluation loop
* Identity strength score
* Drift detection

### **Risk 4:** Users overwhelmed by JSON

**Mitigation:**

* Layered UI
* Edit-by-section instead of raw JSON

---

# **9. DEVELOPMENT ROADMAP**

---

## **PHASE 1 – CORE MVP (4–6 weeks)**

### Deliverables:

* Onboarding interview [Done] (includes Voice Calibrator & Smart Analysis)
* identity_json builder [Done]
* transformer engine [Done]
* evaluation loop [Done]
* dashboard [Done]
* identity editor [Done] (includes Data Export)
* basic analytics [In Progress]

---

## **PHASE 2 – Enhanced Features (6–8 weeks)**

### Deliverables:

* Memory layer
* persona system [Partially Implemented - Duplication added]
* drift detection
* enhanced analytics
* versioning UI

---

## **PHASE 3 – Advanced Integration (TBD)**

### Deliverables:

* Real-time agents using identity layer
* Browser extensions
* Email integrations
* Team personas

---

# **10. SUCCESS METRICS**

### **User Engagement**

* ≥ 85% onboarding completion
* ≥ 70% repeat usage weekly

### **Quality Metrics**

* average alignment score ≥ 8.0
* < 5% user complaints about tone mismatch

### **Performance**

* 95th percentile transformation time < 2.5 seconds

---

# **11. APPENDICES**

## **A. Full Flowchart**

(included earlier in Mermaid)

## **B. identity_json Schema**

(included)

## **C. Prompts used**

* extraction prompt
* transformation prompt
* evaluation prompt
* correction prompt

## **D. Example identity_json**

