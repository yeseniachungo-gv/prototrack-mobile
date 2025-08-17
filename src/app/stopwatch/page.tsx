"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

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

  const handleToggleTimer = () => {
    dispatch({ type: 'TOGGLE_TIMER' });
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

  const pph = stopwatch.initialTime > 0 ? (stopwatch.pieces / stopwatch.initialTime) * 3600 : 0;
  const isFinished = stopwatch.time === 0 && !stopwatch.isRunning && stopwatch.history.length > 0;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Cronômetro Regressivo" />
      
      <Card className="text-center">
        <CardContent className="p-6">
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
          
          <div 
             className={cn(
                "text-8xl font-bold font-mono text-primary mb-4 transition-colors duration-300",
                isFinished && "text-destructive"
             )}
             onClick={handlePieceClick}
           >
            {formatTime(stopwatch.time)}
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-6">
             <div className="text-4xl font-bold w-24 text-center">{stopwatch.pieces}</div>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button size="lg" onClick={handleToggleTimer} className="w-40" disabled={stopwatch.time === 0}>
              {stopwatch.isRunning ? <><Pause className="mr-2"/> Parar</> : <><Play className="mr-2"/> Iniciar</>}
            </Button>
            <Button size="lg" variant="destructive" onClick={handleResetTimer} disabled={stopwatch.time === stopwatch.initialTime && stopwatch.pieces === 0}>
                <RotateCcw className="mr-2"/> Zerar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho da Sessão</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Peças/Hora (Proj.)</div>
                <div className="text-2xl font-bold">{pph.toFixed(0)}</div>
            </div>
             <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Tempo Total</div>
                <div className="text-2xl font-bold">{formatTime(stopwatch.initialTime)}</div>
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
                        <TableHead>Hora Fim</TableHead>
                        <TableHead className="text-center">Peças</TableHead>
                        <TableHead className="text-right">Duração</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stopwatch.history.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell>{new Date(entry.endTime).toLocaleTimeString('pt-BR')}</TableCell>
                            <TableCell className="text-center">{entry.pieces}</TableCell>
                            <TableCell className="text-right">{formatTime(entry.duration)}</TableCell>
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

    