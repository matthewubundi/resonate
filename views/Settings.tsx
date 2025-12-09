"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../components/Components';
import {
    AlertCircle,
    Trash2,
    X,
    Check,
    User,
    CreditCard,
    Bell,
    Shield,
    Key,
    Copy,
    RefreshCw,
    Camera,
    Upload,
    Download,
    FileJson
} from 'lucide-react';
import { PageView } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';


// --- Components ---

const FloatingLabelInput = ({
    id,
    label,
    value,
    onChange,
    type = "text",
    disabled = false
}: {
    id: string;
    label: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    disabled?: boolean;
}) => (
    <div className="relative group">
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`peer w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-azure focus:ring-1 focus:ring-azure transition-all placeholder-transparent ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
            placeholder={label}
        />
        <label
            htmlFor={id}
            className="absolute left-3 -top-2.5 text-xs text-slate-500 bg-white px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-azure pointer-events-none"
        >
            {label}
        </label>
    </div>
);

const TabButton = ({
    active,
    label,
    onClick
}: {
    active: boolean;
    label: string;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`pb-3 px-1 text-sm font-medium transition-all relative ${active
            ? 'text-ink'
            : 'text-slate-400 hover:text-slate-600'
            }`}
    >
        {label}
        {active && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-azure rounded-full animate-fade-in" />
        )}
    </button>
);

const SelectInput = ({
    label,
    value,
    onChange,
    options
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}) => (
    <div className="relative group">
        <select
            value={value}
            onChange={onChange}
            className="peer w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-azure focus:ring-1 focus:ring-azure transition-all appearance-none"
        >
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        <label className="absolute left-3 -top-2.5 text-xs text-slate-500 bg-white px-1">
            {label}
        </label>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>
);

const ToggleSwitch = ({
    label,
    description,
    checked,
    onChange
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) => (
    <div className="flex items-center justify-between w-full py-4 px-1">
        <div className="flex flex-col gap-1 pr-4">
            <span className="text-sm font-medium text-ink">{label}</span>
            {description && <span className="text-xs text-slate-500">{description}</span>}
        </div>
        <button
            onClick={() => onChange(!checked)}
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 flex-shrink-0 ${checked ? 'bg-azure' : 'bg-slate-200'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    </div>
);

// --- Main Page Component ---

import { useSearchParams } from 'next/navigation';

export const Settings: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
    const { user, signOut } = useAuth();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'General');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Delete account step state
    const [deleteStep, setDeleteStep] = useState<'initial' | 'confirm'>('initial');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // Form state
    const [displayName, setDisplayName] = useState('');
    const [language, setLanguage] = useState('English (US)');
    const [timezone, setTimezone] = useState('UTC');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [subscriptionTier, setSubscriptionTier] = useState('free');
    const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
    const [transformationsUsage, setTransformationsUsage] = useState(0);

    // Original values to detect changes
    const [originalValues, setOriginalValues] = useState({
        displayName: '',
        language: '',
        timezone: '',
        avatarUrl: null as string | null,
        defaultLandingPage: 'dashboard',
        autoCopy: false,
        clearInput: false,
        historyRetention: 'forever',
    });

    // New Settings State
    const [defaultLandingPage, setDefaultLandingPage] = useState('dashboard');
    const [autoCopy, setAutoCopy] = useState(false);
    const [clearInput, setClearInput] = useState(false);
    const [historyRetention, setHistoryRetention] = useState('forever');

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

                // Fetch Profiles
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('full_name, language, timezone, avatar_url, subscription_tier, current_period_end, transformations_usage, default_landing_page, auto_copy_to_clipboard, clear_input_on_success, history_retention_period')
                    .eq('id', user.id)
                    .single();

                if (fetchError) throw fetchError;



                const displayNameValue = data?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
                const languageValue = data?.language || 'English (US)';
                const timezoneValue = data?.timezone || 'UTC';
                const avatarUrlValue = data?.avatar_url || null;
                const tierValue = data?.subscription_tier || 'free';
                const periodEndValue = data?.current_period_end || null;
                const usageValue = data?.transformations_usage || 0;

                // New Settings
                const defaultLandingPageValue = data?.default_landing_page || 'dashboard';
                const autoCopyValue = data?.auto_copy_to_clipboard || false;
                const clearInputValue = data?.clear_input_on_success || false;
                const historyRetentionValue = data?.history_retention_period || 'forever';


                setDisplayName(displayNameValue);
                setLanguage(languageValue);
                setTimezone(timezoneValue);
                setAvatarUrl(avatarUrlValue);
                setSubscriptionTier(tierValue);
                setCurrentPeriodEnd(periodEndValue);
                setTransformationsUsage(usageValue);

                setDefaultLandingPage(defaultLandingPageValue);
                setAutoCopy(autoCopyValue);
                setClearInput(clearInputValue);
                setHistoryRetention(historyRetentionValue);

                setOriginalValues({
                    displayName: displayNameValue,
                    language: languageValue,
                    timezone: timezoneValue,
                    avatarUrl: avatarUrlValue,
                    defaultLandingPage: defaultLandingPageValue,
                    autoCopy: autoCopyValue,
                    clearInput: clearInputValue,
                    historyRetention: historyRetentionValue,
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
            language !== originalValues.language ||
            timezone !== originalValues.timezone ||
            avatarUrl !== originalValues.avatarUrl ||
            defaultLandingPage !== originalValues.defaultLandingPage ||
            autoCopy !== originalValues.autoCopy ||
            clearInput !== originalValues.clearInput ||
            historyRetention !== originalValues.historyRetention
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
                    language,
                    timezone,
                    avatar_url: avatarUrl,
                    default_landing_page: defaultLandingPage,
                    auto_copy_to_clipboard: autoCopy,
                    clear_input_on_success: clearInput,
                    history_retention_period: historyRetention
                }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Update original values to reflect saved state
            setOriginalValues({
                displayName,
                language,
                timezone,
                avatarUrl,
                defaultLandingPage,
                autoCopy,
                clearInput,
                historyRetention,
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
        setLanguage(originalValues.language);
        setTimezone(originalValues.timezone);
        setAvatarUrl(originalValues.avatarUrl);
        setDefaultLandingPage(originalValues.defaultLandingPage);
        setAutoCopy(originalValues.autoCopy);
        setClearInput(originalValues.clearInput);
        setHistoryRetention(originalValues.historyRetention);
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
            setDeleteStep('initial');
            setDeleteConfirmation('');
        }
    };

    const handleExportData = async () => {
        setIsExporting(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('/api/settings/export', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to export data');
            }

            const data = await response.json();

            // Create downloadable file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resonate-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setSuccess('Data export started successfully!');
            setTimeout(() => setSuccess(null), 3000);

        } catch (err: any) {
            console.error('Error exporting data:', err);
            setError(err.message || 'Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            setUploadingAvatar(true);
            setError(null);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            setSuccess('Image uploaded! Click "Save Changes" to apply.');

        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            setError(error.message || 'Error uploading avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Settings</h1>
                    <p className="text-slate-500 text-lg">Manage your command center.</p>
                </div>

                {/* Horizontal Tabs */}
                <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto pb-px touch-pan-x">
                    {['General', 'Account', 'Notifications', 'API & Integrations', 'Billing'].map((tab) => (
                        <TabButton
                            key={tab}
                            active={activeTab === tab}
                            label={tab}
                            onClick={() => setActiveTab(tab)}
                        />
                    ))}
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-900">Error</p>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div className="bg-azure/10 border border-azure/20 rounded-lg p-4 flex items-start gap-3">
                    <Check className="text-azure flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-azure">Success</p>
                        <p className="text-sm text-ink/80">{success}</p>
                    </div>
                    <button onClick={() => setSuccess(null)} className="text-azure/60 hover:text-azure">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'General' && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Avatar Management Row */}
                        <div className="flex flex-col md:flex-row md:items-center gap-6 p-4 md:p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="relative group/avatar self-center md:self-auto">
                                <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-white shadow-md overflow-hidden flex items-center justify-center relative">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        user?.email && (
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        )
                                    )}
                                    {uploadingAvatar && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow border border-slate-200 text-slate-600 hover:text-azure transition-colors cursor-pointer">
                                    <Camera size={14} />
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    disabled={uploadingAvatar}
                                />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg font-bold text-ink">Profile Picture</h3>
                                <p className="text-slate-500 text-sm">Upload a custom avatar or use your Gravatar.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                {avatarUrl && (
                                    <button
                                        onClick={() => setAvatarUrl(null)}
                                        className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors w-full sm:w-auto text-center"
                                    >
                                        Remove
                                    </button>
                                )}
                                <label htmlFor="avatar-upload" className="w-full sm:w-auto">
                                    <span className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2 cursor-pointer w-full sm:w-auto ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <Upload size={16} />
                                        {uploadingAvatar ? 'Uploading...' : 'Upload New'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-8 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="md:col-span-2 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-ink">Profile Information</h3>
                                <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</span>
                                    <span className={`text-sm font-bold capitalize ${subscriptionTier === 'free' ? 'text-slate-600' : 'text-azure'}`}>
                                        {subscriptionTier}
                                    </span>
                                    <button
                                        onClick={() => onNavigate('plans')}
                                        className="text-xs text-azure hover:text-azure/80 font-semibold ml-2 hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>

                            {/* Row 1: Display Name */}
                            <div className="md:col-span-2">
                                <FloatingLabelInput
                                    id="display-name"
                                    label="Display Name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </div>

                            {/* Row 2: Language | Timezone */}
                            <div>
                                <SelectInput
                                    label="Language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    options={[
                                        'English (US)', 'English (UK)', 'Spanish', 'French',
                                        'German', 'Italian', 'Portuguese', 'Japanese',
                                        'Chinese (Simplified)', 'Chinese (Traditional)'
                                    ]}
                                />
                            </div>
                            <div>
                                <SelectInput
                                    label="Timezone"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    options={[
                                        'UTC', 'GMT', 'America/New_York', 'America/Chicago',
                                        'America/Denver', 'America/Los_Angeles', 'Europe/London',
                                        'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
                                        'Asia/Shanghai', 'Australia/Sydney'
                                    ]}
                                />
                            </div>



                            {/* Workflow Section */}
                            <div className="md:col-span-2 pt-6 border-t border-slate-100 mt-2">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-azure rounded-full"></div>
                                    Workflow & Preferences
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Default Landing Page */}
                                    <div className="md:col-span-2">
                                        <SelectInput
                                            label="Default Landing Page"
                                            value={defaultLandingPage}
                                            onChange={(e) => setDefaultLandingPage(e.target.value)}
                                            options={['dashboard', 'transform', 'history']}
                                        />
                                        <p className="text-xs text-slate-400 mt-2 ml-1">
                                            The first screen you see after logging in.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="md:col-span-2 space-y-2">
                                <ToggleSwitch
                                    label="Auto-Copy to Clipboard"
                                    description="Automatically copy the result when a rewrite achieves a score > 8.0."
                                    checked={autoCopy}
                                    onChange={setAutoCopy}
                                />
                                <div className="border-t border-slate-50 my-1"></div>
                                <ToggleSwitch
                                    label="Clear Input on Success"
                                    description="Automatically clears the input pane after a successful transformation."
                                    checked={clearInput}
                                    onChange={setClearInput}
                                />
                            </div>

                            {/* Privacy & Data */}
                            <div className="md:col-span-2 pt-6 border-t border-slate-100 mt-2">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                    Privacy & Data
                                </h4>
                                <div>
                                    <SelectInput
                                        label="History Retention Period"
                                        value={historyRetention}
                                        onChange={(e) => setHistoryRetention(e.target.value)}
                                        options={['forever', '30_days', '7_days', 'none']}
                                    />
                                    <p className="text-xs text-slate-400 mt-2 ml-1">
                                        How long Resonate keeps your transformation logs. Corporate clients often require "30 days".
                                    </p>
                                </div>
                            </div>

                            {/* Save Actions */}
                            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                {hasChanges() && (
                                    <Button variant="ghost" onClick={handleReset} disabled={saving}>
                                        Reset
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSave}
                                    isLoading={saving}
                                    disabled={!hasChanges() || saving || loading}
                                    className="px-8"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Account' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="p-4 md:p-8 bg-white rounded-xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-ink">Account Credentials</h3>
                            <FloatingLabelInput
                                id="email"
                                label="Email Address"
                                value={user?.email || ''}
                                disabled={true}
                            />
                            <div className="flex justify-between items-center text-sm text-slate-500">
                                <span>Used for sign in and notifications.</span>
                                <span>Cannot be changed</span>
                            </div>
                        </div>

                        {/* Data Management */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 md:p-8 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-ink mb-1">Data Management</h3>
                                <p className="text-slate-500">Manage your personal data and privacy.</p>
                            </div>

                            <div className="p-4 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-azure/10 flex items-center justify-center flex-shrink-0 mt-1">
                                        <FileJson className="text-azure" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-ink">Export Your Data</h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-md">
                                            Download a copy of all your personas, memories, and transformation history in JSON format.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleExportData}
                                    isLoading={isExporting}
                                    variant="outline"
                                    className="gap-2 whitespace-nowrap"
                                >
                                    <Download size={16} />
                                    Export Data
                                </Button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                            <div className="p-4 md:p-8">
                                <h3 className="text-lg font-bold text-ink mb-1">Delete Account</h3>
                                <p className="text-slate-500 mb-6">Permanently remove your identity and data.</p>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50/50 rounded-lg border border-red-100">
                                    <div className="text-sm text-red-900/80 max-w-lg">
                                        Warning: This action is not reversible. Please be certain.
                                    </div>
                                    <button
                                        onClick={() => setShowConfirm(true)}
                                        className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 shadow-sm"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'API & Integrations' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 md:p-8 border-b border-slate-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-ink mb-1">Personal Access Tokens</h3>
                                        <p className="text-slate-500">Manage your programmatic access keys.</p>
                                    </div>
                                    <Button size="sm" className="gap-2">
                                        <Key size={14} />
                                        Generate New Token
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 md:p-8 bg-slate-50/50">
                                <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-azure/10 flex items-center justify-center flex-shrink-0">
                                        <Key className="text-azure" size={20} />
                                    </div>
                                    <div className="flex-1 font-mono text-sm">
                                        <div className="text-slate-400 text-xs mb-1">Default Token</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-900 blur-[4px] select-none text-base">res_sk_78sfd8s7f6d8s9f7d8s</span>
                                            <span className="text-slate-400 text-xs ml-2">(Hidden)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-slate-400 hover:text-azure transition-colors rounded-md hover:bg-azure/5" title="Copy">
                                            <Copy size={16} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-azure transition-colors rounded-md hover:bg-azure/5" title="Regenerate">
                                            <RefreshCw size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-slate-500 text-center">
                                    Tokens allow full access to your account. Keep them secure.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Notifications' && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 border-dashed animate-fade-in-up">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Bell className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{activeTab}</h3>
                        <p className="text-slate-500">This section is coming soon.</p>
                    </div>
                )}

                {activeTab === 'Billing' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Subscription Status */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                                    <CreditCard size={20} className="text-azure" />
                                    Subscription Status
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Current Plan</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-ink capitalize">{subscriptionTier}</span>
                                            {subscriptionTier !== 'free' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Billing Cycle</span>
                                        <span className="font-medium text-ink">Monthly</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-slate-500">Next Renewal</span>
                                        <span className="font-medium text-ink">
                                            {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Usage Stats (Transformations) */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                                    <RefreshCw size={20} className="text-amber-500" />
                                    Usage & Limits
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-600 font-medium">Transformations</span>
                                            <span className="text-ink font-bold">
                                                {transformationsUsage} / {subscriptionTier === 'power' ? 'Unlimited' : (subscriptionTier === 'pro' ? '2,000' : '50')}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${transformationsUsage > (subscriptionTier === 'pro' ? 2000 : 50) * 0.9 ? 'bg-red-500' : 'bg-azure'}`}
                                                style={{
                                                    width: subscriptionTier === 'power'
                                                        ? '2%'
                                                        : `${Math.min((transformationsUsage / (subscriptionTier === 'pro' ? 2000 : 50)) * 100, 100)}%`
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">
                                            Resets on {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : 'next billing cycle'}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


            </div>

            {/* Confirmation Modal */}
            {
                showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-6">
                            {deleteStep === 'initial' ? (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3 text-red-600">
                                            <AlertCircle size={24} />
                                            <h3 className="text-lg font-bold text-slate-900">Delete Account?</h3>
                                        </div>
                                    </div>

                                    <p className="text-slate-600 leading-relaxed">
                                        Are you sure you want to delete your account? All your identities, memories, and transformation history will be permanently removed.
                                    </p>

                                    <div className="flex gap-3 justify-end pt-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowConfirm(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                                            onClick={() => setDeleteStep('confirm')}
                                        >
                                            Yes, Delete Account
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3 text-red-600">
                                            <AlertCircle size={24} />
                                            <h3 className="text-lg font-bold text-slate-900">Final Confirmation</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-slate-600">
                                            This action cannot be undone. To confirm, please type <span className="font-mono font-bold text-red-600">delete my account</span> below.
                                        </p>

                                        <div className="relative group">
                                            <input
                                                value={deleteConfirmation}
                                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                placeholder="Type 'delete my account'"
                                                className="w-full bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-900 placeholder-red-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 justify-end pt-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setShowConfirm(false);
                                                setDeleteStep('initial');
                                                setDeleteConfirmation('');
                                            }}
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                                            onClick={handleDeleteAccount}
                                            isLoading={isDeleting}
                                            disabled={deleteConfirmation !== 'delete my account'}
                                        >
                                            Permanently Delete
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

        </div >
    );
};
