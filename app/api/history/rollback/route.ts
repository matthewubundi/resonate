import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    const { version_id } = await req.json();

    if (!version_id) {
      return NextResponse.json({ error: 'version_id is required' }, { status: 400 });
    }

    // Get the JSON from the backup version (RLS ensures user can only see their own)
    const { data: backup, error: backupError } = await supabase
      .from('identity_versions')
      .select('identity_id, identity_json')
      .eq('id', version_id)
      .single();

    if (backupError || !backup) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Verify that the identity belongs to the user (RLS already ensures this, but double-check)
    const { data: identity, error: identityError } = await supabase
      .from('identities')
      .select('user_id')
      .eq('id', backup.identity_id)
      .single();

    if (identityError || !identity || identity.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized: Version does not belong to user' }, { status: 403 });
    }

    // Overwrite the live identity with the backup JSON (RLS ensures user can only update their own)
    const { error } = await supabase
      .from('identities')
      .update({ 
        identity_json: backup.identity_json,
        updated_at: new Date().toISOString()
      })
      .eq('id', backup.identity_id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating identity:', error);
      return NextResponse.json({ error: error.message || 'Failed to restore version' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Rollback error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
