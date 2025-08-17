// src/app/admin/page.tsx
"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AdminProductionChart = () => {
    const { state, activeDay } = useAppContext();

    if (!activeDay) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Selecione um dia no Dashboard para visualizar os dados.
            </div>
        );
    }

    const chartData = state.profiles.map(profile => {
        const dayData = profile.days.find(d => d.id === activeDay.id);
        const totalPieces = dayData 
            ? dayData.functions.reduce((total, func) => total + Object.values(func.pieces).reduce((sum, p) => sum + p, 0), 0)
            : 0;
        
        return {
            name: profile.name,
            produção: totalPieces
        };
    }).filter(d => d.produção > 0);

    if (chartData.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Nenhum dado de produção encontrado para este dia.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--card-foreground))'
                    }}
                />
                <Legend wrapperStyle={{fontSize: "14px"}}/>
                <Bar dataKey="produção" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};


export default function AdminPage() {

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Painel do Administrador" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="text-primary" /> Análise Comparativa de Perfis
              </CardTitle>
              <CardDescription>
                Visualize a produção total de cada perfil para o dia selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <AdminProductionChart />
            </CardContent>
          </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Gestão de Perfis</CardTitle>
                <CardDescription>
                    Ative ou desative perfis, redefina PINs de acesso e gerencie permissões.
                </CardDescription>
            </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">
              Acesse as <Link href="/settings" className="text-primary underline">Configurações</Link> para editar nomes e PINs de perfis individuais. A gestão centralizada estará disponível em breve.
            </p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Relatórios Consolidados</CardTitle>
                <CardDescription>
                    Gere análises detalhadas combinando os dados de todos os perfis.
                </CardDescription>
            </CardHeader>
           <CardContent>
            <p className="text-muted-foreground">
              Acesse a aba <Link href="/reports" className="text-primary underline">Relatórios</Link> para gerar análises consolidadas e individuais.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
