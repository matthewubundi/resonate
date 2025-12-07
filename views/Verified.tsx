import React, { useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/Components';
import { Check, ShieldCheck, ArrowRight } from 'lucide-react';
import Confetti from 'react-confetti';
import { useAuth } from '../contexts/AuthContext';

interface VerifiedProps {
    onNavigateToDashboard: () => void;
}

export const Verified: React.FC<VerifiedProps> = ({ onNavigateToDashboard }) => {
    const { user } = useAuth();
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        // Set initial window size
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });

        // Handle window resize
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);

        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-paper via-paleslate to-azure/5 p-4 overflow-hidden">
            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} colors={['#2563EB', '#1e40af', '#60a5fa', '#3b82f6', '#93c5fd']} />}

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-azure/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-highlight/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md z-10">
                <Card className="bg-white shadow-xl border-ink/10 animate-fade-in-up">
                    <CardHeader className="text-center space-y-4 pb-6">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2 animate-bounce-soft">
                                    <ShieldCheck size={40} className="text-green-600" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                                    <div className="bg-azure text-white p-1 rounded-full">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <CardTitle className="text-2xl mb-2 text-ink">Email Verified!</CardTitle>
                            <p className="text-sm text-ink/60 font-medium">
                                Your identity has been authenticated.<br />
                                You're all set to start using Resonate.
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="bg-paleslate/30 rounded-lg p-4 border border-ink/5">
                            <p className="text-xs text-center text-ink/70 leading-relaxed">
                                {user?.email ? (
                                    <>
                                        Verified account for <span className="font-bold text-ink">{user.email}</span>.
                                    </>
                                ) : (
                                    "Your email address has been successfully confirmed."
                                )}
                            </p>
                        </div>

                        <Button
                            onClick={onNavigateToDashboard}
                            size="lg"
                            className="w-full group"
                        >
                            Continue to Dashboard
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
