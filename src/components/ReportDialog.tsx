// src/components/ReportDialog.tsx
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '@/contexts/AppContext';

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
  const { state } = useAppContext();
  const hasPremiumPlan = state.plan === 'premium';
  
  if (!isOpen) return null;
  
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
        printWindow.document.write('<html><head><title>Imprimir Relatório</title>');
        printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">');
        printWindow.document.write('<style>body { font-family: sans-serif; } .prose { max-width: 100%; } h2 { font-size: 1.25rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; } ul { list-style-type: disc; padding-left: 1.5rem; } li { margin-bottom: 0.25rem; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<div class="prose p-4"><h1>${title}</h1><p>${summary}</p>`);
        sections.forEach(section => {
            printWindow.document.write(`<h2>${section.title}</h2><div>${section.content.replace(/\n/g, '<br>')}</div>`);
        });
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.focus();
        // A small delay helps ensure CSS is loaded before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
  };

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
        <DialogFooter className="justify-between">
          <div>
            {hasPremiumPlan && (
              <Button variant="outline" onClick={handlePrint}>Exportar para PDF</Button>
            )}
          </div>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReportDialog;
