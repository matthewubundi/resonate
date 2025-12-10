import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button, Input, TextArea, Card, CardHeader, CardTitle, CardContent, Chip, JsonViewer } from '../components/Components';
import { GeneratedIdentity } from '../types';
import { Copy, Check, AlertCircle, Save, Undo, Code, Layout as LayoutIcon, Sliders, Type, Shield, List, Plus, X, Search, ToggleLeft, ToggleRight, Sparkles, Download } from 'lucide-react';

export const IdentityEditor = () => {
    const { user, loading: authLoading } = useAuth();
    const [identityId, setIdentityId] = useState<string | null>(null);
    const [identityName, setIdentityName] = useState<string>('');
    const [originalName, setOriginalName] = useState<string>('');
    const [identityData, setIdentityData] = useState<GeneratedIdentity | null>(null);
    const [editableData, setEditableData] = useState<GeneratedIdentity | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // UI State
    const [activeTab, setActiveTab] = useState<'voice' | 'vocabulary' | 'values' | 'rules' | 'json'>('voice');
    const [showJsonSplit, setShowJsonSplit] = useState(false);

    // Input States
    const [newWordInputs, setNewWordInputs] = useState<{ frequent: string; avoid: string }>({ frequent: '', avoid: '' });
    const [newValueInput, setNewValueInput] = useState('');
    const [newEthicInput, setNewEthicInput] = useState('');
    const [newRuleInputs, setNewRuleInputs] = useState<{ always: string; never: string }>({ always: '', never: '' });

    // Disabled rules state (managed locally, will be persisted in a special field if possible or just filtered)
    // Approach: We will store disabled rules in a separate hidden property `_disabled_rules` in the JSON.

    const headerRef = useRef<HTMLDivElement>(null);

    // Fetch identity data
    useEffect(() => {
        const fetchIdentity = async () => {
            if (authLoading) return;

            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const { data, error: fetchError } = await supabase
                    .from('identities')
                    .select('id, name, identity_json')
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .single();

                if (fetchError) {
                    if (fetchError.code === 'PGRST116') {
                        setIdentityData(null);
                        setEditableData(null);
                        setIdentityName('');
                    } else {
                        throw fetchError;
                    }
                } else if (data) {
                    const identity = data.identity_json as GeneratedIdentity;
                    if (identity.description && !identity.tone_description) {
                        identity.tone_description = identity.description;
                    }
                    // Initialize _disabled_rules if not present
                    if (!(identity as any)._disabled_rules) {
                        (identity as any)._disabled_rules = { always: [], never: [] };
                    }

                    setIdentityId(data.id);
                    const name = data.name || '';
                    setIdentityName(name);
                    setOriginalName(name);
                    setIdentityData(identity);
                    setEditableData(JSON.parse(JSON.stringify(identity)));
                }
            } catch (err: any) {
                console.error('Error fetching identity:', err);
                setError(err.message || 'Failed to load identity data');
            } finally {
                setLoading(false);
            }
        };

        fetchIdentity();
    }, [user, authLoading]);

    const handleSave = async () => {
        if (!user || !identityId || !editableData) {
            setError('Cannot save: Missing identity data');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const dataToSave = { ...editableData };
            if (dataToSave.tone_description !== undefined) {
                (dataToSave as any).description = dataToSave.tone_description;
            }

            const { error: updateError } = await supabase
                .from('identities')
                .update({
                    name: identityName || null,
                    identity_json: dataToSave,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', identityId)
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            const updatedData = JSON.parse(JSON.stringify(editableData));
            if (updatedData.tone_description !== undefined) {
                updatedData.description = updatedData.tone_description;
            }
            setIdentityData(updatedData);
            setSuccess('Identity Configuration Saved');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error saving identity:', err);
            setError(err.message || 'Failed to save identity data');
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = () => {
        if (!identityData || !editableData) return false;
        const dataChanged = JSON.stringify(identityData) !== JSON.stringify(editableData);
        const nameChanged = identityName !== originalName;
        return dataChanged || nameChanged;
    };

    const handleReset = () => {
        if (identityData) {
            const resetData = JSON.parse(JSON.stringify(identityData));
            if (resetData.description && !resetData.tone_description) {
                resetData.tone_description = resetData.description;
            }
            setEditableData(resetData);
            setIdentityName(originalName);
            setError(null);
            setSuccess(null);
        }
    };

    // --- Helper Functions for Data Manipulation ---

    const updateField = (field: keyof GeneratedIdentity, value: any) => {
        if (!editableData) return;
        setEditableData({ ...editableData, [field]: value });
    };

    // Vocabulary Helpers
    const addWord = (type: 'frequent' | 'avoid') => {
        if (!editableData) return;
        const word = type === 'frequent' ? newWordInputs.frequent.trim() : newWordInputs.avoid.trim();
        if (!word) return;

        setEditableData({
            ...editableData,
            vocabulary: {
                ...editableData.vocabulary,
                [type === 'frequent' ? 'frequent_words' : 'avoid_words']: [
                    ...(editableData.vocabulary[type === 'frequent' ? 'frequent_words' : 'avoid_words'] || []),
                    word
                ]
            }
        });

        setNewWordInputs({ ...newWordInputs, [type]: '' });
    };

    const removeWord = (type: 'frequent' | 'avoid', index: number) => {
        if (!editableData) return;
        const key = type === 'frequent' ? 'frequent_words' : 'avoid_words';
        setEditableData({
            ...editableData,
            vocabulary: {
                ...editableData.vocabulary,
                [key]: editableData.vocabulary[key].filter((_, i) => i !== index)
            }
        });
    };

    // Values Helpers
    const addValue = () => {
        if (!editableData || !newValueInput.trim()) return;
        setEditableData({
            ...editableData,
            values: [...(editableData.values || []), newValueInput.trim()]
        });
        setNewValueInput('');
    };

    const removeValue = (index: number) => {
        if (!editableData) return;
        setEditableData({
            ...editableData,
            values: editableData.values.filter((_, i) => i !== index)
        });
    };

    const addEthic = () => {
        if (!editableData || !newEthicInput.trim()) return;
        setEditableData({
            ...editableData,
            ethics: [...(editableData.ethics || []), newEthicInput.trim()]
        });
        setNewEthicInput('');
    };

    const removeEthic = (index: number) => {
        if (!editableData) return;
        setEditableData({
            ...editableData,
            ethics: editableData.ethics?.filter((_, i) => i !== index) || []
        });
    };

    // Rules Helpers
    const addRule = (type: 'always' | 'never') => {
        if (!editableData) return;
        const rule = type === 'always' ? newRuleInputs.always.trim() : newRuleInputs.never.trim();
        if (!rule) return;

        setEditableData({
            ...editableData,
            rules: {
                ...editableData.rules,
                [type]: [...(editableData.rules[type] || []), rule]
            }
        });

        setNewRuleInputs({ ...newRuleInputs, [type]: '' });
    };

    const updateRule = (type: 'always' | 'never', index: number, value: string) => {
        if (!editableData) return;
        const newRules = [...(editableData.rules[type] || [])];
        newRules[index] = value;
        setEditableData({
            ...editableData,
            rules: { ...editableData.rules, [type]: newRules }
        });
    };

    const removeRule = (type: 'always' | 'never', index: number) => {
        if (!editableData) return;
        setEditableData({
            ...editableData,
            rules: {
                ...editableData.rules,
                [type]: editableData.rules[type].filter((_, i) => i !== index)
            }
        });
    };

    const toggleRuleStatus = (type: 'always' | 'never', ruleText: string, isActive: boolean) => {
        if (!editableData) return;

        // We are maintaining a _disabled_rules object in the editableData
        const currentDisabled = (editableData as any)._disabled_rules || { always: [], never: [] };

        if (isActive) {
            // Disable it: Remove from active list, add to disabled list
            setEditableData({
                ...editableData,
                rules: {
                    ...editableData.rules,
                    [type]: editableData.rules[type].filter(r => r !== ruleText)
                },
                _disabled_rules: {
                    ...currentDisabled,
                    [type]: [...(currentDisabled[type] || []), ruleText]
                }
            } as any);
        } else {
            // Enable it: Remove from disabled list, add to active list
            setEditableData({
                ...editableData,
                rules: {
                    ...editableData.rules,
                    [type]: [...(editableData.rules[type] || []), ruleText]
                },
                _disabled_rules: {
                    ...currentDisabled,
                    [type]: (currentDisabled[type] || []).filter((r: string) => r !== ruleText)
                }
            } as any);
        }
    };


    // --- Render Components ---

    const renderTabButton = (id: typeof activeTab, label: string, Icon: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === id
                ? 'border-azure text-azure bg-azure/5'
                : 'border-transparent text-ink/60 hover:text-ink hover:bg-paleslate/50'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-azure border-t-transparent"></div>
            </div>
        );
    }

    if (!editableData) {
        return <div className="p-8 text-center text-ink/60">No identity data available. Please complete onboarding.</div>;
    }

    const handleDownload = () => {
        if (!editableData) return;
        const jsonString = JSON.stringify(editableData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${(identityName || 'identity').replace(/\s+/g, '_').toLowerCase()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] relative"> {/* Adjust height for layout */}

            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-ink/5 px-6 py-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Identity Name Input */}
                    <div className="relative group">
                        <input
                            type="text"
                            value={identityName}
                            onChange={(e) => setIdentityName(e.target.value)}
                            className="text-xl font-bold text-ink bg-transparent border-b border-transparent hover:border-ink/20 focus:border-azure focus:outline-none transition-colors px-1 py-0.5"
                            placeholder="Identity Name"
                        />
                        <span className="absolute -right-4 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-ink/30">
                            <Type size={12} />
                        </span>
                    </div>

                    {hasChanges() && (
                        <span className="bg-highlight/10 text-highlight text-xs px-2 py-0.5 rounded-full font-medium border border-highlight/20 animate-pulse">
                            Unsaved Changes
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={handleDownload} title="Download JSON">
                        <Download size={18} />
                        <span className="ml-2 hidden sm:inline">Download</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowJsonSplit(!showJsonSplit)} className={showJsonSplit ? 'text-azure bg-azure/10' : ''}>
                        {showJsonSplit ? <LayoutIcon size={18} /> : <Code size={18} />}
                        <span className="ml-2 hidden sm:inline">{showJsonSplit ? 'Hide JSON' : 'View JSON'}</span>
                    </Button>

                    <div className="h-6 w-px bg-ink/10 mx-1"></div>

                    <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges() || saving}>
                        <Undo size={16} className="mr-2" />
                        Discard
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving} disabled={!hasChanges() || saving}
                        className={hasChanges() ? 'ring-2 ring-highlight/50 ring-offset-1' : ''}
                    >
                        <Save size={16} className="mr-2" />
                        Save Version
                    </Button>
                </div>
            </div>

            {/* Error/Success Messages */}
            <div className="px-6 pt-4">
                {success && (
                    <div className="bg-azure/10 border border-azure/20 rounded-lg p-3 flex items-center gap-3 text-sm text-azure mb-2">
                        <Check size={16} /> {success}
                    </div>
                )}
                {error && (
                    <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-3 flex items-center gap-3 text-sm text-highlight mb-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex">

                {/* Editor Panel */}
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showJsonSplit ? 'w-1/2' : 'w-full'}`}>

                    {/* Tabs */}
                    <div className="bg-white border-b border-ink/5 px-6">
                        <nav className="flex gap-1 overflow-x-auto no-scrollbar">
                            {renderTabButton('voice', 'Core Voice', Sliders)}
                            {renderTabButton('vocabulary', 'Vocabulary', Type)}
                            {renderTabButton('values', 'Values & Ethics', Shield)}
                            {renderTabButton('rules', 'Rules Engine', List)}
                            {!showJsonSplit && renderTabButton('json', 'JSON Source', Code)}
                        </nav>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto bg-paleslate p-6">
                        <div className="max-w-4xl mx-auto space-y-6">

                            {/* Active Tab Content */}
                            {/* Active Tab Content */}
                            {activeTab === 'voice' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <Card className="bg-white border border-ink/5 shadow-sm">
                                        <CardHeader className="border-b border-ink/5 pb-4">
                                            <CardTitle className="text-lg font-bold text-ink">The Voice Calibrator</CardTitle>
                                            <p className="text-sm text-ink/50 mt-1">Fine-tune exactly how your persona sounds and communicates.</p>
                                        </CardHeader>
                                        <CardContent className="space-y-8 pt-6">

                                            {/* 1. Tone Descriptors */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-semibold text-ink/80">Tone Descriptors</label>
                                                    <span className="text-xs text-ink/40">Select all that apply</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Professional', 'Conversational', 'Authoritative', 'Friendly', 'Empathetic', 'Witty', 'Academic', 'Urgent', 'Optimistic'].map(tag => {
                                                        const currentTones = editableData.tone ? editableData.tone.split(',').map(t => t.trim()) : [];
                                                        const isSelected = currentTones.some(t => t.toLowerCase() === tag.toLowerCase());
                                                        return (
                                                            <button
                                                                key={tag}
                                                                onClick={() => {
                                                                    let newTones;
                                                                    if (isSelected) {
                                                                        newTones = currentTones.filter(t => t.toLowerCase() !== tag.toLowerCase());
                                                                    } else {
                                                                        newTones = [...currentTones, tag];
                                                                    }
                                                                    updateField('tone', newTones.join(', '));
                                                                }}
                                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected
                                                                    ? 'bg-azure text-white border-azure shadow-sm'
                                                                    : 'bg-white text-ink/70 border-ink/10 hover:border-azure/30 hover:text-azure hover:bg-azure/5'
                                                                    }`}
                                                            >
                                                                {tag}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="h-px bg-ink/5 w-full"></div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* 2. Formality Level */}
                                                <div>
                                                    <label className="text-sm font-semibold text-ink/80 mb-3 block">Formality Level</label>
                                                    <div className="bg-paleslate rounded-lg p-1 flex relative">
                                                        {['Casual', 'Neutral', 'Formal'].map((option) => (
                                                            <button
                                                                key={option}
                                                                onClick={() => updateField('formality', option)}
                                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${editableData.formality === option
                                                                    ? 'bg-white text-azure shadow-sm'
                                                                    : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                                                                    }`}
                                                            >
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="mt-3 min-h-[40px] p-3 bg-azure/5 rounded-md border border-azure/10">
                                                        <p className="text-xs text-azure/80 flex items-start gap-2">
                                                            <span className="mt-0.5"><Sparkles size={12} /></span>
                                                            {editableData.formality === 'Casual' && "Relaxed syntax, uses contractions, friendly vibe."}
                                                            {editableData.formality === 'Neutral' && "Clear, standard communication without strong stylistic bias."}
                                                            {editableData.formality === 'Formal' && "Proper grammar, complete sentences, professional demeanor."}
                                                            {!['Casual', 'Neutral', 'Formal'].includes(editableData.formality) && "Select a formality level to see details."}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* 3. Directness Scale */}
                                                <div>
                                                    <label className="text-sm font-semibold text-ink/80 mb-3 block">Directness Scale</label>
                                                    <div className="bg-paleslate rounded-lg p-1 flex relative">
                                                        {['Concise', 'Balanced', 'Elaborate'].map((option) => (
                                                            <button
                                                                key={option}
                                                                onClick={() => updateField('directness', option)}
                                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${editableData.directness === option
                                                                    ? 'bg-white text-azure shadow-sm'
                                                                    : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                                                                    }`}
                                                            >
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="mt-3 min-h-[40px] p-3 bg-azure/5 rounded-md border border-azure/10">
                                                        <p className="text-xs text-azure/80 flex items-start gap-2">
                                                            <span className="mt-0.5"><Sparkles size={12} /></span>
                                                            {editableData.directness === 'Concise' && "Bullet points, short sentences, zero fluff."}
                                                            {editableData.directness === 'Balanced' && "Provides context but respects time."}
                                                            {editableData.directness === 'Elaborate' && "Detailed storytelling and thorough context."}
                                                            {!['Concise', 'Balanced', 'Elaborate'].includes(editableData.directness) && "Select a directness level to see details."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-px bg-ink/5 w-full"></div>

                                            {/* 4. Nuance & Instructions */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-semibold text-ink/80">Nuance & Instructions</label>
                                                    <span className="text-xs px-2 py-0.5 bg-highlight/10 text-highlight rounded-full font-medium">Exception Handler</span>
                                                </div>
                                                <div className="relative group">
                                                    <TextArea
                                                        value={editableData.tone_description || ''}
                                                        onChange={(e) => updateField('tone_description', e.target.value)}
                                                        rows={4}
                                                        placeholder="Add specific instructions that defy the settings above (e.g., 'I am usually formal, but I use emojis in internal Slack messages')."
                                                        className="font-sans text-sm leading-relaxed text-ink bg-white border border-ink/10 focus:border-azure focus:ring-1 focus:ring-azure transition-all p-4 resize-none rounded-lg shadow-sm group-hover:border-ink/20"
                                                    />
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Vocabulary Tab */}
                            {activeTab === 'vocabulary' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <Card className="bg-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><Sparkles size={18} className="text-azure" /> Frequent Vocabulary</CardTitle>
                                            <p className="text-sm text-ink/50 font-normal mt-1">Words and phrases this persona favors.</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                                                {editableData.vocabulary.frequent_words?.map((word, idx) => (
                                                    <div key={idx} className="group flex items-center gap-2 bg-paleslate px-3 py-1.5 rounded-full text-sm font-medium text-ink/80 hover:bg-azure/10 hover:text-azure transition-colors border border-transparent hover:border-azure/20">
                                                        {word}
                                                        <button onClick={() => removeWord('frequent', idx)} className="opacity-0 group-hover:opacity-100 text-azure/60 hover:text-azure">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-2.5 text-ink/30" size={18} />
                                                <Input
                                                    value={newWordInputs.frequent}
                                                    onChange={(e) => setNewWordInputs({ ...newWordInputs, frequent: e.target.value })}
                                                    placeholder="Type a word and hit Enter..."
                                                    onKeyDown={(e) => e.key === 'Enter' && addWord('frequent')}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-highlight"><Shield size={18} /> Restricted Vocabulary</CardTitle>
                                            <p className="text-sm text-ink/50 font-normal mt-1">Words this persona should never use.</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                                                {editableData.vocabulary.avoid_words?.map((word, idx) => (
                                                    <div key={idx} className="group flex items-center gap-2 bg-highlight/5 px-3 py-1.5 rounded-full text-sm font-medium text-ink/80 border border-highlight/20">
                                                        {word}
                                                        <button onClick={() => removeWord('avoid', idx)} className="opacity-0 group-hover:opacity-100 text-highlight/60 hover:text-highlight">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-2.5 text-highlight/50" size={18} />
                                                <Input
                                                    value={newWordInputs.avoid}
                                                    onChange={(e) => setNewWordInputs({ ...newWordInputs, avoid: e.target.value })}
                                                    placeholder="Type a banned word and hit Enter..."
                                                    onKeyDown={(e) => e.key === 'Enter' && addWord('avoid')}
                                                    className="pl-10 focus:border-highlight focus:ring-highlight"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Values Tab */}
                            {activeTab === 'values' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="bg-white h-full">
                                            <CardHeader><CardTitle>Core Values</CardTitle></CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {editableData.values?.map((value, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-paleslate rounded-lg border border-transparent hover:border-azure/20 group transition-all">
                                                            <span className="font-medium text-ink">{value}</span>
                                                            <button onClick={() => removeValue(idx)} className="text-ink/30 hover:text-highlight opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 flex gap-2">
                                                    <Input
                                                        value={newValueInput}
                                                        onChange={(e) => setNewValueInput(e.target.value)}
                                                        placeholder="Add Value..."
                                                        onKeyDown={(e) => e.key === 'Enter' && addValue()}
                                                    />
                                                    <Button onClick={addValue} variant="secondary" size="sm"><Plus size={18} /></Button>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-white h-full">
                                            <CardHeader><CardTitle>Ethics & Guidelines</CardTitle></CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {editableData.ethics?.map((ethic, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-paleslate rounded-lg border border-transparent hover:border-azure/20 group transition-all">
                                                            <span className="font-medium text-ink">{ethic}</span>
                                                            <button onClick={() => removeEthic(idx)} className="text-ink/30 hover:text-highlight opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 flex gap-2">
                                                    <Input
                                                        value={newEthicInput}
                                                        onChange={(e) => setNewEthicInput(e.target.value)}
                                                        placeholder="Add Ethic..."
                                                        onKeyDown={(e) => e.key === 'Enter' && addEthic()}
                                                    />
                                                    <Button onClick={addEthic} variant="secondary" size="sm"><Plus size={18} /></Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {/* Rules Engine Tab */}
                            {activeTab === 'rules' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-ink">Always Rules</h3>
                                            <span className="text-xs font-semibold bg-azure/10 text-azure px-2 py-1 rounded-full uppercase tracking-wider">High Priority</span>
                                        </div>

                                        {/* Active Rules */}
                                        {editableData.rules.always?.map((rule, idx) => (
                                            <div key={`active-${idx}`} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-ink/5 shadow-sm group hover:shadow-md transition-shadow">
                                                <div className="pt-1 cursor-pointer text-azure" onClick={() => toggleRuleStatus('always', rule, true)}>
                                                    <ToggleRight size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <textarea
                                                        value={rule}
                                                        onChange={(e) => updateRule('always', idx, e.target.value)}
                                                        className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-ink font-medium leading-relaxed"
                                                        rows={2}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeRule('always', idx)}
                                                    className="text-ink/20 hover:text-highlight pt-1"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Disabled Rules (from _disabled_rules) */}
                                        {(editableData as any)._disabled_rules?.always?.map((rule: string, idx: number) => (
                                            <div key={`disabled-${idx}`} className="flex items-start gap-4 p-4 bg-paleslate/50 rounded-xl border border-dashed border-ink/10 opacity-70 group">
                                                <div className="pt-1 cursor-pointer text-ink/30 hover:text-azure transition-colors" onClick={() => toggleRuleStatus('always', rule, false)}>
                                                    <ToggleLeft size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-ink/50 line-through">{rule}</p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-3 p-4 bg-white/50 border border-dashed border-ink/10 rounded-xl hover:bg-white hover:border-azure/30 transition-all">
                                            <Plus size={20} className="text-ink/40" />
                                            <Input
                                                value={newRuleInputs.always}
                                                onChange={(e) => setNewRuleInputs({ ...newRuleInputs, always: e.target.value })}
                                                placeholder="Add a new 'Always' rule..."
                                                onKeyDown={(e) => e.key === 'Enter' && addRule('always')}
                                                className="border-none bg-transparent shadow-none focus:ring-0 px-0 placeholder:text-ink/40"
                                            />
                                            <Button size="sm" variant="ghost" onClick={() => addRule('always')} disabled={!newRuleInputs.always}>Add</Button>
                                        </div>
                                    </div>

                                    <div className="h-px bg-ink/5 w-full"></div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-ink">Never Rules</h3>
                                            <span className="text-xs font-semibold bg-highlight/10 text-highlight px-2 py-1 rounded-full uppercase tracking-wider">Negative Constraints</span>
                                        </div>

                                        {/* Active Rules */}
                                        {editableData.rules.never?.map((rule, idx) => (
                                            <div key={`active-never-${idx}`} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-ink/5 shadow-sm group hover:shadow-md transition-shadow border-l-4 border-l-highlight">
                                                <div className="pt-1 cursor-pointer text-highlight" onClick={() => toggleRuleStatus('never', rule, true)}>
                                                    <ToggleRight size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <textarea
                                                        value={rule}
                                                        onChange={(e) => updateRule('never', idx, e.target.value)}
                                                        className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-ink font-medium leading-relaxed"
                                                        rows={2}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeRule('never', idx)}
                                                    className="text-ink/20 hover:text-highlight pt-1"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Disabled Rules (from _disabled_rules) */}
                                        {(editableData as any)._disabled_rules?.never?.map((rule: string, idx: number) => (
                                            <div key={`disabled-never-${idx}`} className="flex items-start gap-4 p-4 bg-paleslate/50 rounded-xl border border-dashed border-ink/10 opacity-70 group">
                                                <div className="pt-1 cursor-pointer text-ink/30 hover:text-highlight transition-colors" onClick={() => toggleRuleStatus('never', rule, false)}>
                                                    <ToggleLeft size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-ink/50 line-through">{rule}</p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-3 p-4 bg-white/50 border border-dashed border-ink/10 rounded-xl hover:bg-white hover:border-highlight/30 transition-all">
                                            <Plus size={20} className="text-ink/40" />
                                            <Input
                                                value={newRuleInputs.never}
                                                onChange={(e) => setNewRuleInputs({ ...newRuleInputs, never: e.target.value })}
                                                placeholder="Add a new 'Never' rule..."
                                                onKeyDown={(e) => e.key === 'Enter' && addRule('never')}
                                                className="border-none bg-transparent shadow-none focus:ring-0 px-0 placeholder:text-ink/40"
                                            />
                                            <Button size="sm" variant="ghost" onClick={() => addRule('never')} disabled={!newRuleInputs.never}>Add</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* JSON View (Legacy Tab) */}
                            {activeTab === 'json' && !showJsonSplit && (
                                <div className="bg-white rounded-xl shadow-sm border border-ink/5 overflow-hidden">
                                    <JsonViewer data={JSON.stringify(editableData, null, 2)} />
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* JSON Split View */}
                {showJsonSplit && (
                    <div className="w-1/2 bg-gunmetal border-t border-ink/10 flex flex-col h-full animate-in fade-in slide-in-from-right-10 duration-300">
                        <div className="bg-[#1E1E2E] px-4 py-3 flex justify-between items-center border-b border-white/5">
                            <span className="text-xs font-mono text-white/50 uppercase tracking-widest">Live Preview</span>
                            <Button variant="ghost" size="sm" onClick={() => setShowJsonSplit(false)} className="text-white/40 hover:text-white hover:bg-white/5">
                                Close
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto bg-[#1E1E2E] p-4">
                            <JsonViewer data={JSON.stringify(editableData, null, 2)} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};


