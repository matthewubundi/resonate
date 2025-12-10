import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client using cookie-based authentication.
 * Use this for server components and API routes without Bearer tokens.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client using a Bearer token for authentication.
 * The token is passed in the Authorization header for all requests,
 * enabling RLS policies to work via auth.uid().
 */
export function createClientWithToken(accessToken: string) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Helper to get authenticated Supabase client from API request.
 * Supports both cookie-based auth and Bearer token auth.
 * Returns { supabase, user } or throws an error if unauthorized.
 */
export async function getAuthenticatedClient(req: Request) {
  const authHeader = req.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    // Bearer token authentication
    const token = authHeader.substring(7);

    // Create a client with the token for RLS
    const supabase = createClientWithToken(token);

    // Verify the token and get the user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('Unauthorized');
    }

    return { supabase, user };
  } else {
    // Cookie-based authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    return { supabase, user };
  }
}
