import React, { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/Components';
import { Lock, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageView } from '../types';

interface ResetPasswordProps {
    onNavigate: (page: PageView) => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
    const { updatePassword, session } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [hashError, setHashError] = useState<string | null>(null);

    useEffect(() => {
        // Parse URL hash for errors (e.g. link expired)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDescription = hashParams.get('error_description');
        const errorCode = hashParams.get('error_code');

        if (errorDescription) {
            setHashError(errorDescription.replace(/\+/g, ' '));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        const { error: updateError } = await updatePassword(password);

        if (updateError) {
            setError(updateError.message);
            setIsLoading(false);
        } else {
            setSuccess(true);
            setIsLoading(false);
            // Redirect to dashboard after a few seconds
            setTimeout(() => {
                onNavigate('dashboard');
            }, 3000);
        }
    };

    // If there's a hash error (link expired, etc), show it
    if (hashError) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-paper via-paleslate to-azure/5 p-4">
                <div className="relative w-full max-w-md">
                    <button
                        onClick={() => onNavigate('login')}
                        className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </button>
                    <Card className="bg-white shadow-xl border-red-100">
                        <CardHeader className="text-center space-y-4 pb-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-red-700">Link Invalid or Expired</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-6">
                            <p className="text-ink/60">{hashError}</p>
                            <Button onClick={() => onNavigate('login')} className="w-full bg-azure hover:bg-azure-hover">
                                Request New Link
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Success View
    if (success) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-paper via-paleslate to-azure/5 p-4">
                <div className="relative w-full max-w-md">
                    <Card className="bg-white shadow-xl border-green-100">
                        <CardHeader className="text-center space-y-4 pb-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2 animate-bounce">
                                    <CheckCircle size={32} className="text-green-500" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-green-700">Password Updated</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-6">
                            <p className="text-ink/60">Your password has been changed successfully. Redirecting...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-paper via-paleslate to-azure/5 p-4">
            <div className="relative w-full max-w-md">
                <button
                    onClick={() => onNavigate('login')}
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </button>
                <Card className="bg-white shadow-xl border-ink/10">
                    <CardHeader className="text-center space-y-4 pb-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-azure/10 rounded-full flex items-center justify-center mb-2">
                                <Lock size={32} className="text-azure" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Set New Password</CardTitle>
                        <p className="text-sm text-ink/60">
                            Enter your new password below.
                        </p>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                                <AlertCircle size={18} className="text-red-600 mt-0.5" />
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="peer w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-azure focus:ring-1 focus:ring-azure transition-all placeholder-transparent"
                                        placeholder="New Password"
                                        required
                                        minLength={6}
                                    />
                                    <label
                                        htmlFor="password"
                                        className="absolute left-3 -top-2.5 text-xs text-slate-500 bg-white px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-azure pointer-events-none"
                                    >
                                        New Password
                                    </label>
                                </div>

                                <div className="relative group">
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="peer w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-azure focus:ring-1 focus:ring-azure transition-all placeholder-transparent"
                                        placeholder="Confirm Password"
                                        required
                                        minLength={6}
                                    />
                                    <label
                                        htmlFor="confirmPassword"
                                        className="absolute left-3 -top-2.5 text-xs text-slate-500 bg-white px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-azure pointer-events-none"
                                    >
                                        Confirm Password
                                    </label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-2"
                                isLoading={isLoading}
                                disabled={isLoading || !password || !confirmPassword}
                            >
                                <span className="flex items-center gap-2">
                                    Update Password <ArrowRight size={16} />
                                </span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
