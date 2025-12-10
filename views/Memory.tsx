import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Card, CardHeader, CardTitle, CardContent, Button, TextArea } from '../components/Components';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradeGate } from '../components/UpgradeGate';
import {
  Trash2, AlertCircle, Users, Briefcase,
  Settings, Brain, Zap, CheckCircle2, RotateCcw,
  Sparkles, Target, UserCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from 'next-intl';

interface MemoryItem {
  id: string;
  content: string;
  created_at: string;
  isActive: boolean;
}

const fetcher = async (url: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch');
  }

  return res.json();
};

export const Memory: React.FC = () => {
  const t = useTranslations('Memory');
  const { user, loading: authLoading } = useAuth();
  const [newMemory, setNewMemory] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = (user && !authLoading) ? '/api/memory' : null;
  const { data: apiData, isLoading: swrLoading, mutate } = useSWR(key, fetcher);
  const { tier, loading: tierLoading } = useSubscription();

  // Context Templates
  const TEMPLATES = useMemo(() => [
    {
      id: 'role',
      label: t('templates.role.label'),
      icon: UserCircle,
      template: t('templates.role.content'),
      color: 'text-azure'
    },
    {
      id: 'project',
      label: t('templates.project.label'),
      icon: Briefcase,
      template: t('templates.project.content'),
      color: 'text-purple-600'
    },
    {
      id: 'team',
      label: t('templates.team.label'),
      icon: Users,
      template: t('templates.team.content'),
      color: 'text-indigo-600'
    },
    {
      id: 'prefs',
      label: t('templates.prefs.label'),
      icon: Settings,
      template: t('templates.prefs.content'),
      color: 'text-emerald-600'
    }
  ], [t]);

  const memories: MemoryItem[] = useMemo(() => {
    return (apiData?.data || []).map((m: any) => ({
      ...m,
      isActive: m.is_active !== false
    }));
  }, [apiData]);



  // Derive "Brain Health" score
  const brainHealth = Math.min(100, memories.filter(m => m.isActive).length * 10); // Only counts active memories
  const activeContextPoints = memories.filter(m => m.isActive).length * 5;

  const handleSave = async () => {
    if (!newMemory.trim() || !user) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError(t('errors.loginRequiredSave'));
        setSaving(false);
        return;
      }

      // Optimistic updatish - just standard mutate after post for now is fast enough usually
      const res = await fetch('/api/memory/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: newMemory.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t('errors.saveFailed'));
      }

      const data = await res.json();
      if (data.data) {
        mutate(); // Revalidate data
      }
      setNewMemory('');
      setActiveTemplate(null);
    } catch (err: any) {
      console.error('Error saving memory:', err);
      setError(err.message || t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError(t('errors.loginRequiredDelete'));
        return;
      }

      // Optimistic update
      mutate(
        (data: any) => ({
          ...data,
          data: (data?.data || []).filter((m: any) => m.id !== id)
        }),
        false
      );

      const res = await fetch('/api/memory/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t('errors.deleteFailed'));
      }

      mutate(); // Revalidate to be sure
    } catch (err: any) {
      console.error('Error deleting memory:', err);
      setError(err.message || t('errors.deleteFailed'));
      mutate(); // Revert on error by revalidating
    }
  };

  const toggleMemoryActive = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Optimistic update
    mutate(
      (data: any) => ({
        ...data,
        data: (data?.data || []).map((m: any) =>
          m.id === id ? { ...m, is_active: newStatus } : m
        )
      }),
      false
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/memory/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, is_active: newStatus }),
      });

      if (!res.ok) {
        throw new Error(t('errors.updateFailed'));
      }
      // No need to mutate() again immediately if we trust the optimistic update,
      // but strictly speaking we should eventually revalidate. SWR does this on focus by default.
    } catch (err) {
      console.error("Failed to toggle", err);
      mutate(); // Revert on error
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setNewMemory(template.template);
      setActiveTemplate(templateId);
    }
  };

  // Helper to categorize memory
  const getMemoryCategory = (content: string) => {
    const lower = content.toLowerCase();
    // Added multilingual checks
    if (lower.includes('role') || lower.includes('i am') || lower.includes('senior') || lower.includes('rolle') || lower.includes('rôle')) return 'Identity';
    if (lower.includes('preference') || lower.includes('no ') || lower.includes('don\'t') || lower.includes('präferenz') || lower.includes('préférence')) return 'Constraints';
    if (lower.includes('project') || lower.includes('deadline') || lower.includes('meeting') || lower.includes('projekt') || lower.includes('projet')) return 'Projects';
    return 'General';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Identity': return UserCircle;
      case 'Constraints': return Target;
      case 'Projects': return Briefcase;
      default: return Brain;
    }
  };

  // Group memories
  const groupedMemories = useMemo(() => {
    const groups: Record<string, MemoryItem[]> = {
      'Identity': [],
      'Constraints': [],
      'Projects': [],
      'General': []
    };

    memories.forEach(m => {
      const cat = getMemoryCategory(m.content);
      if (groups[cat]) groups[cat].push(m);
      else groups['General'].push(m);
    });

    return groups;
  }, [memories]);

  // Render Section
  const renderSection = (titleKey: string, items: MemoryItem[], colorClass: string) => {
    if (items.length === 0) return null;
    // Map the internal category key to the display title using translation
    // titleKey is 'Identity', 'Constraints', etc.
    const displayTitle = t(`categories.${titleKey}`);

    return (
      <div className="mb-8 last:mb-0">
        <h3 className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-3 px-1">{displayTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {items.map(item => {
            const Icon = getCategoryIcon(titleKey);
            return (
              <div
                key={item.id}
                className={`
                  relative group border rounded-xl p-4 transition-all duration-200
                  ${item.isActive
                    ? 'bg-white border-ink/5 shadow-sm hover:shadow-md hover:border-azure/20'
                    : 'bg-paleslate border-transparent opacity-60 grayscale'}
                `}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
                    <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => toggleMemoryActive(item.id, item.isActive)}
                      className={`
                        relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2
                        ${item.isActive ? 'bg-azure' : 'bg-ink/20'}
                      `}
                      title={item.isActive ? t('actions.deactivate') : t('actions.activate')}
                    >
                      <span
                        className={`
                          inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
                          ${item.isActive ? 'translate-x-4.5' : 'translate-x-1'}
                        `}
                      />
                    </button>
                    {/* Delete Action */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-ink/20 hover:text-highlight hover:bg-highlight/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className={`text-sm leading-relaxed ${item.isActive ? 'text-ink' : 'text-ink/40 line-through'}`}>
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Logic
  if (tierLoading || authLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-paleslate">
        <div className="w-10 h-10 border-4 border-azure/20 border-t-azure rounded-full animate-spin" />
      </div>
    );
  }

  // Determine lock state
  const isLocked = (!tier || tier === 'free') && !tierLoading;

  return (
    <UpgradeGate requiredTier="pro" isLocked={isLocked}>
      <div className="h-full flex flex-col bg-paleslate overflow-hidden">
        {/* Page Header */}
        <div className="flex-shrink-0 px-8 py-6 bg-paleslate border-b border-ink/5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
              <Zap className="text-azure fill-current" size={24} />
              {t('title')}
            </h1>
            <p className="text-ink/60 text-sm mt-1">{t('subtitle')}</p>
          </div>

          {/* Brain Health / Context Points */}
          <div className="hidden lg:flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-ink/5 shadow-sm">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">{t('brainStrength')}</span>
              <span className="text-sm font-medium text-azure">{activeContextPoints} {t('points')}</span>
            </div>
            <div className="w-24 h-2 bg-paleslate rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-azure to-luminousmint transition-all duration-500"
                style={{ width: `${brainHealth}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

          {/* LEFT COLUMN: THE TEACHER (Input) */}
          <div className="flex-shrink-0 lg:w-[400px] border-r border-ink/5 flex flex-col bg-paleslate/50 overflow-y-auto p-6 scrollbar-hide">
            <div className="space-y-6">

              {/* Context Templates */}
              <div>
                <h2 className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-3">{t('templates.title')}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(tmpl => (
                    <button
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl.id)}
                      className={`
                      flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                      ${activeTemplate === tmpl.id
                          ? 'bg-azure text-white border-azure shadow-md shadow-azure/20'
                          : 'bg-white border-ink/5 text-ink/60 hover:border-azure/30 hover:text-azure hover:shadow-sm'}
                    `}
                    >
                      <tmpl.icon size={20} className="mb-2" />
                      <span className="text-xs font-medium">{tmpl.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Card */}
              <Card className="bg-white border-none shadow-lg shadow-azure/5 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-white to-paleslate border-b border-ink/5 pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles size={16} className="text-azure" />
                    {t('input.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <TextArea
                      placeholder={t('input.placeholder')}
                      rows={8}
                      value={newMemory}
                      onChange={(e) => setNewMemory(e.target.value)}
                      className="w-full bg-paleslate/30 border-ink/10 focus:bg-white text-sm font-medium leading-relaxed resize-none p-4"
                    />
                    {activeTemplate && (
                      <button
                        onClick={() => { setActiveTemplate(null); setNewMemory(''); }}
                        className="absolute top-2 right-2 p-1 text-ink/30 hover:text-ink/60 bg-white/50 rounded-full backdrop-blur-sm"
                        title={t('input.clearTemplate')}
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={!newMemory.trim() || saving}
                    isLoading={saving}
                    className="w-full bg-azure hover:bg-azure-hover text-white shadow-lg shadow-azure/20 h-11 text-sm font-semibold"
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    {t('input.submit')}
                  </Button>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="text-highlight flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-ink/70 leading-relaxed font-medium">{error}</p>
                </div>
              )}

              {/* Tips */}
              <div className="bg-white/50 border border-ink/5 rounded-lg p-4">
                <h4 className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-2">{t('input.proTip.title')}</h4>
                <p className="text-xs text-ink/60 leading-relaxed">
                  {t('input.proTip.content')}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: THE BRAIN (Active Knowledge) */}
          <div className="flex-1 bg-white flex flex-col min-h-0 overflow-hidden relative">
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-azure/5 to-transparent opacity-50 pointer-events-none" />

            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
              {swrLoading && !apiData && !isLocked ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-ink/40">
                  <div className="w-12 h-12 rounded-full border-2 border-azure/20 border-t-azure animate-spin mb-4" />
                  <p className="font-medium animate-pulse">{t('scanning')}</p>
                </div>
              ) : (memories.length > 0 || isLocked) ? (
                <div className="max-w-4xl mx-auto space-y-2">
                  {isLocked && memories.length === 0 ? (
                    // DUMMY CONTENT FOR LOCKED STATE
                    <>
                      {renderSection('Identity', [{ id: '1', content: t('lockedData.role'), created_at: '', isActive: true }, { id: '2', content: t('lockedData.tone'), created_at: '', isActive: true }], 'bg-azure text-azure')}
                      {renderSection('Constraints', [{ id: '3', content: t('lockedData.constraint'), created_at: '', isActive: true }], 'bg-luminousmint text-emerald-700')}
                    </>
                  ) : (
                    <>
                      {renderSection('Identity', groupedMemories['Identity'], 'bg-azure text-azure')}
                      {renderSection('Constraints', groupedMemories['Constraints'], 'bg-luminousmint text-emerald-700')}
                      {renderSection('Projects', groupedMemories['Projects'], 'bg-purple-500 text-purple-700')}
                      {renderSection('General', groupedMemories['General'], 'bg-slate-500 text-slate-700')}
                    </>
                  )}

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-paleslate rounded-full flex items-center justify-center mb-6">
                    <Brain className="text-ink/20" size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-2">{t('emptyState.title')}</h3>
                  <p className="text-ink/50 leading-relaxed max-w-[80%] mx-auto whitespace-pre-line">
                    {t('emptyState.description')}
                  </p>
                </div>
              )}

              {/* Bottom spacer */}
              <div className="h-10" />
            </div>
          </div>
        </div>
      </div>
    </UpgradeGate>
  );
};
