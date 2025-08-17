"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Relatórios & Exportar" />
      <Card>
        <CardHeader>
          <CardTitle>Exportar Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A funcionalidade de relatórios e exportação será implementada aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
