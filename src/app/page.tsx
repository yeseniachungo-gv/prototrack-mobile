// src/app/page.tsx (Página de Planilhas/Início)
"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ChevronLeft, ChevronRight, FileUp } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import FunctionCard from '@/components/FunctionCard';
import FunctionSheet from '@/components/FunctionSheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Day, FunctionEntry } from '@/lib/types';


// Componente para a barra de seleção de dia
const DaySelector = () => {
  const { state, dispatch } = useAppContext();

  const handleDayChange = (dayId: string) => {
    dispatch({ type: 'SET_ACTIVE_DAY', payload: dayId });
  };
  
  const handleAddDay = () => {
    dispatch({ type: 'ADD_DAY' });
  };

  const currentIndex = state.days.findIndex(d => d.id === state.activeDayId);

  const goToPreviousDay = () => {
    if (currentIndex > 0) {
      dispatch({ type: 'SET_ACTIVE_DAY', payload: state.days[currentIndex - 1].id });
    }
  };

  const goToNextDay = () => {
    if (currentIndex < state.days.length - 1) {
      dispatch({ type: 'SET_ACTIVE_DAY', payload: state.days[currentIndex + 1].id });
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <Button size="icon" variant="outline" onClick={goToPreviousDay} disabled={currentIndex <= 0}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Select value={state.activeDayId ?? ''} onValueChange={handleDayChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Selecione um dia" />
        </SelectTrigger>
        <SelectContent>
          {state.days.map(day => (
            <SelectItem key={day.id} value={day.id}>
              {new Date(day.id + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
       <Button size="icon" variant="outline" onClick={goToNextDay} disabled={currentIndex >= state.days.length - 1}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button size="icon" onClick={handleAddDay}><Plus className="h-4 w-4" /></Button>
    </div>
  );
};


// Componente para adicionar nova função
const AddFunctionForm = ({ dayId }: { dayId: string }) => {
  const [functionName, setFunctionName] = useState('');
  const { dispatch } = useAppContext();

  const handleAddFunction = (e: React.FormEvent) => {
    e.preventDefault();
    if (functionName.trim()) {
      dispatch({ type: 'ADD_FUNCTION', payload: { dayId, functionName: functionName.trim() } });
      setFunctionName('');
    }
  };

  return (
    <form onSubmit={handleAddFunction} className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Nome da nova função"
        value={functionName}
        onChange={(e) => setFunctionName(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">Adicionar Função</Button>
    </form>
  );
};


// Página Principal
export default function HomePage() {
  const { activeDay } = useAppContext();
  const [selectedFunctionId, setSelectedFunctionId] = useState<string | null>(null);

  const handleOpenSheet = (functionId: string) => {
    setSelectedFunctionId(functionId);
  };

  const handleCloseSheet = () => {
    setSelectedFunctionId(null);
  };

  const selectedFunction = activeDay?.functions.find(f => f.id === selectedFunctionId) ?? null;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Planilhas do Dia" />
      
      <DaySelector />

      <Card>
        <CardHeader>
          <CardTitle>Funções do Dia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeDay ? (
            <>
              <AddFunctionForm dayId={activeDay.id} />
              <div className="space-y-2">
                {activeDay.functions.length > 0 ? (
                  activeDay.functions.map(func => (
                    <FunctionCard key={func.id} func={func} onOpenSheet={handleOpenSheet} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma função cadastrada para este dia.
                  </p>
                )}
              </div>
            </>
          ) : (
             <p className="text-muted-foreground text-center py-4">Selecione um dia para ver as funções.</p>
          )}
        </CardContent>
      </Card>
      
      {selectedFunction && activeDay && (
        <FunctionSheet
          isOpen={!!selectedFunction}
          onClose={handleCloseSheet}
          func={selectedFunction}
          dayId={activeDay.id}
        />
      )}
    </div>
  );
}
