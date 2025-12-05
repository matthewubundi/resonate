import React, { useState } from 'react';
import { Copy, RefreshCw, Sliders, ArrowRight } from 'lucide-react';
import { Button, Card, TextArea } from '../components/Components';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Transform: React.FC = () => {
  const { user } = useAuth();
  const [showDiff, setShowDiff] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [alignmentScore, setAlignmentScore] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string[]>([]);

  const handleTransform = async () => {
    if (!inputText.trim() || !user) {
      alert('Please enter text to transform and ensure you are logged in.');
      return;
    }

    setIsProcessing(true);
    setOutputText('');
    setAlignmentScore(null);
    setReasoning([]);

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
        body: JSON.stringify({ inputText })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setOutputText(data.output);
      // Note: alignment_score and reasoning will be added in future updates
    } catch (err: any) {
      alert('Transformation failed: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
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
            <Button variant="secondary" size="sm"><Sliders size={16} className="mr-2"/> Tune Parameters</Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Input Column */}
        <Card className="flex flex-col h-full border border-ink/10 shadow-sm bg-paleslate">
           <div className="p-4 border-b border-ink/5 flex justify-between items-center bg-white rounded-t-xl">
             <span className="text-sm font-bold text-ink/60 uppercase tracking-wide">Generic Input</span>
             <Button variant="ghost" size="sm" className="text-xs">Clear Buffer</Button>
           </div>
           <div className="flex-1 p-0">
             <TextArea 
               className="w-full h-full resize-none border-none focus:ring-0 p-6 bg-transparent font-sans text-sm leading-7 text-ink/80 placeholder:text-ink/30" 
               placeholder="Paste generic AI text here..."
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
             />
           </div>
           <div className="p-4 border-t border-ink/5 bg-white rounded-b-xl">
              <Button onClick={handleTransform} isLoading={isProcessing} className="w-full py-6 text-base shadow-lg shadow-azure/10">
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
                  <span className="flex h-6 w-10 items-center justify-center rounded-md bg-azure/10 border border-azure/20 text-azure text-xs font-bold">{alignmentScore}%</span>
                )}
             </div>
             <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={handleTransform}><RefreshCw size={14}/></Button>
                <Button variant="ghost" size="sm" onClick={() => outputText && navigator.clipboard.writeText(outputText)}><Copy size={14}/></Button>
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
           </div>
        </Card>
      </div>
    </div>
  );
};