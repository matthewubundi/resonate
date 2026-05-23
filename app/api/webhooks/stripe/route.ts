
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isDemoMode } from '@/lib/demo';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || (isDemoMode ? 'sk_test_demo' : ''), {
    apiVersion: '2025-11-17.clover',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    if (isDemoMode) {
        return NextResponse.json({ received: true, demo: true });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const subscriptionId = session.subscription as string;

                // Metadata contains userId
                const userId = session.metadata?.userId;
                const customerId = session.customer as string;

                if (userId && subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = subscription.items.data[0].price.id;

                    let tier = 'pro'; // Default to pro if unknown, or fallback logic
                    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_POWER) {
                        tier = 'power';
                    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO) {
                        tier = 'pro';
                    }

                    // Note: Stripe dates are unix timestamps (seconds)
                    // Note: Stripe dates are unix timestamps (seconds)
                    const currentPeriodEnd = (subscription as any).current_period_end
                        ? new Date((subscription as any).current_period_end * 1000).toISOString()
                        : new Date(Date.now() + 86400000 * 30).toISOString(); // Fallback to 30 days from now

                    await supabaseAdmin.from('profiles').update({
                        stripe_customer_id: customerId,
                        subscription_status: subscription.status,
                        subscription_tier: tier as 'free' | 'pro' | 'power',
                        current_period_end: currentPeriodEnd,
                    }).eq('id', userId);
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription as string;
                const customerId = invoice.customer as string;

                // Ensure this is a subscription payment
                if (subscriptionId) {
                    // Retrieve latest subscription details
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = subscription.items.data[0].price.id;

                    let tier = 'pro';
                    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_POWER) {
                        tier = 'power';
                    }

                    // Find user by customer_id
                    // Note: We might have multiple users with same customer ID in some weird cases if not handled, 
                    // but typical logic assumes 1:1.
                    const { data: profile } = await supabaseAdmin
                        .from('profiles')
                        .select('id')
                        .eq('stripe_customer_id', customerId)
                        .single();

                    if (profile) {
                        await supabaseAdmin.from('profiles').update({
                            subscription_status: subscription.status,
                            subscription_tier: tier as 'free' | 'pro' | 'power',
                            current_period_end: (subscription as any).current_period_end
                                ? new Date((subscription as any).current_period_end * 1000).toISOString()
                                : new Date(Date.now() + 86400000 * 30).toISOString(),
                            transformations_usage: 0, // Reset usage on successful payment (start of new cycle)
                        }).eq('id', profile.id);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single();

                if (profile) {
                    await supabaseAdmin.from('profiles').update({
                        subscription_status: 'canceled',
                        subscription_tier: 'free',
                    }).eq('id', profile.id);
                }
                break;
            }

            // Optional: Handle 'customer.subscription.updated' to sync status (e.g. past_due)
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single();

                if (profile) {
                    // Determine tier again in case of upgrade/downgrade via Stripe portal
                    const priceId = subscription.items.data[0].price.id;
                    let tier = 'free';
                    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_POWER) tier = 'power';
                    else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO) tier = 'pro';

                    // Only update if it's not canceled (deleted event handles that, though updated might fire before deleted)
                    if (subscription.status !== 'canceled') {
                        await supabaseAdmin.from('profiles').update({
                            subscription_status: subscription.status,
                            subscription_tier: tier as 'free' | 'pro' | 'power',
                            current_period_end: (subscription as any).current_period_end
                                ? new Date((subscription as any).current_period_end * 1000).toISOString()
                                : new Date(Date.now() + 86400000 * 30).toISOString(),
                        }).eq('id', profile.id);
                    }
                }
                break;
            }
        }
    } catch (error: any) {
        console.error(`Error processing webhook event ${event.type}:`, error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
