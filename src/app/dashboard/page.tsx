// src/app/dashboard/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ChevronLeft, ChevronRight, Sparkles, Target, Edit } from 'lucide-react';
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
import { suggestRelatedResources } from '@/ai/flows/suggest-related-resources';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';


// Componente para a barra de seleção de dia
const DaySelector = () => {
  const { activeProfile, dispatch } = useAppContext();
  if (!activeProfile) return null;

  const handleDayChange = (dayId: string) => {
    dispatch({ type: 'SET_ACTIVE_DAY', payload: dayId });
  };
  
  const handleAddDay = () => {
    dispatch({ type: 'ADD_DAY' });
  };

  const currentIndex = activeProfile.days.findIndex(d => d.id === activeProfile.activeDayId);

  const goToPreviousDay = () => {
    if (currentIndex > 0) {
      dispatch({ type: 'SET_ACTIVE_DAY', payload: activeProfile.days[currentIndex - 1].id });
    }
  };

  const goToNextDay = () => {
    if (currentIndex < activeProfile.days.length - 1) {
      dispatch({ type: 'SET_ACTIVE_DAY', payload: activeProfile.days[currentIndex + 1].id });
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <Button size="icon" variant="outline" onClick={goToPreviousDay} disabled={currentIndex <= 0}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Select value={activeProfile.activeDayId ?? ''} onValueChange={handleDayChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Selecione um dia" />
        </SelectTrigger>
        <SelectContent>
          {activeProfile.days.map(day => (
            <SelectItem key={day.id} value={day.id}>
              {new Date(day.id + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
       <Button size="icon" variant="outline" onClick={goToNextDay} disabled={currentIndex >= activeProfile.days.length - 1}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button size="icon" onClick={handleAddDay}><Plus className="h-4 w-4" /></Button>
    </div>
  );
};


// Componente para adicionar nova função
const AddFunctionForm = ({ dayId }: { dayId: string }) => {
  const [functionName, setFunctionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch, activeDay } = useAppContext();
  const { toast } = useToast();

  const handleAddFunction = (e: React.FormEvent) => {
    e.preventDefault();
    if (functionName.trim()) {
      dispatch({ type: 'ADD_FUNCTION', payload: { dayId, functionName: functionName.trim() } });
      setFunctionName('');
    }
  };

  const handleAISuggest = async () => {
    if (!functionName.trim() || !activeDay) {
      toast({
        title: "Entrada necessária",
        description: "Por favor, digite o nome da nova função antes de usar a sugestão.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const existingFunctionsAndWorkers = JSON.stringify(
        activeDay.functions.map(f => ({ functionName: f.name, workers: f.workers }))
      );
      
      const result = await suggestRelatedResources({
        existingFunctionsAndWorkers,
        newFunctionName: functionName.trim(),
      });
      
      toast({
        title: "Sugestão Inteligente ✨",
        description: (
          <div className="flex flex-col gap-2">
            <p className="font-bold">Trabalhadores Sugeridos: <span className="font-normal">{result.suggestedWorkers || 'Nenhum'}</span></p>
            <p className="font-bold">Motivo: <span className="font-normal">{result.reasoning}</span></p>
          </div>
        ),
        duration: 9000,
      });

    } catch (error) {
      console.error("Erro ao obter sugestão:", error);
      toast({
        title: "Erro na Sugestão",
        description: "Não foi possível obter uma sugestão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
      <Button type="button" variant="outline" size="icon" onClick={handleAISuggest} disabled={isLoading} title="Obter sugestão inteligente">
        <Sparkles className="h-4 w-4" />
      </Button>
      <Button type="submit">Adicionar</Button>
    </form>
  );
};

// --- Componente de Meta Diária ---
const DailyGoalCard = () => {
  const { dispatch, activeProfile, activeDay } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeProfile || !activeDay) return null;

  const { dailyGoal } = activeProfile;
  const goalFunction = activeDay?.functions.find(f => f.id === dailyGoal.functionId);
  const currentPieces = goalFunction ? Object.values(goalFunction.pieces).reduce((a, b) => a + b, 0) : 0;
  const progress = dailyGoal.target > 0 ? (currentPieces / dailyGoal.target) * 100 : 0;

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const target = parseInt(formData.get('goalTarget') as string) || 0;
    const functionId = formData.get('goalFunction') as string;
    dispatch({ type: 'UPDATE_DAILY_GOAL', payload: { goal: target, functionId: functionId || null } });
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-primary" /> Meta do Dia
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe o progresso da sua principal meta de produção.
            </p>
          </div>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
               <Button variant="outline" size="icon" className="w-9 h-9" disabled={!activeDay}>
                <Edit className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
               {activeDay && (
                  <form onSubmit={handleSave} className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Definir Meta</h4>
                      <p className="text-sm text-muted-foreground">
                        Escolha la meta de peças e a função final.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="goalTarget">Meta de Peças</Label>
                      <Input id="goalTarget" name="goalTarget" type="number" defaultValue={dailyGoal.target} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="goalFunction">Função para Meta</Label>
                      <Select name="goalFunction" defaultValue={dailyGoal.functionId ?? ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhuma</SelectItem>
                          {activeDay.functions.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit">Salvar</Button>
                  </form>
               )}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {dailyGoal.functionId && goalFunction ? (
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-2xl">{currentPieces.toLocaleString()}</span>
              <span className="text-muted-foreground">/ {dailyGoal.target.toLocaleString()} peças</span>
            </div>
            <Progress value={progress} />
            <div className="text-xs text-muted-foreground text-center">
              Meta vinculada à função: <span className="font-semibold">{goalFunction.name}</span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            {activeDay ? 'Defina uma meta e selecione uma função para começar.' : 'Selecione um dia para definir uma meta.'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}


// Página Principal do Dashboard
export default function DashboardPage() {
  const { activeProfile, activeDay } = useAppContext();
  const [selectedFunctionId, setSelectedFunctionId] = useState<string | null>(null);

  const handleOpenSheet = (functionId: string) => {
    setSelectedFunctionId(functionId);
  };

  const handleCloseSheet = () => {
    setSelectedFunctionId(null);
  };

  const selectedFunction = activeDay?.functions.find(f => f.id === selectedFunctionId) ?? null;

  if (!activeProfile) {
    // Este estado não deve acontecer por causa do DashboardLayout, mas é uma segurança.
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Header title="Bem-vindo ao GiraTempo" />
        <Card>
          <CardContent className="p-6 text-center">
             <p className="text-muted-foreground">
              Carregando perfil... volte para a <Link href="/" className="text-primary underline">tela inicial</Link> se o problema persistir.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title={`Dashboard - ${activeProfile.name}`} />
      
      <DaySelector />

      <DailyGoalCard />

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
             <p className="text-muted-foreground text-center py-4">Selecione ou crie um dia para começar.</p>
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
