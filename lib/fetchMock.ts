import { getLocalData, setLocalData } from './localStore';
import { simulateDemoTransform } from './demo';

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' 
      ? input 
      : (input instanceof URL ? input.href : (input as Request).url);

    // We only intercept calls containing '/api/' but NOT '/api/docs'
    const isApiRequest = urlStr.includes('/api/');
    const isDocsRequest = urlStr.includes('/api/docs');

    if (isApiRequest && !isDocsRequest) {
      const url = new URL(urlStr, window.location.origin);
      const path = url.pathname;
      const method = init?.method || 'GET';
      let body: any = {};

      if (init?.body) {
        try {
          body = JSON.parse(init.body as string);
        } catch (e) {
          // ignore parsing error for non-json bodies
        }
      }

      const createResponse = (data: any, status = 200) => {
        return new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      // 1. Memory endpoints
      if (path === '/api/memory') {
        if (method === 'GET') {
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const memories = getLocalData('memories');
          return createResponse({ data: memories.slice(0, limit), demo: true });
        }
      }

      if (path === '/api/memory/add') {
        if (method === 'POST') {
          const { content } = body;
          if (!content || !content.trim()) {
            return createResponse({ error: 'Content is required' }, 400);
          }
          const memories = getLocalData('memories');
          const newMemory = {
            id: `mem-demo-${Date.now()}`,
            content: content.trim(),
            is_active: true,
            created_at: new Date().toISOString()
          };
          setLocalData('memories', [newMemory, ...memories]);
          return createResponse({ success: true, data: newMemory, demo: true });
        }
      }

      if (path === '/api/memory/delete') {
        if (method === 'DELETE' || method === 'POST') {
          const { id } = body;
          if (!id) return createResponse({ error: 'ID is required' }, 400);
          const memories = getLocalData('memories');
          const filtered = memories.filter(m => m.id !== id);
          setLocalData('memories', filtered);
          return createResponse({ success: true, demo: true });
        }
      }

      if (path === '/api/memory/toggle') {
        if (method === 'POST') {
          const { id, is_active } = body;
          if (!id) return createResponse({ error: 'ID is required' }, 400);
          const memories = getLocalData('memories');
          let updatedMemory = null;
          const updated = memories.map(m => {
            if (m.id === id) {
              updatedMemory = { ...m, is_active };
              return updatedMemory;
            }
            return m;
          });
          setLocalData('memories', updated);
          return createResponse({ success: true, data: updatedMemory, demo: true });
        }
      }

      // 2. Personas endpoints
      if (path === '/api/personas/list') {
        if (method === 'GET') {
          const personas = getLocalData('identities');
          const sorted = [...personas].sort((a, b) => {
            if (a.is_active && !b.is_active) return -1;
            if (!a.is_active && b.is_active) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          return createResponse({ personas: sorted, demo: true });
        }
      }

      if (path === '/api/personas/create') {
        if (method === 'POST') {
          const { name, baseConfig, description } = body;
          const personas = getLocalData('identities');

          let identityJson: any;
          if (baseConfig === 'clone') {
            const active = personas.find(p => p.is_active) || personas[0];
            identityJson = {
              ...active.identity_json,
              name: name || 'Cloned Persona',
              description: description || active.identity_json?.description || ''
            };
          } else {
            identityJson = {
              name: name || 'New Persona',
              description: description || '',
              tone: 'Friendly, Professional',
              formality: 'Neutral',
              directness: 'Balanced',
              vocabulary: { frequent_words: [], avoid_words: [] },
              rules: { always: [], never: [] },
              formatting_preferences: { default: 'paragraphs' }
            };
          }

          const newPersona = {
            id: `identity-demo-${Date.now()}`,
            name: name || 'New Persona',
            identity_json: identityJson,
            is_active: false,
            created_at: new Date().toISOString()
          };

          setLocalData('identities', [...personas, newPersona]);
          return createResponse({ success: true, persona: newPersona, demo: true });
        }
      }

      if (path === '/api/personas/switch') {
        if (method === 'POST') {
          const { id } = body;
          if (!id) return createResponse({ error: 'ID is required' }, 400);
          const personas = getLocalData('identities');
          let switched: any = null;
          const updated = personas.map(p => {
            const isActive = p.id === id;
            if (isActive) switched = { ...p, is_active: true };
            return { ...p, is_active: isActive };
          });
          setLocalData('identities', updated);
          return createResponse({ success: true, persona: switched, demo: true });
        }
      }

      if (path === '/api/personas/duplicate') {
        if (method === 'POST') {
          const { id } = body;
          if (!id) return createResponse({ error: 'ID is required' }, 400);
          const personas = getLocalData('identities');
          const source = personas.find(p => p.id === id) || personas[0];
          const duplicate = {
            ...source,
            id: `identity-demo-copy-${Date.now()}`,
            name: `Copy of ${source.name}`,
            is_active: false,
            created_at: new Date().toISOString()
          };
          setLocalData('identities', [...personas, duplicate]);
          return createResponse({ success: true, persona: duplicate, demo: true });
        }
      }

      if (path === '/api/personas/delete') {
        if (method === 'POST') {
          const { id } = body;
          if (!id) return createResponse({ error: 'ID is required' }, 400);
          const personas = getLocalData('identities');
          const filtered = personas.filter(p => p.id !== id);
          setLocalData('identities', filtered);
          return createResponse({ success: true, demo: true });
        }
      }

      // 3. Transformations & History endpoints
      if (path === '/api/transform') {
        if (method === 'POST') {
          const { inputText, instructions } = body;
          const result = simulateDemoTransform(inputText || '', instructions || '');

          // Increment usage in profile
          const profiles = getLocalData('profiles');
          if (profiles.length > 0) {
            profiles[0].transformations_usage = (profiles[0].transformations_usage || 0) + 1;
            setLocalData('profiles', profiles);
          }

          // Add to transformations history
          const transformations = getLocalData('transformations');
          const newTransform = {
            id: `tr-demo-${Date.now()}`,
            user_id: 'demo-user-resonate',
            input_text: inputText,
            raw_llm_output: result.output,
            final_output: result.output,
            alignment_score: result.evaluation.score,
            processing_time_ms: 1000,
            model_used: body.model_id || 'gpt-4o-mini',
            created_at: new Date().toISOString()
          };
          setLocalData('transformations', [newTransform, ...transformations]);

          return createResponse(result);
        }
      }

      if (path === '/api/history/list') {
        if (method === 'GET') {
          const versions = getLocalData('identity_versions');
          return createResponse({ versions, demo: true });
        }
      }

      if (path === '/api/history/rollback') {
        if (method === 'POST') {
          const { version_id } = body;
          if (!version_id) return createResponse({ error: 'version_id is required' }, 400);
          const versions = getLocalData('identity_versions');
          const backup = versions.find(v => v.id === version_id);
          if (!backup) return createResponse({ error: 'Version not found' }, 404);

          // Overwrite active persona's identity_json
          const personas = getLocalData('identities');
          const updated = personas.map(p => {
            if (p.is_active) {
              return {
                ...p,
                identity_json: backup.identity_json,
                updated_at: new Date().toISOString()
              };
            }
            return p;
          });
          setLocalData('identities', updated);
          return createResponse({ success: true, demo: true });
        }
      }

      // 4. Settings & Export endpoints
      if (path === '/api/settings/update') {
        if (method === 'POST') {
          const profiles = getLocalData('profiles');
          if (profiles.length > 0) {
            profiles[0] = {
              ...profiles[0],
              full_name: body.display_name || profiles[0].full_name,
              default_landing_page: body.default_landing_page || profiles[0].default_landing_page,
              auto_copy_to_clipboard: body.auto_copy_to_clipboard ?? profiles[0].auto_copy_to_clipboard,
              clear_input_on_success: body.clear_input_on_success ?? profiles[0].clear_input_on_success,
              history_retention_period: body.history_retention_period || profiles[0].history_retention_period,
            };
            setLocalData('profiles', profiles);
          }
          return createResponse({ success: true, demo: true });
        }
      }

      if (path === '/api/onboarding/generate') {
        if (method === 'POST') {
          const { rawInput } = body;
          const personas = getLocalData('identities');

          // Set onboarding completed to true
          const profiles = getLocalData('profiles');
          if (profiles.length > 0) {
            profiles[0].onboarding_completed = true;
            setLocalData('profiles', profiles);
          }

          // Create dynamic active persona based on onboarding input
          const activePersona = {
            id: `identity-demo-${Date.now()}`,
            name: 'Alex Morgan',
            identity_json: {
              tone: 'Calm, direct, strategically warm',
              tone_description: 'Alex writes with operator clarity based on onboarding description: ' + (rawInput || '').slice(0, 100),
              formality: 'Polished but conversational',
              directness: 'High',
              values: ['clarity', 'craft'],
              ethics: [],
              humour: 'Dry',
              vocabulary: { frequent_words: [], avoid_words: [] },
              sentence_structure: { typical_length: 'Short', patterns: [] },
              formatting_preferences: { default: 'paragraphs' },
              decision_style: 'Pragmatic',
              rules: { always: [], never: [] }
            },
            is_active: true,
            created_at: new Date().toISOString()
          };

          const updated = personas.map(p => ({ ...p, is_active: false }));
          setLocalData('identities', [...updated, activePersona]);

          return createResponse({ success: true, persona: activePersona, demo: true });
        }
      }

      if (path === '/api/auth/delete') {
        if (method === 'POST') {
          localStorage.clear();
          return createResponse({ success: true, demo: true });
        }
      }

      if (path === '/api/settings/export') {
        if (method === 'GET' || method === 'POST') {
          const profile = getLocalData('profiles')[0];
          const memories = getLocalData('memories');
          const personas = getLocalData('identities');
          const transformations = getLocalData('transformations');
          return createResponse({
            success: true,
            data: { profile, memories, personas, transformations },
            demo: true
          });
        }
      }

      // 5. Billing endpoints
      if (path === '/api/billing/checkout') {
        if (method === 'POST') {
          const priceId = body.priceId;
          const tier = priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_POWER ? 'power' : 'pro';
          const profiles = getLocalData('profiles');
          if (profiles.length > 0) {
            profiles[0].subscription_tier = tier;
            setLocalData('profiles', profiles);
          }
          return createResponse({
            url: `/settings?tab=Billing&success=true`,
            demo: true,
            message: 'Billing simulated. Account upgraded to ' + tier
          });
        }
      }

      if (path === '/api/billing/portal') {
        if (method === 'POST') {
          return createResponse({
            url: '/settings?tab=Billing&demo=portal-simulated',
            demo: true
          });
        }
      }

      // Fallback for other api paths
      return createResponse({ error: 'Mock endpoint not implemented' }, 501);
    }

    return originalFetch(input, init);
  };
}
