/**
 * PricingCard Component - Ouvify
 * Sprint 4 - Feature 4.3: Pricing Page
 * 
 * Componente reutilizável para exibição de planos de preço
 */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2 } from 'lucide-react';
import { Plan } from '@/hooks/use-billing';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: Plan;
  billingPeriod?: 'monthly' | 'yearly';
  onSelect: (planId: number) => void;
  isLoading?: boolean;
  isCurrentPlan?: boolean;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  showNotIncluded?: string[];
  className?: string;
}

export function PricingCard({
  plan,
  billingPeriod = 'monthly',
  onSelect,
  isLoading = false,
  isCurrentPlan = false,
  buttonText,
  buttonVariant = 'default',
  showNotIncluded = [],
  className,
}: PricingCardProps) {
  // Calculate price based on billing period (20% discount for yearly)
  const yearlyDiscount = 0.8;
  const priceInReais = plan.price_cents / 100;
  const displayPrice = billingPeriod === 'yearly' && !plan.is_free
    ? Math.round(priceInReais * yearlyDiscount)
    : priceInReais;
  
  const yearlySavings = billingPeriod === 'yearly' && !plan.is_free
    ? (priceInReais - displayPrice) * 12
    : 0;

  // Determine button text
  const getButtonText = () => {
    if (buttonText) return buttonText;
    if (isCurrentPlan) return 'Plano Atual';
    if (plan.is_free) return 'Começar Grátis';
    if (plan.slug === 'enterprise') return 'Falar com Vendas';
    return `Assinar ${plan.name}`;
  };

  // Determine button variant
  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline' as const;
    if (plan.is_popular) return 'default' as const;
    return buttonVariant;
  };

  return (
    <Card
      className={cn(
        'relative border-2 transition-all duration-300',
        plan.is_popular
          ? 'border-primary shadow-xl scale-105 bg-white'
          : 'border-border hover:border-primary/50 bg-white',
        className
      )}
    >
      {/* Popular Badge */}
      {plan.is_popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary-600 text-gray-900">Mais Popular</Badge>
        </div>
      )}

      {/* Enterprise Badge */}
      {plan.slug === 'enterprise' && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary">Customizado</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
        <CardDescription className="mb-4">{plan.description}</CardDescription>
        
        {/* Price */}
        <div className="mb-4">
          {!plan.is_free && plan.price_cents > 0 ? (
            <div>
              <span className="text-4xl font-bold text-gray-900">
                R$ {displayPrice}
              </span>
              <span className="text-gray-500">/mês</span>
              {yearlySavings > 0 && (
                <p className="text-sm text-success-600 mt-1">
                  Economize R$ {yearlySavings.toFixed(0)}/ano
                </p>
              )}
            </div>
          ) : plan.is_free ? (
            <div>
              <span className="text-4xl font-bold text-gray-900">Grátis</span>
              <span className="text-gray-500"> para sempre</span>
            </div>
          ) : (
            <div>
              <span className="text-2xl font-bold text-gray-900">Sob consulta</span>
            </div>
          )}
        </div>

        {/* Trial Info */}
        {!plan.is_free && plan.trial_days > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {plan.trial_days} dias de teste grátis
          </p>
        )}

        {/* CTA Button */}
        <Button
          onClick={() => onSelect(plan.id)}
          variant={getButtonVariant()}
          className="w-full"
          disabled={isLoading || isCurrentPlan}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            getButtonText()
          )}
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Features */}
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <Check className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
          
          {/* Not Included */}
          {showNotIncluded.map((feature, idx) => (
            <div key={`not-${idx}`} className="flex gap-3 items-start opacity-50">
              <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-500">{feature}</span>
            </div>
          ))}
        </div>

        {/* Limits Display */}
        {plan.limits && Object.keys(plan.limits).length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Limites</p>
            <div className="space-y-1">
              {Object.entries(plan.limits).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs text-gray-600">
                  <span>{formatLimitKey(key)}</span>
                  <span className="font-medium">
                    {value === -1 ? 'Ilimitado' : value.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to format limit keys
function formatLimitKey(key: string): string {
  const keyMap: Record<string, string> = {
    'feedbacks_per_month': 'Feedbacks/mês',
    'users': 'Usuários',
    'storage_gb': 'Armazenamento (GB)',
    'api_calls_per_day': 'Chamadas API/dia',
    'integrations': 'Integrações',
  };
  return keyMap[key] || key.replace(/_/g, ' ');
}

export default PricingCard;
