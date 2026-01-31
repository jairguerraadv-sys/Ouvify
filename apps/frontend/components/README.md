# Estrutura de Componentes - Ouvify Frontend

Este documento descreve a organização e padrões dos componentes do frontend Ouvify.

## 📁 Estrutura de Diretórios

```
components/
├── brand/                    # Componentes de identidade visual
│   ├── Logo.tsx             # Logo com variantes (full, icon, text)
│   └── index.ts
│
├── dashboard/                # Componentes do painel administrativo
│   ├── DashboardLayout.tsx  # Layout wrapper do dashboard
│   ├── sidebar.tsx          # Navegação lateral
│   ├── header.tsx           # Header do dashboard
│   ├── RechartsComponents.tsx # Gráficos
│   ├── Widgets.tsx          # Widgets de métricas
│   └── index.ts
│
├── layout/                   # Componentes de layout do site
│   ├── Header.tsx           # Header marketing
│   └── Footer.tsx           # Footer
│
├── ui/                       # Componentes UI reutilizáveis (shadcn/ui)
│   ├── accessibility.tsx    # Acessibilidade (SkipLink, FocusTrap)
│   ├── alert.tsx           # Alertas
│   ├── badge.tsx           # Badges
│   ├── button.tsx          # Botões
│   ├── card.tsx            # Cards
│   ├── empty-state.tsx     # Estados vazios
│   ├── form-field.tsx      # Campos de formulário
│   ├── input.tsx           # Inputs
│   ├── loading-state.tsx   # Estados de loading
│   ├── logo.tsx            # Logo (wrapper do brand/Logo)
│   ├── page-layout.tsx     # Layout de página
│   ├── toast-system.tsx    # Sistema de notificações
│   ├── typography.tsx      # Tipografia (H1-H6, Paragraph)
│   └── index.ts            # Exports centralizados
│
├── billing/                  # Componentes de faturamento
├── audit/                    # Componentes de auditoria
├── data/                     # Export/Import de dados
└── forms/                    # Formulários específicos
```

## 🎨 Design Tokens

Os tokens de design estão centralizados em:

```
styles/
└── design-tokens.ts         # Cores, tipografia, espaçamento
```

### Uso dos Tokens

```tsx
import { colors, typography, spacing, shadows } from '@/styles/design-tokens';

// Exemplo de uso
const styles = {
  backgroundColor: colors.primary[500],
  padding: spacing[4],
  fontSize: typography.fontSizes.lg,
};
```

## 🔧 Padrões de Componentes

### 1. Estrutura de Arquivo

```tsx
'use client'; // Se necessário

import React from 'react';
import { cn } from '@/lib/utils';
// ... outros imports

// ============================================
// TYPES
// ============================================

interface ComponentProps {
  /** Descrição da prop */
  prop: string;
}

// ============================================
// COMPONENT
// ============================================

/**
 * Descrição do componente
 * 
 * @example
 * ```tsx
 * <Component prop="value" />
 * ```
 */
export function Component({ prop }: ComponentProps) {
  return <div>{prop}</div>;
}

export default Component;
```

### 2. Variantes com CVA

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'variant-classes',
        outline: 'outline-classes',
      },
      size: {
        sm: 'size-sm-classes',
        md: 'size-md-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export function Button({ variant, size, children }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })}>
      {children}
    </button>
  );
}
```

### 3. Composição de Componentes

```tsx
// Componente composto (Compound Component Pattern)
function Card({ children, className }: CardProps) {
  return <div className={cn('card-base', className)}>{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="card-content">{children}</div>;
}

// Export nomeado
export { Card, CardHeader, CardContent };
```

## 🎯 Componentes Pré-configurados

### Logo

```tsx
import { 
  LogoHeader,        // Header principal
  LogoFooter,        // Rodapé
  LogoAuth,          // Páginas de auth
  LogoSidebar,       // Sidebar
  PoweredByOuvify,   // Selo "Powered by"
} from '@/components/brand';
```

### Dashboard

```tsx
import {
  DashboardLayout,   // Wrapper com sidebar
  DashboardHeader,   // Header da página
  DashboardSection,  // Seção de conteúdo
  DashboardGrid,     // Grid responsivo
  DashboardCard,     // Card padrão
  DashboardStat,     // Card de KPI
  DashboardEmpty,    // Estado vazio
} from '@/components/dashboard';
```

### Forms

```tsx
import {
  FormField,         // Campo com label/error
  FormSection,       // Seção de formulário
  FormActions,       // Área de botões
} from '@/components/ui';
```

### Loading

```tsx
import {
  LoadingState,      // Loading completo
  LoadingSpinner,    // Spinner simples
  PageLoading,       // Loading de página
  Skeleton,          // Placeholder de conteúdo
} from '@/components/ui';
```

### Toast/Feedback

```tsx
import {
  ToastProvider,     // Provider (no layout)
  useToast,          // Hook para toasts
  ConfirmDialog,     // Dialog de confirmação
} from '@/components/ui';

// Uso
const { success, error } = useToast();
success('Salvo com sucesso!');
```

## ♿ Acessibilidade

### Componentes de Acessibilidade

```tsx
import {
  SkipLink,          // Link para pular navegação
  VisuallyHidden,    // Conteúdo só para screen readers
  FocusTrap,         // Trap de foco para modais
  LiveRegion,        // Região live para anúncios
  useAnnounce,       // Hook para anunciar mensagens
} from '@/components/ui';
```

### Checklist de Acessibilidade

- [ ] Todas as imagens têm `alt`
- [ ] Formulários têm labels associados
- [ ] Cores têm contraste WCAG AA (4.5:1)
- [ ] Navegação por teclado funciona
- [ ] Focus visível em todos elementos interativos
- [ ] Mensagens de erro são anunciadas
- [ ] Skip link no início da página

## 📦 Importações

### Preferir imports do index

```tsx
// ✅ Correto
import { Button, Card, Input } from '@/components/ui';
import { Logo, LogoHeader } from '@/components/brand';
import { DashboardLayout, DashboardHeader } from '@/components/dashboard';

// ❌ Evitar
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

## 🔄 Atualizações

- **Janeiro 2026**: Design System v1.0
  - Criados design tokens
  - Componentes de layout
  - Sistema de toasts
  - Componentes de acessibilidade

---

*Última atualização: Janeiro 2026*
