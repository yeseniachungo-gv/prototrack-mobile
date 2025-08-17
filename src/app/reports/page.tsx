"use client";

import React, { useMemo } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const { toast } = useToast();
  const { state, dispatch } = useAppContext();

  const activeDay = useMemo(() => {
    return state.days.find(d => d.id === state.activeDayId);
  }, [state.activeDayId, state.days]);

  const productivityByFunction = useMemo(() => {
    if (!activeDay) return [];
    
    const data = activeDay.functions.map(func => {
      const totalPieces = func.observations.reduce((sum, obs) => sum + obs.pieces, 0);
      return {
        name: func.name,
        pieces: totalPieces
      };
    });

    return data.filter(d => d.pieces > 0);
  }, [activeDay]);

  const exportToCSV = () => {
    if (!activeDay || activeDay.history.length === 0) {
      toast({ title: 'Sem dados de histórico para exportar.' });
      return;
    }

    const headers = ['Timestamp', 'Operator', 'Function', 'Interval(s)', 'Pieces', 'Rate(p/h)', 'Adjusted Rate', 'Aux Time(%)'];
    const csvContent = [
      headers.join(';'),
      ...activeDay.history.map(row => 
        [row.timestamp, row.operator, row.func, row.interval, row.pieces, row.rate, row.adjRate, row.lossPercent].join(';')
      )
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ProtoTrack_History_${activeDay.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Histórico exportado para CSV!' });
  };
  
  const handleBackup = () => {
     const dataStr = JSON.stringify(state, null, 2);
     const blob = new Blob([dataStr], {type: "application/json"});
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.download = "prototrack_backup.json";
     link.href = url;
     link.click();
     URL.revokeObjectURL(url);
     toast({title: "Backup criado!"})
  }
  
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const newState = JSON.parse(text);
          // Some basic validation
          if (newState.days && newState.activeDayId) {
             dispatch({ type: 'SET_STATE', payload: newState });
             toast({ title: "Backup restaurado com sucesso!" });
          } else {
            throw new Error("Invalid backup file structure.");
          }
        }
      } catch (error) {
        console.error(error);
        toast({ title: "Falha ao restaurar o backup.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Relatórios & Exportar" />
      
      <Card>
        <CardHeader>
          <CardTitle>Produtividade por Função ({activeDay?.name || ''})</CardTitle>
        </CardHeader>
        <CardContent>
          {productivityByFunction.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityByFunction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
                <Legend />
                <Bar dataKey="pieces" fill="hsl(var(--primary))" name="Peças" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">Sem dados de produtividade para este dia.</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Exportar Histórico do Cronômetro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
         <p className="text-muted-foreground">Exporte o histórico do cronômetro para o dia ativo ({activeDay?.name || ''}) para um arquivo CSV.</p>
         <Button onClick={exportToCSV}>Exportar CSV</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup e Restauração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
         <p className="text-muted-foreground">Salve ou restaure o estado completo da aplicação. Use com cuidado!</p>
         <div className="flex gap-2">
            <Button onClick={handleBackup}>Criar Backup</Button>
            <Button asChild variant="outline">
                <label>
                    Restaurar Backup
                    <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                </label>
            </Button>
         </div>
        </CardContent>
      </Card>
    </div>
  );
}
