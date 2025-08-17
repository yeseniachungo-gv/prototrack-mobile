// src/components/BottomNav.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Timer, FileDown, Settings, LayoutGrid, MessageSquare, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Planilha', icon: Home, plans: ['basic', 'pro', 'premium'] },
  { href: '/stopwatch', label: 'Cronômetro', icon: Timer, plans: ['basic', 'pro', 'premium'] },
  { href: '/announcements', label: 'Mural', icon: MessageSquare, plans: ['pro', 'premium'] },
  { href: '/reports', label: 'Relatórios', icon: FileDown, plans: ['basic', 'pro', 'premium'] },
  { href: '/settings', label: 'Config.', icon: Settings, plans: ['basic', 'pro', 'premium'] },
];

const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Shield, plans: ['basic', 'pro', 'premium'] },
    { href: '/admin/settings', label: 'Config.', icon: Settings, plans: ['basic', 'pro', 'premium'] },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { state, dispatch } = useAppContext();
  const router = useRouter();

  const isSelectionOrLoginPage = pathname === '/' || pathname.endsWith('/login') || pathname.startsWith('/subscribe');
  
  if (isSelectionOrLoginPage) {
    return null;
  }
  
  const handleLogout = () => {
    dispatch({ type: 'ADMIN_LOGIN', payload: false });
    dispatch({ type: 'SET_ACTIVE_PROFILE', payload: null });
    router.push('/');
  };

  const currentNavItems = state.isAdminAuthenticated ? adminNavItems : navItems.filter(item => item.plans.includes(state.plan));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-4xl border-t bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-around">
        <button onClick={handleLogout} className={cn("flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary w-20 text-center")}>
            <LayoutGrid className="h-6 w-6" />
            <span className="text-xs font-bold">
                Perfis
            </span>
        </button>
        {currentNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary w-20 text-center", isActive && 'text-primary')}>
              <item.icon className={cn('h-6 w-6', isActive && 'text-primary')} />
              <span className={cn('text-xs font-bold', isActive && 'text-primary')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
