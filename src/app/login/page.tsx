// src/app/login/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { Sprout } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId');
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const profile = state.profiles.find(p => p.id === profileId);

  useEffect(() => {
    // Se não houver ID de perfil, volta para a seleção
    if (!profileId || !profile) {
      router.replace('/');
    }
  }, [profileId, profile, router]);

  // Foco no primeiro input ao carregar
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Aceita apenas dígitos

    const newPin = pin.split('');
    newPin[index] = value;
    setPin(newPin.join(''));

    // Move o foco para o próximo input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (pin === profile.pin) {
      toast({ title: `Bem-vindo, ${profile.name}!` });
      dispatch({ type: 'SET_ACTIVE_PROFILE', payload: profile.id });
      router.push('/dashboard');
    } else {
      toast({
        title: 'PIN Incorreto',
        description: 'Por favor, tente novamente.',
        variant: 'destructive',
      });
      setPin('');
      inputRefs.current[0]?.focus();
    }
  };

  if (!profile) {
    return (
        <div className="p-4 md:p-6 text-center">
            <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/20 text-primary p-3 rounded-full w-fit mb-4">
            <Sprout className="w-12 h-12" />
          </div>
          <CardTitle>Olá, {profile.name}!</CardTitle>
          <CardDescription>Digite seu PIN de 4 dígitos para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="password"
                  maxLength={1}
                  value={pin[index] || ''}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-16 h-20 text-4xl text-center font-bold"
                  inputMode="numeric"
                />
              ))}
            </div>
            <Button type="submit" className="w-full" disabled={pin.length < 4}>
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
