// src/app/admin/page.tsx
"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Painel do Administrador" />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-primary" /> Acesso Total
          </CardTitle>
          <CardDescription>
            Esta é a sua central de controle. Apenas administradores podem ver esta página.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">
            Voltar para a <Link href="/" className="text-primary underline">seleção de perfis</Link>.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Gestão de Perfis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Em breve: Visualize e gerencie todos os perfis de encarregados. Redefina PINs de acesso, ative ou desative perfis.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart2 /> Dashboard Interativo</CardTitle>
            <CardDescription>
                Em breve: Gráficos e análises comparativas do desempenho de todos os perfis em tempo real. Os relatórios consolidados agora estão na aba "Relatórios".
            </CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-muted-foreground">
              Acesse a aba <Link href="/reports" className="text-primary underline">Relatórios</Link> para gerar análises consolidadas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
