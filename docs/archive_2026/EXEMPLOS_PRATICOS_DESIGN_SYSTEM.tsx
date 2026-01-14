// 📚 EXEMPLOS PRÁTICOS - NOVO DESIGN SYSTEM OUVY v2.0

// ============================================================================
// EXEMPLO 1: PÁGINA DE DENÚNCIA
// ============================================================================

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge, Chip } from '@/components/ui/badge-chip';
import { H2, H3, Paragraph, Lead } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Eye } from 'lucide-react';

export function DenunciaForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Enviar Denúncia Anônima</CardTitle>
          <Lead className="mt-2 text-base">
            Seu feedback seguro e confidencial
          </Lead>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Badges de segurança */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Seguro</Badge>
            <Badge variant="info">Confidencial</Badge>
            <Chip icon={<Shield size={16} />}>Criptografia 256-bit</Chip>
            <Chip icon={<Eye size={16} />}>Anônimo</Chip>
          </div>

          {/* Seção de informações */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <H3 className="mb-2">Garantias da Plataforma</H3>
            <Paragraph size="sm" muted>
              Suas informações são protegidas por:
            </Paragraph>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Criptografia end-to-end</li>
              <li>Conformidade LGPD</li>
              <li>Sem rastreamento de IP</li>
              <li>Dados isolados por tenant</li>
            </ul>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Selecione o tipo
              </label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Denúncia</Button>
                <Button variant="secondary">Sugestão</Button>
                <Button variant="ghost">Feedback</Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Descrição
              </label>
              <textarea
                placeholder="Descreva sua denúncia..."
                className="w-full p-3 rounded-lg border border-border focus-visible:ring-2 focus-visible:ring-primary"
                rows={6}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button variant="default" size="lg" isLoading={isSubmitting}>
            Enviar Denúncia
          </Button>
          <Button variant="outline" size="lg">
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


// ============================================================================
// EXEMPLO 2: DASHBOARD COM STATS
// ============================================================================

import { H1, H2 } from '@/components/ui/typography';

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <H1>Dashboard de Denúncias</H1>
        <p className="text-muted-foreground mt-2">
          Acompanhe todas as denúncias em tempo real
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="default">
          <CardContent className="p-6">
            <Paragraph size="sm" muted>Total</Paragraph>
            <H2 className="text-3xl font-bold text-primary">1.234</H2>
            <Badge variant="success" className="mt-4">↑ 5% vs mês passado</Badge>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-6">
            <Paragraph size="sm" muted>Em Análise</Paragraph>
            <H2 className="text-3xl font-bold text-warning">45</H2>
            <Badge variant="warning" className="mt-4">Requer ação</Badge>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-6">
            <Paragraph size="sm" muted>Resolvidas</Paragraph>
            <H2 className="text-3xl font-bold text-success">1.089</H2>
            <Badge variant="success" className="mt-4">✓ Completo</Badge>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-6">
            <Paragraph size="sm" muted>Bloqueadas</Paragraph>
            <H2 className="text-3xl font-bold text-error">100</H2>
            <Badge variant="error" className="mt-4">Abusivas</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Denúncias Recentes */}
      <div>
        <H2 className="mb-4">Denúncias Recentes</H2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 1, title: 'Abuso verbal', status: 'analyzing', badge: 'warning' },
            { id: 2, title: 'Fraude detectada', status: 'resolved', badge: 'success' },
            { id: 3, title: 'Violação de política', status: 'pending', badge: 'info' },
          ].map(item => (
            <Card key={item.id} variant="outlined">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <Badge variant={item.badge as any}>
                    {item.status === 'analyzing' && 'Em Análise'}
                    {item.status === 'resolved' && 'Resolvida'}
                    {item.status === 'pending' && 'Pendente'}
                  </Badge>
                </div>
                <Paragraph size="sm" muted>
                  Recebida há 2 horas por admin@empresa.com
                </Paragraph>
                <Button variant="ghost-primary" size="sm" className="mt-4">
                  Ver Detalhes →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// EXEMPLO 3: COMPONENTES EM DIFERENTES ESTADOS
// ============================================================================

export function ComponentShowcase() {
  return (
    <div className="space-y-8 p-6">
      <section>
        <H2 className="mb-4">Variantes de Botão</H2>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button isLoading>Loading...</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <H2 className="mb-4">Tamanhos de Botão</H2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
          <Button size="icon">+</Button>
          <Button size="icon-sm">×</Button>
          <Button size="icon-lg">→</Button>
        </div>
      </section>

      <section>
        <H2 className="mb-4">Variantes de Card</H2>
        <div className="grid grid-cols-2 gap-4">
          <Card variant="default">
            <CardHeader><CardTitle>Default</CardTitle></CardHeader>
            <CardContent>Sutil e elegante</CardContent>
          </Card>
          <Card variant="elevated">
            <CardHeader><CardTitle>Elevated</CardTitle></CardHeader>
            <CardContent>Destaca com sombra forte</CardContent>
          </Card>
          <Card variant="outlined">
            <CardHeader><CardTitle>Outlined</CardTitle></CardHeader>
            <CardContent>Ênfase com borda cyan</CardContent>
          </Card>
          <Card variant="ghost">
            <CardHeader><CardTitle>Ghost</CardTitle></CardHeader>
            <CardContent>Minimal e limpo</CardContent>
          </Card>
        </div>
      </section>

      <section>
        <H2 className="mb-4">Badges e Chips</H2>
        <div className="space-y-4">
          <div>
            <Paragraph size="sm" muted className="mb-3">Badges</Paragraph>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="ghost">Ghost</Badge>
            </div>
          </div>
          <div>
            <Paragraph size="sm" muted className="mb-3">Chips</Paragraph>
            <div className="flex flex-wrap gap-2">
              <Chip variant="primary">Primary Chip</Chip>
              <Chip variant="secondary">Secondary Chip</Chip>
              <Chip variant="success">Success Chip</Chip>
              <Chip disabled>Disabled Chip</Chip>
            </div>
          </div>
        </div>
      </section>

      <section>
        <H2 className="mb-4">Tipografia</H2>
        <div className="space-y-3">
          <div>
            <H1>Heading 1 (H1)</H1>
          </div>
          <div>
            <H2>Heading 2 (H2)</H2>
          </div>
          <div>
            <H3>Heading 3 (H3)</H3>
          </div>
          <div>
            <Paragraph>
              Parágrafo normal com leading relaxado. Use para conteúdo principal.
            </Paragraph>
          </div>
          <div>
            <Lead>Lead - Subtítulo introdutório em destaque</Lead>
          </div>
          <div>
            <Small>Small - Texto pequeno e secundário</Small>
          </div>
          <div>
            <Muted>Muted - Muito pequeno e desaturado</Muted>
          </div>
        </div>
      </section>

      <section>
        <H2 className="mb-4">Formulários</H2>
        <Card variant="default">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Nome completo
              </label>
              <Input placeholder="Digite seu nome..." />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email
              </label>
              <Input type="email" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Mensagem
              </label>
              <textarea
                placeholder="Sua mensagem aqui..."
                className="w-full p-3 rounded-lg border border-border"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="default">Enviar</Button>
              <Button variant="ghost">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


// ============================================================================
// EXEMPLO 4: VALIDAÇÃO COM CORES SEMÂNTICAS
// ============================================================================

interface ValidationState {
  email: 'idle' | 'valid' | 'invalid';
  password: 'idle' | 'valid' | 'invalid';
}

export function FormValidation() {
  const [state, setState] = useState<ValidationState>({
    email: 'idle',
    password: 'idle',
  });

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>Exemplo de Validação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold">Email</label>
            {state.email === 'valid' && (
              <Badge variant="success" size="sm">✓ Válido</Badge>
            )}
            {state.email === 'invalid' && (
              <Badge variant="error" size="sm">✗ Inválido</Badge>
            )}
          </div>
          <Input
            type="email"
            placeholder="seu@email.com"
            onChange={(e) => {
              if (e.target.value.includes('@')) {
                setState(s => ({ ...s, email: 'valid' }));
              } else {
                setState(s => ({ ...s, email: 'invalid' }));
              }
            }}
            className={state.email === 'invalid' ? 'border-error' : ''}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold">Senha</label>
            {state.password === 'valid' && (
              <Badge variant="success" size="sm">✓ Forte</Badge>
            )}
            {state.password === 'invalid' && (
              <Badge variant="warning" size="sm">⚠ Fraca</Badge>
            )}
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            onChange={(e) => {
              if (e.target.value.length >= 8) {
                setState(s => ({ ...s, password: 'valid' }));
              } else {
                setState(s => ({ ...s, password: 'invalid' }));
              }
            }}
          />
        </div>

        <Button
          variant="default"
          disabled={state.email !== 'valid' || state.password !== 'valid'}
        >
          Conectar
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// FIM DOS EXEMPLOS
// ============================================================================

export default ComponentShowcase;
