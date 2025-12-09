import React from 'react';
import { Lock, Check, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { SubscriptionTier } from '../hooks/useSubscription';
import { useRouter } from 'next/navigation';

interface UpgradeGateProps {
    requiredTier: SubscriptionTier;
    isLocked: boolean;
    children: React.ReactNode;
}

export const UpgradeGate: React.FC<UpgradeGateProps> = ({ requiredTier, isLocked, children }) => {
    const isPower = requiredTier === 'power';
    const router = useRouter();

    if (!isLocked) {
        return <>{children}</>;
    }

    const benefits = isPower ? [
        "Unlimited Transformations",
        "Advanced Analytics Dashboard",
        "Unlimited Personas",
        "Priority Support"
    ] : [
        "2,000 Transformations/mo",
        "Long-term Memory Access",
        "5 Personas",
        "Gemini 2.5 Flash Speed"
    ];

    return (
        <div className="relative w-full min-h-screen">
            {/* Background Content (Blurred) */}
            <div className="filter blur-[8px] opacity-40 select-none pointer-events-none" aria-hidden="true">
                {children}
            </div>

            {/* Glass Overlay Tint */}
            <div className="absolute inset-0 bg-slate-500/10 backdrop-blur-[2px] z-0" />

            {/* Premium Modal Container */}
            <div className="absolute inset-0 z-50 pointer-events-none">
                <div className="sticky top-0 h-screen w-full flex items-center justify-center pointer-events-auto p-4">
                    <div className="w-full max-w-lg bg-paper rounded-2xl shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up">

                        {/* Top Accent Gradient */}
                        <div className="h-2 w-full bg-azure" />

                        <div className="p-8 md:p-10 flex flex-col items-center text-center">
                            {/* Lock Icon */}
                            <div className="w-16 h-16 bg-azure/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-azure/20">
                                <Lock className="text-azure" size={32} strokeWidth={2.5} />
                            </div>

                            <h2 className="text-3xl font-black text-ink mb-3 tracking-tight">
                                Master Your Identity
                            </h2>

                            <p className="text-ink/60 mb-8 max-w-sm text-lg">
                                Unlock the full power of your digital twin with <span className="font-bold text-ink">{isPower ? 'Power' : 'Pro'}</span> access.
                            </p>

                            {/* Benefits Checklist */}
                            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 mb-8 text-left space-y-3">
                                {benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-azure flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-white" strokeWidth={3} />
                                        </div>
                                        <span className="text-ink/80 font-medium text-sm">{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => router.push('/settings?tab=Billing')}
                                className="w-full py-4 px-6 bg-azure hover:bg-azure-hover text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-azure/30 hover:-translate-y-0.5 transition-all duration-200 mb-6 flex items-center justify-center gap-2"
                            >
                                Upgrade Now
                            </button>

                            {/* Exit Strategy */}
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="text-ink/40 hover:text-ink/70 font-medium text-sm flex items-center gap-2 transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
