import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface UseOnboardingReturn {
  onboardingCompleted: boolean | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useOnboarding = (user: User | null): UseOnboardingReturn => {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkOnboardingStatus = async () => {
    if (!user) {
      setOnboardingCompleted(null);
      setLoading(false);
      return;
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
        } else {
          throw fetchError;
        }
      } else {
        setOnboardingCompleted(data?.onboarding_completed ?? false);
      }
      setError(null);
    } catch (err) {
      setError(err as Error);
      setOnboardingCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  return { onboardingCompleted, loading, error, refetch: checkOnboardingStatus };
};

