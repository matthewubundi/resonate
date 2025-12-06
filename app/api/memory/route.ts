import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  // Auth Check - support both Authorization header and cookies
  const authHeader = req.headers.get('authorization');
  let user;
  let supabase;

  if (authHeader?.startsWith('Bearer ')) {
    // Client-side session: use token from Authorization header
    const token = authHeader.substring(7);
    const cookieSupabase = await createClient();

    // Verify the user first
    const { data: { user: tokenUser }, error } = await cookieSupabase.auth.getUser(token);
    if (error || !tokenUser) {
      console.error('Auth error with Bearer token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    user = tokenUser;

    // Create a client with service role for server-side queries (bypasses RLS)
    // We've already verified the user, so this is safe
    supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  } else {
    // Server-side session: use cookies
    supabase = await createClient();
    const { data: { user: cookieUser } } = await supabase.auth.getUser();
    if (!cookieUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    user = cookieUser;
  }

  try {
    const { data, error } = await supabase
      .from('memories')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [] });

  } catch (error: any) {
    console.error('Memory fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

