import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// For expensive OpenAI operations
export const transformRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
    analytics: true,
});

// For general API operations
export const apiRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests per minute
    analytics: true,
});
