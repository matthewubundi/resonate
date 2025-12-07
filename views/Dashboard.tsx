import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Chip, TextArea } from '../components/Components';
import { ArrowRight, Sparkles, History, Zap, Activity, Copy, X, RefreshCw, AlertCircle, Check, ChevronDown, User } from 'lucide-react';
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
  const [isIdentityExpanded, setIsIdentityExpanded] = useState(false);

  const [userName, setUserName] = useState('');

  // Fetch identity and transformation history on mount
  const fetchData = async () => {
    if (!user) {
      setLoadingIdentity(false);
      setLoadingTransformations(false);
      return;
    }

    // Set initial name from metadata while loading
    if (user.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name);
    }

    setError(null);
    try {
      // Parallel Fetching for Speed
      const profilePromise = supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const identityPromise = supabase
        .from('identities')
        .select('identity_json')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      const transformationsPromise = supabase
        .from('transformations')
        .select('id, input_text, final_output, alignment_score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const [
        { data: profile },
        { data: idData, error: idError },
        { data: transData, error: transError }
      ] = await Promise.all([profilePromise, identityPromise, transformationsPromise]);

      // 0. Set Name
      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      // 1. Set Identity
      if (idData && !idError) {
        setIdentity(idData.identity_json as IdentityProfile);
      } else if (idError && idError.code !== 'PGRST116') {
        throw new Error('Failed to load identity profile');
      }

      // 2. Set Transformations
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
        .limit(3);

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
    <div className="max-w-6xl mx-auto space-y-10">
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

      {/* Header Area: Headline & Identity HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">
            Good morning, {userName ? userName.split(' ')[0] : 'User'}.
          </h1>
          <p className="text-ink/60 text-lg">What are we rewriting today?</p>
        </div>

        {/* Identity HUD (Persona Pill) */}
        <div className="relative">
          {loadingIdentity ? (
            <div className="h-10 w-48 bg-paleslate rounded-full animate-pulse"></div>
          ) : identity ? (
            <div
              className={`bg-white border rounded-2xl shadow-sm transition-all duration-300 z-50 ${isIdentityExpanded ? 'absolute top-0 left-0 md:left-auto md:right-0 w-80 border-azure/20 shadow-xl p-4' : 'border-paleslate-dark flex items-center gap-3 px-4 py-2'}`}
            >
              {!isIdentityExpanded ? (
                // Collapsed State
                <>
                  <div className="w-2 h-2 rounded-full bg-azure animate-pulse"></div>
                  <span className="text-sm font-semibold text-ink">Active: {identity.tone || 'General'}</span>
                  <div
                    className="cursor-pointer p-1 hover:bg-paleslate rounded-full transition-colors"
                    onClick={() => setIsIdentityExpanded(true)}
                  >
                    <ChevronDown size={14} className="text-ink/40 hover:text-ink" />
                  </div>
                </>
              ) : (
                // Expanded State
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-ink/5 pb-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-azure" />
                      <span className="font-bold text-ink text-sm">Active Identity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-azure/10 text-azure px-2 py-0.5 rounded font-mono font-bold">LIVE</span>
                      <button
                        className="h-6 w-6 flex items-center justify-center p-0 text-ink/40 hover:text-ink hover:bg-paleslate rounded-full transition-colors"
                        onClick={() => setIsIdentityExpanded(false)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-1 block">Tone & Style</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-paleslate text-ink text-xs px-2 py-1 rounded-md font-medium">{identity.tone}</span>
                      <span className="bg-paleslate text-ink text-xs px-2 py-1 rounded-md font-medium">{identity.formality}</span>
                      <span className="bg-paleslate text-ink text-xs px-2 py-1 rounded-md font-medium">{identity.directness}</span>
                    </div>
                  </div>

                  {identity.values && identity.values.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-1 block">Core Values</label>
                      <div className="flex flex-wrap gap-1">
                        {identity.values.slice(0, 3).map((v, i) => (
                          <span key={i} className="text-xs text-ink/70 border border-ink/10 px-1.5 py-0.5 rounded">{v}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); onNavigate('editor'); }}
                      className="text-xs text-azure hover:text-azure-hover p-0 h-auto"
                    >
                      Edit Profile →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button onClick={() => onNavigate('onboarding')} variant="outline" size="sm" className="bg-white">
              <Sparkles size={14} className="mr-2" /> Create Identity
            </Button>
          )}
        </div>
      </div>

      {/* The Active Workbench (Center Hero) */}
      <Card className="bg-white border-none shadow-xl shadow-ink/5 overflow-hidden rounded-2xl relative">
        <CardContent className="p-8">
          {quickOutput ? (
            // Result View
            <div className="animate-fade-in relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-azure flex items-center gap-2">
                  <Sparkles size={20} /> Resonated Output
                </h2>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setQuickOutput('')} className="text-ink/60 hover:text-ink">
                    New Rewrite
                  </Button>
                  <Button onClick={handleCopy} className={`min-w-[100px] ${copySuccess ? 'bg-mint text-white' : ''}`}>
                    {copySuccess ? <><Check size={16} className="mr-2" /> Copied</> : <><Copy size={16} className="mr-2" /> Copy Text</>}
                  </Button>
                </div>
              </div>

              <div className="bg-paleslate rounded-xl p-6 text-ink/80 leading-relaxed text-lg shadow-inner min-h-[200px]">
                {quickOutput}
              </div>

              <div className="mt-6 flex justify-end">
                <p className="text-sm text-ink/40 italic">Aligned with your {identity?.tone} profile</p>
              </div>
            </div>
          ) : (
            // Input View
            <div className="relative">
              <TextArea
                placeholder="Paste your raw AI draft here..."
                className="w-full bg-transparent border-none text-lg text-ink placeholder:text-ink/30 focus:ring-0 resize-none p-0 min-h-[240px]"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                disabled={isTransforming}
                autoFocus
              />

              <div className="absolute bottom-0 right-0 z-10 pt-10 bg-gradient-to-t from-white via-white to-transparent w-full flex justify-end pb-2">
                <Button
                  size="lg"
                  onClick={handleQuickTransform}
                  isLoading={isTransforming}
                  disabled={isTransforming || !quickInput.trim() || !identity}
                  className="shadow-lg shadow-azure/20 text-base font-semibold px-8 py-6 h-auto rounded-xl"
                >
                  {isTransforming ? 'Resonating...' : <>Resonate Text <ArrowRight size={18} className="ml-2" /></>}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-ink">Recent Rewrites</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('history')}
            className="text-azure hover:text-azure-hover"
          >
            View All History →
          </Button>
        </div>

        {loadingTransformations ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-paleslate rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : transformations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transformations.map((item) => (
              <Card
                key={item.id}
                className="bg-white border hover:border-azure/30 transition-all duration-200 hover:shadow-md cursor-pointer group rounded-xl overflow-hidden"
                onClick={() => {
                  navigator.clipboard.writeText(item.final_output);
                }}
              >
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-xs font-semibold text-ink/40 uppercase tracking-wider">
                        {formatDate(item.created_at)}
                      </div>
                      {item.alignment_score !== null && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.alignment_score >= 8
                          ? 'bg-mint/10 text-mint'
                          : 'bg-highlight/10 text-highlight'
                          }`}>
                          {item.alignment_score.toFixed(1)} / 10
                        </span>
                      )}
                    </div>
                    <p className="text-ink text-sm font-medium line-clamp-3 leading-relaxed">
                      "{getPreview(item.final_output, 100)}"
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-azure text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy size={12} className="mr-1" /> Click to Copy
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-paleslate/50 rounded-xl border border-dashed border-ink/10">
            <p className="text-ink/40">No recent transformations found.</p>
          </div>
        )}
      </div>
    </div>
  );
};