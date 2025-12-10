
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserSettings {
    defaultLandingPage: string;
    autoCopy: boolean;
    clearInput: boolean;
    historyRetention: string;
}

export function useSettings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings>({
        defaultLandingPage: 'dashboard',
        autoCopy: false,
        clearInput: false,
        historyRetention: 'forever',
    });
    const [loading, setLoading] = useState(true);
    const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setLoadedUserId(null);
            return;
        }

        setLoading(true);
        let isMounted = true;

        async function fetchSettings() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('default_landing_page, auto_copy_to_clipboard, clear_input_on_success, history_retention_period')
                    .eq('id', user!.id)
                    .single();

                if (error) {
                    console.error('Error fetching settings:', error);
                } else if (data) {
                    if (isMounted) {
                        setSettings({
                            defaultLandingPage: data.default_landing_page || 'dashboard',
                            autoCopy: data.auto_copy_to_clipboard || false,
                            clearInput: data.clear_input_on_success || false,
                            historyRetention: data.history_retention_period || 'forever',
                        });
                    }
                }
            } catch (err) {
                console.error('Exception fetching settings:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setLoadedUserId(user!.id);
                }
            }
        }

        fetchSettings();

        return () => {
            isMounted = false;
        };
    }, [user]);

    // Use derived state to prevent race conditions where user exists but settings aren't loaded for them yet
    const isSettingsStale = user?.id !== loadedUserId;
    const effectiveLoading = loading || (!!user && isSettingsStale);

    return { settings, loading: effectiveLoading };
}
