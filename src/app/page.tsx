// src/app/page.tsx (Nova Tela de Seleção de Perfil)
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sprout, Shield, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ProfileSelectionPage() {
  const { state, dispatch } = useAppContext();
  const { profiles } = state;
  const router = useRouter();

  const handleSelectProfile = (profileId: string) => {
    dispatch({ type: 'SET_CURRENT_PROFILE_FOR_LOGIN', payload: profileId });
    router.push(`/login?profileId=${profileId}`);
  };

  const handleEditProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation(); // Impede que o card seja clicado
    dispatch({ type: 'SET_ACTIVE_PROFILE', payload: profileId });
    router.push('/settings');
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Quem está usando?" />
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map(profile => (
          <Card 
            key={profile.id} 
            className="flex flex-col items-center justify-center p-4 text-center aspect-square cursor-pointer hover:bg-muted/50 transition-colors group relative"
            onClick={() => handleSelectProfile(profile.id)}
          >
             <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleEditProfile(e, profile.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>

            <CardContent className="flex flex-col items-center justify-center flex-1 p-2">
                <Sprout className="w-12 h-12 text-primary mb-2" />
                <p className="font-bold text-lg">{profile.name}</p>
            </CardContent>
            <CardFooter className="p-2 w-full">
                <Button variant="default" className="w-full h-10 text-sm">Entrar</Button>
            </CardFooter>
          </Card>
        ))}

        <Link href="/settings" passHref>
          <Card className="flex flex-col items-center justify-center p-4 text-center aspect-square cursor-pointer border-dashed hover:border-primary hover:text-primary transition-colors">
            <CardContent className="flex flex-col items-center justify-center flex-1 p-2">
                <Plus className="w-12 h-12" />
                <p className="font-bold text-lg mt-2">Novo Perfil</p>
            </CardContent>
          </Card>
        </Link>

         <Link href="/admin" passHref>
          <Card className="flex flex-col items-center justify-center p-4 text-center aspect-square cursor-pointer border-dashed bg-secondary/50 hover:border-primary hover:text-primary transition-colors">
            <CardContent className="flex flex-col items-center justify-center flex-1 p-2">
                <Shield className="w-12 h-12" />
                <p className="font-bold text-lg mt-2">Admin</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
