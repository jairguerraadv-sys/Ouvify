'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { NavBar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { CheckCircle, Shield, BarChart3, Zap, ArrowRight, Users, Lock, TrendingUp, MessageSquare, Bell, FileSearch } from 'lucide-react';
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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
                    Começar Grátis 
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

            {/* Direita: Visual */}
            <div className="relative animate-slide-left">
              <div className="relative glass rounded-2xl p-8 shadow-elegant">
                {/* Card simulado de feedback */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Logo variant="full" size="sm" colorScheme="default" />
                    <div className="px-3 py-1 bg-success/10 text-success text-xs font-semibold rounded-full">
                      Ativo
                    </div>
                  </div>
                  
                  <div className="space-y-3 py-4">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-soft">
                      <MessageSquare className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-secondary-900">Nova denúncia recebida</p>
                        <p className="text-xs text-secondary-600 mt-1">Protocolo: OUVY-A3B9-K7M2</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-soft">
                      <Bell className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-secondary-900">Acompanhamento atualizado</p>
                        <p className="text-xs text-secondary-600 mt-1">Status: Em análise</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-soft">
                      <FileSearch className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-secondary-900">Relatório gerado</p>
                        <p className="text-xs text-secondary-600 mt-1">42 feedbacks este mês</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Elementos decorativos */}
              <div className="absolute -z-10 -top-10 -right-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
              <div className="absolute -z-10 -bottom-10 -left-10 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>
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
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
              Recursos <span className="text-gradient-primary">Poderosos</span>
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Tudo que você precisa para gerenciar feedbacks com segurança e eficiência
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Máxima Segurança',
                description: 'Criptografia end-to-end, conformidade LGPD e ISO 27001. Seus dados 100% protegidos.',
                color: 'text-primary-500',
                bgColor: 'bg-primary-50',
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: 'Anonimato Total',
                description: 'Garanta total privacidade aos denunciantes com nosso sistema de anonimização avançado.',
                color: 'text-secondary-700',
                bgColor: 'bg-secondary-50',
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Analytics Avançado',
                description: 'Dashboards intuitivos com métricas em tempo real e relatórios customizáveis.',
                color: 'text-info',
                bgColor: 'bg-info/10',
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Setup em Minutos',
                description: 'Configure sua plataforma rapidamente. Sem complicações, sem instalações complexas.',
                color: 'text-warning',
                bgColor: 'bg-warning/10',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Multi-tenancy',
                description: 'Isolamento completo de dados por cliente. White-label para sua marca.',
                color: 'text-success',
                bgColor: 'bg-success/10',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Escalabilidade',
                description: 'Infraestrutura moderna que cresce junto com seu negócio. Sem limites.',
                color: 'text-primary-600',
                bgColor: 'bg-primary-100',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                variant="elevated"
                padding="lg"
                hoverable
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: '10k+', label: 'Feedbacks Processados' },
              { number: '99.9%', label: 'Uptime Garantido' },
              { number: '500+', label: 'Empresas Confiam' },
              { number: '24/7', label: 'Suporte Disponível' },
            ].map((stat, index) => (
              <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-mesh">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900">
              Pronto para <span className="text-gradient-primary">Começar</span>?
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Crie sua conta grátis agora e configure seu canal de ética em minutos. Sem cartão de crédito necessário.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/cadastro">
                <Button variant="default" size="xl" className="shadow-elegant">
                  Começar Grátis
                </Button>
              </Link>
              <Link href="/planos">
                <Button variant="outline" size="xl">
                  Ver Planos
                </Button>
              </Link>
            </div>
            <p className="text-sm text-secondary-500">
              Teste grátis por 14 dias • Sem compromisso • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer showBranding />
    </>
  );
}
