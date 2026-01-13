'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Shield, 
  Lock, 
  Palette, 
  Zap, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Menu, 
  X,
  Users,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { Footer } from '@/components/ui/footer';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "Segurança Garantida",
      description: "Criptografia end-to-end com conformidade LGPD e ISO 27001",
      color: "text-primary-500"
    },
    {
      icon: Palette,
      title: "White Label",
      description: "Personalize completamente com sua marca e cores",
      color: "text-primary-500"
    },
    {
      icon: Zap,
      title: "Rápido e Eficiente",
      description: "Interface intuitiva para cadastro em segundos",
      color: "text-primary-500"
    },
    {
      icon: BarChart3,
      title: "Análise em Tempo Real",
      description: "Dashboards com métricas completas",
      color: "text-primary-500"
    }
  ];

  const benefits = [
    "Canal de ética profissional e seguro",
    "Conformidade LGPD garantida",
    "Personalização White Label completa",
    "Suporte 24/7 em português",
    "Integrações via API REST",
    "Onboarding em menos de 24h"
  ];

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo variant="full" size="md" colorScheme="default" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#produto" className="text-slate-700 hover:text-primary-500 font-medium transition-colors">
                Produto
              </Link>
              <Link href="#seguranca" className="text-slate-700 hover:text-primary-500 font-medium transition-colors">
                Segurança
              </Link>
              <Link href="#precos" className="text-slate-700 hover:text-primary-500 font-medium transition-colors">
                Preços
              </Link>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-secondary-500 hover:text-primary-500">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-6">
                  Começar Grátis
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link 
                href="#produto" 
                className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Produto
              </Link>
              <Link 
                href="#seguranca" 
                className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Segurança
              </Link>
              <Link 
                href="#precos" 
                className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Preços
              </Link>
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro" className="block">
                  <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white">
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white via-surface-secondary to-primary-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 rounded-full blur-3xl opacity-30 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-primary-700">
                  Plataforma 100% em conformidade com LGPD
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-500 leading-tight">
                Seu Canal de Ética
                <span className="block text-primary-500">Profissional</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Plataforma SaaS completa para gerenciar denúncias, sugestões e feedbacks 
                com total conformidade e segurança. Pronta para usar em minutos.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cadastro">
                  <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-8 group">
                    Começar Grátis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-secondary-500 text-secondary-500 hover:bg-secondary-50 rounded-full px-8"
                  >
                    Ver Demo
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Lock className="h-5 w-5 text-primary-500" />
                  <span className="text-sm font-medium">ISO 27001</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span className="text-sm font-medium">LGPD</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">99.9% Uptime</span>
                </div>
              </div>
            </div>

            {/* Right: Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-cyan-300 rounded-3xl blur-3xl opacity-20 -z-10" />
              
              {/* Dashboard Card */}
              <div className="relative bg-white rounded-3xl shadow-large p-8 border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-secondary-500">Dashboard</p>
                      <p className="text-xs text-slate-500">Visão em tempo real</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-600">Online</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-4 border border-primary-200">
                    <p className="text-sm text-primary-700 font-medium mb-1">Denúncias</p>
                    <p className="text-2xl font-bold text-primary-600">247</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowRight className="w-3 h-3 text-green-600 rotate-[-45deg]" />
                      <span className="text-xs text-green-700">+12% este mês</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-secondary-50 to-secondary-100/50 rounded-xl p-4 border border-secondary-200">
                    <p className="text-sm text-secondary-700 font-medium mb-1">Resolvidas</p>
                    <p className="text-2xl font-bold text-secondary-600">189</p>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-700">76% taxa</span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-secondary-600">Proteção Máxima</p>
                      <p className="text-xs text-slate-500">Criptografia end-to-end</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-secondary-600">Anonimato</p>
                      <p className="text-xs text-slate-500">Privacidade garantida</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-secondary-600">Rápido</p>
                      <p className="text-xs text-slate-500">Setup em 5 minutos</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="produto" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-6">
              <Zap className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">
                Funcionalidades Completas
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary-500 mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Uma plataforma completa para gerenciar feedback de forma profissional e segura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-large hover:border-primary-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-500 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="seguranca" className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-3xl blur-3xl opacity-10 -z-10" />
              
              <div className="bg-white rounded-3xl shadow-large p-8 border border-slate-200">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-500">Certificações</p>
                    <p className="text-xs text-slate-500">Conformidade total</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-secondary-600">ISO 27001</span>
                    </div>
                    <span className="text-xs text-green-700 font-medium">Certificado</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                      <span className="font-semibold text-secondary-600">LGPD</span>
                    </div>
                    <span className="text-xs text-primary-700 font-medium">Conformidade</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary-50 to-secondary-100/50 rounded-xl border border-secondary-200">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-secondary-600" />
                      <span className="font-semibold text-secondary-600">Criptografia AES-256</span>
                    </div>
                    <span className="text-xs text-secondary-700 font-medium">Ativo</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-600" />
                      <span className="font-semibold text-secondary-600">Backup Automático</span>
                    </div>
                    <span className="text-xs text-slate-700 font-medium">Diário</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  Máxima Segurança
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-secondary-500 leading-tight">
                Proteção e conformidade
                <span className="block text-primary-500">em primeiro lugar</span>
              </h2>

              <p className="text-lg text-slate-600 leading-relaxed">
                Nossa plataforma foi desenvolvida com os mais altos padrões de segurança 
                e privacidade, garantindo total conformidade com LGPD e certificações internacionais.
              </p>

              <div className="space-y-4 pt-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary-600" />
                    </div>
                    <p className="font-medium text-secondary-600">{benefit}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/cadastro">
                  <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-8 group">
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
      <section id="precos" className="relative bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 text-white py-20 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-20 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-10 -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">
              Teste grátis por 14 dias, sem cartão de crédito
            </span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
            Pronto para começar?
          </h2>
          
          <p className="text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto">
            Crie sua conta grátis agora e tenha um canal de ética profissional 
            funcionando em menos de 5 minutos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/cadastro">
              <Button
                size="lg"
                className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-8 group shadow-large"
              >
                Começar Grátis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-secondary-600 rounded-full px-8"
              >
                Agendar Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary-400" />
              <span className="text-sm">Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary-400" />
              <span className="text-sm">Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary-400" />
              <span className="text-sm">Suporte em português</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer showBranding />
    </>
  );
}
