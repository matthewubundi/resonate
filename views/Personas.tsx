"use client";

import React, { useState, useEffect } from 'react';
import { Button, Input, TextArea } from '../components/Components';
import { Plus, Edit, X, AlertCircle, MoreHorizontal, Copy, Trash2, Check, Settings } from 'lucide-react';
import { PageView } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Persona {
  id: string;
  name: string;
  formality: 'High Formality' | 'Low Formality' | 'Medium Formality';
  description: string;
  isActive: boolean;
  lastUsed?: string; // e.g. "2 hours ago"
}

interface ApiPersona {
  id: string;
  name: string | null;
  identity_json: {
    name?: string;
    formality?: string;
    description?: string;
  };
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

// Helper to generate consistent attribute values based on string seed
const getAttributes = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const normalize = (val: number) => Math.abs(val % 100);

  return {
    tone: normalize(hash) > 20 ? normalize(hash) : 20 + normalize(hash),
    directness: normalize(hash >> 1) > 20 ? normalize(hash >> 1) : 20 + normalize(hash >> 1),
    humor: normalize(hash >> 2) > 20 ? normalize(hash >> 2) : 20 + normalize(hash >> 2)
  };
};

// Helper function to format relative time
function timeAgo(dateString?: string) {
  if (!dateString) return "Never used";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + "y ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + "mo ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + "d ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + "h ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + "m ago";
  return "Just now";
}

const AttributeBar: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color = "bg-slate-400" }) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="flex justify-between items-end">
      <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
      {/* <span className="text-[10px] font-mono text-slate-400">{value}%</span> */}
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// Helper to get initials and color
const getAvatarConfig = (name: string) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-orange-100 text-orange-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600'
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colorIndex = Math.abs(hash % colors.length);

  return { initials, colorClass: colors[colorIndex] };
};

