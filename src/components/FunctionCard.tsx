
// src/components/FunctionCard.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FunctionEntry } from "@/lib/types";
import { Clock, Star, Trash2, TrendingUp, User } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useAppContext } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface FunctionCardProps {
  func: FunctionEntry;
  onOpenSheet: (funcId: string) => void;
}

const FunctionCard = ({ func, onOpenSheet }: FunctionCardProps) => {
  const { activeDay, dispatch } = useAppContext();
  const { toast } = useToast();

  const totalPieces = Object.values(func.pieces).reduce((sum, pieces) => sum + pieces, 0);
  const pph = func.hours.length > 0 ? totalPieces / func.hours.length : 0;
  
  // Calcular o total de minutos parados
  const totalMinutesStopped = Object.values(func.observations)
    .reduce((sum, obs) => sum + (obs.minutesStopped || 0), 0);
    
  // Encontrar o melhor funcionário
  const workerTotals: { [name: string]: number } = {};
  Object.entries(func.pieces).forEach(([key, pieces]) => {
    const workerName = key.split('_')[0];
    if (!workerTotals[workerName]) {
      workerTotals[workerName] = 0;
    }
    workerTotals[workerName] += pieces;
  });

  const topWorker = Object.entries(workerTotals).reduce((top, current) => {
    return current[1] > top[1] ? current : top;
  }, ["N/A", 0]);

  const handleDeleteFunction = () => {
    if (activeDay) {
      dispatch({ type: 'DELETE_FUNCTION', payload: { dayId: activeDay.id, functionId: func.id } });
      toast({
        title: "Função Removida",
        description: `A função "${func.name}" foi removida com sucesso.`,
        variant: "destructive"
      });
    }
  };


  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-lg">{func.name}</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={() => onOpenSheet(func.id)}>Entrar</Button>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button size="sm" variant="destructive" className="h-9 w-9 p-0">
                      <Trash2 className="h-4 w-4"/>
                   </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente a função "{func.name}" e todos os seus dados para este dia.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteFunction}>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-5 w-5 text-primary"/>
                <div>
                    <div className="font-bold text-foreground">{totalPieces}</div>
                    <div>Peças Totais</div>
                </div>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5 text-primary"/>
                <div>
                    <div className="font-bold text-foreground">{pph.toFixed(1)}</div>
                    <div>Média p/ Hora</div>
                </div>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-5 w-5 text-primary"/>
                <div>
                    <div className="font-bold text-foreground truncate">{topWorker[0]}</div>
                    <div>Top Funcionário</div>
                </div>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-5 w-5 text-primary"/>
                <div>
                    <div className="font-bold text-foreground">{totalMinutesStopped} min</div>
                    <div>Paradas</div>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FunctionCard;
