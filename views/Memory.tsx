import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, TextArea } from '../components/Components';
import { Trash2, Info, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MemoryItem {
  id: string;
  content: string;
  created_at: string;
}

export const Memory: React.FC = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newMemory, setNewMemory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to view memories.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/memory', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch memories');
      }

      const data = await res.json();
      setMemories(data.data || []);
    } catch (err: any) {
      console.error('Error fetching memories:', err);
      setError(err.message || 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch memories on mount
  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user, fetchMemories]);

  const handleSave = async () => {
    if (!newMemory.trim() || !user) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to save memories.');
        setSaving(false);
        return;
      }

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
        throw new Error(errorData.error || 'Failed to save memory');
      }

      const data = await res.json();
      // Add the new memory to the list
      if (data.data) {
        setMemories([data.data, ...memories]);
      }
      setNewMemory('');
    } catch (err: any) {
      console.error('Error saving memory:', err);
      setError(err.message || 'Failed to save memory');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to delete memories.');
        return;
      }

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
        throw new Error(errorData.error || 'Failed to delete memory');
      }

      // Remove the memory from the list
      setMemories(memories.filter((m) => m.id !== id));
    } catch (err: any) {
      console.error('Error deleting memory:', err);
      setError(err.message || 'Failed to delete memory');
    }
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-ink">Memory & Context</h1>
        <p className="text-ink/60 font-medium">Teach the AI specific facts about your work, life, or preferences.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-highlight/10 border border-highlight/20 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="text-highlight flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-highlight mb-1">Error</p>
              <p className="text-sm text-ink/80">{error}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            <AlertCircle size={16} />
          </Button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column - Input Zone (1/3) */}
        <div className="lg:col-span-1 space-y-4 flex flex-col">
          {/* Teach New Context Card */}
          <Card className="bg-white border-none shadow-md">
            <CardHeader>
              <CardTitle>Teach New Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextArea
                placeholder="Enter a fact or preference..."
                rows={6}
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                className="w-full bg-white border border-ink/10 rounded-lg px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure resize-none"
              />
              <Button
                onClick={handleSave}
                disabled={!newMemory.trim() || saving}
                isLoading={saving}
                className="w-full shadow-lg shadow-azure/10"
              >
                Save to Memory
              </Button>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <div className="bg-azure/10 border border-azure/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="text-azure flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-azure mb-2">Tips</p>
                <ul className="text-sm text-ink/80 space-y-1.5">
                  <li>• Add project names</li>
                  <li>• Add team member roles</li>
                  <li>• Include work preferences</li>
                  <li>• Note important dates or deadlines</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Knowledge Base (2/3) */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <Card className="bg-white border-none shadow-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <CardTitle>Active Knowledge</CardTitle>
                <span className="inline-flex items-center justify-center h-6 px-3 rounded-full bg-azure/10 border border-azure/20 text-xs font-bold text-azure">
                  {memories.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col p-0 min-h-0">
              {/* Scrollable List Area */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 text-ink/60">
                    <p className="font-medium mb-2">Loading memories...</p>
                  </div>
                ) : memories.length > 0 ? (
                  <div className="space-y-3">
                    {memories.map((memory) => (
                      <div
                        key={memory.id}
                        className="flex items-start gap-4 p-4 bg-paleslate border border-ink/5 rounded-lg hover:bg-white hover:shadow-sm transition-all group"
                      >
                        <p className="flex-1 text-sm font-medium text-ink leading-relaxed">{memory.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(memory.id)}
                          className="flex-shrink-0 text-ink/40 hover:text-highlight"
                          title="Delete memory"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 text-ink/60">
                    <p className="font-medium mb-2">No memories yet</p>
                    <p className="text-sm">Add your first memory using the form on the left</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