export const Personas: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personaName, setPersonaName] = useState('');
  const [baseConfig, setBaseConfig] = useState<'scratch' | 'clone'>('scratch');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch personas on mount
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchPersonas();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchPersonas = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use client-side supabase directly so it handles auth session automatically
      const { data, error } = await supabase
        .from('identities')
        .select('id, identity_json, is_active, created_at, name, last_used_at')
        .eq('user_id', user!.id)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const transformedPersonas: Persona[] = (data || []).map((p: any) => {
        const formalityMap: Record<string, 'High Formality' | 'Low Formality' | 'Medium Formality'> = {
          'High': 'High Formality',
          'Low': 'Low Formality',
          'Medium': 'Medium Formality',
          'High Formality': 'High Formality',
          'Low Formality': 'Low Formality',
          'Medium Formality': 'Medium Formality',
        };
        const apiFormality = p.identity_json?.formality || 'Medium';
        const formality = formalityMap[apiFormality] || 'Medium Formality';

        return {
          id: p.id,
          name: p.name || p.identity_json?.name || 'Unnamed Persona',
          formality,
          description: p.identity_json?.description || '',
          isActive: p.is_active,
          lastUsed: timeAgo(p.last_used_at)
        };
      });

      setPersonas(transformedPersonas);
    } catch (err: any) {
      console.error('Error fetching personas:', err);
      setError(err.message || 'Failed to load personas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPersonaName('');
    setBaseConfig('scratch');
    setDescription('');
  };

  const handleCreatePersona = async () => {
    if (!personaName.trim()) return;

    setIsCreating(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to create personas.');
        setIsCreating(false);
        return;
      }

      const response = await fetch('/api/personas/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: personaName.trim(),
          baseConfig,
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create persona');
      }

      await fetchPersonas();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error creating persona:', err);
      setError(err.message || 'Failed to create persona. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleActivate = async (id: string, onSuccess?: () => void) => {
    setIsActivating(id);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to activate personas.');
        setIsActivating(null);
        return;
      }

      const response = await fetch('/api/personas/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate persona');
      }

      await fetchPersonas();
      onSuccess?.();
    } catch (err: any) {
      console.error('Error activating persona:', err);
      setError(err.message || 'Failed to activate persona. Please try again.');
    } finally {
      setIsActivating(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to duplicate personas.');
        setIsDuplicating(null);
        return;
      }

      const response = await fetch('/api/personas/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to duplicate persona');
      }

      await fetchPersonas();
      setActiveMenu(null); // Close the menu
    } catch (err: any) {
      console.error('Error duplicating persona:', err);
      setError(err.message || 'Failed to duplicate persona. Please try again.');
    } finally {
      setIsDuplicating(null);
    }
  };

  const confirmDelete = (e: React.MouseEvent, persona: Persona) => {
    e.stopPropagation();
    setPersonaToDelete({ id: persona.id, name: persona.name });
    setIsDeleteModalOpen(true);
    setActiveMenu(null); // Close menu
  };

  const handleDeletePersona = async () => {
    if (!personaToDelete) return;

    setIsDeleting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to delete personas.');
        setIsDeleting(false);
        return;
      }

      const response = await fetch('/api/personas/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: personaToDelete.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete persona');
      }

      await fetchPersonas();
      setIsDeleteModalOpen(false);
      setPersonaToDelete(null);
    } catch (err: any) {
      console.error('Error deleting persona:', err);
      setError(err.message || 'Failed to delete persona. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (persona: Persona) => {
    // If active, go to editor. If not, just select/preview (but request says open drawer)
    // For now we'll route to editor as "Quick View"
    if (persona.isActive) {
      onNavigate('editor');
    }
  };

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const activePersona = personas.find(p => p.isActive);

  return (
    <>
      <div className="space-y-8 pb-24">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-slate-900">Identity Selection</h1>
            <p className="text-slate-600 font-medium">
              Choose your character. Each persona carries its own unique voice and context.
            </p>
          </div>
        </div>

        {/* Personas Grid */}
        {(loading || authLoading) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-full min-h-[340px] bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-200"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-4 my-6">
                  <div className="space-y-1">
                    <div className="h-2 bg-slate-200 rounded w-1/4 mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded-full w-full"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-slate-200 rounded w-1/4 mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded-full w-full"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-slate-200 rounded w-1/4 mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded-full w-full"></div>
                  </div>
                </div>
                <div className="h-10 bg-slate-200 rounded-lg w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {personas.map((persona) => {
              const attributes = getAttributes(persona.id);
              const avatar = getAvatarConfig(persona.name);

              return (
                <div
                  key={persona.id}
                  onClick={() => handleCardClick(persona)}
                  className={`
                  relative rounded-xl border transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer
                  ${persona.isActive
                      ? 'bg-white border-azure/80 border-[3px] shadow-xl shadow-azure/15 scale-[1.02] z-10'
                      : 'bg-white/80 border-slate-200 hover:border-azure/40 hover:shadow-lg'
                    }
                `}
                >
                  {/* Active Indicator & Context Menu */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <button
                      onClick={(e) => handleMenuClick(e, persona.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenu === persona.id && (
                      <div className="absolute top-8 right-0 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-30 animate-in fade-in zoom-in duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (persona.isActive) {
                              onNavigate('editor');
                            } else {
                              handleActivate(persona.id, () => onNavigate('editor'));
                            }
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Settings size={14} /> Edit Configuration
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(persona.id);
                          }}
                          disabled={isDuplicating === persona.id}
                          className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 ${isDuplicating === persona.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Copy size={14} /> {isDuplicating === persona.id ? 'Duplicating...' : 'Duplicate'}
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button
                          onClick={(e) => confirmDelete(e, persona)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Header: Avatar & Title */}
                  <div className="p-6 pb-2 flex items-start gap-4">
                    <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold shadow-inner
                    ${avatar.colorClass}
                  `}>
                      {avatar.initials}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">{persona.name}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Last used {persona.lastUsed}</p>
                    </div>
                  </div>

                  {/* DNA Preview / Attributes */}
                  <div className="px-6 py-4 space-y-3">
                    <AttributeBar
                      label="Tone"
                      value={attributes.tone}
                      color={persona.isActive ? "bg-azure" : "bg-slate-500"}
                    />
                    <AttributeBar
                      label="Directness"
                      value={attributes.directness}
                      color={persona.isActive ? "bg-azure" : "bg-slate-500"}
                    />
                    <AttributeBar
                      label="Humor"
                      value={attributes.humor}
                      color={persona.isActive ? "bg-azure" : "bg-slate-500"}
                    />
                  </div>

                  {/* Footer / Action Button */}
                  <div className="mt-auto p-6 pt-2">
                    {persona.isActive ? (
                      <Button
                        variant="ghost"
                        className="w-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-semibold cursor-default"
                        size="md"
                        onClick={(e) => e.stopPropagation()}
                        disabled
                      >
                        <Check size={16} className="mr-2" /> Current Context
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-azure/30 text-azure hover:bg-azure hover:text-white transition-all group-hover:border-azure group-hover:bg-azure group-hover:text-white"
                        size="md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivate(persona.id);
                        }}
                        isLoading={isActivating === persona.id}
                        disabled={isActivating === persona.id}
                      >
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Create New Card */}
            <button
              onClick={handleCreateNew}
              className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-azure hover:bg-azure/5 transition-all duration-300 group min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 group-hover:bg-azure/10 group-hover:text-azure flex items-center justify-center mb-4 transition-colors">
                <Plus size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-500 group-hover:text-azure transition-colors">Create New Persona</h3>
              <p className="text-sm text-slate-400 mt-2">Design a new identity from scratch</p>
            </button>
          </div>
        )}
      </div>

      {/* Global Context Bar */}
      {activePersona && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 z-40 bg-slate-900 text-white py-3 px-6 shadow-2xl transform transition-transform border-t border-slate-700">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <p className="text-sm font-medium">
              You are currently resonating as <span className="text-white font-bold underline decoration-azure decoration-2 underline-offset-4">{activePersona.name}</span> across all sessions.
            </p>
          </div>
        </div>
      )}

      {/* Create Persona Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Create New Persona</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Identity Name */}
              <div>
                <Input
                  label="Identity Name"
                  placeholder="e.g., LinkedIn Professional"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Base Configuration */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Base Configuration
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="baseConfig"
                      value="scratch"
                      checked={baseConfig === 'scratch'}
                      onChange={(e) => setBaseConfig(e.target.value as 'scratch' | 'clone')}
                      className="mr-3 h-4 w-4 text-azure focus:ring-azure border-slate-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Start from Scratch</div>
                      <div className="text-xs text-slate-500 mt-0.5">Default option</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="baseConfig"
                      value="clone"
                      checked={baseConfig === 'clone'}
                      onChange={(e) => setBaseConfig(e.target.value as 'scratch' | 'clone')}
                      className="mr-3 h-4 w-4 text-azure focus:ring-azure border-slate-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Clone Existing</div>
                      <div className="text-xs text-slate-500 mt-0.5">Copy active identity</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <TextArea
                  label="Short Description"
                  placeholder="e.g., Strictly for technical documentation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <Button
                variant="secondary"
                size="md"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCreatePersona}
                disabled={!personaName.trim() || isCreating}
                isLoading={isCreating}
              >
                Create Persona
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && personaToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Persona?</h3>
                <p className="text-slate-600 mt-1">
                  Are you sure you want to delete <span className="font-bold text-slate-900">{personaToDelete.name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
                size="md"
                onClick={handleDeletePersona}
                isLoading={isDeleting}
              >
                Delete Persona
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
