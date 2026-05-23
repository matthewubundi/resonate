import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';
import { isDemoMode } from '@/lib/demo';

export async function DELETE(req: Request) {
  try {
    if (isDemoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Demo mode simulates deletion without removing seeded data.',
      });
    }

    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    // RLS ensures user can only delete their own memories
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Memory delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
