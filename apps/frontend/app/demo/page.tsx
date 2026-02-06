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
import { Container, DecorativeBlob, MutedText } from '@/components/ui';
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
        
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
          {/* Decorative elements */}
          <DecorativeBlob tone="primary" placement="topRightQuarter" />
          <DecorativeBlob tone="success" placement="bottomLeftQuarter" />
          
          <Card className="max-w-2xl w-full text-center border-border shadow-xl relative z-10">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <CardTitle className="text-3xl text-secondary">Solicitação Enviada!</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Obrigado pelo interesse! Nossa equipe entrará em contato em até 24 horas para agendar sua demonstração personalizada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <p className="text-sm text-secondary">
                  📧 Enviamos um email de confirmação para <strong className="text-primary">{formData.email}</strong>
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

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <DecorativeBlob tone="primary" placement="topLeftQuarter" />
        <DecorativeBlob tone="secondary" placement="bottomRightQuarter" />
        
        {/* Hero Section */}
        <section className="py-16 sm:py-24 relative z-10">
          <Container>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Demonstração Gratuita</span>
            </div>
            <H1 className="mb-6 text-primary">
              Veja o Ouvify <span className="text-secondary">em Ação</span>
            </H1>
            <Paragraph className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Agende uma demonstração personalizada e descubra como o Ouvify pode transformar a gestão de feedbacks da sua empresa
            </Paragraph>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {demoFeatures.map((feature, idx) => (
              <Card key={idx} className="border-2 border-border hover:border-primary transition-colors bg-card">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-secondary">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Demo Request Form */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <Card className="border-2 border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-secondary">Solicite uma Demonstração</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Preencha o formulário e nossa equipe entrará em contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-secondary">Nome Completo *</Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      required
                      className="border-border"
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

                  <MutedText block size="xs" className="text-center">
                    Respeitamos sua privacidade. Seus dados estão seguros e não serão compartilhados.
                  </MutedText>
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
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="bg-primary/10 border-primary">
                <CardContent className="pt-6">
                  <div className="flex gap-3 mb-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Duração: 30 minutos</h4>
                      <MutedText block>
                        Demonstração personalizada com tempo para perguntas
                      </MutedText>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-success/10 border-success">
                <CardContent className="pt-6">
                  <div className="flex gap-3 mb-3">
                    <Eye className="w-5 h-5 text-success flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Teste Grátis por 14 dias</h4>
                      <MutedText block>
                        Após a demo, experimente a plataforma sem compromisso
                      </MutedText>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="bg-card text-foreground py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prefere começar agora?
            </h2>
            <p className="text-xl mb-8 text-primary">
              Crie sua conta gratuita e comece a usar em minutos
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/cadastro">
                <Button size="lg" variant="secondary">
                  Criar Conta Grátis
                </Button>
              </Link>
              <Link href="/precos">
                <Button size="lg" variant="outline" className="bg-transparent border-border text-foreground hover:bg-muted">
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
