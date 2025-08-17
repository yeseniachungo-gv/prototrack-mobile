// src/app/admin/dashboard/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, BarChart2, Loader2, BookCheck, WifiOff, Timer, CalendarRange, Lock, Trash2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ReportDialog from '@/components/ReportDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateConsolidatedReport, GenerateConsolidatedReportOutput } from '@/ai/flows/generate-consolidated-report';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Period = '7d' | '14d' | '30d' | 'all';

const AdminProductionChart = ({ period }: { period: Period }) => {
    const { state } = useAppContext();

    const filteredDaysData = useMemo(() => {
        const endDate = new Date();
        let startDate: Date;

        switch (period) {
            case '7d': startDate = subDays(endDate, 7); break;
            case '14d': startDate = subDays(endDate, 14); break;
            case '30d': startDate = subDays(endDate, 30); break;
            case 'all': startDate = new Date(0); break; // A very old date to include all
        }

        const productionByProfile: { [profileName: string]: number } = {};
        
        state.profiles.forEach(profile => {
            productionByProfile[profile.name] = 0;
            profile.days.forEach(day => {
                const dayDate = parseISO(day.id);
                if (dayDate >= startDate && dayDate <= endDate) {
                    const totalPieces = day.functions.reduce((total, func) => total + Object.values(func.pieces).reduce((sum, p) => sum + p, 0), 0);
                    productionByProfile[profile.name] += totalPieces;
                }
            });
        });

        return Object.entries(productionByProfile).map(([name, produção]) => ({ name, produção })).filter(d => d.produção > 0);

    }, [state.profiles, period]);

    const chartData = filteredDaysData.sort((a,b) => b.produção - a.produção);
    
    if (state.profiles.flatMap(p => p.days).length === 0) {
        return <div className="text-center text-muted-foreground py-8">Nenhum dia com dados encontrado.</div>;
    }

    if (chartData.length === 0) {
        return (
             <div className="text-center text-muted-foreground py-8">
                Nenhum dado de produção encontrado para este período.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--card-foreground))'
                    }}
                />
                <Legend wrapperStyle={{fontSize: "14px"}}/>
                <Bar dataKey="produção" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

