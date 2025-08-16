"use client";

import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleComingSoon = (feature: string) => {
    toast({ title: "Funcionalidade em breve!", description: `${feature} ainda não está implementado.` });
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Exportar & Relatórios" />
      <Card>
        <CardHeader>
          <CardTitle>Página de Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
         <p className="text-muted-foreground">A funcionalidade de exportação agora está na página principal. Esta página pode ser usada para relatórios avançados no futuro.</p>
         <Button onClick={() => router.push('/')}>Ir para o Cronômetro</Button>
        </CardContent>
      </Card>
    </div>
  );
}
