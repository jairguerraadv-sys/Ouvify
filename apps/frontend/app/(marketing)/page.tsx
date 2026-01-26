'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Chip } from '@/components/ui/badge-chip';
import { H1, H2, H3, Paragraph, Lead } from '@/components/ui/typography';
import { 
  Shield, 
  Lock, 
  Palette, 
  Zap, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Users,
  TrendingUp,
  Lock as LockIcon,
  Eye,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function LandingPage() {
  const features = useMemo(() => [
    {
      icon: Shield,
      title: "Segurança Garantida",
      description: "Criptografia end-to-end com conformidade LGPD e ISO 27001",
    },
    {
      icon: Palette,
      title: "White Label",
      description: "Personalize completamente com sua marca e cores",
    },
    {
      icon: Zap,
      title: "Rápido e Eficiente",
      description: "Interface intuitiva para cadastro em segundos",
    },
    {
      icon: BarChart3,
      title: "Análise em Tempo Real",
      description: "Dashboards com métricas completas",
    }
  ], []);

  const benefits = useMemo(() => [
    "Canal de ética profissional e seguro",
    "Conformidade LGPD garantida",
    "Personalização White Label completa",
    "Suporte 24/7 em português",
    "Integrações via API REST",
    "Onboarding em menos de 24h"
  ], []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-primary">
                  ✓ 100% conforme com LGPD e ISO 27001
                </span>
              </div>

              <H1 className="text-primary">
                Seu Canal de Ética <span className="text-secondary">Profissional</span>
              </H1>

              <Lead>
                Plataforma SaaS segura para gerenciar denúncias, sugestões e feedbacks com conformidade total. Implementação em minutos.
              </Lead>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/cadastro">
                  <Button size="lg" variant="default" className="rounded-full px-8 group">
                    Começar Grátis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="rounded-full px-8">
                    Ver Demo
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Chip icon={<LockIcon size={16} />} variant="primary">ISO 27001</Chip>
                <Chip icon={<Shield size={16} />} variant="primary">LGPD</Chip>
                <Chip icon={<CheckCircle size={16} />} variant="success">99.9% Uptime</Chip>
              </div>
            </div>

            {/* Right: Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 rounded-3xl blur-3xl opacity-30 -z-10" />
              
              {/* Dashboard Card */}
              <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-border">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-secondary">Dashboard</p>
                      <p className="text-xs text-muted-foreground">Visão em tempo real</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                    <p className="text-sm text-primary font-semibold mb-1">Denúncias</p>
                    <p className="text-2xl font-bold text-primary">247</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowRight className="w-3 h-3 text-success rotate-[-45deg]" />
                      <span className="text-xs text-success font-medium">+12% este mês</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 border border-secondary/20">
                    <p className="text-sm text-secondary font-semibold mb-1">Resolvidas</p>
                    <p className="text-2xl font-bold text-secondary">189</p>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="w-3 h-3 text-success" />
                      <span className="text-xs text-success font-medium">76% taxa</span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-secondary">Proteção Máxima</p>
                      <p className="text-xs text-muted-foreground">Criptografia end-to-end</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Lock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-secondary">Anonimato</p>
                      <p className="text-xs text-muted-foreground">Privacidade garantida</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-secondary">Rápido</p>
                      <p className="text-xs text-muted-foreground">Setup em 5 minutos</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="produto" className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" size="md" className="mb-4">
              Funcionalidades Completas
            </Badge>
            <H2 className="mb-4">Tudo que você precisa em um único lugar</H2>
            <Lead className="max-w-2xl mx-auto">
              Plataforma completa para gerenciar feedback profissional com segurança total
            </Lead>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={`feature-${idx}`} variant="elevated" className="group hover:-translate-y-1 transition-all">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-gray-900" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary mb-2">
                      {feature.title}
                    </h3>
                    <Paragraph size="sm" muted>
                      {feature.description}
                    </Paragraph>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="seguranca" className="py-20 lg:py-32 bg-secondary text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/50 rounded-3xl blur-3xl opacity-20 -z-10" />
              
              <Card variant="default" className="bg-secondary-light border-secondary-light/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-success to-success rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-gray-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-foreground">Certificações</h3>
                      <p className="text-xs text-secondary-foreground/70">Conformidade Total</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <Badge variant="success" className="w-full justify-between">
                    <span>✓ ISO 27001</span>
                    <span className="text-xs">Certificado</span>
                  </Badge>

                  <Badge variant="info" className="w-full justify-between">
                    <span>✓ LGPD</span>
                    <span className="text-xs">Conforme</span>
                  </Badge>

                  <Badge variant="primary" className="w-full justify-between">
                    <span>✓ Criptografia AES-256</span>
                    <span className="text-xs">Ativo</span>
                  </Badge>

                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-600" />
                      <span className="font-semibold text-secondary-600">Backup Automático</span>
                    </div>
                    <span className="text-xs text-slate-700 font-medium">Diário</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-full">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-sm font-semibold text-success">
                  Máxima Segurança
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Proteção e conformidade
                <span className="block text-primary">em primeiro lugar</span>
              </h2>

              <p className="text-lg text-secondary-foreground/80 leading-relaxed">
                Nossa plataforma foi desenvolvida com os mais altos padrões de segurança 
                e privacidade, garantindo total conformidade com LGPD e certificações internacionais.
              </p>

              <div className="space-y-4 pt-4">
                {benefits.map((benefit, idx) => (
                  <div key={`benefit-${idx}`} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <p className="font-medium text-gray-900">{benefit}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/cadastro">
                  <Button size="lg" className="rounded-full px-8 group">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="precos" className="relative bg-gray-50 text-gray-900 py-20 lg:py-32 overflow-hidden border-t border-b border-gray-200">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30 -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">"
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">
              Teste grátis por 14 dias, sem cartão de crédito
            </span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
            Pronto para começar?
          </h2>
          
          <p className="text-xl text-secondary-foreground/80 leading-relaxed max-w-2xl mx-auto">
            Crie sua conta grátis agora e tenha um canal de ética profissional 
            funcionando em menos de 5 minutos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/cadastro">
              <Button
                size="lg"
                className="rounded-full px-8 group shadow-xl"
              >
                Começar Grátis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-gray-900 hover:bg-white hover:text-secondary rounded-full px-8"
              >
                Agendar Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-secondary-foreground/70">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm">Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm">Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm">Suporte em português</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
