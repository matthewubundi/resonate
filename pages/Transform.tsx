import React, { useState } from 'react';
import { Copy, RefreshCw, Sliders } from 'lucide-react';
import { Button, Card, TextArea } from '../components/Components';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Transform: React.FC = () => {
  const { user } = useAuth();
  const [showDiff, setShowDiff] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [alignmentScore, setAlignmentScore] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string[]>([]);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [evaluation, setEvaluation] = useState<{ score: number; reasoning: string; suggestions?: string } | null>(null);

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
    if (!inputText.trim() || !user) {
      alert('Please enter text to transform and ensure you are logged in.');
      return;
    }

    const sanitizedTemperature = Math.min(1.5, Math.max(0, temperature));
    setIsProcessing(true);
    setOutputText('');
    setAlignmentScore(null);
    setReasoning([]);
    setEvaluation(null);

    try {
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to transform text.');
        setIsProcessing(false);
        return;
      }

      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ inputText, temperature: sanitizedTemperature })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Request failed');
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setOutputText(data.output);
      setReasoning(Array.isArray(data.reasoning) ? data.reasoning : []);
      
      // Set evaluation data if available
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        if (typeof data.evaluation.score === 'number') {
          setAlignmentScore(data.evaluation.score);
        }
      }
    } catch (err: any) {
      alert('Transformation failed: ' + (err?.message || 'Unknown error'));
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
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Transform Text</h1>
        <div className="flex gap-3">
            <div className="flex items-center space-x-3 bg-white border border-ink/10 rounded-lg px-4 py-1.5 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-ink/60">Show Diffs</span>
                <button 
                  onClick={() => setShowDiff(!showDiff)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none border border-transparent ${showDiff ? 'bg-azure' : 'bg-paleslate border-ink/20'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${showDiff ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowParams(!showParams)}>
              <Sliders size={16} className="mr-2"/> Tune Parameters
            </Button>
        </div>
      </div>

      {showParams && (
        <div className="mb-4 p-4 rounded-xl bg-white border border-ink/10 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink/70">Temperature</span>
            <span className="text-xs font-bold text-ink/50">{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-azure"
          />
          <p className="text-xs text-ink/50">Lower = conservative, Higher = more creative</p>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Input Column */}
        <Card className="flex flex-col h-full border border-ink/10 shadow-sm bg-paleslate overflow-hidden">
           <div className="p-4 border-b border-ink/5 flex justify-between items-center bg-white rounded-t-xl flex-shrink-0">
             <span className="text-sm font-bold text-ink/60 uppercase tracking-wide">Generic Input</span>
             <Button variant="ghost" size="sm" className="text-xs" onClick={handleClear}>Clear Buffer</Button>
           </div>
           <div className="flex-1 p-0 min-h-0 flex flex-col">
             <textarea 
               className="flex-1 w-full resize-none border-none focus:ring-0 p-6 bg-transparent font-sans text-sm leading-7 text-ink/80 placeholder:text-ink/30 outline-none" 
               placeholder="Paste generic AI text here..."
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
             />
           </div>
           <div className="p-4 border-t border-ink/5 bg-white rounded-b-xl flex-shrink-0">
             <Button 
               onClick={handleTransform} 
               isLoading={isProcessing} 
               className="w-full py-6 text-base shadow-lg shadow-azure/10"
               disabled={!inputText.trim()}
             >
                Inject Identity Matrix
              </Button>
           </div>
        </Card>

        {/* Output Column */}
        <Card className="flex flex-col h-full border border-azure/20 shadow-md shadow-azure/5 bg-white">
           <div className="p-4 border-b border-ink/5 flex justify-between items-center bg-white rounded-t-xl">
             <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-azure uppercase tracking-wide flex items-center gap-2">
                   <span className="w-2 h-2 bg-azure rounded-full"></span> Identity Aligned
                </span>
                {alignmentScore !== null && (
                  <span className={`flex h-6 px-3 items-center justify-center rounded-md border text-xs font-bold ${
                    alignmentScore >= 8 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : alignmentScore >= 6
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {alignmentScore.toFixed(1)}/10
                  </span>
                )}
             </div>
             <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={handleTransform}><RefreshCw size={14}/></Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={!outputText} 
                  onClick={() => outputText && navigator.clipboard.writeText(outputText)}
                >
                  <Copy size={14}/>
                </Button>
             </div>
           </div>
           <div className="flex-1 p-6 bg-white rounded-b-xl overflow-y-auto relative">
             {isProcessing ? (
               <div className="h-full flex flex-col items-center justify-center text-ink/40">
                 <div className="relative mb-4">
                     <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-azure animate-spin"></div>
                 </div>
                 <p className="text-sm font-bold tracking-widest uppercase">Applying linguistic signature...</p>
               </div>
             ) : outputText ? (
               <div className="prose prose-sm max-w-none text-ink">
                 <p className="leading-7 text-base font-medium">
                   {outputText}
                 </p>
                 
                 {/* Evaluation Score Panel */}
                 {evaluation && evaluation.score !== null && (
                   <div className="mt-8 p-5 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
                     <div className="flex items-center gap-3 mb-3">
                       <div className={`text-3xl font-bold ${
                         evaluation.score >= 8 
                           ? 'text-green-400' 
                           : evaluation.score >= 6
                           ? 'text-yellow-400'
                           : 'text-red-400'
                       }`}>
                         {evaluation.score.toFixed(1)}/10
                       </div>
                       <div className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Alignment Score</div>
                     </div>
                     {evaluation.reasoning && (
                       <p className="text-sm text-slate-400 border-t border-slate-700 pt-3 mt-3 leading-relaxed">
                         {evaluation.reasoning}
                       </p>
                     )}
                     {evaluation.suggestions && (
                       <div className="mt-3 pt-3 border-t border-slate-700">
                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Suggestions</p>
                         <p className="text-sm text-slate-400 leading-relaxed">{evaluation.suggestions}</p>
                       </div>
                     )}
                   </div>
                 )}
                 
                 {reasoning.length > 0 && (
                   <div className="mt-8 p-5 bg-paleslate rounded-xl border border-ink/5">
                      <h4 className="text-xs font-bold text-azure uppercase tracking-wide mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-azure"></span> Reasoning Engine
                      </h4>
                      <ul className="text-sm text-ink/70 space-y-2 list-none font-medium">
                          {reasoning.map((reason, idx) => (
                            <li key={idx} className="flex gap-2"><span className="text-azure/60">•</span> {reason}</li>
                          ))}
                      </ul>
                   </div>
                 )}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-ink/40">
                 <p className="text-sm font-medium">Transformed text will appear here</p>
                 <p className="text-xs mt-2">Paste text and click "Inject Identity Matrix" to transform</p>
               </div>
             )}

            {showDiff && outputText && !isProcessing && (
              <div className="mt-6">
                <div className="text-xs font-bold uppercase tracking-wide text-ink/50 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-azure"></span>
                  Diff View
                </div>
                <div className="p-4 bg-paleslate rounded-lg border border-ink/10 text-sm leading-7 text-ink">
                  {diffWords(inputText, outputText).map((segment, idx) => (
                    <span
                      key={idx}
                      className={
                        segment.type === 'added'
                          ? 'text-azure font-semibold'
                          : segment.type === 'removed'
                            ? 'text-highlight line-through'
                            : 'text-ink'
                      }
                    >
                      {segment.text + ' '}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-ink/50 mt-2">Additions shown in blue, removals in red strike-through.</p>
              </div>
            )}
           </div>
        </Card>
      </div>
    </div>
  );
};