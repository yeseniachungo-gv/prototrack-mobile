"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toast({ title: `Tema alterado para ${isDark ? 'escuro' : 'claro'}`});
  }
  
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Configurações" />

      <Card>
        <CardHeader><CardTitle>Aparência</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={toggleTheme}>Alternar Tema Claro/Escuro</Button>
        </CardContent>
      </Card>
    </div>
  );
}
