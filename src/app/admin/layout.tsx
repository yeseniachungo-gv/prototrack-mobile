// src/app/admin/layout.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // If user is not authenticated and not already on the login page, redirect them.
    if (!state.isAdminAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [state.isAdminAuthenticated, isLoginPage, router]);

  // If user is not authenticated and not on the login page, show a loader.
  // The login page should be rendered directly.
  if (!state.isAdminAuthenticated && !isLoginPage) {
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

  // If authenticated or on the login page, render the content.
  return <>{children}</>;
}
