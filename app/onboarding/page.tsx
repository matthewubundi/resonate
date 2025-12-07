"use client";

import { useState } from 'react';
import App from "../../App";
import { PreOnboarding } from '../../components/onboarding/PreOnboarding';

export default function OnboardingPage() {
    const [hasViewedIntro, setHasViewedIntro] = useState(false);

    if (!hasViewedIntro) {
        return <PreOnboarding onComplete={() => setHasViewedIntro(true)} />;
    }

    return <App />;
}




