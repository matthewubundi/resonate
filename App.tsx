
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from './components/Layout';
import { Landing } from './views/Landing';
import { ResonateLoader } from './components/ResonateLoader';
import { Login } from './views/Login';
import { Signup } from './views/Signup';
import { CheckEmail } from './views/CheckEmail';
import { Verified } from './views/Verified';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { Transform } from './views/Transform';
import { HistoryPage } from './views/History';
import { AnalyticsPage } from './views/Analytics';
import { Memory } from './views/Memory';
import { Personas } from './views/Personas';
import Documentation from './views/Documentation';
import { Settings } from './views/Settings';
import { TermsOfService } from './views/TermsOfService';
import { PrivacyPolicy } from './views/PrivacyPolicy';

import { PageView } from './types';
import { Card, CardHeader, CardTitle, CardContent, Input, TextArea, Button, JsonViewer, Chip } from './components/Components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { User } from '@supabase/supabase-js';
import { useOnboarding } from './hooks/useOnboarding';
import { supabase } from './lib/supabase';
import { Copy, Check, AlertCircle, X } from 'lucide-react';

// --- Placeholder Pages for less critical UI ---



interface GeneratedIdentity {
  tone: string;
  tone_description?: string; // Detailed description of the tone (UI field)
  description?: string; // Database field (maps to tone_description)
  formality: string;
  directness: string;
  sentence_structure?: {
    typical_length: string;
    patterns: string[];
  };
  vocabulary: {
    frequent_words: string[];
    avoid_words: string[];
  };
  values: string[];
  ethics?: string[];
  humour?: string;
  formatting_preferences?: {
    default: string;
    structure: string;
    prefers_summaries?: boolean;
  };
  decision_style?: string;
  rules: {
    always: string[];
    never: string[];
  };
}

