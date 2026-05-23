import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isDemoMode } from '@/lib/demo';

export async function POST(req: Request) {
    try {
        if (isDemoMode) {
            return NextResponse.json({
                success: true,
                demo: true,
                message: 'Demo mode simulates account deletion without deleting seeded data.',
            });
        }

        // 1. Verify Authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the user token
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;

        // 2. Delete Data in Order
        // Using service role key bypasses RLS but we must respect FK constraints by deleting children first.

        // Delete Memories
        const { error: memError } = await supabaseAdmin
            .from('memories')
            .delete()
            .eq('user_id', userId);
        if (memError) {
            console.error('Error deleting memories:', memError);
            throw new Error('Failed to clean up memories');
        }

        // Delete Transformations
        const { error: transError } = await supabaseAdmin
            .from('transformations')
            .delete()
            .eq('user_id', userId);
        if (transError) {
            console.error('Error deleting transformations:', transError);
            throw new Error('Failed to clean up transformations');
        }

        // Delete Identities (Versions should cascade if configured, but safe to delete parents)
        // Note: If identity_versions don't cascade, this will fail. Schema says:
        // "identity_id uuid references identities(id) on delete cascade not null"
        // So deleting identities is safe.
        const { error: idError } = await supabaseAdmin
            .from('identities')
            .delete()
            .eq('user_id', userId);
        if (idError) {
            console.error('Error deleting identities:', idError);
            throw new Error('Failed to clean up identities');
        }

        // Delete Profile
        // Note: transformations and identities must be gone first (checked above).
        const { error: profError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);
        if (profError) {
            console.error('Error deleting profile:', profError);
            throw new Error('Failed to clean up profile');
        }

        // 3. Delete Auth User
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteError) {
            console.error('Error deleting auth user:', deleteError);
            throw new Error('Failed to delete auth user');
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete account error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete account' }, { status: 500 });
    }
}
