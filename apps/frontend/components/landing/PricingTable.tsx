'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaVariant?: 'default' | 'outline';
  highlighted?: boolean;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Starter',
    price: 'R$ 99',
    period: '/mês',
    description: 'Perfeito para pequenas empresas iniciando seu canal de ética',
    features: [
      '100 feedbacks/mês',
      'Até 3 usuários administradores',
      'White label básico (logo e cores)',
      'Suporte por email (48h)',
      'Relatórios básicos em PDF',
      'Anonimato garantido',
      'Backup diário',
    ],
    cta: 'Começar Grátis',
    ctaVariant: 'outline',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: 'R$ 299',
    period: '/mês',
    description: 'Para empresas em crescimento com necessidades avançadas',
    features: [
      '1.000 feedbacks/mês',
      'Até 10 usuários administradores',
      'White label completo (domínio próprio)',
      'Suporte prioritário (4h)',
      'Relatórios avançados com analytics',
      'Webhooks para integrações',
      'API REST completa',
      'Campos customizados',
      'Automações de workflow',
      'SLA de 99.9% uptime',
    ],
    cta: 'Começar Grátis',
    ctaVariant: 'default',
    highlighted: true,
    badge: 'Mais Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Solução sob medida para grandes organizações',
    features: [
      'Feedbacks ilimitados',
      'Usuários ilimitados',
      'White label + infraestrutura dedicada',
      'Suporte 24/7 com SLA dedicado',
      'Relatórios customizados + BI',
      'Integrações corporativas (SSO, AD)',
      'Treinamento da equipe',
      'Gerente de conta dedicado',
      'Compliance personalizado',
      'On-premise disponível',
      'Auditoria e certificações',
    ],
    cta: 'Falar com Vendas',
    ctaVariant: 'outline',
    highlighted: false,
  },
];

export function PricingTable() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {plans.map((plan, idx) => (
        <Card
          key={`plan-${idx}`}
          variant={plan.highlighted ? 'elevated' : 'default'}
          className={`relative flex flex-col ${
            plan.highlighted
              ? 'border-2 border-primary shadow-2xl scale-105 lg:scale-110 z-10'
              : 'border border-border'
          }`}
        >
          {plan.badge && (
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <Badge variant="default" className="shadow-lg">
                <Zap className="w-3 h-3 mr-1" />
                {plan.badge}
              </Badge>
            </div>
          )}

          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold mb-2">
              {plan.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mb-4">
              {plan.description}
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl lg:text-5xl font-bold text-primary">
                {plan.price}
              </span>
              {plan.period && (
                <span className="text-lg text-muted-foreground">
                  {plan.period}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, featureIdx) => (
                <li
                  key={`feature-${idx}-${featureIdx}`}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-secondary">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link href={plan.name === 'Enterprise' ? '/contato' : '/cadastro'} className="w-full">
              <Button
                size="lg"
                variant={plan.ctaVariant}
                className={`w-full ${
                  plan.highlighted ? 'shadow-lg' : ''
                }`}
              >
                {plan.cta}
              </Button>
            </Link>

            {plan.name !== 'Enterprise' && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                14 dias grátis · Sem cartão de crédito
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
