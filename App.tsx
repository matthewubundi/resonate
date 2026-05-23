import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from '@/src/i18n/navigation';
import { Layout } from './components/Layout';
import { ResonateLoader } from './components/ResonateLoader';
import { PageView } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useOnboarding } from './hooks/useOnboarding';
import { useSettings } from './hooks/useSettings';

// Lazy load views for better performance
const Landing = React.lazy(() => import('./views/Landing').then(module => ({ default: module.Landing })));
const Login = React.lazy(() => import('./views/Login').then(module => ({ default: module.Login })));
const Signup = React.lazy(() => import('./views/Signup').then(module => ({ default: module.Signup })));
const CheckEmail = React.lazy(() => import('./views/CheckEmail').then(module => ({ default: module.CheckEmail })));
const Verified = React.lazy(() => import('./views/Verified').then(module => ({ default: module.Verified })));
const Onboarding = React.lazy(() => import('./views/Onboarding').then(module => ({ default: module.Onboarding })));
const Dashboard = React.lazy(() => import('./views/Dashboard').then(module => ({ default: module.Dashboard })));
const Transform = React.lazy(() => import('./views/Transform').then(module => ({ default: module.Transform })));
const HistoryPage = React.lazy(() => import('./views/History').then(module => ({ default: module.HistoryPage })));
const AnalyticsPage = React.lazy(() => import('./views/Analytics').then(module => ({ default: module.AnalyticsPage })));
const Memory = React.lazy(() => import('./views/Memory').then(module => ({ default: module.Memory })));
const Personas = React.lazy(() => import('./views/Personas').then(module => ({ default: module.Personas })));
const Documentation = React.lazy(() => import('./views/Documentation').then(module => ({ default: module.default })));
const Architecture = React.lazy(() => import('./views/Architecture').then(module => ({ default: module.Architecture })));
const Settings = React.lazy(() => import('./views/Settings').then(module => ({ default: module.Settings })));
const TermsOfService = React.lazy(() => import('./views/TermsOfService').then(module => ({ default: module.TermsOfService })));
const PrivacyPolicy = React.lazy(() => import('./views/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const IdentityEditor = React.lazy(() => import('./views/IdentityEditor').then(module => ({ default: module.IdentityEditor })));
const ResetPassword = React.lazy(() => import('./views/ResetPassword').then(module => ({ default: module.ResetPassword })));
const Plans = React.lazy(() => import('./views/Plans').then(module => ({ default: module.Plans })));



// Detect current route and map to view
const getInitialView = (pathname: string | null): PageView => {
    if (typeof window === 'undefined') return 'landing';

    const routeMap: Record<string, PageView> = {
        '/dashboard': 'dashboard',
        '/transform': 'transform',
        '/login': 'login',
        '/signup': 'signup',
        '/editor': 'editor',
        '/analytics': 'analytics',
        '/history': 'history',
        '/auth/reset-password': 'reset-password',
        '/settings': 'settings',
        '/onboarding': 'onboarding',
        '/memory': 'memory',
        '/personas': 'personas',
        '/architecture': 'architecture',
        '/documentation': 'documentation',
        '/check-email': 'check-email',
        '/verified': 'verified',
        '/terms': 'terms',
        '/privacy': 'privacy',
        '/plans': 'plans',
    };

    return routeMap[pathname || '/'] || 'landing';
};

const AppContent: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const initialPathRef = React.useRef(pathname);

    const [view, setView] = useState<PageView>(getInitialView(pathname));
    const [isDarkMode, setIsDarkMode] = useState(false); // Default to light
    const { user, signOut, loading } = useAuth();
    const { onboardingCompleted, loading: onboardingLoading, refetch: refetchOnboarding } = useOnboarding(user);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // Only set initial view on mount, don't update on pathname changes
    // This prevents unnecessary re-renders when switching browser tabs
    useEffect(() => {
        const currentView = getInitialView(initialPathRef.current);
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

    const { settings, loading: settingsLoading } = useSettings();

    // Watch for user authentication after login
    useEffect(() => {
        if (pendingLogin && user && !onboardingLoading && !settingsLoading) {
            setPendingLogin(false);

            // Navigate immediately without artificial delay
            if (onboardingCompleted === false) {
                router.push('/onboarding');
                setView('onboarding');
            } else {
                const targetPage = settings.defaultLandingPage as PageView;
                router.push(`/${targetPage}`);
                setView(targetPage);
            }
        }
    }, [user, pendingLogin, onboardingCompleted, onboardingLoading, settingsLoading, settings, router]);

    // Watch for user authentication after signup
    useEffect(() => {
        if (pendingSignup && user && !onboardingLoading && !settingsLoading) {
            // User is now authenticated, check onboarding status
            setPendingSignup(false);

            // Navigate immediately without artificial delay
            if (onboardingCompleted === false) {
                // New user needs onboarding
                router.push('/onboarding');
                setView('onboarding');
            } else {
                // User has completed onboarding, go to target page
                const targetPage = settings.defaultLandingPage as PageView;
                router.push(`/${targetPage}`);
                setView(targetPage);
            }
        }
    }, [user, pendingSignup, onboardingCompleted, onboardingLoading, settingsLoading, settings, router]);

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
        const protectedPages: PageView[] = ['dashboard', 'transform', 'editor', 'analytics', 'history', 'memory', 'personas', 'settings', 'plans', 'architecture'];

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
            'architecture': '/architecture',
            'review': '/review',
            'documentation': '/documentation',
            'check-email': '/check-email',
            'verified': '/verified',
            'reset-password': '/auth/reset-password',
            'terms': '/terms',
            'privacy': '/privacy',
            'plans': '/plans',
        };

        router.push(routeMap[page] || '/');
        setView(page);
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
            case 'reset-password':
                return (
                    <ResetPassword onNavigate={handleNavigate} />
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
            case 'architecture':
                return <Architecture onNavigate={handleNavigate} />;
            case 'settings':
                return <Settings onNavigate={handleNavigate} />;
            case 'plans':
                return <Plans />;
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
    if (view === 'landing' || view === 'login' || view === 'signup' || view === 'onboarding' || view === 'loading' || view === 'documentation' || view === 'check-email' || view === 'verified' || view === 'terms' || view === 'privacy' || view === 'reset-password') {
        return (
            <div className="bg-paper min-h-screen text-ink font-sans selection:bg-azure/20 selection:text-azure">
                <Suspense fallback={<ResonateLoader />}>
                    {renderView()}
                </Suspense>
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
                <Suspense fallback={<ResonateLoader />}>
                    {renderView()}
                </Suspense>
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
