// src/app/admin/page.tsx
"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, BarChart2, Loader2, BookCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import type { Day, Profile } from '@/lib/types';
import { generateConsolidatedReport, GenerateConsolidatedReportOutput } from '@/ai/flows/generate-consolidated-report';
import ReportDialog from '@/components/ReportDialog'; // Reutilizando o dialog de relatório

export default function AdminPage() {
  const { state, activeDay } = useAppContext(); // Pegando o dia ativo globalmente para o exemplo
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<GenerateConsolidatedReportOutput | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleGenerateReport = async () => {
    if (!activeDay) {
        toast({
            title: "Nenhum dia selecionado",
            description: "Por favor, selecione um dia em qualquer perfil para gerar um relatório consolidado.",
            variant: "destructive"
        });
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
            toast({
                title: "Sem dados para o dia",
                description: "Nenhum perfil possui dados de produção para o dia selecionado.",
                variant: "destructive"
            });
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
            <CardTitle className="flex items-center gap-2"><BarChart2 /> Relatórios Consolidados</CardTitle>
            <CardDescription>
                Gere um relatório consolidado com a análise de todos os perfis para o dia selecionado no app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <BookCheck className="mr-2" />}
              {isGenerating ? 'Analisando...' : `Gerar Relatório Consolidado`}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
                O relatório será gerado para o dia que está ativo em sua visão de planilhas.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {reportData && (
        <ReportDialog
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
      )}

    </div>
  );
}
