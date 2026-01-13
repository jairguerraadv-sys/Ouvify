'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  badge?: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
  isDisabled: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'R$',
    description: 'Para testar a plataforma',
    features: [
      '50 feedbacks por mês',
      'Suporte por email',
      'Relatórios básicos',
      'Interface padrão',
    ],
    buttonText: 'Plano Atual',
    buttonVariant: 'secondary',
    isDisabled: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    currency: 'R$',
    description: 'Para pequenas empresas',
    badge: 'Popular',
    features: [
      '500 feedbacks por mês',
      'Suporte prioritário',
      'Relatórios avançados',
      'Customização de cores',
    ],
    buttonText: 'Assinar Starter',
    buttonVariant: 'default',
    isDisabled: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    currency: 'R$',
    description: 'Para empresas em crescimento',
    features: [
      'Feedbacks ilimitados',
      'Suporte 24/7',
      'White Label completo',
      'API de integração',
    ],
    buttonText: 'Assinar Pro',
    buttonVariant: 'default',
    isDisabled: false,
  },
];

export default function PlanosPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;

    setLoadingPlan(planId);
    setError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Você precisa estar logado para assinar um plano.');
        setLoadingPlan(null);
        return;
      }

      // Call backend to create checkout session
      const response = await fetch('/api/tenants/subscribe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ plano: planId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erro ao criar sessão de pagamento');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      console.error('Subscription error:', err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Escale sua operação com feedbacks estruturados
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col transition-all ${
                plan.badge ? 'ring-2 ring-blue-500 md:scale-105' : ''
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="flex justify-center pt-4">
                  <Badge className="bg-blue-500 text-white">{plan.badge}</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>

                {/* Price */}
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600">{plan.currency}/mês</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Features */}
                <div className="space-y-4 flex-1">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <div className="mt-8">
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={plan.isDisabled || loadingPlan === plan.id}
                    variant={plan.buttonVariant}
                    className="w-full"
                  >
                    {loadingPlan === plan.id ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Processando...
                      </span>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Dúvidas? Entre em contato com nosso suporte em{' '}
            <a href="mailto:support@ouvy.com" className="text-blue-600 hover:underline">
              support@ouvy.com
            </a>
          </p>
          <Link href="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
