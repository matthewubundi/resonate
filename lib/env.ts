const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
] as const;

export function validateEnv() {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true') {
        return;
    }

    const missing: string[] = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${missing.join('\n')}\n\n` +
            `Please check your .env file and ensure all required variables are set.`
        );
    }
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
    validateEnv();
}
