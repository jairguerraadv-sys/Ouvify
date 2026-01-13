# 🎨 Guia de Componentes UI/UX - Ouvy

## Visão Geral da Modernização

A plataforma Ouvy foi completamente redesenhada com componentes elegantes, profissionais e modernos que refletem a identidade da marca.

### Paleta de Cores

```
🎯 Primary (Marca):      #00BCD4 (Cyan)
🏢 Secondary (Base):     #0A1E3B (Azul Marinho)
✨ Accent (Destaque):    #00D4FF (Cyan Brilhante)
⚪ Neutral (Fundos):     #F8FAFC - #0F172A
```

## Componentes Disponíveis

### 1. **LogoEnhanced** 
Logo responsiva com múltiplas variações

```tsx
import { LogoEnhanced } from '@/components/ui';

// Variante Full (padrão)
<LogoEnhanced variant="full" size="md" colorScheme="auto" />

// Variante Icon Only
<LogoEnhanced variant="icon-only" size="lg" />

// Variante Stacked
<LogoEnhanced variant="stacked" size="xl" showTagline />

// Props
- variant: 'full' | 'icon-only' | 'text-only' | 'stacked'
- size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- colorScheme: 'auto' | 'primary' | 'white' | 'dark' | 'gradient'
- href: string (link destino)
- animated: boolean
- showTagline: boolean
```

### 2. **NavBarEnhanced**
Barra de navegação elegante e responsiva

```tsx
import { NavBarEnhanced } from '@/components/ui';

<NavBarEnhanced
  links={[
    { label: 'Produto', href: '#features', badge: 'Novo' },
    { label: 'Planos', href: '#pricing' },
  ]}
  sticky
/>

// Props
- links: Array<{ label, href, badge? }>
- rightContent: React.ReactNode
- sticky: boolean
- transparent: boolean
```

### 3. **FooterEnhanced**
Rodapé moderno com links organizados

```tsx
import { FooterEnhanced } from '@/components/ui';

<FooterEnhanced
  sections={[...]}
  socials={[...]}
  copyright="© 2026 Ouvy"
/>
```

### 4. **Hero Section**
Seção hero elegante com gradientes

```tsx
import { Hero } from '@/components/ui';

<Hero
  title="Seu Canal de Ética Seguro"
  subtitle="Novo: White Label Completo"
  description="Plataforma SaaS com conformidade LGPD e ISO 27001"
  backgroundPattern="dots"
  gradient
>
  <div className="flex gap-4">
    <Button>Começar Grátis</Button>
    <Button variant="outline">Conhecer Mais</Button>
  </div>
</Hero>

// Props
- title: ReactNode
- subtitle: string
- description: string
- gradient: boolean
- backgroundPattern: 'dots' | 'grid' | 'waves' | 'none'
```

### 5. **FeatureCard**
Card de feature com ícone e badge

```tsx
import { FeatureCard, FeatureGrid } from '@/components/ui';

<FeatureGrid columns={3}>
  <FeatureCard
    icon={<ShieldIcon />}
    title="Segurança Total"
    description="Conformidade LGPD e ISO 27001"
    badge="Segurança"
    highlighted
  />
  <FeatureCard
    icon={<ZapIcon />}
    title="Rápido"
    description="Performance otimizada"
  />
</FeatureGrid>

// Props
- icon: ReactNode
- title: string
- description: string
- badge: string
- href: string (torna clicável)
- highlighted: boolean
```

### 6. **CardEnhanced**
Card versátil com múltiplos estilos

```tsx
import { Card } from '@/components/ui';

<Card variant="elevated" hover="lift" size="lg">
  <Card.Header>
    <h3>Título</h3>
  </Card.Header>
  <Card.Content>
    {/* conteúdo */}
  </Card.Content>
  <Card.Footer>
    {/* ações */}
  </Card.Footer>
</Card>

// Props
- variant: 'default' | 'elevated' | 'bordered' | 'ghost' | 'gradient'
- size: 'sm' | 'md' | 'lg' | 'xl'
- hover: 'none' | 'lift' | 'glow' | 'subtle'
- interactive: boolean
```

### 7. **ButtonEnhanced**
Botão com variantes de estilo

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg" icon={<ArrowRight />}>
  Clique aqui
</Button>

// Props
- variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
- size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- icon: ReactNode
- iconPosition: 'left' | 'right'
- isLoading: boolean
- fullWidth: boolean
- disabled: boolean
```

### 8. **InputEnhanced**
Input profissional com validação

```tsx
import { Input, Textarea } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  error={errors.email}
  hint="Usaremos para contato"
  icon={<EnvelopeIcon />}
/>

<Textarea
  label="Mensagem"
  rows={5}
  placeholder="Descreva sua mensagem..."
/>

// Props
- label: string
- error: string
- hint: string
- icon: ReactNode
- iconPosition: 'left' | 'right'
- size: 'sm' | 'md' | 'lg'
```

### 9. **Badge**
Badge para labels e status

```tsx
import { Badge } from '@/components/ui';

