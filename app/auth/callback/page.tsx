'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const { error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error during authentication:', error);
                router.push('/login?error=auth_failed');
            } else {
                // Redirect to dashboard on successful authentication
                router.push('/dashboard');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-paper via-paleslate to-azure/5">
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={48} className="text-azure animate-spin" />
                <p className="text-ink/60 font-medium">Completing authentication...</p>
            </div>
        </div>
    );
}
