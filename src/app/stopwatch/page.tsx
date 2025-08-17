"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StopwatchPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Cronômetro" />
      <Card>
        <CardHeader>
          <CardTitle>Relógio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">O relógio grande e os controles do cronômetro serão implementados aqui.</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A tabela com o histórico de medições do dia aparecerá aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
