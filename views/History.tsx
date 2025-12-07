import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/Components';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PageView } from '../types';
import { AlertCircle, Loader2, ArrowLeft, ArrowRight, RotateCcw, ChevronDown, ChevronUp, Edit, GitCommit } from 'lucide-react';

interface TransformationRow {
  id: string;
  input_text: string;
  final_output: string;
  alignment_score: number | null;
  model_used?: string | null;
  created_at: string;
}

interface IdentityVersion {
  id: string;
  identity_id: string;
  identity_json: any;
  change_summary: string | null;
  created_at: string;
}

const PAGE_SIZE = 10;

export const HistoryPage: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'transformations' | 'versions'>('transformations');
  const [rows, setRows] = useState<TransformationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'date' | 'score'>('date');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Identity Versions state
  const [versions, setVersions] = useState<IdentityVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  const fetchRows = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      let query = supabase
        .from('transformations')
        .select('id, input_text, final_output, alignment_score, model_used, created_at', { count: 'exact' })
        .eq('user_id', user.id);

      // Search Logic
      if (searchQuery) {
        query = query.or(`input_text.ilike.%${searchQuery}%,final_output.ilike.%${searchQuery}%`);
      }

      // Sort Logic
      if (sortOption === 'score') {
        query = query.order('alignment_score', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error: fetchError, count } = await query.range(from, to);

      if (fetchError) throw fetchError;

      setRows(data || []);
      setTotal(count || 0);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Debounce search slightly or just run it
      const timer = setTimeout(() => {
        setPage(0); // Reset to page 0 on new search/sort
        fetchRows();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, searchQuery, sortOption]);

  useEffect(() => {
    if (user) {
      fetchRows();
    }
  }, [page]);

  const fetchVersions = async () => {
    if (!user) return;
    setVersionsLoading(true);
    setVersionsError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setVersionsError('You must be logged in to view versions.');
        setVersionsLoading(false);
        return;
      }

      const res = await fetch('/api/history/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch versions');
      }

      const data = await res.json();
      setVersions(data.versions || []);
    } catch (err: any) {
      console.error('Error fetching versions:', err);
      setVersionsError(err.message || 'Failed to load versions');
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!user) return;
    setRestoring(versionId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setVersionsError('You must be logged in to restore versions.');
        setRestoring(null);
        return;
      }

      const res = await fetch('/api/history/rollback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version_id: versionId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to restore version');
      }

      // Refresh versions after rollback
      await fetchVersions();
    } catch (err: any) {
      console.error('Error restoring version:', err);
      setVersionsError(err.message || 'Failed to restore version');
    } finally {
      setRestoring(null);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'versions') {
      fetchVersions();
    }
  }, [user, activeTab]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const formatRelativeDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  const getFirstSentence = (text: string) => {
    if (!text) return '';
    const match = text.match(/[^.!?]+[.!?]/);
    return match ? match[0] : text;
  };

  // --- Identity Diff Logic ---
  const getDiff = (currentJson: any, prevJson: any) => {
    // If no previous version, we might show everything as added, 
    // but the prompt focuses on "Changes". 
    // However, showing key properties for the initial commit is good.
    // For now, if no prevJson, we return distinct properties or empty if strict diff.
    if (!prevJson) return [];

    const changes: { key: string; oldVal: any; newVal: any }[] = [];
    const allKeys = new Set([...Object.keys(currentJson || {}), ...Object.keys(prevJson || {})]);

    allKeys.forEach(key => {
      // Skip meta keys potentially
      if (key === 'id' || key === 'created_at') return;

      const val1 = prevJson ? prevJson[key] : undefined;
      const val2 = currentJson ? currentJson[key] : undefined;

      // Simple JSON stringify comparison
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        changes.push({ key, oldVal: val1, newVal: val2 });
      }
    });
    return changes;
  };

  // Helper to format value for display
  const formatValue = (val: any) => {
    if (val === undefined) return 'None';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="min-h-screen bg-paleslate p-6 md:p-12 font-sans text-ink">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink">Transformation Feed</h1>
            <p className="text-ink/60 mt-1">
              Review your past resonances and identity versions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm border border-ink/5">
              <button
                onClick={() => setActiveTab('transformations')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'transformations'
                  ? 'bg-ink text-white shadow-md'
                  : 'text-ink/60 hover:text-ink hover:bg-slate-50'
                  }`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'versions'
                  ? 'bg-ink text-white shadow-md'
                  : 'text-ink/60 hover:text-ink hover:bg-slate-50'
                  }`}
              >
                Versions
              </button>
            </div>
            <Button variant="ghost" className="bg-white border border-ink/5 shadow-sm text-ink hover:bg-slate-50" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Transformations Tab Content */}
        {activeTab === 'transformations' && (
          <div className="space-y-6">

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-ink/5 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search inside transformations..."
                  className="block w-full pl-10 pr-3 py-2 border border-ink/10 rounded-lg leading-5 bg-paleslate/30 placeholder-ink/30 focus:outline-none focus:bg-white focus:ring-1 focus:ring-azure focus:border-azure transition-colors sm:text-sm text-ink"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as 'date' | 'score')}
                  className="block w-full md:w-auto pl-3 pr-8 py-2 text-sm border border-ink/10 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure text-ink"
                >
                  <option value="date">Sort by Date</option>
                  <option value="score">Sort by Score</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-highlight" size={18} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-highlight">Error Loading Feed</p>
                  <p className="text-sm text-ink/80">{error}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchRows}>Retry</Button>
              </div>
            )}

            {/* Feed List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-ink/40">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-azure" />
                <p>Loading transformation feed...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-ink/5 border-dashed">
                <div className="mx-auto w-16 h-16 bg-paleslate rounded-full flex items-center justify-center mb-4 text-ink/20">
                  <RotateCcw size={32} />
                </div>
                <h3 className="text-lg font-medium text-ink">No transformations found</h3>
                <p className="text-ink/50 mt-1 max-w-sm mx-auto">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Go to the Dashboard to create your first resonance.'}
                </p>
                {searchQuery && (
                  <Button variant="ghost" className="mt-4 text-azure hover:bg-azure/5" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {rows.map((row) => {
                  const score = row.alignment_score || 0;
                  const isHigh = score >= 8.0;
                  const isExpanded = expandedCardId === row.id;
                  const headline = getFirstSentence(row.final_output);

                  return (
                    <div
                      key={row.id}
                      className={`group relative bg-paper rounded-xl border transition-all duration-200 ${isExpanded ? 'ring-2 ring-azure/10 shadow-lg border-azure/20' : 'border-ink/5 shadow-sm hover:shadow-md hover:border-azure/20'
                        }`}
                    >
                      {/* Side Status Bar (Visual Indicator) */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors ${isHigh ? 'bg-mint' : 'bg-highlight'
                        }`} />

                      <div className="p-5 pl-7 cursor-pointer" onClick={() => setExpandedCardId(isExpanded ? null : row.id)}>
                        <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">

                          {/* Content */}
                          <div className="flex-1 space-y-2">
                            {/* Score & Date Header */}
                            <div className="flex items-center gap-3 text-xs mb-1">
                              <span className={`px-2 py-0.5 rounded-full font-bold ${isHigh ? 'bg-mint/10 text-mint-hover' : 'bg-highlight/10 text-yellow-700'
                                }`}>
                                {score.toFixed(1)} Alignment
                              </span>
                              <span className="text-ink/40 font-medium">{formatRelativeDate(row.created_at)}</span>
                              {row.model_used && (
                                <span className="text-ink/30 border border-ink/10 px-1.5 rounded uppercase tracking-wider text-[10px]">
                                  {row.model_used}
                                </span>
                              )}
                            </div>

                            {/* Headline */}
                            <h3 className="text-lg font-bold text-ink leading-tight group-hover:text-azure transition-colors">
                              {headline}
                            </h3>

                            {/* Snippet */}
                            <p className="text-ink/50 text-sm line-clamp-1 font-medium">
                              From: "{row.input_text.slice(0, 80)}{row.input_text.length > 80 ? '...' : ''}"
                            </p>
                          </div>

                          {/* Action Icon */}
                          <div className="hidden md:flex flex-col items-end justify-between self-stretch">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-azure font-medium hover:bg-azure/5"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(row.final_output);
                              }}
                            >
                              Copy
                            </Button>
                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown className="h-5 w-5 text-ink/20" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expansion Panel (Accordion) */}
                      {isExpanded && (
                        <div className="border-t border-ink/5 bg-paleslate/20 p-5 pl-7 animate-fade-in">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Original */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-ink/40 uppercase tracking-wider">Original Input</label>
                              <div className="p-3 bg-white rounded-lg border border-ink/5 text-sm text-ink/70 leading-relaxed whitespace-pre-wrap">
                                {row.input_text}
                              </div>
                            </div>

                            {/* Resonated */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-azure/60 uppercase tracking-wider">Resonated Output</label>
                              <div className="p-3 bg-white rounded-lg border border-azure/20 shadow-sm text-sm text-ink leading-relaxed whitespace-pre-wrap">
                                {row.final_output}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-3">
                            <Button variant="outline" size="sm" onClick={() => setExpandedCardId(null)}>
                              Close
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-azure hover:bg-azure-hover text-white"
                              onClick={() => {
                                navigator.clipboard.writeText(row.final_output);
                              }}
                            >
                              Copy Result
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {rows.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-ink/5">
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                  className="text-ink/60 hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <div className="text-sm font-medium text-ink/40">
                  Page {page + 1} of {totalPages}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
                  disabled={page + 1 >= totalPages || loading}
                  className="text-ink/60 hover:text-ink"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Identity Versions Tab - Redesigned */}
        {activeTab === 'versions' && (
          <div className="space-y-6">
            {versionsError && (
              <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-highlight" size={18} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-highlight">Error</p>
                  <p className="text-sm text-ink/80">{versionsError}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchVersions}>Retry</Button>
              </div>
            )}

            {versionsLoading ? (
              <div className="flex items-center justify-center py-12 text-ink/60">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading versions...
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12 text-ink/60 bg-white rounded-xl border border-ink/5">
                <p className="font-medium text-lg mb-2">No identity versions yet.</p>
                <p className="text-sm">Identity versions will appear here once they are created.</p>
              </div>
            ) : (
              <div className="relative pl-10 md:pl-12">
                {/* Timeline Track - Solid Slate-200 line running through */}
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-200" />

                <div className="space-y-8">
                  {versions.map((version, index) => {
                    const isCurrent = index === 0;
                    const prevVersion = versions[index + 1];
                    const changes = getDiff(version.identity_json, prevVersion?.identity_json);
                    const isExpanded = expandedVersionId === version.id;
                    const versionNumber = versions.length - index;

                    return (
                      <div key={version.id} className="relative">
                        {/* Timeline Node */}
                        <div className="absolute -left-[37px] top-6 flex items-center justify-center">
                          {isCurrent ? (
                            <div className="relative">
                              <div className="absolute inset-0 bg-azure/30 rounded-full animate-ping" />
                              <div className="relative w-4 h-4 rounded-full bg-azure border-2 border-white shadow-sm ring-2 ring-azure/20" />
                            </div>
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-slate-400 border-2 border-paleslate ring-2 ring-slate-200" />
                          )}
                        </div>

                        {/* Arrow pointing to node */}
                        <div className="absolute -left-[14px] top-8 w-3 h-[1px] bg-slate-200/50" />

                        {/* Card */}
                        <div
                          className={`
                            relative rounded-xl border transition-all duration-200 overflow-hidden
                            ${isCurrent
                              ? 'bg-paper border-azure/30 shadow-md ring-1 ring-azure/5'
                              : 'bg-white border-ink/5 shadow-sm'
                            }
                          `}
                        >
                          {/* Live Badge for Current */}
                          {isCurrent && (
                            <div className="absolute top-0 right-0 bg-mint text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
                              Live
                            </div>
                          )}

                          <div className={`p-6 ${isCurrent ? 'bg-azure/5' : ''}`}>
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className={`text-lg font-bold ${isCurrent ? 'text-azure' : 'text-ink'}`}>
                                    Version {versionNumber}
                                  </h3>
                                  <span className="text-sm text-ink/40">•</span>
                                  <span className="text-sm text-ink/50 font-medium">
                                    Created {formatRelativeDate(version.created_at)}
                                  </span>
                                </div>
                                {version.change_summary && (
                                  <div className="mt-2 text-ink/70 text-sm max-w-xl">
                                    {version.change_summary}
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                {isCurrent ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onNavigate('editor')}
                                    className="border-azure/20 text-azure hover:bg-azure/5"
                                  >
                                    <Edit className="h-3.5 w-3.5 mr-2" />
                                    Edit This Version
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRollback(version.id)}
                                    disabled={restoring === version.id}
                                    isLoading={restoring === version.id}
                                    className="hover:bg-highlight hover:text-white hover:border-yellow-500 transition-colors"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                    Rollback to V{versionNumber}
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* The Changes (Diff) */}
                            <div className="bg-white/50 rounded-lg border border-ink/5 p-4 mb-2">
                              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-ink/40">
                                <GitCommit className="h-3 w-3" />
                                Changes
                              </div>

                              {changes.length > 0 ? (
                                <div className="space-y-2">
                                  {changes.map(({ key, oldVal, newVal }) => (
                                    <div key={key} className="text-sm flex items-start gap-2">
                                      <span className="font-semibold text-ink min-w-[80px] capitalize">{key}:</span>
                                      <div className="flex-1 text-ink/60">
                                        <span className="line-through decoration-red-400 decoration-2 mr-2 opacity-60">
                                          {formatValue(oldVal)}
                                        </span>
                                        <ArrowRight className="inline h-3 w-3 mx-1 text-ink/20" />
                                        <span className={`${isCurrent ? 'text-azure font-medium' : 'text-ink font-medium'}`}>
                                          {formatValue(newVal)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-ink/40 italic">
                                  {prevVersion ? 'No configuration changes detected.' : 'Initial version created.'}
                                </p>
                              )}
                            </div>

                            {/* Accordion Trigger */}
                            <button
                              onClick={() => setExpandedVersionId(isExpanded ? null : version.id)}
                              className="text-xs font-medium text-ink/40 hover:text-azure flex items-center gap-1 mt-2 transition-colors ml-auto"
                            >
                              {isExpanded ? 'Hide Full Configuration' : 'View Full Configuration'}
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          </div>

                          {/* Full Configuration Accordion */}
                          {isExpanded && (
                            <div className="bg-slate-50 border-t border-ink/5 p-6 animate-fade-in">
                              <div className="text-xs font-bold text-ink/40 uppercase tracking-wide mb-3">
                                Full JSON Snapshot
                              </div>
                              <pre className="text-xs font-mono text-ink/70 overflow-x-auto bg-white p-4 rounded border border-ink/5">
                                {JSON.stringify(version.identity_json, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
