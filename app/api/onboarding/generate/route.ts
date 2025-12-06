import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuthenticatedClient } from '@/utils/supabase/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EXTRACTION_PROMPT = `
You are the Identity Architect. Analyze the user's raw onboarding data and writing samples to construct a 'identity_json' profile.

### INPUT DATA

You will receive a JSON object containing:

- values: Core values and specific rules.
- vocabulary: Tone preferences and word usage.
- writingSamples: Raw text written by the user.

### INSTRUCTIONS

1. CRITICAL: Analyze the "writingSamples" deeply. Extract sentence length patterns, humidity, and structure from these samples.

2. Merge the user's explicit "values" and "vocabulary" preferences into the final profile.

3. Output ONLY valid JSON matching this exact schema:

{
  "tone": "String summary of tone (e.g., 'Professional, Direct, Academic')",
  "formality": "String (High/Medium/Low)",
  "directness": "String (e.g., 'To the point', 'Narrative')",
  "sentence_structure": {
    "typical_length": "String",
    "patterns": ["Array of observed patterns (e.g. 'frequently uses semicolon', 'starts sentences with verbs')"]
  },
  "vocabulary": {
    "frequent_words": ["Extracted from samples + user input"],
    "avoid_words": ["User input hatedWords"]
  },
  "values": ["Extracted from coreValues"],
  "ethics": ["Inferred from writing samples and values"],
  "humour": "String analysis of humour in samples",
  "formatting_preferences": {
    "default": "User input formattingPreference",
    "structure": "Observation of how they structure paragraphs",
    "prefers_summaries": false
  },
  "decision_style": "Inferred (e.g., Analytical vs Intuitive)",
  "rules": {
    "always": ["Explicit rules from user input"],
    "never": ["Explicit rules from user input (e.g. neverRule)"]
  }
}
`;

export async function POST(req: Request) {
  try {
    // Auth Check - supports both Bearer token and cookie auth with RLS
    await getAuthenticatedClient(req);

    // Receive raw input
    const rawInput = await req.json();

    // Call OpenAI to Convert Raw Input -> Identity JSON
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: JSON.stringify(rawInput) }
      ],
      response_format: { type: "json_object" }
    });

    const identityProfile = JSON.parse(completion.choices[0].message.content || '{}');

    // Return the Profile (Don't save yet - Frontend should show "Review" screen)
    return NextResponse.json({ data: identityProfile });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error generating identity profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate identity profile' }, { status: 500 });
  }
}
