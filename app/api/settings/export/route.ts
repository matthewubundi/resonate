import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
    demoIdentityVersions,
    demoMemories,
    demoPersonas,
    demoProfile,
    demoTransformations,
    demoUser,
    isDemoMode,
} from '@/lib/demo';

export async function GET(req: NextRequest) {
    try {
        if (isDemoMode) {
            return NextResponse.json({
                profiles: [demoProfile],
                identities: demoPersonas,
                memories: demoMemories,
                transformations: demoTransformations,
                identity_versions: demoIdentityVersions,
                metadata: {
                    export_date: new Date().toISOString(),
                    user_id: demoUser.id,
                    version: 'demo-1.0',
                    demo: true,
                },
            });
        }

        // Get the authorization header from the request
        const authHeader = req.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
        }

        // Initialize Supabase client with the user's auth token
        // This ensures RLS policies are applied automatically
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    Authorization: authHeader,
                },
            },
        });

        // Verify the user exists (double check)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Specific tables and their public-facing columns
        const tableConfig: Record<string, string> = {
            profiles: 'full_name, email, theme, language, timezone, avatar_url',
            identities: 'name, identity_json, is_active',
            memories: 'content, is_active, created_at',
            transformations: 'input_text, final_output, alignment_score, model_used, created_at',
            identity_versions: 'identity_json, change_summary, created_at'
        };

        const exportData: Record<string, any> = {};

        // Helper to clean internal fields from JSON objects (like _disabled_rules)
        const cleanJson = (obj: any): any => {
            if (Array.isArray(obj)) return obj.map(cleanJson);
            if (obj && typeof obj === 'object') {
                const newObj: any = {};
                for (const key in obj) {
                    // Remove keys starting with underscore (internal state)
                    if (!key.startsWith('_')) {
                        newObj[key] = cleanJson(obj[key]);
                    }
                }
                return newObj;
            }
            return obj;
        };

        // Fetch data from each table
        for (const [table, columns] of Object.entries(tableConfig)) {
            const { data, error } = await supabase
                .from(table)
                .select(columns);

            if (error) {
                console.error(`Error fetching ${table}:`, error);
                exportData[table] = { error: error.message };
            } else {
                // Apply specialized cleaning
                if (table === 'identities' || table === 'identity_versions') {
                    exportData[table] = data.map((item: any) => ({
                        ...item,
                        identity_json: item.identity_json ? cleanJson(item.identity_json) : null
                    }));
                } else {
                    exportData[table] = data;
                }
            }
        }

        // Add metadata
        exportData.metadata = {
            export_date: new Date().toISOString(),
            user_id: user.id,
            version: '1.0'
        };

        return NextResponse.json(exportData);
    } catch (error: any) {
        console.error('Export error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
