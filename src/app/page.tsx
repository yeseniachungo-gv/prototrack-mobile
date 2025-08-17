"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            Aqui ficará o resumo do dia com os principais KPIs.
          </p>
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
