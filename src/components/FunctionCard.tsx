"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FunctionEntry } from "@/lib/types";
import React from 'react';
import { useAppContext } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";


interface FunctionCardProps {
  func: FunctionEntry;
  onOpenSheet: (funcId: string) => void;
  onEdit: (funcId: string) => void;
  onDelete: (funcId: string) => void;
}

const FunctionCard = ({ func, onOpenSheet, onEdit, onDelete }: FunctionCardProps) => {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();

  const totalPieces = func.observations.reduce((acc, obs) => acc + (obs.pieces || 0), 0);
  const totalHoursWithProduction = new Set(func.observations.filter(o => o.pieces > 0).map(o => o.hour)).size;
  const pph = totalHoursWithProduction > 0 ? Math.round(totalPieces / totalHoursWithProduction) : 0;
  
  const handleDuplicate = () => {
    if (!state.activeDayId) return;
    const newName = prompt(`Nome para a cópia de "${func.name}":`, `${func.name} (cópia)`);
    if (newName && newName.trim() !== '') {
        dispatch({
            type: 'DUPLICATE_FUNCTION',
            payload: {
                dayId: state.activeDayId,
                functionId: func.id,
                newName: newName.trim(),
            },
        });
        toast({ title: 'Função duplicada com sucesso!' });
    }
  };
  
  const handleClearValues = () => {
     if (!state.activeDayId) return;
     if (confirm(`Tem certeza que deseja zerar os valores da função "${func.name}"?`)) {
        dispatch({
            type: 'CLEAR_FUNCTION_VALUES',
            payload: {
                dayId: state.activeDayId,
                functionId: func.id,
            },
        });
        toast({ title: 'Valores da função zerados.' });
     }
  };


  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{func.name}</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {pph} p/h • dia: {totalPieces}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button size="sm" variant="default" onClick={() => onOpenSheet(func.id)}>Entrar</Button>
            <Button size="sm" variant="outline" onClick={handleDuplicate}>Duplicar</Button>
            <Button size="sm" variant="outline" onClick={handleClearValues}>Zerar</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(func.id)}>Excluir</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FunctionCard;
