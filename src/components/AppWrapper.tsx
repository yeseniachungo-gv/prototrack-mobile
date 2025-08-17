// src/components/AppWrapper.tsx
"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import { Button } from './ui/button';
import { Moon, Sun, ArrowLeft } from 'lucide-react';

function AppContent({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };
  
  const showBackButton = !['/', '/admin', '/login'].some(p => pathname.startsWith(p));
  
  return (
    <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col font-body">
      <header className="sticky top-0 z-10 flex items-center gap-3 p-3 bg-transparent backdrop-blur-sm">
          <div className="flex items-center gap-2 font-bold">
            {showBackButton ? (
                <Button size="icon" variant="ghost" onClick={() => router.back()} aria-label="Voltar">
                    <ArrowLeft className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            ) : (
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-black text-sm shadow-sm">
                    GT
                </div>
            )}
            <span>GiraTempo</span>
          </div>
          <div className="flex-1"></div>
          <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label="Alternar tema">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <BottomNav />
      <Toaster />
    </div>
  );
}


export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppContent>{children}</AppContent>
    </AppProvider>
  )
}
