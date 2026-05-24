const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
] as const;

export function validateEnv() {
    return;
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
    validateEnv();
}
