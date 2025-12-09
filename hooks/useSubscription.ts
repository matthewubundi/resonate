
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type SubscriptionTier = 'free' | 'pro' | 'power';

export function useSubscription() {
    const { user } = useAuth();
    const [tier, setTier] = useState<SubscriptionTier | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTier(null);
            setLoading(false);
            return;
        }

        let isMounted = true;

        async function fetchSubscription() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('subscription_tier')
                    .eq('id', user!.id)
                    .single();

                if (error) {
                    console.error('Error fetching subscription:', error);
                    if (isMounted) setTier('free'); // Default to free on error
                } else if (data) {
                    if (isMounted) setTier((data.subscription_tier as SubscriptionTier) || 'free');
                }
            } catch (err) {
                console.error('Exception fetching subscription:', err);
                if (isMounted) setTier('free');
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchSubscription();

        return () => {
            isMounted = false;
        };
    }, [user]);

    return { tier, loading };
}
