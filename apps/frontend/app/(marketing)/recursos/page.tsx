'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { H1, H2, H3, Paragraph } from '@/components/ui/typography';
import { 
  Shield, 
  Lock, 
  Palette, 
  Zap, 
  BarChart3, 
  CheckCircle,
  MessageSquare,
  Users,
  Bell,
  FileText,
  Search,
  Download,
  Globe,
  Smartphone,
  Code,
  TrendingUp,
  Eye,
  Clock,
  Filter,
  Tag,
  Mail,
  Webhook,
  Database,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface Feature {
  icon: any;
  title: string;
  description: string;
  details: string[];
}

const CORE_FEATURES: Feature[] = [
  {
    icon: MessageSquare,
    title: 'Cadastro de Feedbacks',
    description: 'Interface intuitiva para registro rápido e completo',
    details: [
      'Formulário simplificado em 3 etapas',
      'Upload de arquivos e evidências',
      'Categorização automática',
      'Anonimato garantido quando necessário',
      'Múltiplos canais de entrada'
    ]
  },
  {
    icon: Shield,
    title: 'Segurança e Privacidade',
    description: 'Proteção total dos dados e conformidade garantida',
    details: [
      'Criptografia end-to-end',
      'Conformidade com LGPD',
      'Certificação ISO 27001',
      'Auditoria de acessos',
      'Anonimização de dados'
    ]
  },
  {
    icon: BarChart3,
    title: 'Relatórios e Analytics',
    description: 'Dashboards inteligentes com insights acionáveis',
    details: [
      'Visualizações em tempo real',
      'Filtros avançados',
      'Exportação em múltiplos formatos',
      'Métricas customizáveis',
      'Análise de tendências'
    ]
  },
  {
    icon: Palette,
    title: 'White Label Completo',
    description: 'Personalize com a identidade da sua marca',
    details: [
      'Logo e cores personalizadas',
      'Domínio próprio',
      'Customização de emails',
      'Temas personalizados',
      'Remoção de marca Ouvify'
    ]
  }
];

const ADVANCED_FEATURES: Feature[] = [
  {
    icon: Bell,
    title: 'Notificações Inteligentes',
    description: 'Alertas automáticos e personalizáveis',
    details: [
      'Notificações por email',
      'Webhooks para integrações',
      'Alertas por prioridade',
      'Escalação automática',
      'Resumos periódicos'
    ]
  },
  {
    icon: Users,
    title: 'Gestão de Equipes',
    description: 'Controle total de usuários e permissões',
    details: [
      'Múltiplos níveis de acesso',
      'Atribuição de casos',
      'Histórico de ações',
      'Grupos e departamentos',
      'Single Sign-On (SSO)'
    ]
  },
  {
    icon: Search,
    title: 'Busca Avançada',
    description: 'Encontre qualquer informação rapidamente',
    details: [
      'Busca full-text',
      'Filtros múltiplos',
      'Busca por protocolo',
      'Histórico de pesquisas',
      'Busca semântica'
    ]
  },
  {
    icon: Code,
    title: 'API REST Completa',
    description: 'Integre com seus sistemas existentes',
    details: [
      'Documentação completa',
      'Webhooks configuráveis',
      'SDKs disponíveis',
      'Rate limiting configurável',
      'Versionamento de API'
    ]
  }
];

const WORKFLOW_FEATURES: Feature[] = [
  {
    icon: FileText,
    title: 'Gestão de Protocolos',
    description: 'Acompanhamento completo do ciclo de vida',
    details: [
      'Status personalizáveis',
      'SLA configurável',
      'Histórico completo',
      'Comentários internos',
      'Anexos e evidências'
    ]
  },
  {
    icon: Filter,
    title: 'Triagem Automática',
    description: 'Classificação inteligente de feedbacks',
    details: [
      'Categorização por IA',
      'Priorização automática',
      'Roteamento inteligente',
      'Detecção de duplicatas',
      'Análise de sentimento'
    ]
  },
  {
    icon: Tag,
    title: 'Sistema de Tags',
    description: 'Organize e encontre facilmente',
    details: [
      'Tags personalizadas',
      'Hierarquia de categorias',
      'Sugestão automática',
      'Filtros por tags',
      'Analytics por categoria'
    ]
  },
  {
    icon: Clock,
    title: 'Gestão de SLA',
    description: 'Cumpra prazos e mantenha qualidade',
    details: [
      'SLA por categoria',
      'Alertas de vencimento',
      'Métricas de cumprimento',
      'Escalação automática',
      'Relatórios de performance'
    ]
  }
];

const INTEGRATION_FEATURES: Feature[] = [
  {
    icon: Mail,
    title: 'Integração por Email',
    description: 'Receba e responda feedbacks por email',
    details: [
      'Email personalizado',
      'Respostas automáticas',
      'Templates customizáveis',
      'Conversação por thread',
      'Anexos suportados'
    ]
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Conecte com qualquer sistema',
    details: [
      'Eventos configuráveis',
      'Retry automático',
      'Log de requisições',
      'Autenticação segura',
      'Payload customizável'
    ]
  },
  {
    icon: Database,
    title: 'Export de Dados',
    description: 'Seus dados sempre acessíveis',
    details: [
      'Export CSV/Excel',
      'Export JSON',
      'Backup automático',
      'Export agendado',
      'GDPR compliance'
    ]
  },
  {
    icon: Globe,
    title: 'Widget Embarcável',
    description: 'Integre em qualquer site ou app',
    details: [
      'Código de embed simples',
      'Responsivo',
      'Customizável',
      'Multi-idioma',
      'Analytics integrado'
    ]
  }
];

export default function RecursosPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30" />
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Recursos Completos</span>
            </div>
            <H1 className="mb-6 text-primary">
              Tudo que Você Precisa para<br />
              <span className="text-secondary">Gestão de Feedbacks</span>
            </H1>
            <Paragraph className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Uma plataforma completa com recursos poderosos, fácil de usar e totalmente personalizável
            </Paragraph>
          </div>

          {/* Core Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <H2 className="mb-4 text-secondary">Recursos Principais</H2>
              <Paragraph className="text-muted-foreground">
                As funcionalidades essenciais para sua operação
              </Paragraph>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {CORE_FEATURES.map((feature, idx) => (
                <Card key={idx} className="border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl bg-white">
                  <CardHeader>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2 text-secondary">{feature.title}</CardTitle>
                        <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-1" />
                          <span className="text-sm text-secondary">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Advanced Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <H2 className="mb-4 text-secondary">Recursos Avançados</H2>
              <Paragraph className="text-muted-foreground">
                Funcionalidades para operações complexas
              </Paragraph>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ADVANCED_FEATURES.map((feature, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow border-border bg-white">
                  <CardHeader>
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mb-3">
                      <feature.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <CardTitle className="text-lg mb-2 text-secondary">{feature.title}</CardTitle>
                    <CardDescription className="text-sm mb-4 text-muted-foreground">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Workflow Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <H2 className="mb-4">Gestão de Workflow</H2>
              <Paragraph className="text-gray-600">
                Automatize e otimize seus processos
              </Paragraph>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {WORKFLOW_FEATURES.map((feature, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <feature.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-sm mb-4">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Integration Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <H2 className="mb-4">Integrações e APIs</H2>
              <Paragraph className="text-gray-600">
                Conecte com suas ferramentas favoritas
              </Paragraph>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {INTEGRATION_FEATURES.map((feature, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                      <feature.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-sm mb-4">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white text-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Por Que Escolher o Ouvify?</h2>
              <p className="text-xl text-primary-100">
                Benefícios comprovados por centenas de empresas
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white/10 border-white/20 text-gray-900">
                <CardHeader>
                  <TrendingUp className="w-10 h-10 mb-4" />
                  <CardTitle className="text-gray-900">+85% de Eficiência</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary-100">
                    Reduza em até 85% o tempo de gestão de feedbacks com automações inteligentes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-gray-900">
                <CardHeader>
                  <Eye className="w-10 h-10 mb-4" />
                  <CardTitle className="text-gray-900">100% de Transparência</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary-100">
                    Visibilidade completa de todos os feedbacks com rastreabilidade total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-gray-900">
                <CardHeader>
                  <Shield className="w-10 h-10 mb-4" />
                  <CardTitle className="text-gray-900">Conformidade LGPD</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary-100">
                    Segurança e privacidade garantidas com certificação ISO 27001
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <H2 className="mb-6">Pronto para Experimentar?</H2>
            <Paragraph className="text-xl text-gray-600 mb-8">
              Teste todos os recursos gratuitamente por 14 dias. Sem cartão de crédito.
            </Paragraph>
            
            <div className="flex gap-4 justify-center">
              <Link href="/cadastro">
                <Button size="lg">
                  Começar Grátis
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  Agendar Demo
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Setup em 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Suporte em português</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}
