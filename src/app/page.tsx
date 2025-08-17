"use client";

import React, { useMemo } from 'react';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HomePage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();

  const [isSheetOpen, setSheetOpen] = React.useState(false);
  const [selectedFunction, setSelectedFunction] = React.useState<FunctionEntry | null>(null);
  const [newFunctionName, setNewFunctionName] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

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
    if (confirm('Tem certeza que deseja excluir esta função e todos os seus dados?')) {
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
  };

  const formatDay = (id: string) => {
    try {
        const date = new Date(id + 'T00:00:00'); // Assume local timezone
        return format(date, "EEE, dd 'de' MMM. 'de' yyyy", { locale: ptBR });
    } catch (e) {
        return "Data inválida";
    }
  };
  
  const daySummary = useMemo(() => {
    if (!activeDay) return { totalPieces: 0, pph: 0, downtimeMinutes: 0 };
    
    let totalPieces = 0;
    let totalHoursWithProduction = 0;
    
    activeDay.functions.forEach(func => {
      const functionPieces = func.observations.reduce((acc, obs) => acc + (obs.pieces || 0), 0);
      totalPieces += functionPieces;
      
      const hoursWithProduction = new Set(func.observations.filter(o => o.pieces > 0).map(o => o.hour));
      totalHoursWithProduction += hoursWithProduction.size;
    });

    const downtimeMinutes = activeDay.functions.reduce((acc, func) => {
        return acc + func.observations.filter(o => o.type === 'downtime').reduce((dAcc, obs) => dAcc + (obs.duration || 0), 0);
    }, 0) || 0;
    
    const pph = totalHoursWithProduction > 0 ? Math.round(totalPieces / totalHoursWithProduction) : 0;

    return { totalPieces, pph, downtimeMinutes };
  }, [activeDay]);

  const topWorkers = useMemo(() => {
    if (!activeDay) return [];
    const workerTotals: { [key: string]: number } = {};

    activeDay.functions.forEach(func => {
      func.observations.forEach(obs => {
        if(obs.pieces > 0) {
          workerTotals[obs.worker] = (workerTotals[obs.worker] || 0) + obs.pieces;
        }
      });
    });

    return Object.entries(workerTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

  }, [activeDay]);

  const filteredFunctions = useMemo(() => {
     if(!activeDay) return [];
     return activeDay.functions.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeDay, searchQuery]);


  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Planilhas" />
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {[...state.days].sort((a,b) => a.id.localeCompare(b.id)).map(day => (
                <Button 
                  key={day.id}
                  variant={day.id === state.activeDayId ? 'secondary' : 'outline'}
                  onClick={() => handleSetActiveDay(day.id)}
                  className="shrink-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <span>{formatDay(day.id)}</span>
                  </div>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
           <div className="flex flex-wrap gap-2 text-sm">
                <Button size="sm" onClick={handleAddDay}>+ Adicionar dia</Button>
                <Button size="sm" variant="outline" onClick={() => toast({title: "Em breve!"})}>⎘ Duplicar dia</Button>
                <Button size="sm" variant="outline" onClick={() => toast({title: "Em breve!"})}>Zerar valores do dia</Button>
                <Button size="sm" variant="outline" onClick={() => toast({title: "Em breve!"})}>Exportar CSV do dia</Button>
            </div>
             <p className="text-xs text-muted-foreground">Toque longo em um dia para renomear</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex justify-between items-center">
                  <span>Resumo do dia</span>
                  <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">{activeDay ? formatDay(activeDay.id) : ''}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <div className="bg-secondary p-2 px-3 rounded-full text-sm font-semibold">Total do dia: {daySummary.totalPieces}</div>
                <div className="bg-secondary p-2 px-3 rounded-full text-sm font-semibold">Média/h do dia: {daySummary.pph}</div>
                <div className="bg-secondary p-2 px-3 rounded-full text-sm font-semibold">Funções: {activeDay?.functions.length || 0}</div>
                <div className="bg-secondary p-2 px-3 rounded-full text-sm font-semibold">Paradas: {daySummary.downtimeMinutes} min</div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Top 3 trabalhadores</h4>
                <div className="flex flex-wrap gap-2">
                  {topWorkers.length > 0 ? topWorkers.map(([name, total]) => (
                     <div key={name} className="bg-secondary p-2 px-3 rounded-full text-sm">{name}: <b>{total}</b></div>
                  )) : <p className="text-sm text-muted-foreground">Sem dados de produção.</p>}
                </div>
              </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Preferências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                   <Input 
                     placeholder="Buscar função" 
                     className="max-w-xs"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                   <Button variant="outline">Ordenar A-Z</Button>
                </div>
                 <div className="flex flex-wrap gap-2">
                    <Button variant="outline">Entrar Admin</Button>
                    <div className="text-sm text-muted-foreground p-2">Último backup: --</div>
                 </div>
            </CardContent>
        </Card>
      </div>


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
          {filteredFunctions.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              {activeDay?.functions.length === 0 ? "Nenhuma função para este dia. Adicione uma acima." : "Nenhuma função encontrada."}
            </div>
          )}
          {filteredFunctions.map(func => (
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
