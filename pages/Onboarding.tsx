import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Button, Input, TextArea, Card, CardContent } from '../components/Components';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

interface OnboardingData {
  // Step 0: Communication Style
  professionalVoice: string;
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
  sample1: string;
  sample2: string;
}

const STEPS = ['Communication Style', 'Vocabulary & Tone', 'Values & Ethics', 'Structure', 'Writing Samples', 'Review & Confirm'];

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
        }
        if (typeof parsed.step === 'number' && parsed.step >= 0 && parsed.step < STEPS.length) {
          setStep(parsed.step);
        }
        if (parsed.generatedIdentity) {
          setGeneratedIdentity(parsed.generatedIdentity);
        }
      } catch (err) {
        console.error('Failed to parse saved onboarding data:', err);
        // Clear corrupted data
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

  // Clear guest data when user logs in (to prevent storage bloat)
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

  const validateStep = (): boolean => {
    switch (step) {
      case 0:
        if (!formData.professionalVoice.trim() || !formData.writingGoal.trim()) {
          setError('Please fill in all fields before continuing.');
          return false;
        }
        return true;
      
      case 1:
        if (!formData.frequentWords.trim() || !formData.hatedWords.trim() || !formData.tone) {
          setError('Please fill in all fields and select a tone preference.');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.coreValue1.trim() || !formData.coreValue2.trim() || !formData.neverRule.trim()) {
          setError('Please fill in all fields before continuing.');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.formattingPreference) {
          setError('Please select a formatting preference.');
          return false;
        }
        return true;
      
      case 4:
        if (!formData.sample1.trim() || !formData.sample2.trim()) {
          setError('Please provide at least 2 writing samples.');
          return false;
        }
        return true;
      
      case 5:
        // Review step - no validation needed
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) {
      return;
    }

    // If we're on step 4 (Writing Samples), generate the identity before moving to review
    if (step === 4) {
      await generateIdentity();
      return;
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      setError(null);
    } else {
      // Final step (Review) - save onboarding data
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
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to generate your identity.');
        setIsGenerating(false);
        return;
      }

      // Transform form data to match API expected format
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
        writingSamples: [formData.sample1, formData.sample2],
        formattingPreference: formData.formattingPreference,
        professionalVoice: formData.professionalVoice,
        writingGoal: formData.writingGoal,
      };

      // Call the generation API with Authorization header
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
      
      // Move to review step
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
      // Save the generated identity profile to identities table
      const { error: identityError } = await supabase
        .from('identities')
        .insert({
          user_id: user.id,
          identity_json: generatedIdentity,
          is_active: true,
          version_number: 1,
        });

      if (identityError) throw identityError;

      // Mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Clear saved onboarding data from localStorage
      if (typeof window !== 'undefined') {
        const storageKey = getStorageKey(user.id);
        localStorage.removeItem(storageKey);
      }

      // Onboarding complete!
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

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-bold text-ink mb-2">
            <span>Phase {step + 1} of {STEPS.length}</span>
            <span className="text-azure">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-paleslate rounded-full overflow-hidden border border-ink/5">
            <div 
              className="h-full bg-azure transition-all duration-300 ease-out"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="min-h-[500px] flex flex-col shadow-lg border-none">
          <div className="p-8 border-b border-ink/5 bg-white rounded-t-xl">
            <h2 className="text-2xl font-bold text-ink tracking-tight">{STEPS[step]}</h2>
            <p className="text-ink/60 mt-1 text-sm font-medium">Configure system parameters for optimal identity generation.</p>
          </div>

          <CardContent className="flex-1 overflow-y-auto bg-paleslate">
            {error && (
              <div className="mb-4 p-3 bg-highlight/10 border border-highlight/20 rounded-lg flex items-center gap-2 text-sm text-ink">
                <AlertCircle size={16} className="text-highlight flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {step === 0 && (
              <div className="space-y-6">
                <TextArea 
                  label="How would you describe your professional voice?" 
                  placeholder="e.g. Direct, authoritative, but friendly..." 
                  rows={4}
                  value={formData.professionalVoice}
                  onChange={(e) => updateField('professionalVoice', e.target.value)}
                  required
                />
                <TextArea 
                  label="What is your primary goal when writing?" 
                  placeholder="e.g. To inform, to persuade, to entertain..." 
                  rows={3}
                  value={formData.writingGoal}
                  onChange={(e) => updateField('writingGoal', e.target.value)}
                  required
                />
              </div>
            )}
            
            {step === 1 && (
              <div className="space-y-6">
                <Input 
                  label="3 words you use frequently" 
                  placeholder="e.g. Synergize, leverage, robust" 
                  value={formData.frequentWords}
                  onChange={(e) => updateField('frequentWords', e.target.value)}
                  required
                />
                <Input 
                  label="3 words you hate" 
                  placeholder="e.g. Utilized, bandwidth, touch-base" 
                  value={formData.hatedWords}
                  onChange={(e) => updateField('hatedWords', e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-semibold text-ink mb-3">Tone Preference</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`p-5 border rounded-lg cursor-pointer transition-all ${
                        formData.tone === 'formal' 
                          ? 'border-azure bg-white shadow-sm ring-1 ring-azure/20' 
                          : 'border-ink/10 bg-white hover:border-azure hover:shadow-sm'
                      }`}
                      onClick={() => updateField('tone', 'formal')}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-ink mb-1">Formal</h4>
                        {formData.tone === 'formal' && (
                          <div className="bg-azure rounded-full p-0.5">
                            <Check size={12} className="text-white"/>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-ink/60 font-medium">Strict grammar, no contractions. High precision.</p>
                    </div>
                    <div 
                      className={`p-5 border rounded-lg cursor-pointer transition-all ${
                        formData.tone === 'conversational' 
                          ? 'border-azure bg-white shadow-sm ring-1 ring-azure/20' 
                          : 'border-ink/10 bg-white hover:border-azure hover:shadow-sm'
                      }`}
                      onClick={() => updateField('tone', 'conversational')}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-ink mb-1">Conversational</h4>
                        {formData.tone === 'conversational' && (
                          <div className="bg-azure rounded-full p-0.5">
                            <Check size={12} className="text-white"/>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-ink/60 font-medium">Approachable, uses contractions. Natural flow.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Input 
                  label="Core Value 1" 
                  placeholder="e.g. Transparency" 
                  value={formData.coreValue1}
                  onChange={(e) => updateField('coreValue1', e.target.value)}
                  required
                />
                <Input 
                  label="Core Value 2" 
                  placeholder="e.g. Efficiency" 
                  value={formData.coreValue2}
                  onChange={(e) => updateField('coreValue2', e.target.value)}
                  required
                />
                <TextArea 
                  label="What is an absolute 'Never' rule for you?" 
                  placeholder="e.g. Never apologize for things out of my control..." 
                  value={formData.neverRule}
                  onChange={(e) => updateField('neverRule', e.target.value)}
                  required
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <label className="block text-sm font-bold text-ink">Preferred Formatting</label>
                <div className="space-y-3">
                  <label 
                    className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.formattingPreference === 'bullets'
                        ? 'border-azure bg-white shadow-sm'
                        : 'border-ink/10 bg-paleslate/50 hover:bg-white'
                    }`}
                    onClick={() => updateField('formattingPreference', 'bullets')}
                  >
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      formData.formattingPreference === 'bullets'
                        ? 'border-azure bg-azure'
                        : 'border-ink/30 bg-white'
                    }`}>
                      {formData.formattingPreference === 'bullets' && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className={`font-semibold ${
                      formData.formattingPreference === 'bullets' ? 'text-ink' : 'text-ink/70'
                    }`}>Bullet points over paragraphs whenever possible</span>
                  </label>
                  <label 
                    className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.formattingPreference === 'paragraphs'
                        ? 'border-azure bg-white shadow-sm'
                        : 'border-ink/10 bg-paleslate/50 hover:bg-white'
                    }`}
                    onClick={() => updateField('formattingPreference', 'paragraphs')}
                  >
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      formData.formattingPreference === 'paragraphs'
                        ? 'border-azure bg-azure'
                        : 'border-ink/30 bg-white'
                    }`}>
                      {formData.formattingPreference === 'paragraphs' && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className={`font-medium ${
                      formData.formattingPreference === 'paragraphs' ? 'text-ink' : 'text-ink/70'
                    }`}>Long, flowing paragraphs with detailed explanations</span>
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <p className="text-sm text-azure bg-azure/10 p-4 rounded-lg border border-azure/20 font-semibold">
                  Paste 2-3 examples of your best writing below. This data is critical for model fine-tuning.
                </p>
                <TextArea 
                  placeholder="Paste Sample 1..." 
                  rows={6}
                  value={formData.sample1}
                  onChange={(e) => updateField('sample1', e.target.value)}
                  required
                />
                <TextArea 
                  placeholder="Paste Sample 2..." 
                  rows={6}
                  value={formData.sample2}
                  onChange={(e) => updateField('sample2', e.target.value)}
                  required
                />
              </div>
            )}

            {step === 5 && generatedIdentity && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-ink/10">
                  <h3 className="text-lg font-bold text-ink mb-4">Your Generated Identity Profile</h3>
                  <p className="text-sm text-ink/60 mb-6">
                    Review the AI-generated profile below. This will be used to preserve your writing style and voice.
                  </p>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-semibold text-ink">Tone:</span>
                      <span className="ml-2 text-ink/80">{generatedIdentity.tone}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-ink">Formality:</span>
                      <span className="ml-2 text-ink/80">{generatedIdentity.formality}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-ink">Directness:</span>
                      <span className="ml-2 text-ink/80">{generatedIdentity.directness}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-ink">Decision Style:</span>
                      <span className="ml-2 text-ink/80">{generatedIdentity.decision_style}</span>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-ink">Sentence Structure:</span>
                      <div className="mt-1 ml-2 text-ink/80">
                        <div>Typical Length: {generatedIdentity.sentence_structure.typical_length}</div>
                        <div className="mt-1">
                          Patterns: {generatedIdentity.sentence_structure.patterns.join(', ')}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-ink">Vocabulary:</span>
                      <div className="mt-1 ml-2 text-ink/80">
                        <div>Frequent Words: {generatedIdentity.vocabulary.frequent_words.join(', ')}</div>
                        <div className="mt-1">Avoid Words: {generatedIdentity.vocabulary.avoid_words.join(', ')}</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-ink">Values:</span>
                      <span className="ml-2 text-ink/80">{generatedIdentity.values.join(', ')}</span>
                    </div>
                    
                    {generatedIdentity.ethics.length > 0 && (
                      <div>
                        <span className="font-semibold text-ink">Ethics:</span>
                        <span className="ml-2 text-ink/80">{generatedIdentity.ethics.join(', ')}</span>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-semibold text-ink">Humour:</span>
                      <span className="ml-2 text-ink/80">{generatedIdentity.humour}</span>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-ink">Formatting:</span>
                      <div className="mt-1 ml-2 text-ink/80">
                        <div>Default: {generatedIdentity.formatting_preferences.default}</div>
                        <div className="mt-1">Structure: {generatedIdentity.formatting_preferences.structure}</div>
                      </div>
                    </div>
                    
                    {generatedIdentity.rules.always.length > 0 && (
                      <div>
                        <span className="font-semibold text-ink">Always:</span>
                        <ul className="mt-1 ml-2 list-disc list-inside text-ink/80">
                          {generatedIdentity.rules.always.map((rule, idx) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {generatedIdentity.rules.never.length > 0 && (
                      <div>
                        <span className="font-semibold text-ink">Never:</span>
                        <ul className="mt-1 ml-2 list-disc list-inside text-ink/80">
                          {generatedIdentity.rules.never.map((rule, idx) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={handleRegenerate}
                    disabled={isSaving}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <div className="p-8 border-t border-ink/5 flex justify-between bg-white rounded-b-xl">
             <Button variant="ghost" onClick={handlePrev} disabled={step === 0 || isSaving}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
             </Button>
             <Button onClick={handleNext} isLoading={isSaving || isGenerating} disabled={isSaving || isGenerating}>
                {isGenerating ? 'Generating...' : step === STEPS.length - 1 ? 'Save & Complete' : step === STEPS.length - 2 ? 'Generate Identity' : 'Next Phase'} 
                {!isGenerating && <ArrowRight className="ml-2 h-4 w-4" />}
             </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
