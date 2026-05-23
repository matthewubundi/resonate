import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  FileEdit,
  BarChart3,
  History,
  Brain,
  Users,
  Settings,
  Menu,
  LogOut,
  Cpu,
  CreditCard,
  Network
} from 'lucide-react';
import Image from 'next/image';
import { NavItem, PageView } from '../types';
import { User } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  activePage: PageView;
  onNavigate: (page: PageView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  user: User | null;
}

import { useTranslations } from 'next-intl';

const NAV_ITEMS: { id: NavItem['id']; icon: any }[] = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'transform', icon: Sparkles },
  { id: 'editor', icon: FileEdit },
  { id: 'history', icon: History },
  { id: 'analytics', icon: BarChart3 },
  { id: 'memory', icon: Brain },
  { id: 'personas', icon: Users },
  { id: 'architecture', icon: Network },
  { id: 'plans', icon: CreditCard },
  { id: 'settings', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({
  children, activePage, onNavigate, onLogout, user
}) => {
  const t = useTranslations('Layout');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = React.useState<string>('free');
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          // Initialize loading state
          setIsLoadingProfile(true);
          const { data } = await supabase
            .from('profiles')
            .select('avatar_url, subscription_tier')
            .eq('id', user.id)
            .single();
          if (data) {
            if (data.avatar_url) setAvatarUrl(data.avatar_url);
            if (data.subscription_tier) setSubscriptionTier(data.subscription_tier);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      };
      fetchProfile();
    } else {
      // If no user, stop loading
      setIsLoadingProfile(false);
    }
  }, [user]);

  // Get user display name from metadata or email
  const getUserDisplayName = () => {
    if (!user) return t('guest');
    return user.user_metadata?.full_name || user.email?.split('@')[0] || t('user');
  };

  // Get user initials for avatar
  const getUserInitial = () => {
    if (!user) return 'G';
    const name = user.user_metadata?.full_name || user.email || 'User';
    return name.charAt(0).toUpperCase();
  };

  const getSubscriptionDisplay = () => {
    if (!user) return t('tier.notLoggedIn');
    switch (subscriptionTier) {
      case 'pro': return t('tier.pro');
      case 'power': return t('tier.power');
      default: return t('tier.free');
    }
  };

  return (
    <div className="flex h-screen w-full bg-paper text-ink overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-paleslate border-r border-ink/10">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Image src="/Resonate-Logo.png" alt="Resonate Logo" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg tracking-tight text-azure">Resonate</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as PageView)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 group ${isActive
                  ? 'bg-white text-azure shadow-sm ring-1 ring-ink/5'
                  : 'text-ink/60 hover:bg-white/60 hover:text-ink'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-azure' : 'text-ink/60 group-hover:text-ink'} />
                {t(item.id)}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink/5">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink/60 hover:bg-white/60 hover:text-ink transition-colors"
          >
            <LogOut size={18} />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex flex-1 flex-col overflow-hidden relative ${['personas', 'history', 'analytics', 'memory'].includes(activePage) ? 'bg-paleslate' : 'bg-paper'}`}>
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-ink/5 bg-paper px-4 md:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-ink/60 hover:text-ink">
              <Menu size={20} />
            </button>
            <span className="font-bold text-azure">Resonate</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-azure"></div>
            <h2 className="text-xs font-bold text-ink/50 uppercase tracking-widest">{t(activePage as any)}</h2>
          </div>

          <div className="flex items-center gap-4">
            {isLoadingProfile ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="text-right hidden sm:block">
                  <div className="h-4 w-32 bg-ink/10 rounded mb-1"></div>
                  <div className="h-3 w-16 bg-ink/10 rounded ml-auto"></div>
                </div>
                <div className="h-9 w-9 rounded-full bg-ink/10 box-border border border-ink/5"></div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-ink">{getUserDisplayName()}</p>
                  <p className="text-[10px] text-azure font-bold uppercase tracking-wider">
                    {getSubscriptionDisplay()}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-paleslate border border-ink/10 text-azure flex items-center justify-center font-bold overflow-hidden relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getUserInitial()
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-ink/20 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="h-full w-64 bg-paleslate p-4 border-r border-ink/10 shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-8 px-2">
                <Image src="/Resonate-Logo.png" alt="Resonate Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg text-azure">Resonate</span>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${activePage === item.id ? 'bg-white text-azure shadow-sm' : 'text-ink/60 hover:text-ink'
                      }`}
                  >
                    <item.icon size={18} />
                    {t(item.id)}
                  </button>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-ink/5">
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-ink/60 hover:text-ink hover:bg-white/60 transition-colors"
                >
                  <LogOut size={18} />
                  {t('signOut')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
