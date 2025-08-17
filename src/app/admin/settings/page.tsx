// src/app/admin/settings/page.tsx
"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, LogOut } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
    const { dispatch } = useAppContext();
    const router = useRouter();
    const { toast } = useToast();

    // In a real app, this would be a more secure flow.
    const handleResetAdminPin = () => {
        // For this demo, we can just show the PIN or have a simplified reset.
        // As we don't have a way to securely change it, we'll just log out.
        toast({
            title: 'Funcionalidade Futura',
            description: 'Em uma aplicação real, aqui você poderia redefinir o PIN de administrador através de um processo seguro.'
        })
    }

    const handleLogout = () => {
        dispatch({ type: 'ADMIN_LOGIN', payload: false });
        router.push('/');
    }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Configurações do Admin" />
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound/> Segurança</CardTitle>
            <CardDescription>Gerencie as configurações de segurança do painel administrativo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button variant="outline" onClick={handleResetAdminPin}>
                Redefinir PIN do Administrador
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2" /> Sair do Painel
            </Button>
        </CardContent>
      </Card>

    </div>
  );
}
