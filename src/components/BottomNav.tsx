"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Timer, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/stopwatch', label: 'Stopwatch', icon: Timer },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-lg border-t bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          // The Home route is just '/', so we need an exact match.
          // For other routes, we can check if the pathname starts with the href.
          const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary">
              <item.icon className={cn('h-6 w-6', isActive && 'text-primary')} />
              <span className={cn('text-xs font-medium', isActive && 'text-primary')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
