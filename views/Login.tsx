import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '../components/Components';
import { Mail, Lock, ArrowLeft, AlertCircle, FileJson, ArrowRight, Github } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageView } from '../types';

interface LoginProps {
    onLogin: () => void;
    onNavigateToSignup: () => void;
    onBack: () => void;
    onNavigate: (page: PageView) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignup, onBack, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [gravatarUrl, setGravatarUrl] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);

    const { signIn, signInWithGoogle, signInWithGithub, resetPassword } = useAuth();

    // Check for remembered email on mount
    useEffect(() => {
        const remembered = localStorage.getItem('resonate_user_email');
        if (remembered) {
            setEmail(remembered);
            setRememberMe(true);
        }
    }, []);

    // Mock Gravatar/Avatar lookup
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (email.includes('@') && email.length > 5) {
                // Determine if we should show a mock avatar based on email content for demo purposes
                // In a real app, this would query a service or compute md5 for gravatar
                // Here we just toggle it on for visual feel if it looks like a valid email
                const isValidish = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                if (isValidish) {
                    // Just a random avatar for the "Micro-interaction" feel
                    setGravatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`);
                } else {
                    setGravatarUrl(null);
                }
            } else {
                setGravatarUrl(null);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
            setError(signInError.message);
            setIsLoading(false);
        } else {
            if (rememberMe) {
                localStorage.setItem('resonate_user_email', email);
            } else {
                localStorage.removeItem('resonate_user_email');
            }
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
        <div className="min-h-screen w-full flex bg-paper animate-fade-in">
            {/* Left Pane: The Identity Vault */}
            <div className="hidden lg:flex flex-col relative w-1/2 bg-ink overflow-hidden p-12 justify-between">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-azure/20 via-transparent to-transparent opacity-60 pointer-events-none"></div>
                {/* Mesh Pattern Background */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="mesh" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="#2563EB" strokeWidth="0.5" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#mesh)" />
                    </svg>
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <Image src="/Resonate-Logo.png" alt="Resonate Logo" width={64} height={64} className="w-16 h-16 opacity-90" />
                        {/* Assuming white logo needed, using filter if image is dark, or just text */}
                        <span className="text-azure text-4xl font-bold tracking-tight">Resonate</span>
                    </div>
                </div>

                {/* Center Visual: Glass Card */}
                <div className="relative z-10 flex items-center justify-center flex-1">
                    <div className="relative w-64 h-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform rotate-y-12 hover:rotate-y-0 transition-transform duration-700 flex flex-col items-center justify-center group perspective-1000">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-azure/20 blur-3xl -z-10 rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-700"></div>

                        <div className="w-20 h-20 bg-ink/50 rounded-xl flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <FileJson size={40} className="text-azure drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-white/80 font-mono text-sm">identity.json</p>
                            <div className="flex gap-1 justify-center mt-2">
                                <span className="block w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                <span className="block w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                <span className="block w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Quote */}
                <div className="relative z-10">
                    <p className="text-2xl font-light text-white leading-relaxed">
                        "Your voice, <span className="text-azure font-medium">unmistakably preserved.</span>"
                    </p>
                </div>
            </div>

            {/* Right Pane: The Access Terminal */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16 relative">
                {/* Vertical Divider Line */}
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-slate-200"></div>

                <div className="w-full max-w-md space-y-8">
                    {/* Back Button */}
                    <button
                        onClick={onBack}
                        className="absolute top-8 left-8 lg:left-16 flex items-center gap-2 text-sm font-medium text-ink/40 hover:text-azure transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>

                    <div className="pt-8">
                        <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Access Your Identity Layer</h1>
                        <p className="text-ink/60 mb-4">Enter your credentials to synchronize.</p>
                    </div>

                    <div className="p-4 bg-azure/5 border border-azure/20 rounded-xl flex gap-3 text-sm text-azure leading-relaxed">
                        <div className="mt-0.5 text-base flex-shrink-0">💡</div>
                        <div>
                            <span className="font-semibold">Demo Sandbox Active:</span> This app runs entirely in your browser using local storage. Use any email and password to log in, or click a social provider for instant access.
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-in slide-in-from-top-2">
                            <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-red-900">Access Denied</p>
                                <p className="text-sm text-red-700 mt-0.5">{error}</p>
                            </div>
                        </div>
                    )}

                    {showResetPassword ? (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="border-b-2 border-azure/20 pb-4 mb-6">
                                <h3 className="text-lg font-bold text-ink">Reset Password</h3>
                                <p className="text-sm text-ink/60 mt-1">We'll send a secure link to your inbox.</p>
                            </div>

                            {resetSuccess && (
                                <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                                    <AlertCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-green-800">Check your inbox for the recovery link.</p>
                                </div>
                            )}

                            <div className="relative group">
                                <input
                                    type="email"
                                    id="resetEmail"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-ink/20 py-3 text-ink focus:outline-none focus:border-azure transition-colors placeholder-transparent"
                                    placeholder="Email Address"
                                    required
                                />
                                <label
                                    htmlFor="resetEmail"
                                    className="absolute left-0 -top-3.5 text-xs text-ink/40 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-ink/40 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-azure pointer-events-none"
                                >
                                    Email Address
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResetPassword(false);
                                        setResetEmail('');
                                        setError(null);
                                    }}
                                    className="px-6 py-3 text-sm font-medium text-ink/60 hover:text-ink transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-azure text-white rounded-lg px-6 py-3 text-sm font-bold hover:bg-azure-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 group shadow-lg hover:shadow-azure/25"
                                >
                                    {isLoading ? 'Sending...' : 'Send Link'}
                                    {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="relative group">
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="peer w-full bg-transparent border-b border-ink/20 py-3 pr-10 text-ink focus:outline-none focus:border-azure transition-colors placeholder-transparent"
                                        placeholder="Email Address"
                                        required
                                    />
                                    <label
                                        htmlFor="email"
                                        className="absolute left-0 -top-3.5 text-xs text-ink/40 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-ink/40 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-azure pointer-events-none"
                                    >
                                        Email Address
                                    </label>
                                    {gravatarUrl && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 animate-scale-in">
                                            <img src={gravatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                                        </div>
                                    )}
                                </div>

                                <div className="relative group">
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="peer w-full bg-transparent border-b border-ink/20 py-3 text-ink focus:outline-none focus:border-azure transition-colors placeholder-transparent"
                                        placeholder="Password"
                                        required
                                    />
                                    <label
                                        htmlFor="password"
                                        className="absolute left-0 -top-3.5 text-xs text-ink/40 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-ink/40 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-azure pointer-events-none"
                                    >
                                        Password
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-azure focus:ring-azure"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-ink/60">
                                        Remember me
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowResetPassword(true)}
                                    className="text-sm font-medium text-azure hover:text-ink transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group w-full flex items-center justify-center gap-2 bg-azure text-white py-4 rounded-lg font-bold text-sm tracking-wide hover:bg-azure-hover transition-all duration-300 shadow-lg hover:shadow-azure/25"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="group-hover:hidden">Sign In</span>
                                        <span className="hidden group-hover:inline-flex items-center gap-2">
                                            Authenticate <ArrowRight size={16} />
                                        </span>
                                    </>
                                )}
                            </button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-ink/5"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-paper px-2 text-ink/30 font-bold tracking-wider">Or</span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    className="w-12 h-12 flex items-center justify-center rounded-lg border border-ink/10 bg-white hover:bg-paleslate hover:border-ink/30 transition-all duration-300 group"
                                    aria-label="Sign in with Google"
                                >
                                    <svg className="w-5 h-5 fill-ink/60 group-hover:fill-ink transition-colors" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGithubSignIn}
                                    className="w-12 h-12 flex items-center justify-center rounded-lg border border-ink/10 bg-white hover:bg-paleslate hover:border-ink/30 transition-all duration-300 group"
                                    aria-label="Sign in with GitHub"
                                >
                                    <Github className="w-5 h-5 text-ink/60 group-hover:text-ink transition-colors" />
                                </button>
                            </div>

                            <p className="text-center text-xs text-ink/40 mt-8">
                                Don't have an identity yet?{' '}
                                <button onClick={onNavigateToSignup} className="text-azure hover:text-ink font-semibold transition-colors">
                                    Initialize Fingerprint
                                </button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
