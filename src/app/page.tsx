"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { Day, FunctionEntry } from '@/lib/types';
import FunctionCard from '@/components/FunctionCard';
import FunctionSheet from '@/components/FunctionSheet';

export default function HomePage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<FunctionEntry | null>(null);

  const activeDay: Day | undefined = state.days.find(d => d.id === state.activeDayId);

  const handleOpenSheet = (funcId: string) => {
    const func = activeDay?.functions.find(f => f.id === funcId);
    if (func) {
      setSelectedFunction(func);
      setSheetOpen(true);
    }
  };

  const handleAddFunction = () => {
    const name = prompt('Nome da nova função:', 'Nova Função');
    if (name) {
      dispatch({ type: 'ADD_FUNCTION', payload: { name } });
      toast({ title: 'Função adicionada!' });
    }
  };

  const handleDeleteFunction = (funcId: string) => {
    if (confirm('Tem certeza que deseja excluir esta função?')) {
      dispatch({ type: 'DELETE_FUNCTION', payload: { functionId: funcId } });
      toast({ title: 'Função excluída.' });
    }
  };

  const handleEditFunction = (funcId: string) => {
     const func = activeDay?.functions.find(f => f.id === funcId);
     if(!func) return;
     const newName = prompt('Novo nome para a função:', func.name);
     if(newName) {
        dispatch({ type: 'UPDATE_FUNCTION', payload: { dayId: activeDay!.id, functionData: {...func, name: newName} }})
        toast({ title: 'Função atualizada.'})
     }
  }
  
  const totalPieces = activeDay?.functions.reduce((acc, func) => {
      return acc + func.observations.reduce((fAcc, obs) => fAcc + (obs.pieces || 0), 0);
  }, 0) || 0;

  const downtimeMinutes = activeDay?.functions.reduce((acc, func) => {
      return acc + func.observations.filter(o => o.type === 'downtime').length * 5; // Placeholder
  }, 0) || 0;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Planilhas do Dia">
        <div className="text-sm font-medium text-muted-foreground">{activeDay?.name || 'Nenhum dia selecionado'}</div>
      </Header>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
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
           {activeDay?.functions.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                Nenhuma função para este dia.
              </div>
            )}
          <Button onClick={handleAddFunction} className="w-full">+ Adicionar Função</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Resumo do dia</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <div className="bg-secondary p-2 px-3 rounded-full text-sm font-semibold">Peças: {totalPieces}</div>
            <div className="bg-secondary p-2 px-3 rounded-full text-sm font-semibold">Paradas: {downtimeMinutes} min</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Cronômetro (mini)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
            <div className="font-mono text-3xl font-bold">00:00</div>
            <Button onClick={() => router.push('/stopwatch')}>Abrir cronômetro</Button>
        </CardContent>
      </Card>


      {selectedFunction && activeDay && (
        <FunctionSheet
          day={activeDay}
          func={selectedFunction}
          isOpen={isSheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
