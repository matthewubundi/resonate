import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Sparkles,
  Mic,
  Feather,
  Layout,
  FileText,
  User,
  Zap,
  Heart,
  Target,
  Shield,
  Clock,
  Lightbulb,
  Search,
  Scale,
  Code
} from 'lucide-react';
import { Button, Input, TextArea, Card, CardContent } from '../components/Components';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

interface OnboardingData {
  // Step 0: Communication Style
  professionalVoice: string; // Stored as comma-separated string of selected attributes
  writingGoal: string;

  // Step 1: Vocabulary & Tone
  frequentWords: string;
  hatedWords: string;
  tone: 'formal' | 'conversational' | '';

  // Step 2: Values & Ethics
  coreValue1: string;
  coreValue2: string;
  neverRule: string;

  // Step 3: Structure
  formattingPreference: 'bullets' | 'paragraphs' | '';

  // Step 4: Writing Samples
  sample1: string; // We'll stick to the interface but populate sample1 with the big text, sample2 empty
  sample2: string;
}

// Constant options for selections
const VOICE_ATTRIBUTES = [
  "Direct", "Empathetic", "Analytical", "Witty",
  "Authoritative", "Friendly", "Concise", "Detailed",
  "Professional", "Casual", "Persuasive", "Objective"
];

const CORE_VALUES = [
  { id: "Transparency", icon: Search, label: "Transparency" },
  { id: "Speed", icon: Zap, label: "Speed" },
  { id: "Accuracy", icon: Target, label: "Accuracy" },
  { id: "Innovation", icon: Lightbulb, label: "Innovation" },
  { id: "Empathy", icon: Heart, label: "Empathy" },
  { id: "Reliability", icon: Shield, label: "Reliability" },
  { id: "Efficiency", icon: Clock, label: "Efficiency" },
  { id: "Integrity", icon: Scale, label: "Integrity" }
];

const STEPS = [
  { label: 'Voice', icon: Mic },
  { label: 'Vocabulary', icon: Feather },
  { label: 'Values', icon: Heart },
  { label: 'Structure', icon: Layout },
  { label: 'Samples', icon: FileText },
  { label: 'Review', icon: User }
];

const getStorageKey = (userId: string | undefined) => {
  return userId ? `onboarding_${userId}` : 'onboarding_guest';
};

const getInitialFormData = (): OnboardingData => ({
  professionalVoice: '',
  writingGoal: '',
  frequentWords: '',
  hatedWords: '',
  tone: '',
  coreValue1: '',
  coreValue2: '',
  neverRule: '',
  formattingPreference: '',
  sample1: '',
  sample2: '',
});

