"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FunctionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  functionName?: string;
}

export default function FunctionSheet({ isOpen, onClose, functionName }: FunctionSheetProps) {
  
  if (!functionName) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-2 sm:p-4">
        <DialogHeader className="p-2 sm:p-0">
          <DialogTitle>Planilha — {functionName}</DialogTitle>
           <div className="flex flex-wrap gap-2 pt-4">
            <Button size="sm" variant="destructive" onClick={onClose} className="ml-auto">Fechar</Button>
          </div>
        </DialogHeader>
        <div className="flex-1 relative mt-4 text-center text-muted-foreground">
          A planilha de função será implementada aqui.
        </div>
      </DialogContent>
    </Dialog>
  );
}
