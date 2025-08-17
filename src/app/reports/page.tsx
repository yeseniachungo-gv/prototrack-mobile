// src/app/reports/page.tsx
"use client";

import React, { useRef, useState, useMemo } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileText, Loader2, BookCheck, ShieldCheck, CalendarRange } from 'lucide-react';
import type { Day, FunctionEntry } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { generateDailyReport, GenerateDailyReportOutput } from '@/ai/flows/generate-daily-report';
import { generateConsolidatedReport, GenerateConsolidatedReportOutput } from '@/ai/flows/generate-consolidated-report';
import ReportDialog from '@/components/ReportDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, format, parseISO } from 'date-fns';

// --- Tipos e Funções Auxiliares ---
type Period = '7d' | '14d' | '30d' | 'all';

const getPeriodLabel = (period: Period) => {
  switch (period) {
    case '7d': return 'Últimos 7 dias';
    case '14d': return 'Últimos 14 dias';
    case '30d': return 'Últimos 30 dias';
    case 'all': return 'Todo o período';
    default: return 'Selecione um período';
  }
};

// Componente do Gráfico de Produção por Tendência
const ProductionTrendChart = ({ days }: { days: Day[] }) => {
  const chartData = days.map(day => {
    const totalPieces = day.functions.reduce((total, func) => {
      return total + Object.values(func.pieces).reduce((sum, p) => sum + p, 0);
    }, 0);
    return {
      date: format(parseISO(day.id), 'dd/MM'),
      peças: totalPieces,
    };
  }).filter(d => d.peças > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--card-foreground))'
          }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Legend wrapperStyle={{ fontSize: "14px" }} />
        <Bar dataKey="peças" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};


// Componente principal da Página de Relatórios
export default function ReportsPage() {
  const { state, dispatch, activeProfile } = useAppContext();
  const { toast } = useToast();
  const restoreInputRef = useRef<HTMLInputElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<GenerateDailyReportOutput | GenerateConsolidatedReportOutput | null>(null);
  const [reportType, setReportType] = useState<'daily' | 'consolidated' | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7d');

  const filteredDays = useMemo(() => {
    if (!activeProfile) return [];
    
    const endDate = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case '7d': startDate = subDays(endDate, 7); break;
      case '14d': startDate = subDays(endDate, 14); break;
      case '30d': startDate = subDays(endDate, 30); break;
      case 'all': return activeProfile.days.slice().sort((a,b) => new Date(a.id).getTime() - new Date(b.id).getTime());
    }
    
    return activeProfile.days
      .filter(day => {
        const dayDate = parseISO(day.id);
        return dayDate >= startDate && dayDate <= endDate;
      })
      .sort((a,b) => new Date(a.id).getTime() - new Date(b.id).getTime());

  }, [activeProfile, selectedPeriod]);

  // --- Handlers de Ações ---
  const handleExportCSV = (day: Day) => {
    if (!day) return;
    let csvContent = "data:text/csv;charset=utf-8,Função,Trabalhador,Hora,Peças,Motivo Observação,Detalhe Observação,Minutos Parados\n";
    
    day.functions.forEach(f => {
      f.workers.forEach(w => {
        f.hours.forEach(h => {
          const piecesKey = `${w}_${h}`;
          const pieces = f.pieces[piecesKey] || 0;
          const obs = f.observations[piecesKey];
          csvContent += `"${f.name}","${w}","${h}","${pieces}","${obs?.reason || ''}","${obs?.detail || ''}","${obs?.minutesStopped || 0}"\n`;
        });
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${activeProfile?.name}_${day.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleBackup = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const link = document.createElement("a");
      link.setAttribute("href", dataUri);
      link.setAttribute("download", `giratempo_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: 'Backup criado com sucesso!' });
    } catch(err) {
      console.error("Erro ao criar backup:", err);
      toast({ title: 'Erro ao criar backup.', variant: 'destructive'});
    }
  };
  
  const handleTriggerRestore = () => {
    restoreInputRef.current?.click();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const restoredState = JSON.parse(e.target?.result as string);
          dispatch({ type: 'SET_STATE', payload: restoredState });
          toast({ title: 'Restauração concluída!', description: 'O estado da aplicação foi restaurado. A página será recarregada.' });
          setTimeout(() => window.location.reload(), 2000);
        } catch(err) {
          toast({ title: 'Arquivo de backup inválido.', variant: 'destructive'});
        }
      };
      reader.readAsText(file);
    }
  };
  
  const handleGenerateDailyReport = async () => {
    const activeDay = activeProfile?.days.find(d => d.id === activeProfile.activeDayId);
    if (!activeDay || !activeProfile) {
        toast({ title: 'Nenhum dia ativo selecionado', variant: 'destructive' });
        return;
    }
    
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
            Gere resumos e análises a partir dos dados de produção do dia selecionado no dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleGenerateDailyReport} disabled={!activeProfile?.activeDayId || isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <BookCheck className="mr-2" />}
            Gerar Resumo do Dia (Perfil Atual)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                 <div>
                    <CardTitle>Tendência de Produção do Perfil</CardTitle>
                    <CardDescription>
                        Produção total por dia para o perfil ativo no período selecionado.
                    </CardDescription>
                 </div>
                 <div className="w-full sm:w-auto">
                    <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as Period)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                             <CalendarRange className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Últimos 7 dias</SelectItem>
                            <SelectItem value="14d">Últimos 14 dias</SelectItem>
                            <SelectItem value="30d">Últimos 30 dias</SelectItem>
                            <SelectItem value="all">Todo o período</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>
        </CardHeader>
        <CardContent>
          {filteredDays.length > 0 ? (
            <ProductionTrendChart days={filteredDays} />
          ) : (
             <p className="text-muted-foreground text-center py-4">
                {activeProfile ? `Nenhum dado de produção encontrado para "${getPeriodLabel(selectedPeriod)}".` : 'Selecione um perfil para ver os gráficos.'}
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
            <Button onClick={() => {
                const day = activeProfile?.days.find(d => d.id === activeProfile.activeDayId);
                if (day) handleExportCSV(day);
            }} disabled={!activeProfile?.activeDayId} variant="outline">
              <FileText className="mr-2"/> Exportar CSV do Dia Ativo
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
