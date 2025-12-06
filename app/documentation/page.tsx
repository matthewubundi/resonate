'use client';

import Documentation from '@/pages/Documentation';
import { useRouter } from 'next/navigation';

export default function DocumentationPage() {
    const router = useRouter();

    return <Documentation onBack={() => router.push('/')} />;
}
