import { Session, User } from '@supabase/supabase-js';

export const isDemoMode = true;

export const demoUser = {
  id: 'demo-user-resonate',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'demo@resonate.dev',
  app_metadata: { provider: 'demo', providers: ['demo'] },
  user_metadata: {
    full_name: 'Alex Morgan',
    avatar_url: null,
  },
  created_at: '2026-01-08T09:30:00.000Z',
  updated_at: '2026-05-21T09:30:00.000Z',
} as User;

export const demoSession = {
  access_token: 'demo-mode-token',
  refresh_token: 'demo-mode-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: demoUser,
} as Session;

export const demoIdentity = {
  tone: 'Calm, direct, strategically warm',
  tone_description:
    'Alex writes with senior-operator clarity: concise, human, specific, and quietly optimistic.',
  formality: 'Polished but conversational',
  directness: 'High',
  values: ['clarity', 'craft', 'trust', 'momentum'],
  ethics: ['No inflated claims', 'Credit collaborators', 'Protect user data'],
  humour: 'Dry, sparing, never at the reader’s expense',
  vocabulary: {
    frequent_words: ['signal', 'shape', 'momentum', 'useful', 'specific'],
    avoid_words: ['synergy', 'leverage', 'revolutionary', 'game-changing'],
  },
  sentence_structure: {
    typical_length: 'Short to medium',
    patterns: ['Lead with the point', 'Use concrete nouns', 'End with a practical next step'],
  },
  formatting_preferences: {
    default: 'Short paragraphs with selective bullets',
    structure: 'Context, decision, next action',
    prefers_summaries: true,
  },
  decision_style: 'Principled pragmatism',
  rules: {
    always: [
      'Make the useful part obvious first',
      'Replace vague business language with concrete language',
      'Keep confidence without hype',
    ],
    never: [
      'Use empty urgency',
      'Pretend certainty when the evidence is mixed',
      'Sound like a generic AI assistant',
    ],
  },
};

export const demoProfile = {
  id: demoUser.id,
  email: demoUser.email,
  full_name: 'Alex Morgan',
  avatar_url: null,
  onboarding_completed: true,
  subscription_tier: 'power',
  subscription_status: 'demo',
  transformations_usage: 38,
  default_landing_page: 'dashboard',
  auto_copy_to_clipboard: false,
  clear_input_on_success: false,
  history_retention_period: 'forever',
};

export const demoTransformations = [
  {
    id: 'tr-demo-1',
    user_id: demoUser.id,
    input_text:
      'We should leverage cross-functional alignment to maximize stakeholder outcomes before launch.',
    raw_llm_output:
      'Let’s align across teams so launch decisions are clear, useful, and ready before they become urgent.',
    final_output:
      'Let’s align across teams so launch decisions are clear, useful, and ready before they become urgent.',
    alignment_score: 9.4,
    processing_time_ms: 1180,
    model_used: 'gpt-4o-mini',
    created_at: '2026-05-21T08:30:00.000Z',
  },
  {
    id: 'tr-demo-2',
    user_id: demoUser.id,
    input_text:
      'This product is revolutionary and will totally transform the way teams collaborate.',
    raw_llm_output:
      'This gives teams a shared voice layer, so AI-assisted writing stays consistent without flattening the person behind it.',
    final_output:
      'This gives teams a shared voice layer, so AI-assisted writing stays consistent without flattening the person behind it.',
    alignment_score: 8.9,
    processing_time_ms: 1460,
    model_used: 'gemini-flash-latest',
    created_at: '2026-05-20T16:45:00.000Z',
  },
  {
    id: 'tr-demo-3',
    user_id: demoUser.id,
    input_text:
      'Please find attached the requested deliverables for your review and consideration.',
    raw_llm_output:
      'I attached the deliverables. Take a look when you can, and I’m happy to tighten anything that needs more shape.',
    final_output:
      'I attached the deliverables. Take a look when you can, and I’m happy to tighten anything that needs more shape.',
    alignment_score: 9.1,
    processing_time_ms: 940,
    model_used: 'gpt-4o-mini',
    created_at: '2026-05-19T12:05:00.000Z',
  },
];

