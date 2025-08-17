// src/app/dashboard/layout.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeProfile } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // If there is no active profile, redirect to the selection screen
    if (!activeProfile) {
      router.replace('/');
    }
  }, [activeProfile, router]);

  if (!activeProfile) {
    // Shows a loader or a message while redirecting
    return (
        <div className="flex items-center justify-center min-h-screen">
             <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">Carregando perfil...</p>
                    <Button onClick={() => router.push('/')} className="mt-4 w-full">
                        Voltar para a seleção
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  // If there is an active profile, render the dashboard content
  return <>{children}</>;
}
