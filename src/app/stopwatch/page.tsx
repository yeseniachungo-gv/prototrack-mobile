"use client";

import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function StopwatchPage() {
    const router = useRouter();
    return (
        <div className="p-4 md:p-6 space-y-4 text-center">
            <Header title="Cronômetro" />
            <p className="text-muted-foreground">O cronômetro agora está integrado na página principal.</p>
            <Button onClick={() => router.push('/')}>Voltar para Início</Button>
        </div>
    );
}
