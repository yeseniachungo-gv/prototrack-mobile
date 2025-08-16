"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FunctionEntry } from "@/lib/types";

interface FunctionCardProps {
  func: FunctionEntry;
  onOpenSheet: (funcId: string) => void;
  onEdit: (funcId: string) => void;
  onDelete: (funcId: string) => void;
}

const FunctionCard = ({ func, onOpenSheet, onEdit, onDelete }: FunctionCardProps) => {
  const totalPieces = func.observations.reduce((acc, obs) => acc + (obs.pieces || 0), 0);
  const downtimeCount = func.observations.filter(o => o.type === 'downtime').length;
  const defectCount = func.observations.filter(o => o.type === 'defect').length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div className="font-bold flex-1">{func.name}</div>
          <Button size="sm" variant="outline" onClick={() => onEdit(func.id)}>Editar</Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(func.id)}>Excluir</Button>
        </div>
        <div className="text-muted-foreground text-sm mt-2">
          {totalPieces} p/h • {downtimeCount} paradas • {defectCount} defeitos
        </div>
        <div className="mt-4">
            <Button className="w-full" variant="default" onClick={() => onOpenSheet(func.id)}>
              Abrir planilha
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FunctionCard;
