"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { TimerState, TimerHistoryEntry } from '@/lib/types';

function useTimerStorage(dayId: string | null) {
    const key = dayId ? `gt:v2:default:timer:${dayId}` : null;

    const getInitialState = (): TimerState => {
        if (!key) {
            return { running: false, startedAt: null, elapsedSec: 0, pieces: 0, history: [] };
        }
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : { running: false, startedAt: null, elapsedSec: 0, pieces: 0, history: [] };
        } catch {
            return { running: false, startedAt: null, elapsedSec: 0, pieces: 0, history: [] };
        }
    };

    const [timerState, setTimerState] = useState<TimerState>(getInitialState);

    useEffect(() => {
        // When dayId changes, load new state
        setTimerState(getInitialState());
    }, [dayId]);


    useEffect(() => {
        if (key) {
            localStorage.setItem(key, JSON.stringify(timerState));
        }
    }, [timerState, key]);

    return [timerState, setTimerState] as const;
}


export default function StopwatchPage() {
  const { state: appState } = useAppContext();
  const [timerState, setTimerState] = useTimerStorage(appState.activeDayId);
  const { toast } = useToast();
  
  const [showTimer, setShowTimer] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalElapsed = timerState.elapsedSec + (timerState.running && timerState.startedAt ? (Date.now() - timerState.startedAt) / 1000 : 0);

  useEffect(() => {
    const tick = () => {
        if (timerState.running) {
            setTimerState(prev => ({...prev})); // Force re-render to update elapsed time
        }
    };
    
    if(timerState.running){
        timerRef.current = setInterval(tick, 1000);
    } else if (timerRef.current) {
        clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerState.running, setTimerState]);

  const handleStartPause = () => {
      setTimerState(prev => {
          if (prev.running) { // Pausing
              const elapsedNow = (Date.now() - (prev.startedAt || Date.now())) / 1000;
              return {
                  ...prev,
                  running: false,
                  startedAt: null,
                  elapsedSec: prev.elapsedSec + elapsedNow,
              };
          } else { // Starting
              return {
                  ...prev,
                  running: true,
                  startedAt: Date.now(),
              };
          }
      });
  };
  
  const handleStop = () => {
      if (!timerState.running && timerState.elapsedSec === 0) return;

      setTimerState(prev => {
          const end = Date.now();
          const elapsedNow = prev.running && prev.startedAt ? (end - prev.startedAt) / 1000 : 0;
          
          const newHistoryEntry: TimerHistoryEntry = {
              start: prev.startedAt || end - (prev.elapsedSec * 1000),
              end,
              elapsedSec: prev.elapsedSec + elapsedNow,
              pieces: prev.pieces,
          };
          
          return {
              running: false,
              startedAt: null,
              elapsedSec: 0,
              pieces: 0,
              history: [...prev.history, newHistoryEntry],
          };
      });
      toast({ title: "Intervalo finalizado e salvo no histórico."});
  };
  
  const handleReset = () => {
    if (timerState.running) return;
    setTimerState(prev => ({
        ...prev,
        elapsedSec: 0,
        pieces: 0,
        startedAt: null
    }));
  };

  const handleAddPiece = () => {
      if (!timerState.running) return;
      setTimerState(prev => ({...prev, pieces: prev.pieces + 1}));
      if (navigator.vibrate) navigator.vibrate(20);
  }
  
  const formatTime = (timeInSeconds: number) => {
    const totalSec = Math.floor(timeInSeconds);
    const minutes = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const seconds = (totalSec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  const progressBarWidth = (totalElapsed % 60) / 60 * 100;
  const piecesPerHour = totalElapsed > 0 ? (timerState.pieces / totalElapsed * 3600).toFixed(0) : '0';

  const handleComingSoon = (feature: string) => {
    toast({ title: "Funcionalidade em breve!", description: `${feature} ainda não está implementado.` });
  };
  
  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleComingSoon('Exportar CSV')}>Exportar CSV</Button>
            <Button variant="outline" onClick={() => handleComingSoon('Exportar Excel')}>Exportar Excel</Button>
            <Button variant="outline" onClick={() => handleComingSoon('PDF')}>PDF</Button>
            <Button variant="outline" onClick={() => handleComingSoon('Qualidade')}>Qualidade</Button>
            <Button variant="outline" onClick={() => handleComingSoon('Paradas')}>Paradas</Button>
            <div className="flex-grow" />
            <Button variant="outline" onClick={() => setShowTimer(!showTimer)}>{showTimer ? 'Ocultar' : 'Mostrar'} cronômetro</Button>
        </CardContent>
      </Card>
      
      {showTimer && (
        <Card>
            <CardContent className="p-4">
                <div className="text-5xl font-black tracking-wide text-center py-4">{formatTime(totalElapsed)}</div>
                <div 
                    className="h-3.5 bg-secondary rounded-full my-4 overflow-hidden cursor-pointer" 
                    title="Toque aqui para somar peça (quando rodando)"
                    onClick={handleAddPiece}
                >
                    <div className="h-full bg-primary" style={{width: `${progressBarWidth}%`}}></div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Peças: {timerState.pieces}</div>
                    <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Média/h: {piecesPerHour}</div>
                    <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Meta: 80%</div>
                    <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Ajustada: 228 p/h</div>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                    <Button onClick={handleStartPause}>
                        {timerState.running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {timerState.running ? 'Pausar' : 'Iniciar'}
                    </Button>
                    <Button onClick={handleStop} disabled={!timerState.running && timerState.elapsedSec === 0}>Finalizar</Button>
                    <Button onClick={handleReset} disabled={timerState.running}>Reiniciar</Button>
                </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">Histórico do dia</h2>
          {timerState.history.length === 0 ? (
            <p className="text-muted-foreground">Sem registros…</p>
          ) : (
            <div className="space-y-2">
              {timerState.history.map((entry, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                   <div>
                     <div className="font-bold">Intervalo {index + 1}</div>
                     <div className="text-sm text-muted-foreground">
                        {new Date(entry.start).toLocaleTimeString()} - {new Date(entry.end).toLocaleTimeString()}
                        {' • '}
                        {formatTime(entry.elapsedSec)}
                     </div>
                   </div>
                   <div className="font-bold">Peças: {entry.pieces}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
