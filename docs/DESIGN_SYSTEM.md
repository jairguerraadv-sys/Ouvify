# 🎨 Design System - Ouvify

> Sistema unificado de design para o Ouvify - Plataforma SaaS de Gestão de Feedbacks

**Versão:** 2.1.0  
**Última atualização:** Janeiro 2026

---

## 📋 Índice

1. [Cores](#-cores)
2. [Tipografia](#-tipografia)
3. [Espaçamento](#-espaçamento)
4. [Componentes](#-componentes)
5. [Padrões de Layout](#-padrões-de-layout)
6. [Acessibilidade](#-acessibilidade)
7. [Boas Práticas](#-boas-práticas)

---

## 🎨 Cores

### Paleta Principal

#### Primary (Azul Profissional)
Nossa cor principal transmite confiança e profissionalismo.

| Token | Hex | Uso |
|-------|-----|-----|
| `primary-50` | `#EFF6FF` | Backgrounds sutis |
| `primary-100` | `#DBEAFE` | Hover states leves |
| `primary-500` | `#3B82F6` | **Cor principal** - CTAs, links |
| `primary-600` | `#2563EB` | Hover em botões |
| `primary-700` | `#1D4ED8` | Active states |

```tsx
// Exemplo de uso
<Button className="bg-primary-500 hover:bg-primary-600">
  Ação Principal
</Button>
```

#### Secondary (Roxo Criativo)
Cor de destaque para elementos especiais.

| Token | Hex | Uso |
|-------|-----|-----|
| `secondary-500` | `#A855F7` | Badges especiais, destaques |
| `secondary-600` | `#9333EA` | Hover |

#### Cores Semânticas

| Status | Cor | Token | Uso |
|--------|-----|-------|-----|
| ✅ Success | Verde | `success-500` (#22C55E) | Mensagens de sucesso |
| ⚠️ Warning | Laranja | `warning-500` (#F59E0B) | Alertas, avisos |
| ❌ Error | Vermelho | `error-500` (#EF4444) | Erros, ações destrutivas |
| ℹ️ Info | Ciano | `info-500` (#06B6D4) | Informações |

### Neutros

| Token | Hex | Uso |
|-------|-----|-----|
| `gray-50` | `#F9FAFB` | Backgrounds secundários |
| `gray-100` | `#F3F4F6` | Backgrounds terciários |
| `gray-200` | `#E5E7EB` | Bordas sutis |
| `gray-500` | `#6B7280` | Texto secundário |
| `gray-600` | `#4B5563` | Texto normal |
| `gray-900` | `#111827` | Texto principal, headings |

### Contraste WCAG AA

Todas as combinações de cores atendem aos requisitos de contraste:

- **Texto normal (16px):** Mínimo 4.5:1
- **Texto grande (18px+):** Mínimo 3:1
- **Elementos UI:** Mínimo 3:1

---

## 📝 Tipografia

### Fontes

| Família | Uso | Variável CSS |
|---------|-----|--------------|
| **Inter** | Corpo de texto, UI | `--font-inter` |
| **Poppins** | Headings, destaques | `--font-poppins` |
| **JetBrains Mono** | Código | `--font-mono` |

### Escala de Tamanhos

| Nome | Tamanho | Line Height | Uso |
|------|---------|-------------|-----|
| `xs` | 12px | 16px | Labels pequenos |
| `sm` | 14px | 20px | Texto secundário |
| `base` | 16px | 24px | Texto padrão |
| `lg` | 18px | 28px | Texto destacado |
| `xl` | 20px | 28px | Subtítulos |
| `2xl` | 24px | 32px | H4 |
| `3xl` | 30px | 36px | H3 |
| `4xl` | 36px | 40px | H2 |
| `5xl` | 48px | 1 | H1 |

### Hierarquia de Headings

```tsx
<h1 className="font-heading text-5xl font-bold text-gray-900 tracking-tight">
  Título Principal (H1)
</h1>

<h2 className="font-heading text-4xl font-bold text-gray-900 tracking-tight">
  Subtítulo (H2)
</h2>

<h3 className="font-heading text-3xl font-semibold text-gray-900">
  Seção (H3)
</h3>

<p className="text-base text-gray-600 leading-relaxed">
  Parágrafo padrão com boa legibilidade.
</p>
```

---

## 📐 Espaçamento

### Escala (Base: 8px)

| Token | Valor | Pixels | Uso |
|-------|-------|--------|-----|
| `2` | 0.5rem | 8px | Mínimo |
| `3` | 0.75rem | 12px | Entre elementos pequenos |
| `4` | 1rem | 16px | Padrão entre elementos |
| `6` | 1.5rem | 24px | Entre seções pequenas |
| `8` | 2rem | 32px | Entre seções |
| `12` | 3rem | 48px | Entre blocos grandes |
| `16` | 4rem | 64px | Seções de página |

### Aplicação

```tsx
// Padding de cards
<Card className="p-6"> {/* 24px */}

// Gap entre elementos
<div className="space-y-4"> {/* 16px vertical */}

// Margin entre seções
<section className="mb-8"> {/* 32px abaixo */}
```

---

## 🧩 Componentes

### Botões

#### Variantes

```tsx
// Primário - Ação principal
<Button variant="default">Salvar</Button>

// Secundário - Ação alternativa
<Button variant="secondary">Cancelar</Button>

// Outline - Ação terciária
<Button variant="outline">Ver Mais</Button>

// Ghost - Ação discreta
<Button variant="ghost">Fechar</Button>

// Destructive - Ação destrutiva
<Button variant="destructive">Excluir</Button>
```

#### Tamanhos

```tsx
<Button size="sm">Pequeno</Button>
<Button size="default">Médio</Button>
<Button size="lg">Grande</Button>
```

#### Com Loading

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <LoadingSpinner size="sm" className="mr-2" />
      Salvando...
    </>
  ) : (
    'Salvar'
  )}
</Button>
```

### Cards

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  
  <CardContent>
    Conteúdo principal
  </CardContent>
  
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

### Formulários

```tsx
import { Form, FormField, FormSection, FormActions, FormRow } from '@/components/ui/form-field';

<Form onSubmit={handleSubmit}>
  <FormSection title="Informações Pessoais">
    <FormRow cols={2}>
      <FormField
        label="Nome"
        name="nome"
        required
        error={errors.nome?.message}
      >
        <Input id="nome" {...register('nome')} />
      </FormField>
      
      <FormField
        label="Email"
        name="email"
        required
        error={errors.email?.message}
      >
        <Input id="email" type="email" {...register('email')} />
      </FormField>
    </FormRow>
  </FormSection>

  <FormActions>
    <Button variant="outline" type="button">Cancelar</Button>
    <Button type="submit">Salvar</Button>
  </FormActions>
</Form>
```

### Status Badges

```tsx
import { StatusBadge } from '@/components/ui/status-badge';

<StatusBadge status="success" label="Ativo" />
<StatusBadge status="warning" label="Pendente" />
<StatusBadge status="error" label="Erro" />
<StatusBadge status="info" label="Novo" />
```

### Empty States

```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { Inbox, Plus } from 'lucide-react';

<EmptyState
  variant="no-feedbacks"
  title="Nenhum feedback encontrado"
  description="Quando recebermos feedbacks, eles aparecerão aqui."
  action={{
    label: 'Criar Primeiro Feedback',
    onClick: () => navigate('/novo'),
  }}
/>
```

### Loading States

```tsx
import { LoadingState, PageLoading, LoadingSpinner } from '@/components/ui/loading-state';

// Spinner com texto
<LoadingState text="Carregando feedbacks..." />

// Página inteira
<PageLoading message="Processando..." />

// Spinner inline (para botões)
<LoadingSpinner size="sm" />

// Full screen overlay
<LoadingState fullScreen text="Salvando alterações..." />
```

### Breadcrumbs

```tsx
import { Breadcrumb } from '@/components/ui/breadcrumb';

<Breadcrumb
  items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Feedbacks', href: '/dashboard/feedbacks' },
    { label: 'FDB-2024-001' },
  ]}
/>
```

---

## 📐 Padrões de Layout

### Layout Utilities (Novos na v2.1)

Componentes utilitários para layouts comuns:

```tsx
import { 
  FlexRow, 
  FlexCol, 
  FlexBetween, 
  FlexCenter,
  Container, 
  Stack, 
  MutedText, 
  IconWrapper,
  Spinner,
  Section 
} from '@/components/ui';

// FlexRow - linha horizontal centralizada
<FlexRow gap="3">
  <Icon />
  <span>Label</span>
</FlexRow>

// FlexBetween - espaço entre elementos
<FlexBetween>
  <Title>Feedbacks</Title>
  <Button>Novo</Button>
</FlexBetween>

// Container - wrapper responsivo
<Container size="7xl" padding>
  <Content />
</Container>

// Stack - elementos verticais com espaçamento
<Stack gap="4">
  <Card />
  <Card />
  <Card />
</Stack>

// MutedText - texto secundário padronizado
<MutedText size="sm">Descrição secundária</MutedText>

// IconWrapper - ícones consistentes
<IconWrapper size="md" color="primary">
  <CheckIcon />
</IconWrapper>

// Spinner - loading inline
<Button disabled>
  <Spinner size="sm" />
  Salvando...
</Button>

// Section - seção com padding
<Section padding="lg">
  <Container>
    <Content />
  </Container>
</Section>
```

### Page Layout

```tsx
import { PageLayout, PageContent, PageSection } from '@/components/ui/page-layout';
import { PageHeader } from '@/components/ui/page-header';

<PageLayout variant="secondary">
  <PageHeader
    title="Feedbacks"
    description="Gerencie todos os feedbacks recebidos"
    action={{
      label: 'Novo Feedback',
      href: '/dashboard/feedbacks/novo',
      icon: Plus,
    }}
  />
  
  <PageContent>
    <PageSection title="Filtros">
      {/* Filtros */}
    </PageSection>
    
    <PageSection title="Lista de Feedbacks">
      {/* Lista */}
    </PageSection>
  </PageContent>
</PageLayout>
```

### Grid de Cards

```tsx
import { PageGrid } from '@/components/ui/page-layout';

<PageGrid cols={3} gap="md">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</PageGrid>
```

### Responsividade

```tsx
// Mobile first - adapta para desktop
<div className="flex flex-col md:flex-row gap-4 md:gap-8">
  <Sidebar className="w-full md:w-64" />
  <main className="flex-1">...</main>
</div>
```

---

## ♿ Acessibilidade

### Focus States

Todos os elementos interativos têm focus visível:

```css
*:focus-visible {
  outline: none;
  ring: 2px solid primary-500;
  ring-offset: 2px;
}
```

### Screen Readers

```tsx
// Texto apenas para leitores de tela
<span className="sr-only">Descrição para leitores</span>

// Ícones com label
<Button aria-label="Fechar modal">
  <X className="w-4 h-4" />
</Button>

// Status com role
<StatusBadge status="success" role="status" aria-label="Status: Ativo" />
```

### Formulários Acessíveis

```tsx
<FormField
  label="Email"
  name="email"
  required
  error={errors.email}
  helper="Usaremos apenas para comunicações importantes"
>
  <Input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby="email-error email-helper"
  />
</FormField>
```

### Contraste de Cores

| Combinação | Ratio | Status |
|------------|-------|--------|
| gray-900 / white | 16:1 | ✅ AAA |
| gray-600 / white | 7:1 | ✅ AA |
| primary-500 / white | 4.5:1 | ✅ AA |
| error-500 / white | 4.5:1 | ✅ AA |

---

## ✅ Boas Práticas

### Do's ✅

- ✅ Usar componentes do design system
- ✅ Respeitar hierarquia de cores e tipografia
- ✅ Manter espaçamento consistente (múltiplos de 8px)
- ✅ Testar acessibilidade (contraste, keyboard nav)
- ✅ Usar tokens de cor (`text-gray-900`) ao invés de hex

### Don'ts ❌

- ❌ Não usar cores hardcoded (`#333333`)
- ❌ Não criar componentes duplicados
- ❌ Não ignorar estados de loading/erro
- ❌ Não usar inline styles
- ❌ Não adicionar animações pesadas (>300ms)

### Exemplo: Antes e Depois

```tsx
// ❌ Antes (inconsistente)
<button 
  style={{ backgroundColor: '#3B82F6', color: 'white', padding: '10px 20px' }}
  onClick={handleClick}
>
  Salvar
</button>

// ✅ Depois (consistente)
<Button variant="default" onClick={handleClick}>
  Salvar
</Button>
```

---

## 📁 Estrutura de Arquivos

```
apps/frontend/
├── styles/
│   └── design-tokens.ts     # Tokens de design (cores, tipografia, espaçamento)
├── components/ui/
│   ├── button.tsx           # Botões
│   ├── card.tsx             # Cards
│   ├── form-field.tsx       # Campos de formulário (Form, FormField, FormSection, FormActions, FormRow)
│   ├── page-layout.tsx      # Layouts de página
│   ├── layout-utils.tsx     # 🆕 Utilitários (FlexRow, Container, Stack, MutedText, Spinner)
│   ├── loading-state.tsx    # Estados de loading
│   ├── empty-state.tsx      # Estados vazios
│   ├── status-badge.tsx     # Badges de status
│   ├── breadcrumb.tsx       # Breadcrumbs
│   ├── accessibility.tsx    # Componentes de acessibilidade
│   ├── toast-system.tsx     # Sistema de toasts
│   ├── typography.tsx       # Componentes de tipografia (H1-H6, Paragraph, etc.)
│   ├── skeleton.tsx         # Skeleton loaders
│   └── index.ts             # Exports centralizados
├── scripts/
│   ├── audit-styles.ts      # Auditoria de classes deprecated
│   └── detect-duplicate-styles.ts  # 🆕 Detecção de duplicações
└── app/
    └── globals.css          # CSS global e variáveis
```

---

## 🔗 Recursos

- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/icons)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Mantido por:** Equipe Ouvify  
**Última revisão:** Janeiro 2026
