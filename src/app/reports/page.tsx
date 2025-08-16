"use client";

import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';

export default function ReportsPage() {
  const { toast } = useToast();
  const { state } = useAppContext();

  const getActiveDayData = () => {
    const activeDay = state.days.find(d => d.id === state.activeDayId);
    if (!activeDay) return [];

    const rows: any[] = [];
    activeDay.functions.forEach(func => {
      func.hours.forEach(hour => {
        func.workers.forEach(worker => {
          const observation = func.observations.find(obs => obs.worker === worker && obs.hour === hour);
          rows.push({
            data: activeDay.id,
            funcao: func.name,
            hora: hour,
            trabalhador: worker,
            pecas: observation?.pieces || 0,
            obs_motivo: observation?.reason || '',
            obs_detalhe: observation?.detail || ''
          });
        });
      });
    });
    return rows;
  };

  const exportToCSV = () => {
    const data = getActiveDayData();
    if (data.length === 0) {
      toast({ title: 'Sem dados para exportar.' });
      return;
    }

    const headers = ['Data', 'Funcao', 'Hora', 'Trabalhador', 'Pecas', 'Obs_Motivo', 'Obs_Detalhe'];
    const csvContent = [
      headers.join(';'),
      ...data.map(row => 
        [row.data, row.funcao, row.hora, row.trabalhador, row.pecas, `"${row.obs_motivo}"`, `"${row.obs_detalhe}"`].join(';')
      )
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `GiraTempo_${state.activeDayId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Exportado para CSV!' });
  };
  
  const handleBackup = () => {
     const dataStr = JSON.stringify(state, null, 2);
     const blob = new Blob([dataStr], {type: "application/json"});
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.download = "giratempo_backup.json";
     link.href = url;
     link.click();
     URL.revokeObjectURL(url);
     toast({title: "Backup criado!"})
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Exportar & Relatórios" />
      <Card>
        <CardHeader>
          <CardTitle>Exportar dados do dia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
         <p className="text-muted-foreground">Exporte os dados do dia ativo ({state.activeDayId}) para um arquivo CSV.</p>
         <Button onClick={exportToCSV}>Exportar CSV</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Backup e Restauração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
         <p className="text-muted-foreground">Salve ou restaure o estado completo da aplicação.</p>
         <div className="flex gap-2">
            <Button onClick={handleBackup}>Criar Backup</Button>
            <Button variant="outline" onClick={() => toast({title: "Em breve!"})}>Restaurar</Button>
         </div>
        </CardContent>
      </Card>
    </div>
  );
}
