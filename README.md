<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Resonate

An AI-powered application that helps preserve and maintain your unique communication identity across different platforms and contexts. Resonate builds a machine-readable identity layer for individuals and uses it to transform AI-generated outputs so they align with your natural communication style, values, and preferences.

## ✨ Features

### Core Functionality
- 🎯 **Identity Onboarding** - AI-powered interview process that generates your unique identity profile
- ✨ **Text Transformation** - Rewrite any text to match your communication style using a self-healing correction loop
- 📊 **Analytics Dashboard** - Track transformation history, alignment scores, and usage patterns
- 🎨 **Identity Editor** - Visual editor to refine and customize your identity profile
- 👥 **Multi-Persona Support** - Create and switch between different personas (work, personal, etc.)
- 🧠 **Memory System** - Store contextual memories for enhanced transformation accuracy
- 📜 **Version History** - Track changes to your identity with rollback capabilities
- ⚙️ **Settings Management** - Customize display name, theme, language, and timezone preferences

### Premium Features
- 💳 **Subscription Management** - Tiered access (Free, Pro, Power) powered by Stripe
- ⚡ **Smart Model Routing** - Access to advanced models (Gemini 2.5 Flash) for premium tiers
- 🔒 **Upgrade Gates** - Premium UI components for feature locking and upselling
- 📈 **Advanced Analytics** - Deeper insights into your usage and transformation quality

### Platform Features
- 🔐 **Secure Authentication** - Email/password and OAuth (Google, GitHub) via Supabase
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS and Framer Motion
- 🔒 **Protected Routes** - Automatic authentication checks for secure pages
- 📚 **Documentation Viewer** - Built-in markdown documentation system
- 🚀 **Performance Optimized** - Rate limiting, error handling, and efficient data fetching

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Supabase Account** - For authentication and database
- **OpenAI API Key** - For AI-powered transformations

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd identity-preserver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # App
   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # OpenAI (Legacy/Fallback)
   OPENAI_API_KEY=your-openai-api-key-here

   # Google Gemini (Primary for Premium)
   GEMINI_API_KEY=your-gemini-api-key-here

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

   📖 **For detailed setup instructions**, see [SUPABASE_SETUP.md](./docs/architecture/SUPABASE_SETUP.md)

