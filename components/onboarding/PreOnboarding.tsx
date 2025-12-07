import Image from 'next/image';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Components';
import { ArrowRight, ChevronLeft } from 'lucide-react';


const STEPS = [
    {
        title: "Stop Sounding Like a Bot",
        description: "AI models are trained to be generic. Resonate builds a custom 'Identity Layer' that forces AI to write exactly like you.",
        image: "/illustrations/Stop Sounding Like a Bot.png"
    },
    {
        title: "The Identity Matrix",
        description: "We construct a complex JSON profile of your values, vocabulary, and sentence structures. This becomes your digital DNA.",
        image: "/illustrations/The Identity Matrix.png"
    },
    {
        title: "How It Works",
        description: "In a moment, we'll ask you about your style. We'll analyze your writing samples to extract patterns you might not even notice.",
        image: "/illustrations/How It Works.png"
    },
    {
        title: "The Transformation Engine",
        description: "Paste any rough draft into Resonate. We'll rewrite it to match your voice perfectly, giving you a score out of 10.",
        image: "/illustrations/The Transformation Engine.png"
    },
    {
        title: "Your Data, Your Control",
        description: "Your identity profile is stored securely. You can edit, version, or delete it at any time. We never share your personal data.",
        image: "/illustrations/Your Data, Your Control.png"
    }
];

interface PreOnboardingProps {
    onComplete: () => void;
}

export const PreOnboarding: React.FC<PreOnboardingProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-paper p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
                {/* Progress Indicators (dots) at the very top */}
                <div className="flex justify-center gap-2 pt-8 pb-2">
                    {STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ease-out ${index === currentStep ? 'w-8 bg-azure' : index < currentStep ? 'w-2 bg-azure/40' : 'w-2 bg-slate-200'
                                }`}
                        />
                    ))}
                </div>

                <div className="px-8 pb-12 pt-4 md:px-16 flex flex-col h-full">
                    <div className="flex-1 min-h-[480px] relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="flex flex-col h-full"
                            >
                                {/* Title */}
                                <div className="text-center mb-6 mt-2">
                                    <h2 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
                                        {STEPS[currentStep].title}
                                    </h2>
                                </div>

                                {/* Illustration */}
                                <div className="flex-shrink-0 mb-8 relative w-full h-64">
                                    <div className="absolute inset-0 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner">
                                        <Image
                                            src={STEPS[currentStep].image}
                                            alt={STEPS[currentStep].title}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                        {/* Inner shadow overlay for depth */}
                                        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] rounded-2xl pointer-events-none"></div>
                                    </div>
                                </div>



                                {/* Description */}
                                <div className="text-center flex-1">
                                    <p className="text-ink/70 text-lg leading-relaxed max-w-lg mx-auto">
                                        {STEPS[currentStep].description}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                        {/* Back Button */}
                        <div className="w-24">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className={`text-ink/40 font-medium text-sm flex items-center gap-1 transition-all group ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:text-ink cursor-pointer'
                                    }`}
                            >
                                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back
                            </button>
                        </div>

                        {/* Next Button */}
                        <div className="w-auto">
                            <Button
                                onClick={handleNext}
                                variant="primary"
                                className={`min-w-[140px] shadow-lg shadow-azure/20 hover:shadow-xl hover:shadow-azure/30 transition-all ${currentStep === STEPS.length - 1 ? 'bg-azure' : ''
                                    }`}
                            >
                                {currentStep === STEPS.length - 1 ? (
                                    <>Start Building Identity <ArrowRight size={16} className="ml-2" /></>
                                ) : (
                                    <>Next <ArrowRight size={16} className="ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
