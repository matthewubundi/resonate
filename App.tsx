
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from './components/Layout';
import { Landing } from './views/Landing';
import { ResonateLoader } from './components/ResonateLoader';
import { Login } from './views/Login';
import { Signup } from './views/Signup';
import { CheckEmail } from './views/CheckEmail';
import { Verified } from './views/Verified';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { Transform } from './views/Transform';
import { HistoryPage } from './views/History';
import { AnalyticsPage } from './views/Analytics';
import { Memory } from './views/Memory';
import { Personas } from './views/Personas';
import Documentation from './views/Documentation';
import { Settings } from './views/Settings';
import { TermsOfService } from './views/TermsOfService';
import { PrivacyPolicy } from './views/PrivacyPolicy';
import { IdentityEditor } from './views/IdentityEditor';

import { PageView } from './types';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from './components/Components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { User } from '@supabase/supabase-js';
import { useOnboarding } from './hooks/useOnboarding';
import { supabase } from './lib/supabase';
import { Copy, Check, AlertCircle, X } from 'lucide-react';

// --- Placeholder Pages for less critical UI ---






const SettingsPage = ({ user }: { user: User | null }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [theme, setTheme] = useState('Paper White');
  const [language, setLanguage] = useState('English (US)');
  const [timezone, setTimezone] = useState('UTC');

  // Original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    displayName: '',
    theme: '',
    language: '',
    timezone: '',
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('full_name, theme, language, timezone')
          .eq('id', user.id)
          .single();

        if (fetchError) throw fetchError;

        const displayNameValue = data?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
        const themeValue = data?.theme || 'Paper White';
        const languageValue = data?.language || 'English (US)';
        const timezoneValue = data?.timezone || 'UTC';

        setDisplayName(displayNameValue);
        setTheme(themeValue);
        setLanguage(languageValue);
        setTimezone(timezoneValue);

        setOriginalValues({
          displayName: displayNameValue,
          theme: themeValue,
          language: languageValue,
          timezone: timezoneValue,
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const hasChanges = () => {
    return (
      displayName !== originalValues.displayName ||
      theme !== originalValues.theme ||
      language !== originalValues.language ||
      timezone !== originalValues.timezone
    );
  };

  const handleSave = async () => {
    if (!user) {
      setError('You must be logged in to save settings');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in to save settings');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token} `,
        },
        body: JSON.stringify({
          display_name: displayName,
          theme,
          language,
          timezone,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Update original values to reflect saved state
      setOriginalValues({
        displayName,
        theme,
        language,
        timezone,
      });

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDisplayName(originalValues.displayName);
    setTheme(originalValues.theme);
    setLanguage(originalValues.language);
    setTimezone(originalValues.timezone);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-azure/10 border border-azure/20 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Check className="text-azure flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-azure mb-1">Success</p>
              <p className="text-sm text-ink/80">{success}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}>
            <X size={16} />
          </Button>
        </div>
      )}

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
            <X size={16} />
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <div className="flex gap-3">
          {hasChanges() && (
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              Reset
            </Button>
          )}
          <Button onClick={handleSave} isLoading={saving} disabled={!hasChanges() || saving || loading}>
            Save Changes
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-ink/5">
          <CardTitle className="text-lg">General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-paleslate rounded w-3/4"></div>
              <div className="h-10 bg-paleslate rounded"></div>
              <div className="h-4 bg-paleslate rounded w-1/2"></div>
              <div className="h-10 bg-paleslate rounded"></div>
            </div>
          ) : (
            <>
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-ink/10 bg-paleslate/30 text-ink/60 cursor-not-allowed"
                />
                <p className="text-xs text-ink/50">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">Interface Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full rounded-md border border-ink/10 bg-paleslate px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure transition-colors focus:bg-white"
                >
                  <option>Paper White</option>
                  <option>Dark Mode</option>
                  <option>Auto</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-md border border-ink/10 bg-paleslate px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure transition-colors focus:bg-white"
                  >
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Italian</option>
                    <option>Portuguese</option>
                    <option>Japanese</option>
                    <option>Chinese (Simplified)</option>
                    <option>Chinese (Traditional)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-md border border-ink/10 bg-paleslate px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure transition-colors focus:bg-white"
                  >
                    <option>UTC</option>
                    <option>GMT</option>
                    <option>America/New_York</option>
                    <option>America/Chicago</option>
                    <option>America/Denver</option>
                    <option>America/Los_Angeles</option>
                    <option>Europe/London</option>
                    <option>Europe/Paris</option>
                    <option>Europe/Berlin</option>
                    <option>Asia/Tokyo</option>
                    <option>Asia/Shanghai</option>
                    <option>Australia/Sydney</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// --- Main App Component ---

const AppContent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Detect current route and map to view
  const getInitialView = (): PageView => {
    if (typeof window === 'undefined') return 'landing';

    const routeMap: Record<string, PageView> = {
      '/dashboard': 'dashboard',
      '/transform': 'transform',
      '/login': 'login',
      '/signup': 'signup',
      '/editor': 'editor',
      '/analytics': 'analytics',
      '/history': 'history',
      '/settings': 'settings',
      '/onboarding': 'onboarding',
      '/memory': 'memory',
      '/personas': 'personas',
      '/documentation': 'documentation',
      '/check-email': 'check-email',
      '/verified': 'verified',
      '/terms': 'terms',
      '/privacy': 'privacy',
    };

    return routeMap[pathname || '/'] || 'landing';
  };

  const [view, setView] = useState<PageView>(getInitialView());
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light
  const { user, signOut, loading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading, refetch: refetchOnboarding } = useOnboarding(user);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Only set initial view on mount, don't update on pathname changes
  // This prevents unnecessary re-renders when switching browser tabs
  useEffect(() => {
    const currentView = getInitialView();
    // Only update if view is different from current
    setView(prev => {
      if (prev !== currentView) {
        return currentView;
      }
      return prev;
    });
  }, []); // Empty dependency array - only run on mount

  // Check onboarding status and redirect if needed
  useEffect(() => {
    if (!loading && !onboardingLoading && user) {
      // If user is authenticated but hasn't completed onboarding
      if (onboardingCompleted === false) {
        // Only redirect if not already on onboarding or public pages
        const publicPages = ['landing', 'login', 'signup', 'onboarding', 'loading', 'documentation', 'check-email', 'verified', 'terms', 'privacy'];
        if (!publicPages.includes(view)) {
          router.push('/onboarding');
          setView('onboarding');
        }
      }
    }
  }, [user, loading, onboardingLoading, onboardingCompleted, view, router]);

  // Track if we're waiting for signup authentication
  const [pendingSignup, setPendingSignup] = useState(false);
  // Track if we're waiting for login authentication
  const [pendingLogin, setPendingLogin] = useState(false);
  // Track email for verification step
  const [verificationEmail, setVerificationEmail] = useState<string | undefined>(undefined);

  // Watch for user authentication after login
  useEffect(() => {
    if (pendingLogin && user && !onboardingLoading) {
      setPendingLogin(false);

      // Navigate immediately without artificial delay
      if (onboardingCompleted === false) {
        router.push('/onboarding');
        setView('onboarding');
      } else {
        router.push('/dashboard');
        setView('dashboard');
      }
    }
  }, [user, pendingLogin, onboardingCompleted, onboardingLoading, router]);

  // Watch for user authentication after signup
  useEffect(() => {
    if (pendingSignup && user && !onboardingLoading) {
      // User is now authenticated, check onboarding status
      setPendingSignup(false);

      // Navigate immediately without artificial delay
      if (onboardingCompleted === false) {
        // New user needs onboarding
        router.push('/onboarding');
        setView('onboarding');
      } else {
        // User has completed onboarding, go to dashboard
        router.push('/dashboard');
        setView('dashboard');
      }
    }
  }, [user, pendingSignup, onboardingCompleted, onboardingLoading, router]);

  // Handle login
  const handleLogin = () => {
    // Set pending flag - navigation will happen in useEffect once auth state updates
    setPendingLogin(true);
  };

  // Handle signup
  const handleSignup = () => {
    // If user is already authenticated, check onboarding status
    // This happens when email confirmation is disabled in Supabase
    if (user) {
      // Navigate immediately without artificial delay
      if (onboardingCompleted === false) {
        router.push('/onboarding');
        setView('onboarding');
      } else {
        router.push('/dashboard');
        setView('dashboard');
      }
    } else {
      // Auth state might still be updating after signup
      // Set pending flag and wait for auth state to update via useEffect
      setPendingSignup(true);
      // Note: If email confirmation is required, the Signup component
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Protected route handler
  const handleNavigate = (page: PageView) => {
    // If trying to access protected pages without authentication, redirect to login
    const protectedPages: PageView[] = ['dashboard', 'transform', 'editor', 'analytics', 'history', 'memory', 'personas', 'settings'];

    if (protectedPages.includes(page) && !user) {
      router.push('/login');
      return;
    }

    // If user is authenticated but hasn't completed onboarding, redirect to onboarding
    // (except if they're already going to onboarding or public pages)
    if (user && onboardingCompleted === false && protectedPages.includes(page)) {
      router.push('/onboarding');
      return;
    }

    // Map page views to routes
    const routeMap: Record<PageView, string> = {
      'landing': '/',
      'login': '/login',
      'signup': '/signup',
      'dashboard': '/dashboard',
      'transform': '/transform',
      'editor': '/editor',
      'analytics': '/analytics',
      'history': '/history',
      'settings': '/settings',
      'onboarding': '/onboarding',
      'loading': '/loading',
      'memory': '/memory',
      'personas': '/personas',
      'review': '/review',
      'documentation': '/documentation',
      'check-email': '/check-email',
      'verified': '/verified',
      'terms': '/terms',
      'privacy': '/privacy',
    };

    router.push(routeMap[page] || '/');
  };

  // Show loading screen while checking authentication and onboarding status
  if (loading || onboardingLoading) {
    return <ResonateLoader />;
  }

  // Routing Logic
  const renderView = () => {
    switch (view) {
      case 'landing':
        return <Landing onLogin={() => handleNavigate('login')} onSignup={() => handleNavigate('signup')} onNavigate={handleNavigate} />;
      case 'login':
        return (
          <Login
            onLogin={handleLogin}
            onNavigateToSignup={() => handleNavigate('signup')}
            onBack={() => handleNavigate('landing')}
            onNavigate={handleNavigate}
          />
        );
      case 'signup':
        return (
          <Signup
            onSignup={handleSignup}
            onNavigateToLogin={() => handleNavigate('login')}
            onBack={() => handleNavigate('landing')}
            onNavigateToCheckEmail={(email) => {
              setVerificationEmail(email);
              // Handle view change manually since we want to pass state, 
              // though handleNavigate updates URL which is fine.
              // We'll trust handleNavigate to update view state via URL or internal logic if we implemented that,
              // but here handleNavigate updates URL and view state syncs via useEffect or router.
              // Actually handleNavigate uses router.push.
              router.push('/check-email');
              setView('check-email');
            }}
            onNavigate={handleNavigate}
          />
        );
      case 'check-email':
        return (
          <CheckEmail
            email={verificationEmail}
            onNavigateToLogin={() => handleNavigate('login')}
            onVerified={() => {
              // When verified (session detected), go to dashboard
              // Check onboarding status first?
              // The main useEffect for auth changes will handle onboarding redirect if needed.
              // But we can force a push here.
              router.push('/dashboard');
              setView('dashboard');
            }}
          />
        );
      case 'verified':
        return (
          <Verified
            onNavigateToDashboard={() => {
              handleNavigate('dashboard');
            }}
          />
        );
      case 'onboarding':
        return (
          <Onboarding
            onComplete={async () => {
              // Refetch onboarding status after completion
              await refetchOnboarding();
              // After onboarding completes, go to loading screen then dashboard
              setView('loading');
            }}
            onBack={() => {
              if (user) {
                // If logged in, go to dashboard (they can't skip onboarding)
                router.push('/dashboard');
              } else {
                // If not logged in, go to landing
                setView('landing');
              }
            }}
          />
        );
      case 'loading':
        return <ResonateLoader onComplete={() => {
          setView('dashboard');
          router.push('/dashboard');
        }} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'transform':
        return <Transform />;
      case 'editor':
        return <IdentityEditor />;
      case 'analytics':
        return <AnalyticsPage onNavigate={handleNavigate} />;
      case 'history':
        return <HistoryPage onNavigate={handleNavigate} />;
      case 'memory':
        return <Memory />;
      case 'personas':
        return <Personas onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings onNavigate={handleNavigate} />;
      case 'documentation':
        return <Documentation onBack={() => handleNavigate('landing')} />;
      case 'terms':
        return <TermsOfService onBack={() => handleNavigate('landing')} />;
      case 'privacy':
        return <PrivacyPolicy onBack={() => handleNavigate('landing')} />;
      default:
        return <div className="p-8 text-center text-ink">Page: {view} (Placeholder)</div>;
    }
  };

  // Wrapper for logged-in pages
  if (view === 'landing' || view === 'login' || view === 'signup' || view === 'onboarding' || view === 'loading' || view === 'documentation' || view === 'check-email' || view === 'verified' || view === 'terms' || view === 'privacy') {
    return (
      <div className="bg-paper min-h-screen text-ink font-sans selection:bg-azure/20 selection:text-azure">
        {renderView()}
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen text-ink font-sans selection:bg-azure/20 selection:text-azure">
      <Layout
        activePage={view}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        user={user}
      >
        {renderView()}
      </Layout>
    </div>
  );
};

// Wrap the app with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;