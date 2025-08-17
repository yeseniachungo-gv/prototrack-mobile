// src/app/announcements/page.tsx
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, UserCircle } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AnnouncementsPage() {
  const { state, dispatch, activeProfile } = useAppContext();
  const [newPostContent, setNewPostContent] = useState('');
  const { toast } = useToast();

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      toast({
        title: 'Comunicado vazio',
        description: 'Por favor, escreva algo antes de postar.',
        variant: 'destructive',
      });
      return;
    }

    dispatch({ type: 'ADD_ANNOUNCEMENT', payload: { content: newPostContent.trim() } });
    setNewPostContent('');
    toast({
      title: 'Comunicado enviado!',
      description: 'Sua mensagem agora está visível para todas as equipes.',
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp);
    const distance = formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    const fullDate = format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    return `${distance} (${fullDate})`;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Mural de Comunicados" />

      <Card>
        <CardHeader>
          <CardTitle>Novo Comunicado</CardTitle>
          <CardDescription>
            Escreva uma mensagem que será vista por todos os perfis. Use para avisos e coordenação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <Textarea
              placeholder={`Postando como ${activeProfile?.name || 'usuário'}...`}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end">
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" /> Enviar Comunicado
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {state.announcements.length > 0 ? (
          state.announcements.map(post => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <UserCircle className="h-10 w-10 text-muted-foreground" />
                <div className="flex flex-col">
                  <CardTitle className="text-base">{post.authorName}</CardTitle>
                  <CardDescription>{formatTimestamp(post.timestamp)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Nenhum comunicado postado ainda. Seja o primeiro a enviar uma mensagem!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
