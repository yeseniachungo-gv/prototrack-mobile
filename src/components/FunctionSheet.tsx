"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Day, FunctionEntry, Observation } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface FunctionSheetProps {
  day: Day | null;
  func: FunctionEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

const OBSERVATION_REASONS = ['Troca de função', 'Treinamento', 'Manutenção de máquina', 'Pausa prolongada', 'Outro'];

export default function FunctionSheet({ day, func, isOpen, onClose }: FunctionSheetProps) {
  const { dispatch } = useAppContext();
  const { toast } = useToast();

  const handleCellChange = (worker: string, hour: string, field: keyof Observation, value: string | number) => {
    if (!day || !func) return;

    const existingObs = func.observations.find(obs => obs.hour === hour && obs.worker === worker);
    
    const updatedObs: Observation = {
        id: existingObs?.id || crypto.randomUUID(),
        timestamp: existingObs?.timestamp || new Date().getTime(),
        type: existingObs?.type || 'note',
        worker,
        hour,
        pieces: existingObs?.pieces || 0,
        reason: existingObs?.reason || '',
        detail: existingObs?.detail || '',
        ...{ [field]: value === 'none' ? '' : value }
    };
    
    dispatch({ type: 'UPDATE_OBSERVATION', payload: { dayId: day.id, functionId: func.id, observation: updatedObs } });
  };
  
  const handleEditWorkers = () => {
    if (!day || !func) return;
    const newWorkersStr = prompt("Edite os trabalhadores (um por linha):", func.workers.join('\\n'));
    if (newWorkersStr) {
      const newWorkers = newWorkersStr.split('\\n').map(w => w.trim()).filter(Boolean);
      if (newWorkers.length > 0) {
        const updatedFunction = { ...func, workers: newWorkers };
        dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: day.id, functionData: updatedFunction }});
        toast({ title: "Trabalhadores atualizados." });
      } else {
        alert("É necessário pelo menos um trabalhador.");
      }
    }
  };

  const handleAddHour = () => {
    if (!day || !func) return;
    const lastHour = func.hours.length > 0 ? func.hours[func.hours.length - 1] : '07:00';
    const [h] = lastHour.split(':').map(Number);
    const nextHour = `${String(h + 1).padStart(2, '0')}:00`;
    if (!func.hours.includes(nextHour)) {
      const updatedFunction = { ...func, hours: [...func.hours, nextHour] };
      dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: day.id, functionData: updatedFunction }});
    }
  }

  const getCellData = (worker: string, hour: string) => {
    return func?.observations.find(obs => obs.worker === worker && obs.hour === hour);
  };

  if (!func || !day) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Planilha — {func.name}</DialogTitle>
          <div className="flex flex-wrap gap-2 pt-4">
            <Button onClick={handleAddHour}>+ Hora</Button>
            <Button onClick={handleEditWorkers}>Trabalhadores</Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-card z-10">
                <tr>
                  <th className="p-2 border font-bold min-w-[100px]">Hora</th>
                  {func.workers.map(worker => (
                    <th key={worker} className="p-2 border font-bold">{worker}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {func.hours.map(hour => (
                  <tr key={hour}>
                    <td className="p-2 border font-bold">{hour}</td>
                    {func.workers.map(worker => {
                      const cellData = getCellData(worker, hour);
                      const hasObs = cellData?.reason || cellData?.detail;
                      return (
                        <td key={worker} className="p-2 border align-top">
                          <div className="space-y-2">
                             <div className="p-2 rounded-md border bg-background/50">
                                <Label>Peças</Label>
                                <Input
                                  type="number"
                                  value={cellData?.pieces || 0}
                                  onChange={(e) => handleCellChange(worker, hour, 'pieces', parseInt(e.target.value) || 0)}
                                  className="w-full"
                                />
                             </div>
                             <div className="p-2 rounded-md border bg-background/50">
                                <Label className="flex items-center gap-2">
                                  Observação {hasObs && <span className="text-primary">•</span>}
                                </Label>
                                <div className="space-y-1 mt-1">
                                    <Select
                                        value={cellData?.reason || ''}
                                        onValueChange={(value) => handleCellChange(worker, hour, 'reason', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Motivo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">—</SelectItem>
                                            {OBSERVATION_REASONS.map(reason => (
                                                <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Detalhe (opcional)"
                                        value={cellData?.detail || ''}
                                        onChange={(e) => handleCellChange(worker, hour, 'detail', e.target.value)}
                                        maxLength={140}
                                    />
                                </div>
                             </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
