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
import ReportDialog from '@/components/ReportDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, format, parseISO } from 'date-fns';

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
  const [reportData, setReportData] = useState<GenerateDailyReportOutput | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7d');
  const [isOnline, setIsOnline] = useState(true);

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

  const hasAI = state.plan === 'pro' || state.plan === 'premium';

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
  const handleGenerateDailyReport = async () => {
    if (!isOnline) {
      toast({ title: 'Funcionalidade offline', description: 'A geração de relatórios por IA requer conexão com a internet.', variant: 'destructive'});
      return;
    }
    const activeDay = activeProfile?.days.find(d => d.id === activeProfile.activeDayId);
    if (!activeDay || !activeProfile) {
        toast({ title: 'Nenhum dia ativo selecionado', description: "Vá para o dashboard e selecione um dia.", variant: 'destructive' });
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

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Relatórios & Análises" />
      
      <Card>
        <CardHeader>
          <CardTitle>Análises Automáticas</CardTitle>
          <CardDescription>
            Gere resumos e análises a partir dos dados de produção do dia selecionado no dashboard.
            {!hasAI && <span className="text-amber-500 block mt-1"> (Funcionalidade Pro/Premium)</span>}
            {!isOnline && <span className="text-amber-500 block mt-1"> (Requer Internet)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleGenerateDailyReport} disabled={!activeProfile?.activeDayId || isGenerating || !hasAI || !isOnline}>
            {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : !isOnline ? <WifiOff className="mr-2"/> : <BookCheck className="mr-2" />}
            Gerar Resumo do Dia
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