4. **Set up the database**

   Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor to create the necessary tables and functions.

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
identity-preserver/
├── app/                    # Next.js 16 app directory
│   ├── api/               # API routes
│   │   ├── transform/     # Text transformation endpoint
│   │   ├── onboarding/    # Identity generation
│   │   ├── personas/      # Persona management
│   │   ├── memory/        # Memory CRUD operations
│   │   ├── history/       # Transformation history
│   │   ├── settings/      # User settings
│   │   ├── billing/       # Billing & checkout
│   │   └── webhooks/      # Stripe webhooks
│   ├── dashboard/         # Dashboard page
│   ├── transform/         # Transformation interface
│   ├── editor/            # Identity editor
│   ├── personas/          # Persona management UI
│   ├── memory/            # Memory management UI
│   ├── analytics/         # Analytics dashboard
│   ├── history/           # History viewer
│   ├── settings/          # Settings page
│   ├── plans/             # Subscription plans page
│   └── documentation/     # Documentation viewer
├── components/            # Reusable UI components
│   ├── ui/                # UI component library
│   └── Layout.tsx        # Main layout component
├── contexts/             # React contexts
│   └── AuthContext.tsx    # Authentication context
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   └── useOnboarding.ts  # Onboarding status hook
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── prompts.ts        # AI prompts
│   ├── validation.ts     # Zod schemas
│   ├── ratelimit.ts      # Rate limiting
│   └── errors.ts         # Error handling
├── utils/                # Server utilities
│   └── supabase/         # Server-side Supabase helpers
├── views/                # Page view components
├── docs/                 # Comprehensive documentation
│   ├── architecture/     # System architecture docs
│   ├── api/              # API specifications
│   ├── ai-logic/         # AI prompt registry
│   ├── design/           # Design system
│   └── planning/         # Product requirements
├── supabase/             # Database files
│   ├── schema.sql        # Database schema
│   └── migrations/       # Database migrations
└── types.ts              # TypeScript type definitions
```

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL with vector extension)
- **AI/ML**: Google Gemini (Flash 2.5), OpenAI GPT-4o-mini
- **Payments**: Stripe
- **Styling**: Tailwind CSS 4, Framer Motion
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts
- **Validation**: Zod
- **Rate Limiting**: Upstash Redis
- **Markdown**: react-markdown, react-syntax-highlighter

## 🔑 Key Concepts

### Identity Profile
A structured JSON object (`identity_json`) that captures:
- Communication tone and style
- Formality and directness levels
- Core values and ethics
- Vocabulary preferences (frequent/avoid words)
- Sentence structure patterns
- Formatting preferences
- Decision-making style
- Rules (always/never guidelines)

### Transformation Process
1. **Input** - User provides text to transform
2. **Memory Retrieval** - Relevant memories are fetched using vector similarity
3. **Transformation** - AI rewrites text to match identity profile
4. **Evaluation** - Alignment score calculated (0-10 scale)
5. **Self-Healing Loop** - If score < 8.0, automatically retries with feedback
6. **Output** - Final transformed text with alignment score

### Personas
Multiple identity profiles per user, allowing different communication styles for different contexts (e.g., "Work Persona", "Personal Blog", "Formal Communications").

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs) folder and within the app at `/documentation`:

### Architecture
- **[System Architecture](./docs/architecture/SYSTEM_ARCHITECTURE.md)** - Complete system design and component relationships
- **[Authentication Architecture](./docs/architecture/AUTH_ARCHITECTURE.md)** - Auth flows and security measures
- **[Supabase Setup Guide](./docs/architecture/SUPABASE_SETUP.md)** - Detailed database setup

### API Reference
- **[API Specification](./docs/api/API_SPECIFICATION.md)** - All API endpoints and usage
- **[Database Schema](./docs/api/DATABASE_SCHEMA.md)** - Complete database reference

### AI Logic
- **[Identity Schema](./docs/ai-logic/IDENTITY_SCHEMA.md)** - Identity JSON structure
- **[Prompt Registry](./docs/ai-logic/PROMPT_REGISTRY.md)** - Versioned AI prompts
- **[Evaluation Framework](./docs/ai-logic/EVALUATION_FRAMEWORK.md)** - Scoring system and thresholds

### Design & Planning
- **[Design System](./docs/design/DESIGN_SYSTEM.md)** - UI guidelines and components
- **[Product Requirements](./docs/planning/PRODUCT_REQUIREMENT_DOCUMENT.md)** - Complete PRD
- **[Development Roadmap](./docs/planning/DEVELOPMENT_ROADMAP.md)** - Project roadmap

## 🚢 Development

### Build for Production
```bash
npm run build
npm start
```

### Run Linter
```bash
npm run lint
```

## 🔐 Environment Variables

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | Yes |
| `NEXT_PUBLIC_BASE_URL` | App Base URL (e.g., http://localhost:3000) | Yes |

Optional (for rate limiting):
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

## 🎯 API Endpoints

- `POST /api/transform` - Transform text to match identity
- `POST /api/onboarding/generate` - Generate identity from interview
- `GET /api/personas/list` - List all personas
- `POST /api/personas/create` - Create new persona
- `POST /api/personas/switch` - Switch active persona
- `GET /api/memory` - List memories
- `POST /api/memory/add` - Add memory
- `DELETE /api/memory/delete` - Delete memory
- `GET /api/history/list` - Get transformation history
- `POST /api/history/rollback` - Rollback identity version
- `POST /api/settings/update` - Update user settings

See [API Specification](./docs/api/API_SPECIFICATION.md) for detailed documentation.

## 🧪 Testing

The application includes:
- Input validation with Zod schemas
- Rate limiting on API endpoints
- Error handling and sanitization
- Row-level security (RLS) policies in Supabase

## 📝 License

MIT

## 🤝 Contributing

This is a private project. For questions or issues, please refer to the documentation in `/docs` or contact the project maintainer.
