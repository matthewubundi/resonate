import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/Components';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PageView } from '../types';
import { AlertCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

interface TransformationRow {
  id: string;
  input_text: string;
  final_output: string;
  alignment_score: number | null;
  model_used?: string | null;
  created_at: string;
}

const PAGE_SIZE = 10;

export const HistoryPage: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<TransformationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const truncate = (text: string, max = 120) => {
    if (!text) return '';
    return text.length > max ? `${text.slice(0, max)}…` : text;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Transformation History</h1>
          <p className="text-ink/60 text-sm mt-1">All transformations with pagination.</p>
        </div>
        <Button variant="ghost" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {error && (
        <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-highlight" size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-highlight">Error</p>
            <p className="text-sm text-ink/80">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchRows}>Retry</Button>
        </div>
      )}

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
    </div>
  );
};



