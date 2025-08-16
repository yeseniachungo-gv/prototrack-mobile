"use client";

import { AppProvider } from "@/contexts/AppContext";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "@/components/ui/toaster";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="relative mx-auto flex h-screen max-w-lg flex-col border-x bg-background font-body">
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>
        <BottomNav />
        <Toaster />
      </div>
    </AppProvider>
  );
}
