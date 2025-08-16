"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Plus, Minus, EyeOff, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [pieces, setPieces] = useState(0);
  const [showKPIs, setShowKPIs] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setPieces(0);
  };
  
  const formatTime = (timeInMs: number) => {
    const minutes = Math.floor(timeInMs / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((timeInMs % 60000) / 1000).toString().padStart(2, '0');
    const milliseconds = Math.floor((timeInMs % 1000) / 10).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
  };

  const incrementPieces = useCallback(() => {
    if(isRunning) setPieces(p => p + 1)
  }, [isRunning]);

  const decrementPieces = useCallback(() => {
    if(isRunning) setPieces(p => Math.max(0, p - 1))
  }, [isRunning]);


  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <Header title="Stopwatch" />
      <div className="flex-grow flex flex-col items-center justify-center gap-6">
        <Card className="w-full max-w-sm text-center shadow-lg">
          <CardContent className="p-6">
            <p className="font-mono text-6xl md:text-7xl font-bold tracking-tighter text-primary">
              {formatTime(time)}
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center w-full gap-4">
            <Button onClick={decrementPieces} disabled={!isRunning} variant="outline" size="icon" className="w-16 h-16 rounded-full">
              <Minus className="h-8 w-8" />
            </Button>
            <Button 
              onClick={incrementPieces} 
              disabled={!isRunning}
              className={cn("w-32 h-32 rounded-full text-4xl font-bold flex flex-col shadow-xl transform active:scale-95 transition-transform", !isRunning && "bg-muted text-muted-foreground")}
            >
              {pieces}
              <span className="text-sm font-normal">pieces</span>
            </Button>
            <Button onClick={incrementPieces} disabled={!isRunning} variant="outline" size="icon" className="w-16 h-16 rounded-full">
              <Plus className="h-8 w-8" />
            </Button>
        </div>

        <div className="flex space-x-4">
          <Button onClick={handleStartPause} size="lg" className="w-32">
            {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw className="mr-2" />
            Reset
          </Button>
        </div>

        <div className="w-full max-w-sm mt-4">
            <div className="flex items-center justify-between mb-4">
                <Label htmlFor="show-kpis" className="text-lg font-medium">Productivity KPIs</Label>
                 <Switch
                    id="show-kpis"
                    checked={showKPIs}
                    onCheckedChange={setShowKPIs}
                />
            </div>
            {showKPIs && (
                <Card>
                    <CardContent className="p-4 space-y-2 text-center">
                        <div className="text-lg">
                            <span className="font-bold">{pieces > 0 ? (time / pieces / 1000).toFixed(2) : '0.00'}</span>
                            <span className="text-sm text-muted-foreground"> sec/piece</span>
                        </div>
                        <div className="text-lg">
                            <span className="font-bold">{pieces > 0 ? (3600 / (time / pieces / 1000)).toFixed(1) : '0.0'}</span>
                             <span className="text-sm text-muted-foreground"> pieces/hour</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
