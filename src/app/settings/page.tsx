
"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { Moon, Sun, Palette, Bell, HelpCircle, Shield, Users, Plus, Trash2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const ProfileManager = () => {
  const { state, dispatch } = useAppContext();
  const { profiles, activeProfileId } = state;
  const [newProfileName, setNewProfileName] = useState('');
  const { toast } = useToast();

  const handleAddProfile = () => {
    if (newProfileName.trim() && !profiles.find(p => p.name.toLowerCase() === newProfileName.trim().toLowerCase())) {
      dispatch({ type: 'ADD_PROFILE', payload: newProfileName.trim() });
      toast({ title: `Perfil "${newProfileName.trim()}" criado!` });
      setNewProfileName('');
    } else {
      toast({ title: 'Erro', description: 'Nome do perfil inválido ou já existe.', variant: 'destructive' });
    }
  };

  const handleSelectProfile = (profileId: string) => {
    dispatch({ type: 'SET_ACTIVE_PROFILE', payload: profileId });
    const profile = profiles.find(p => p.id === profileId);
    toast({ title: `Perfil "${profile?.name}" selecionado.` });
  };
  
  const handleDeleteProfile = (profileId: string, profileName: string) => {
    if (profiles.length > 1) {
      dispatch({ type: 'DELETE_PROFILE', payload: profileId });
      toast({ title: `Perfil "${profileName}" excluído.`, variant: 'destructive' });
    } else {
      toast({ title: 'Ação não permitida', description: 'Não é possível excluir o único perfil existente.', variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="font-medium">Perfis Disponíveis</p>
        <ul className="space-y-2">
          {profiles.map(profile => (
            <li key={profile.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className={profile.id === activeProfileId ? 'font-bold text-primary' : ''}>
                {profile.name}
              </span>
              <div className="flex items-center gap-2">
                 <Button 
                    size="sm" 
                    variant={profile.id === activeProfileId ? "default" : "outline"}
                    onClick={() => handleSelectProfile(profile.id)}
                    disabled={profile.id === activeProfileId}
                  >
                    {profile.id === activeProfileId ? 'Ativo' : 'Selecionar'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="h-9 w-9 p-0" disabled={profiles.length <= 1}>
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Perfil?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Atenção: Esta ação não pode ser desfeita. Todos os dados do perfil "{profile.name}" (dias, funções, metas) serão permanentemente excluídos.
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
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <p className="font-medium">Adicionar Novo Perfil</p>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Nome do novo perfil" 
            value={newProfileName}
            onChange={e => setNewProfileName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddProfile()}
          />
          <Button onClick={handleAddProfile}><Plus className="mr-2 h-4 w-4"/>Adicionar</Button>
        </div>
      </div>
    </div>
  )
}


export default function SettingsPage() {
  const { toast } = useToast();
  const { state, dispatch } = useAppContext();
  
  const toggleTheme = () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    dispatch({ type: 'TOGGLE_THEME' });
    toast({ title: `Tema alterado para ${newTheme}`});
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Configurações" />

      <Card>
        <CardHeader>
          <CardTitle>Geral</CardTitle>
        </CardHeader>
        <CardContent>
           <Accordion type="single" collapsible className="w-full" defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Palette /> Aparência
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 pt-4">
                <div className="flex items-center justify-between p-2 rounded-lg">
                  <p className="font-medium">Tema Escuro/Claro</p>
                  <Button onClick={toggleTheme} variant="outline" size="sm">
                    {state.theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    Mudar para {state.theme === 'dark' ? 'Claro' : 'Escuro'}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                 <div className="flex items-center gap-3">
                    <Users /> Gerenciamento de Perfis
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <ProfileManager />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                 <div className="flex items-center gap-3">
                    <Shield /> Acesso e Segurança
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 text-muted-foreground">
                 Em breve: Defina senhas de administrador, gerencie permissões de perfil e configure o bloqueio por PIN.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                 <div className="flex items-center gap-3">
                    <Bell /> Notificações
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 text-muted-foreground">
                Em breve: Configure alertas sonoros, notificações push para metas atingidas e resumos diários por e-mail.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ajuda & Suporte</CardTitle>
        </CardHeader>
         <CardContent>
           <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ajuda-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <HelpCircle /> Central de Ajuda
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-2 text-muted-foreground">
                <p>Bem-vindo ao GiraTempo! Aqui estão algumas dicas:</p>
                <ul className="list-disc pl-5">
                    <li>Use a aba <strong>Planilhas</strong> para gerenciar suas funções de produção diárias.</li>
                    <li>O <strong>Cronômetro</strong> é ideal para medições de tempo precisas, nos modos progressivo e regressivo.</li>
                    <li>Exporte seus dados ou faça backups na aba <strong>Exportar</strong>.</li>
                    <li>Use as <strong>Sugestões Inteligentes</strong> (✨) para agilizar a criação de novas funções.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="ajuda-2">
              <AccordionTrigger>Termos de Serviço</AccordionTrigger>
              <AccordionContent className="pt-4 text-muted-foreground">
                Em breve: O documento completo com os Termos de Serviço e a Política de Privacidade estará disponível aqui.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="ajuda-3">
              <AccordionTrigger>Falar com o Suporte</AccordionTrigger>
              <AccordionContent className="pt-4 text-muted-foreground">
                Em breve: Entre em contato conosco por e-mail ou chat para obter ajuda.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
