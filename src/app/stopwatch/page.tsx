"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

// Simplified types for this new prototype
interface HistoryEntry {
  id: number;
  timestamp: string;
  operator: string;
  func: string;
  interval: number;
  pieces: number;
  rate: number;
}

export default function StopwatchPage() {
  const { toast } = useToast();
  const [activeSheet, setActiveSheet] = React.useState('Folha 1');
  const [sheets, setSheets] = React.useState(['Folha 1', 'Folha 2']);

  // Timer State
  const [intervalSec, setIntervalSec] = React.useState(60);
  const [remainingSec, setRemainingSec] = React.useState(60);
  const [pieces, setPieces] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [status, setStatus] = React.useState('Pronto');
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // History State
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  
  // Inputs
  const [operator, setOperator] = React.useState('JESÚS');
  const [func, setFunc] = React.useState('FILIGRANA');
  const [auxTime, setAuxTime] = React.useState(8.3);


  React.useEffect(() => {
    if (isRunning && remainingSec > 0) {
      timerRef.current = setTimeout(() => {
        setRemainingSec(rem => rem - 1);
      }, 1000);
    } else if (remainingSec === 0 && isRunning) {
      handleStop();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, remainingSec]);

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    setStatus('Medindo...');
  };

  const handleStop = () => {
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (pieces > 0) {
        const newEntry: HistoryEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleString('pt-BR'),
            operator,
            func,
            interval: intervalSec,
            pieces,
            rate: Math.round(pieces * (3600 / intervalSec)),
        };
        setHistory(prev => [newEntry, ...prev].slice(0, 25));
        toast({ title: "Intervalo salvo no histórico!" });
    }
    
    setStatus('Finalizado');
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    setRemainingSec(intervalSec);
    setPieces(0);
    setStatus('Pronto');
  };

  const selectPreset = (sec: number) => {
    handleReset();
    setIntervalSec(sec);
    setRemainingSec(sec);
  }

  const rate = isFinite(pieces * (3600 / intervalSec)) ? Math.round(pieces * (3600 / intervalSec)) : 0;
  const adjRate = Math.round(rate * (1 - (auxTime/100)));
  const progress = isRunning ? Math.max(0, 100 * (intervalSec - remainingSec) / intervalSec) : 0;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Cronômetro de Produção" />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Intervalo</div>
              <div className="flex flex-wrap gap-2">
                {[15, 30, 60, 120, 300, 600].map(sec => (
                   <Button key={sec} variant={intervalSec === sec ? 'secondary' : 'outline'} size="sm" onClick={() => selectPreset(sec)}>
                       {sec >= 60 ? `${sec/60} min` : `${sec} s`}
                   </Button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Controles</div>
              <div className="flex flex-wrap gap-2">
                <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold" onClick={handleStart} disabled={isRunning}>Iniciar</Button>
                <Button variant="destructive" onClick={handleStop} disabled={!isRunning}>Finalizar</Button>
                <Button variant="outline" onClick={handleReset} disabled={isRunning}>Reiniciar</Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Operador</div>
              <Input value={operator} onChange={e => setOperator(e.target.value)} placeholder="Nome do operador" />
            </div>
             <div>
              <div className="text-sm text-muted-foreground mb-1">Função</div>
              <Input value={func} onChange={e => setFunc(e.target.value)} placeholder="Ex: Costura" />
            </div>
             <div>
              <div className="text-sm text-muted-foreground mb-1">Tempo auxiliar (%)</div>
              <Input type="number" value={auxTime} onChange={e => setAuxTime(parseFloat(e.target.value))} placeholder="Ex: 8.3" />
            </div>
          </div>

          <div>
             <div className="flex items-center gap-4">
                <div className="font-mono text-5xl font-black text-cyan-300">{`${String(Math.floor(remainingSec/60)).padStart(2,'0')}:${String(remainingSec%60).padStart(2,'0')}`}</div>
                <div className="flex-grow h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-400" style={{width: `${progress}%`, transition: 'width 0.5s linear'}}></div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary p-3 rounded-lg"><div className="text-sm text-muted-foreground">Peças</div><div className="text-2xl font-bold">{pieces}</div></div>
            <div className="bg-secondary p-3 rounded-lg"><div className="text-sm text-muted-foreground">Média/h</div><div className="text-2xl font-bold">{rate}</div></div>
            <div className="bg-secondary p-3 rounded-lg"><div className="text-sm text-muted-foreground">Média/h ajust.</div><div className="text-2xl font-bold">{adjRate}</div></div>
            <div className="bg-secondary p-3 rounded-lg"><div className="text-sm text-muted-foreground">Estado</div><div className="text-2xl font-bold">{status}</div></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4 my-4">
        <Button 
            className="w-16 h-16 rounded-full text-3xl font-bold" 
            variant="outline" 
            onClick={() => setPieces(p => Math.max(0, p-1))}
            disabled={!isRunning}
        >−</Button>
        <Button 
            className="w-24 h-24 rounded-full text-5xl font-bold bg-green-500 hover:bg-green-600 text-black"
            onClick={() => setPieces(p => p+1)}
            disabled={!isRunning}
        >+</Button>
      </div>

       <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Histórico</h2>
            <div>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Exportado!" })}>Exportar CSV</Button>
              <Button variant="destructive" size="sm" className="ml-2" onClick={() => setHistory([])}>Limpar</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Intervalo</TableHead>
                  <TableHead>Peças</TableHead>
                  <TableHead>Média/h</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length > 0 ? history.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>{row.timestamp}</TableCell>
                    <TableCell>{row.operator}</TableCell>
                    <TableCell>{row.func}</TableCell>
                    <TableCell>{row.interval} s</TableCell>
                    <TableCell>{row.pieces}</TableCell>
                    <TableCell>{row.rate}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">Sem registros no histórico</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
