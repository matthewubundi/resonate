import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  try {
    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Check subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (!profile || profile.subscription_tier === 'free') {
      return NextResponse.json({ error: 'Upgrade required for Memory access' }, { status: 403 });
    }

    // RLS ensures user can only see their own memories
    const { data, error } = await supabase
      .from('memories')
      .select('id, content, created_at, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ data: data || [] });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Memory fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
