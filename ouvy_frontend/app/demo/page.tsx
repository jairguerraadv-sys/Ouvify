'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { H1, H2, Paragraph } from '@/components/ui/typography';
import { NavBar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { 
  CheckCircle, 
  Clock, 
  Shield, 
  Zap,
  MessageSquare,
  BarChart3,
  Eye,
  Send
} from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    empresa: '',
    telefone: '',
    cargo: '',
    mensagem: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular envio (substituir por integração real)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const demoFeatures = [
    {
      icon: MessageSquare,
      title: 'Interface Real',
      description: 'Explore nossa plataforma com dados de exemplo'
    },
    {
      icon: BarChart3,
      title: 'Dashboards Interativos',
      description: 'Veja relatórios e métricas em tempo real'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Conheça nossos protocolos de proteção de dados'
    },
    {
      icon: Zap,
      title: 'Configuração Rápida',
      description: 'Veja como implementar em menos de 24h'
    }
  ];

  const navLinks = [
    { label: 'Início', href: '/' },
    { label: 'Recursos', href: '/recursos' },
    { label: 'Preços', href: '/precos' },
  ];

  if (submitted) {
    return (
      <>
        <NavBar
          links={navLinks}
          rightContent={
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/cadastro">
                <Button variant="default">Começar Grátis</Button>
              </Link>
            </div>
          }
        />
        
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
          <Card className="max-w-2xl w-full text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Solicitação Enviada!</CardTitle>
              <CardDescription className="text-lg">
                Obrigado pelo interesse! Nossa equipe entrará em contato em até 24 horas para agendar sua demonstração personalizada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  📧 Enviamos um email de confirmação para <strong>{formData.email}</strong>
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Link href="/">
                  <Button variant="outline">Voltar ao Início</Button>
                </Link>
                <Link href="/cadastro">
                  <Button>Criar Conta Grátis</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar
        links={navLinks}
        rightContent={
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button variant="default">Começar Grátis</Button>
            </Link>
          </div>
        }
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <Badge className="mb-4">Demonstração Gratuita</Badge>
            <H1 className="mb-6">
              Veja o Ouvy em Ação
            </H1>
            <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto">
              Agende uma demonstração personalizada e descubra como o Ouvy pode transformar a gestão de feedbacks da sua empresa
            </Paragraph>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {demoFeatures.map((feature, idx) => (
              <Card key={idx} className="border-2 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Demo Request Form */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Solicite uma Demonstração</CardTitle>
                <CardDescription>
                  Preencha o formulário e nossa equipe entrará em contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Corporativo *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa *</Label>
                    <Input
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      placeholder="Nome da empresa"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        type="tel"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        name="cargo"
                        value={formData.cargo}
                        onChange={handleChange}
                        placeholder="Seu cargo"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Como podemos ajudar?</Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleChange}
                      placeholder="Conte-nos sobre suas necessidades..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>Enviando...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Solicitar Demonstração
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Respeitamos sua privacidade. Seus dados estão seguros e não serão compartilhados.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4">O que você verá na demo</h3>
                <div className="space-y-4">
                  {[
                    'Plataforma completa com dados reais',
                    'Processo de cadastro de feedback em segundos',
                    'Dashboards e relatórios em tempo real',
                    'Recursos de personalização White Label',
                    'Configurações de segurança e privacidade',
                    'Integrações disponíveis via API'
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex gap-3 mb-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Duração: 30 minutos</h4>
                      <p className="text-sm text-gray-600">
                        Demonstração personalizada com tempo para perguntas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex gap-3 mb-3">
                    <Eye className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Teste Grátis por 14 dias</h4>
                      <p className="text-sm text-gray-600">
                        Após a demo, experimente a plataforma sem compromisso
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prefere começar agora?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Crie sua conta gratuita e comece a usar em minutos
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/cadastro">
                <Button size="lg" variant="secondary">
                  Criar Conta Grátis
                </Button>
              </Link>
              <Link href="/precos">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Ver Planos e Preços
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
