"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Play, Pause, Square, Plus, Minus, RotateCcw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Função para formatar o tempo de segundos para MM:SS
const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function StopwatchPage() {
  const { state, dispatch } = useAppContext();
  const { stopwatch } = state;

  const handleToggleTimer = () => {
    dispatch({ type: 'TOGGLE_TIMER' });
  };

  const handleResetTimer = () => {
    dispatch({ type: 'RESET_TIMER' });
  };
  
  const handlePieceChange = (amount: number) => {
    if (stopwatch.isRunning) {
        dispatch({ type: 'ADD_PIECE', payload: amount });
    }
  };

  const pph = stopwatch.time > 0 ? (stopwatch.pieces / stopwatch.time) * 3600 : 0;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Cronômetro" />
      
      <Card className="text-center">
        <CardContent className="p-6">
          <div 
             className="text-8xl font-bold font-mono text-primary mb-4"
             onClick={() => handlePieceChange(1)}
           >
            {formatTime(stopwatch.time)}
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-6">
             <Button size="icon" variant="outline" onClick={() => handlePieceChange(-1)} disabled={!stopwatch.isRunning || stopwatch.pieces <= 0}>
                <Minus/>
             </Button>
             <div className="text-4xl font-bold w-24 text-center">{stopwatch.pieces}</div>
             <Button size="icon" variant="outline" onClick={() => handlePieceChange(1)} disabled={!stopwatch.isRunning}>
                <Plus/>
             </Button>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button size="lg" onClick={handleToggleTimer} className="w-40">
              {stopwatch.isRunning ? <><Pause className="mr-2"/> Parar</> : <><Play className="mr-2"/> Iniciar</>}
            </Button>
            <Button size="lg" variant="destructive" onClick={handleResetTimer} disabled={stopwatch.time === 0}>
                <RotateCcw className="mr-2"/> Zerar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Peças/Hora</div>
                <div className="text-2xl font-bold">{pph.toFixed(0)}</div>
            </div>
             <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
                <div className="text-2xl font-bold">{stopwatch.pieces > 0 ? (stopwatch.time / stopwatch.pieces).toFixed(2) : '0.00'}s</div>
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
