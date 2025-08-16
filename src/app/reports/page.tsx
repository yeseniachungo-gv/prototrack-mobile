"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Printer } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Day } from '@/lib/types';

export default function ReportsPage() {
  const { state } = useAppContext();
  const { toast } = useToast();
  const [reportType, setReportType] = useState('day_summary');
  const [selectedDay, setSelectedDay] = useState<string | undefined>();
  const [selectedFunction, setSelectedFunction] = useState<string | undefined>();
  const [selectedWorker, setSelectedWorker] = useState<string | undefined>();

  const allWorkers = Array.from(new Set(state.days.flatMap(d => d.functions.map(f => f.worker))));
  const allFunctions = Array.from(new Set(state.days.flatMap(d => d.functions.map(f => f.name))));

  const handleExportCSV = () => {
    if (!selectedDay) {
        toast({
            variant: "destructive",
            title: "Export Error",
            description: "Please select a day to export.",
        });
        return;
    }
    
    const day = state.days.find(d => d.id === selectedDay);
    if (!day) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Function Name,Worker,Pieces,Observation Type,Reason,Detail\n";

    day.functions.forEach(func => {
        if(func.observations.length > 0) {
            func.observations.forEach(obs => {
                 csvContent += `${func.name},${func.worker},${func.pieces},${obs.type},"${obs.reason}","${obs.detail}"\n`;
            });
        } else {
             csvContent += `${func.name},${func.worker},${func.pieces},,,\n`;
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${day.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Successful", description: "Your CSV report has been downloaded."});
  };

  const handleComingSoon = () => {
      toast({ title: "Feature Coming Soon!", description: "This export option is not yet available." });
  }

  return (
    <div className="p-4 md:p-6">
      <Header title="Reports & Export" />
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select filters and export your data in various formats.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day_summary">Day Summary</SelectItem>
                <SelectItem value="by_function">By Function</SelectItem>
                <SelectItem value="by_operator">By Operator</SelectItem>
                <SelectItem value="day_comparison">Day Comparison</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger>
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {state.days.map(day => <SelectItem key={day.id} value={day.id}>{day.name}</SelectItem>)}
              </SelectContent>
            </Select>
            
            {reportType === 'by_function' && (
                <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                  <SelectTrigger><SelectValue placeholder="Select a function" /></SelectTrigger>
                  <SelectContent>
                     {allFunctions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
            )}

            {reportType === 'by_operator' && (
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger><SelectValue placeholder="Select an operator" /></SelectTrigger>
                  <SelectContent>
                     {allWorkers.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
            )}

          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button onClick={handleExportCSV} className="flex-1"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
            <Button onClick={handleComingSoon} variant="outline" className="flex-1">Export XLSX</Button>
            <Button onClick={handleComingSoon} variant="outline" className="flex-1">Export PDF</Button>
            <Button onClick={handleComingSoon} variant="ghost" size="icon"><Printer/></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
