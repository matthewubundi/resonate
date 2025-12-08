# Authentication Architecture

## Component Hierarchy

```
RootLayout (app/layout.tsx)
├── AuthProvider (Context)
│   └── Component Tree
│       ├── Navbar (Client Component)
│       └── Page Content (Server/Client Components)
│           ├── Landing Page (app/page.tsx)
│           ├── Login Page (app/login/page.tsx)
│           ├── Signup Page (app/signup/page.tsx)
│           └── Protected Routes
│               ├── Dashboard (app/dashboard/page.tsx)
│               ├── Transform (app/transform/page.tsx)
│               └── ...
```

## Data Flow

### Authentication Flow

```
User Action → Client Component → useAuth Hook → AuthContext → Supabase Client → Supabase API
                                            ↓
                                    Update Context State
                                            ↓
                                    Re-render Consuming Components
```

### Sign In Example

```
1. User enters credentials in Login Form
   ↓
2. handleSubmit() calls signIn(email, password)
   ↓
3. signIn() from useAuth hook
   ↓
4. AuthContext.signIn() method
   ↓
5. supabase.auth.signInWithPassword()
   ↓
6. Supabase API validates credentials
   ↓
7. Returns session + user data
   ↓
8. AuthContext updates state (user, session)
   ↓
9. onAuthStateChange listener fires
   ↓
10. Router.push('/dashboard')
```

### OAuth Flow

```
1. User clicks "Sign in with Google"
   ↓
2. handleGoogleSignIn() called
   ↓
3. signInWithGoogle() from useAuth
   ↓
4. supabase.auth.signInWithOAuth({ provider: 'google' })
   ↓
5. User redirected to Google
   ↓
6. User authorizes app
   ↓
7. Google redirects to /auth/callback (API Route)
   ↓
8. Callback route exchanges code for session
   ↓
9. Redirect to dashboard
```

## State Management

### AuthContext State

```typescript
{
  user: User | null,           // Current user object
  session: Session | null,     // Current session
  loading: boolean,            // Auth initialization state
  signUp: Function,            // Registration method
  signIn: Function,            // Login method
  signOut: Function,           // Logout method
  signInWithGoogle: Function,  // Google OAuth
  signInWithGithub: Function,  // GitHub OAuth
  resetPassword: Function      // Password reset
}
```

### User Object Structure

```typescript
{
  id: string,                  // Unique user ID
  email: string,               // User email
  user_metadata: {
    full_name: string,         // User's full name
    avatar_url?: string        // Profile picture URL
  },
  created_at: string,          // Account creation timestamp
  ...
}
```

## Route Protection

### Middleware Protection (Recommended)
While client-side checks exist, Next.js Middleware is the primary protection layer.

```typescript
// middleware.ts
export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}
```

## Session Management

### Session Lifecycle

```
App Initialization
    ↓
AuthProvider mounts
    ↓
useEffect runs
    ↓
supabase.auth.getSession()
    ↓
    ├─ Session exists
    │   ├─ Set user state
    │   ├─ Set session state
    │   └─ Set loading = false
    │
    └─ No session
        ├─ Set user = null
        ├─ Set session = null
        └─ Set loading = false
```

### Session Refresh

```
Supabase automatically refreshes tokens
    ↓
onAuthStateChange listener fires
    ↓
Update user and session state
    ↓
Components re-render with new state
```

## Error Handling

### Error Flow

```
User Action
    ↓
Try authentication method
    ↓
    ├─ Success
    │   ├─ Update state
    │   └─ Navigate to next page
    │
    └─ Error
        ├─ Catch error
        ├─ Set error state
        ├─ Display error message
        └─ Keep user on current page
```

### Error Display

```typescript
{error && (
  <div className="error-alert">
    <AlertCircle />
    <div>
      <p>Authentication Error</p>
      <p>{error}</p>
    </div>
  </div>
)}
```

## Security Layers

```
1. Client-Side
   ├─ Form validation
   ├─ Password strength checking
   └─ Input sanitization

2. Supabase Client
   ├─ Request signing
   ├─ Token management
   └─ HTTPS enforcement

3. Supabase Server
   ├─ Credential validation
   ├─ Rate limiting
   ├─ SQL injection prevention
   └─ Row Level Security (RLS)

4. Database
   ├─ Encrypted storage
   ├─ Access policies
   └─ Audit logging
```

## Environment Variables

```
Development:
  .env.local (gitignored)
    ├─ NEXT_PUBLIC_SUPABASE_URL
    └─ NEXT_PUBLIC_SUPABASE_ANON_KEY

Production:
  Vercel/Platform Environment Variables
    ├─ NEXT_PUBLIC_SUPABASE_URL
    └─ NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## File Dependencies

```
app/layout.tsx
  └─ imports AuthProvider
      └─ from contexts/AuthContext.tsx
          └─ imports supabase
              └─ from lib/supabase.ts

app/login/page.tsx
  └─ imports useAuth
      └─ from contexts/AuthContext.tsx
```
hooks/useAuth.ts
  └─ imports useAuth
      └─ from contexts/AuthContext.tsx
```

## API Endpoints (Supabase)

```
Authentication:
  POST /auth/v1/signup          - Create account
  POST /auth/v1/token           - Sign in
  POST /auth/v1/logout          - Sign out
  POST /auth/v1/recover         - Password reset
  GET  /auth/v1/user            - Get current user
  
OAuth:
  GET  /auth/v1/authorize       - OAuth initiation
  GET  /auth/v1/callback        - OAuth callback
  
Session:
  POST /auth/v1/token?grant_type=refresh_token - Refresh session
```
