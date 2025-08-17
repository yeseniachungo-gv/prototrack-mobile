// src/app/stopwatch/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Play, Pause, RotateCcw, Trash2, Minus, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


// --- Helper Functions & Constants ---

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
];


// --- Main Stopwatch Page Component ---

export default function StopwatchPage() {
  const { state, dispatch } = useAppContext();
  const { stopwatch } = state;
  const { toast } = useToast();

  const [sessionDetails, setSessionDetails] = useState(stopwatch.session);

  useEffect(() => {
    if (!stopwatch.isRunning) {
        setSessionDetails(stopwatch.session);
    }
  }, [stopwatch.session, stopwatch.isRunning]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_STOPWATCH_SESSION_DETAILS', payload: sessionDetails });
  }, [sessionDetails, dispatch]);


  const handleStart = () => {
    if (!sessionDetails.operator.trim() || !sessionDetails.functionName.trim()) {
        toast({ title: 'Atenção', description: 'Preencha o nome do operador e a função para iniciar.', variant: 'destructive'});
        return;
    }
    dispatch({ type: 'START_TIMER' });
  };
  
  const handleStop = () => dispatch({ type: 'STOP_TIMER' });
  const handleReset = () => dispatch({ type: 'RESET_TIMER' });
  const handleAddPiece = () => dispatch({ type: 'ADD_PIECE', payload: 1 });
  const handleUndoPiece = () => dispatch({ type: 'UNDO_PIECE' });
  
  const handleSetTime = (seconds: number) => {
    if (!stopwatch.isRunning) {
        dispatch({ type: 'SET_TIMER', payload: seconds });
    }
  }

  const handleModeChange = (mode: string) => {
    if (mode === 'countdown' || mode === 'countup') {
      dispatch({ type: 'SET_STOPWATCH_MODE', payload: mode });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSessionDetails(prev => ({
        ...prev,
        [id]: id === 'auxiliaryTimePercent' ? parseFloat(value) || 0 : value
    }));
  };

  const currentPph = stopwatch.mode === 'countup' 
    ? stopwatch.time > 0 ? (stopwatch.pieces / stopwatch.time) * 3600 : 0
    : stopwatch.initialTime - stopwatch.time > 0 
    ? (stopwatch.pieces / (stopwatch.initialTime - stopwatch.time)) * 3600
    : 0;

  const adjustedPph = currentPph / (1 - (sessionDetails.auxiliaryTimePercent / 100) || 1);
  
  const isFinished = stopwatch.mode === 'countdown' && stopwatch.time === 0 && !stopwatch.isRunning;

  const progressBarWidth = stopwatch.mode === 'countdown' && stopwatch.initialTime > 0
    ? 100 * (1 - (stopwatch.time / stopwatch.initialTime))
    : 0;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Cronômetro de Produção" />
      
      <Card>
        <CardContent className="p-4 space-y-4">
           <Tabs value={stopwatch.mode} onValueChange={handleModeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="countdown" disabled={stopwatch.isRunning}>Contagem Regressiva</TabsTrigger>
                <TabsTrigger value="countup" disabled={stopwatch.isRunning}>Contagem Progressiva</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label>Intervalo</Label>
               <div className="flex justify-start gap-2 flex-wrap">
                {timePresets.map(preset => (
                  <Button 
                      key={preset.seconds}
                      variant={stopwatch.initialTime === preset.seconds && stopwatch.mode === 'countdown' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSetTime(preset.seconds)}
                      disabled={stopwatch.isRunning || stopwatch.mode !== 'countdown'}
                  >
                      {preset.label}
                  </Button>
                ))}
             </div>
            </div>
            
            <div className="space-y-2">
                <Label>Controles</Label>
                <div className="flex justify-start gap-2 flex-wrap">
                    {!stopwatch.isRunning ? (
                        <Button onClick={handleStart} className="w-32">
                            <Play className="mr-2"/> Iniciar
                        </Button>
                    ) : (
                        <Button variant="destructive" onClick={handleStop} className="w-32">
                            <Pause className="mr-2"/> Finalizar
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleReset} disabled={stopwatch.isRunning}>
                        <RotateCcw className="mr-2"/> Reiniciar
                    </Button>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="operator">Operador</Label>
                    <Input id="operator" placeholder="Nome do operador" value={sessionDetails.operator} onChange={handleInputChange} disabled={stopwatch.isRunning}/>
                </div>
                <div>
                    <Label htmlFor="functionName">Função</Label>
                    <Input id="functionName" placeholder="Ex: Costura / Revisão" value={sessionDetails.functionName} onChange={handleInputChange} disabled={stopwatch.isRunning}/>
                </div>
                 <div>
                    <Label htmlFor="auxiliaryTimePercent">Tempo auxiliar (%)</Label>
                    <Input id="auxiliaryTimePercent" type="number" min="0" value={sessionDetails.auxiliaryTimePercent} onChange={handleInputChange} disabled={stopwatch.isRunning}/>
                </div>
            </div>

            <div className='relative pt-4 pb-2'>
              <div 
                  className={cn(
                      "text-6xl md:text-8xl text-center font-bold font-mono text-primary transition-colors duration-300",
                      isFinished && "text-destructive"
                  )}
              >
                  {formatTime(stopwatch.time)}
              </div>
              {stopwatch.mode === 'countdown' && (
                  <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                      <div className="bg-primary h-2.5 rounded-full" style={{width: `${progressBarWidth}%`}}></div>
                  </div>
              )}
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center items-center gap-4 my-4">
        <Button size="icon" variant="outline" className="w-16 h-16 rounded-full" onClick={handleUndoPiece} disabled={stopwatch.pieces === 0}>
            <Minus className="h-8 w-8"/>
        </Button>
        <Button size="icon" className="w-24 h-24 rounded-full text-4xl font-bold relative" onClick={handleAddPiece} disabled={!stopwatch.isRunning}>
            {stopwatch.pieces}
            <Plus className="absolute bottom-4 right-4 h-6 w-6 opacity-75"/>
        </Button>
        <div className="w-16 h-16"></div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Desempenho da Sessão Atual</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Peças</div>
                <div className="text-2xl font-bold">{stopwatch.pieces}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Média Peças/Hora</div>
                <div className="text-2xl font-bold">{isFinite(currentPph) ? currentPph.toFixed(0) : 0}</div>
            </div>
             <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Média Ajustada ({sessionDetails.auxiliaryTimePercent}%)</div>
                <div className="text-2xl font-bold">{isFinite(adjustedPph) ? adjustedPph.toFixed(0) : 0}</div>
            </div>
             <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Estado</div>
                <div className={cn("text-2xl font-bold capitalize", isFinished && "text-destructive")}>{isFinished ? "Finalizado" : stopwatch.isRunning ? 'Medindo' : 'Pronto'}</div>
            </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Histórico do Dia</CardTitle>
                <CardDescription>Últimas 25 medições.</CardDescription>
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={stopwatch.history.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" /> Limpar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita e removerá todos os registros de medição do dia.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => dispatch({ type: 'CLEAR_STOPWATCH_HISTORY' })}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                        <TableHead className="text-right">Média/h</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stopwatch.history.slice(0, 25).map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.workerName}</TableCell>
                            <TableCell>{entry.functionName}</TableCell>
                            <TableCell className="text-center">{entry.pieces}</TableCell>
                            <TableCell className="text-center font-mono">{formatTime(entry.duration)}</TableCell>
                            <TableCell className="text-right font-mono">{entry.averagePerHour.toFixed(0)}</TableCell>
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
