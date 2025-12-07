import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const { supabase, user } = await getAuthenticatedClient(req);

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Persona ID is required' }, { status: 400 });
        }

        // Delete the identity
        const { error } = await supabase
            .from('identities')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Persona delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
