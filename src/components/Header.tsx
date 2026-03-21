import { Shield, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ThemeToggle';
import SignOutDialog from '@/components/SignOutDialog';
import type { AppTab } from '@/pages/Index';

interface HeaderProps {
  activeTab: AppTab;
  onNavigate: (tab: AppTab) => void;
}

const Header = ({ activeTab, onNavigate }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { displayName, signOut } = useAuth();

  const navItems: { id: AppTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'analyzer', label: 'Analyzer' },
    { id: 'batch', label: 'Batch Analysis' },
    { id: 'livefeed', label: 'Live Feed' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'history', label: 'History' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-primary/40 transition-shadow duration-300">
                <Shield className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-tight">ToxiSense</h1>
              <p className="text-xs text-muted-foreground leading-tight">AI Content Safety</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === item.id
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => onNavigate('profile')}
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-200",
                activeTab === 'profile'
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <User className="w-3.5 h-3.5" />
              {displayName || 'Profile'}
            </button>
            <SignOutDialog onConfirm={signOut}>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <LogOut className="w-4 h-4" />
              </Button>
            </SignOutDialog>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 fade-in">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium text-left transition-all duration-200",
                    activeTab === item.id
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium text-left transition-all duration-200 flex items-center gap-2",
                  activeTab === 'profile'
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <SignOutDialog onConfirm={() => { signOut(); setMobileMenuOpen(false); }}>
                <button className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left text-destructive hover:bg-destructive/10 transition-all duration-200 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </SignOutDialog>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
