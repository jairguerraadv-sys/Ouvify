'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { NavBar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
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
            <Button variant="ghost" size="sm">Entrar</Button>
            <Button variant="default" size="sm">Começar Agora</Button>
          </>
        }
        sticky
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-blue-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Esquerda: Texto */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm font-medium text-primary">Novo: White Label Completo</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-secondary leading-tight">
                Seu <span className="text-primary">Canal de Ética</span>
                <br /> Seguro e Profissional
              </h1>

              <p className="text-xl text-neutral-600 leading-relaxed">
                Plataforma SaaS completa para gerenciar denúncias, sugestões e feedbacks anônimos com total conformidade LGPD e ISO 27001.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button variant="default" size="lg" className="group">
                  Começar Grátis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg">
                  Ver Demo
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 pt-8">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-secondary">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  LGPD Compliant
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-secondary">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  ISO 27001
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-secondary">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Seguro
                </div>
              </div>
            </div>

            {/* Direita: Ilustração */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-300 rounded-3xl blur-3xl opacity-20 -z-10" />
              <Card variant="elevated" className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">Proteção Máxima</p>
                      <p className="text-sm text-neutral-500">Criptografia end-to-end</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">Privacidade</p>
                      <p className="text-sm text-neutral-500">Anonimato total garantido</p>
                    </div>
                  </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: 'Segurança Garantida',
                description: 'Criptografia end-to-end com conformidade LGPD e ISO 27001',
              },
              {
                icon: Users,
                title: 'White Label',
                description: 'Personalize completamente com sua marca e cores',
              },
              {
                icon: Zap,
                title: 'Rápido e Eficiente',
                description: 'Interface intuitiva para cadastro de feedbacks em segundos',
              },
              {
                icon: TrendingUp,
                title: 'Análise em Tempo Real',
                description: 'Dashboards com métricas completas do seu canal',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} variant="default">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary">
                      {feature.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
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
            className="bg-primary hover:opacity-90"
          >
            Começar Grátis <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer showBranding />
    </>
  );
}