export const demoMemories = [
  {
    id: 'mem-demo-1',
    user_id: demoUser.id,
    title: 'Product philosophy',
    content: 'Prefer practical specificity over broad claims. Show the mechanism, not just the promise.',
    is_active: true,
    created_at: '2026-05-12T10:00:00.000Z',
  },
  {
    id: 'mem-demo-2',
    user_id: demoUser.id,
    title: 'Portfolio audience',
    content: 'When describing work, connect product value to architecture decisions and implementation depth.',
    is_active: true,
    created_at: '2026-05-11T14:10:00.000Z',
  },
  {
    id: 'mem-demo-3',
    user_id: demoUser.id,
    title: 'Words to avoid',
    content: 'Avoid synergy, unlock, groundbreaking, seamless, and disruptive unless quoting source text.',
    is_active: true,
    created_at: '2026-05-10T09:15:00.000Z',
  },
];

export const demoPersonas = [
  {
    id: 'identity-demo-main',
    user_id: demoUser.id,
    name: 'Founder / Operator',
    identity_json: demoIdentity,
    is_active: true,
    version_number: 4,
    created_at: '2026-05-01T09:00:00.000Z',
    updated_at: '2026-05-21T09:00:00.000Z',
    last_used_at: '2026-05-21T08:30:00.000Z',
  },
  {
    id: 'identity-demo-support',
    user_id: demoUser.id,
    name: 'Customer Support',
    identity_json: {
      ...demoIdentity,
      tone: 'Helpful, concise, reassuring',
      formality: 'Friendly professional',
    },
    is_active: false,
    version_number: 2,
    created_at: '2026-04-18T13:00:00.000Z',
    updated_at: '2026-05-02T11:00:00.000Z',
    last_used_at: '2026-05-02T11:00:00.000Z',
  },
];

export const demoIdentityVersions = [
  {
    id: 'version-demo-4',
    identity_id: 'identity-demo-main',
    version_number: 4,
    identity_json: demoIdentity,
    change_summary: 'Tightened vocabulary rules and added portfolio audience memory.',
    created_at: '2026-05-21T09:00:00.000Z',
  },
  {
    id: 'version-demo-3',
    identity_id: 'identity-demo-main',
    version_number: 3,
    identity_json: demoIdentity,
    change_summary: 'Added formatting preferences and decision style.',
    created_at: '2026-05-18T15:30:00.000Z',
  },
];

export function simulateDemoTransform(inputText: string, instructions?: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bleverage\b/gi, 'use'],
    [/\bsynergy\b/gi, 'shared momentum'],
    [/\boptimi[sz]e\b/gi, 'improve'],
    [/\bstakeholder outcomes\b/gi, 'results people can actually use'],
    [/\brevolutionary\b/gi, 'useful'],
    [/\bgame-changing\b/gi, 'meaningful'],
    [/\bit is imperative that\b/gi, 'we need to'],
    [/\butili[sz]e\b/gi, 'use'],
  ];

  let output = inputText.trim();
  replacements.forEach(([pattern, value]) => {
    output = output.replace(pattern, value);
  });

  output = output
    .replace(/\s+/g, ' ')
    .replace(/^please\s+/i, '')
    .replace(/\.$/, '');

  const prefix = instructions?.toLowerCase().includes('email')
    ? 'Quick note: '
    : instructions?.toLowerCase().includes('slack')
      ? 'Quick heads-up: '
      : '';

  const finalOutput = `${prefix}${output}.`
    .replace(/\bWe should\b/g, 'Let’s')
    .replace(/\bwe should\b/g, 'let’s');

  return {
    output: finalOutput,
    evaluation: {
      score: 9.2,
      reasoning:
        'Demo evaluator detected clearer language, fewer generic business terms, and stronger alignment with Alex’s direct-but-warm identity profile.',
      suggestions:
        'For an even closer match, add concrete context about audience, channel, or desired level of warmth.',
    },
    reasoning: [
      'Loaded active identity profile and communication rules.',
      'Injected relevant memories about portfolio audience and vocabulary constraints.',
      'Replaced generic business phrasing with concrete, human wording.',
      'Ran a simulated self-healing pass and accepted the rewrite above the 8.0 threshold.',
    ],
    attempts: 2,
    used_memory: true,
    demo: true,
  };
}

export function getDemoRows(table: string) {
  switch (table) {
    case 'profiles':
      return [demoProfile];
    case 'identities':
      return demoPersonas;
    case 'transformations':
      return demoTransformations;
    case 'memories':
      return demoMemories;
    case 'identity_versions':
      return demoIdentityVersions;
    default:
      return [];
  }
}
