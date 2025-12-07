import React, { useEffect } from 'react';
import Image from 'next/image';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/Components';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CheckEmailProps {
    email?: string;
    onNavigateToLogin: () => void;
    onVerified: () => void;
}

export const CheckEmail: React.FC<CheckEmailProps> = ({ email, onNavigateToLogin, onVerified }) => {
    const { session } = useAuth();

    useEffect(() => {
        if (session) {
            onVerified();
        }
    }, [session, onVerified]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-paper via-paleslate to-azure/5 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-azure/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-highlight/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Back button */}
                <button
                    onClick={onNavigateToLogin}
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </button>

                <Card className="bg-white shadow-xl border-ink/10">
                    <CardHeader className="text-center space-y-4 pb-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-azure/10 rounded-full flex items-center justify-center mb-2 animate-pulse">
                                <Mail size={32} className="text-azure" />
                            </div>
                        </div>
                        <div>
                            <CardTitle className="text-2xl mb-2">Check your inbox</CardTitle>
                            <p className="text-sm text-ink/60 font-medium">
                                We've sent a verification link to<br />
                                {email ? <span className="text-ink font-bold">{email}</span> : 'your email address'}
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 text-center">
                        <div className="bg-paleslate/50 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-3">
                                <Loader2 size={18} className="text-azure animate-spin" />
                                <span className="text-sm font-medium text-ink/70">Waiting for verification...</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-ink/50">
                                Click the link in the email to sign in automatically.
                                <br />
                                If you don't keep this tab open, you can sign in normally after verifying.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-ink/5">
                            <p className="text-sm text-ink/60">
                                Didn't receive the email?{' '}
                                <button
                                    onClick={onNavigateToLogin}
                                    className="text-azure hover:text-azure-hover font-bold transition-colors"
                                >
                                    Try again
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
