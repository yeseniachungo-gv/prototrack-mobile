"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StopwatchPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Cronômetro de Produção" />
      <Card>
        <CardHeader>
          <CardTitle>Cronômetro</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A funcionalidade de cronômetro será implementada aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
