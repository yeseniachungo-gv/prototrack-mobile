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
    // Se não houver perfil ativo, redireciona para a tela de seleção
    if (!activeProfile) {
      router.replace('/');
    }
  }, [activeProfile, router]);

  if (!activeProfile) {
    // Mostra um loader ou uma mensagem enquanto redireciona
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

  // Se houver um perfil ativo, renderiza o conteúdo do dashboard
  return <>{children}</>;
}
