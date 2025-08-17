"use client";

import React, { useRef } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileText, FileX2, Printer } from 'lucide-react';
import type { Day, FunctionEntry } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';


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
  )
}


export default function ReportsPage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = (day: Day) => {
    if (!day) {
      toast({ title: 'Nenhum dia selecionado', description: 'Por favor, selecione um dia na aba Planilhas.', variant: 'destructive' });
      return;
    }

    try {
      day.functions.forEach(func => {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Cabeçalho
        const headers = ["Trabalhador", "Hora", "Peças", "Motivo da Observação", "Detalhe da Observação"];
        csvContent += headers.join(',') + '\r\n';

        // Linhas
        func.workers.forEach(worker => {
          func.hours.forEach(hour => {
            const key = `${worker}_${hour}`;
            const pieces = func.pieces[key] || 0;
            const observation = func.observations[key];
            const row = [
              worker,
              `"${hour}"`,
              pieces,
              `"${observation?.reason || ''}"`,
              `"${observation?.detail || ''}"`
            ];
            csvContent += row.join(',') + '\r\n';
          });
        });

        // Totais por trabalhador (opcional, mas útil)
        csvContent += '\r\n';
        csvContent += "Total por Trabalhador,,,\r\n";
         func.workers.forEach(worker => {
            const total = func.hours.reduce((sum, hour) => sum + (func.pieces[`${worker}_${hour}`] || 0), 0);
            csvContent += `${worker},${total},,\r\n`;
        });
        
        // Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const fileName = `GiraTempo_${day.id}_${func.name}.csv`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      toast({ title: "Exportação CSV Concluída", description: `Dados do dia ${new Date(day.id+'T00:00:00').toLocaleDateString('pt-BR')} exportados.` });

    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast({ title: 'Erro na Exportação', description: 'Ocorreu um problema ao gerar o arquivo CSV.', variant: 'destructive' });
    }
  };
  
  const handleBackup = () => {
    try {
      const stateToBackup = { ...state };
      // O histórico do cronômetro não faz parte do backup principal
      delete (stateToBackup as any).stopwatch;

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(stateToBackup, null, 2)
      )}`;
      const link = document.createElement("a");
      link.setAttribute("href", jsonString);
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `GiraTempo_Backup_${date}.json`);
      link.click();
      toast({ title: 'Backup Criado com Sucesso!' });
    } catch(e) {
      console.error(e);
      toast({ title: 'Erro ao criar backup', variant: 'destructive' });
    }
  };
  
  const handleTriggerRestore = () => {
    restoreInputRef.current?.click();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File is not a valid text file.");
        
        const restoredState = JSON.parse(text);
        
        // Validação básica do estado restaurado
        if (restoredState.days && restoredState.activeDayId && restoredState.theme) {
          dispatch({ type: 'SET_STATE', payload: restoredState });
          toast({ title: 'Backup Restaurado!', description: 'Seus dados foram carregados com sucesso.' });
        } else {
          throw new Error('Arquivo de backup inválido ou corrompido.');
        }

      } catch (error) {
        console.error("Erro ao restaurar backup:", error);
        toast({ title: 'Erro na Restauração', description: (error as Error).message, variant: 'destructive' });
      } finally {
        // Limpa o input para permitir restaurar o mesmo arquivo novamente
        if(restoreInputRef.current) restoreInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };
  
  const activeDay = state.days.find(d => d.id === state.activeDayId);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Relatórios & Exportar" />
      <Card>
        <CardHeader>
          <CardTitle>Exportação do Dia</CardTitle>
          <CardDescription>
            Exporte os dados do dia ativo ({activeDay ? new Date(activeDay.id+'T00:00:00').toLocaleDateString('pt-BR') : 'Nenhum'}) para análise externa.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => activeDay && handleExportCSV(activeDay)} disabled={!activeDay}>
              <FileText className="mr-2"/> Exportar CSV do Dia
            </Button>
            <Button variant="secondary" disabled><FileX2 className="mr-2"/> Exportar XLSX</Button>
            <Button variant="secondary" disabled><FileX2 className="mr-2"/> Exportar PDF</Button>
            <Button variant="secondary" disabled><Printer className="mr-2"/> Imprimir</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Rápidos</CardTitle>
           <CardDescription>
            Produção total por função para o dia selecionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeDay && activeDay.functions.length > 0 ? (
            <ProductionChart data={activeDay.functions}/>
          ) : (
             <p className="text-muted-foreground text-center py-4">
                {activeDay ? 'Nenhuma função para exibir.' : 'Selecione um dia para ver os relatórios.'}
             </p>
          )}
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Backup & Restauração</CardTitle>
          <CardDescription>
            Salve todos os seus dados em um arquivo ou restaure a partir de um backup anterior.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button onClick={handleBackup} variant="outline">
              <Download className="mr-2"/> Criar Backup
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

    </div>
  );
}
