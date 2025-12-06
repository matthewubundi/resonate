"use client";

import React, { useState, useEffect } from 'react';
import { Button, Input, TextArea } from '../components/Components';
import { Plus, Edit, X, UserCircle, AlertCircle } from 'lucide-react';
import { PageView } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Persona {
  id: string;
  name: string;
  formality: 'High Formality' | 'Low Formality' | 'Medium Formality';
  description: string;
  isActive: boolean;
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
}

export const Personas: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personaName, setPersonaName] = useState('');
  const [baseConfig, setBaseConfig] = useState<'scratch' | 'clone'>('scratch');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isActivating, setIsActivating] = useState<string | null>(null);

  // Fetch personas on mount
  useEffect(() => {
    if (user) {
      fetchPersonas();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPersonas = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to view personas.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/personas/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch personas');
      }

      // Transform API data to Persona interface
      const transformedPersonas: Persona[] = (data.personas || []).map((p: ApiPersona) => {
        // Map formality from API format to UI format
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
    // Reset form
    setPersonaName('');
    setBaseConfig('scratch');
    setDescription('');
  };

  const handleCreatePersona = async () => {
    if (!personaName.trim()) return;

    setIsCreating(true);
    setError(null);
    try {
      // Get the session token for authentication
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

      // Refresh the personas list
      await fetchPersonas();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error creating persona:', err);
      setError(err.message || 'Failed to create persona. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleActivate = async (id: string) => {
    setIsActivating(id);
    setError(null);
    try {
      // Get the session token for authentication
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

      // Refresh the personas list
      await fetchPersonas();
    } catch (err: any) {
      console.error('Error activating persona:', err);
      setError(err.message || 'Failed to activate persona. Please try again.');
    } finally {
      setIsActivating(null);
    }
  };

  const handleEdit = (id: string) => {
    // Placeholder for future implementation
    console.log('Edit persona:', id);
  };

  const handleEditConfiguration = (id: string) => {
    // Placeholder for future implementation
    console.log('Edit configuration:', id);
  };

  return (
    <>
      <div className="space-y-8">
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
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-slate-900">Persona Management</h1>
            <p className="text-slate-600 font-medium">
              Manage multiple identity profiles for different contexts. Only one persona can be active at a time.
            </p>
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleCreateNew}
            className="whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Persona
          </Button>
        </div>

      {/* Personas Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-600">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      ) : personas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
          <div
            key={persona.id}
              className={`
              rounded-xl border transition-all duration-200 flex flex-col
              ${persona.isActive
                ? 'bg-white border-azure border-2 shadow-lg shadow-azure/20'
                : 'bg-slate-50 border-slate-200'
              }
            `}
          >
            {/* Card Header */}
            <div className="relative p-6 pb-4">
              {persona.isActive && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-azure-light text-azure border border-blue-200">
                    ACTIVE
                  </span>
                </div>
              )}
              <div className="pr-20">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{persona.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{persona.formality}</p>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 pb-4 flex-1">
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                {persona.description}
              </p>
            </div>

            {/* Card Footer */}
            <div className="px-6 pb-6 pt-4 border-t border-slate-200">
              {persona.isActive ? (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => handleEditConfiguration(persona.id)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Configuration
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    onClick={() => handleActivate(persona.id)}
                    isLoading={isActivating === persona.id}
                    disabled={isActivating === persona.id}
                  >
                    Activate
                  </Button>
                  <button
                    onClick={() => handleEdit(persona.id)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-600">
          <UserCircle size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="font-medium text-slate-900 mb-1">No personas yet</p>
          <p className="text-sm mb-6">Create your first persona to get started</p>
          <Button
            variant="primary"
            size="md"
            onClick={handleCreateNew}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Persona
          </Button>
        </div>
      )}
      </div>

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
                  placeholder="e.g., LinkedIn Professional, Twitter Casual, Internal Team"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  required
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  This is the primary identifier used in the list view and API.
                </p>
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
                      <div className="text-xs text-slate-500 mt-0.5">Copy your main identity</div>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Clone existing allows you to copy your main identity so you don't have to re-enter all your banned words for every single persona.
                </p>
              </div>

              {/* Short Description */}
              <div>
                <TextArea
                  label="Short Description"
                  placeholder="e.g., Strictly for technical documentation, no humor allowed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Helps you distinguish between similar personas later.
                </p>
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
    </>
  );
};