const IdentityEditor = () => {
  const { user } = useAuth();
  const [identityId, setIdentityId] = useState<string | null>(null);
  const [identityName, setIdentityName] = useState<string>('');
  const [originalName, setOriginalName] = useState<string>('');
  const [identityData, setIdentityData] = useState<GeneratedIdentity | null>(null);
  const [editableData, setEditableData] = useState<GeneratedIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [newWordInputs, setNewWordInputs] = useState<{ frequent: string; avoid: string }>({ frequent: '', avoid: '' });
  const [newValueInput, setNewValueInput] = useState('');
  const [newEthicInput, setNewEthicInput] = useState('');
  const [newRuleInputs, setNewRuleInputs] = useState<{ always: string; never: string }>({ always: '', never: '' });

  // Fetch identity data from database
  useEffect(() => {
    const fetchIdentity = async () => {
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
            // No identity found - this is okay
            setIdentityData(null);
            setEditableData(null);
            setIdentityName('');
          } else {
            throw fetchError;
          }
        } else if (data) {
          const identity = data.identity_json as GeneratedIdentity;
          // Map 'description' to 'tone_description' if it exists (for backward compatibility)
          if (identity.description && !identity.tone_description) {
            identity.tone_description = identity.description;
          }
          setIdentityId(data.id);
          const name = data.name || '';
          setIdentityName(name);
          setOriginalName(name);
          setIdentityData(identity);
          setEditableData(JSON.parse(JSON.stringify(identity))); // Deep copy for editing
        }
      } catch (err: any) {
        console.error('Error fetching identity:', err);
        setError(err.message || 'Failed to load identity data');
      } finally {
        setLoading(false);
      }
    };

    fetchIdentity();
  }, [user]);

  const handleCopy = async () => {
    if (!editableData) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(editableData, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    if (!user || !identityId || !editableData) {
      setError('Cannot save: Missing identity data');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Map tone_description to description for database storage
      const dataToSave = { ...editableData };
      if (dataToSave.tone_description !== undefined) {
        (dataToSave as any).description = dataToSave.tone_description;
        // Keep tone_description for UI consistency, but description is the canonical field
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

      // Update the original data as well (normalize description field)
      const updatedData = JSON.parse(JSON.stringify(editableData));
      if (updatedData.tone_description !== undefined) {
        updatedData.description = updatedData.tone_description;
      }
      setIdentityData(updatedData);
      setSuccess('Identity updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving identity:', err);
      setError(err.message || 'Failed to save identity data');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (identityData) {
      const resetData = JSON.parse(JSON.stringify(identityData));
      // Ensure tone_description is set from description if needed
      if (resetData.description && !resetData.tone_description) {
        resetData.tone_description = resetData.description;
      }
      setEditableData(resetData);
      setIdentityName(originalName);
      setNewWordInputs({ frequent: '', avoid: '' });
      setNewValueInput('');
      setNewEthicInput('');
      setNewRuleInputs({ always: '', never: '' });
      setError(null);
      setSuccess(null);
    }
  };

  const hasChanges = () => {
    if (!identityData || !editableData) return false;
    const dataChanged = JSON.stringify(identityData) !== JSON.stringify(editableData);
    const nameChanged = identityName !== originalName;
    return dataChanged || nameChanged;
  };

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


  return (
    <div className="space-y-6">
      {/* Success Message */}
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
            <AlertCircle size={16} />
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="text-highlight flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-highlight mb-1">Error</p>
              <p className="text-sm text-ink/80">{error}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            <AlertCircle size={16} />
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      {editableData && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-ink">Identity Editor</h1>
          <div className="flex gap-3">
            {hasChanges() && (
              <Button variant="outline" onClick={handleReset} disabled={saving}>
                Reset
              </Button>
            )}
            <Button onClick={handleSave} isLoading={saving} disabled={!hasChanges() || saving}>
              Save Changes
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-ink/5">
              <CardTitle className="text-lg">Core Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-paleslate rounded w-3/4"></div>
                  <div className="h-20 bg-paleslate rounded"></div>
                </div>
              ) : editableData ? (
                <>
                  <div>
                    <Input
                      label="Identity Name"
                      value={identityName}
                      onChange={(e) => setIdentityName(e.target.value)}
                      placeholder="e.g. Work Persona, Personal Blog"
                      className="mb-4"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Tone"
                      value={editableData.tone || ''}
                      onChange={(e) => setEditableData({ ...editableData, tone: e.target.value })}
                      placeholder="e.g. Professional, Casual"
                    />
                    <Input
                      label="Formality"
                      value={editableData.formality || ''}
                      onChange={(e) => setEditableData({ ...editableData, formality: e.target.value })}
                      placeholder="e.g. Formal, Informal"
                    />
                    <Input
                      label="Directness"
                      value={editableData.directness || ''}
                      onChange={(e) => setEditableData({ ...editableData, directness: e.target.value })}
                      placeholder="e.g. Direct, Indirect"
                    />
                    {editableData.decision_style !== undefined && (
                      <Input
                        label="Decision Style"
                        value={editableData.decision_style || ''}
                        onChange={(e) => setEditableData({ ...editableData, decision_style: e.target.value })}
                        placeholder="e.g. Analytical, Intuitive"
                      />
                    )}
                  </div>

                  <div>
                    <TextArea
                      label="Tone Description"
                      value={editableData.tone_description || ''}
                      onChange={(e) => setEditableData({ ...editableData, tone_description: e.target.value })}
                      placeholder="Add detailed description of how the AI should sound, including nuances and specific characteristics..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-sm font-bold mb-3 block text-ink">Vocabulary</label>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wide">Frequent Words</p>
                          {editableData.vocabulary.frequent_words && editableData.vocabulary.frequent_words.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {editableData.vocabulary.frequent_words.map((word, idx) => (
                                <Chip key={idx} label={word} onRemove={() => removeWord('frequent', idx)} />
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Input
                              value={newWordInputs.frequent}
                              onChange={(e) => setNewWordInputs({ ...newWordInputs, frequent: e.target.value })}
                              placeholder="Add frequent word"
                              onKeyPress={(e) => e.key === 'Enter' && addWord('frequent')}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={() => addWord('frequent')} className="shrink-0">Add</Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wide">Avoid Words</p>
                          {editableData.vocabulary.avoid_words && editableData.vocabulary.avoid_words.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {editableData.vocabulary.avoid_words.map((word, idx) => (
                                <Chip key={idx} label={word} onRemove={() => removeWord('avoid', idx)} />
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Input
                              value={newWordInputs.avoid}
                              onChange={(e) => setNewWordInputs({ ...newWordInputs, avoid: e.target.value })}
                              placeholder="Add word to avoid"
                              onKeyPress={(e) => e.key === 'Enter' && addWord('avoid')}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={() => addWord('avoid')} className="shrink-0">Add</Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="text-sm font-bold mb-3 block text-ink">Core Values</label>
                      {editableData.values && editableData.values.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {editableData.values.map((value, idx) => (
                            <Chip key={idx} label={value} onRemove={() => removeValue(idx)} />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newValueInput}
                          onChange={(e) => setNewValueInput(e.target.value)}
                          placeholder="Add core value"
                          onKeyPress={(e) => e.key === 'Enter' && addValue()}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={addValue} className="shrink-0">Add</Button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="text-sm font-bold mb-3 block text-ink">Ethics</label>
                      {editableData.ethics && editableData.ethics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {editableData.ethics.map((ethic, idx) => (
                            <Chip key={idx} label={ethic} onRemove={() => removeEthic(idx)} />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newEthicInput}
                          onChange={(e) => setNewEthicInput(e.target.value)}
                          placeholder="Add ethic"
                          onKeyPress={(e) => e.key === 'Enter' && addEthic()}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={addEthic} className="shrink-0">Add</Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-ink/60">
                  <p className="text-sm">No identity data available</p>
                  <p className="text-xs mt-2">Complete onboarding to create your identity profile</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-ink/5">
              <CardTitle className="text-lg">Rules Engine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-paleslate rounded"></div>
                  <div className="h-10 bg-paleslate rounded"></div>
                </div>
              ) : editableData ? (
                <>
                  <div>
                    <label className="text-sm font-bold mb-3 block text-ink">Always Rules</label>
                    <div className="space-y-3 mb-4">
                      {editableData.rules.always && editableData.rules.always.length > 0 ? (
                        editableData.rules.always.map((rule, idx) => (
                          <div key={idx} className="flex items-center gap-3 group">
                            <div className="flex-1">
                              <TextArea
                                value={rule}
                                onChange={(e) => {
                                  const newRules = [...(editableData.rules.always || [])];
                                  newRules[idx] = e.target.value;
                                  setEditableData({
                                    ...editableData,
                                    rules: { ...editableData.rules, always: newRules }
                                  });
                                }}
                                rows={2}
                                className="text-sm"
                                placeholder="Enter always rule..."
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRule('always', idx)}
                              className="h-8 w-8 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} className="text-highlight" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-ink/40 italic">No always rules defined</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newRuleInputs.always}
                        onChange={(e) => setNewRuleInputs({ ...newRuleInputs, always: e.target.value })}
                        placeholder="Add always rule"
                        onKeyPress={(e) => e.key === 'Enter' && addRule('always')}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => addRule('always')} className="shrink-0">Add</Button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-sm font-bold mb-3 block text-ink">Never Rules</label>
                    <div className="space-y-3 mb-4">
                      {editableData.rules.never && editableData.rules.never.length > 0 ? (
                        editableData.rules.never.map((rule, idx) => (
                          <div key={idx} className="flex items-center gap-3 group">
                            <div className="flex-1">
                              <TextArea
                                value={rule}
                                onChange={(e) => {
                                  const newRules = [...(editableData.rules.never || [])];
                                  newRules[idx] = e.target.value;
                                  setEditableData({
                                    ...editableData,
                                    rules: { ...editableData.rules, never: newRules }
                                  });
                                }}
                                rows={2}
                                className="text-sm"
                                placeholder="Enter never rule..."
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRule('never', idx)}
                              className="h-8 w-8 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} className="text-highlight" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-ink/40 italic">No never rules defined</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newRuleInputs.never}
                        onChange={(e) => setNewRuleInputs({ ...newRuleInputs, never: e.target.value })}
                        placeholder="Add never rule"
                        onKeyPress={(e) => e.key === 'Enter' && addRule('never')}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => addRule('never')} className="shrink-0">Add</Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-ink/60">
                  <p className="text-sm">No rules available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="bg-white shadow-sm border-ink/10 h-full">
            <CardHeader className="border-b border-ink/5 bg-white rounded-t-xl">
              <CardTitle className="text-lg text-ink flex justify-between items-center">
                <span>JSON Preview</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-azure hover:text-azure-hover hover:bg-azure/10"
                  onClick={handleCopy}
                  disabled={!editableData}
                  title="Copy JSON"
                >
                  {copySuccess ? (
                    <Check size={16} className="text-azure" />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-paleslate rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-paleslate rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ) : editableData ? (
                <div className="max-h-[calc(100vh-300px)] overflow-auto">
                  <JsonViewer data={JSON.stringify(editableData, null, 2)} />
                </div>
              ) : (
                <div className="p-8 text-center text-ink/60">
                  <p className="text-sm">No identity data to preview</p>
                  <p className="text-xs mt-2">Complete onboarding to generate your identity profile</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


const SettingsPage = ({ user }: { user: User | null }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
          'Authorization': `Bearer ${session.access_token} `,
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

  return (
    <div className="max-w-3xl space-y-6">
      {/* Success Message */}
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

      {/* Error Message */}
      {error && (
        <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="text-highlight flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-highlight mb-1">Error</p>
              <p className="text-sm text-ink/80">{error}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            <X size={16} />
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
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
    </div>
  );
};

// --- Main App Component ---

const AppContent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Detect current route and map to view
  const getInitialView = (): PageView => {
    if (typeof window === 'undefined') return 'landing';

    const routeMap: Record<string, PageView> = {
      '/dashboard': 'dashboard',
      '/transform': 'transform',
      '/login': 'login',
      '/signup': 'signup',
      '/editor': 'editor',
      '/analytics': 'analytics',
      '/history': 'history',
      '/settings': 'settings',
      '/onboarding': 'onboarding',
      '/memory': 'memory',
      '/personas': 'personas',
      '/documentation': 'documentation',
      '/check-email': 'check-email',
      '/verified': 'verified',
      '/terms': 'terms',
      '/privacy': 'privacy',
    };

    return routeMap[pathname || '/'] || 'landing';
  };

  const [view, setView] = useState<PageView>(getInitialView());
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light
  const { user, signOut, loading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading, refetch: refetchOnboarding } = useOnboarding(user);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Only set initial view on mount, don't update on pathname changes
  // This prevents unnecessary re-renders when switching browser tabs
  useEffect(() => {
    const currentView = getInitialView();
    // Only update if view is different from current
    setView(prev => {
      if (prev !== currentView) {
        return currentView;
      }
      return prev;
    });
  }, []); // Empty dependency array - only run on mount

  // Check onboarding status and redirect if needed
  useEffect(() => {
    if (!loading && !onboardingLoading && user) {
      // If user is authenticated but hasn't completed onboarding
      if (onboardingCompleted === false) {
        // Only redirect if not already on onboarding or public pages
        const publicPages = ['landing', 'login', 'signup', 'onboarding', 'loading', 'documentation', 'check-email', 'verified', 'terms', 'privacy'];
        if (!publicPages.includes(view)) {
          router.push('/onboarding');
          setView('onboarding');
        }
      }
    }
  }, [user, loading, onboardingLoading, onboardingCompleted, view, router]);

  // Track if we're waiting for signup authentication
  const [pendingSignup, setPendingSignup] = useState(false);
  // Track if we're waiting for login authentication
  const [pendingLogin, setPendingLogin] = useState(false);
  // Track email for verification step
  const [verificationEmail, setVerificationEmail] = useState<string | undefined>(undefined);

  // Watch for user authentication after login
  useEffect(() => {
    if (pendingLogin && user && !onboardingLoading) {
      setPendingLogin(false);

      // Navigate immediately without artificial delay
      if (onboardingCompleted === false) {
        router.push('/onboarding');
        setView('onboarding');
      } else {
        router.push('/dashboard');
        setView('dashboard');
      }
    }
  }, [user, pendingLogin, onboardingCompleted, onboardingLoading, router]);

  // Watch for user authentication after signup
  useEffect(() => {
    if (pendingSignup && user && !onboardingLoading) {
      // User is now authenticated, check onboarding status
      setPendingSignup(false);

      // Navigate immediately without artificial delay
      if (onboardingCompleted === false) {
        // New user needs onboarding
        router.push('/onboarding');
        setView('onboarding');
      } else {
        // User has completed onboarding, go to dashboard
        router.push('/dashboard');
        setView('dashboard');
      }
    }
  }, [user, pendingSignup, onboardingCompleted, onboardingLoading, router]);

  // Handle login
  const handleLogin = () => {
    // Set pending flag - navigation will happen in useEffect once auth state updates
    setPendingLogin(true);
  };

  // Handle signup
  const handleSignup = () => {
    // If user is already authenticated, check onboarding status
    // This happens when email confirmation is disabled in Supabase
    if (user) {
      // Navigate immediately without artificial delay
      if (onboardingCompleted === false) {
        router.push('/onboarding');
        setView('onboarding');
      } else {
        router.push('/dashboard');
        setView('dashboard');
      }
    } else {
      // Auth state might still be updating after signup
      // Set pending flag and wait for auth state to update via useEffect
      setPendingSignup(true);
      // Note: If email confirmation is required, the Signup component
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Protected route handler
  const handleNavigate = (page: PageView) => {
    // If trying to access protected pages without authentication, redirect to login
    const protectedPages: PageView[] = ['dashboard', 'transform', 'editor', 'analytics', 'history', 'memory', 'personas', 'settings'];

    if (protectedPages.includes(page) && !user) {
      router.push('/login');
      return;
    }

    // If user is authenticated but hasn't completed onboarding, redirect to onboarding
    // (except if they're already going to onboarding or public pages)
    if (user && onboardingCompleted === false && protectedPages.includes(page)) {
      router.push('/onboarding');
      return;
    }

    // Map page views to routes
    const routeMap: Record<PageView, string> = {
      'landing': '/',
      'login': '/login',
      'signup': '/signup',
      'dashboard': '/dashboard',
      'transform': '/transform',
      'editor': '/editor',
      'analytics': '/analytics',
      'history': '/history',
      'settings': '/settings',
      'onboarding': '/onboarding',
      'loading': '/loading',
      'memory': '/memory',
      'personas': '/personas',
      'review': '/review',
      'documentation': '/documentation',
      'check-email': '/check-email',
      'verified': '/verified',
      'terms': '/terms',
      'privacy': '/privacy',
    };

    router.push(routeMap[page] || '/');
  };

  // Show loading screen while checking authentication and onboarding status
  if (loading || onboardingLoading) {
    return <ResonateLoader />;
  }

  // Routing Logic
  const renderView = () => {
    switch (view) {
      case 'landing':
        return <Landing onLogin={() => handleNavigate('login')} onSignup={() => handleNavigate('signup')} onNavigate={handleNavigate} />;
      case 'login':
        return (
          <Login
            onLogin={handleLogin}
            onNavigateToSignup={() => handleNavigate('signup')}
            onBack={() => handleNavigate('landing')}
            onNavigate={handleNavigate}
          />
        );
      case 'signup':
        return (
          <Signup
            onSignup={handleSignup}
            onNavigateToLogin={() => handleNavigate('login')}
            onBack={() => handleNavigate('landing')}
            onNavigateToCheckEmail={(email) => {
              setVerificationEmail(email);
              // Handle view change manually since we want to pass state, 
              // though handleNavigate updates URL which is fine.
              // We'll trust handleNavigate to update view state via URL or internal logic if we implemented that,
              // but here handleNavigate updates URL and view state syncs via useEffect or router.
              // Actually handleNavigate uses router.push.
              router.push('/check-email');
              setView('check-email');
            }}
            onNavigate={handleNavigate}
          />
        );
      case 'check-email':
        return (
          <CheckEmail
            email={verificationEmail}
            onNavigateToLogin={() => handleNavigate('login')}
            onVerified={() => {
              // When verified (session detected), go to dashboard
              // Check onboarding status first?
              // The main useEffect for auth changes will handle onboarding redirect if needed.
              // But we can force a push here.
              router.push('/dashboard');
              setView('dashboard');
            }}
          />
        );
      case 'verified':
        return (
          <Verified
            onNavigateToDashboard={() => {
              handleNavigate('dashboard');
            }}
          />
        );
      case 'onboarding':
        return (
          <Onboarding
            onComplete={async () => {
              // Refetch onboarding status after completion
              await refetchOnboarding();
              // After onboarding completes, go to loading screen then dashboard
              setView('loading');
            }}
            onBack={() => {
              if (user) {
                // If logged in, go to dashboard (they can't skip onboarding)
                router.push('/dashboard');
              } else {
                // If not logged in, go to landing
                setView('landing');
              }
            }}
          />
        );
      case 'loading':
        return <ResonateLoader onComplete={() => {
          setView('dashboard');
          router.push('/dashboard');
        }} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'transform':
        return <Transform />;
      case 'editor':
        return <IdentityEditor />;
      case 'analytics':
        return <AnalyticsPage onNavigate={handleNavigate} />;
      case 'history':
        return <HistoryPage onNavigate={handleNavigate} />;
      case 'memory':
        return <Memory />;
      case 'personas':
        return <Personas onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings onNavigate={handleNavigate} />;
      case 'documentation':
        return <Documentation onBack={() => handleNavigate('landing')} />;
      case 'terms':
        return <TermsOfService onBack={() => handleNavigate('landing')} />;
      case 'privacy':
        return <PrivacyPolicy onBack={() => handleNavigate('landing')} />;
      default:
        return <div className="p-8 text-center text-ink">Page: {view} (Placeholder)</div>;
    }
  };

  // Wrapper for logged-in pages
  if (view === 'landing' || view === 'login' || view === 'signup' || view === 'onboarding' || view === 'loading' || view === 'documentation' || view === 'check-email' || view === 'verified' || view === 'terms' || view === 'privacy') {
    return (
      <div className="bg-paper min-h-screen text-ink font-sans selection:bg-azure/20 selection:text-azure">
        {renderView()}
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen text-ink font-sans selection:bg-azure/20 selection:text-azure">
      <Layout
        activePage={view}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        user={user}
      >
        {renderView()}
      </Layout>
    </div>
  );
};

// Wrap the app with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;