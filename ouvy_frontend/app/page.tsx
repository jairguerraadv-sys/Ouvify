'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { NavBar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { CheckCircle, Shield, BarChart3, Zap, ArrowRight, Users, Lock, TrendingUp } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      {/* Navigation Bar */}
      <NavBar
        links={[
          { label: 'Recursos', href: '#features' },
          { label: 'Planos', href: '/planos' },
          { label: 'Sobre', href: '#about' },
        ]}
        rightContent={
          <>
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button variant="default" size="sm">Começar Grátis</Button>
            </Link>
          </>
        }
        sticky
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-mesh pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Gradientes decorativos */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Esquerda: Texto */}
            <div className="space-y-8 animate-slide-right">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft border border-primary-200">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-wave-pulse" />
                <span className="text-sm font-semibold text-secondary-900">Plataforma 100% Segura e Conforme LGPD</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-secondary-900 leading-[1.1] tracking-tight">
                Seu Canal de Ética{' '}
                <span className="text-gradient-primary">Profissional</span>
              </h1>

              <p className="text-xl text-secondary-600 leading-relaxed max-w-2xl">
                Plataforma SaaS completa para gerenciar denúncias, sugestões e feedbacks com total conformidade e segurança. Pronta para usar em minutos.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/cadastro">
                  <Button variant="default" size="lg" className="group shadow-elegant">
                    Começar Grátis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/enviar">
                  <Button variant="outline" size="lg">
                    Enviar Feedback
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-6 items-center">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-secondary-700">ISO 27001</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-secondary-700">LGPD</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-secondary-700">99.9% Uptime</span>
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
