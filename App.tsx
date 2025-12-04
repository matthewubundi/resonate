import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Transform } from './pages/Transform';
import { Loader2 } from 'lucide-react';
import { PageView } from './types';
import { DUMMY_JSON } from './constants';
import { Card, CardHeader, CardTitle, CardContent, Input, TextArea, Button, JsonViewer, Chip } from './components/Components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { User } from '@supabase/supabase-js';

// --- Placeholder Pages for less critical UI ---

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-paper text-ink relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-azure animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-ink">I</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-ink tracking-tight">Analysing patterns...</h2>
        <p className="text-ink/50 mt-2 text-sm tracking-widest uppercase font-bold">Extracting linguistic DNA</p>

        <div className="w-64 h-1 bg-paleslate mt-8 rounded-full overflow-hidden">
          <div className="h-full bg-azure animate-[width_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

const IdentityEditor = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <Card className="bg-white">
        <CardHeader><CardTitle>Core Attributes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Identity Name" defaultValue="Professional Tech Lead" />
          <TextArea label="Tone Description" defaultValue="Direct, Professional, Encouraging, Clear" />
          <div>
            <label className="text-sm font-bold mb-2 block text-ink">Vocabulary Whitelist</label>
            <div className="flex flex-wrap gap-2">
              {['optimize', 'scale', 'robust'].map(w => <Chip key={w} label={w} onRemove={() => { }} />)}
              <button className="text-xs bg-paleslate border border-ink/10 px-3 py-1 rounded-full hover:border-azure text-ink/60 hover:text-azure transition-colors font-semibold">+ Add</button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white">
        <CardHeader><CardTitle>Rules Engine</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-highlight/10 rounded-lg border border-highlight/20">
            <div className="mt-1"><span className="px-2 py-0.5 bg-highlight text-ink text-xs font-bold rounded">NEVER</span></div>
            <p className="text-sm text-ink/70 font-medium">Use passive aggression or undefined acronyms.</p>
          </div>
          <div className="flex items-start gap-4 p-4 bg-azure/5 rounded-lg border border-azure/10">
            <div className="mt-1"><span className="px-2 py-0.5 bg-azure/10 text-azure text-xs font-bold rounded border border-azure/20">ALWAYS</span></div>
            <p className="text-sm text-ink/70 font-medium">Provide context before requesting action.</p>
          </div>
          <Button variant="outline" size="sm" className="w-full border-dashed border-ink/20">Add New Rule</Button>
        </CardContent>
      </Card>
    </div>
    <div>
      <Card className="h-full bg-paleslate border-ink/10">
        <CardHeader className="border-ink/5 bg-white rounded-t-xl">
          <CardTitle className="text-ink flex justify-between items-center">
            <span>JSON Preview</span>
            <Button variant="ghost" size="sm" className="text-xs h-6 text-azure hover:text-azure-hover">Copy</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <JsonViewer data={DUMMY_JSON} />
        </CardContent>
      </Card>
    </div>
  </div>
);

const Analytics = () => {
  const data = [
    { name: 'Mon', score: 82 },
    { name: 'Tue', score: 85 },
    { name: 'Wed', score: 88 },
    { name: 'Thu', score: 92 },
    { name: 'Fri', score: 94 },
    { name: 'Sat', score: 90 },
    { name: 'Sun', score: 95 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Performance Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader><CardTitle>Alignment Score Trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', color: '#111111', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#2563EB' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ fill: '#FFFFFF', stroke: '#2563EB', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#2563EB' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader><CardTitle>Tone Consistency</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Bar dataKey="score" fill="#2563EB" radius={[4, 4, 0, 0]} opacity={0.9} />
                <Tooltip
                  cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', color: '#111111', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SettingsPage = ({ user }: { user: User | null }) => {
  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="bg-white">
        <CardHeader><CardTitle>General System</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Display Name" defaultValue={getUserDisplayName()} />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-ink/10 bg-paleslate/30 text-ink/60 cursor-not-allowed"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-paleslate rounded-lg border border-ink/5">
            <span className="text-sm font-semibold text-ink">Interface Theme</span>
            <div className="text-xs bg-white px-3 py-1 rounded-full text-ink font-bold border border-ink/10 shadow-sm">Paper White</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white">
        <CardHeader><CardTitle>API Gateway</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="password" label="OpenAI API Key" placeholder="sk-..." />
          <Input type="password" label="Anthropic API Key" placeholder="sk-..." />
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
      '/settings': 'settings',
    };

    return routeMap[pathname || '/'] || 'landing';
  };

  const [view, setView] = useState<PageView>(getInitialView());
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light
  const { user, signOut, loading } = useAuth();

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Update view when pathname changes
  useEffect(() => {
    const currentView = getInitialView();
    setView(currentView);
  }, [pathname]);

  // Handle login
  const handleLogin = () => {
    router.push('/dashboard');
  };

  // Handle signup
  const handleSignup = () => {
    setView('onboarding'); // Take new users through onboarding
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Protected route handler
  const handleNavigate = (page: PageView) => {
    // If trying to access protected pages without authentication, redirect to login
    const protectedPages: PageView[] = ['dashboard', 'transform', 'editor', 'analytics', 'memory', 'personas', 'settings'];

    if (protectedPages.includes(page) && !user) {
      router.push('/login');
    } else {
      // Map page views to routes
      const routeMap: Record<PageView, string> = {
        'landing': '/',
        'login': '/login',
        'signup': '/signup',
        'dashboard': '/dashboard',
        'transform': '/transform',
        'editor': '/editor',
        'analytics': '/analytics',
        'settings': '/settings',
        'onboarding': '/onboarding',
        'loading': '/loading',
        'memory': '/memory',
        'personas': '/personas',
        'review': '/review',
      };

      router.push(routeMap[page] || '/');
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-paper via-paleslate to-azure/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-azure animate-spin" />
          <p className="text-ink/60 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Routing Logic
  const renderView = () => {
    switch (view) {
      case 'landing':
        return <Landing onStart={() => handleNavigate('login')} />;
      case 'login':
        return (
          <Login
            onLogin={handleLogin}
            onNavigateToSignup={() => setView('signup')}
            onBack={() => setView('landing')}
          />
        );
      case 'signup':
        return (
          <Signup
            onSignup={handleSignup}
            onNavigateToLogin={() => setView('login')}
            onBack={() => setView('landing')}
          />
        );
      case 'onboarding':
        return <Onboarding onComplete={() => setView('loading')} onBack={() => setView('landing')} />;
      case 'loading':
        return <LoadingScreen onComplete={() => setView('dashboard')} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'transform':
        return <Transform />;
      case 'editor':
        return <IdentityEditor />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPage user={user} />;
      default:
        return <div className="p-8 text-center text-ink">Page: {view} (Placeholder)</div>;
    }
  };

  // Wrapper for logged-in pages
  if (view === 'landing' || view === 'login' || view === 'signup' || view === 'onboarding' || view === 'loading') {
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