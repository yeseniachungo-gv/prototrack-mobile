// src/app/settings/page.tsx
"use client";

import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { Moon, Sun, Palette, HelpCircle, User, Download, Upload, FileText, Crown, HardHat, AlertTriangle, Trash2, CloudCog } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import type { MasterDataItem } from '@/lib/types';


const MasterDataManager = ({ title, icon: Icon, items, type }: { title: string, icon: React.ElementType, items: MasterDataItem[], type: 'workers' | 'reasons' }) => {
    const { dispatch } = useAppContext();
    const [newItemName, setNewItemName] = useState('');
    const { toast } = useToast();

    const handleAddItem = () => {
        if (!newItemName.trim()) {
            toast({ title: 'Erro', description: 'O nome não pode estar vazio.', variant: 'destructive'});
            return;
        }
        dispatch({ type: 'ADD_MASTER_DATA', payload: { type, name: newItemName.trim() }});
        toast({ title: 'Item adicionado!' });
        setNewItemName('');
    }

    const handleDeleteItem = (id: string) => {
        dispatch({ type: 'DELETE_MASTER_DATA', payload: { type, id }});
        toast({ title: 'Item removido.', variant: 'destructive'});
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon /> {title}</CardTitle>
                 <CardDescription>
                    Gerencie os {type === 'workers' ? 'trabalhadores' : 'motivos de parada'} disponíveis para este perfil.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder={`Nome do novo ${type === 'workers' ? 'trabalhador' : 'motivo'}`} 
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                    />
                    <Button onClick={handleAddItem} size="sm">Adicionar</Button>
                </div>
                <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <span>{item.name}</span>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                     {items.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum item cadastrado.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


export default function SettingsPage() {
  const { toast } = useToast();
  const { state, dispatch, activeProfile } = useAppContext();
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const [profileName, setProfileName] = useState(activeProfile?.name || '');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const hasProOrPremium = state.plan === 'pro' || state.plan === 'premium';

  const toggleTheme = () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    dispatch({ type: 'TOGGLE_THEME' });
    toast({ title: `Tema alterado para ${newTheme}`});
  }

  const handleNameSave = () => {
    if (activeProfile && profileName.trim()) {
      dispatch({ 
        type: 'UPDATE_PROFILE_DETAILS', 
        payload: { profileId: activeProfile.id, name: profileName.trim(), pin: activeProfile.pin } 
      });
      toast({ title: 'Nome do perfil atualizado!' });
    } else {
      toast({ title: 'Erro', description: 'O nome não pode ficar em branco.', variant: 'destructive' });
    }
  };
  
  const handlePinSave = () => {
    if (!activeProfile) return;

    if (currentPin !== activeProfile.pin) {
      toast({ title: 'PIN Atual Incorreto', variant: 'destructive' });
      return;
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      toast({ title: 'PIN Inválido', description: 'O novo PIN deve ter 4 dígitos numéricos.', variant: 'destructive' });
      return;
    }
    if (newPin !== confirmPin) {
      toast({ title: 'PINs não coincidem', description: 'O novo PIN e a confirmação devem ser iguais.', variant: 'destructive' });
      return;
    }
    
    dispatch({
      type: 'UPDATE_PROFILE_DETAILS',
      payload: { profileId: activeProfile.id, name: activeProfile.name, pin: newPin }
    });

    toast({ title: 'PIN atualizado com sucesso!' });
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleExportCSV = () => {
    const day = activeProfile?.days.find(d => d.id === activeProfile.activeDayId);
    if (!day) {
        toast({ title: "Dia ativo não encontrado", description: "Vá ao dashboard e selecione um dia para exportar.", variant: "destructive" });
        return;
    };
    let csvContent = "data:text/csv;charset=utf-8,Função,Trabalhador,Hora,Peças,Motivo Observação,Detalhe Observação,Minutos Parados\n";
    
    day.functions.forEach(f => {
      f.workers.forEach(w => {
        f.hours.forEach(h => {
          const piecesKey = `${w}_${h}`;
          const pieces = f.pieces[piecesKey] || 0;
          const obs = f.observations[piecesKey];
          csvContent += `"${f.name}","${w}","${h}","${pieces}","${obs?.reason || ''}","${obs?.detail || ''}","${obs?.minutesStopped || 0}"\n`;
        });
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${activeProfile?.name}_${day.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleBackup = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const link = document.createElement("a");
      link.setAttribute("href", dataUri);
      link.setAttribute("download", `giratempo_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: 'Backup criado com sucesso!' });
    } catch(err) {
      console.error("Erro ao criar backup:", err);
      toast({ title: 'Erro ao criar backup.', variant: 'destructive'});
    }
  };

  const handleTriggerRestore = () => {
    restoreInputRef.current?.click();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const restoredState = JSON.parse(e.target?.result as string);
          dispatch({ type: 'SET_STATE', payload: restoredState });
          toast({ title: 'Restauração concluída!', description: 'O estado da aplicação foi restaurado. A página será recarregada.' });
          setTimeout(() => window.location.reload(), 2000);
        } catch(err) {
          toast({ title: 'Arquivo de backup inválido.', variant: 'destructive'});
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Configurações" />

      {/* Profile-specific settings */}
      {activeProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MasterDataManager 
                title="Cadastro de Trabalhadores"
                icon={HardHat}
                items={activeProfile.masterWorkers}
                type="workers"
            />
            <MasterDataManager 
                title="Cadastro de Motivos de Parada"
                icon={AlertTriangle}
                items={activeProfile.masterStopReasons}
                type="reasons"
            />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
           <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
             <AccordionItem value="item-1">
              <AccordionTrigger className="px-6">
                <div className="flex items-center gap-3">
                  <User /> Minha Conta
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-4 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="profile-name">Nome do Perfil</Label>
                    <div className="flex gap-2">
                        <Input id="profile-name" value={profileName} onChange={e => setProfileName(e.target.value)} />
                        <Button onClick={handleNameSave}>Salvar</Button>
                    </div>
                </div>
                <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-semibold">Alterar PIN</h4>
                    <div className="space-y-2">
                        <Label htmlFor="current-pin">PIN Atual</Label>
                        <Input id="current-pin" type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)} maxLength={4} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-pin">Novo PIN</Label>
                        <Input id="new-pin" type="password" value={newPin} onChange={e => setNewPin(e.target.value)} maxLength={4} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-pin">Confirmar Novo PIN</Label>
                        <Input id="confirm-pin" type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} maxLength={4} />
                    </div>
                    <Button onClick={handlePinSave} variant="secondary">Atualizar PIN</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="px-6">
                <div className="flex items-center gap-3">
                  <Palette /> Aparência
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 pt-4 px-6">
                <div className="flex items-center justify-between p-2 rounded-lg">
                  <p className="font-medium">Tema Escuro/Claro</p>
                  <Button onClick={toggleTheme} variant="outline" size="sm">
                    {state.theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    Mudar para {state.theme === 'dark' ? 'Claro' : 'Escuro'}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
              <AccordionTrigger className="px-6">
                 <div className="flex items-center gap-3">
                    <FileText /> Dados & Exportação
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-6 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleExportCSV} disabled={!activeProfile?.activeDayId} variant="outline">
                      <FileText className="mr-2"/> Exportar CSV do Dia
                    </Button>
                    <Button onClick={handleBackup} variant="outline" disabled={!activeProfile}>
                      <Download className="mr-2"/> Criar Backup (Manual)
                    </Button>
                    <Button onClick={handleTriggerRestore} variant="outline">
                      <Upload className="mr-2"/> Restaurar de Arquivo
                    </Button>
                    <input
                      type="file"
                      ref={restoreInputRef}
                      onChange={handleRestore}
                      className="hidden"
                      accept=".json"
                    />
                </div>
                {hasProOrPremium && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                        <CloudCog className="h-5 w-5 text-primary" />
                        <span>O backup automático na nuvem está ativo para este plano.</span>
                    </div>
                )}
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger className="px-6">
                 <div className="flex items-center gap-3">
                    <Crown /> Meu Plano
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-6 space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                      <p>Você está no plano <span className="font-bold capitalize text-primary">{state.plan}</span>.</p>
                  </div>
                  <Link href="/subscribe">
                    <Button>
                       Ver outros planos
                    </Button>
                  </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ajuda</CardTitle>
           <CardDescription>
            Precisa de ajuda ou tem alguma dúvida? Consulte nosso guia.
           </CardDescription>
        </CardHeader>
         <CardContent>
           <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ajuda-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <HelpCircle /> Guia Rápido
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-2 text-muted-foreground">
                <p>Bem-vindo ao GiraTempo! Aqui estão algumas dicas:</p>
                <ul className="list-disc pl-5">
                    <li>Use a aba <strong>Dashboard</strong> para gerenciar suas funções de produção diárias.</li>
                    <li>O <strong>Cronômetro</strong> é ideal para medições de tempo precisas de um operador.</li>
                    <li>Acesse <strong>Relatórios</strong> para análises automáticas e exportação de dados.</li>
                    <li>Use o <strong>Mural</strong> para se comunicar com outras equipes.</li>
                    <li>O painel <strong>Admin</strong> permite gerenciar perfis, enquanto as <strong>Configurações</strong> do seu perfil permitem gerenciar trabalhadores e motivos de parada.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
