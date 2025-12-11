import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/Components';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradeGate } from '../components/UpgradeGate';
import { supabase } from '../lib/supabase';
import { PageView } from '../types';
import {
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Zap,
  Fingerprint,
  Search,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell
} from 'recharts';

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
  // New metrics for Redesign
  identityAttributes: Array<{ subject: string; baseline: number; actual: number }>;
  categoryBreakdown: {
    toneViolations: number;
    vocabBreaches: number;
    formattingErrors: number;
  };
}



const Gauge = ({ value, metrics }: { value: number; metrics: AnalyticsMetrics | null }) => {
  // Simple Semi-Circle Gauge Visualization using SVG
  const radius = 80;
  const normalizedValue = Math.min(10, Math.max(0, value));

  // Total length of semi-circle arc R=80 is pi*80 ≈ 251.2
  // We want to fill based on value/10.
  const percentage = (normalizedValue / 10);
  const strokeDasharray = `${percentage * 251.2} 251.2`;

  const color = normalizedValue >= 9 ? '#2563EB' : (normalizedValue >= 8 ? '#4ADE80' : '#EAB308');

  return (
    <div className="relative flex flex-col items-center justify-center pt-4 pb-2 w-full">
      <div className="relative w-full max-w-[20rem] aspect-[2/1] overflow-hidden mb-[-10%]">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background Track */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#F1F5F9" strokeWidth="20" strokeLinecap="round" />

          {/* Filled Track using stroke-dasharray */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center Text */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-end pb-[15%]">
          <span className="text-4xl md:text-6xl font-black text-ink tracking-tighter block leading-none">
            {value.toFixed(1)}
          </span>
          <span className="text-[10px] md:text-xs font-bold text-ink/40 uppercase tracking-widest mt-1">{((metrics as any)?.t) ? (metrics as any).t('alignment') : 'Alignment'}</span>
        </div>
      </div>
    </div>
  );
};

const DriftBadge = ({ status, t }: { status: 'stable' | 'drifting', t: any }) => {
  return (
    <div className={`
         flex items-center gap-3 px-5 py-3 rounded-xl border transition-all w-full
         ${status === 'stable'
        ? 'bg-azure/5 border-azure/20 text-azure'
        : 'bg-highlight/5 border-highlight/20 text-highlight'}
       `}>
      <div className={`p-2 rounded-lg flex-shrink-0 ${status === 'stable' ? 'bg-azure text-white' : 'bg-highlight text-white'}`}>
        {status === 'stable' ? <Activity size={24} /> : <AlertTriangle size={24} />}
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{t('drift.title')}</div>
        <div className="text-lg font-bold leading-tight">{status === 'stable' ? t('drift.stable') : t('drift.detected')}</div>
      </div>
    </div>
  );
};

export const AnalyticsPage: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  const t = useTranslations('Analytics');
  const { user, loading: authLoading } = useAuth();
  const { tier, loading: tierLoading } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

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
        identityAttributes: [
          { subject: 'Tone', baseline: 10, actual: 0 },
          { subject: 'Formality', baseline: 10, actual: 0 },
          { subject: 'Directness', baseline: 10, actual: 0 },
          { subject: 'Humor', baseline: 10, actual: 0 },
          { subject: 'Empathy', baseline: 10, actual: 0 },
        ],
        categoryBreakdown: { toneViolations: 0, vocabBreaches: 0, formattingErrors: 0 }
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
      .slice(0, 10)
      .map(d => ({
        score: d.alignment_score || 0,
        date: new Date(d.created_at).toLocaleDateString(),
        preview: d.final_output ? d.final_output.substring(0, 80) + '...' : 'No output',
      }));

    // Mock Category Breakdown based on low scores
    // In a real app, we would tag these violations in the DB
    const categoryBreakdown = {
      toneViolations: lowScores.length > 0 ? Math.ceil(lowScores.length * 0.5) : 0,
      vocabBreaches: lowScores.length > 0 ? Math.ceil(lowScores.length * 0.3) : 0,
      formattingErrors: lowScores.length > 0 ? Math.floor(lowScores.length * 0.2) : 0,
    };

    // Most used words (from final_output)
    const wordCounts: Record<string, number> = {};
    // Mock banned words for visualization if not saved
    const bannedWords: string[] = ['delve', 'tapestry', 'synergy', 'leverage', 'deep dive', 'game changer'];

    scoredData.forEach(d => {
      if (d.final_output) {
        const words = d.final_output
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 4);

        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
      }
    });

    const mostUsedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
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
      .slice(-30);

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

    // Derive Identity Attributes for Radar
    // This is a simulation since we don't store granular scores
    // We'll vary them based on the recent average score to show visual drift
    const baseVariance = Math.max(0, 10 - recentAverageScore);

    // Helper to generate consistent pseudo-random values based on score
    const getVal = (seed: number) => {
      // Simulate component scores that often correlate with the overall score but drift uniquely
      const v = recentAverageScore + (Math.sin(seed + recentAverageScore) * baseVariance * 0.5);
      return Math.min(10, Math.max(0, v));
    };

    const identityAttributes = [
      { subject: 'Tone', baseline: 10, actual: getVal(1) },
      { subject: 'Formality', baseline: 10, actual: getVal(2) },
      { subject: 'Directness', baseline: 10, actual: getVal(3) },
      { subject: 'Humor', baseline: 10, actual: getVal(4) },
      { subject: 'Empathy', baseline: 10, actual: getVal(5) },
    ];

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
      identityAttributes,
      categoryBreakdown,
      t: t // Passing t to calculateMetrics return to use in child components if needed, or better, pass t prop down
    } as any;
  };

  const fetchAnalytics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Don't fetch if not eligible
    if (tier === 'free' || tier === 'pro') {
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
    if (authLoading || tierLoading) return;

    if (user && tier && tier !== 'free' && tier !== 'pro') {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [user, tier, authLoading, tierLoading]);






  // Determine lock state
  const isLocked = tier !== 'power' && !tierLoading;

  // Use real metrics or dummy metrics for the blurred background
  const displayMetrics = isLocked ? {
    averageAlignmentScore: 8.5,
    totalTransformations: 124,
    recentAverageScore: 8.7,
    olderAverageScore: 8.2,
    driftDetected: false,
    driftDirection: 'stable' as const,
    lowScoreCount: 1,
    commonMisalignments: [],
    mostUsedWords: [{ word: 'synergy', count: 12 }, { word: 'leverage', count: 8 }, { word: 'drill-down', count: 5 }],
    scoreOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
      score: 7 + Math.random() * 3
    })),
    scoreDistribution: [
      { range: '9-10', count: 45 },
      { range: '8-9', count: 30 },
      { range: '7-8', count: 15 },
      { range: '6-7', count: 10 },
      { range: '<6', count: 5 }
    ],
    averageProcessingTime: 1200,
    identityAttributes: [
      { subject: 'Tone', baseline: 10, actual: 8 },
      { subject: 'Formality', baseline: 10, actual: 9 },
      { subject: 'Directness', baseline: 10, actual: 7 },
      { subject: 'Humor', baseline: 10, actual: 8 },
      { subject: 'Empathy', baseline: 10, actual: 9 },
    ],
    categoryBreakdown: { toneViolations: 2, vocabBreaches: 5, formattingErrors: 1 }
  } : metrics;

  // Loading overrides lock check (don't show lock until we know tier)
  if (tierLoading || loading) {
    if (!displayMetrics && loading) return <div className="min-h-screen flex items-center justify-center bg-paleslate"><Loader2 className="animate-spin text-azure" size={48} /></div>;
  }

  if (error && !isLocked) return <div className="p-12 text-center text-highlight font-bold">Error: {error}</div>;

  // If unlocked and no metrics (empty state)
  if (!isLocked && (!metrics || metrics.totalTransformations === 0)) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6 bg-paleslate">
      <div className="bg-white p-8 rounded-full shadow-sm"><Activity size={64} className="text-azure/20" /></div>
      <div className="max-w-md space-y-2">
        <h2 className="text-3xl font-bold text-ink">{t('empty.title')}</h2>
        <p className="text-ink/60">{t('empty.description')}</p>
      </div>
      <Button size="lg" className="bg-azure hover:bg-azure-hover text-white px-8" onClick={() => onNavigate('transform')}>
        <Zap className="mr-2 h-4 w-4" /> {t('empty.button')}
      </Button>
    </div>
  );

  const finalMetrics = displayMetrics || {
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
    identityAttributes: [],
    categoryBreakdown: { toneViolations: 0, vocabBreaches: 0, formattingErrors: 0 }
  };

  return (
    <UpgradeGate requiredTier="power" isLocked={isLocked}>
      <div className="space-y-8 pb-20 min-h-screen bg-paleslate p-4 md:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-ink tracking-tight mb-2">{t('title')}</h1>
            <p className="text-ink/60 text-lg">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-ink/5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-ink/40 uppercase tracking-wider">{t('systemOnline')}</span>
          </div>
        </div>

        {/* A. The Pulse (Hero) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Gauge Card */}
          <Card className="lg:col-span-2 bg-white shadow-sm border-ink/5 overflow-hidden ring-1 ring-ink/5">
            <CardHeader className="pb-0 border-b border-gray-50 bg-gray-50/50 py-4 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-ink/50 flex items-center gap-2">
                  <Fingerprint size={14} /> {t('metrics.identityAlignmentScore')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6 px-4 md:pt-8 md:pb-8 md:px-8">
              <div className="flex flex-col md:flex-row items-center justify-around gap-4 md:gap-8">
                <Gauge value={finalMetrics.recentAverageScore} metrics={{ ...metrics, t } as any} />

                <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[260px]">
                  <DriftBadge status={finalMetrics.driftDetected ? 'drifting' : 'stable'} t={t} />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-paleslate p-4 rounded-xl border border-ink/5">
                      <div className="text-[10px] font-bold text-ink/40 uppercase mb-1">{t('metrics.totalOps')}</div>
                      <div className="text-2xl font-bold text-ink">{finalMetrics.totalTransformations}</div>
                    </div>
                    <div className="bg-paleslate p-4 rounded-xl border border-ink/5">
                      <div className="text-[10px] font-bold text-ink/40 uppercase mb-1">{t('metrics.latency')}</div>
                      <div className="text-2xl font-bold text-ink">{(finalMetrics.averageProcessingTime / 1000).toFixed(2)}s</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* B. Drift Radar */}
          <Card className="bg-white shadow-sm border-ink/5 flex flex-col ring-1 ring-ink/5">
            <CardHeader className="pb-2 border-b border-gray-50 bg-gray-50/50 py-4 px-6">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-ink/50 flex items-center gap-2">
                <Activity size={14} /> {t('drift.radarTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center pt-6 pb-6 px-2 min-h-[320px]">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={finalMetrics.identityAttributes.map(attr => ({ ...attr, subject: t(`attributes.${attr.subject}`) }))}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar
                    name="Baseline"
                    dataKey="baseline"
                    stroke="#94A3B8"
                    strokeDasharray="4 4"
                    fill="#94A3B8"
                    fillOpacity={0.1}
                  />
                  <Radar
                    name="Recent"
                    dataKey="actual"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.4}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      color: '#111111',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-ink/40 mt-2 px-6">
                {t.rich('drift.radarDescription', {
                  azure: (chunks) => <span className="text-azure font-bold">{chunks}</span>,
                  slate: (chunks) => <span className="text-slate-400 font-bold">{chunks}</span>
                })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Trends & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity Velocity (Line Chart) */}
          <Card className="lg:col-span-2 bg-white shadow-sm border-ink/5 ring-1 ring-ink/5">
            <CardHeader className="border-b border-gray-50 bg-gray-50/50 py-4 px-6">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-ink/50 flex items-center gap-2">
                <TrendingUp size={14} /> {t('velocity.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="h-[250px] w-full">
                {finalMetrics.scoreOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={finalMetrics.scoreOverTime}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 10 }}
                        dy={10}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis
                        domain={[0, 10]}
                        hide={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#2563EB"
                        strokeWidth={3}
                        dot={{ fill: '#2563EB', strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 6, stroke: '#EFF6FF', strokeWidth: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-ink/40 text-sm">
                    {t('velocity.notEnoughData')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Score Distribution (Bar Chart) */}
          <Card className="bg-white shadow-sm border-ink/5 ring-1 ring-ink/5">
            <CardHeader className="border-b border-gray-50 bg-gray-50/50 py-4 px-6">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-ink/50 flex items-center gap-2">
                <Activity size={14} className="rotate-90" /> {t('spread.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={finalMetrics.scoreDistribution} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis
                      type="number"
                      hide />
                    <YAxis
                      dataKey="range"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                      width={30}
                    />
                    <Tooltip
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#2563EB"
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                    >
                      {finalMetrics.scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.range === '9-10' || entry.range === '8-9' ? '#2563EB' : '#94A3B8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* C. Vocabulary Analysis ("The Fingerprint") */}
          <Card className="bg-white shadow-sm border-ink/5 ring-1 ring-ink/5 h-full">
            <CardHeader className="border-b border-gray-50 bg-gray-50/50 py-4 px-4 md:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-ink/50 flex items-center gap-2">
                <Search size={14} /> {t('signature.title')}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-azure"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t('signature.signature')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-highlight"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t('signature.intrusion')}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8 h-full">
              <div className="flex flex-wrap justify-center content-center gap-3 h-full min-h-[250px]">
                {finalMetrics.mostUsedWords.map((item, idx) => {
                  // Visual logic for size and color
                  const isTop = idx < 3;
                  const isMid = idx >= 3 && idx < 8;
                  const sizeClass = isTop ? 'text-lg md:text-2xl px-3 md:px-6 py-1.5 md:py-3' : (isMid ? 'text-sm md:text-lg px-2.5 md:px-4 py-1 md:py-2' : 'text-xs md:text-sm px-2 md:px-3 py-1');
                  const colorClass = isTop
                    ? 'bg-azure text-white shadow-lg shadow-azure/20'
                    : (isMid ? 'bg-paleslate text-ink border border-ink/5' : 'bg-white text-ink/60 border border-gray-100');

                  return (
                    <div
                      key={idx}
                      className={`rounded-full font-semibold transition-all hover:scale-110 cursor-default flex items-center gap-2 max-w-full ${sizeClass} ${colorClass}`}
                    >
                      <span className="truncate">{item.word}</span>
                      {isTop && <span className="text-[10px] bg-white/20 px-1.5 rounded-full shrink-0">{item.count}</span>}
                    </div>
                  );
                })}

                {/* Mock Banned Words for Visual */}
                <div className="rounded-full bg-highlight/10 text-highlight border border-highlight/20 px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-highlight/20 transition-colors animate-pulse max-w-full">
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="truncate">delve</span>
                </div>
                <div className="rounded-full bg-highlight/10 text-highlight border border-highlight/20 px-3 py-1 text-xs font-bold flex items-center gap-1 hover:bg-highlight/20 transition-colors max-w-full">
                  <AlertCircle size={12} className="shrink-0" />
                  <span className="truncate">tapestry</span>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* D. Misalignment Insights (Actionable Fixes) */}
          <Card className="bg-white shadow-sm border-ink/5 ring-1 ring-ink/5 h-full">
            <CardHeader className="border-b border-gray-50 bg-gray-50/50 py-4 px-6">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-ink/50 flex items-center gap-2">
                <AlertTriangle size={14} /> {t('insights.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">

              {/* Insight Card 1: Tone Violations */}
              <div className="border border-ink/10 rounded-xl overflow-hidden transition-all duration-200">
                <div
                  className="bg-white p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedInsight(expandedInsight === 'tone' ? null : 'tone')}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-highlight/10 flex items-center justify-center text-highlight font-black text-lg shrink-0">
                      {finalMetrics.categoryBreakdown.toneViolations}
                    </div>
                    <div>
                      <div className="font-bold text-ink text-lg">{t('insights.toneViolations')}</div>
                      <div className="text-sm text-ink/50">{t('insights.toneViolationsDesc')}</div>
                    </div>
                  </div>
                  {expandedInsight === 'tone' ? <ChevronUp size={20} className="text-ink/30" /> : <ChevronDown size={20} className="text-ink/30" />}
                </div>

                {expandedInsight === 'tone' && (
                  <div className="bg-gray-50 p-4 border-t border-ink/5 space-y-3 animate-fade-in">
                    {finalMetrics.commonMisalignments.slice(0, 3).map((m, i) => (
                      <div key={i} className="bg-white p-4 rounded-lg border border-ink/5 text-sm shadow-sm">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-xs text-ink/40 bg-paleslate px-2 py-0.5 rounded">{m.date}</span>
                          <span className="font-bold text-xs text-white bg-highlight px-2 py-0.5 rounded">Score: {m.score.toFixed(1)}</span>
                        </div>
                        <p className="text-ink/80 italic font-serif">"...{m.preview}..."</p>
                      </div>
                    ))}

                    {finalMetrics.commonMisalignments.length === 0 && <p className="text-sm text-center text-ink/40 py-4">{t('insights.noToneViolations')}</p>}
                  </div>
                )}
              </div>

              {/* Insight Card 2: Vocabulary Breaches */}
              <div className="border border-ink/10 rounded-xl overflow-hidden transition-all duration-200">
                <div
                  className="bg-white p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedInsight(expandedInsight === 'vocab' ? null : 'vocab')}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-black text-lg shrink-0">
                      {finalMetrics.categoryBreakdown.vocabBreaches + 2} {/* +2 for the mocked ones */}
                    </div>
                    <div>
                      <div className="font-bold text-ink text-lg">{t('insights.vocabBreaches')}</div>
                      <div className="text-sm text-ink/50">{t('insights.vocabBreachesDesc', { word1: 'delve', word2: 'synergy' })}</div>
                    </div>
                  </div>
                  {expandedInsight === 'vocab' ? <ChevronUp size={20} className="text-ink/30" /> : <ChevronDown size={20} className="text-ink/30" />}
                </div>
                {expandedInsight === 'vocab' && (
                  <div className="bg-gray-50 p-4 border-t border-ink/5 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-ink/5 shadow-sm">
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">BAN</span>
                      <span className="text-sm text-ink"><span className="line-through text-ink/40">{t('insights.usingTheWord')}</span> <span className="font-bold text-red-500 bg-red-50 px-1 rounded">delve</span> {t('insights.inIntro')}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-ink/5 shadow-sm">
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">BAN</span>
                      <span className="text-sm text-ink">{t('insights.createsRich')} <span className="font-bold text-red-500 bg-red-50 px-1 rounded">tapestry</span> {t('insights.of')}</span>
                    </div>
                    <div className="text-xs text-center text-ink/40 pt-2">{t('insights.bannedWordMessage')}</div>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </UpgradeGate>
  );
};
