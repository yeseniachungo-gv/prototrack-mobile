"use client";

import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { Day, FunctionEntry } from '@/lib/types';
import FunctionCard from '@/components/FunctionCard';
import FunctionSheet from '@/components/FunctionSheet';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';


export default function HomePage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();

  const [isSheetOpen, setSheetOpen] = React.useState(false);
  const [selectedFunction, setSelectedFunction] = React.useState<FunctionEntry | null>(null);
  const [newFunctionName, setNewFunctionName] = React.useState('');

  const activeDay: Day | undefined = state.days.find(d => d.id === state.activeDayId);

  const handleOpenSheet = (funcId: string) => {
    const func = activeDay?.functions.find(f => f.id === funcId);
    if (func) {
      setSelectedFunction(func);
      setSheetOpen(true);
    }
  };
  
  const handleSetActiveDay = (dayId: string) => {
    dispatch({ type: 'SET_ACTIVE_DAY', payload: dayId });
  };
  
  const handleAddDay = () => {
    const newId = prompt("Nova data (AAAA-MM-DD):", new Date(Date.now() + 864e5).toISOString().slice(0, 10));
    if (newId && /^\d{4}-\d{2}-\d{2}$/.test(newId)) {
      if (state.days.some(d => d.id === newId)) {
        toast({ title: "Este dia já existe.", variant: 'destructive' });
        return;
      }
      dispatch({ type: 'ADD_DAY', payload: { dayId: newId } });
      toast({ title: "Novo dia adicionado." });
    } else if (newId) {
      toast({ title: "Formato de data inválido.", variant: 'destructive' });
    }
  };

  const handleAddFunction = () => {
    if (!activeDay || !newFunctionName.trim()) return;
    dispatch({ type: 'ADD_FUNCTION', payload: { dayId: activeDay.id, name: newFunctionName.trim() } });
    toast({ title: 'Função adicionada!' });
    setNewFunctionName('');
  };

  const handleDeleteFunction = (funcId: string) => {
    if (confirm('Tem certeza que deseja excluir esta função?')) {
      dispatch({ type: 'DELETE_FUNCTION', payload: { functionId: funcId } });
      toast({ title: 'Função excluída.' });
    }
  };

  const handleEditFunction = (funcId: string) => {
     const func = activeDay?.functions.find(f => f.id === funcId);
     if(!func || !activeDay) return;
     const newName = prompt('Novo nome para a função:', func.name);
     if(newName) {
        dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: activeDay.id, functionData: {...func, name: newName} }})
        toast({ title: 'Função atualizada.'})
     }
  }
  
  const totalPieces = activeDay?.functions.reduce((acc, func) => {
      return acc + func.observations.reduce((fAcc, obs) => fAcc + (obs.pieces || 0), 0);
  }, 0) || 0;

  const downtimeMinutes = activeDay?.functions.reduce((acc, func) => {
      return acc + func.observations.filter(o => o.type === 'downtime').reduce((dAcc, obs) => dAcc + (obs.duration || 0), 0);
  }, 0) || 0;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Planilhas" />
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {state.days.map(day => (
                <Button 
                  key={day.id}
                  variant={day.id === state.activeDayId ? 'secondary' : 'outline'}
                  onClick={() => handleSetActiveDay(day.id)}
                  className="shrink-0"
                >
                  {day.name}
                </Button>
              ))}
               <Button onClick={handleAddDay} variant="outline" className="shrink-0">+ Adicionar Dia</Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Resumo do dia</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <div className="bg-secondary p-2 px-3 rounded-full text-sm font-semibold">Peças: {totalPieces}</div>
            <div className="bg-secondary p-2 px-3 rounded-full text-sm font-semibold">Paradas: {downtimeMinutes} min</div>
            <div className="bg-secondary p-2 px-3 rounded-full text-sm font-semibold">Funções: {activeDay?.functions.length || 0}</div>
        </CardContent>
      </Card>

      <Card>
         <CardHeader>
            <CardTitle className="text-lg">Adicionar Nova Função</CardTitle>
         </CardHeader>
        <CardContent className="p-4 flex gap-2">
            <Input 
              placeholder="Nome da nova função (ex.: Costura)" 
              value={newFunctionName}
              onChange={(e) => setNewFunctionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFunction()}
            />
            <Button onClick={handleAddFunction}>+ Adicionar</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
          {activeDay?.functions.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma função para este dia. Adicione uma acima.
            </div>
          )}
          {activeDay?.functions.map(func => (
            <FunctionCard
                key={func.id}
                func={func}
                onOpenSheet={handleOpenSheet}
                onEdit={handleEditFunction}
                onDelete={handleDeleteFunction}
            />
          ))}
      </div>
      

      {selectedFunction && activeDay && (
        <FunctionSheet
          dayId={activeDay.id}
          funcId={selectedFunction.id}
          isOpen={isSheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
