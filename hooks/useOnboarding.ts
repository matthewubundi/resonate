import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface UseOnboardingReturn {
  onboardingCompleted: boolean | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useOnboarding = (user: User | null): UseOnboardingReturn => {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(() => {
    // Try to get cached value from sessionStorage
    if (typeof window !== 'undefined' && user) {
      const cached = sessionStorage.getItem(`onboarding_${user.id}`);
      if (cached !== null) {
        return cached === 'true';
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastUserId = useRef<string | null>(null);

  const checkOnboardingStatus = async () => {
    if (!user) {
      setOnboardingCompleted(null);
      setLoading(false);
      sessionStorage.removeItem(`onboarding_${lastUserId.current}`);
      return;
    }

    // Check cache first
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(`onboarding_${user.id}`);
      if (cached !== null && lastUserId.current === user.id) {
        // Use cached value and skip database query
        setOnboardingCompleted(cached === 'true');
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        // If profile doesn't exist yet, assume onboarding not completed
        if (fetchError.code === 'PGRST116') {
          setOnboardingCompleted(false);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`onboarding_${user.id}`, 'false');
          }
        } else {
          throw fetchError;
        }
      } else {
        const completed = data?.onboarding_completed ?? false;
        setOnboardingCompleted(completed);
        // Cache the result
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`onboarding_${user.id}`, completed.toString());
        }
      }
      setError(null);
    } catch (err) {
      setError(err as Error);
      setOnboardingCompleted(false);
    } finally {
      setLoading(false);
      lastUserId.current = user.id;
    }
  };

  useEffect(() => {
    // Only fetch if user changed or we don't have a cached value
    if (!user) {
      setOnboardingCompleted(null);
      setLoading(false);
      return;
    }

    // If user ID changed, fetch new data
    if (lastUserId.current !== user.id) {
      checkOnboardingStatus();
    } else if (onboardingCompleted === null) {
      // Only fetch if we don't have a value yet
      checkOnboardingStatus();
    } else {
      // We already have data for this user, no need to fetch
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user ID, not the entire user object

  return { onboardingCompleted, loading, error, refetch: checkOnboardingStatus };
};

