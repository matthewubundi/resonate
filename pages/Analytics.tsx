import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/Components';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PageView } from '../types';
import { AlertCircle, Loader2, TrendingUp, TrendingDown, BarChart3, Activity, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TransformationData {
  id: string;
  alignment_score: number | null;
  final_output: string | null;
  processing_time_ms: number | null;
  created_at: string;
}

interface AnalyticsMetrics {
  averageAlignmentScore: number;
  totalTransformations: number;
  recentAverageScore: number;
  olderAverageScore: number;
  driftDetected: boolean;
  driftDirection: 'up' | 'down' | 'stable';
  lowScoreCount: number;
  commonMisalignments: Array<{ score: number; date: string; preview: string }>;
  mostUsedWords: Array<{ word: string; count: number }>;
  scoreOverTime: Array<{ date: string; score: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  averageProcessingTime: number;
}

export const AnalyticsPage: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);

  const calculateMetrics = (data: TransformationData[]): AnalyticsMetrics => {
    if (data.length === 0) {
      return {
        averageAlignmentScore: 0,
        totalTransformations: 0,
        recentAverageScore: 0,
        olderAverageScore: 0,
        driftDetected: false,
        driftDirection: 'stable',
        lowScoreCount: 0,
        commonMisalignments: [],
        mostUsedWords: [],
        scoreOverTime: [],
        scoreDistribution: [],
        averageProcessingTime: 0,
      };
    }

    // Filter out entries without scores
    const scoredData = data.filter(d => d.alignment_score !== null);
    
    // Calculate average alignment score
    const totalScore = scoredData.reduce((sum, d) => sum + (d.alignment_score || 0), 0);
    const averageAlignmentScore = scoredData.length > 0 ? totalScore / scoredData.length : 0;

    // Calculate drift detection (compare recent vs older)
    const sortedByDate = [...scoredData].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const recentCount = Math.max(1, Math.floor(sortedByDate.length * 0.3)); // Last 30%
    const olderCount = Math.max(1, Math.floor(sortedByDate.length * 0.3)); // First 30% of sorted (oldest)
    
    const recentScores = sortedByDate.slice(0, recentCount).map(d => d.alignment_score || 0);
    const olderScores = sortedByDate.slice(-olderCount).map(d => d.alignment_score || 0);
    
    const recentAverageScore = recentScores.length > 0 
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length 
      : averageAlignmentScore;
    const olderAverageScore = olderScores.length > 0
      ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length
      : averageAlignmentScore;

    const scoreDiff = recentAverageScore - olderAverageScore;
    const driftDetected = Math.abs(scoreDiff) > 0.5; // Threshold for drift detection
    let driftDirection: 'up' | 'down' | 'stable' = 'stable';
    if (driftDetected) {
      driftDirection = scoreDiff > 0 ? 'up' : 'down';
    }

    // Common misalignments (scores < 8)
    const lowScores = scoredData
      .filter(d => (d.alignment_score || 0) < 8)
      .sort((a, b) => (a.alignment_score || 0) - (b.alignment_score || 0))
      .slice(0, 5)
      .map(d => ({
        score: d.alignment_score || 0,
        date: new Date(d.created_at).toLocaleDateString(),
        preview: d.final_output ? d.final_output.substring(0, 60) + '...' : 'No output',
      }));

    // Most used words (from final_output)
    const wordCounts: Record<string, number> = {};
    scoredData.forEach(d => {
      if (d.final_output) {
        const words = d.final_output
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 4); // Only words longer than 4 characters
        
        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
      }
    });

    const mostUsedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Score over time (group by day)
    const scoreByDate: Record<string, number[]> = {};
    scoredData.forEach(d => {
      const date = new Date(d.created_at).toLocaleDateString();
      if (!scoreByDate[date]) {
        scoreByDate[date] = [];
      }
      scoreByDate[date].push(d.alignment_score || 0);
    });

    const scoreOverTime = Object.entries(scoreByDate)
      .map(([date, scores]) => ({
        date,
        score: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days

    // Score distribution
    const distribution: Record<string, number> = {
      '9-10': 0,
      '8-9': 0,
      '7-8': 0,
      '6-7': 0,
      '<6': 0,
    };

    scoredData.forEach(d => {
      const score = d.alignment_score || 0;
      if (score >= 9) distribution['9-10']++;
      else if (score >= 8) distribution['8-9']++;
      else if (score >= 7) distribution['7-8']++;
      else if (score >= 6) distribution['6-7']++;
      else distribution['<6']++;
    });

    const scoreDistribution = Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
    }));

    // Average processing time
    const timesWithData = data.filter(d => d.processing_time_ms !== null);
    const averageProcessingTime = timesWithData.length > 0
      ? timesWithData.reduce((sum, d) => sum + (d.processing_time_ms || 0), 0) / timesWithData.length
      : 0;

    return {
      averageAlignmentScore,
      totalTransformations: data.length,
      recentAverageScore,
      olderAverageScore,
      driftDetected,
      driftDirection,
      lowScoreCount: lowScores.length,
      commonMisalignments: lowScores,
      mostUsedWords,
      scoreOverTime,
      scoreDistribution,
      averageProcessingTime,
    };
  };

  const fetchAnalytics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('transformations')
        .select('id, alignment_score, final_output, processing_time_ms, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const calculatedMetrics = calculateMetrics(data || []);
      setMetrics(calculatedMetrics);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Analytics Dashboard</h1>
            <p className="text-ink/60 text-sm mt-1">Performance metrics and insights</p>
          </div>
        </div>
        <Card className="bg-white">
          <CardContent className="p-12">
            <div className="flex items-center justify-center text-ink/60">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading analytics...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Analytics Dashboard</h1>
            <p className="text-ink/60 text-sm mt-1">Performance metrics and insights</p>
          </div>
        </div>
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-highlight" size={18} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-highlight">Error</p>
                <p className="text-sm text-ink/80">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchAnalytics}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics || metrics.totalTransformations === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Analytics Dashboard</h1>
            <p className="text-ink/60 text-sm mt-1">Performance metrics and insights</p>
          </div>
        </div>
        <Card className="bg-white">
          <CardContent className="p-12 text-center text-ink/60">
            <BarChart3 size={48} className="mx-auto mb-4 text-ink/30" />
            <p className="font-medium">No analytics data available</p>
            <p className="text-sm mt-2">Analytics will appear here once you start using the system</p>
            <Button className="mt-4" onClick={() => onNavigate('transform')}>
              Start Transforming
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Analytics Dashboard</h1>
          <p className="text-ink/60 text-sm mt-1">Performance metrics and insights</p>
        </div>
        <Button variant="ghost" onClick={fetchAnalytics}>
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-ink/40">Avg Alignment</p>
              <Activity className="h-4 w-4 text-azure" />
            </div>
            <p className="text-3xl font-bold text-ink">{metrics.averageAlignmentScore.toFixed(1)}</p>
            <p className="text-xs text-ink/60 mt-1">out of 10.0</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-ink/40">Total Transforms</p>
              <BarChart3 className="h-4 w-4 text-azure" />
            </div>
            <p className="text-3xl font-bold text-ink">{metrics.totalTransformations}</p>
            <p className="text-xs text-ink/60 mt-1">transformations</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-ink/40">Drift Status</p>
              {metrics.driftDetected ? (
                metrics.driftDirection === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-highlight" />
                )
              ) : (
                <Activity className="h-4 w-4 text-ink/40" />
              )}
            </div>
            <p className="text-3xl font-bold text-ink">
              {metrics.driftDetected 
                ? (metrics.driftDirection === 'up' ? '↑' : '↓')
                : '—'
              }
            </p>
            <p className="text-xs text-ink/60 mt-1">
              {metrics.driftDetected 
                ? `${metrics.driftDirection === 'up' ? 'Improving' : 'Declining'}`
                : 'Stable'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-ink/40">Low Scores</p>
              <AlertTriangle className="h-4 w-4 text-highlight" />
            </div>
            <p className="text-3xl font-bold text-ink">{metrics.lowScoreCount}</p>
            <p className="text-xs text-ink/60 mt-1">below 8.0 threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alignment Score Trend */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Alignment Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.scoreOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.scoreOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 10]}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      color: '#111111', 
                      borderRadius: '8px', 
                      border: '1px solid #E2E8F0', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }}
                    itemStyle={{ color: '#2563EB' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ fill: '#FFFFFF', stroke: '#2563EB', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#2563EB' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-ink/60">
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.scoreDistribution.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis 
                    dataKey="range" 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      color: '#111111', 
                      borderRadius: '8px', 
                      border: '1px solid #E2E8F0', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} opacity={0.9} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-ink/60">
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common Misalignments */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Common Misalignments</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.commonMisalignments.length > 0 ? (
              <div className="space-y-3">
                {metrics.commonMisalignments.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start justify-between p-3 bg-paleslate rounded-lg border border-ink/5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg font-bold ${item.score < 7 ? 'text-highlight' : 'text-ink/60'}`}>
                          {item.score.toFixed(1)}
                        </span>
                        <span className="text-xs text-ink/50">{item.date}</span>
                      </div>
                      <p className="text-sm text-ink/80 truncate">{item.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-ink/60">
                <p className="font-medium">No misalignments detected</p>
                <p className="text-sm mt-2">All scores are above 8.0</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Used Words */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Most Used Words</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.mostUsedWords.length > 0 ? (
              <div className="space-y-2">
                {metrics.mostUsedWords.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2 bg-paleslate rounded-lg"
                  >
                    <span className="text-sm font-semibold text-ink">{item.word}</span>
                    <span className="text-xs font-bold text-azure bg-azure/10 px-2 py-1 rounded">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-ink/60">
                <p className="font-medium">No word data available</p>
                <p className="text-sm mt-2">Words will appear after transformations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drift Analysis */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Drift Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-paleslate rounded-lg">
                <span className="text-sm font-semibold text-ink">Recent Average</span>
                <span className="text-lg font-bold text-ink">{metrics.recentAverageScore.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-paleslate rounded-lg">
                <span className="text-sm font-semibold text-ink">Older Average</span>
                <span className="text-lg font-bold text-ink">{metrics.olderAverageScore.toFixed(1)}</span>
              </div>
              <div className={`p-3 rounded-lg border-2 ${
                metrics.driftDetected 
                  ? metrics.driftDirection === 'up'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-highlight/10 border-highlight/20'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Status</span>
                  <span className={`text-sm font-bold ${
                    metrics.driftDetected 
                      ? metrics.driftDirection === 'up'
                        ? 'text-green-600'
                        : 'text-highlight'
                      : 'text-blue-600'
                  }`}>
                    {metrics.driftDetected 
                      ? `Drift ${metrics.driftDirection === 'up' ? 'Detected (Improving)' : 'Detected (Declining)'}`
                      : 'No Significant Drift'
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-paleslate rounded-lg">
                <span className="text-sm font-semibold text-ink">Avg Processing Time</span>
                <span className="text-lg font-bold text-ink">
                  {metrics.averageProcessingTime > 0 
                    ? `${(metrics.averageProcessingTime / 1000).toFixed(2)}s`
                    : '—'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-paleslate rounded-lg">
                <span className="text-sm font-semibold text-ink">Target Threshold</span>
                <span className="text-lg font-bold text-azure">8.0 / 10.0</span>
              </div>
              <div className={`p-3 rounded-lg border-2 ${
                metrics.averageAlignmentScore >= 8
                  ? 'bg-green-50 border-green-200'
                  : 'bg-highlight/10 border-highlight/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Overall Status</span>
                  <span className={`text-sm font-bold ${
                    metrics.averageAlignmentScore >= 8
                      ? 'text-green-600'
                      : 'text-highlight'
                  }`}>
                    {metrics.averageAlignmentScore >= 8 ? 'Meeting Target' : 'Below Target'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

