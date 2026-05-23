import React from 'react';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  Database,
  FileJson,
  Lock,
  Network,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/Components';
import { PageView } from '../types';
import { isDemoMode } from '../lib/demo';

const pipeline = [
  {
    title: 'Identity capture',
    body: 'Onboarding compiles interview answers into a portable identity JSON profile: tone, values, vocabulary, formatting, and hard rules.',
    icon: FileJson,
  },
  {
    title: 'Context retrieval',
    body: 'Relevant memories are retrieved with vector similarity and injected as extra style constraints before generation.',
    icon: Brain,
  },
  {
    title: 'Model routing',
    body: 'The LLM factory abstracts providers so product tiers can route between OpenAI and Gemini without changing the UI contract.',
    icon: Network,
  },
  {
    title: 'Self-healing loop',
    body: 'Each rewrite is evaluated against the identity profile. Low-scoring drafts feed correction notes into another pass.',
    icon: RotateCcw,
  },
];

const implementationHighlights = [
  'Next.js App Router with locale-aware routing and shared view components',
  'Supabase Auth, row-level security, profiles, identities, memories, transformation logs, and version history',
  'Provider abstraction for LLMs with premium model access checks',
  'OpenAI embeddings plus Postgres vector search for contextual memory retrieval',
  'Stripe checkout and billing portal flows with safe demo simulation',
  'Zod request validation, CORS handling, rate limiting, and sanitized API errors',
];

const demoBoundaries = [
  'Fake authenticated demo user and session',
  'Seeded personas, memories, settings, analytics, and transformation history',
  'Deterministic local rewrite simulator instead of paid LLM calls',
  'Billing, account deletion, memory mutation, and rollback actions are simulated',
  'Environment validation skips production credentials when demo mode is enabled',
];

export const Architecture: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
        <div className="bg-white border border-ink/10 rounded-lg p-6 md:p-8 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-azure/10 border border-azure/20 px-3 py-1 text-xs font-bold text-azure">
              <Sparkles size={14} /> Portfolio Demo
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-azure/10 border border-azure/20 px-3 py-1 text-xs font-bold text-azure">
              <ShieldCheck size={14} /> {isDemoMode ? 'Demo mode active' : 'Production mode'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink mb-4">
            A machine-readable identity layer for AI writing.
          </h1>
          <p className="text-lg text-ink/65 leading-relaxed mb-6">
            Resonate turns a person’s communication style into structured data, then uses that identity profile
            to rewrite generic model output into text that sounds specific, consistent, and human.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => onNavigate('transform')}>
              <Zap size={17} className="mr-2" /> Try the engine
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('editor')}>
              <FileJson size={17} className="mr-2" /> Inspect identity JSON
            </Button>
          </div>
        </div>

        <div className="bg-ink text-white rounded-lg p-6 md:p-8 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-white/45 font-bold mb-4">System Contract</p>
          <div className="space-y-4">
            {['Input text', 'Identity JSON', 'Relevant memories', 'Provider response', 'Evaluation score'].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="font-semibold">{item}</span>
                {index < 4 && <ArrowRight size={16} className="ml-auto text-white/35" />}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-white/10 border border-white/10 p-4">
            <p className="text-sm text-white/75">
              The production path is designed for secure per-user data access. The portfolio path keeps the same
              product story while replacing network dependencies with deterministic demo data.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {pipeline.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title}>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-azure/10 text-azure flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink/65 leading-relaxed">{step.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Why The Implementation Is Interesting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {implementationHighlights.map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 size={18} className="text-azure shrink-0 mt-0.5" />
                  <p className="text-sm text-ink/70">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo Mode Boundaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoBoundaries.map((item) => (
                <div key={item} className="flex gap-3">
                  <Lock size={18} className="text-highlight shrink-0 mt-0.5" />
                  <p className="text-sm text-ink/70">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-white border border-ink/10 rounded-lg p-5">
          <Database className="text-azure mb-3" size={22} />
          <h3 className="font-bold mb-2">Data model</h3>
          <p className="text-sm text-ink/65">Profiles own identities, memories, transformation logs, and identity versions.</p>
        </div>
        <div className="bg-white border border-ink/10 rounded-lg p-5">
          <Code2 className="text-azure mb-3" size={22} />
          <h3 className="font-bold mb-2">API design</h3>
          <p className="text-sm text-ink/65">Routes validate inputs, enforce auth, apply tier gates, and return compact UI-ready payloads.</p>
        </div>
        <div className="bg-white border border-ink/10 rounded-lg p-5">
          <ShieldCheck className="text-azure mb-3" size={22} />
          <h3 className="font-bold mb-2">Safety</h3>
          <p className="text-sm text-ink/65">Demo mode avoids credentials, paid providers, destructive mutations, and production infrastructure.</p>
        </div>
      </section>
    </div>
  );
};
