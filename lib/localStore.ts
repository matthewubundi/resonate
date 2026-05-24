import {
  demoProfile,
  demoPersonas,
  demoMemories,
  demoTransformations,
  demoIdentityVersions
} from './demo';

const KEYS: Record<string, string> = {
  profiles: 'resonate_profile',
  identities: 'resonate_personas',
  memories: 'resonate_memories',
  transformations: 'resonate_transformations',
  identity_versions: 'resonate_identity_versions'
};

const DEFAULTS: Record<string, any[]> = {
  profiles: [demoProfile],
  identities: demoPersonas,
  memories: demoMemories,
  transformations: demoTransformations,
  identity_versions: demoIdentityVersions
};

// In-memory cache for SSR / server-side Next.js route fallback
const inMemoryCache: Record<string, any[]> = {};

export function getLocalData(table: string): any[] {
  if (typeof window === 'undefined') {
    if (!inMemoryCache[table]) {
      inMemoryCache[table] = JSON.parse(JSON.stringify(DEFAULTS[table] || []));
    }
    return inMemoryCache[table];
  }

  const key = KEYS[table];
  if (!key) return [];

  const stored = localStorage.getItem(key);
  if (!stored) {
    const defaultData = DEFAULTS[table] || [];
    localStorage.setItem(key, JSON.stringify(defaultData));
    return JSON.parse(JSON.stringify(defaultData));
  }

  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error(`Failed to parse localStorage key ${key}:`, e);
    return JSON.parse(JSON.stringify(DEFAULTS[table] || []));
  }
}

export function setLocalData(table: string, data: any[]): void {
  if (typeof window === 'undefined') {
    inMemoryCache[table] = data;
    return;
  }

  const key = KEYS[table];
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(data));
}
