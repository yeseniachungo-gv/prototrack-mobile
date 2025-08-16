"use client";

import React, { useEffect } from 'react';
import { AppProvider } from "@/contexts/AppContext";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import { Button } from './ui/button';

// A simple mock for theme toggling
const useTheme = () => {
    const [theme, setTheme] = React.useState('light');

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('gt:theme', newTheme);
        setTheme(newTheme);
    }
    
    useEffect(() => {
        const savedTheme = localStorage.getItem('gt:theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            setTheme(savedTheme);
        } else {
             document.documentElement.removeAttribute('data-theme');
        }
    }, [])
    
    return { theme, toggleTheme };
}


export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { toggleTheme } = useTheme();
  
  return (
    <AppProvider>
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col border-x bg-background font-body">
        <header className="sticky top-0 z-10 flex items-center gap-3 p-3 bg-background/95 backdrop-blur-sm border-b">
            <div className="flex items-center gap-2 font-bold">
                <div className="grid place-items-center w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-sm">
                    GT
                </div>
                <span>GiraTempo</span>
            </div>
            <div className="flex-1"></div>
            <Button size="sm" onClick={toggleTheme} aria-label="Alternar tema">Tema</Button>
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
