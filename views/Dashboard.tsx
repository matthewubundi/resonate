import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Chip, TextArea } from '../components/Components';
import { ArrowRight, Sparkles, History, Zap, Activity, Copy, X, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { PageView } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface IdentityProfile {
  tone: string;
  formality: string;
  directness: string;
  values: string[];
  vocabulary: {
    frequent_words: string[];
    avoid_words: string[];
  };
  sentence_structure?: {
    typical_length: string;
    patterns: string[];
  };
  formatting_preferences?: {
    default: string;
    structure: string;
  };
  rules?: {
    always: string[];
    never: string[];
  };
}

interface TransformationLog {
  id: string;
  input_text: string;
  final_output: string;
  alignment_score: number | null;
  created_at: string;
}

export const Dashboard: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [quickInput, setQuickInput] = useState('');
  const [quickOutput, setQuickOutput] = useState('');
  const [isTransforming, setIsTransforming] = useState(false);
  const [identity, setIdentity] = useState<IdentityProfile | null>(null);
  const [loadingIdentity, setLoadingIdentity] = useState(true);
  const [transformations, setTransformations] = useState<TransformationLog[]>([]);
  const [loadingTransformations, setLoadingTransformations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch identity and transformation history on mount
  const fetchData = async () => {
    if (!user) {
      setLoadingIdentity(false);
      setLoadingTransformations(false);
      return;
    }

    setError(null);
    try {
      // 1. Fetch Active Identity
      const { data: idData, error: idError } = await supabase
        .from('identities')
        .select('identity_json')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (idData && !idError) {
        setIdentity(idData.identity_json as IdentityProfile);
      } else if (idError && idError.code !== 'PGRST116') {
        throw new Error('Failed to load identity profile');
      }

      // 2. Fetch Recent Transformations
      const { data: transData, error: transError } = await supabase
        .from('transformations')
        .select('id, input_text, final_output, alignment_score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (transData && !transError) {
        setTransformations(transData as TransformationLog[]);
      } else if (transError) {
        throw new Error('Failed to load transformation history');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoadingIdentity(false);
      setLoadingTransformations(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Refresh transformations after a successful transformation
  const refreshTransformations = async () => {
    if (!user) return;
    
    try {
      const { data: transData, error: transError } = await supabase
        .from('transformations')
        .select('id, input_text, final_output, alignment_score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (transData && !transError) {
        setTransformations(transData as TransformationLog[]);
      }
    } catch (error) {
      console.error('Error refreshing transformations:', error);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoadingIdentity(true);
    setLoadingTransformations(true);
    await fetchData();
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(quickOutput);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleQuickTransform = async () => {
    if (!quickInput.trim() || !user || !identity) return;
    
    setIsTransforming(true);
    setError(null);
    try {
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to transform text.');
        setIsTransforming(false);
        return;
      }

      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ inputText: quickInput })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setQuickOutput(data.output);
      // Clear input after successful transformation
      setQuickInput('');
      // Refresh transformation history
      await refreshTransformations();
    } catch (err: any) {
      setError('Transformation failed: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setIsTransforming(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get preview text from input
  const getPreview = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      {error && (
        <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="text-highlight flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-highlight mb-1">Error</p>
              <p className="text-sm text-ink/80">{error}</p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              Retry
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-ink">Welcome back.</h1>
           {identity ? (
             <p className="text-ink/60 font-medium">Identity profile is <span className="font-mono text-xs bg-azure/10 border border-azure/20 px-2 py-0.5 rounded text-azure font-bold">active</span> and aligned.</p>
           ) : (
             <p className="text-ink/60 font-medium">No active identity. Create one to get started.</p>
           )}
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={handleRefresh}
            isLoading={isRefreshing}
            disabled={isRefreshing}
            title="Refresh dashboard data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => onNavigate('transform')} size="lg" className="shadow-lg shadow-azure/10">
            <Sparkles className="mr-2 h-4 w-4" /> Initialize Transformation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Identity Snapshot */}
        <Card className="md:col-span-2 relative overflow-hidden border-none shadow-md bg-white">
          <div className="absolute top-0 right-0 p-3 opacity-5">
              <Activity size={100} className="text-ink" />
          </div>
          <CardHeader>
            <CardTitle>Identity Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingIdentity ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-paleslate rounded w-3/4"></div>
                <div className="h-4 bg-paleslate rounded w-1/2"></div>
              </div>
            ) : identity ? (
              <>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Chip label={identity.tone} />
                  <Chip label={`Formality: ${identity.formality}`} />
                  <Chip label={identity.directness} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   <div>
                     <h4 className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-3">Core Values</h4>
                     <ul className="space-y-2">
                       {identity.values && identity.values.length > 0 ? (
                         identity.values.slice(0, 5).map((v: string, idx: number) => (
                           <li key={idx} className="flex items-center text-sm font-semibold text-ink">
                             <span className="w-1.5 h-1.5 rounded-full bg-azure mr-3"></span> {v}
                           </li>
                         ))
                       ) : (
                         <li className="text-sm text-ink/60">No values specified</li>
                       )}
                     </ul>
                   </div>
                   <div>
                     <h4 className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-3">Vocabulary</h4>
                     <div className="space-y-3">
                       <div>
                         <p className="text-xs text-ink/60 mb-1">Frequent Words:</p>
                         <p className="text-sm text-ink/80">
                           {identity.vocabulary?.frequent_words?.slice(0, 5).join(', ') || 'None'}
                         </p>
                       </div>
                       <div>
                         <p className="text-xs text-ink/60 mb-1">Avoid Words:</p>
                         <p className="text-sm text-highlight">
                           {identity.vocabulary?.avoid_words?.slice(0, 5).join(', ') || 'None'}
                         </p>
                       </div>
                     </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-ink/60">
                <Activity size={48} className="mx-auto mb-4 text-ink/30" />
                <p className="font-medium">No identity data available</p>
                <p className="text-sm mt-2 mb-4">Create an identity to see your snapshot here</p>
                <Button onClick={() => onNavigate('onboarding')} size="sm">
                  Create Identity
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Stats */}
        <Card className="bg-paleslate border-ink/5 shadow-md">
          <CardContent className="flex flex-col justify-between h-full relative overflow-hidden">
            <div className="relative z-10">
              <div className="h-10 w-10 bg-white border border-ink/5 rounded-lg flex items-center justify-center mb-4 text-azure shadow-sm">
                <Zap size={20} />
              </div>
              <h3 className="text-xl font-bold mb-1 text-ink">Quick Injection</h3>
              <p className="text-ink/60 text-sm font-medium">Paste text to instantly apply your active persona matrix.</p>
            </div>
            <div className="mt-8 relative z-10">
              {!identity ? (
                <div className="p-4 bg-azure/5 border border-azure/20 rounded-lg mb-3">
                  <p className="text-sm text-ink/60 mb-2">No active identity found</p>
                  <Button onClick={() => onNavigate('onboarding')} size="sm" className="w-full">
                    Create Identity
                  </Button>
                </div>
              ) : (
                <>
                  <TextArea
                    placeholder="Paste generic text..."
                    className="w-full bg-white border border-ink/10 rounded-lg px-4 py-3 text-sm text-ink placeholder:text-ink/40 mb-3 focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure resize-none"
                    rows={3}
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    disabled={isTransforming}
                  />
                  <Button 
                    className="w-full" 
                    onClick={handleQuickTransform}
                    isLoading={isTransforming}
                    disabled={isTransforming || !quickInput.trim() || !identity}
                  >
                    {isTransforming ? 'Aligning...' : 'Preserve Identity'}
                  </Button>
                </>
              )}
              {quickOutput && (
                <div className="mt-3 p-3 bg-white border border-azure/20 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-azure uppercase tracking-wide">Transformed:</p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        title="Copy to clipboard"
                        className="h-7 w-7 p-0"
                      >
                        {copySuccess ? (
                          <Check size={14} className="text-azure" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuickOutput('')}
                        title="Clear output"
                        className="h-7 w-7 p-0"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-ink/80 whitespace-pre-wrap break-words max-h-56 overflow-y-auto pr-1">
                    {quickOutput}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-ink/5">
          <CardTitle>Transformation Log</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs font-bold text-azure hover:text-azure-hover"
            onClick={() => onNavigate('history')}
          >
            View All History
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loadingTransformations ? (
            <div className="p-12 text-center">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-paleslate rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-paleslate rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : transformations.length > 0 ? (
            <div className="divide-y divide-ink/5">
              {transformations.map((item) => (
                <div key={item.id} className="p-5 flex items-center justify-between hover:bg-paleslate transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-paleslate border border-ink/5 flex items-center justify-center text-ink/50 group-hover:bg-white group-hover:text-azure transition-colors flex-shrink-0">
                      <History size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink truncate">{getPreview(item.input_text)}</p>
                      <p className="text-xs text-ink/50 font-medium mt-0.5">{formatDate(item.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {item.alignment_score !== null ? (
                      <div className="text-right">
                        <span className={`block text-sm font-bold ${item.alignment_score >= 8 ? 'text-azure' : 'text-highlight'}`}>
                          {item.alignment_score.toFixed(1)}
                        </span>
                        <span className="text-[10px] uppercase text-ink/40 font-bold tracking-wider">Alignment</span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="block text-sm font-bold text-ink/40">—</span>
                        <span className="text-[10px] uppercase text-ink/40 font-bold tracking-wider">Pending</span>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="text-ink/40 group-hover:text-ink" onClick={() => onNavigate('transform')}>
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-ink/60">
              <History size={48} className="mx-auto mb-4 text-ink/30" />
              <p className="font-medium">No transformations yet</p>
              <p className="text-sm mt-2">Your transformation history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};