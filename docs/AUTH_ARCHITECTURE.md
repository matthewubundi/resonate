# Authentication Architecture

## Component Hierarchy

```
App (wrapped with AuthProvider)
├── AuthContext (provides auth state & methods)
│   ├── user
│   ├── session
│   ├── loading
│   └── auth methods (signIn, signUp, signOut, etc.)
│
└── AppContent
    ├── Landing Page (public)
    ├── Login Page (public, uses useAuth)
    ├── Signup Page (public, uses useAuth)
    ├── Onboarding Page (semi-protected)
    └── Protected Pages (requires authentication)
        ├── Dashboard
        ├── Transform
        ├── Editor
        ├── Analytics
        └── Settings
```

## Data Flow

### Authentication Flow

```
User Action → Component → useAuth Hook → AuthContext → Supabase Client → Supabase API
                                            ↓
                                    Update Context State
                                            ↓
                                    Re-render Components
```

### Sign In Example

```
1. User enters credentials in Login.tsx
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
10. Components re-render with new auth state
    ↓
11. App.tsx redirects to dashboard
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
7. Google redirects to /auth/callback
   ↓
8. Callback page processes auth
   ↓
9. supabase.auth.getSession()
   ↓
10. Session established
    ↓
11. Redirect to dashboard
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

### Protection Logic

```
User navigates to protected route
    ↓
handleNavigate(page) called
    ↓
Check if page is in protectedPages array
    ↓
    ├─ YES → Check if user is authenticated
    │         ├─ YES → Navigate to page
    │         └─ NO  → Redirect to login
    │
    └─ NO  → Navigate to page (public)
```

### Protected Pages List

```typescript
const protectedPages = [
  'dashboard',
  'transform',
  'editor',
  'analytics',
  'memory',
  'personas',
  'settings'
];
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
App.tsx
  └─ imports AuthProvider, useAuth
      └─ from contexts/AuthContext.tsx
          └─ imports supabase
              └─ from lib/supabase.ts
                  └─ imports createClient
                      └─ from @supabase/supabase-js

Login.tsx / Signup.tsx
  └─ imports useAuth
      └─ from contexts/AuthContext.tsx

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
