"use client";

import React, { useState, useEffect } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/Components';
import { AlertCircle, Trash2, X, Check } from 'lucide-react';
import { PageView } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const Settings: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [displayName, setDisplayName] = useState('');
    const [theme, setTheme] = useState('Paper White');
    const [language, setLanguage] = useState('English (US)');
    const [timezone, setTimezone] = useState('UTC');

    // Original values to detect changes
    const [originalValues, setOriginalValues] = useState({
        displayName: '',
        theme: '',
        language: '',
        timezone: '',
    });

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('full_name, theme, language, timezone')
                    .eq('id', user.id)
                    .single();

                if (fetchError) throw fetchError;

                const displayNameValue = data?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
                const themeValue = data?.theme || 'Paper White';
                const languageValue = data?.language || 'English (US)';
                const timezoneValue = data?.timezone || 'UTC';

                setDisplayName(displayNameValue);
                setTheme(themeValue);
                setLanguage(languageValue);
                setTimezone(timezoneValue);

                setOriginalValues({
                    displayName: displayNameValue,
                    theme: themeValue,
                    language: languageValue,
                    timezone: timezoneValue,
                });
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError(err.message || 'Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const hasChanges = () => {
        return (
            displayName !== originalValues.displayName ||
            theme !== originalValues.theme ||
            language !== originalValues.language ||
            timezone !== originalValues.timezone
        );
    };

    const handleSave = async () => {
        if (!user) {
            setError('You must be logged in to save settings');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('You must be logged in to save settings');
                setSaving(false);
                return;
            }

            const res = await fetch('/api/settings/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    display_name: displayName,
                    theme,
                    language,
                    timezone,
                }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Update original values to reflect saved state
            setOriginalValues({
                displayName,
                theme,
                language,
                timezone,
            });

            setSuccess('Settings saved successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error saving settings:', err);
            setError(err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setDisplayName(originalValues.displayName);
        setTheme(originalValues.theme);
        setLanguage(originalValues.language);
        setTimezone(originalValues.timezone);
        setError(null);
        setSuccess(null);
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('/api/auth/delete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete account');
            }

            // Sign out and redirect to home
            await signOut();
            onNavigate('landing');

        } catch (err: any) {
            console.error('Error deleting account:', err);
            setError(err.message || 'Failed to delete account');
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto pb-12">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-slate-900">Settings</h1>
                    <p className="text-slate-600 font-medium">
                        Manage your account preferences and data.
                    </p>
                </div>
                <div className="flex gap-3">
                    {hasChanges() && (
                        <Button variant="outline" onClick={handleReset} disabled={saving}>
                            Reset
                        </Button>
                    )}
                    <Button onClick={handleSave} isLoading={saving} disabled={!hasChanges() || saving || loading}>
                        Save Changes
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div className="bg-azure/10 border border-azure/20 rounded-lg p-4 flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        <Check className="text-azure flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-azure mb-1">Success</p>
                            <p className="text-sm text-ink/80">{success}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}>
                        <X size={16} />
                    </Button>
                </div>
            )}

            {/* General Settings */}
            <Card className="bg-white shadow-sm">
                <CardHeader className="border-b border-ink/5">
                    <CardTitle className="text-lg">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-paleslate rounded w-3/4"></div>
                            <div className="h-10 bg-paleslate rounded"></div>
                            <div className="h-4 bg-paleslate rounded w-1/2"></div>
                            <div className="h-10 bg-paleslate rounded"></div>
                        </div>
                    ) : (
                        <>
                            <Input
                                label="Display Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your display name"
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-ink">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full px-4 py-2 rounded-lg border border-ink/10 bg-paleslate/30 text-ink/60 cursor-not-allowed"
                                />
                                <p className="text-xs text-ink/50">Email cannot be changed</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-ink">Interface Theme</label>
                                <select
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="w-full rounded-md border border-ink/10 bg-paleslate px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure transition-colors focus:bg-white"
                                >
                                    <option>Paper White</option>
                                    <option>Dark Mode</option>
                                    <option>Auto</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-ink">Language</label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full rounded-md border border-ink/10 bg-paleslate px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure transition-colors focus:bg-white"
                                    >
                                        <option>English (US)</option>
                                        <option>English (UK)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>German</option>
                                        <option>Italian</option>
                                        <option>Portuguese</option>
                                        <option>Japanese</option>
                                        <option>Chinese (Simplified)</option>
                                        <option>Chinese (Traditional)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-ink">Timezone</label>
                                    <select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full rounded-md border border-ink/10 bg-paleslate px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure transition-colors focus:bg-white"
                                    >
                                        <option>UTC</option>
                                        <option>GMT</option>
                                        <option>America/New_York</option>
                                        <option>America/Chicago</option>
                                        <option>America/Denver</option>
                                        <option>America/Los_Angeles</option>
                                        <option>Europe/London</option>
                                        <option>Europe/Paris</option>
                                        <option>Europe/Berlin</option>
                                        <option>Asia/Tokyo</option>
                                        <option>Asia/Shanghai</option>
                                        <option>Australia/Sydney</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-red-50 border-red-200 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-red-200">
                    <CardTitle className="text-lg text-red-900">Danger Zone</CardTitle>
                    <p className="text-sm text-red-700 mt-1">Irreversible actions for your account.</p>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-slate-900">Delete Account</div>
                            <div className="text-sm text-slate-500 mt-1 max-w-md">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowConfirm(true)}
                            className="bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3 text-red-600">
                                <AlertCircle size={24} />
                                <h3 className="text-lg font-bold text-slate-900">Delete Account?</h3>
                            </div>
                        </div>

                        <p className="text-slate-600">
                            Are you sure you want to delete your account? All your identities, memories, and transformation history will be permanently removed.
                        </p>

                        <div className="flex gap-3 justify-end pt-2">
                            <Button
                                variant="secondary"
                                onClick={() => setShowConfirm(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                                onClick={handleDeleteAccount}
                                isLoading={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
