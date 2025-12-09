import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    const { name, baseConfig, description } = await req.json();

    // --- BILLING CHECKS START ---
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.subscription_tier || 'free';

    const { count } = await supabase
      .from('identities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const currentCount = count || 0;
    const LIMITS = { free: 1, pro: 5, power: Infinity };
    const limit = LIMITS[tier as keyof typeof LIMITS] || 1;

    if (currentCount >= limit) {
      return NextResponse.json({
        error: `You have reached your limit of ${limit} personas. Upgrade to create more.`
      }, { status: 403 });
    }
    // --- BILLING CHECKS END ---

    let identityJson: any;

    if (baseConfig === 'clone') {
      // Fetch the active identity to clone (RLS ensures user can only see their own)
      const { data: activeIdentity, error: fetchError } = await supabase
        .from('identities')
        .select('identity_json')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (fetchError || !activeIdentity) {
        return NextResponse.json({
          error: 'No active identity found to clone. Please create an identity first or start from scratch.'
        }, { status: 400 });
      }

      // Clone the active identity and update name/description
      identityJson = {
        ...activeIdentity.identity_json,
        name: name || "New Persona",
        description: description || activeIdentity.identity_json.description || "",
      };
    } else {
      // Default Template
      identityJson = {
        name: name || "New Persona",
        description: description || "",
        tone: "Friendly, Professional",
        formality: "Neutral",
        directness: "Balanced",
        vocabulary: { frequent_words: [], avoid_words: [] },
        rules: { always: [], never: [] },
        formatting_preferences: { default: "paragraphs" }
      };
    }

    // Insert new identity (RLS ensures user can only insert their own)
    const { data, error } = await supabase
      .from('identities')
      .insert({
        user_id: user.id,
        identity_json: identityJson,
        name: name || "New Persona",
        is_active: false
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, persona: data });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Persona create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
