// src/app/admin/page.tsx
"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, BarChart2, Loader2, BookCheck } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ReportDialog from '@/components/ReportDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateConsolidatedReport, GenerateConsolidatedReportOutput } from '@/ai/flows/generate-consolidated-report';

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
  const { state, activeDay } = useAppContext();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<GenerateConsolidatedReportOutput | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleGenerateConsolidatedReport = async () => {
    if (!activeDay) {
        toast({ title: "Nenhum dia selecionado", description: "Vá para o dashboard de um perfil para selecionar um dia.", variant: "destructive" });
        return;
    }
    setIsGenerating(true);
    try {
        const allProfilesData = state.profiles.map(profile => {
            const dayData = profile.days.find(d => d.id === activeDay.id);
            return {
                profileName: profile.name,
                productionData: dayData ? dayData.functions : []
            };
        }).filter(p => p.productionData.length > 0);

        if (allProfilesData.length === 0) {
            toast({ title: "Sem dados para o dia", description: `Nenhum perfil registrou produção no dia ${activeDay.id}.`, variant: "destructive" });
            setIsGenerating(false);
            return;
        }

        const report = await generateConsolidatedReport({
            reportDate: activeDay.id,
            allProfilesData: JSON.stringify(allProfilesData),
        });

        setReportData(report);
        setIsReportOpen(true);
    } catch (err) {
        console.error("Erro ao gerar relatório consolidado:", err);
        toast({ title: 'Erro ao gerar relatório', description: 'Não foi possível se conectar com o serviço de análise.', variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  };

  const renderReportDialog = () => {
    if (!reportData) return null;
    return <ReportDialog
        title={reportData.reportTitle}
        summary={reportData.overallSummary}
        sections={[
            { title: 'Análise Comparativa de Perfis', content: reportData.profileComparison },
            { title: 'Análise Geral de Funções', content: reportData.functionAnalysis },
            { title: 'Insights Globais', content: reportData.globalInsights },
        ]}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
    />
  }


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
                Visualize a produção total de cada perfil para o dia selecionado no dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <AdminProductionChart />
            </CardContent>
          </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Gestão de Perfis e Acessos</CardTitle>
                <CardDescription>
                    Adicione ou remova perfis, altere nomes e redefina PINs de acesso.
                </CardDescription>
            </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">
              Acesse as <Link href="/settings" className="text-primary underline">Configurações</Link> para gerenciar todos os perfis.
            </p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Relatórios Consolidados</CardTitle>
                <CardDescription>
                    Gere análises detalhadas combinando os dados de todos os perfis para o dia selecionado.
                </CardDescription>
            </CardHeader>
           <CardContent>
            <Button onClick={handleGenerateConsolidatedReport} disabled={!activeDay || isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <BookCheck className="mr-2" />}
                Gerar Relatório Automático
            </Button>
          </CardContent>
        </Card>
      </div>

      {renderReportDialog()}
    </div>
  );
}
