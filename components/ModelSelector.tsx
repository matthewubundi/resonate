
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import { ModelId } from '../lib/llm/types';

interface ModelSelectorProps {
    selectedModel: ModelId;
    onModelChange: (model: ModelId) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const models: { id: ModelId; label: string; icon?: React.ReactNode }[] = [
        { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },

        {
            id: 'gemini-flash-latest',
            label: 'Gemini 2.5 Flash',
            icon: <Zap size={14} className="text-yellow-500 fill-current" />
        }
    ];

    const selected = models.find(m => m.id === selectedModel) || models[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative z-50" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-paper border border-paleslate-dark rounded-lg text-sm font-medium text-ink hover:bg-paleslate transition-colors shadow-sm"
            >
                {selected.icon && <span>{selected.icon}</span>}
                <span>{selected.label}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 right-0 items-start w-48 bg-paper border border-paleslate-dark rounded-lg overflow-hidden shadow-lg flex flex-col animate-in fade-in zoom-in duration-100">
                    {models.map(model => (
                        <button
                            key={model.id}
                            onClick={() => {
                                onModelChange(model.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-paleslate transition-colors ${selectedModel === model.id ? 'font-semibold bg-paleslate' : 'text-ink'}`}
                        >
                            {model.icon && <span className="shrink-0">{model.icon}</span>}
                            <span>{model.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
