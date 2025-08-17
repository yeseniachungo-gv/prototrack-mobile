"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Relatórios & Exportar" />
      <Card>
        <CardHeader>
          <CardTitle>Exportação</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button>Exportar CSV</Button>
            <Button>Exportar XLSX</Button>
            <Button>Exportar PDF</Button>
            <Button>Imprimir</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Os gráficos de relatórios (produção, rankings, etc.) serão implementados aqui.</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button>Backup</Button>
            <Button>Restaurar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
