
"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { Moon, Sun, Palette, Bell, HelpCircle, Shield, Users, Plus, Trash2, KeyRound } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


const ProfileManager = () => {
  const { state, dispatch, activeProfile } = useAppContext();
  const { profiles } = state;
  const [newProfileName, setNewProfileName] = useState('');
  
  const [editingName, setEditingName] = useState('');
  const [editingPin, setEditingPin] = useState('');

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (activeProfile) {
      setEditingName(activeProfile.name);
      setEditingPin(activeProfile.pin);
    }
  }, [activeProfile]);


  const handleAddProfile = () => {
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
      // Se o perfil excluído era o ativo, volta para a tela de seleção
      if(state.activeProfileId === profileId) {
        router.push('/');
      }
    } else {
      toast({ title: 'Ação não permitida', description: 'Não é possível excluir o único perfil existente.', variant: 'destructive' });
    }
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;
    if (editingName.trim() && editingPin.trim().length === 4 && /^\d+$/.test(editingPin)) {
      dispatch({
        type: 'UPDATE_PROFILE_DETAILS',
        payload: {
          profileId: activeProfile.id,
          name: editingName.trim(),
          pin: editingPin.trim(),
        },
      });
      toast({ title: 'Perfil salvo!', description: 'As informações do perfil foram atualizadas.' });
    } else {
      toast({ title: 'Dados inválidos', description: 'Verifique se o nome não está vazio e o PIN tem 4 dígitos numéricos.', variant: 'destructive' });
    }
  };

  if (!activeProfile) {
    return (
      <div className="text-center text-muted-foreground p-4 space-y-4">
        <p>Para gerenciar os detalhes de um perfil, primeiro <Link href="/" className="text-primary underline">selecione um</Link>.</p>
        <Card className="text-left p-4">
          <Label className="font-bold">Criar Novo Perfil</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input 
              placeholder="Nome do novo perfil" 
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddProfile()}
            />
            <Button onClick={handleAddProfile}><Plus className="mr-2 h-4 w-4"/>Adicionar</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <p className="text-sm text-muted-foreground">
            Editando o perfil: <span className="font-bold text-primary">{activeProfile.name}</span>
        </p>
        <div className="space-y-2">
          <Label htmlFor="profileName">Nome do Perfil</Label>
          <Input 
            id="profileName"
            placeholder="Nome do perfil" 
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profilePin">PIN de Acesso (4 dígitos)</Label>
          <Input 
            id="profilePin"
            placeholder="1234" 
            value={editingPin}
            onChange={e => setEditingPin(e.target.value)}
            maxLength={4}
            type="password"
            inputMode="numeric"
          />
        </div>

        <div className="flex justify-between items-center">
          <Button type="submit">Salvar Alterações</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={profiles.length <= 1}>
                <Trash2 className="mr-2 h-4 w-4"/>Excluir Perfil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Perfil?</AlertDialogTitle>
                <AlertDialogDescription>
                  Atenção: Esta ação não pode ser desfeita. Todos os dados do perfil "{activeProfile.name}" (dias, funções, metas) serão permanentemente excluídos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteProfile(activeProfile.id, activeProfile.name)}>
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>

      <Card className="p-4">
         <Label className="font-bold">Criar Novo Perfil</Label>
        <div className="flex items-center gap-2 mt-2">
          <Input 
            placeholder="Nome do novo perfil" 
            value={newProfileName}
            onChange={e => setNewProfileName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddProfile()}
          />
          <Button type="button" onClick={handleAddProfile}><Plus className="mr-2 h-4 w-4"/>Adicionar</Button>
        </div>
      </Card>
    </div>
  )
}


export default function SettingsPage() {
  const { toast } = useToast();
  const { state, dispatch, activeProfile } = useAppContext();
  
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
                    <Users /> Gerenciamento de Perfis {activeProfile && `- (${activeProfile.name})`}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <ProfileManager />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                 <div className="flex items-center gap-3">
                    <KeyRound /> Acesso e Segurança
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 text-muted-foreground">
                 Em breve: Implementação da tela de login com PIN, gerenciamento de permissões de administrador e redefinição de senhas.
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
                    <li>Use a aba <strong>Dashboard</strong> para gerenciar suas funções de produção diárias.</li>
                    <li>O <strong>Cronômetro</strong> é ideal para medições de tempo precisas, nos modos progressivo e regressivo.</li>
                    <li>Acesse <strong>Relatórios</strong> para análises inteligentes e exportação de dados.</li>
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
