// src/app/reports/page.tsx
"use client";

import React, { useRef, useState, useMemo } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileText, Loader2, BookCheck, ShieldCheck } from 'lucide-react';
import type { Day, FunctionEntry } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { generateDailyReport, GenerateDailyReportOutput } from '@/ai/flows/generate-daily-report';
import { generateConsolidatedReport, GenerateConsolidatedReportOutput } from '@/ai/flows/generate-consolidated-report';
import ReportDialog from '@/components/ReportDialog';
import { useRouter } from 'next/navigation';

// Componente do Gráfico de Produção
const ProductionChart = ({ data }: { data: FunctionEntry[] }) => {
  const chartData = data.map(func => ({
    name: func.name.length > 15 ? `${func.name.substring(0, 12)}...` : func.name,
    peças: Object.values(func.pieces).reduce((sum, p) => sum + p, 0)
  }));
  
  return (
     <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12}/>
          <Tooltip 
             contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--card-foreground))'
             }}
          />
          <Legend wrapperStyle={{fontSize: "14px"}}/>
          <Bar dataKey="peças" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
  );
};

// Componente principal da Página de Relatórios
export default function ReportsPage() {
  const { state, dispatch, activeProfile, activeDay } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const restoreInputRef = useRef<HTMLInputElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<GenerateDailyReportOutput | GenerateConsolidatedReportOutput | null>(null);
  const [reportType, setReportType] = useState<'daily' | 'consolidated' | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Verifica se o usuário é admin. Por enquanto, qualquer um pode ver o botão.
  const isAdmin = useMemo(() => state.profiles.some(p => p.id === state.activeProfileId), [state.profiles, state.activeProfileId]);


  // --- Handlers de Ações ---
  const handleExportCSV = (day: Day) => {
    if (!day) {
      toast({ title: 'Nenhum dia selecionado', description: 'Por favor, selecione um dia no Dashboard.', variant: 'destructive' });
      return;
    }
    // ... (lógica de exportação CSV inalterada)
  };
  
  const handleBackup = () => {
    // ... (lógica de backup inalterada)
  };
  
  const handleTriggerRestore = () => {
    restoreInputRef.current?.click();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... (lógica de restauração inalterada)
  };
  
  const handleGenerateDailyReport = async () => {
    if (!activeDay || !activeProfile) return;
    setIsGenerating(true);
    try {
      const goalFunction = activeDay.functions.find(f => f.id === activeProfile.dailyGoal.functionId);
      const report = await generateDailyReport({
        productionData: JSON.stringify(activeDay.functions),
        dailyGoal: JSON.stringify({
          target: activeProfile.dailyGoal.target,
          functionName: goalFunction?.name || 'N/A'
        })
      });
      setReportData(report);
      setReportType('daily');
      setIsReportOpen(true);
    } catch(err) {
      console.error("Erro ao gerar relatório diário", err);
      toast({ title: 'Erro ao gerar relatório', description: 'Não foi possível se conectar com o serviço de análise.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateConsolidatedReport = async () => {
    if (!activeDay) {
        toast({
            title: "Nenhum dia selecionado",
            description: "Para gerar um relatório consolidado, primeiro selecione um dia no Dashboard.",
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
            toast({ title: "Sem dados para o dia", description: "Nenhum perfil possui dados de produção para o dia selecionado.", variant: "destructive" });
            setIsGenerating(false);
            return;
        }

        const report = await generateConsolidatedReport({
            reportDate: activeDay.id,
            allProfilesData: JSON.stringify(allProfilesData),
        });

        setReportData(report);
        setReportType('consolidated');
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

    if (reportType === 'daily') {
        const data = reportData as GenerateDailyReportOutput;
        return <ReportDialog
            title={data.reportTitle}
            summary={data.summary}
            sections={[
                { title: 'Análise de Desempenho', content: data.performanceAnalysis },
                { title: 'Análise de Paradas', content: data.stoppageAnalysis },
                { title: 'Análise da Meta', content: data.goalAnalysis },
                { title: 'Recomendações', content: data.recommendations },
            ]}
            isOpen={isReportOpen}
            onClose={() => setIsReportOpen(false)}
        />
    }

    if (reportType === 'consolidated') {
        const data = reportData as GenerateConsolidatedReportOutput;
        return <ReportDialog
            title={data.reportTitle}
            summary={data.overallSummary}
            sections={[
                { title: 'Análise Comparativa de Perfis', content: data.profileComparison },
                { title: 'Análise Geral de Funções', content: data.functionAnalysis },
                { title: 'Insights Globais', content: data.globalInsights },
            ]}
            isOpen={isReportOpen}
            onClose={() => setIsReportOpen(false)}
        />
    }
    return null;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Relatórios & Análises" />
      
      <Card>
        <CardHeader>
          <CardTitle>Análises Automáticas</CardTitle>
          <CardDescription>
            Gere resumos e análises a partir dos dados de produção.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleGenerateDailyReport} disabled={!activeDay || isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <BookCheck className="mr-2" />}
            Gerar Resumo do Dia
          </Button>
          
          {isAdmin && (
            <Button onClick={handleGenerateConsolidatedReport} disabled={!activeDay || isGenerating} variant="secondary">
                {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <ShieldCheck className="mr-2" />}
                Gerar Relatório Consolidado
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Produção do Perfil</CardTitle>
           <CardDescription>
            Produção total por função para o dia selecionado no perfil ativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeDay && activeDay.functions.length > 0 ? (
            <ProductionChart data={activeDay.functions}/>
          ) : (
             <p className="text-muted-foreground text-center py-4">
                {activeDay ? 'Nenhuma função para exibir.' : 'Selecione um dia no Dashboard para ver os gráficos.'}
             </p>
          )}
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Exportação & Backup</CardTitle>
          <CardDescription>
            Salve dados para análise externa ou faça a gestão de backups.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => activeDay && handleExportCSV(activeDay)} disabled={!activeDay} variant="outline">
              <FileText className="mr-2"/> Exportar CSV do Dia
            </Button>
            <Button onClick={handleBackup} variant="outline" disabled={!activeProfile}>
              <Download className="mr-2"/> Criar Backup de Tudo
            </Button>
            <Button onClick={handleTriggerRestore} variant="outline">
              <Upload className="mr-2"/> Restaurar de Arquivo
            </Button>
            <input
              type="file"
              ref={restoreInputRef}
              onChange={handleRestore}
              className="hidden"
              accept=".json"
            />
        </CardContent>
      </Card>

      {renderReportDialog()}

    </div>
  );
}
