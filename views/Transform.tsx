import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTranslations } from 'next-intl';
import { Copy, RefreshCw, Sliders, Zap, Sidebar, ArrowRight, X, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Components';
import { ModelSelector } from '../components/ModelSelector';
import { ModelId } from '../lib/llm/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { AlertCircle } from 'lucide-react';

export const Transform: React.FC = () => {
  const t = useTranslations('Transform');
  const { user } = useAuth();
  const { settings } = useSettings();
  const [showDiff, setShowDiff] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize state from sessionStorage if available
  const [inputText, setInputText] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('transform_inputText') || '';
    }
    return '';
  });

  const [outputText, setOutputText] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('transform_outputText') || '';
    }
    return '';
  });

  const [alignmentScore, setAlignmentScore] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('transform_alignmentScore');
      return saved ? parseFloat(saved) : null;
    }
    return null;
  });

  const [reasoning, setReasoning] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('transform_reasoning');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [temperature, setTemperature] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('transform_temperature');
      return saved ? parseFloat(saved) : 0.7;
    }
    return 0.7;
  });

  const [evaluation, setEvaluation] = useState<{ score: number; reasoning: string; suggestions?: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('transform_evaluation');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [instructions, setInstructions] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('transform_instructions') || '';
    }
    return '';
  });

  const { tier } = useSubscription();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [selectedModel, setSelectedModel] = useState<ModelId>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('transform_model') as ModelId) || 'gpt-4o-mini';
    }
    return 'gpt-4o-mini';
  });

  const [showRefine, setShowRefine] = useState(false);

  // Persist state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('transform_inputText', inputText);
      sessionStorage.setItem('transform_outputText', outputText);
      alignmentScore !== null ? sessionStorage.setItem('transform_alignmentScore', alignmentScore.toString()) : sessionStorage.removeItem('transform_alignmentScore');
      sessionStorage.setItem('transform_reasoning', JSON.stringify(reasoning));
      sessionStorage.setItem('transform_temperature', temperature.toString());
      evaluation !== null ? sessionStorage.setItem('transform_evaluation', JSON.stringify(evaluation)) : sessionStorage.removeItem('transform_evaluation');
      sessionStorage.setItem('transform_instructions', instructions);
      sessionStorage.setItem('transform_model', selectedModel);
    }
  }, [inputText, outputText, alignmentScore, reasoning, temperature, evaluation, instructions, selectedModel]);

  const handleModelChange = (model: ModelId) => {
    if (model === 'gemini-flash-latest' && tier === 'free') {
      setToastMessage(t('upgradeToast'));
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setSelectedModel(model);
  };

  const diffWords = (a: string, b: string) => {
    const aWords = a.trim().split(/\s+/).filter(Boolean);
    const bWords = b.trim().split(/\s+/).filter(Boolean);
    const m = aWords.length;
    const n = bWords.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = aWords[i - 1] === bWords[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    const segments: { type: 'same' | 'added' | 'removed'; text: string }[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (aWords[i - 1] === bWords[j - 1]) {
        segments.push({ type: 'same', text: aWords[i - 1] });
        i--; j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        segments.push({ type: 'removed', text: aWords[i - 1] });
        i--;
      } else {
        segments.push({ type: 'added', text: bWords[j - 1] });
        j--;
      }
    }
    while (i > 0) { segments.push({ type: 'removed', text: aWords[i - 1] }); i--; }
    while (j > 0) { segments.push({ type: 'added', text: bWords[j - 1] }); j--; }

    return segments.reverse();
  };

  const handleTransform = async () => {
    if (!inputText.trim() || !user) return;

    const sanitizedTemperature = Math.min(1.5, Math.max(0, temperature));
    setIsProcessing(true);
    // Do not clear output immediately to keep context if needed, but here we likely want to show progress
    // setOutputText(''); // Keeping old output might be confusing if diff logic runs on old vs new
    // But for a "Live Editor", clearing it is cleaner visually during the "thinking" usage
    setAlignmentScore(null);
    setReasoning([]);
    setEvaluation(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error(t('authError'));

      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ inputText, temperature: sanitizedTemperature, instructions, model_id: selectedModel })
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setOutputText(data.output);
      setReasoning(Array.isArray(data.reasoning) ? data.reasoning : []);
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        if (typeof data.evaluation.score === 'number') {
          setAlignmentScore(data.evaluation.score);
        }
      }

      // Auto-open insights after successful transform
      setShowInsights(true);
      // Auto-show diffs if it's a rewrite
      setShowDiff(true);

      if (settings?.autoCopy) {
        navigator.clipboard.writeText(data.output).catch(console.error);
        setToastMessage(t('copiedToClipboard') || 'Copied to clipboard!');
      }

      if (settings?.clearInput) {
        setInputText('');
      }

    } catch (err: any) {
      alert(t('transformationFailed', { error: err?.message || t('unknownError') }));
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setReasoning([]);
    setAlignmentScore(null);
    setEvaluation(null);
    setInstructions('');
    if (typeof window !== 'undefined') {
      sessionStorage.clear(); // Or specific keys
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4 text-ink">

      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-extrabold tracking-tight">{t('title')}</h1>

          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          {/* Diff Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setShowDiff(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${!showDiff ? 'bg-slate-100 text-ink' : 'text-ink/50 hover:text-ink'}`}
            >
              {t('clean')}
            </button>
            <button
              onClick={() => setShowDiff(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${showDiff ? 'bg-indigo-50 text-indigo-600' : 'text-ink/50 hover:text-ink'}`}
            >
              {t('diffView')}
            </button>
          </div>
        </div>



        <div className="flex items-center gap-3">
          <ModelSelector selectedModel={selectedModel} onModelChange={handleModelChange} />
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRefine(!showRefine)}
            className={showRefine ? 'bg-slate-100 text-ink' : 'text-ink/60'}
          >
            <Zap size={16} className="mr-2" /> {t('refine')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParams(!showParams)}
            className={showParams ? 'bg-slate-100 text-ink' : 'text-ink/60'}
          >
            <Sliders size={16} className="mr-2" /> {t('parameters')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInsights(!showInsights)}
            className={showInsights ? 'bg-slate-100 text-ink' : 'text-ink/60'}
          >
            <Sidebar size={16} className="mr-2" /> {t('insights')}
          </Button>
        </div>
      </div >

      {/* Context/Refinement Panel */}
      {
        showRefine && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mx-2 mb-2 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{t('refinePanel.contextualRefinements')}</label>
                  <textarea
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-azure focus:border-azure outline-none resize-none h-20"
                    placeholder={t('refinePanel.placeholder')}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>
                <div className="w-1/3">
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{t('refinePanel.quickChips')}</label>
                  <div className="flex flex-wrap gap-2">
                    {['Brief', 'Professional', 'Empathetic', 'Slack', 'Email', 'Linkedin'].map(chip => (
                      <button
                        key={chip}
                        onClick={() => setInstructions(prev => prev ? `${prev}, ${chip}` : chip)}
                        className="text-xs px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-full transition-colors text-slate-600"
                      >
                        + {t(`refinePanel.chips.${chip}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Parameters Panel (collapsible) */}
      {
        showParams && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mx-2 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold w-24">{t('parametersPanel.temperature')}</span>
              <input type="range" min="0" max="1.5" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="flex-1 accent-azure h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
              <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded">{temperature.toFixed(1)}</span>
            </div>
          </div>
        )
      }

      {/* Main Editor Surface */}
      <div className="relative flex flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5 mx-2 mb-2">

        {/* LEFT: Input Pane */}
        <div className="flex-1 flex flex-col relative group">
          <textarea
            className="flex-1 w-full resize-none border-none p-8 font-serif leading-8 text-lg text-ink placeholder:text-slate-300 focus:ring-0 outline-none"
            placeholder={t('editor.inputPlaceholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50">{t('editor.clear')}</Button>
          </div>
        </div>

        {/* CENTER: Divider & Action */}
        <div className="relative w-px bg-slate-100 flex items-center justify-center z-20">
          <button
            onClick={handleTransform}
            disabled={!inputText.trim() || isProcessing}
            className={`
              absolute flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95
              ${isProcessing ? 'bg-slate-100 cursor-not-allowed' : 'bg-azure hover:bg-azure-hover text-white'}
            `}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-slate-300 border-t-azure rounded-full animate-spin" />
            ) : (
              <Zap size={24} fill="currentColor" className={inputText.trim() ? "animate-pulse" : ""} />
            )}
          </button>
        </div>

        {/* RIGHT: Output Pane */}
        <div className={`flex-1 flex flex-col bg-slate-50/10 relative transition-all duration-300`}>
          {outputText ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Score Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-dashed border-slate-100">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInsights(true)}>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border transition-colors ${(alignmentScore || 0) >= 8 ? 'bg-mint/10 text-mint border-mint/20' :
                    (alignmentScore || 0) >= 6 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                    {(alignmentScore || 0).toFixed(1)} / 10
                    <ArrowRight size={12} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('output.alignmentScore')}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(outputText)}>
                  <Copy size={14} className="mr-2" /> {t('output.copy')}
                </Button>
              </div>

              {/* Text Content */}
              <div className="flex-1 overflow-y-auto p-8 font-serif leading-8 text-lg">
                {showDiff ? (
                  <div className="whitespace-pre-wrap">
                    {diffWords(inputText, outputText).map((segment, i) => (
                      <span key={i} className={
                        segment.type === 'added' ? 'bg-[#EAB308]/20 text-ink decoration-clone px-1 rounded-sm mx-0.5' :
                          segment.type === 'removed' ? 'text-red-400 line-through decoration-red-300/50 decoration-2 opacity-60 mx-0.5' :
                            'text-ink'
                      }>
                        {segment.text}{' '}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-ink">{outputText}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 select-none">
              <ArrowRight size={48} className="opacity-20 mb-4" />
              <p className="font-medium">{t('editor.readyToResonate')}</p>
            </div>
          )}
        </div>

        {/* FAR RIGHT: Insights Sidebar (Drawer) */}
        <div className={`absolute right-0 top-0 h-full bg-slate-50 border-l border-slate-200 w-80 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] transition-transform duration-300 transform z-30 ${showInsights ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="font-bold text-ink text-sm uppercase tracking-wide">{t('insightsPanel.analysis')}</h3>
              <button onClick={() => setShowInsights(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500"><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {evaluation ? (
                <>
                  {/* Score Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">{t('insightsPanel.toneMatch')}</h4>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${evaluation.score >= 8 ? 'bg-mint' : evaluation.score >= 6 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                        style={{ width: `${evaluation.score * 10}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-500 font-mono">
                      <span>0</span>
                      <span>{evaluation.score}</span>
                      <span>10</span>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">{t('insightsPanel.whyThisGrade')}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                      {evaluation.reasoning}
                    </p>
                  </div>

                  {/* Suggestions */}
                  {evaluation.suggestions && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">{t('insightsPanel.improvement')}</h4>
                      <div className="text-sm text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                        {evaluation.suggestions}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-slate-400 text-sm mt-10">
                  {t('insightsPanel.generateToSee')}
                </div>
              )}

              {reasoning.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">{t('insightsPanel.transformLogic')}</h4>
                  <ul className="space-y-2">
                    {reasoning.map((r, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <Check size={12} className="mt-0.5 text-azure shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-ink text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-5 duration-300">
          <AlertCircle size={20} className="text-red-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div >
  );
};