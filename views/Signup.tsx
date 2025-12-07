import React, { useState } from 'react';
import Image from 'next/image';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/Components';
import { Cpu, Mail, Lock, User, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SignupProps {
    onSignup: () => void;
    onNavigateToLogin: () => void;
    onBack: () => void;
    onNavigateToCheckEmail: (email: string) => void;
}

export const Signup: React.FC<SignupProps> = ({ onSignup, onNavigateToLogin, onBack, onNavigateToCheckEmail }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const { signUp, signInWithGoogle, signInWithGithub } = useAuth();

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'password') {
            // Calculate password strength
            let strength = 0;
            if (value.length >= 8) strength++;
            if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
            if (/\d/.test(value)) strength++;
            if (/[^a-zA-Z0-9]/.test(value)) strength++;
            setPasswordStrength(strength);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        if (passwordStrength < 3) {
            setError('Please use a stronger password');
            return;
        }

        setIsLoading(true);

        const { error: signUpError, session } = await signUp(formData.email, formData.password, formData.name);

        if (signUpError) {
            setError(signUpError.message);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            // If session exists, user is automatically logged in (email confirmation disabled)
            // If no session, user needs to confirm email first
            if (session) {
                // User is logged in, proceed to signup handler (which will navigate to dashboard)
                onSignup();
            } else {
                // Email confirmation required
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

    const getStrengthColor = () => {
        if (passwordStrength === 0) return 'bg-ink/10';
        if (passwordStrength === 1) return 'bg-red-500';
        if (passwordStrength === 2) return 'bg-yellow-500';
        if (passwordStrength === 3) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength === 1) return 'Weak';
        if (passwordStrength === 2) return 'Fair';
        if (passwordStrength === 3) return 'Good';
        return 'Strong';
    };

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
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>

                <Card className="bg-white shadow-xl border-ink/10">
                    <CardHeader className="text-center space-y-4 pb-6">
                        <div className="flex justify-center">
                            <Image src="/Resonate-Logo.png" alt="Resonate Logo" width={56} height={56} className="object-contain" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl mb-2">Create Account</CardTitle>
                            <p className="text-sm text-ink/60 font-medium">Start preserving your identity today</p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-800">Signup Error</p>
                                    <p className="text-sm text-red-600 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                                    <input
                                        type="text"
                                        placeholder="Full name"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        required
                                        className="flex h-11 w-full rounded-lg border border-ink/10 bg-paleslate pl-11 pr-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-azure focus:border-azure transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white"
                                    />
                                </div>

                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        required
                                        className="flex h-11 w-full rounded-lg border border-ink/10 bg-paleslate pl-11 pr-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-azure focus:border-azure transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            required
                                            className="flex h-11 w-full rounded-lg border border-ink/10 bg-paleslate pl-11 pr-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-azure focus:border-azure transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white"
                                        />
                                    </div>
                                    {formData.password && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength ? getStrengthColor() : 'bg-ink/10'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            {getStrengthText() && (
                                                <p className="text-xs font-semibold text-ink/60">
                                                    Password strength: <span className={passwordStrength >= 3 ? 'text-green-600' : 'text-yellow-600'}>{getStrengthText()}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                                    <input
                                        type="password"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        required
                                        className="flex h-11 w-full rounded-lg border border-ink/10 bg-paleslate pl-11 pr-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-azure focus:border-azure transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white"
                                    />
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                    )}
                                </div>
                            </div>

                            <div className="bg-paleslate/50 rounded-lg p-4 space-y-2">
                                <p className="text-xs font-bold text-ink/70 mb-2">Password must contain:</p>
                                <div className="space-y-1.5">
                                    {[
                                        { text: 'At least 8 characters', met: formData.password.length >= 8 },
                                        { text: 'Upper & lowercase letters', met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
                                        { text: 'At least one number', met: /\d/.test(formData.password) },
                                        { text: 'At least one special character', met: /[^a-zA-Z0-9]/.test(formData.password) }
                                    ].map((requirement, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${requirement.met ? 'bg-green-500' : 'bg-ink/10'
                                                }`}>
                                                {requirement.met && <Check size={10} className="text-white" />}
                                            </div>
                                            <span className={`text-xs font-medium ${requirement.met ? 'text-green-600' : 'text-ink/50'}`}>
                                                {requirement.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    required
                                    className="w-4 h-4 mt-0.5 rounded border-ink/20 text-azure focus:ring-azure focus:ring-offset-0 cursor-pointer"
                                />
                                <span className="text-xs text-ink/60 group-hover:text-ink font-medium leading-relaxed">
                                    I agree to the{' '}
                                    <a href="#" className="text-azure hover:text-azure-hover font-semibold">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-azure hover:text-azure-hover font-semibold">Privacy Policy</a>
                                </span>
                            </label>

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                isLoading={isLoading}
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-ink/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-ink/50 font-bold">Or sign up with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleGoogleSignUp}
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
                                onClick={handleGithubSignUp}
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
                                Already have an account?{' '}
                                <button
                                    onClick={onNavigateToLogin}
                                    className="text-azure hover:text-azure-hover font-bold transition-colors"
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
