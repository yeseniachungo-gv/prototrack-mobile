"use client";

import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';

export default function ReportsPage() {
  const { toast } = useToast();
  const { state } = useAppContext();

  const getActiveDayData = () => {
    const currentDay = state.days.find(d => d.id === state.activeDayId);
    if (!currentDay) return [];

    const rows: any[] = [];
    currentDay.functions.forEach(func => {
      func.hours.forEach(hour => {
        func.workers.forEach(worker => {
          const obs = func.observations.find(o => o.worker === worker && o.hour === hour);
          rows.push({
            data: currentDay.id,
            funcao: func.name,
            hora: hour,
            trabalhador: worker,
            pecas: obs?.pieces || 0,
            obs_motivo: obs?.reason || '',
            obs_detalhe: obs?.detail || ''
          });
        });
      });
    });
    return rows;
  };
  
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  };
  
  const exportCSV = () => {
    const rows = getActiveDayData();
    if (rows.length === 0) {
      toast({ title: 'Sem dados para exportar.', variant: 'destructive' });
      return;
    }
    const sep = ';';
    const headers = ['Data', 'Função', 'Hora', 'Trabalhador', 'Peças', 'Observacao_Motivo', 'Observacao_Detalhe'];
    const esc = (v: any) => {
      const s = String(v ?? '');
      if (/[;"\\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [headers.join(sep)].concat(
      rows.map(r => [
        esc(r.data), esc(r.funcao), esc(r.hora), esc(r.trabalhador),
        esc(r.pecas), esc(r.obs_motivo), esc(r.obs_detalhe)
      ].join(sep))
    );
    const blob = new Blob([lines.join('\\n')], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `GiraTempo_${state.activeDayId}.csv`);
    toast({ title: 'CSV exportado.' });
  };

  const exportExcel = () => {
     toast({ title: "Funcionalidade em breve!", description: `Exportar para Excel ainda não está implementado.` });
  };
  
  const exportPDF = () => {
     toast({ title: "Funcionalidade em breve!", description: `Exportar para PDF ainda não está implementado.` });
  };

  const handleComingSoon = (feature: string) => {
    toast({ title: "Funcionalidade em breve!", description: `${feature} ainda não está implementado.` });
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Exportar & Relatórios" />
      <Card>
        <CardHeader>
          <CardTitle>Exportar dados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={exportCSV}>CSV</Button>
          <Button onClick={exportExcel}>Excel</Button>
          <Button onClick={exportPDF}>PDF</Button>
          <Button onClick={() => handleComingSoon('Imprimir')}>Imprimir</Button>
          <Button onClick={() => handleComingSoon('Backup')}>Backup</Button>
          <Button onClick={() => handleComingSoon('Restaurar')}>Restaurar</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Relatórios rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Produção por função</li>
            <li>Produção por operador</li>
            <li>Comparativo de dias</li>
            <li>Ranking por função</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