const StopwatchPerformance = () => {
    const { state } = useAppContext();

    const allHistory = useMemo(() => {
        return state.profiles.flatMap(p => 
            p.stopwatch.history.map(h => ({...h, profileName: p.name}))
        );
    }, [state.profiles]);

    const operatorPerformance = useMemo(() => {
        const operators: { [name: string]: { totalDuration: number, totalPieces: number, count: number } } = {};
        allHistory.forEach(entry => {
            if (!operators[entry.workerName]) {
                operators[entry.workerName] = { totalDuration: 0, totalPieces: 0, count: 0 };
            }
            operators[entry.workerName].totalDuration += entry.duration;
            operators[entry.workerName].totalPieces += entry.pieces;
            operators[entry.workerName].count += 1;
        });

        return Object.entries(operators)
            .map(([name, data]) => ({
                name,
                avgPph: data.totalDuration > 0 ? (data.totalPieces / data.totalDuration) * 3600 : 0,
            }))
            .sort((a, b) => b.avgPph - a.avgPph);
    }, [allHistory]);
    
    if (allHistory.length === 0) {
        return <div className="text-center text-muted-foreground py-8">Nenhum dado do cronômetro encontrado.</div>;
    }
    
    return (
        <div className="space-y-4">
            <h4 className="font-semibold">Desempenho por Operador (Média de Peças/Hora)</h4>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Operador</TableHead>
                        <TableHead className="text-right">Peças/Hora</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {operatorPerformance.map(op => (
                        <TableRow key={op.name}>
                            <TableCell className="font-medium">{op.name}</TableCell>
                            <TableCell className="text-right font-mono">{op.avgPph.toFixed(0)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

const ProfileManager = () => {
    const { state, dispatch } = useAppContext();
    const { profiles, plan } = state;
    const [newProfileName, setNewProfileName] = useState('');
    const { toast } = useToast();

    const planLimits = { basic: 3, pro: 6, premium: 10 };
    const maxProfiles = planLimits[plan];
    const canAddProfile = profiles.length < maxProfiles;

    const handleAddProfile = () => {
        if (!canAddProfile) {
            toast({ title: 'Limite de perfis atingido', description: `Seu plano ${plan} permite até ${maxProfiles} perfis.`, variant: 'destructive' });
            return;
        }
        if (newProfileName.trim() && !profiles.find(p => p.name.toLowerCase() === newProfileName.trim().toLowerCase())) {
            dispatch({ type: 'ADD_PROFILE', payload: newProfileName.trim() });
            toast({ title: `Perfil "${newProfileName.trim()}" criado!` });
            setNewProfileName('');
        } else {
            toast({ title: 'Erro', description: 'Nome do perfil inválido ou já existe.', variant: 'destructive' });
        }
    };
    
    const handleDeleteProfile = (profileId: string, profileName: string) => {
        if (profiles.length > 1) {
            dispatch({ type: 'DELETE_PROFILE', payload: profileId });
            toast({ title: `Perfil "${profileName}" excluído.`, variant: 'destructive' });
        } else {
            toast({ title: 'Ação não permitida', description: 'Não é possível excluir o único perfil existente.', variant: 'destructive' });
        }
    }

    const handleUpdateProfilePin = (profileId: string, newPin: string) => {
        const profile = profiles.find(p => p.id === profileId);
        if (profile && newPin.trim().length === 4 && /^\d+$/.test(newPin.trim())) {
             dispatch({
                type: 'UPDATE_PROFILE_DETAILS',
                payload: { profileId, name: profile.name, pin: newPin.trim() },
            });
            toast({ title: `PIN do perfil "${profile.name}" atualizado!` });
        } else {
            toast({ title: 'PIN inválido', description: 'O PIN deve ter exatamente 4 dígitos numéricos.', variant: 'destructive' });
        }
    }
    
    return (
        <div className="space-y-4">
             <div className="flex items-center gap-2">
                <Input 
                  placeholder="Nome do novo perfil" 
                  value={newProfileName}
                  onChange={e => setNewProfileName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddProfile()}
                  disabled={!canAddProfile}
                />
                <Button onClick={handleAddProfile} disabled={!canAddProfile}>
                  { !canAddProfile ? <Lock className="mr-2 h-4 w-4"/> : null}
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Perfis: {profiles.length} / {maxProfiles}
              </p>

            <div className="space-y-2">
                {profiles.map(profile => (
                    <Card key={profile.id} className="flex items-center justify-between p-4">
                       <div>
                         <p className="font-bold">{profile.name}</p>
                         <p className="text-sm text-muted-foreground">PIN: {profile.pin}</p>
                       </div>
                       <div className="flex items-center gap-2">
                        <Input
                            type="password"
                            placeholder="Novo PIN"
                            maxLength={4}
                            className="w-28"
                            onBlur={(e) => handleUpdateProfilePin(profile.id, e.target.value)}
                        />
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button type="button" variant="destructive" size="icon" disabled={profiles.length <= 1}>
                                <Trash2 className="h-4 w-4"/>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Perfil "{profile.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Atenção: Esta ação é irreversível. Todos os dados associados a este perfil serão permanentemente excluídos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProfile(profile.id, profile.name)}>
                                  Confirmar Exclusão
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                       </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function AdminDashboardPage() {
  const { state } = useAppContext();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<GenerateConsolidatedReportOutput | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7d');

  React.useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const hasAI = state.plan === 'pro' || state.plan === 'premium';

  const handleGenerateConsolidatedReport = async () => {
    if (!isOnline) {
      toast({ title: 'Funcionalidade offline', description: 'A geração de relatórios requer conexão com a internet.', variant: 'destructive'});
      return;
    }
    
    const endDate = new Date();
    let startDate: Date;
    let periodName: string;

    switch (selectedPeriod) {
        case '7d': startDate = subDays(endDate, 7); periodName = 'últimos 7 dias'; break;
        case '14d': startDate = subDays(endDate, 14); periodName = 'últimos 14 dias'; break;
        case '30d': startDate = subDays(endDate, 30); periodName = 'últimos 30 dias'; break;
        case 'all': startDate = new Date(0); periodName = 'todo o período'; break;
    }

    const allProfilesData = state.profiles.map(profile => ({
        profileName: profile.name,
        productionData: profile.days
            .filter(day => {
                const dayDate = parseISO(day.id);
                return dayDate >= startDate && dayDate <= endDate;
            })
            .map(day => ({
                date: day.id,
                functions: day.functions,
            }))
    })).filter(p => p.productionData.length > 0);


    if (allProfilesData.length === 0) {
        toast({ title: "Nenhum dado encontrado", description: `Não há dados de produção para o período selecionado (${periodName}).`, variant: "destructive" });
        return;
    }
    
    setIsGenerating(true);
    try {
        const report = await generateConsolidatedReport({
            reportPeriod: periodName,
            allProfilesData: JSON.stringify(allProfilesData),
        });

        setReportData(report);
        setIsReportOpen(true);
    } catch (err) {
        console.error("Erro ao gerar relatório consolidado:", err);
        toast({ title: 'Erro ao gerar relatório', description: 'Não foi possível se conectar com o serviço de análise.', variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  };

  const renderReportDialog = () => {
    if (!reportData) return null;
    return <ReportDialog
        title={reportData.reportTitle}
        summary={reportData.overallSummary}
        sections={[
            { title: 'Análise Comparativa de Perfis', content: reportData.profileComparison },
            { title: 'Análise Geral de Funções', content: reportData.functionAnalysis },
            { title: 'Insights Globais', content: reportData.globalInsights },
        ]}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
    />
  }


  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Painel do Administrador" />
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="text-primary" /> Análise Comparativa de Perfis
                  </CardTitle>
                  <CardDescription>
                    Visualize e compare a produção total de cada perfil por período.
                  </CardDescription>
                </div>
                 <div className="w-full sm:w-auto">
                    <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as Period)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <CalendarRange className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Selecione um período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Últimos 7 dias</SelectItem>
                            <SelectItem value="14d">Últimos 14 dias</SelectItem>
                            <SelectItem value="30d">Últimos 30 dias</SelectItem>
                            <SelectItem value="all">Todo o período</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
              </div>
            </CardHeader>
            <CardContent>
                <AdminProductionChart period={selectedPeriod} />
            </CardContent>
          </Card>
        
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Timer /> Desempenho do Cronômetro</CardTitle>
                <CardDescription>
                    Veja o ranking de performance dos operadores com base nos dados do cronômetro de todos os perfis.
                </CardDescription>
            </CardHeader>
          <CardContent>
             <StopwatchPerformance />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Gestão de Perfis e Acessos</CardTitle>
                <CardDescription>
                    Adicione ou remova perfis e redefina os PINs de acesso de 4 dígitos.
                </CardDescription>
            </CardHeader>
          <CardContent>
             <ProfileManager />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Análises Consolidadas</CardTitle>
                <CardDescription>
                     Gere análises detalhadas combinando os dados de todos os perfis para o período selecionado.
                     {hasAI && <span className="text-amber-500 block mt-1"> (Funcionalidade Pro/Premium)</span>}
                     {!isOnline && <span className="text-amber-500 block mt-1"> (Requer Internet)</span>}
                </CardDescription>
            </CardHeader>
           <CardContent className="flex flex-col sm:flex-row gap-4">
             <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as Period)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <CalendarRange className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="14d">Últimos 14 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="all">Todo o período</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={handleGenerateConsolidatedReport} disabled={isGenerating || !hasAI || !isOnline} className="flex-1">
                {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : !isOnline ? <WifiOff className="mr-2"/> : <BookCheck className="mr-2" />}
                Gerar Relatório Consolidado
            </Button>
          </CardContent>
        </Card>
      </div>

      {renderReportDialog()}
    </div>
  );
}
