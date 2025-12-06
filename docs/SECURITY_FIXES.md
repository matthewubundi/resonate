# Security Quick Reference - Critical Fixes

## 🔴 CRITICAL PRIORITY (Fix Today)

### 1. Add Rate Limiting

**Install dependency:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Create rate limiter utility:**
```typescript
// lib/ratelimit.ts
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
```

**Add to .env:**
```env
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

**Apply to API routes:**
```typescript
// app/api/transform/route.ts
import { transformRateLimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success, reset } = await transformRateLimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ 
      error: 'Too many requests. Please try again later.',
      resetAt: new Date(reset).toISOString()
    }, { status: 429 });
  }
  
  // ... rest of handler
}
```

---

### 2. Add Input Validation

**Install dependency:**
```bash
npm install zod
```

**Create validation schemas:**
```typescript
// lib/validation.ts
import { z } from 'zod';

export const transformSchema = z.object({
  inputText: z.string()
    .min(1, 'Input text is required')
    .max(50000, 'Input text must be less than 50,000 characters'),
  temperature: z.number()
    .min(0)
    .max(1.5)
    .optional()
    .default(0.7),
});

export const memorySchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5,000 characters'),
});

export const personaSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  baseConfig: z.enum(['clone', 'scratch']),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});
```

**Apply to API routes:**
```typescript
// app/api/transform/route.ts
import { transformSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validated = transformSchema.parse(body);
    const { inputText, temperature } = validated;
    
    // ... rest of handler
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 });
    }
    // ... other error handling
  }
}
```

---

### 3. Add Request Size Limits

**Create next.config.js (or update existing):**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // API route configuration
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: '4mb',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 🟡 HIGH PRIORITY (Fix This Week)

### 4. Fix JsonViewer XSS Vulnerability

**Install dependency:**
```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

**Update component:**
```typescript
// components/Components.tsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const JsonViewer: React.FC<{ data: string | object }> = ({ data }) => {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <SyntaxHighlighter 
      language="json" 
      style={vscDarkPlus}
      customStyle={{
        borderRadius: '0.5rem',
        padding: '1rem',
        fontSize: '0.75rem',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {content}
    </SyntaxHighlighter>
  );
};
```

---

### 5. Add Environment Variable Validation

**Create validation file:**
```typescript
// lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
] as const;

export function validateEnv() {
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

// Validate on module load
if (typeof window === 'undefined') {
  validateEnv();
}
```

**Import in app entry:**
```typescript
// app/layout.tsx or App.tsx
import '@/lib/env'; // This will run validation on server startup
```

---

### 6. Add CORS Configuration

**Create CORS middleware:**
```typescript
// lib/cors.ts
import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
];

export function corsHeaders(origin: string | null) {
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return {};
  }
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCors(req: Request) {
  const origin = req.headers.get('origin');
  
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }
  
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { error: 'Origin not allowed' },
      { status: 403 }
    );
  }
  
  return null;
}
```

**Apply to API routes:**
```typescript
// app/api/transform/route.ts
import { handleCors, corsHeaders } from '@/lib/cors';

export async function OPTIONS(req: Request) {
  return handleCors(req);
}

export async function POST(req: Request) {
  const corsError = handleCors(req);
  if (corsError) return corsError;
  
  // ... rest of handler
  
  const response = NextResponse.json({ data });
  Object.entries(corsHeaders(req.headers.get('origin'))).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
```

---

### 7. Sanitize Error Messages

**Create error handler:**
```typescript
// lib/errors.ts
export function sanitizeError(error: any): { message: string; status: number } {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Known error types
  if (error.message === 'Unauthorized') {
    return { message: 'Unauthorized', status: 401 };
  }
  
  if (error.name === 'ZodError') {
    return { 
      message: 'Validation failed', 
      status: 400 
    };
  }
  
  // Generic error for production
  return {
    message: isDev ? error.message : 'An error occurred. Please try again.',
    status: 500,
  };
}
```

**Apply to API routes:**
```typescript
// app/api/transform/route.ts
import { sanitizeError } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    // ... handler logic
  } catch (error: any) {
    const { message, status } = sanitizeError(error);
    console.error('API Error:', error); // Still log full error server-side
    return NextResponse.json({ error: message }, { status });
  }
}
```

---

## 📋 Implementation Order

1. **Day 1:** Add input validation (Zod) - 2 hours
2. **Day 1:** Add request size limits (next.config.js) - 30 minutes
3. **Day 2:** Set up rate limiting (Upstash) - 3 hours
4. **Day 3:** Fix JsonViewer XSS - 1 hour
5. **Day 3:** Add environment validation - 1 hour
6. **Day 4:** Add CORS configuration - 2 hours
7. **Day 4:** Sanitize error messages - 1 hour

**Total Time:** ~10.5 hours over 4 days

---

## Testing Checklist

After implementing fixes:

- [ ] Test rate limiting with multiple rapid requests
- [ ] Test input validation with oversized payloads
- [ ] Test input validation with invalid data types
- [ ] Verify JsonViewer doesn't execute malicious HTML
- [ ] Test CORS with allowed and disallowed origins
- [ ] Verify error messages don't leak sensitive info in production
- [ ] Test environment validation by removing required vars
- [ ] Run `npm run build` to ensure no build errors
- [ ] Test all API routes with Postman/curl

---

## Monitoring Setup

**Add logging:**
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, meta?: any) => {
    console.error(JSON.stringify({ level: 'error', message, ...meta, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }));
  },
};
```

**Track security events:**
```typescript
// Log failed auth attempts
logger.warn('Failed authentication attempt', { 
  ip: req.headers.get('x-forwarded-for'),
  route: '/api/transform'
});

// Log rate limit hits
logger.warn('Rate limit exceeded', { 
  ip: req.headers.get('x-forwarded-for'),
  route: '/api/transform'
});
```

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OpenAI Safety Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
