import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  try {
    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    // RLS ensures user can only see their own identities
    const { data, error } = await supabase
      .from('identities')
      .select('id, identity_json, is_active, created_at, name, last_used_at')
      .eq('user_id', user.id)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ personas: data || [] });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Personas list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
