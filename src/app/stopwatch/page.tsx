// src/app/stopwatch/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  const { state, dispatch, activeProfile } = useAppContext();
  const { toast } = useToast();
  
  if (!activeProfile) return null; // Safeguard

  const { stopwatch, id: profileId } = activeProfile;
  const [localStopwatch, setLocalStopwatch] = useState(stopwatch);
  
  // Update local state if global state for this profile changes
  useEffect(() => {
    setLocalStopwatch(activeProfile.stopwatch);
  }, [activeProfile.stopwatch]);

  // Dispatch changes from local state to global state
  const syncState = (newStopwatchState: any) => {
     dispatch({ type: 'UPDATE_STOPWATCH_STATE', payload: { profileId, stopwatchState: newStopwatchState } });
  }

  const existingFunctionNames = useMemo(() => {
    if (!activeProfile) return [];
    const allNames = new Set<string>();
    activeProfile.days.forEach(day => {
        day.functions.forEach(func => allNames.add(func.name));
    });
    return Array.from(allNames);
  }, [activeProfile]);

  const handleStart = () => {
    if (!localStopwatch.session.operator.trim() || !localStopwatch.session.functionName.trim()) {
        toast({ title: 'Atenção', description: 'Preencha o nome do operador e a função para iniciar.', variant: 'destructive'});
        return;
    }
    dispatch({ type: 'START_TIMER', payload: { profileId } });
  };
  
  const handleStop = () => dispatch({ type: 'STOP_TIMER', payload: { profileId } });
  const handleReset = () => dispatch({ type: 'RESET_TIMER', payload: { profileId } });
  const handleAddPiece = () => dispatch({ type: 'ADD_PIECE', payload: { profileId, amount: 1 } });
  const handleUndoPiece = () => dispatch({ type: 'UNDO_PIECE', payload: { profileId } });
  
  const handleSetTime = (seconds: number) => {
    if (!localStopwatch.isRunning) {
        dispatch({ type: 'SET_TIMER', payload: { profileId, seconds } });
    }
  }

  const handleModeChange = (mode: string) => {
    if (mode === 'countdown' || mode === 'countup') {
      dispatch({ type: 'SET_STOPWATCH_MODE', payload: { profileId, mode: mode as 'countdown' | 'countup' } });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const newSession = {
        ...localStopwatch.session,
        [id]: id === 'auxiliaryTimePercent' ? parseFloat(value) || 0 : value
    }
    const newStopwatchState = { ...localStopwatch, session: newSession };
    setLocalStopwatch(newStopwatchState);
    syncState(newStopwatchState);
  };
  
  const elapsedTime = localStopwatch.mode === 'countup' 
    ? localStopwatch.time 
    : localStopwatch.initialTime - localStopwatch.time;

  const currentPph = elapsedTime > 0 ? (localStopwatch.pieces / elapsedTime) * 3600 : 0;
  
  const adjustedPieces = localStopwatch.pieces * (1 - (localStopwatch.session.auxiliaryTimePercent / 100));
  const adjustedPph = elapsedTime > 0 ? (adjustedPieces / elapsedTime) * 3600 : 0;
  
  const isFinished = localStopwatch.mode === 'countdown' && localStopwatch.time === 0 && !localStopwatch.isRunning;

  const progressBarWidth = localStopwatch.mode === 'countdown' && localStopwatch.initialTime > 0
    ? 100 * (1 - (localStopwatch.time / localStopwatch.initialTime))
    : 0;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Cronômetro de Produção" />
      
      <Card>
        <CardContent className="p-4 space-y-4">
           <Tabs value={localStopwatch.mode} onValueChange={handleModeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="countdown" disabled={localStopwatch.isRunning}>Contagem Regressiva</TabsTrigger>
                <TabsTrigger value="countup" disabled={localStopwatch.isRunning}>Contagem Progressiva</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label>Intervalo</Label>
               <div className="flex justify-start gap-2 flex-wrap">
                {timePresets.map(preset => (
                  <Button 
                      key={preset.seconds}
                      variant={localStopwatch.initialTime === preset.seconds && localStopwatch.mode === 'countdown' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSetTime(preset.seconds)}
                      disabled={localStopwatch.isRunning || localStopwatch.mode !== 'countdown'}
                  >
                      {preset.label}
                  </Button>
                ))}
             </div>
            </div>
            
            <div className="space-y-2">
                <Label>Controles</Label>
                <div className="flex justify-start gap-2 flex-wrap">
                    {!localStopwatch.isRunning ? (
                        <Button onClick={handleStart} className="w-32">
                            <Play className="mr-2"/> Iniciar
                        </Button>
                    ) : (
                        <Button variant="destructive" onClick={handleStop} className="w-32">
                            <Pause className="mr-2"/> Finalizar
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleReset} disabled={localStopwatch.isRunning}>
                        <RotateCcw className="mr-2"/> Reiniciar
                    </Button>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="operator">Operador</Label>
                    <Input id="operator" placeholder="Nome do operador" list="workers-list" value={localStopwatch.session.operator} onChange={handleInputChange} disabled={localStopwatch.isRunning}/>
                    <datalist id="workers-list">
                        {activeProfile.masterWorkers.map(w => <option key={w.id} value={w.name} />)}
                    </datalist>
                </div>
                <div>
                    <Label htmlFor="functionName">Função</Label>
                    <Input id="functionName" placeholder="Ex: Costura / Revisão" list="function-names-list" value={localStopwatch.session.functionName} onChange={handleInputChange} disabled={localStopwatch.isRunning}/>
                     <datalist id="function-names-list">
                        {existingFunctionNames.map(name => <option key={name} value={name} />)}
                    </datalist>
                </div>
                 <div>
                    <Label htmlFor="auxiliaryTimePercent">Tempo auxiliar (%)</Label>
                    <Input id="auxiliaryTimePercent" type="number" min="0" value={localStopwatch.session.auxiliaryTimePercent} onChange={handleInputChange} disabled={localStopwatch.isRunning}/>
                </div>
            </div>

            <div className='relative pt-4 pb-2'>
              <div 
                  className={cn(
                      "text-6xl md:text-8xl text-center font-bold font-mono text-primary transition-colors duration-300",
                      isFinished && "text-destructive"
                  )}
              >
                  {formatTime(localStopwatch.time)}
              </div>
              {localStopwatch.mode === 'countdown' && (
                  <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                      <div className="bg-primary h-2.5 rounded-full" style={{width: `${progressBarWidth}%`}}></div>
                  </div>
              )}
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center items-center gap-4 my-4">
        <Button size="icon" variant="outline" className="w-16 h-16 rounded-full" onClick={handleUndoPiece} disabled={localStopwatch.pieces === 0}>
            <Minus className="h-8 w-8"/>
        </Button>
        <Button size="icon" className="w-24 h-24 rounded-full text-4xl font-bold relative" onClick={handleAddPiece} disabled={!localStopwatch.isRunning}>
            {localStopwatch.pieces}
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
                <div className="text-2xl font-bold">{localStopwatch.pieces}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Média Peças/Hora</div>
                <div className="text-2xl font-bold">{isFinite(currentPph) ? currentPph.toFixed(0) : 0}</div>
            </div>
             <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Média Ajustada ({localStopwatch.session.auxiliaryTimePercent}%)</div>
                <div className="text-2xl font-bold">{isFinite(adjustedPph) ? adjustedPph.toFixed(0) : 0}</div>
            </div>
             <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Estado</div>
                <div className={cn("text-2xl font-bold capitalize", isFinished && "text-destructive")}>{isFinished ? "Finalizado" : localStopwatch.isRunning ? 'Medindo' : 'Pronto'}</div>
            </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Histórico do Dia</CardTitle>
                <CardDescription>Últimas 50 medições.</CardDescription>
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={localStopwatch.history.length === 0}>
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
                    <AlertDialogAction onClick={() => dispatch({ type: 'CLEAR_STOPWATCH_HISTORY', payload: { profileId } })}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
        </CardHeader>
        <CardContent>
          {localStopwatch.history.length > 0 ? (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Operador</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead className="text-center">Peças</TableHead>
                        <TableHead className="text-center">Tempo</TableHead>
                        <TableHead className="text-center">Média/h</TableHead>
                        <TableHead className="text-right">Média/h (Ajust.)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {localStopwatch.history.slice(0, 50).map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.workerName}</TableCell>
                            <TableCell>{entry.functionName}</TableCell>
                            <TableCell className="text-center">{entry.pieces}</TableCell>
                            <TableCell className="text-center font-mono">{formatTime(entry.duration)}</TableCell>
                            <TableCell className="text-center font-mono">{entry.averagePerHour.toFixed(0)}</TableCell>
                            <TableCell className="text-right font-mono">{(entry.adjustedAveragePerHour ?? 0).toFixed(0)}</TableCell>
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
