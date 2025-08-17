"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FunctionEntry } from "@/lib/types";
import React from 'react';

interface FunctionCardProps {
  func: FunctionEntry;
  onOpenSheet: (funcId: string) => void;
  onEdit: (funcId: string) => void;
  onDelete: (funcId: string) => void;
}

const FunctionCard = ({ func, onOpenSheet, onEdit, onDelete }: FunctionCardProps) => {
  const totalPieces = func.observations.reduce((acc, obs) => acc + (obs.pieces || 0), 0);
  const totalHoursWithProduction = new Set(func.observations.filter(o => o.pieces > 0).map(o => o.hour)).size;
  const pph = totalHoursWithProduction > 0 ? Math.round(totalPieces / totalHoursWithProduction) : 0;

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
            <Button size="sm" variant="outline" onClick={() => onEdit(func.id)}>Duplicar</Button>
            <Button size="sm" variant="outline" onClick={() => {
                const updatedObservations = func.observations.map(obs => ({ ...obs, pieces: 0, reason:'', detail:'', type:'note' as const, duration:0 }));
                // This is a placeholder for a dispatch call, you should implement the logic in your context
                console.log("Zerar logic here", func.id);
            }}>Zerar</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(func.id)}>Excluir</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FunctionCard;
