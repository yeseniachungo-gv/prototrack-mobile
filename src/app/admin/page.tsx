// src/app/admin/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, BarChart2, Loader2, BookCheck, Plus, Trash2, HardHat, AlertTriangle, Lock, WifiOff } from 'lucide-react';
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
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AdminProductionChart = () => {
    const { state } = useAppContext();
    const [selectedDayId, setSelectedDayId] = useState<string | null>(state.profiles[0]?.activeDayId || null);

    const allDays = useMemo(() => {
        const daysSet = new Set<string>();
        state.profiles.forEach(p => p.days.forEach(d => daysSet.add(d.id)));
        return Array.from(daysSet).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
    }, [state.profiles]);
    
    // Correction: If the selectedDayId is no longer valid, reset to the first available day.
    if (allDays.length > 0 && selectedDayId && !allDays.includes(selectedDayId)) {
        setSelectedDayId(allDays[0]);
    } else if (allDays.length > 0 && !selectedDayId) {
        setSelectedDayId(allDays[0]);
    }
    
    if (allDays.length === 0) {
        return <div className="text-center text-muted-foreground py-8">Nenhum dia com dados encontrado.</div>;
    }

    const currentDay = selectedDayId || allDays[0];
    
    const chartData = state.profiles.map(profile => {
        const dayData = profile.days.find(d => d.id === currentDay);
        const totalPieces = dayData 
            ? dayData.functions.reduce((total, func) => total + Object.values(func.pieces).reduce((sum, p) => sum + p, 0), 0)
            : 0;
        
        return {
            name: profile.name,
            produção: totalPieces
        };
    }).filter(d => d.produção > 0);

    return (
      <div className="space-y-4">
        <div className="w-full sm:w-auto">
             <Select value={currentDay ?? ''} onValueChange={setSelectedDayId}>
                <SelectTrigger className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Selecione um dia para análise" />
                </SelectTrigger>
                <SelectContent>
                {allDays.map(dayId => (
                    <SelectItem key={dayId} value={dayId}>
                     {format(parseISO(dayId), "eeee, dd 'de' MMMM 'de' yyyy")}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>

        {chartData.length > 0 ? (
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
        ) : (
             <div className="text-center text-muted-foreground py-8">
                Nenhum dado de produção encontrado para este dia.
            </div>
        )}
      </div>
    );
};

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
                  { !canAddProfile ? <Lock className="mr-2 h-4 w-4"/> : <Plus className="mr-2 h-4 w-4"/>}
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

export default function AdminPage() {
  const { state } = useAppContext();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<GenerateConsolidatedReportOutput | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

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
      toast({ title: 'Funcionalidade offline', description: 'A geração de relatórios por IA requer conexão com a internet.', variant: 'destructive'});
      return;
    }
    const allDaysSet = new Set<string>();
    state.profiles.forEach(p => p.days.forEach(d => allDaysSet.add(d.id)));
    const latestDay = Array.from(allDaysSet).sort((a,b) => new Date(b).getTime() - new Date(a).getTime())[0];
    
    if (!latestDay) {
        toast({ title: "Nenhum dado encontrado", description: "Não há dados de produção em nenhum perfil para gerar um relatório.", variant: "destructive" });
        return;
    }
    
    setIsGenerating(true);
    try {
        const allProfilesData = state.profiles.map(profile => {
            const dayData = profile.days.find(d => d.id === latestDay);
            return {
                profileName: profile.name,
                productionData: dayData ? dayData.functions : []
            };
        });

        const report = await generateConsolidatedReport({
            reportDate: latestDay,
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
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="text-primary" /> Análise Comparativa de Perfis
              </CardTitle>
              <CardDescription>
                Visualize e compare a produção total de cada perfil por dia.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <AdminProductionChart />
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
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Relatórios Consolidados</CardTitle>
                <CardDescription>
                    Gere análises detalhadas combinando os dados de todos os perfis para o dia mais recente.
                     {!hasAI && <span className="text-amber-500 block mt-1"> (Funcionalidade Pro/Premium)</span>}
                     {!isOnline && <span className="text-amber-500 block mt-1"> (Requer Internet)</span>}
                </CardDescription>
            </CardHeader>
           <CardContent>
            <Button onClick={handleGenerateConsolidatedReport} disabled={isGenerating || !hasAI || !isOnline}>
                {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : !isOnline ? <WifiOff className="mr-2"/> : <BookCheck className="mr-2" />}
                Gerar Relatório Automático
            </Button>
          </CardContent>
        </Card>
      </div>

      {renderReportDialog()}
    </div>
  );
}
