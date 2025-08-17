"use client";

import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';

export default function HomePage() {
  const { state } = useAppContext();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Planilhas" />
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao ProtoTrack</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Estamos prontos para começar do zero. A base da aplicação está limpa e funcional.
          </p>
          <p className="mt-4">O tema atual é: <b>{state.theme}</b></p>
        </CardContent>
      </Card>
    </div>
  );
}
