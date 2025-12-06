import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Persona ID is required' }, { status: 400 });
    }

    // First, set all identities for this user to inactive (RLS ensures user can only update their own)
    const { error: deactivateError } = await supabase
      .from('identities')
      .update({ is_active: false })
      .eq('user_id', user.id);

    if (deactivateError) {
      return NextResponse.json({ error: deactivateError.message }, { status: 500 });
    }

    // Then, activate the selected identity (RLS ensures user can only update their own)
    const { data, error } = await supabase
      .from('identities')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, persona: data });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Persona switch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
