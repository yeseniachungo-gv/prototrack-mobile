// src/app/page.tsx (Nova Tela de Seleção de Perfil)
"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Shield, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { parseISO } from 'date-fns';

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
    router.push('/admin/login');
  };

  const topPerformerId = useMemo(() => {
    // Find the most recent day with any production data across all profiles
    const allDays = profiles.flatMap(p => p.days.map(d => d.id));
    if (allDays.length === 0) return null;

    const latestDayId = allDays.reduce((latest, current) => {
        return parseISO(current) > parseISO(latest) ? current : latest;
    });

    let topProfileId: string | null = null;
    let maxPieces = -1;

    profiles.forEach(profile => {
      const dayData = profile.days.find(d => d.id === latestDayId);
      if (dayData) {
        const totalPieces = dayData.functions.reduce((total, func) => {
          return total + Object.values(func.pieces).reduce((sum, p) => sum + p, 0);
        }, 0);

        if (totalPieces > maxPieces) {
          maxPieces = totalPieces;
          topProfileId = profile.id;
        }
      }
    });

    // Only award a top performer if they produced at least one piece
    return maxPieces > 0 ? topProfileId : null;
  }, [profiles]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Header title="Quem está usando?" />
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map(profile => {
          const isTopPerformer = profile.id === topPerformerId;
          return (
            <Card 
              key={profile.id} 
              className="flex flex-col items-center justify-center p-4 text-center aspect-square cursor-pointer hover:bg-muted/50 transition-colors group relative"
              onClick={() => handleSelectProfile(profile.id)}
            >
              {isTopPerformer && (
                <Badge variant="default" className="absolute -top-2 right-2 flex items-center gap-1 shadow-lg">
                  <Trophy className="h-3 w-3" /> Mais Produtivo
                </Badge>
              )}
              <CardContent className="flex flex-col items-center justify-center flex-1 p-2">
                  <div className="relative">
                    <Sprout className="w-12 h-12 text-primary mb-2" />
                    {isTopPerformer && <Trophy className="absolute -top-1 -right-2 w-6 h-6 text-amber-400" />}
                  </div>
                  <p className="font-bold text-lg">{profile.name}</p>
              </CardContent>
              <CardFooter className="p-2 w-full">
                  <Button variant="default" className="w-full h-10 text-sm">Entrar</Button>
              </CardFooter>
            </Card>
          )
        })}

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
