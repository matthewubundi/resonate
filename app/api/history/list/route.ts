import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  try {
    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    // Find the ACTIVE identity first (RLS ensures user can only see their own)
    const { data: activeIdentity, error: identityError } = await supabase
      .from('identities')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (identityError || !activeIdentity) {
      // No active identity found, return empty array
      return NextResponse.json({ versions: [] });
    }

    // Fetch versions for ONLY that identity (RLS ensures user can only see their own)
    const { data: versions, error: versionsError } = await supabase
      .from('identity_versions')
      .select('*')
      .eq('identity_id', activeIdentity.id)
      .order('created_at', { ascending: false });

    if (versionsError) {
      console.error('Error fetching versions:', versionsError);
      return NextResponse.json({ error: versionsError.message || 'Failed to fetch versions' }, { status: 500 });
    }

    return NextResponse.json({ versions: versions || [] });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('List versions error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
