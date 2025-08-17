
"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Função para formatar o tempo de segundos para MM:SS
const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const timePresets = [
    { label: "15s", seconds: 15 },
    { label: "30s", seconds: 30 },
    { label: "1m", seconds: 60 },
    { label: "2m", seconds: 120 },
    { label: "5m", seconds: 300 },
    { label: "10m", seconds: 600 },
]

export default function StopwatchPage() {
  const { state, dispatch } = useAppContext();
  const { stopwatch } = state;
  
  // Estados locais para os inputs
  const [operator, setOperator] = useState('');
  const [func, setFunc] = useState('');
  const [auxTime, setAuxTime] = useState(8.3); // Padrão 8.3% (5 min/hora)

  const handleToggleTimer = () => {
    dispatch({ 
        type: 'TOGGLE_TIMER', 
        payload: { operator, functionName: func, auxiliaryTimePercent: auxTime }
    });
  };

  const handleResetTimer = () => {
    dispatch({ type: 'RESET_TIMER' });
  };
  
  const handlePieceClick = () => {
    if (stopwatch.isRunning) {
        dispatch({ type: 'ADD_PIECE', payload: 1 });
    }
  };

  const handleSetTime = (seconds: number) => {
    dispatch({ type: 'SET_TIMER', payload: seconds });
  }

  const handleModeChange = (mode: string) => {
    if (mode === 'countdown' || mode === 'countup') {
      dispatch({ type: 'SET_STOPWATCH_MODE', payload: mode });
    }
  };

  const currentPph = stopwatch.time > 0 && stopwatch.mode === 'countup' 
    ? (stopwatch.pieces / stopwatch.time) * 3600 
    : stopwatch.mode === 'countdown' && stopwatch.initialTime > stopwatch.time
    ? (stopwatch.pieces / (stopwatch.initialTime - stopwatch.time)) * 3600
    : 0;

  const isFinished = stopwatch.mode === 'countdown' && stopwatch.time === 0 && !stopwatch.isRunning;

  const canStart = !!operator.trim() && !!func.trim();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Cronômetro de Produção" />
      
      <Card>
        <CardContent className="p-4 space-y-4">
           <Tabs value={stopwatch.mode} onValueChange={handleModeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="countdown">Contagem Regressiva</TabsTrigger>
                <TabsTrigger value="countup">Contagem Progressiva</TabsTrigger>
              </TabsList>
            </Tabs>
          <TabsContent value={stopwatch.mode} className="pt-4">
             <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="operador">Operador</Label>
                      <Input id="operador" placeholder="Nome do operador" value={operator} onChange={e => setOperator(e.target.value)} disabled={stopwatch.isRunning}/>
                  </div>
                  <div>
                      <Label htmlFor="funcao">Função</Label>
                      <Input id="funcao" placeholder="Ex: Reta / Revisão" value={func} onChange={e => setFunc(e.target.value)} disabled={stopwatch.isRunning}/>
                  </div>
             </div>
              <div className="mt-4">
                   <Label htmlFor="aux-time">Tempo Auxiliar (%)</Label>
                   <Input id="aux-time" type="number" value={auxTime} onChange={e => setAuxTime(parseFloat(e.target.value) || 0)} disabled={stopwatch.isRunning}/>
              </div>
          </TabsContent>
        </CardContent>
      </Card>
      
      <Card className="text-center">
         {stopwatch.mode === 'countdown' && (
            <CardHeader>
                <CardTitle>Intervalo de Medição</CardTitle>
            </CardHeader>
         )}
        <CardContent className="p-6">
           {stopwatch.mode === 'countdown' && (
             <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {timePresets.map(preset => (
                  <Button 
                      key={preset.seconds}
                      variant={stopwatch.initialTime === preset.seconds ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSetTime(preset.seconds)}
                      disabled={stopwatch.isRunning}
                  >
                      {preset.label}
                  </Button>
                ))}
             </div>
           )}
          
          <div 
             className={cn(
                "text-8xl font-bold font-mono text-primary mb-4 transition-colors duration-300",
                isFinished && "text-destructive"
             )}
           >
            {formatTime(stopwatch.time)}
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-6">
             <div 
                className="text-5xl font-bold w-32 text-center bg-muted rounded-lg p-2 cursor-pointer select-none"
                onClick={handlePieceClick}
             >
                {stopwatch.pieces}
             </div>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button size="lg" onClick={handleToggleTimer} className="w-40" disabled={!canStart}>
              {stopwatch.isRunning ? <><Pause className="mr-2"/> Parar</> : <><Play className="mr-2"/> Iniciar</>}
            </Button>
            <Button size="lg" variant="destructive" onClick={handleResetTimer} disabled={!stopwatch.isRunning && ((stopwatch.mode === 'countdown' && stopwatch.time === stopwatch.initialTime) || (stopwatch.mode === 'countup' && stopwatch.time === 0)) && stopwatch.pieces === 0}>
                <RotateCcw className="mr-2"/> Zerar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho da Sessão Atual</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Média Peças/Hora</div>
                <div className="text-2xl font-bold">{currentPph.toFixed(0)}</div>
            </div>
             <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Média Ajustada ({auxTime}%)</div>
                <div className="text-2xl font-bold">{(currentPph / (1 - (auxTime / 100)) || 0).toFixed(0)}</div>
            </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Histórico do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {stopwatch.history.length > 0 ? (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Operador</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead className="text-center">Peças</TableHead>
                        <TableHead className="text-center">Tempo</TableHead>
                        <TableHead className="text-right">Média/h (Ajust.)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stopwatch.history.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.workerName}</TableCell>
                            <TableCell>{entry.functionName}</TableCell>
                            <TableCell className="text-center">{entry.pieces}</TableCell>
                            <TableCell className="text-center font-mono">{formatTime(entry.duration)}</TableCell>
                            <TableCell className="text-right font-mono">{entry.adjustedAveragePerHour.toFixed(0)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          ) : (
             <p className="text-muted-foreground text-center py-4">Nenhuma medição registrada hoje.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
