import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const { supabase, user } = await getAuthenticatedClient(req);
        const { id, is_active } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        if (typeof is_active !== 'boolean') {
            return NextResponse.json({ error: 'is_active status is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('memories')
            .update({ is_active })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Memory toggle error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