interface GeneratedIdentity {
  tone: string;
  formality: string;
  directness: string;
  sentence_structure: {
    typical_length: string;
    patterns: string[];
  };
  vocabulary: {
    frequent_words: string[];
    avoid_words: string[];
  };
  values: string[];
  ethics: string[];
  humour: string;
  formatting_preferences: {
    default: string;
    structure: string;
    prefers_summaries: boolean;
  };
  decision_style: string;
  rules: {
    always: string[];
    never: string[];
  };
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBack }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [generatedIdentity, setGeneratedIdentity] = useState<GeneratedIdentity | null>(null);

  const [formData, setFormData] = useState<OnboardingData>(getInitialFormData());

  // Additional state for new UI components
  const [voiceInput, setVoiceInput] = useState(''); // For custom "Other" voice input
  const [wordCount, setWordCount] = useState(0);
  const [analyzingSamples, setAnalyzingSamples] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsInitialized(true);
      return;
    }

    const storageKey = getStorageKey(user?.id);
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) {
          setFormData(parsed.formData);
          // If we have a single sample1 bloat (new method), count words
          if (parsed.formData.sample1) {
            setWordCount(parsed.formData.sample1.trim().split(/\s+/).length);
          }
        }
        if (typeof parsed.step === 'number' && parsed.step >= 0 && parsed.step < STEPS.length) {
          setStep(parsed.step);
        }
        if (parsed.generatedIdentity) {
          setGeneratedIdentity(parsed.generatedIdentity);
        }
      } catch (err) {
        console.error('Failed to parse saved onboarding data:', err);
        localStorage.removeItem(storageKey);
      }
    }
    setIsInitialized(true);
  }, [user?.id]);

  // Save data to localStorage whenever formData or step changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    const storageKey = getStorageKey(user?.id);
    const dataToSave = {
      formData,
      step,
      generatedIdentity,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (err) {
      console.error('Failed to save onboarding data to localStorage:', err);
    }
  }, [formData, step, generatedIdentity, isInitialized, user?.id]);

  // Clear guest data when user logs in
  useEffect(() => {
    if (user?.id && typeof window !== 'undefined') {
      const guestKey = 'onboarding_guest';
      const guestData = localStorage.getItem(guestKey);
      if (guestData) {
        localStorage.removeItem(guestKey);
      }
    }
  }, [user?.id]);

  const updateField = (field: keyof OnboardingData, value: string | 'formal' | 'conversational' | 'bullets' | 'paragraphs') => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleVoiceToggle = (voice: string) => {
    const currentVoices = formData.professionalVoice ? formData.professionalVoice.split(',').map(v => v.trim()) : [];
    let newVoices;
    if (currentVoices.includes(voice)) {
      newVoices = currentVoices.filter(v => v !== voice);
    } else {
      newVoices = [...currentVoices, voice];
    }
    updateField('professionalVoice', newVoices.join(', '));
  };

  const handleValueToggle = (value: string) => {
    // We only support coreValue1 and coreValue2 for API compat currently
    // We'll manage a virtual "selectedValues" list
    const currentValues = [formData.coreValue1, formData.coreValue2].filter(v => v);
    let newValues;
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      if (currentValues.length >= 2) {
        // Replace the first one (FIFO) or just block? Strategy says "Selection". Let's cap at 2 for now to match strict schema
        newValues = [...currentValues.slice(1), value];
      } else {
        newValues = [...currentValues, value];
      }
    }

    updateField('coreValue1', newValues[0] || '');
    updateField('coreValue2', newValues[1] || '');
  };

  const handleSampleChange = (text: string) => {
    updateField('sample1', text);
    // Real-time word count
    const count = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    setWordCount(count);

    // Simulate smart analysis 
    if (count > 50 && !analyzingSamples) {
      setAnalyzingSamples(true);
      setTimeout(() => setAnalyzingSamples(false), 1500);
    }
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 0:
        if (!formData.professionalVoice.trim() || !formData.writingGoal.trim()) {
          setError('Please select at least one voice attribute and define your goal.');
          return false;
        }
        return true;
      case 1:
        if (!formData.frequentWords.trim() || !formData.hatedWords.trim() || !formData.tone) {
          setError('Please fill in words and tone preference.');
          return false;
        }
        return true;
      case 2:
        if (!formData.coreValue1.trim() || !formData.coreValue2.trim() || !formData.neverRule.trim()) {
          if (!formData.coreValue1 && !formData.coreValue2) {
            setError('Please select at least one core value.');
            return false;
          }
          if (!formData.neverRule.trim()) {
            setError('Please define a "Never" rule.');
            return false;
          }
        }
        return true;
      case 3:
        if (!formData.formattingPreference) {
          setError('Please select a structure preference.');
          return false;
        }
        return true;
      case 4:
        if (!formData.sample1.trim() || formData.sample1.trim().length < 50) {
          setError('Please provide a substantive writing sample (at least 50 words).');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) {
      return;
    }

    if (step === 4) {
      await generateIdentity();
      return;
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      setError(null);
    } else {
      await handleComplete();
    }
  };

  const generateIdentity = async () => {
    if (!user) {
      setError('You must be logged in to generate your identity.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to generate your identity.');
        setIsGenerating(false);
        return;
      }

      // We split sample1 into samples array if sample2 is empty
      const samples = [formData.sample1];
      if (formData.sample2) samples.push(formData.sample2);

      const rawInput = {
        values: {
          coreValues: [formData.coreValue1, formData.coreValue2],
          neverRule: formData.neverRule,
        },
        vocabulary: {
          frequentWords: formData.frequentWords.split(',').map(w => w.trim()).filter(w => w),
          hatedWords: formData.hatedWords.split(',').map(w => w.trim()).filter(w => w),
          tone: formData.tone,
        },
        writingSamples: samples,
        formattingPreference: formData.formattingPreference,
        professionalVoice: formData.professionalVoice,
        writingGoal: formData.writingGoal,
      };

      const response = await fetch('/api/onboarding/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(rawInput),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate identity profile');
      }

      const { data } = await response.json();
      setGeneratedIdentity(data);
      setStep(5);
    } catch (err: any) {
      setError(err.message || 'Failed to generate identity profile. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !generatedIdentity) {
      setError('You must generate your identity profile before completing onboarding.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error: identityError } = await supabase
        .from('identities')
        .insert({
          user_id: user.id,
          identity_json: generatedIdentity,
          is_active: true,
          version_number: 1,
        });

      if (identityError) throw identityError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (typeof window !== 'undefined') {
        const storageKey = getStorageKey(user.id);
        localStorage.removeItem(storageKey);
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to save onboarding data. Please try again.');
      setIsSaving(false);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      setError(null);
    } else {
      onBack();
    }
  };

  const handleRegenerate = async () => {
    setStep(4);
    setGeneratedIdentity(null);
    setError(null);
  };

  // Helper to check if a value is selected
  const isValueSelected = (val: string) => {
    return formData.coreValue1 === val || formData.coreValue2 === val;
  };

  // Helper to check if voice attribute is selected
  const isVoiceSelected = (val: string) => {
    return formData.professionalVoice.toLowerCase().includes(val.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-paleslate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-ink/40 mb-3 px-1">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 ${step >= i ? 'text-azure' : 'text-ink/20'}`}>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-sm">
            <div
              className="h-full bg-azure transition-all duration-500 ease-out animate-pulse"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="min-h-[650px] flex flex-col shadow-2xl shadow-ink/5 border-none bg-paper overflow-hidden">
          <div className="p-10 border-b border-paleslate bg-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-10 w-10 rounded-full bg-azure/10 flex items-center justify-center text-azure">
                {React.createElement(STEPS[step].icon, { size: 20 })}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-ink tracking-tight">{STEPS[step].label}</h2>
                <p className="text-ink/50 font-medium">Step {step + 1} of {STEPS.length}</p>
              </div>
            </div>
          </div>

          <CardContent className="flex-1 overflow-y-auto bg-white p-10">
            {error && (
              <div className="mb-6 p-4 bg-highlight/10 border border-highlight/20 rounded-xl flex items-start gap-3 text-sm text-ink/80">
                <AlertCircle size={18} className="text-highlight flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="animate-fade-in max-w-2xl mx-auto">
              {step === 0 && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-lg font-bold text-ink mb-4">How would you describe your professional voice?</label>
                    <div className="flex flex-wrap gap-3">
                      {VOICE_ATTRIBUTES.map(voice => (
                        <button
                          key={voice}
                          onClick={() => handleVoiceToggle(voice)}
                          className={`px-4 py-2 rounded-full border transition-all duration-200 font-medium ${isVoiceSelected(voice)
                              ? 'bg-azure text-white border-azure shadow-md transform scale-105'
                              : 'bg-paleslate text-ink/70 border-transparent hover:bg-slate-200'
                            }`}
                        >
                          {voice}
                        </button>
                      ))}
                      <div className="flex items-center gap-2 min-w-[150px]">
                        <span className="text-ink/40 text-sm">Other:</span>
                        <input
                          className="bg-transparent border-b border-ink/20 focus:border-azure outline-none py-1 px-2 text-ink text-sm w-full"
                          placeholder="Type..."
                          value={voiceInput}
                          onChange={(e) => {
                            setVoiceInput(e.target.value);
                            const parts = formData.professionalVoice.split(', ').filter(v => v !== voiceInput);
                            if (e.target.value) parts.push(e.target.value);
                            updateField('professionalVoice', parts.join(', '));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-paleslate">
                    <TextArea
                      label="What is your primary goal when writing?"
                      placeholder="e.g. To inform stakeholders with absolute clarity..."
                      rows={3}
                      value={formData.writingGoal}
                      onChange={(e) => updateField('writingGoal', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <Input
                      label="3 words you use frequently"
                      placeholder="e.g. Synergize, leverage..."
                      value={formData.frequentWords}
                      onChange={(e) => updateField('frequentWords', e.target.value)}
                    />
                    <Input
                      label="3 words you hate"
                      placeholder="e.g. Utilized, bandwidth..."
                      value={formData.hatedWords}
                      onChange={(e) => updateField('hatedWords', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-ink mb-4">Tone Preference</label>
                    <div className="grid grid-cols-2 gap-6">
                      {['formal', 'conversational'].map((t) => (
                        <div
                          key={t}
                          className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.tone === t
                              ? 'border-azure bg-azure/5 shadow-lg'
                              : 'border-paleslate bg-slate-50 hover:border-azure/30'
                            }`}
                          onClick={() => updateField('tone', t as any)}
                        >
                          {formData.tone === t && (
                            <div className="absolute top-4 right-4 bg-azure rounded-full p-1">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                          <h4 className="font-bold text-ink capitalize text-lg mb-2">{t}</h4>
                          <p className="text-sm text-ink/60">
                            {t === 'formal'
                              ? 'Strict grammar, no contractions. High precision and distance.'
                              : 'Approachable, natural flow. Uses contractions and warmth.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-lg font-bold text-ink mb-2">Select Top 2 Core Values</label>
                    <p className="text-ink/50 text-sm mb-6">These define the ethical backbone of your persona.</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {CORE_VALUES.map((val) => {
                        const isSelected = isValueSelected(val.label);
                        return (
                          <div
                            key={val.id}
                            onClick={() => handleValueToggle(val.label)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer h-32 text-center gap-3 ${isSelected
                                ? 'border-azure bg-azure text-white shadow-xl scale-105'
                                : 'border-paleslate bg-white text-ink hover:border-azure/50 hover:shadow-md'
                              }`}
                          >
                            <val.icon size={24} className={isSelected ? 'text-white' : 'text-azure'} />
                            <span className="font-bold text-sm">{val.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-paleslate">
                    <TextArea
                      label="The Absolute 'Never' Rule"
                      placeholder="e.g. Never apologize for things out of my control..."
                      value={formData.neverRule}
                      onChange={(e) => updateField('neverRule', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-ink">How should your documents look?</h3>
                    <p className="text-ink/50 mt-2">Visual patterns process faster than text.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div
                      onClick={() => updateField('formattingPreference', 'bullets')}
                      className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.formattingPreference === 'bullets'
                          ? 'border-azure bg-azure/5 shadow-xl'
                          : 'border-paleslate hover:border-azure/30'
                        }`}
                    >
                      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-ink/5 aspect-[4/3] flex flex-col gap-2 overflow-hidden relative">
                        <div className="w-3/4 h-2 bg-slate-200 rounded-full mb-2"></div>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-azure shrink-0 mt-1"></div>
                            <div className="flex-1 space-y-1">
                              <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                              <div className="w-2/3 h-1.5 bg-slate-100 rounded-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-ink">Action-Oriented</span>
                        {formData.formattingPreference === 'bullets' && <div className="w-3 h-3 bg-azure rounded-full shadow-sm" />}
                      </div>
                      <p className="text-sm text-ink/50 mt-1">Heavy use of bullets and lists.</p>
                    </div>

                    <div
                      onClick={() => updateField('formattingPreference', 'paragraphs')}
                      className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.formattingPreference === 'paragraphs'
                          ? 'border-azure bg-azure/5 shadow-xl'
                          : 'border-paleslate hover:border-azure/30'
                        }`}
                    >
                      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-ink/5 aspect-[4/3] flex flex-col gap-2 overflow-hidden relative">
                        <div className="w-1/2 h-2 bg-slate-200 rounded-full mb-2"></div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                        <div className="w-3/4 h-1.5 bg-slate-100 rounded-full mb-2"></div>

                        <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                        <div className="w-2/3 h-1.5 bg-slate-100 rounded-full"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-ink">Narrative Flow</span>
                        {formData.formattingPreference === 'paragraphs' && <div className="w-3 h-3 bg-azure rounded-full shadow-sm" />}
                      </div>
                      <p className="text-sm text-ink/50 mt-1">Detailed, connected prose.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                      <Sparkles className="text-highlight fill-highlight" size={20} />
                      Feed the Engine
                    </h3>
                    <p className="text-ink/50 mt-1">Paste your best writing samples here. The more you add, the better we learn.</p>
                  </div>

                  <div className="relative">
                    <TextArea
                      placeholder="Paste e-mails, reports, or articles here..."
                      rows={12}
                      value={formData.sample1}
                      onChange={(e) => handleSampleChange(e.target.value)}
                      className="resize-none font-mono text-sm leading-relaxed"
                    />

                    {/* Micro-interactions */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      {analyzingSamples && (
                        <div className="bg-ink/5 text-ink/70 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-azure animate-ping"></div>
                          Analyzing pattern...
                        </div>
                      )}
                      {wordCount > 0 && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-all ${wordCount > 50 ? 'bg-highlight text-ink' : 'bg-slate-100 text-slate-400'
                          }`}>
                          {wordCount} words detected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && generatedIdentity && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-white to-paleslate p-8 rounded-2xl border border-ink/5 shadow-sm">
                    {/* Identity Header */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-azure to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                        {user?.email?.[0].toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-ink">Analysis Complete</h3>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-azure/10 text-azure text-xs font-bold border border-azure/20">
                            {generatedIdentity.tone}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-highlight/10 text-highlight-dark text-xs font-bold border border-highlight/20 text-yellow-700">
                            {generatedIdentity.decision_style}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attribute Bars */}
                    <div className="space-y-4 mb-8">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-ink/60 mb-1">
                          <span>Formality</span>
                          <span className="text-ink">{generatedIdentity.formality}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-azure" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-ink/60 mb-1">
                          <span>Directness</span>
                          <span className="text-ink">{generatedIdentity.directness}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-ink" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* JSON Preview */}
                    <details className="group">
                      <summary className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/40 cursor-pointer hover:text-azure transition-colors">
                        <Code size={14} /> View Raw Configuration
                      </summary>
                      <div className="mt-4 bg-slate-900 rounded-lg p-4 overflow-hidden">
                        <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
                          {JSON.stringify(generatedIdentity, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardContent className="border-t border-paleslate bg-white p-8">
            <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
              <Button variant="ghost" onClick={handlePrev} disabled={step === 0 || isSaving} className="text-ink/50 hover:text-ink">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              <div className="flex gap-3">
                {step === 5 && (
                  <Button variant="ghost" onClick={handleRegenerate} disabled={isSaving}>
                    Discard & Retry
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  isLoading={isSaving || isGenerating}
                  disabled={isSaving || isGenerating}
                  className={step === 5 ? "bg-azure hover:bg-azure-hover px-8 py-6 text-lg shadow-xl shadow-azure/20" : ""}
                >
                  {isGenerating ? 'Generating...' : step === STEPS.length - 1 ? 'Initialize Identity' : 'Next Step'}
                  {!isGenerating && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
