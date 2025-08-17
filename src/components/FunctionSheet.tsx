"use client";
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { FunctionEntry, Observation } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

// --- Observation Popover Component ---
interface ObservationPopoverProps {
  dayId: string;
  functionId: string;
  worker: string;
  hour: string;
  observation: Observation | undefined;
}

const ObservationPopover: React.FC<ObservationPopoverProps> = ({ dayId, functionId, worker, hour, observation }) => {
  const { activeProfile, dispatch } = useAppContext();
  const { toast } = useToast();
  
  const [reason, setReason] = useState(observation?.reason || '');
  const [detail, setDetail] = useState(observation?.detail || '');
  const [minutesStopped, setMinutesStopped] = useState(observation?.minutesStopped || 0);
  const [isOpen, setIsOpen] = useState(false);

  if (!activeProfile) return null;

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_OBSERVATION',
      payload: { dayId, functionId, worker, hour, reason, detail, minutesStopped: showMinutesInput ? minutesStopped : 0 }
    });
    toast({ title: "Observação salva!" });
    setIsOpen(false);
  };
  
  const showMinutesInput = reason === 'Manutenção de máquina' || reason === 'Pausa prolongada';
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant={observation?.reason || observation?.detail ? "secondary" : "ghost"} className="h-7 w-7">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-50">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Observação</h4>
            <p className="text-sm text-muted-foreground">
              Adicionar nota para {worker} às {hour}.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`motivo-${worker}-${hour}`}>Motivo</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {activeProfile.masterStopReasons.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {showMinutesInput && (
            <div className="grid gap-2">
              <Label htmlFor={`minutos-${worker}-${hour}`}>Minutos de Parada</Label>
              <Input
                id={`minutos-${worker}-${hour}`}
                type="number"
                placeholder="0"
                value={minutesStopped}
                onChange={(e) => setMinutesStopped(parseInt(e.target.value) || 0)}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor={`detalhe-${worker}-${hour}`}>Detalhe</Label>
            <Textarea
              id={`detalhe-${worker}-${hour}`}
              placeholder="Detalhes adicionais (opcional)"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};


// --- Function Sheet Component ---
interface FunctionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  func: FunctionEntry | null;
  dayId: string;
}

export default function FunctionSheet({ isOpen, onClose, func, dayId }: FunctionSheetProps) {
  const { activeProfile, dispatch } = useAppContext();
  const [newWorkerName, setNewWorkerName] = useState('');
  const { toast } = useToast();

  if (!func || !activeProfile) return null;
  
  const getCellData = (worker: string, hour: string) => {
    const key = `${worker}_${hour}`;
    return {
      pieces: func.pieces[key] || 0,
      observation: func.observations[key],
    };
  };

  const handlePiecesChange = (worker: string, hour: string, value: string) => {
     const intValue = parseInt(value) || 0;
     dispatch({
       type: 'UPDATE_PIECES',
       payload: { dayId, functionId: func.id, worker, hour, value: intValue }
     });
  };
  
  const handleAddWorker = () => {
    if (newWorkerName) {
      dispatch({ type: 'ADD_WORKER_TO_FUNCTION', payload: { dayId, functionId: func.id, workerName: newWorkerName }});
      toast({ title: `Trabalhador "${newWorkerName}" adicionado!` });
      setNewWorkerName('');
    } else {
       toast({ title: "Erro", description: "Selecione um trabalhador para adicionar.", variant: "destructive" });
    }
  };
   
  const handleDeleteWorker = (workerToDelete: string) => {
    dispatch({ type: 'DELETE_WORKER_FROM_FUNCTION', payload: { dayId, functionId: func.id, workerName: workerToDelete } });
    toast({ title: `Trabalhador "${workerToDelete}" removido.`, variant: "destructive" });
  };
  
  const handleAddHour = () => {
     dispatch({ type: 'ADD_HOUR_TO_FUNCTION', payload: { dayId, functionId: func.id } });
  };
  
  const handleDeleteHour = (hourToDelete: string) => {
    dispatch({ type: 'DELETE_HOUR_FROM_FUNCTION', payload: { dayId, functionId: func.id, hour: hourToDelete }});
    toast({ title: `Hora "${hourToDelete}" removida.`, variant: "destructive" });
  };

  const colTotals = func.hours.map(hour => 
    func.workers.reduce((sum, worker) => sum + (getCellData(worker, hour).pieces || 0), 0)
  );

  const grandTotal = colTotals.reduce((sum, total) => sum + total, 0);
  
  const availableWorkers = activeProfile.masterWorkers.filter(
    masterWorker => !func.workers.some(fnWorker => fnWorker.toLowerCase() === masterWorker.name.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-2 sm:p-4">
        <DialogHeader className="p-2 sm:p-0">
          <DialogTitle>Planilha — {func.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 mt-4 relative">
          <ScrollArea className="w-full h-full pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] sticky left-0 bg-card z-20">Trabalhador</TableHead>
                  {func.hours.map(hour => (
                    <TableHead key={hour} className="text-center min-w-[150px]">
                      <div className="flex items-center justify-center gap-1">
                        {hour}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button size="icon" variant="ghost" className="h-6 w-6">
                                <Trash2 className="h-3 w-3 text-destructive"/>
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente a coluna de horas "{hour}" e todos os dados associados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteHour(hour)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="min-w-[80px] text-center sticky right-0 bg-card z-20">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {func.workers.map(worker => (
                  <TableRow key={worker}>
                    <TableCell className="font-medium sticky left-0 bg-card z-10 flex items-center justify-between">
                      <span>{worker}</span>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button size="icon" variant="ghost" className="h-6 w-6">
                                <Trash2 className="h-3 w-3 text-destructive"/>
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Isso excluirá permanentemente o trabalhador "{worker}" e todos os seus dados nesta planilha.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteWorker(worker)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    {func.hours.map(hour => {
                      const cellData = getCellData(worker, hour);
                      return (
                        <TableCell key={hour} className="p-2 border align-top">
                          <div className="space-y-2 text-center">
                             <Input
                                type="number"
                                className="w-24 text-center mx-auto"
                                defaultValue={cellData.pieces}
                                onBlur={(e) => handlePiecesChange(worker, hour, e.target.value)}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                             <ObservationPopover
                                dayId={dayId}
                                functionId={func.id}
                                worker={worker}
                                hour={hour}
                                observation={cellData.observation}
                             />
                          </div>
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-center font-bold sticky right-0 bg-card z-10">
                       {func.hours.reduce((sum, hour) => sum + (getCellData(worker, hour).pieces || 0), 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
               <TableFooter>
                <TableRow>
                  <TableCell className="sticky left-0 bg-card z-20 font-bold">Total/Hora</TableCell>
                  {colTotals.map((total, index) => (
                    <TableCell key={index} className="text-center font-bold">{total}</TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-lg sticky right-0 bg-card z-20">{grandTotal}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <ScrollBar orientation="horizontal" className="mt-4" />
          </ScrollArea>
        </div>

        <DialogFooter className="p-2 sm:p-0 mt-4 flex-wrap gap-2 justify-between">
             <div className="flex gap-2 items-center">
                <Select value={newWorkerName} onValueChange={setNewWorkerName}>
                    <SelectTrigger className="h-10 w-[200px]">
                        <SelectValue placeholder="Selecione um trabalhador" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableWorkers.length > 0 ? (
                             availableWorkers.map(w => <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>)
                        ) : (
                            <div className="p-2 text-center text-sm text-muted-foreground">Todos já foram adicionados.</div>
                        )}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleAddWorker}><Plus className="mr-2 h-4 w-4"/>Trabalhador</Button>
                <Button variant="outline" size="sm" onClick={handleAddHour}><Plus className="mr-2 h-4 w-4"/>Hora</Button>
            </div>
            <Button size="sm" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
