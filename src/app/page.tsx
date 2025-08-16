"use client";

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DayCard from '@/components/DayCard';
import Header from '@/components/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [newDayName, setNewDayName] = React.useState('');
  
  const currentDay = state.days.length > 0 ? state.days[state.days.length - 1] : null;

  const handleAddDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDayName.trim()) {
      dispatch({
        type: 'ADD_DAY',
        payload: {
          name: newDayName.trim(),
          date: new Date().toISOString(),
        },
      });
      setNewDayName('');
      setOpen(false);
    }
  };
  
  const daySummary = React.useMemo(() => {
    if (!currentDay) return { pieces: 0, stops: 0, topFunction: 'N/A' };
    const pieces = currentDay.functions.reduce((acc, func) => acc + func.pieces, 0);
    const stops = currentDay.functions.reduce((acc, func) => acc + func.observations.filter(o => o.type === 'downtime').length, 0);
    const topFunction = currentDay.functions.length > 0 ?
      currentDay.functions.reduce((prev, current) => (prev.pieces > current.pieces) ? prev : current).name
      : 'N/A';
    return { pieces, stops, topFunction };
  }, [currentDay]);

  const handleComingSoon = (feature: string) => {
    toast({ title: "Funcionalidade em breve!", description: `${feature} ainda não está implementado.` });
  };
  
  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardContent className="p-4">
          <CardTitle className="text-xl mb-2">Dia</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              {currentDay ? format(new Date(currentDay.date), 'dd/MM/yyyy') : 'Nenhum dia'}
            </div>
            <div className="flex-grow" />
            <Dialog open={open} onOpenChange={setOpen}>
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
            <Button size="sm" variant="outline" onClick={() => handleComingSoon('Clonar dia')}>Clonar</Button>
            <Button size="sm" variant="outline" onClick={() => handleComingSoon('Renomear dia')}>Renomear</Button>
            <Button size="sm" variant="outline" onClick={() => handleComingSoon('Excluir dia')}>Excluir</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <CardTitle className="text-xl mb-2">Funções de produção</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDay?.functions.map(func => (
              <Card key={func.id}>
                <CardContent className="p-3">
                  <div className="font-bold">{func.name}</div>
                  <div className="text-muted-foreground text-sm">{func.pieces} p/h • {func.observations.filter(o => o.type === 'downtime').length} paradas • {func.observations.filter(o => o.type === 'defect').length} defeitos</div>
                  <Button size="sm" className="mt-2" onClick={() => handleComingSoon('Abrir planilha')}>Abrir planilha</Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className="mt-4" onClick={() => handleComingSoon('Adicionar função')}><Plus className="mr-2 h-4 w-4" /> Adicionar função</Button>
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
             <Button variant="outline" onClick={() => handleComingSoon('Fixar timer')}>Fixar/Desfixar</Button>
             <Button onClick={() => router.push('/stopwatch')}>Abrir cronômetro</Button>
           </div>
           <div className="h-3.5 bg-secondary rounded-full mt-3 overflow-hidden">
             <div className="h-full bg-primary w-[35%]"></div>
           </div>
        </CardContent>
      </Card>

    </div>
  );
}
