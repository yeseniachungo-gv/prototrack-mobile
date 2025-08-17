"use client";
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Observation } from '@/lib/types';
import { AlertTriangle, MessageSquare, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';


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

  const [popoverState, setPopoverState] = useState<{
    open: boolean;
    worker: string;
    hour: string;
  }>({ open: false, worker: '', hour: '' });

  const currentObservation = useMemo(() => {
    if (!popoverState.open || !func) return null;
    return func.observations.find(o => o.worker === popoverState.worker && o.hour === popoverState.hour) || null;
  }, [popoverState, func]);


  const handlePieceChange = (workerIndex: number, hourIndex: number, value: string) => {
    if (!day || !func) return;
    
    const workerName = func.workers[workerIndex];
    const hour = func.hours[hourIndex];

    let obsIndex = func.observations.findIndex(o => o.worker === workerName && o.hour === hour);
    let observation: Observation;

    if (obsIndex === -1) {
       observation = {
        id: crypto.randomUUID(),
        timestamp: new Date().getTime(),
        type: 'note',
        worker: workerName,
        hour: hour,
        pieces: parseInt(value) || 0,
        reason: '',
        detail: '',
        duration: 0,
      };
    } else {
       observation = {
        ...func.observations[obsIndex],
        pieces: parseInt(value) || 0,
      };
    }

    dispatch({ type: 'UPDATE_OBSERVATION', payload: { dayId: day.id, functionId: func.id, observation }});
  };

  const handleObsChange = (field: keyof Observation, value: string | number) => {
    if (!day || !func || !popoverState.open) return;
    
    let obsIndex = func.observations.findIndex(o => o.worker === popoverState.worker && o.hour === popoverState.hour);
    let observation: Observation;

    if (obsIndex === -1) {
       observation = {
        id: crypto.randomUUID(),
        timestamp: new Date().getTime(),
        type: 'note',
        worker: popoverState.worker,
        hour: popoverState.hour,
        pieces: 0,
        reason: '',
        detail: '',
        duration: 0,
        [field]: value
      };
    } else {
       observation = {
        ...func.observations[obsIndex],
        [field]: value
      };
    }
     dispatch({ type: 'UPDATE_OBSERVATION', payload: { dayId: day.id, functionId: func.id, observation }});
  }

  const getCellData = (workerName: string, hour: string) => {
    return func?.observations.find(obs => obs.worker === workerName && obs.hour === hour);
  };

  const handleWorkerNameChange = (workerIndex: number, newName: string) => {
    if (!day || !func || !newName.trim()) return;

    const oldName = func.workers[workerIndex];
    const updatedWorkers = [...func.workers];
    updatedWorkers[workerIndex] = newName.trim();

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

    const updatedHours = [...func.hours, nextHour].sort((a,b) => a.localeCompare(b));
    const updatedFunction = { ...func, hours: updatedHours };
    dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: day.id, functionData: updatedFunction } });
  };

  const handleClearSheet = () => {
    if (!day || !func || !confirm("Zerar todos os valores desta planilha?")) return;
    const updatedObservations = func.observations.map(obs => ({ ...obs, pieces: 0, reason:'', detail:'', type:'note', duration:0 }));
    const updatedFunction = { ...func, observations: updatedObservations };
    dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: day.id, functionData: updatedFunction }});
    toast({ title: "Planilha zerada." });
  };

  const hourlyTotals = useMemo(() => {
    if (!func) return [];
    return func.hours.map(hour => 
      func.observations.reduce((total, obs) => obs.hour === hour ? total + (obs.pieces || 0) : total, 0)
    );
  }, [func]);
  
  const workerTotals = useMemo(() => {
     if (!func) return [];
     return func.workers.map(worker =>
        func.observations.reduce((total, obs) => obs.worker === worker ? total + (obs.pieces || 0) : total, 0)
     )
  }, [func])

  if (!func || !day) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-2 sm:p-4">
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
        <div className="flex-1 relative mt-4">
          <ScrollArea className="absolute inset-0 w-full h-full">
            <table className="min-w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr>
                  <th className="p-2 border font-bold min-w-[170px] text-left sticky left-0 bg-card z-20">Trabalhador</th>
                  {func.hours.map(hour => (
                    <th key={hour} className="p-2 border font-bold min-w-[110px]">{hour}</th>
                  ))}
                  <th className="p-2 border font-bold min-w-[80px] sticky right-0 bg-card z-20">Total</th>
                </tr>
              </thead>
              <tbody>
                {func.workers.map((worker, workerIndex) => (
                  <tr key={workerIndex}>
                    <td className="p-1 border align-middle sticky left-0 bg-card z-10">
                       <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={() => handleDeleteWorker(workerIndex)}>
                            <span className="text-red-500 text-xl">×</span>
                          </Button>
                          <Input
                            value={worker}
                            onChange={(e) => handleWorkerNameChange(workerIndex, e.target.value)}
                            className="font-bold flex-1"
                            aria-label={`Nome do trabalhador ${workerIndex + 1}`}
                          />
                       </div>
                    </td>
                    {func.hours.map((hour, hourIndex) => {
                       const cellData = getCellData(worker, hour);
                       const hasObs = cellData?.reason || cellData?.detail;
                       return(
                       <td key={hourIndex} className="p-1 border align-middle">
                         <div className="flex items-center gap-1">
                           <Input
                             type="number"
                             value={cellData?.pieces || ''}
                             placeholder="0"
                             onChange={(e) => handlePieceChange(workerIndex, hourIndex, e.target.value)}
                             className="w-full text-center"
                             aria-label={`Peças para ${worker} às ${hour}`}
                           />
                           <Popover
                              open={popoverState.open && popoverState.worker === worker && popoverState.hour === hour}
                              onOpenChange={(open) => setPopoverState({ open, worker, hour })}
                            >
                              <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className={cn("w-7 h-7 shrink-0", hasObs && "bg-accent/30")}>
                                      {cellData?.type === 'downtime' && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                                      {cellData?.type === 'defect' && <Tag className="w-4 h-4 text-red-500" />}
                                      {(!cellData?.type || cellData.type === 'note') && <MessageSquare className={cn("w-4 h-4", hasObs ? 'text-accent' : 'text-muted-foreground/50')} />}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Observação</h4>
                                    <p className="text-sm text-muted-foreground">
                                       Adicione detalhes para {worker} às {hour}.
                                    </p>
                                  </div>
                                  <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                      <Label htmlFor="obs-type">Tipo</Label>
                                       <div className="col-span-2 flex gap-1">
                                          <Button size="sm" variant={currentObservation?.type === 'note' || !currentObservation ? 'secondary' : 'outline'} onClick={()=>handleObsChange('type', 'note')}>Nota</Button>
                                          <Button size="sm" variant={currentObservation?.type === 'downtime' ? 'secondary' : 'outline'} onClick={()=>handleObsChange('type', 'downtime')}>Parada</Button>
                                          <Button size="sm" variant={currentObservation?.type === 'defect' ? 'secondary' : 'outline'} onClick={()=>handleObsChange('type', 'defect')}>Defeito</Button>
                                       </div>
                                    </div>
                                     {currentObservation?.type === 'downtime' && (
                                       <div className="grid grid-cols-3 items-center gap-4">
                                         <Label htmlFor="obs-duration">Duração (min)</Label>
                                         <Input id="obs-duration" type="number" value={currentObservation?.duration || ''} onChange={e=>handleObsChange('duration', parseInt(e.target.value))} className="col-span-2 h-8" />
                                       </div>
                                     )}
                                    <div className="grid grid-cols-3 items-center gap-4">
                                      <Label htmlFor="obs-reason">Motivo</Label>
                                      <Input id="obs-reason" value={currentObservation?.reason || ''} onChange={e=>handleObsChange('reason', e.target.value)} className="col-span-2 h-8" />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                      <Label htmlFor="obs-detail">Detalhe</Label>
                                      <Textarea id="obs-detail" value={currentObservation?.detail || ''} onChange={e=>handleObsChange('detail', e.target.value)} className="col-span-2" rows={3}/>
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                         </div>
                       </td>
                       )
                    })}
                     <td className="p-1 border align-middle text-center font-bold sticky right-0 bg-card z-10">
                        {workerTotals[workerIndex]}
                     </td>
                  </tr>
                ))}
                <tr className="bg-muted">
                    <td className="p-2 border font-bold text-left sticky left-0 bg-muted z-20">Total/hora</td>
                    {hourlyTotals.map((total, index) => (
                        <td key={index} className="p-2 border font-bold text-center">{total}</td>
                    ))}
                    <td className="p-2 border font-bold text-center bg-primary text-primary-foreground sticky right-0 z-20">
                        {hourlyTotals.reduce((a,b) => a+b, 0)}
                    </td>
                </tr>
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
