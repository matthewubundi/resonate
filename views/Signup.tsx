import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '../components/Components';
import { Mail, Lock, User, ArrowLeft, Check, AlertCircle, Fingerprint, ArrowRight, Github } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageView } from '../types';

interface SignupProps {
    onSignup: () => void;
    onNavigateToLogin: () => void;
    onBack: () => void;
    onNavigateToCheckEmail: (email: string) => void;
    onNavigate: (page: PageView) => void;
}

export const Signup: React.FC<SignupProps> = ({ onSignup, onNavigateToLogin, onBack, onNavigateToCheckEmail, onNavigate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signUp, signInWithGoogle, signInWithGithub } = useAuth();

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        // Basic strength check before submit
        const hasLength = formData.password.length >= 8;
        const hasUpper = /[A-Z]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);

        if (!hasLength || !hasUpper || !hasNumber) {
            setError('Please meet all password requirements');
            return;
        }

        setIsLoading(true);

        const { error: signUpError, session } = await signUp(formData.email, formData.password, formData.name);

        if (signUpError) {
            setError(signUpError.message);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            if (session) {
                onSignup();
            } else {
                onNavigateToCheckEmail(formData.email);
            }
        }
    };

    const handleGoogleSignUp = async () => {
        setError(null);
        const { error: googleError } = await signInWithGoogle();
        if (googleError) {
            setError(googleError.message);
        }
    };

    const handleGithubSignUp = async () => {
        setError(null);
        const { error: githubError } = await signInWithGithub();
        if (githubError) {
            setError(githubError.message);
        }
    };

    const requirements = [
        { label: '8+ Chars', met: formData.password.length >= 8 },
        { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
        { label: 'Number', met: /\d/.test(formData.password) },
        { label: 'Symbol', met: /[^a-zA-Z0-9]/.test(formData.password) },
    ];

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
                            <pattern id="mesh-signup" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="#2563EB" strokeWidth="0.5" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#mesh-signup)" />
                    </svg>
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <Image src="/Resonate-Logo.png" alt="Resonate Logo" width={64} height={64} className="w-16 h-16 opacity-90" />
                        <span className="text-azure text-4xl font-bold tracking-tight">Resonate</span>
                    </div>
                </div>

                {/* Center Visual: Glass Card */}
                <div className="relative z-10 flex items-center justify-center flex-1">
                    <div className="relative w-64 h-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col items-center justify-center group perspective-1000">
                        {/* Scanning Effect */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-azure shadow-[0_0_10px_#2563EB] animate-scan opacity-0 group-hover:opacity-100"></div>

                        <div className="w-24 h-24 bg-ink/50 rounded-full flex items-center justify-center border border-white/10 shadow-inner group-hover:border-azure/50 transition-colors duration-500">
                            <Fingerprint size={48} className="text-white/20 group-hover:text-azure transition-colors duration-700" />
                        </div>
                        <div className="mt-8 text-center space-y-2">
                            <div className="h-2 w-24 bg-white/10 rounded-full mx-auto overflow-hidden">
                                <div className="h-full bg-azure w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                            </div>
                            <p className="text-xs text-white/40 uppercase tracking-widest">Scanning...</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Quote */}
                <div className="relative z-10">
                    <p className="text-2xl font-light text-white leading-relaxed">
                        "Stop sounding like <br /><span className="text-azure font-medium">everyone else.</span>"
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
                        <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Initialize Your Fingerprint</h1>
                        <p className="text-ink/60 mb-4">Create your identity layer to begin.</p>
                    </div>

                    <div className="p-4 bg-azure/5 border border-azure/20 rounded-xl flex gap-3 text-sm text-azure leading-relaxed">
                        <div className="mt-0.5 text-base flex-shrink-0">💡</div>
                        <div>
                            <span className="font-semibold">Demo Sandbox Active:</span> This app runs entirely in your browser using local storage. Create an account with any email/password to start the interactive demo.
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-in slide-in-from-top-2">
                            <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-red-900">Initialization Failed</p>
                                <p className="text-sm text-red-700 mt-0.5">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="peer w-full bg-transparent border-b border-ink/20 py-3 text-ink focus:outline-none focus:border-azure transition-colors placeholder-transparent"
                                    placeholder="Full Name"
                                    required
                                />
                                <label
                                    htmlFor="name"
                                    className="absolute left-0 -top-3.5 text-xs text-ink/40 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-ink/40 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-azure pointer-events-none"
                                >
                                    Full Name
                                </label>
                            </div>

                            <div className="relative group">
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="peer w-full bg-transparent border-b border-ink/20 py-3 text-ink focus:outline-none focus:border-azure transition-colors placeholder-transparent"
                                    placeholder="Email Address"
                                    required
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-0 -top-3.5 text-xs text-ink/40 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-ink/40 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-azure pointer-events-none"
                                >
                                    Email Address
                                </label>
                            </div>

                            <div className="relative group">
                                <input
                                    type="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
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

                            {/* Dynamic Pills */}
                            <div className="flex flex-wrap gap-2">
                                {requirements.map((req, idx) => (
                                    <div
                                        key={idx}
                                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 flex items-center gap-1 ${req.met
                                            ? 'bg-green-50 border-green-500 text-green-600'
                                            : 'bg-paleslate border-transparent text-ink/30'
                                            }`}
                                    >
                                        {req.met && <Check size={10} strokeWidth={3} />}
                                        {req.label}
                                    </div>
                                ))}
                            </div>

                            <div className="relative group">
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    className="peer w-full bg-transparent border-b border-ink/20 py-3 text-ink focus:outline-none focus:border-azure transition-colors placeholder-transparent"
                                    placeholder="Confirm Password"
                                    required
                                />
                                <label
                                    htmlFor="confirmPassword"
                                    className="absolute left-0 -top-3.5 text-xs text-ink/40 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-ink/40 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-azure pointer-events-none"
                                >
                                    Confirm Password
                                </label>
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <Check size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-azure animate-in zoom-in" />
                                )}
                            </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer group pt-2">
                            <input
                                type="checkbox"
                                required
                                className="w-4 h-4 mt-0.5 rounded border-ink/20 text-azure focus:ring-azure focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-xs text-ink/60 group-hover:text-ink font-medium leading-relaxed">
                                I agree to the{' '}
                                <button type="button" onClick={() => onNavigate('terms')} className="text-azure hover:text-ink font-semibold transition-colors">Terms of Service</button>
                                {' '}and{' '}
                                <button type="button" onClick={() => onNavigate('privacy')} className="text-azure hover:text-ink font-semibold transition-colors">Privacy Policy</button>
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full flex items-center justify-center gap-2 bg-azure text-white py-4 rounded-lg font-bold text-sm tracking-wide hover:bg-azure-hover transition-all duration-300 shadow-lg hover:shadow-azure/25"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="group-hover:hidden">Create Account</span>
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
                                onClick={handleGoogleSignUp}
                                className="w-12 h-12 flex items-center justify-center rounded-lg border border-ink/10 bg-white hover:bg-paleslate hover:border-ink/30 transition-all duration-300 group"
                                aria-label="Sign up with Google"
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
                                onClick={handleGithubSignUp}
                                className="w-12 h-12 flex items-center justify-center rounded-lg border border-ink/10 bg-white hover:bg-paleslate hover:border-ink/30 transition-all duration-300 group"
                                aria-label="Sign up with GitHub"
                            >
                                <Github className="w-5 h-5 text-ink/60 group-hover:text-ink transition-colors" />
                            </button>
                        </div>

                        <p className="text-center text-xs text-ink/40 mt-8">
                            Already initialized?{' '}
                            <button type="button" onClick={onNavigateToLogin} className="text-azure hover:text-ink font-semibold transition-colors">
                                Access Terminal
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};
