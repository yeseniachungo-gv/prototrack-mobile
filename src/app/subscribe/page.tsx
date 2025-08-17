// src/app/subscribe/page.tsx
"use client";

import React from 'react';
import { Check, Crown, Zap, Shield, Star, Users, BrainCircuit, FileText, CloudCog, MessageSquare, X } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Plan } from '@/lib/types';
import { cn } from '@/lib/utils';

const plans = {
    basic: {
        name: 'Básico',
        price: 'R$ 29',
        features: [
            { text: 'Até 3 perfis de equipe', icon: Users, included: true },
            { text: 'Controle de produção diário', icon: Check, included: true },
            { text: 'Cronômetro de produção', icon: Check, included: true },
            { text: 'Resumos automáticos diários e semanais', icon: BrainCircuit, included: true },
            { text: 'Mural de Comunicados', icon: MessageSquare, included: false },
            { text: 'Resumos mensais e análises consolidadas', icon: BrainCircuit, included: false },
        ],
        icon: Shield,
    },
    pro: {
        name: 'Pro',
        price: 'R$ 79',
        features: [
            { text: 'Até 6 perfis de equipe', icon: Users, included: true },
            { text: 'Todas as funções do Básico', icon: Check, included: true },
            { text: 'Mural de Comunicados', icon: MessageSquare, included: true },
            { text: 'Resumos mensais e análises consolidadas', icon: BrainCircuit, included: true },
            { text: 'Exportação de relatórios em CSV', icon: FileText, included: true },
        ],
        icon: Zap,
    },
    premium: {
        name: 'Premium',
        price: 'R$ 149',
        features: [
            { text: 'Até 10 perfis de equipe', icon: Users, included: true },
            { text: 'Todas as funções do Pro', icon: Check, included: true },
            { text: 'Exportação de relatórios em PDF', icon: FileText, included: true },
            { text: 'Backup automático na nuvem (simulado)', icon: CloudCog, included: true },
            { text: 'Suporte prioritário', icon: Star, included: true },
        ],
        icon: Crown,
    }
}

export default function SubscribePage() {
    const { state, dispatch } = useAppContext();
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectPlan = (plan: Plan) => {
        dispatch({ type: 'SET_PLAN', payload: plan });
        toast({
            title: 'Plano Atualizado!',
            description: `Seu plano foi alterado para ${plans[plan].name}.`,
        });
        // In a real application, this would redirect to a payment gateway.
        // For now, we just go back to settings.
        router.push('/settings');
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <Header title="Escolha o seu Plano" />

            <div className="text-center max-w-2xl mx-auto">
                <p className="text-muted-foreground">
                    Comece a transformar a gestão da sua produção hoje. Escolha o plano que melhor se adapta ao tamanho e às necessidades da sua equipe.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Object.entries(plans).map(([planKey, planData]) => {
                    const isCurrentPlan = state.plan === planKey;
                    return (
                        <Card key={planKey} className={cn("flex flex-col", isCurrentPlan && "border-primary ring-2 ring-primary")}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <planData.icon className="w-8 h-8 text-primary" />
                                    <CardTitle className="text-2xl">{planData.name}</CardTitle>
                                </div>
                                <CardDescription className="pt-2">
                                    <span className="text-4xl font-bold text-foreground">{planData.price}</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <ul className="space-y-3">
                                    {planData.features.map((feature, index) => (
                                        <li key={index} className={cn("flex items-start gap-3", !feature.included && "text-muted-foreground line-through")}>
                                            <div className="flex-shrink-0">{feature.included ? <Check className="w-5 h-5 mt-0.5 text-green-500"/> : <X className="w-5 h-5 mt-0.5 text-muted-foreground" />}</div>
                                            <span>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => handleSelectPlan(planKey as Plan)}
                                    variant={isCurrentPlan ? 'default' : 'outline'}
                                    disabled={isCurrentPlan}
                                >
                                    {isCurrentPlan ? 'Plano Atual' : 'Selecionar Plano'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
             <Card className="mt-8 text-center">
                <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">
                        Este é um ambiente de demonstração. A seleção de planos é simulada e não envolve pagamentos reais. Em uma aplicação real, você seria redirecionado para um portal de pagamento seguro.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
