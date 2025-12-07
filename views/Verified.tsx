import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/Components';
import { Check, Fingerprint, Lock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface VerifiedProps {
    onNavigateToDashboard: () => void;
}

export const Verified: React.FC<VerifiedProps> = () => {
    const { user } = useAuth();
    const [scanState, setScanState] = useState<'waiting' | 'scanning' | 'complete'>('waiting');

    useEffect(() => {
        // Start scanning sequence
        const scanTimer = setTimeout(() => setScanState('scanning'), 500);
        const completeTimer = setTimeout(() => setScanState('complete'), 2000);

        return () => {
            clearTimeout(scanTimer);
            clearTimeout(completeTimer);
        };
    }, []);

    const handleCloseWindow = () => {
        window.close();
        // Fallback if window.close() is blocked
        alert("Please close this tab to continue.");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-paleslate p-4 relative overflow-hidden">
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.03)_100%)]"></div>

            <div className="relative w-full max-w-sm z-10">
                <Card className="bg-paper shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden">
                    {/* Visual Anchor: Dot Grid Pattern */}
                    <div className="absolute top-0 left-0 right-0 h-32 opacity-[0.03]"
                        style={{
                            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                            backgroundSize: '16px 16px'
                        }}
                    ></div>

                    <CardHeader className="text-center space-y-6 pt-12 pb-2 relative z-10">
                        {/* Animated Icon Container */}
                        <div className="flex justify-center mb-4">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                {/* Base Grey Icon */}
                                <Fingerprint
                                    size={64}
                                    className="text-slate-200 absolute inset-0 m-auto"
                                    strokeWidth={1.5}
                                />

                                {/* Scanning Azure Icon (Clipped) */}
                                <div
                                    className={`absolute inset-0 m-auto w-16 h-16 overflow-hidden transition-all duration-[1500ms] ease-in-out ${scanState === 'waiting' ? 'h-0 opacity-0' : 'h-16 opacity-100'
                                        }`}
                                >
                                    <Fingerprint
                                        size={64}
                                        className="text-azure"
                                        strokeWidth={1.5}
                                    />
                                </div>

                                {/* Mint Success Badge */}
                                <div
                                    className={`absolute -bottom-1 -right-1 bg-paper p-1 rounded-full shadow-md border border-slate-100 transition-all duration-500 delay-300 transform ${scanState === 'complete' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                                        }`}
                                >
                                    <div className="bg-[#4ADE80] text-white p-1 rounded-full">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-ink tracking-tight">
                                Identity Authenticated
                            </h2>
                            <div className="flex justify-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-paleslate rounded-full border border-slate-200">
                                    <Lock size={12} className="text-ink/40" />
                                    <span className="font-mono text-xs text-ink/60">
                                        {user?.email || "verified-user@example.com"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8 pb-10 text-center relative z-10">
                        <div className="space-y-4 px-4">
                            <p className="text-sm text-ink/60 leading-relaxed">
                                Secure connection established. You may now close this tab and <span className="font-semibold text-ink">return to the application</span>.
                            </p>
                        </div>

                        {/* Optional Close Button (for user convenience, though browser might block) */}
                        <div>
                            <button
                                onClick={handleCloseWindow}
                                className="text-xs text-ink/40 hover:text-ink/70 transition-colors inline-flex items-center gap-1.5 py-2 px-4 rounded-md hover:bg-paleslate"
                            >
                                <X size={12} />
                                Close Window
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
