"use client";
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface FunctionSheetProps {
  dayId: string;
  funcId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FunctionSheet({ dayId, funcId, isOpen, onClose }: FunctionSheetProps) {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  
  const day = state.days.find(d => d.id === dayId);
  const func = day?.functions.find(f => f.id === funcId);

  const handlePieceChange = (workerIndex: number, hourIndex: number, value: string) => {
    if (!day || !func) return;

    const updatedWorkers = [...func.workers];
    const updatedObservations = [...func.observations];
    
    const workerName = updatedWorkers[workerIndex];
    const hour = func.hours[hourIndex];

    let obsIndex = updatedObservations.findIndex(o => o.worker === workerName && o.hour === hour);
    
    if (obsIndex === -1) {
      updatedObservations.push({
        id: crypto.randomUUID(),
        timestamp: new Date().getTime(),
        type: 'note',
        worker: workerName,
        hour: hour,
        pieces: parseInt(value) || 0,
        reason: '',
        detail: '',
        duration: 0,
      });
    } else {
      updatedObservations[obsIndex] = {
        ...updatedObservations[obsIndex],
        pieces: parseInt(value) || 0,
      };
    }
    
    const updatedFunction = { ...func, observations: updatedObservations };
    dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: day.id, functionData: updatedFunction }});
  };

  const getPiecesForCell = (workerName: string, hour: string): number => {
    return func?.observations.find(obs => obs.worker === workerName && obs.hour === hour)?.pieces || 0;
  };

  const handleWorkerNameChange = (workerIndex: number, newName: string) => {
    if (!day || !func || !newName.trim()) return;

    const oldName = func.workers[workerIndex];
    const updatedWorkers = [...func.workers];
    updatedWorkers[workerIndex] = newName.trim();

    // Update observations to reflect the new worker name
    const updatedObservations = func.observations.map(obs => {
        if (obs.worker === oldName) {
            return { ...obs, worker: newName.trim() };
        }
        return obs;
    });

    const updatedFunction = { ...func, workers: updatedWorkers, observations: updatedObservations };
    dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: day.id, functionData: updatedFunction } });
  };
  
  const handleAddWorker = () => {
    if (!day || !func) return;
    const newWorkerName = `Trabalhador ${func.workers.length + 1}`;
    const updatedFunction = { ...func, workers: [...func.workers, newWorkerName] };
    dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: day.id, functionData: updatedFunction }});
  };

  const handleDeleteWorker = (workerIndex: number) => {
    if (!day || !func || func.workers.length <= 1) {
      toast({ title: "Deve haver pelo menos um trabalhador.", variant: 'destructive' });
      return;
    };
     if (!confirm(`Tem certeza que deseja remover ${func.workers[workerIndex]}?`)) return;

    const workerNameToDelete = func.workers[workerIndex];
    const updatedWorkers = func.workers.filter((_, index) => index !== workerIndex);
    const updatedObservations = func.observations.filter(obs => obs.worker !== workerNameToDelete);

    const updatedFunction = { ...func, workers: updatedWorkers, observations: updatedObservations };
    dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: day.id, functionData: updatedFunction }});
  };
  
  const handleAddHour = (manual = false) => {
    if (!day || !func) return;
    let nextHour: string | null = null;
    if (manual) {
      nextHour = prompt("Nova hora (HH:MM):", "18:00");
      if (!nextHour || !/^\d{2}:\d{2}$/.test(nextHour)) {
        if(nextHour) toast({ title: "Formato de hora inválido.", variant: 'destructive'});
        return;
      }
    } else {
      const lastHour = func.hours.length > 0 ? func.hours[func.hours.length - 1] : '07:00';
      const [h] = lastHour.split(':').map(Number);
      nextHour = `${String(h + 1).padStart(2, '0')}:00`;
    }
    
    if (func.hours.includes(nextHour)) {
      toast({ title: "Esta hora já existe.", variant: 'destructive'});
      return;
    }

    const updatedHours = [...func.hours, nextHour].sort();
    const updatedFunction = { ...func, hours: updatedHours };
    dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: day.id, functionData: updatedFunction } });
  };

  const handleClearSheet = () => {
    if (!day || !func || !confirm("Zerar todos os valores desta planilha?")) return;
    const updatedObservations = func.observations.map(obs => ({ ...obs, pieces: 0 }));
    const updatedFunction = { ...func, observations: updatedObservations };
    dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: day.id, functionData: updatedFunction }});
    toast({ title: "Planilha zerada." });
  };

  const hourlyTotals = useMemo(() => {
    if (!func) return [];
    return func.hours.map(hour => 
      func.workers.reduce((total, worker) => total + (getPiecesForCell(worker, hour) || 0), 0)
    );
  }, [func]);

  if (!func || !day) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-2 sm:p-4">
        <DialogHeader className="p-2 sm:p-0">
          <DialogTitle>Planilha — {day.name} — {func.name}</DialogTitle>
          <div className="flex flex-wrap gap-2 pt-4">
            <Button size="sm" onClick={handleAddWorker}>+ Trabalhador</Button>
            <Button size="sm" onClick={() => handleAddHour(false)}>+ Próx. Hora</Button>
            <Button size="sm" onClick={() => handleAddHour(true)}>+ Hora Manual</Button>
            <Button size="sm" variant="outline" onClick={handleClearSheet}>Zerar Valores</Button>
            <Button size="sm" variant="destructive" onClick={onClose} className="ml-auto">Fechar</Button>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 w-full">
          <div className="relative p-1">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-card z-10">
                <tr>
                  <th className="p-2 border font-bold min-w-[170px] text-left">Trabalhador</th>
                  {func.hours.map(hour => (
                    <th key={hour} className="p-2 border font-bold min-w-[80px]">{hour}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {func.workers.map((worker, workerIndex) => (
                  <tr key={workerIndex}>
                    <td className="p-1 border align-middle">
                      <div className="flex items-center gap-1">
                        <Input
                          value={worker}
                          onChange={(e) => handleWorkerNameChange(workerIndex, e.target.value)}
                          className="font-bold flex-1"
                          aria-label={`Nome do trabalhador ${workerIndex + 1}`}
                        />
                         <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleDeleteWorker(workerIndex)}>
                            <span className="text-red-500 text-xl">×</span>
                        </Button>
                      </div>
                    </td>
                    {func.hours.map((hour, hourIndex) => (
                       <td key={hourIndex} className="p-1 border align-middle">
                         <Input
                           type="number"
                           value={getPiecesForCell(worker, hour)}
                           onChange={(e) => handlePieceChange(workerIndex, hourIndex, e.target.value)}
                           className="w-full text-center"
                           aria-label={`Peças para ${worker} às ${hour}`}
                         />
                       </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-muted">
                    <td className="p-2 border font-bold text-left">Total/hora</td>
                    {hourlyTotals.map((total, index) => (
                        <td key={index} className="p-2 border font-bold text-center">{total}</td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
