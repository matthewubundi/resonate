import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuthenticatedClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isDemoMode } from '@/lib/demo';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || (isDemoMode ? 'sk_test_demo' : ''), {
    apiVersion: '2025-11-17.clover',
});

export async function POST(req: Request) {
    try {
        if (isDemoMode) {
            return NextResponse.json({
                url: '/settings?tab=Billing&demo=portal-simulated',
                demo: true,
                message: 'Demo mode simulates the Stripe billing portal.',
            });
        }

        const { user } = await getAuthenticatedClient(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the customer ID from profiles
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
        }

        const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create a portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${domain}/settings?tab=Billing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating portal session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
