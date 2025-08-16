"use client";

import React, { useEffect } from 'react';
import { AppProvider } from "@/contexts/AppContext";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import { Button } from './ui/button';
import { Moon, Sun } from 'lucide-react';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };
  
  return (
    <AppProvider>
      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col font-body">
        <header className="sticky top-0 z-10 flex items-center gap-3 p-3 bg-transparent backdrop-blur-sm">
            <div className="flex items-center gap-2 font-bold">
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-cyan-400 text-black font-black text-sm shadow-sm">
                    GT
                </div>
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
    </AppProvider>
  );
}
