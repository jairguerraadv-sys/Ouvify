'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { H1, H2, Paragraph } from '@/components/ui/typography';
import { Container, DecorativeBlob, FlexRow, InlineFlexRow, MutedText } from '@/components/ui';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Check, 
  X, 
  Zap,
  HelpCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing: string;
  description: string;
  badge?: string;
  features: string[];
  notIncluded?: string[];
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    currency: 'R$',
    billing: '/mês',
    description: 'Perfeito para testar a plataforma',
    features: [
      '50 feedbacks por mês',
      'Suporte por email',
      'Relatórios básicos',
      'Interface padrão',
      '1 usuário administrador',
      'Armazenamento 1GB'
    ],
    notIncluded: [
      'Customização de marca',
      'API de integração',
      'Suporte prioritário'
    ],
    buttonText: 'Começar Grátis',
    buttonVariant: 'outline',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    currency: 'R$',
    billing: '/mês',
    description: 'Ideal para pequenas empresas',
    badge: 'Popular',
    popular: true,
    features: [
      '500 feedbacks por mês',
      'Suporte prioritário (24h)',
      'Relatórios avançados',
      'Customização de cores',
      'Até 5 usuários',
      'Armazenamento 10GB',
      'Logo personalizado',
      'Notificações por email'
    ],
    notIncluded: [
      'White Label completo',
      'API de integração'
    ],
    buttonText: 'Assinar Starter',
    buttonVariant: 'default',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    currency: 'R$',
    billing: '/mês',
    description: 'Para empresas em crescimento',
    features: [
      'Feedbacks ilimitados',
      'Suporte 24/7',
      'White Label completo',
      'API REST completa',
      'Usuários ilimitados',
      'Armazenamento 100GB',
      'Integrações avançadas',
      'Relatórios personalizados',
      'Webhooks',
      'SLA garantido (99.9%)'
    ],
    buttonText: 'Assinar Pro',
    buttonVariant: 'default',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    currency: '',
    billing: 'Sob consulta',
    description: 'Soluções personalizadas',
    badge: 'Customizado',
    features: [
      'Tudo do plano Pro',
      'Implementação dedicada',
      'Treinamento presencial',
      'Account Manager dedicado',
      'Customizações específicas',
      'Infraestrutura dedicada',
      'Múltiplas marcas/empresas',
      'Consultoria estratégica',
      'Compliance personalizado',
      'SLA Premium (99.99%)'
    ],
    buttonText: 'Falar com Vendas',
    buttonVariant: 'secondary',
  },
];

const FAQ = [
  {
    question: 'Posso mudar de plano a qualquer momento?',
    answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas imediatamente e o valor é ajustado proporcionalmente.'
  },
  {
    question: 'Como funciona o período de teste?',
    answer: 'Todos os planos pagos incluem 14 dias de teste grátis. Você pode cancelar a qualquer momento durante o período de teste sem custos.'
  },
  {
    question: 'Quais são as formas de pagamento?',
    answer: 'Aceitamos cartão de crédito (todas as bandeiras), boleto bancário e PIX. Para planos anuais, também aceitamos transferência bancária.'
  },
  {
    question: 'Os dados estão seguros?',
    answer: 'Sim! Utilizamos criptografia de ponta a ponta, conformidade com LGPD e certificação ISO 27001. Seus dados são armazenados em servidores seguros no Brasil.'
  },
  {
    question: 'Existe contrato de fidelidade?',
    answer: 'Não! Todos os nossos planos são mensais e você pode cancelar quando quiser. Planos anuais têm desconto mas são opcionais.'
  },
  {
    question: 'Preciso de conhecimento técnico?',
    answer: 'Não! Nossa plataforma é 100% no-code e intuitiva. Oferecemos onboarding completo e suporte para ajudar você a começar.'
  }
];

