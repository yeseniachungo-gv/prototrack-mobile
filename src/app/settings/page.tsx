
"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { Moon, Sun, Palette, Bell, HelpCircle, KeyRound, Users } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from 'next/link';


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
           <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
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
                 <p className="text-muted-foreground">
                  A criação, edição e exclusão de perfis e senhas são funções do administrador. Acesse o <Link href="/admin" className="text-primary underline">Painel de Administrador</Link> para gerenciar os perfis.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                 <div className="flex items-center gap-3">
                    <KeyRound /> Acesso e Segurança
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 text-muted-foreground">
                 A gestão de senhas e permissões é uma função do administrador.
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
                    <li>O <strong>Cronômetro</strong> é ideal para medições de tempo precisas.</li>
                    <li>Acesse <strong>Relatórios</strong> para análises automáticas e exportação de dados.</li>
                    <li>Use o <strong>Mural</strong> para se comunicar com outras equipes.</li>
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
