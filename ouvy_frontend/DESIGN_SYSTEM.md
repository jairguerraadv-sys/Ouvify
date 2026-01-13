# 🎨 OUVY DESIGN SYSTEM - Implementação do novo tema

## 📋 Visão Geral

Este documento descreve o novo Design System do Ouvy, baseado na identidade visual modernizada com as cores:
- **Primária (Cyan):** `#00BCD4` - Ícone/Acento vibrante
- **Secundária (Navy):** `#0A1E3B` - Navegação/Títulos/Base

---

## 🎯 Estrutura de Cores

### Paleta Semântica

```typescript
// tailwind.config.ts
colors: {
  primary: {
    light: "#00E5FF",    // Hover states
    DEFAULT: "#00BCD4",  // Primária
    dark: "#0097A7",     // Active states
  },
  secondary: {
    light: "#1A3A52",    // Hover states
    DEFAULT: "#0A1E3B",  // Secundária
    dark: "#051121",     // Active states
  },
  neutral: {
    50: "#F8FAFC",      // Backgrounds leves
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    500: "#64748B",
    700: "#334155",
    900: "#0F172A",
  }
}
```

---

## 📦 Componentes Disponíveis

### 1. **Logo** (`components/ui/logo.tsx`)

Componente flexível com SVG inline para mudar de cor via Tailwind.

**Props:**
- `variant`: `'full'` | `'icon'` | `'text'`
- `colorScheme`: `'auto'` | `'primary'` | `'white'`
- `darkMode`: `boolean`
- `linkTo`: URL para Link wrapper
- `className`: Classes customizadas

**Exemplo:**
```tsx
import { Logo } from '@/components/ui/logo';

// Logo completa em navegação
<Logo variant="full" linkTo="/" />

// Apenas ícone em sidebar mobile
<Logo variant="icon" colorScheme="primary" />

// Branca em fundo escuro
<Logo variant="full" colorScheme="white" />
```

---

### 2. **Button** (`components/ui/button.tsx`)

Botões com variantes semânticas alinhadas ao tema.

**Variantes:**
- `default` - Cyan (primária)
- `secondary` - Navy blue
- `outline` - Borderizado cyan
- `ghost` - Sem fundo
- `destructive` - Vermelho

**Props:**
- `variant`: Um das variantes acima
- `size`: `'sm'` | `'md'` | `'lg'`
- `isLoading`: `boolean` - Mostra spinner

**Exemplo:**
```tsx
import { Button } from '@/components/ui/button';

// Cyan primária
<Button variant="default" size="lg">
  Cadastrar
</Button>

// Navy outline
<Button variant="outline-secondary" size="md">
  Ver Detalhes
</Button>

// Com loading
<Button isLoading>Processando...</Button>
```

---

### 3. **Card** (`components/ui/card.tsx`)

Containers com variantes de estilo.

**Variantes:**
- `default` - Sutil (bom para listas)
- `elevated` - Sombra forte
- `outlined` - Border cyan

**Exemplo:**
```tsx
import { Card, CardHeader } from '@/components/ui/card';

<Card variant="elevated">
  <CardHeader>
    <h2 className="text-secondary font-bold">
      Título do Card
    </h2>
  </CardHeader>
  <div className="p-6">
    Conteúdo do card...
  </div>
</Card>
```

---

### 4. **Badge & Chip** (`components/ui/badge-chip.tsx`)

Componentes de tags e chips.

**Badge Variantes:**
- `primary`, `secondary`, `success`, `warning`, `error`, `info`, `outline`

**Exemplo:**
```tsx
import { Badge, Chip } from '@/components/ui/badge-chip';

// Badge
<Badge variant="primary">Ativo</Badge>
<Badge variant="outline">Em Revisão</Badge>

// Chip removível
<Chip 
  variant="primary"
  onRemove={() => setItems(items.filter(...))}
>
  React
</Chip>
```

---

### 5. **NavBar & Footer** (`components/ui/navbar-footer.tsx`)

Componentes de navegação pré-estilizados.

