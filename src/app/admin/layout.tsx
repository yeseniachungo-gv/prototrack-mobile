// src/app/admin/layout.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // If there is no active profile, redirect to the selection screen
    if (!state.isAdminAuthenticated) {
      router.replace('/admin/login');
    }
  }, [state.isAdminAuthenticated, router]);

  if (!state.isAdminAuthenticated) {
    // Shows a loader or a message while redirecting
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
             <Card>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" />
                    <p className="text-center text-muted-foreground">Verificando acesso...</p>
                    <Button onClick={() => router.push('/admin/login')} className="mt-4 w-full">
                        Ir para o Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  // If there is an active profile, render the dashboard content
  return <>{children}</>;
}
