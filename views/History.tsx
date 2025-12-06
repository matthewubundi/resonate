import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/Components';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PageView } from '../types';
import { AlertCircle, Loader2, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

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
  
  // Identity Versions state
  const [versions, setVersions] = useState<IdentityVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const fetchRows = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data, error: fetchError, count } = await supabase
        .from('transformations')
        .select('id, input_text, final_output, alignment_score, model_used, created_at', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

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
      fetchRows();
    }
  }, [user, page]);

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

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const formatRelativeDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  const truncate = (text: string, max = 120) => {
    if (!text) return '';
    return text.length > max ? `${text.slice(0, max)}…` : text;
  };

  const getPreviewFromJson = (json: any) => {
    const preview: Record<string, string> = {};
    if (json.tone) preview.tone = json.tone;
    if (json.style) preview.style = json.style;
    if (json.voice) preview.voice = json.voice;
    if (json.formality) preview.formality = json.formality;
    return preview;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">History & Archives</h1>
          <p className="text-ink/60 text-sm mt-1">
            {activeTab === 'transformations' 
              ? 'All transformations with pagination.' 
              : 'View and restore previous identity versions.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Tab Switcher */}
          <div className="inline-flex items-center bg-slate-100 rounded-full p-1 gap-1">
            <button
              onClick={() => setActiveTab('transformations')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                activeTab === 'transformations'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              Transformations
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                activeTab === 'versions'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              Identity Versions
            </button>
          </div>
          <Button variant="ghost" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {error && activeTab === 'transformations' && (
        <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-highlight" size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-highlight">Error</p>
            <p className="text-sm text-ink/80">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchRows}>Retry</Button>
        </div>
      )}

      {/* Transformations Tab */}
      {activeTab === 'transformations' && (
        <>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Transformations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-ink/60">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading history...
                </div>
              ) : rows.length === 0 ? (
                <div className="py-12 text-center text-ink/60">
                  <p className="font-medium">No transformations yet.</p>
                  <p className="text-sm mt-2">Run a transform to see it here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-ink">
                    <thead>
                      <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3 pr-4">Input</th>
                        <th className="py-3 pr-4">Output</th>
                        <th className="py-3 pr-4">Model</th>
                        <th className="py-3 pr-4 text-right">Alignment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="border-b border-ink/5 hover:bg-paleslate/40 transition-colors">
                          <td className="py-3 pr-4 align-top whitespace-nowrap text-xs text-ink/70">
                            {formatDate(row.created_at)}
                          </td>
                          <td className="py-3 pr-4 align-top max-w-xs">
                            <div className="text-ink/80">{truncate(row.input_text)}</div>
                          </td>
                          <td className="py-3 pr-4 align-top max-w-xs">
                            <div className="text-ink/80">{truncate(row.final_output)}</div>
                          </td>
                          <td className="py-3 pr-4 align-top text-xs text-ink/70">
                            {row.model_used || '—'}
                          </td>
                          <td className="py-3 pr-0 align-top text-right text-xs font-semibold">
                            {row.alignment_score !== null ? row.alignment_score.toFixed(1) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="text-sm text-ink/60">
              Page {page + 1} of {totalPages} • {total} total
            </div>
            <Button
              variant="ghost"
              onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
              disabled={page + 1 >= totalPages || loading}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* Identity Versions Tab */}
      {activeTab === 'versions' && (
        <>
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
            <Card className="bg-white">
              <CardContent className="p-12">
                <div className="flex items-center justify-center text-ink/60">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading versions...
                </div>
              </CardContent>
            </Card>
          ) : versions.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="p-12">
                <div className="text-center text-ink/60">
                  <p className="font-medium text-lg mb-2">No identity versions yet.</p>
                  <p className="text-sm">Identity versions will appear here once they are created.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              {/* Vertical Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-ink/10" />
              
              <div className="space-y-6 pl-12">
                {versions.map((version, index) => {
                  const isCurrent = index === 0; // First version is the most recent
                  const preview = getPreviewFromJson(version.identity_json);
                  
                  return (
                    <div key={version.id} className="relative">
                      {/* Dot on Timeline */}
                      <div className="absolute -left-[3.25rem] top-6">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            isCurrent
                              ? 'bg-green-500 border-green-600'
                              : 'bg-slate-400 border-slate-500'
                          }`}
                        />
                      </div>

                      {/* Card */}
                      <Card className="bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-ink">
                                  Version {versions.length - index}
                                </h3>
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    isCurrent
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {isCurrent ? 'Current Version' : 'Snapshot'}
                                </span>
                              </div>
                              <p className="text-sm text-ink/60">
                                Created {formatRelativeDate(version.created_at)}
                              </p>
                              {version.change_summary && (
                                <p className="text-xs text-ink/50 mt-1">
                                  {version.change_summary}
                                </p>
                              )}
                            </div>
                            {!isCurrent && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRollback(version.id)}
                                disabled={restoring === version.id}
                                isLoading={restoring === version.id}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restore
                              </Button>
                            )}
                          </div>

                          {/* Preview Area */}
                          {Object.keys(preview).length > 0 && (
                            <div className="mt-4 p-4 bg-paleslate rounded-lg border border-ink/5">
                              <div className="text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wide">
                                Preview
                              </div>
                              <div className="space-y-1">
                                {Object.entries(preview).map(([key, value]) => (
                                  <div key={key} className="text-sm text-ink/80">
                                    <span className="font-semibold text-ink capitalize">{key}:</span>{' '}
                                    <span className="text-ink/70">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};



