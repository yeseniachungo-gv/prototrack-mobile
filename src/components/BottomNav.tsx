"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Timer, FileDown, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Planilhas', icon: Home },
  { href: '/stopwatch', label: 'Cronômetro', icon: Timer },
  { href: '/reports', label: 'Exportar', icon: FileDown },
  { href: '/settings', label: 'Config.', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-4xl border-t bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary w-24", isActive && 'text-primary')}>
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
