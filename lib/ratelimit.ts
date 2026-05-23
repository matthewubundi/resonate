import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { isDemoMode } from './demo';

const demoLimit = {
    limit: async () => ({
        success: true,
        limit: Number.POSITIVE_INFINITY,
        remaining: Number.POSITIVE_INFINITY,
        reset: Date.now() + 60000,
    }),
};

// For expensive OpenAI operations
export const transformRateLimit = isDemoMode ? demoLimit : new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
    analytics: true,
});

// For general API operations
export const apiRateLimit = isDemoMode ? demoLimit : new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests per minute
    analytics: true,
});
