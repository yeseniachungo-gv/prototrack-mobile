"use client";

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import FunctionCard from '@/components/FunctionCard';
import FunctionSheet from '@/components/FunctionSheet';
import { FunctionEntry } from '@/lib/types';

export default function Home() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [isAddDayOpen, setIsAddDayOpen] = React.useState(false);
  const [newDayName, setNewDayName] = React.useState('');
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [selectedFunc, setSelectedFunc] = React.useState<FunctionEntry | null>(null);
  
  const currentDay = state.days.find(d => d.id === state.activeDayId) || null;

  const handleAddDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDayName.trim()) {
      const newDayId = crypto.randomUUID();
      dispatch({
        type: 'ADD_DAY',
        payload: {
          id: newDayId,
          name: newDayName.trim(),
          date: new Date().toISOString(),
          functions: [],
        },
      });
      dispatch({ type: 'SET_ACTIVE_DAY', payload: newDayId });
      setNewDayName('');
      setIsAddDayOpen(false);
      toast({ title: "Dia adicionado!" });
    }
  };

  const handleAddFunction = () => {
    const name = prompt("Nome da nova função:", "Nova Função");
    if (name && currentDay) {
      dispatch({
        type: 'ADD_FUNCTION',
        payload: {
          dayId: currentDay.id,
          functionData: {
            id: crypto.randomUUID(),
            name,
            description: '',
            worker: 'Default',
            observations: [],
            checklists: [],
            workers: ['Operador 1', 'Operador 2'],
            hours: ['08:00', '09:00', '10:00', '11:00'],
          }
        }
      });
      toast({ title: "Função adicionada" });
    }
  };
  
  const daySummary = React.useMemo(() => {
    if (!currentDay) return { pieces: 0, stops: 0, topFunction: 'N/A' };
    const pieces = currentDay.functions.reduce((acc, func) => acc + func.observations.reduce((pAcc, p) => pAcc + (p.pieces || 0), 0), 0);
    const stops = currentDay.functions.reduce((acc, func) => acc + func.observations.filter(o => o.type === 'downtime').length, 0);
    
    let topFunction = 'N/A';
    let maxPieces = -1;

    currentDay.functions.forEach(func => {
        const funcPieces = func.observations.reduce((pAcc, p) => pAcc + (p.pieces || 0), 0);
        if (funcPieces > maxPieces) {
            maxPieces = funcPieces;
            topFunction = func.name;
        }
    });

    return { pieces, stops, topFunction };
  }, [currentDay]);

  const handleOpenSheet = (funcId: string) => {
    const func = currentDay?.functions.find(f => f.id === funcId);
    if (func) {
      setSelectedFunc(func);
      setIsSheetOpen(true);
    }
  };

  const handleEditFunction = (funcId: string) => {
    const func = currentDay?.functions.find(f => f.id === funcId);
    if (func && currentDay) {
        const newName = prompt("Novo nome para a função:", func.name);
        if (newName && newName.trim()) {
            const updatedFunc = { ...func, name: newName.trim() };
            dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: currentDay.id, functionData: updatedFunc } });
            toast({ title: "Função atualizada!" });
        }
    }
  };
  
  const handleDeleteFunction = (funcId: string) => {
    if (currentDay && confirm("Tem certeza que deseja excluir esta função?")) {
        dispatch({ type: 'DELETE_FUNCTION', payload: { dayId: currentDay.id, functionId: funcId } });
        toast({ title: "Função excluída." });
    }
  };
  
  const handleCloneDay = () => {
    if (!currentDay) {
      toast({ title: "Nenhum dia para clonar", variant: "destructive" });
      return;
    }
    dispatch({ type: 'CLONE_DAY', payload: { dayId: currentDay.id } });
    toast({ title: `Dia ${currentDay.name} clonado!` });
  };
  
  const handleDeleteDay = () => {
      if (!currentDay || state.days.length <= 1) {
          toast({ title: "Não é possível excluir o único dia.", variant: "destructive" });
          return;
      }
      if (confirm(`Tem certeza que deseja excluir o dia "${currentDay.name}"?`)) {
          dispatch({ type: 'DELETE_DAY', payload: { dayId: currentDay.id } });
          toast({ title: "Dia excluído" });
      }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardContent className="p-4">
          <CardTitle className="text-xl mb-2">Dia</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              {currentDay ? `${currentDay.name} - ${format(new Date(currentDay.date), 'dd/MM/yyyy', { locale: ptBR })}` : 'Nenhum dia'}
            </div>
            <div className="flex-grow" />
            <Dialog open={isAddDayOpen} onOpenChange={setIsAddDayOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Dia</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Adicionar Novo Dia</DialogTitle></DialogHeader>
                <form onSubmit={handleAddDay} className="space-y-4">
                  <div>
                    <Label htmlFor="day-name">Nome do Dia</Label>
                    <Input id="day-name" value={newDayName} onChange={(e) => setNewDayName(e.target.value)} placeholder="Ex: Sessão de Teste 1" required />
                  </div>
                  <Button type="submit" className="w-full">Criar Dia</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={handleCloneDay}>Clonar</Button>
            <Button size="sm" variant="destructive" onClick={handleDeleteDay}>Excluir</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <CardTitle className="text-xl mb-2">Funções de produção</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDay?.functions.map(func => (
              <FunctionCard 
                key={func.id} 
                func={func}
                onOpenSheet={handleOpenSheet}
                onEdit={handleEditFunction}
                onDelete={handleDeleteFunction}
              />
            ))}
             {currentDay && currentDay.functions.length === 0 && (
                <p className="text-muted-foreground col-span-full">Nenhuma função adicionada a este dia.</p>
            )}
          </div>
          <Button className="mt-4" onClick={handleAddFunction} disabled={!currentDay}><Plus className="mr-2 h-4 w-4" /> Adicionar função</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <CardTitle className="text-xl mb-2">Resumo do dia</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Peças: {daySummary.pieces}</div>
            <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Paradas: {daySummary.stops}</div>
            <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Top por função: {daySummary.topFunction}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <CardTitle className="text-xl mb-2">Cronômetro (mini)</CardTitle>
           <div className="flex items-center gap-4">
             <div className="font-mono text-4xl font-bold text-primary">00:00</div>
             <div className="flex-grow" />
             <Button variant="outline" onClick={() => toast({title: "Em breve"})}>Fixar/Desfixar</Button>
             <Button onClick={() => router.push('/stopwatch')}>Abrir cronômetro</Button>
           </div>
           <div className="h-3.5 bg-secondary rounded-full mt-3 overflow-hidden">
             <div className="h-full bg-primary w-[35%]"></div>
           </div>
        </CardContent>
      </Card>
      
      <FunctionSheet 
        day={currentDay}
        func={selectedFunc}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
