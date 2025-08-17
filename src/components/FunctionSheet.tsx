"use client";
import React from 'react';
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

// --- Observation Popover Component ---
interface ObservationPopoverProps {
  worker: string;
  hour: string;
  observation: Observation | undefined;
}

const ObservationPopover: React.FC<ObservationPopoverProps> = ({ worker, hour, observation }) => {
  const motivos = ['Troca de função', 'Treinamento', 'Manutenção de máquina', 'Pausa prolongada', 'Outro'];
  
  // TODO: Implementar a lógica de salvar a observação no estado global (AppContext)
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant={observation ? "secondary" : "ghost"} className="h-7 w-7">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Observação</h4>
            <p className="text-sm text-muted-foreground">
              Adicionar nota para {worker} às {hour}.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`motivo-${worker}-${hour}`}>Motivo</Label>
            <Select defaultValue={observation?.reason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {motivos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`detalhe-${worker}-${hour}`}>Detalhe</Label>
            <Textarea
              id={`detalhe-${worker}-${hour}`}
              placeholder="Detalhes adicionais (opcional)"
              defaultValue={observation?.detail}
            />
          </div>
          <Button>Salvar</Button>
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
  const { dispatch } = useAppContext();

  if (!func) return null;
  
  const getCellData = (worker: string, hour: string) => {
    const key = `${worker}_${hour}`;
    return {
      pieces: func.pieces[key] || 0,
      observation: func.observations[key],
    };
  };

  const handlePiecesChange = (worker: string, hour: string, value: number) => {
    // TODO: Implementar dispatch para atualizar peças
  };
  
  const handleAddWorker = () => {
    // TODO: Implementar dispatch para adicionar trabalhador
  };
  
  const handleAddHour = () => {
     // TODO: Implementar dispatch para adicionar hora
  };
  
  const handleDeleteHour = (hourToDelete: string) => {
    // TODO: Implementar dispatch para deletar hora
  };

  const colTotals = func.hours.map(hour => 
    func.workers.reduce((sum, worker) => sum + (getCellData(worker, hour).pieces || 0), 0)
  );

  const grandTotal = colTotals.reduce((sum, total) => sum + total, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-2 sm:p-4">
        <DialogHeader className="p-2 sm:p-0">
          <DialogTitle>Planilha — {func.name}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 mt-4 relative">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px] sticky left-0 bg-card z-10">Trabalhador</TableHead>
                  {func.hours.map(hour => (
                    <TableHead key={hour} className="text-center min-w-[120px]">
                      <div className="flex items-center justify-center gap-1">
                        {hour}
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDeleteHour(hour)}>
                          <Trash2 className="h-3 w-3 text-destructive"/>
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="min-w-[80px] text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {func.workers.map(worker => (
                  <TableRow key={worker}>
                    <TableCell className="font-medium sticky left-0 bg-card z-10">{worker}</TableCell>
                    {func.hours.map(hour => {
                      const cellData = getCellData(worker, hour);
                      const hasObs = cellData?.observation;
                      return (
                        <TableCell key={hour} className="p-2 border align-top">
                          <div className="space-y-2">
                             <Input
                                type="number"
                                className="w-24 text-center"
                                value={cellData.pieces}
                                onChange={(e) => handlePiecesChange(worker, hour, parseInt(e.target.value) || 0)}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                             <ObservationPopover
                                worker={worker}
                                hour={hour}
                                observation={cellData.observation}
                             />
                          </div>
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-center font-bold">
                       {func.hours.reduce((sum, hour) => sum + (getCellData(worker, hour).pieces || 0), 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
               <TableFooter>
                <TableRow>
                  <TableCell className="sticky left-0 bg-card z-10 font-bold">Total/Hora</TableCell>
                  {colTotals.map((total, index) => (
                    <TableCell key={index} className="text-center font-bold">{total}</TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-lg">{grandTotal}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DialogFooter className="p-2 sm:p-0 mt-4 flex-wrap gap-2 justify-between">
            <div>
              <Button variant="outline" size="sm" onClick={handleAddWorker}><Plus className="mr-2 h-4 w-4"/>Trabalhador</Button>
              <Button variant="outline" size="sm" onClick={handleAddHour} className="ml-2"><Plus className="mr-2 h-4 w-4"/>Hora</Button>
            </div>
            <Button size="sm" variant="destructive" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
