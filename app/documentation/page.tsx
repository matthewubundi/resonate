'use client';

import Documentation from '@/views/Documentation';
import { useRouter } from 'next/navigation';

export default function DocumentationPage() {
    const router = useRouter();

    return <Documentation onBack={() => router.push('/')} />;
}
