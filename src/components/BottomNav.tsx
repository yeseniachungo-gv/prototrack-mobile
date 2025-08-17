"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Timer, FileDown, Settings, LogOut, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Planilhas', icon: Home },
  { href: '/stopwatch', label: 'Cronômetro', icon: Timer },
  { href: '/reports', label: 'Relatórios', icon: FileDown },
  { href: '/settings', label: 'Config.', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { dispatch } = useAppContext();
  const router = useRouter();

  if (pathname === '/') {
    return null;
  }

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch({ type: 'SET_ACTIVE_PROFILE', payload: null });
    router.push('/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-4xl border-t bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-around">
        <Link href="/" onClick={handleLogout} className={cn("flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary w-20 text-center")}>
            <LayoutGrid className="h-6 w-6" />
            <span className="text-xs font-bold">
                Perfis
            </span>
        </Link>
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
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
