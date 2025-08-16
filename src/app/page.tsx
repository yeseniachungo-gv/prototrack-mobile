"use client";

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import FunctionCard from '@/components/FunctionCard';
import FunctionSheet from '@/components/FunctionSheet';
import { Day, FunctionEntry } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [selectedFunc, setSelectedFunc] = React.useState<FunctionEntry | null>(null);
  
  const currentDay = state.days.find(d => d.id === state.activeDayId) || null;

  const handleAddDayEmpty = () => {
    const allDays = state.days.map(d => d.id).sort();
    const lastDay = allDays.length > 0 ? allDays[allDays.length-1] : new Date().toISOString().split('T')[0];
    const nextDate = new Date(lastDay);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    const newDayId = nextDate.toISOString().split('T')[0];

    const newDay: Day = {
      id: newDayId,
      name: `Dia ${newDayId}`,
      date: new Date(newDayId).toISOString(),
      functions: [],
    };
    dispatch({ type: 'ADD_DAY', payload: newDay });
    dispatch({ type: 'SET_ACTIVE_DAY', payload: newDay.id });
    toast({ title: 'Dia vazio criado.' });
  };
  
  const handleCloneDay = (withData: boolean) => {
    if (!currentDay) {
      toast({ title: "Nenhum dia para clonar", variant: "destructive" });
      return;
    }
    dispatch({ type: 'CLONE_DAY', payload: { dayId: currentDay.id, withData } });
    toast({ title: `Dia ${currentDay.name} clonado!` });
  };

  const handleRenameDay = () => {
    if (!currentDay) return;
    const newDayId = prompt('Informe a nova data (YYYY-MM-DD):', currentDay.id);
    if (!newDayId || !/^\d{4}-\d{2}-\d{2}$/.test(newDayId)) {
        if(newDayId) alert('Formato inválido. Use YYYY-MM-DD.');
        return;
    }
    if (state.days.some(d => d.id === newDayId)) {
        alert('Já existe um dia com essa data.');
        return;
    }

    const updatedDay = { ...currentDay, id: newDayId, date: new Date(newDayId).toISOString() };
    dispatch({ type: 'UPDATE_DAY', payload: { dayId: currentDay.id, newDayId: newDayId, dayData: updatedDay } });
    toast({ title: "Dia renomeado." });
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

  const handleAddFunction = () => {
    const name = prompt("Nome da nova função:", "Nova Função");
    if (name && currentDay) {
      dispatch({
        type: 'ADD_FUNCTION',
        payload: {
          dayId: currentDay.id,
          functionData: {
            name,
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

  const sortedDays = [...state.days].sort((a,b) => a.id.localeCompare(b.id));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardContent className="p-4">
          <CardTitle className="text-xl mb-2">Dia</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-base font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                  {currentDay ? format(new Date(currentDay.date), 'dd/MM/yyyy', { locale: ptBR }) : 'Nenhum dia'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sortedDays.map(day => (
                  <DropdownMenuItem key={day.id} onSelect={() => dispatch({ type: 'SET_ACTIVE_DAY', payload: day.id })}>
                    {format(new Date(day.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-grow" />
            <Button size="sm" onClick={() => handleCloneDay(false)}><Plus className="mr-1 h-4 w-4" /> Dia</Button>
            <Button size="sm" variant="outline" onClick={() => handleCloneDay(true)}>Clonar</Button>
            <Button size="sm" variant="outline" onClick={handleRenameDay}>Renomear</Button>
            <Button size="sm" variant="destructive" onClick={handleDeleteDay}>Excluir</Button>
            <Button size="sm" variant="outline" onClick={handleAddDayEmpty}>Dia vazio</Button>
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
                <div className="border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800 p-4 rounded-r-lg dark:bg-yellow-900/20 dark:text-yellow-300">
                    Sem funções neste dia. Toque em “+ Adicionar função”.
                </div>
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
            <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold">Paradas: {daySummary.stops} min</div>
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
           <div className="h-4 bg-secondary rounded-full mt-3 overflow-hidden">
             <div className="h-full bg-primary w-[0%]"></div>
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
