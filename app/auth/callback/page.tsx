'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { ResonateLoader } from '../../../components/ResonateLoader';

export default function AuthCallback() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            const { error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error during authentication:', error);
                setIsLoading(false);
                router.push('/login?error=auth_failed');
            } else {
                // Wait 4 seconds before redirecting to dashboard
                setTimeout(() => {
                    setIsLoading(false);
                    router.push('/verified');
                }, 4000);
            }
        };

        handleCallback();
    }, [router]);

    if (isLoading) {
        return <ResonateLoader />;
    }

    return null;
}
