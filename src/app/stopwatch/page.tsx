"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [pieces, setPieces] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const handleStartPause = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setPieces(0);
  };
  
  const formatTime = (timeInMs: number) => {
    const minutes = Math.floor(timeInMs / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((timeInMs % 60000) / 1000).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleComingSoon = (feature: string) => {
    toast({ title: "Funcionalidade em breve!", description: `${feature} ainda não está implementado.` });
  };

  const timePerPiece = pieces > 0 ? (time / pieces / 1000).toFixed(2) : '0.00';
  const piecesPerHour = pieces > 0 ? (3600 / (time / pieces / 1000)).toFixed(0) : '0';


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
                <div className="text-5xl font-black tracking-wide text-center py-4">{formatTime(time)}</div>
                <div 
                    className="h-3.5 bg-secondary rounded-full my-4 overflow-hidden" 
                    title="Toque aqui para somar peça (quando rodando)"
                    onClick={() => isRunning && setPieces(p => p + 1)}
                >
                    <div className="h-full bg-primary" style={{width: '35%'}}></div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Peças: {pieces}</div>
                    <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Média/h: {piecesPerHour}</div>
                    <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Meta: 80%</div>
                    <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Ajustada: 228 p/h</div>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                    <Button onClick={handleStartPause}>
                        {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {isRunning ? 'Pausar' : 'Iniciar'}
                    </Button>
                    <Button onClick={() => handleComingSoon('Finalizar')}>Finalizar</Button>
                    <Button onClick={handleReset}>Reiniciar</Button>
                </div>
            </CardContent>
        </Card>
      )}

      <Card>
          <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-2">Histórico do dia</h2>
              <p className="text-muted-foreground">Sem registros…</p>
          </CardContent>
      </Card>
    </div>
  );
}
