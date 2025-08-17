// src/app/page.tsx (Página de Planilhas/Início)
"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Hub do Dia" />
      
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aqui ficará o resumo do dia com os principais KPIs e a lista de dias.
          </p>
          <div className="mt-4">
            <Button size="sm">+ Dia</Button>
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Funções</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A lista de funções do dia será exibida aqui.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
