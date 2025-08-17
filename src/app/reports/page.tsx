// src/app/reports/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookCheck, CalendarRange, WifiOff } from 'lucide-react';
import type { Day } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { generateDailyReport, GenerateDailyReportOutput } from '@/ai/flows/generate-daily-report';
import { generateWeeklyReport, GenerateWeeklyReportOutput } from '@/ai/flows/generate-weekly-report';
import { generateMonthlyReport, GenerateMonthlyReportOutput } from '@/ai/flows/generate-monthly-report';
import ReportDialog from '@/components/ReportDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Types and Helper Functions ---
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

// Production Trend Chart Component
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


// Main Reports Page Component
export default function ReportsPage() {
  const { state, activeProfile } = useAppContext();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<GenerateDailyReportOutput | GenerateWeeklyReportOutput | GenerateMonthlyReportOutput | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportSummary, setReportSummary] = useState('');
  const [reportSections, setReportSections] = useState<{title: string, content: string}[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7d');
  const [isOnline, setIsOnline] = useState(true);

  const hasProPlan = state.plan === 'pro' || state.plan === 'premium';

  React.useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // --- Action Handlers ---

  const handleGenerateReport = async (type: 'daily' | 'weekly' | 'monthly') => {
    if (!isOnline) {
      toast({ title: 'Funcionalidade offline', description: 'A geração de relatórios requer conexão com a internet.', variant: 'destructive'});
      return;
    }
    if (!activeProfile) return;
    
    setIsGenerating(true);
    try {
      let report;
      if (type === 'daily') {
        const activeDay = activeProfile.days.find(d => d.id === activeProfile.activeDayId);
        if (!activeDay) {
          toast({ title: 'Nenhum dia ativo selecionado', description: "Vá para o dashboard e selecione um dia.", variant: 'destructive' });
          setIsGenerating(false);
          return;
        }
        const goalFunction = activeDay.functions.find(f => f.id === activeProfile.dailyGoal.functionId);
        report = await generateDailyReport({
          productionData: JSON.stringify(activeDay.functions),
          dailyGoal: JSON.stringify({
            target: activeProfile.dailyGoal.target,
            functionName: goalFunction?.name || 'N/A'
          })
        });
        setReportTitle(report.reportTitle);
        setReportSummary(report.summary);
        setReportSections([
          { title: 'Análise de Desempenho', content: report.performanceAnalysis },
          { title: 'Análise de Paradas', content: report.stoppageAnalysis },
          { title: 'Análise da Meta', content: report.goalAnalysis },
          { title: 'Recomendações', content: report.recommendations },
        ]);

      } else if (type === 'weekly') {
        const today = new Date();
        const start = startOfWeek(today, { locale: ptBR });
        const end = endOfWeek(today, { locale: ptBR });
        const weekDays = activeProfile.days.filter(d => {
            const dayDate = parseISO(d.id);
            return dayDate >= start && dayDate <= end;
        });
        if (weekDays.length === 0) {
            toast({ title: 'Sem dados na semana', description: 'Não há dados de produção nesta semana para gerar um relatório.', variant: 'destructive' });
            setIsGenerating(false);
            return;
        }
        report = await generateWeeklyReport({
            productionData: JSON.stringify(weekDays.map(d => ({id: d.id, functions: d.functions}))),
            weekPeriod: `${format(start, 'dd/MM')} a ${format(end, 'dd/MM')}`
        });
        setReportTitle(report.reportTitle);
        setReportSummary(report.summary);
        setReportSections([
          { title: 'Desempenho por Dia', content: report.performanceByDay },
          { title: 'Análise de Paradas', content: report.stoppageAnalysis },
          { title: 'Recomendações', content: report.recommendations },
        ]);
      } else if (type === 'monthly') {
          const today = new Date();
          const start = startOfMonth(today);
          const end = endOfMonth(today);
          const monthDays = activeProfile.days.filter(d => {
            const dayDate = parseISO(d.id);
            return dayDate >= start && dayDate <= end;
          });
          if (monthDays.length === 0) {
            toast({ title: 'Sem dados no mês', description: 'Não há dados de produção neste mês para gerar um relatório.', variant: 'destructive' });
            setIsGenerating(false);
            return;
          }
          report = await generateMonthlyReport({
              productionData: JSON.stringify(monthDays.map(d => ({id: d.id, functions: d.functions}))),
              monthName: format(today, 'MMMM de yyyy', { locale: ptBR })
          });
          setReportTitle(report.reportTitle);
          setReportSummary(report.summary);
          setReportSections([
              { title: 'Tendência de Desempenho', content: report.performanceTrend },
              { title: 'Análise de Paradas', content: report.stoppageAnalysis },
              { title: 'Recomendações Estratégicas', content: report.recommendations },
          ]);
      }
      setIsReportOpen(true);
    } catch(err) {
      console.error(`Erro ao gerar relatório de ${type}`, err);
      toast({ title: 'Erro ao gerar relatório', description: 'Não foi possível se conectar com o serviço de análise.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderReportDialog = () => {
    if (!isReportOpen) return null;

    return <ReportDialog
        title={reportTitle}
        summary={reportSummary}
        sections={reportSections}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
    />
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Relatórios & Análises" />
      
      <Card>
        <CardHeader>
          <CardTitle>Análises Automáticas</CardTitle>
          <CardDescription>
            Gere resumos e análises a partir dos dados de produção.
            {!isOnline && <span className="text-amber-500 block mt-1"> (Requer Internet)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => handleGenerateReport('daily')} disabled={!activeProfile?.activeDayId || isGenerating || !isOnline}>
            {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : !isOnline ? <WifiOff className="mr-2"/> : <BookCheck className="mr-2" />}
            Resumo do Dia
          </Button>
           <Button onClick={() => handleGenerateReport('weekly')} disabled={isGenerating || !isOnline}>
            {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : !isOnline ? <WifiOff className="mr-2"/> : <BookCheck className="mr-2" />}
            Resumo da Semana
          </Button>
           <Button onClick={() => handleGenerateReport('monthly')} disabled={isGenerating || !isOnline || !hasProPlan} title={!hasProPlan ? "Disponível no plano Pro e Premium" : ""}>
            {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : !isOnline ? <WifiOff className="mr-2"/> : <BookCheck className="mr-2" />}
            Resumo do Mês
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                 <div>
                    <CardTitle>Tendência de Produção</CardTitle>
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

      {renderReportDialog()}

    </div>
  );
}
