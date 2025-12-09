'use client';

import Documentation from '@/views/Documentation';
import { useRouter } from '@/src/i18n/navigation';

export default function DocumentationPage() {
    const router = useRouter();

    return <Documentation onBack={() => router.push('/')} />;
}
