import React, { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/Components';
import { Cpu, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
    onLogin: () => void;
    onNavigateToSignup: () => void;
    onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignup, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);

    const { signIn, signInWithGoogle, signInWithGithub, resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
            setError(signInError.message);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            onLogin();
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        const { error: googleError } = await signInWithGoogle();
        if (googleError) {
            setError(googleError.message);
        }
    };

    const handleGithubSignIn = async () => {
        setError(null);
        const { error: githubError } = await signInWithGithub();
        if (githubError) {
            setError(githubError.message);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const { error: resetError } = await resetPassword(resetEmail);

        if (resetError) {
            setError(resetError.message);
            setIsLoading(false);
        } else {
            setResetSuccess(true);
            setIsLoading(false);
            setTimeout(() => {
                setShowResetPassword(false);
                setResetSuccess(false);
                setResetEmail('');
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-paper via-paleslate to-azure/5 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-azure/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-highlight/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Back button */}
                <button
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>

                <Card className="bg-white shadow-xl border-ink/10">
                    <CardHeader className="text-center space-y-4 pb-6">
                        <div className="flex justify-center">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-azure to-azure-hover flex items-center justify-center shadow-lg">
                                <Cpu size={28} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <CardTitle className="text-2xl mb-2">Welcome Back</CardTitle>
                            <p className="text-sm text-ink/60 font-medium">Sign in to continue to Resonate</p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-800">Authentication Error</p>
                                    <p className="text-sm text-red-600 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {showResetPassword ? (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-bold text-ink mb-2">Reset Password</h3>
                                    <p className="text-sm text-ink/60">Enter your email to receive a password reset link</p>
                                </div>

                                {resetSuccess && (
                                    <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <AlertCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-green-800">Password reset email sent! Check your inbox.</p>
                                    </div>
                                )}

                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        required
                                        className="flex h-11 w-full rounded-lg border border-ink/10 bg-paleslate pl-11 pr-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-azure focus:border-azure transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        className="flex-1"
                                        onClick={() => {
                                            setShowResetPassword(false);
                                            setResetEmail('');
                                            setError(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        className="flex-1"
                                        isLoading={isLoading}
                                    >
                                        Send Reset Link
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="flex h-11 w-full rounded-lg border border-ink/10 bg-paleslate pl-11 pr-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-azure focus:border-azure transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white"
                                            />
                                        </div>

                                        <div className="relative">
                                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="flex h-11 w-full rounded-lg border border-ink/10 bg-paleslate pl-11 pr-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-azure focus:border-azure transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-ink/20 text-azure focus:ring-azure focus:ring-offset-0 cursor-pointer"
                                            />
                                            <span className="text-ink/60 group-hover:text-ink font-medium">Remember me</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowResetPassword(true)}
                                            className="text-azure hover:text-azure-hover font-semibold transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        isLoading={isLoading}
                                    >
                                        Sign In
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-ink/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-ink/50 font-bold">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={handleGoogleSignIn}
                                        className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-ink/10 bg-paleslate hover:bg-white hover:border-ink/20 transition-all text-sm font-semibold text-ink"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleGithubSignIn}
                                        className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-ink/10 bg-paleslate hover:bg-white hover:border-ink/20 transition-all text-sm font-semibold text-ink"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                        </svg>
                                        GitHub
                                    </button>
                                </div>

                                <div className="text-center pt-4 border-t border-ink/5">
                                    <p className="text-sm text-ink/60">
                                        Don't have an account?{' '}
                                        <button
                                            onClick={onNavigateToSignup}
                                            className="text-azure hover:text-azure-hover font-bold transition-colors"
                                        >
                                            Sign up
                                        </button>
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-ink/40 mt-6">
                    By continuing, you agree to our{' '}
                    <a href="#" className="text-ink/60 hover:text-azure font-semibold">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-ink/60 hover:text-azure font-semibold">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
};
