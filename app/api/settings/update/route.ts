import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';
import { isDemoMode } from '@/lib/demo';

export async function POST(req: Request) {
  try {
    if (isDemoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Demo mode simulates settings updates for this session.',
      });
    }

    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    const {
      display_name,
      language,
      timezone,
      avatar_url,
      default_landing_page,
      auto_copy_to_clipboard,
      clear_input_on_success,
      history_retention_period,
    } = await req.json();

    // Update the existing profile
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: display_name, // Mapping UI 'display_name' to DB 'full_name'
        language,
        timezone,
        avatar_url,
        default_landing_page,
        auto_copy_to_clipboard,
        clear_input_on_success,
        history_retention_period,
        // updated_at: new Date().toISOString() // Uncomment if you add an updated_at column later
      })
      .eq('id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
