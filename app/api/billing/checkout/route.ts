
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
});

export async function POST(req: Request) {
    try {
        const { priceId, userId } = await req.json();

        if (!priceId || !userId) {
            return NextResponse.json({ error: 'Missing priceId or userId' }, { status: 400 });
        }

        const { user } = await getAuthenticatedClient(req);

        if (user.id !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch existing Stripe customer ID from profile
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        const customerId = profile?.stripe_customer_id;
        const email = user.email;

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Ensure origin has protocol
        const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${baseUrl}/settings?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/settings`,
            metadata: {
                userId: user.id,
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                },
            },
            allow_promotion_codes: true,
        };

        if (customerId) {
            sessionParams.customer = customerId;
        } else if (email) {
            sessionParams.customer_email = email;
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