**Exemplo:**
```tsx
import { NavBar, Footer } from '@/components/ui/navbar-footer';

<NavBar
  links={[
    { label: 'Produtos', href: '#products', active: true },
    { label: 'Planos', href: '#pricing' },
    { label: 'Docs', href: '/docs' },
  ]}
  rightContent={
    <Button>Login</Button>
  }
  sticky
/>

{/* Page content */}

<Footer showBranding />
```

---

## 🎨 Tipografia

### Hierarquia de Texto

```tsx
// Títulos (Navy Blue)
<h1 className="text-4xl font-bold text-secondary">Título H1</h1>
<h2 className="text-3xl font-bold text-secondary">Título H2</h2>
<h3 className="text-2xl font-semibold text-secondary">Título H3</h3>

// Texto corpo (Cinza neutro)
<p className="text-base text-neutral-700">
  Parágrafo com fonte padrão...
</p>

// Texto secundário (Cinza claro)
<p className="text-sm text-neutral-500">
  Texto de rodapé ou info secundária
</p>

// Destaque (Cyan)
<span className="text-primary font-semibold">Destaque importante</span>
```

---

## 🎯 Exemplos de Uso Completo

### Landing Page Header

```tsx
'use client';

import { NavBar } from '@/components/ui/navbar-footer';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <NavBar
      links={[
        { label: 'Produto', href: '#produto' },
        { label: 'Planos', href: '#planos' },
        { label: 'Docs', href: '/docs' },
      ]}
      rightContent={
        <>
          <Button variant="ghost">Login</Button>
          <Button variant="default">Começar Grátis</Button>
        </>
      }
    />
  );
}
```

### Card de Feature

```tsx
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge-chip';
import { Shield } from 'lucide-react';

export function FeatureCard() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-secondary">
              Segurança Garantida
            </h3>
            <Badge variant="success" className="mt-2">
              ISO 27001
            </Badge>
          </div>
          <Shield className="w-6 h-6 text-primary" />
        </div>
      </CardHeader>
      <div className="p-6 space-y-4">
        <p className="text-neutral-700">
          Seus dados estão protegidos com criptografia
          end-to-end e conformidade LGPD.
        </p>
        <Button variant="outline" fullWidth>
          Saiba Mais
        </Button>
      </div>
    </Card>
  );
}
```

### Formulário com Tema

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge-chip';

export function LoginForm() {
  return (
    <Card variant="elevated" className="max-w-md mx-auto mt-16">
      <CardHeader>
        <h2 className="text-2xl font-bold text-secondary">
          Bem-vindo ao Ouvy
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Entre com sua conta para continuar
        </p>
      </CardHeader>
      
      <form className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-secondary mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="seu@email.com"
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-secondary mb-2">
            Senha
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <Button variant="default" size="lg" className="w-full">
          Entrar
        </Button>

        <p className="text-center text-sm text-neutral-500">
          Não tem conta?{' '}
          <a href="/signup" className="text-primary font-semibold hover:text-primary-dark">
            Criar conta
          </a>
        </p>
      </form>
    </Card>
  );
}
```

---

## 🚀 Próximos Passos de Implementação

1. **Aplicar em todas as páginas:**
   - `app/page.tsx` - Landing page
   - `app/login/page.tsx` - Login
   - `app/cadastro/page.tsx` - Signup
   - `app/dashboard/page.tsx` - Dashboard principal
   - Todos os sub-pages do dashboard

2. **Temas escuros:** Se necessário, estender com dark mode

3. **Animações:** Adicionar transições suaves (já incluídas nos componentes)

4. **Accessibility:** Testar com screen readers e validar contraste

5. **Responsividade:** Garantir mobile-first

---

## 📊 Checklist de Migração

- [ ] Tailwind config atualizado
- [ ] Logo.tsx com SVG inline
- [ ] Button.tsx com novas variantes
- [ ] Card.tsx com variantes
- [ ] Badge/Chip criados
- [ ] NavBar/Footer criados
- [ ] Landing page reformatada
- [ ] Login/Signup reformatados
- [ ] Dashboard reformatado
- [ ] Testes visuais em desktop/mobile
- [ ] Commit e deploy

---

**Versão:** 1.0.0  
**Data:** 13 de Janeiro de 2026  
**Status:** ✅ Design System Completo
