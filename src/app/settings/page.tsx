"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  const handleComingSoon = (feature: string) => {
      toast({ title: "Funcionalidade em breve!", description: `${feature} ainda não está implementado.` });
  };
  
  const setTheme = (theme: 'light' | 'dark' | 'auto') => {
      if(theme === 'auto') {
          document.documentElement.removeAttribute('data-theme');
          localStorage.removeItem('gt:theme');
      } else {
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('gt:theme', theme);
      }
      // This is a mock. The actual theme switching logic is in AppWrapper or a theme context
      // for a real application to avoid re-renders of the whole page.
      // For this prototype, we'll just show a toast.
      toast({ title: "Tema Alterado", description: `O tema foi alterado para ${theme}`});
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Configurações" />

      <Card>
        <CardHeader><CardTitle>Aparência</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => setTheme('light')}>Tema claro</Button>
          <Button onClick={() => setTheme('dark')}>Tema escuro</Button>
          <Button onClick={() => setTheme('auto')}>Automático</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Perfis (estilo Netflix)</CardTitle>
            <p className="text-muted-foreground">Gerencie perfis (PIN opcional). Limites por plano: 3/6/10.</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => handleComingSoon('Adicionar perfil')}>+ Adicionar perfil</Button>
            <Button onClick={() => handleComingSoon('Editar perfil')}>Editar</Button>
            <Button onClick={() => handleComingSoon('Excluir perfil')}>Excluir</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <p className="text-muted-foreground">Senhas do administrador somente aqui. Perfis não podem alterar.</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => handleComingSoon('Alterar senha')}>Alterar senha admin</Button>
            <Button onClick={() => handleComingSoon('Encerrar sessões')}>Encerrar sessões</Button>
        </CardContent>
      </Card>

    </div>
  );
}