<Badge variant="primary">Novo</Badge>
<Badge variant="success">Ativo</Badge>
<Badge variant="error">Erro</Badge>

// Props
- variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
- size: 'sm' | 'md' | 'lg'
```

### 10. **Alert**
Caixa de alerta com ícone

```tsx
import { Alert } from '@/components/ui';

<Alert 
  title="Sucesso!"
  variant="success"
  icon={<CheckIcon />}
  dismissible
>
  Sua ação foi concluída com sucesso.
</Alert>

// Props
- title: string
- variant: 'success' | 'warning' | 'error' | 'info'
- icon: ReactNode
- dismissible: boolean
```

### 11. **Progress**
Barra de progresso elegante

```tsx
import { Progress } from '@/components/ui';

<Progress
  value={65}
  max={100}
  variant="primary"
  showLabel
/>

// Props
- value: number
- max: number
- variant: 'primary' | 'success' | 'warning' | 'error'
- size: 'sm' | 'md' | 'lg'
- showLabel: boolean
```

### 12. **PricingCard**
Card de plano de preço

```tsx
import { PricingCard } from '@/components/ui';

<PricingCard
  name="Profissional"
  price={299}
  currency="R$"
  period="/mês"
  description="Para empresas em crescimento"
  features={[
    'Até 5 canais',
    { label: 'Relatórios avançados', included: true },
    { label: 'API customizada', included: false },
  ]}
  highlighted
  badge="Mais Popular"
  cta={{ label: 'Começar Agora' }}
/>
```

### 13. **StatsGrid**
Grade de estatísticas

```tsx
import { StatsGrid } from '@/components/ui';

<StatsGrid 
  columns={3}
  stats={[
    { value: '500+', label: 'Empresas', unit: 'ativas' },
    { value: '10M+', label: 'Denúncias Processadas' },
  ]}
/>
```

## Animações Disponíveis

Classes CSS para animações:

```css
.animate-fade-in       /* Desbotamento suave */
.animate-slide-up      /* Desliza de baixo */
.animate-slide-down    /* Desliza de cima */
.animate-slide-left    /* Desliza da direita */
.animate-slide-right   /* Desliza da esquerda */
.animate-scale-in      /* Zoom suave */
.animate-pulse-subtle  /* Pulso sutil */
.animate-spin-slow     /* Giro lento */
.animate-bounce-gentle /* Bounce suave */
.animate-blur          /* Efeito blur */
```

## Shadows & Utilities

```css
.shadow-subtle  /* Sombra sutil para elementos */
.shadow-soft    /* Sombra macia padrão */
.shadow-neon    /* Efeito neon com primary color */

.bg-gradient-primary  /* Gradient com cores da marca */
.bg-gradient-dark     /* Gradient escuro */
.bg-gradient-soft     /* Gradient neutro */

.text-gradient        /* Texto com gradient */
.text-gradient-primary /* Texto gradient com primary */
```

## Tipografia

- **Fonte**: Inter (moderna e limpa)
- **Escalas**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
- **Weights**: 400, 500, 600, 700, 800, 900

## Cores Semânticas

```
Success:  #10B981 (Verde)
Warning:  #F59E0B (Âmbar)
Error:    #EF4444 (Vermelho)
Info:     #3B82F6 (Azul)
```

## Responsividade

Breakpoints padrão:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Exemplo de Página Completa

```tsx
'use client';

import {
  NavBarEnhanced,
  Hero,
  FeatureCard,
  FeatureGrid,
  Button,
  FooterEnhanced,
} from '@/components/ui';

export default function LandingPage() {
  return (
    <>
      <NavBarEnhanced
        links={[
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
        ]}
        sticky
      />

      <Hero
        title="Transforme Sua Ética Corporativa"
        subtitle="Nova Era"
        description="Solução completa para canal de ética com segurança garantida"
      >
        <Button size="lg">Começar Agora</Button>
      </Hero>

      <section className="py-20">
        <FeatureGrid columns={3}>
          <FeatureCard
            title="Segurança"
            description="LGPD e ISO 27001"
            icon={<ShieldIcon />}
            highlighted
          />
        </FeatureGrid>
      </section>

      <FooterEnhanced />
    </>
  );
}
```

## Acessibilidade

Todos os componentes incluem:
- Focus states visíveis
- Contraste adequado de cores
- Suporte a teclado completo
- Aria labels onde necessário
- Scroll suave

## Customização

Para customizar cores globalmente, edite:
- `/tailwind.config.ts` - Paleta de cores
- `/app/globals.css` - Estilos globais
- `/components/ui/index.ts` - Componentes

## Performance

- Components otimizados com `'use client'`
- Animações GPU-aceleradas
- Lazy loading de componentes
- Carregamento de fontes otimizado

---

**Última Atualização**: 13 de janeiro de 2026  
**Versão**: 2.0 (Redesign Profissional & Elegante)
