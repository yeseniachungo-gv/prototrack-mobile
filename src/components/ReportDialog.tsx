// src/components/ReportDialog.tsx
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface ReportSection {
    title: string;
    content: string;
}

interface ReportDialogProps {
  title: string;
  summary: string;
  sections: ReportSection[];
  isOpen: boolean;
  onClose: () => void;
}

const ReportDialog = ({ title, summary, sections, isOpen, onClose }: ReportDialogProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Este é um resumo gerencial gerado automaticamente com base nos dados de produção.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4 pr-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-base">{summary}</p>
            
            {sections.map((section, index) => (
               <ReactMarkdown
                key={index}
                components={{
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="text-base" {...props} />,
                }}
                >
                {`## ${section.title}\n${section.content}`}
                </ReactMarkdown>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReportDialog;
