import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/utils/supabase/server';
import { demoPersonas, isDemoMode } from '@/lib/demo';

export async function POST(req: Request) {
    try {
        if (isDemoMode) {
            const { id } = await req.json();
            const source = demoPersonas.find((persona) => persona.id === id) || demoPersonas[0];
            return NextResponse.json({
                success: true,
                demo: true,
                persona: {
                    ...source,
                    id: `identity-demo-copy-${Date.now()}`,
                    name: `Copy of ${source.name}`,
                    is_active: false,
                },
            });
        }

        // Auth Check
        const { supabase, user } = await getAuthenticatedClient(req);

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Source persona ID is required' }, { status: 400 });
        }

        // Fetch the source identity to specificially verify ownership and get data
        const { data: sourceIdentity, error: fetchError } = await supabase
            .from('identities')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !sourceIdentity) {
            return NextResponse.json({ error: 'Persona not found or access denied' }, { status: 404 });
        }

        // Create new identity JSON with updated name
        // We try to handle both top-level name and nested identity_json name if they exist
        const oldName = sourceIdentity.name || sourceIdentity.identity_json?.name || 'Persona';
        const newName = `Copy of ${oldName}`;

        const newIdentityJson = {
            ...sourceIdentity.identity_json,
            name: newName
        };

        // Insert new identity
        const { data, error: insertError } = await supabase
            .from('identities')
            .insert({
                user_id: user.id,
                identity_json: newIdentityJson,
                name: newName,
                is_active: false // Duplicates are inactive by default
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, persona: data });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Persona duplicate error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
