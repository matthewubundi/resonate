import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  FileEdit, 
  BarChart3, 
  Brain, 
  Users, 
  Settings, 
  Menu,
  LogOut,
  Cpu
} from 'lucide-react';
import { NavItem, PageView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: PageView;
  onNavigate: (page: PageView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transform', label: 'Transform Text', icon: Sparkles },
  { id: 'editor', label: 'Identity Editor', icon: FileEdit },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'memory', label: 'Memory & Context', icon: Brain },
  { id: 'personas', label: 'Personas', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ 
  children, activePage, onNavigate
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full bg-paper text-ink overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-paleslate border-r border-ink/10">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-azure flex items-center justify-center shadow-sm">
              <Cpu size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-ink">Identity<span className="text-azure">Preserver</span></span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white text-azure shadow-sm ring-1 ring-ink/5' 
                    : 'text-ink/60 hover:bg-white/60 hover:text-ink'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-azure' : 'text-ink/60 group-hover:text-ink'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink/5">
           <button 
             onClick={() => onNavigate('landing')}
             className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink/60 hover:bg-white/60 hover:text-ink transition-colors"
           >
             <LogOut size={18} />
             Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-paper relative">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-ink/5 bg-paper px-4 md:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-ink/60 hover:text-ink">
              <Menu size={20} />
            </button>
            <span className="font-bold text-ink">Identity Preserver</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-azure"></div>
            <h2 className="text-xs font-bold text-ink/50 uppercase tracking-widest">{activePage}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-ink">System Admin</p>
                <p className="text-[10px] text-azure font-bold uppercase tracking-wider">Online</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-paleslate border border-ink/10 text-azure flex items-center justify-center font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-ink/20 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="h-full w-64 bg-paleslate p-4 border-r border-ink/10 shadow-xl" onClick={e => e.stopPropagation()}>
               <div className="flex items-center gap-2 mb-8 px-2">
                 <div className="h-8 w-8 rounded bg-azure text-white flex items-center justify-center font-bold"><Cpu size={18}/></div>
                 <span className="font-bold text-lg text-ink">Identity</span>
               </div>
               <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${
                       activePage === item.id ? 'bg-white text-azure shadow-sm' : 'text-ink/60 hover:text-ink'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </nav>
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