"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FunctionEntry } from "@/lib/types";

interface FunctionCardProps {
  func: FunctionEntry;
  onOpenSheet: (funcId: string) => void;
}

const FunctionCard = ({ func, onOpenSheet }: FunctionCardProps) => {

  const totalPieces = Object.values(func.pieces).reduce((sum, pieces) => sum + pieces, 0);
  const pph = func.hours.length > 0 ? totalPieces / func.hours.length : 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{func.name}</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {pph.toFixed(1)} p/h • dia: {totalPieces}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button size="sm" variant="default" onClick={() => onOpenSheet(func.id)}>Entrar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FunctionCard;
