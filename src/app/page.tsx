// src/app/page.tsx (Nova Tela de Seleção de Perfil)
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Shield } from 'lucide-react';

export default function ProfileSelectionPage() {
  const { state, dispatch } = useAppContext();
  const { profiles } = state;
  const router = useRouter();

  const handleSelectProfile = (profileId: string) => {
    dispatch({ type: 'SET_CURRENT_PROFILE_FOR_LOGIN', payload: profileId });
    router.push(`/login?profileId=${profileId}`);
  };

  const handleGoToAdmin = (e: React.MouseEvent) => {
    e.stopPropagation();
    // For now, admin access is direct. Later, it could have its own login.
    router.push('/admin');
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
            <CardContent className="flex flex-col items-center justify-center flex-1 p-2">
                <Sprout className="w-12 h-12 text-primary mb-2" />
                <p className="font-bold text-lg">{profile.name}</p>
            </CardContent>
            <CardFooter className="p-2 w-full">
                <Button variant="default" className="w-full h-10 text-sm">Entrar</Button>
            </CardFooter>
          </Card>
        ))}

         <Card 
            className="flex flex-col items-center justify-center p-4 text-center aspect-square cursor-pointer border-dashed bg-secondary/50 hover:border-primary hover:text-primary transition-colors"
            onClick={handleGoToAdmin}
          >
            <CardContent className="flex flex-col items-center justify-center flex-1 p-2">
                <Shield className="w-12 h-12" />
                <p className="font-bold text-lg mt-2">Admin</p>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
