'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ResonateLoader } from '@/components/ResonateLoader';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            const { error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error during authentication:', error);
                setIsLoading(false);
                router.push('/login?error=auth_failed');
            } else {
                // Get the next path from params, default to dashboard
                const next = searchParams.get('next') || '/dashboard';

                // Wait 2 seconds before redirecting to show the loader a bit
                setTimeout(() => {
                    setIsLoading(false);
                    router.push(next);
                }, 2000);
            }
        };

        handleCallback();
    }, [router, searchParams]);

    if (isLoading) {
        return <ResonateLoader />;
    }

    return null;
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<ResonateLoader />}>
            <CallbackContent />
        </Suspense>
    );
}
