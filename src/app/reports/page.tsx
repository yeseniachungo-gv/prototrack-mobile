"use client";

import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
  const { toast } = useToast();

  const handleComingSoon = (feature: string) => {
    toast({ title: "Funcionalidade em breve!", description: `${feature} ainda não está implementado.` });
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Exportar & Relatórios" />
      <Card>
        <CardHeader>
          <CardTitle>Exportar dados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => handleComingSoon('Exportar CSV')}>CSV</Button>
          <Button onClick={() => handleComingSoon('Exportar Excel')}>Excel</Button>
          <Button onClick={() => handleComingSoon('Exportar PDF')}>PDF</Button>
          <Button onClick={() => handleComingSoon('Imprimir')}>Imprimir</Button>
          <Button onClick={() => handleComingSoon('Backup')}>Backup</Button>
          <Button onClick={() => handleComingSoon('Restaurar')}>Restaurar</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Relatórios rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Produção por função</li>
            <li>Produção por operador</li>
            <li>Comparativo de dias</li>
            <li>Ranking por função</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
