import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button, Input, TextArea, Card, CardContent } from '../components/Components';

interface OnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

const STEPS = ['Communication Style', 'Vocabulary & Tone', 'Values & Ethics', 'Structure', 'Writing Samples'];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onBack();
    }
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
            {step === 0 && (
              <div className="space-y-6">
                <TextArea label="How would you describe your professional voice?" placeholder="e.g. Direct, authoritative, but friendly..." rows={4} />
                <TextArea label="What is your primary goal when writing?" placeholder="e.g. To inform, to persuade, to entertain..." rows={3} />
              </div>
            )}
            
            {step === 1 && (
              <div className="space-y-6">
                <Input label="3 words you use frequently" placeholder="e.g. Synergize, leverage, robust" />
                <Input label="3 words you hate" placeholder="e.g. Utilized, bandwidth, touch-base" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 border border-ink/10 bg-white rounded-lg cursor-pointer hover:border-azure hover:shadow-sm transition-all">
                    <h4 className="font-bold text-ink mb-1">Formal</h4>
                    <p className="text-xs text-ink/60 font-medium">Strict grammar, no contractions. High precision.</p>
                  </div>
                   <div className="p-5 border border-azure bg-white rounded-lg cursor-pointer relative shadow-sm ring-1 ring-azure/20">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-azure mb-1">Conversational</h4>
                      <div className="bg-azure rounded-full p-0.5"><Check size={12} className="text-white"/></div>
                    </div>
                    <p className="text-xs text-ink/60 font-medium">Approachable, uses contractions. Natural flow.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Input label="Core Value 1" placeholder="e.g. Transparency" />
                <Input label="Core Value 2" placeholder="e.g. Efficiency" />
                <TextArea label="What is an absolute 'Never' rule for you?" placeholder="e.g. Never apologize for things out of my control..." />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <label className="block text-sm font-bold text-ink">Preferred Formatting</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border border-azure bg-white rounded-lg cursor-pointer shadow-sm">
                    <div className="h-4 w-4 rounded-full border border-azure bg-azure flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                    </div>
                    <span className="text-ink font-semibold">Bullet points over paragraphs whenever possible</span>
                  </label>
                  <label className="flex items-center space-x-3 p-4 border border-ink/10 bg-paleslate/50 rounded-lg cursor-pointer hover:bg-white transition-colors">
                     <div className="h-4 w-4 rounded-full border border-ink/30 bg-white"></div>
                    <span className="text-ink/70 font-medium">Long, flowing paragraphs with detailed explanations</span>
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <p className="text-sm text-azure bg-azure/10 p-4 rounded-lg border border-azure/20 font-semibold">
                  Paste 2-3 examples of your best writing below. This data is critical for model fine-tuning.
                </p>
                <TextArea placeholder="Paste Sample 1..." rows={6} />
                <TextArea placeholder="Paste Sample 2..." rows={6} />
              </div>
            )}
          </CardContent>

          <div className="p-8 border-t border-ink/5 flex justify-between bg-white rounded-b-xl">
             <Button variant="ghost" onClick={handlePrev} disabled={step === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
             </Button>
             <Button onClick={handleNext}>
                {step === STEPS.length - 1 ? 'Initialize Identity' : 'Next Phase'} <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};