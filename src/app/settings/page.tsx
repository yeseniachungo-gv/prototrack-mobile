"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';

export default function SettingsPage() {
  const { toast } = useToast();
  const { state, dispatch } = useAppContext();
  
  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
    toast({ title: `Tema alterado para ${state.theme === 'dark' ? 'claro' : 'escuro'}`});
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Configurações" />

      <Card>
        <CardHeader><CardTitle>Aparência</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={toggleTheme}>
            Mudar para tema {state.theme === 'dark' ? 'Claro' : 'Escuro'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>AI</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <p className="text-muted-foreground w-full mb-2">As funcionalidades de IA serão implementadas aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