export default function PrecosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    // Plano gratuito: redireciona para cadastro
    if (planId === 'free') {
      router.push('/cadastro');
      return;
    }

    // Enterprise: solicitar demo
    if (planId === 'enterprise') {
      router.push('/demo');
      return;
    }

    // Planos pagos: verificar autenticação
    if (!user) {
      // Redireciona para login e depois volta para preços
      router.push(`/login?redirect=/precos&plan=${planId}`);
      return;
    }

    // Iniciar processo de checkout Stripe
    setLoadingPlan(planId);

    try {
      // Mapear planId para ID do plano no banco de dados
      // Os IDs são baseados nos slugs: 'free' (1), 'starter' (2), 'professional' (3), 'enterprise' (4)
      const planIdMap: Record<string, number> = {
        'free': 1,
        'starter': 2,
        'pro': 3,
        'enterprise': 4,
      };

      const numericPlanId = planIdMap[planId];
      
      if (!numericPlanId) {
        throw new Error('Plano inválido');
      }

      // Criar sessão de checkout no Stripe via API de billing
      const response = await api.post<{ checkout_url: string }>('/api/v1/billing/subscription/checkout/', {
        plan_id: numericPlanId,
        success_url: `${window.location.origin}/dashboard?payment=success&plan=${planId}`,
        cancel_url: `${window.location.origin}/precos?payment=cancelled`,
      });

      // Redirecionar para Stripe Checkout
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      const errorMsg = getErrorMessage(error);
      alert(`Erro ao processar pagamento: ${errorMsg}\n\nTente novamente ou entre em contato com o suporte.`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <DecorativeBlob tone="primary" placement="topLeftQuarter" />
        <DecorativeBlob tone="secondary" placement="bottomRightQuarter" />
        
        {/* Hero Section */}
        <section className="py-16 sm:py-24 relative z-10">
          <Container>
          <div className="text-center mb-12">
            <InlineFlexRow className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Preços Transparentes</span>
            </InlineFlexRow>
            <H1 className="mb-6 text-primary">
              Planos que Crescem <span className="text-secondary">com Você</span>
            </H1>
            <Paragraph className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Escolha o plano ideal para sua empresa. Sem surpresas, sem taxas ocultas.
            </Paragraph>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={billingPeriod === 'monthly' ? 'font-semibold text-secondary' : 'text-muted-foreground'}>
                Mensal
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-card shadow-md transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={billingPeriod === 'yearly' ? 'font-semibold text-secondary' : 'text-muted-foreground'}>
                Anual
                <Badge className="ml-2 bg-success/10 text-success border-success/20">
                  -20%
                </Badge>
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {PLANS.map((plan) => {
              const displayPrice = billingPeriod === 'yearly' && plan.price > 0 
                ? Math.round(plan.price * 0.8) 
                : plan.price;

              return (
                <Card
                  key={plan.id}
                  className={`relative border-2 ${
                    plan.popular 
                      ? 'border-primary shadow-xl scale-105 bg-card' 
                      : 'border-border hover:border-primary/50 bg-card'
                  } transition-all duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-foreground">Mais Popular</Badge>
                    </div>
                  )}
                  
                  {plan.badge && !plan.popular && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="secondary">{plan.badge}</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="mb-4">{plan.description}</CardDescription>
                    
                    <div className="mb-4">
                      {plan.price > 0 ? (
                        <div>
                          <span className="text-4xl font-bold text-foreground">
                            {plan.currency}{displayPrice}
                          </span>
                          <span className="text-muted-foreground">{plan.billing}</span>
                          {billingPeriod === 'yearly' && (
                            <p className="text-sm text-success-600 mt-1">
                              Economize R$ {(plan.price - displayPrice) * 12}/ano
                            </p>
                          )}
                        </div>
                      ) : plan.id === 'free' ? (
                        <div>
                          <span className="text-4xl font-bold text-foreground">Grátis</span>
                          <span className="text-muted-foreground"> para sempre</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-2xl font-bold text-foreground">{plan.billing}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      variant={plan.buttonVariant}
                      className="w-full"
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        plan.buttonText
                      )}
                    </Button>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <Check className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                          <MutedText>{feature}</MutedText>
                        </div>
                      ))}
                      
                      {plan.notIncluded && plan.notIncluded.map((feature, idx) => (
                        <div key={`not-${idx}`} className="flex gap-3 items-start opacity-50">
                          <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <MutedText>{feature}</MutedText>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Trust Section */}
          <div className="text-center mb-16">
            <div className="flex flex-wrap justify-center gap-8 items-center text-sm text-muted-foreground">
              <FlexRow>
                <Check className="w-5 h-5 text-success-600" />
                <span>14 dias de teste grátis</span>
              </FlexRow>
              <FlexRow>
                <Check className="w-5 h-5 text-success-600" />
                <span>Sem cartão de crédito</span>
              </FlexRow>
              <FlexRow>
                <Check className="w-5 h-5 text-success-600" />
                <span>Cancele quando quiser</span>
              </FlexRow>
              <FlexRow>
                <Check className="w-5 h-5 text-success-600" />
                <span>Suporte em português</span>
              </FlexRow>
            </div>
          </div>
          </Container>
        </section>

        {/* Comparison Table */}
        <section className="bg-card py-16">
          <Container>
            <div className="text-center mb-12">
              <H2 className="mb-4">Compare os Planos</H2>
              <Paragraph className="text-muted-foreground">
                Veja todos os recursos lado a lado
              </Paragraph>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-4 px-4 font-semibold">Recursos</th>
                    {PLANS.map(plan => (
                      <th key={plan.id} className="text-center py-4 px-4 font-semibold">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 px-4">Feedbacks por mês</td>
                    <td className="text-center py-4 px-4">50</td>
                    <td className="text-center py-4 px-4">500</td>
                    <td className="text-center py-4 px-4">Ilimitado</td>
                    <td className="text-center py-4 px-4">Ilimitado</td>
                  </tr>
                  <tr className="border-b bg-muted">
                    <td className="py-4 px-4">Usuários</td>
                    <td className="text-center py-4 px-4">1</td>
                    <td className="text-center py-4 px-4">5</td>
                    <td className="text-center py-4 px-4">Ilimitado</td>
                    <td className="text-center py-4 px-4">Ilimitado</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Armazenamento</td>
                    <td className="text-center py-4 px-4">1GB</td>
                    <td className="text-center py-4 px-4">10GB</td>
                    <td className="text-center py-4 px-4">100GB</td>
                    <td className="text-center py-4 px-4">Customizado</td>
                  </tr>
                  <tr className="border-b bg-muted">
                    <td className="py-4 px-4">White Label</td>
                    <td className="text-center py-4 px-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                    <td className="text-center py-4 px-4">Parcial</td>
                    <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-success-600 mx-auto" /></td>
                    <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-success-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">API de Integração</td>
                    <td className="text-center py-4 px-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                    <td className="text-center py-4 px-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                    <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-success-600 mx-auto" /></td>
                    <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-success-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-b bg-muted">
                    <td className="py-4 px-4">Suporte</td>
                    <td className="text-center py-4 px-4">Email</td>
                    <td className="text-center py-4 px-4">Prioritário</td>
                    <td className="text-center py-4 px-4">24/7</td>
                    <td className="text-center py-4 px-4">Dedicado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <H2 className="mb-4">Perguntas Frequentes</H2>
            </div>

            <div className="space-y-4">
              {FAQ.map((item, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                      {item.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground pl-8">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-card text-foreground py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Pronto para Começar?
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Crie sua conta gratuita agora e teste por 14 dias sem compromisso
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/cadastro">
                <Button size="lg" variant="secondary">
                  Começar Grátis
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="bg-transparent border-border text-foreground hover:bg-muted">
                  Agendar Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
  );
}
