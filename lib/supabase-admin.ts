import { createClient } from '@supabase/supabase-js';
import { isDemoMode } from './demo';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (isDemoMode ? 'https://demo.supabase.co' : '');
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || (isDemoMode ? 'demo-service-role-key' : '');

if (!isDemoMode && (!supabaseUrl || !supabaseServiceRoleKey)) {
    // We don't throw immediately to allow build, but runtime will fail if used
    console.warn('Supabase Admin credentials missing for server usage.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
