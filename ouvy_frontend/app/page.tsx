'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge, Chip } from '@/components/ui/badge-chip';
import { NavBar, Footer } from '@/components/ui/navbar-footer';
import { CheckCircle, Shield, BarChart3, Zap, ArrowRight, Users, Lock, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      {/* Navigation Bar */}
      <NavBar
        links={[
          { label: 'Produto', href: '#features' },
          { label: 'Planos', href: '#pricing' },
          { label: 'Documentação', href: '/docs' },
        ]}
        rightContent={
          <>
            <Button variant="ghost">Entrar</Button>
            <Button variant="default">Começar Agora</Button>
          </>
        }
        sticky
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-cyan-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Esquerda: Texto */}
            <div className="space-y-6">
              <Badge variant="outline">🚀 Novo: White Label Completo</Badge>

              <h1 className="text-5xl md:text-6xl font-bold text-secondary leading-tight">
                Seu <span className="text-primary">Canal de Ética</span>
                <br /> Seguro e Profissional
              </h1>

              <p className="text-xl text-neutral-600 leading-relaxed">
                Plataforma SaaS completa para gerenciar denúncias, sugestões e feedbacks anônimos com total conformidade LGPD e ISO 27001.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button variant="default" size="lg">
                  Começar Grátis <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Ver Demo
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 pt-8">
                <Chip variant="default" icon={<CheckCircle size={16} />}>
                  LGPD Compliant
                </Chip>
                <Chip variant="default" icon={<CheckCircle size={16} />}>
                  ISO 27001
                </Chip>
                <Chip variant="default" icon={<CheckCircle size={16} />}>
                  Seguro
                </Chip>
              </div>
            </div>

            {/* Direita: Ilustração */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-300 rounded-3xl blur-3xl opacity-20 -z-10" />
              <Card variant="elevated" className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Shield className="w-12 h-12 text-primary" />
                    <div>
                      <p className="font-semibold text-secondary">Proteção Máxima</p>
                      <p className="text-sm text-neutral-500">Criptografia end-to-end</p>
                    </div>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary rounded-full" />
                  </div>
                  <p className="text-xs text-neutral-500">Disponível 24/7</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-xl text-neutral-600">
              Uma plataforma completa para gerenciar feedback de forma profissional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: 'Segurança Garantida',
                description: 'Criptografia end-to-end com conformidade LGPD e ISO 27001',
                badge: 'ISO 27001',
              },
              {
                icon: Users,
                title: 'White Label',
                description: 'Personalize completamente com sua marca e cores',
                badge: 'Customizável',
              },
              {
                icon: Zap,
                title: 'Rápido e Eficiente',
                description: 'Interface intuitiva para cadastro de feedbacks em segundos',
                badge: 'Performance',
              },
              {
                icon: TrendingUp,
                title: 'Análise em Tempo Real',
                description: 'Dashboards com métricas completas do seu canal',
                badge: 'Analytics',
              },
              {
                icon: Shield,
                title: 'Anonimato Total',
                description: 'Proteja a identidade dos denunciantes com segurança máxima',
                badge: 'Privado',
              },
              {
                icon: CheckCircle,
                title: 'Suporte 24/7',
                description: 'Time dedicado pronto para ajudar sua empresa',
                badge: 'Suporte',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} variant="elevated">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="w-8 h-8 text-primary" />
                      <Badge variant="primary" size="sm">
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-secondary mt-4">
                      {feature.title}
                    </h3>
                  </CardHeader>
                  <div className="p-6 text-neutral-600">
                    {feature.description}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Planos Simples e Transparentes
            </h2>
            <p className="text-xl text-neutral-600">
              Escolha o plano perfeito para sua empresa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: 'Grátis',
                description: 'Para pequenas empresas',
                features: ['Até 50 usuários', 'Canal básico', 'Suporte por email'],
              },
              {
                name: 'Business',
                price: 'R$ 999',
                description: 'Para empresas em crescimento',
                features: [
                  'Até 500 usuários',
                  'White Label completo',
                  'Suporte prioritário',
                  'Analytics avançado',
                ],
                highlighted: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'Para grandes corporações',
                features: ['Usuários ilimitados', 'Customização total', 'Suporte dedicado'],
              },
            ].map((plan, idx) => (
              <Card
                key={idx}
                variant={plan.highlighted ? 'outlined' : 'elevated'}
                className={plan.highlighted ? 'md:scale-105' : ''}
              >
                <CardHeader>
                  <h3 className="text-2xl font-bold text-secondary">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-neutral-500">{plan.description}</p>
                </CardHeader>
                <div className="p-6 space-y-6">
                  <div className="text-4xl font-bold text-primary">
                    {plan.price}
                    <span className="text-sm text-neutral-500 font-normal">/mês</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-neutral-700"
                      >
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.highlighted ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {plan.highlighted ? 'Comece Agora' : 'Saiba Mais'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Pronto para começar?
          </h2>
          <p className="text-xl text-neutral-200">
            Crie sua conta grátis agora e comece a gerenciar feedbacks em minutos
          </p>
          <Button
            variant="default"
            size="lg"
            className="bg-primary hover:bg-primary-dark"
          >
            Começar Grátis <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

    </>
  );
}
