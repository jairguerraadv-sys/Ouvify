# 🧩 OUVIFY - DESIGN SYSTEM (Developers Guide)

**Versão:** 3.0 (Pós-Rebrand)  
**Data:** 06 de Fevereiro, 2026  
**Status:** ✅ Oficial  
**Para:** Desenvolvedores Frontend

---

## 📖 ÍNDICE

1. [Introdução](#-introdução)
2. [Componentes Core](#-componentes-core)
3. [Espaçamento (Múltiplo de 4)](#-espaçamento-múltiplo-de-4)
4. [Acessibilidade](#-acessibilidade)
5. [Padrões de Código](#-padrões-de-código)
6. [Troubleshooting](#-troubleshooting)

---

## 🚀 INTRODUÇÃO

Este é o **guia técnico** do Design System do Ouvify. Se você é designer, consulte o [Brand Guidelines](./BRAND_GUIDELINES.md). Este documento foca em **como implementar** componentes corretamente.

### **Stack Técnica**

| Ferramenta       | Versão | Uso                   |
| ---------------- | ------ | --------------------- |
| **React**        | 18.x   | Framework UI          |
| **Next.js**      | 14.x   | Server-side rendering |
| **Tailwind CSS** | 3.x    | Utility CSS           |
| **Shadcn UI**    | Latest | Componentes base      |
| **Lucide**       | Latest | Ícones                |
| **TypeScript**   | 5.x    | Type safety           |

### **Arquivos Importantes**

```bash
# Variáveis CSS (paleta de cores)
apps/frontend/app/globals.css

# Componentes UI
apps/frontend/components/ui/*.tsx

# Logo Component
apps/frontend/components/brand/Logo.tsx

# Configuração Tailwind
apps/frontend/tailwind.config.ts
```

---

## 🧩 COMPONENTES CORE

### **1. Button**

**Localização:** `components/ui/button.tsx`

#### **Variantes Disponíveis:**

```tsx
import { Button } from "@/components/ui/button";

// Default (Primary) - Ação principal
<Button variant="default">Enviar Feedback</Button>
// Renderiza: bg-primary hover:bg-primary-hover text-primary-foreground

// Destructive (Error) - Ações perigosas
<Button variant="destructive">Excluir Conta</Button>
// Renderiza: bg-error hover:bg-error-700

// Outline - Ação secundária
<Button variant="outline">Cancelar</Button>
// Renderiza: border-border-light hover:bg-muted

// Ghost - Ação terciária/discreta
<Button variant="ghost">Fechar</Button>
// Renderiza: hover:bg-muted

// Link - Parece link, age como botão
<Button variant="link">Saiba Mais</Button>
// Renderiza: text-primary underline-offset-4 hover:underline
```

#### **Tamanhos:**

```tsx
<Button size="sm">Pequeno</Button>   // px-3 py-1.5 text-xs
<Button size="default">Médio</Button> // px-4 py-2 text-sm
<Button size="lg">Grande</Button>    // px-6 py-3 text-base
<Button size="icon">🔍</Button>      // p-2 (quadrado)
```

#### **Estados:**

```tsx
// Loading
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Salvando...
    </>
  ) : (
    'Salvar'
  )}
</Button>

// Disabled
<Button disabled>Indisponível</Button>
// Renderiza: opacity-50 cursor-not-allowed

// Com ícone
<Button>
  <Send className="mr-2 h-4 w-4" />
  Enviar
</Button>
```

#### **Focus State (Acessibilidade):**

O Button já tem focus state built-in:

```css
focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
```

✅ **Você não precisa adicionar** nada extra. O componente cuida disso.

---

### **2. Card**

**Localização:** `components/ui/card.tsx`

#### **Estrutura Básica:**

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>
      Descrição opcional (text-muted-foreground)
    </CardDescription>
  </CardHeader>

  <CardContent>
    <p className="text-foreground">Conteúdo principal</p>
  </CardContent>

  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>;
```

#### **Card de KPI (Dashboard):**

```tsx
<Card>
  <CardContent className="pt-6">
    {/* Label */}
    <p className="text-sm font-medium text-muted-foreground">
      Total de Feedbacks
    </p>

    {/* Valor (WCAG AAA - 21:1 contraste) */}
    <div className="text-3xl font-bold text-foreground mt-2 mb-1">1,234</div>

    {/* Variação */}
    <p className="text-xs text-success flex items-center gap-1">
      <TrendingUp className="h-3 w-3" />
      +12% este mês
    </p>
  </CardContent>
</Card>
```

#### **Tokens Semânticos (Já Aplicados):**

- `border-border-light` (bordas)
- `bg-background` (fundo)
- `text-foreground` (texto principal)
- `shadow-md` (sombra)

✅ **Você não precisa** adicionar cores hardcoded. O componente já usa tokens.

---

### **3. Input**

**Localização:** `components/ui/input.tsx`

#### **Uso Básico:**

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div>
  <Label htmlFor="name" className="text-foreground">
    Nome Completo *
  </Label>
  <Input id="name" type="text" placeholder="João Silva" className="mt-1" />
</div>;
```

#### **Com Validação:**

```tsx
<div>
  <Label htmlFor="email" className="text-foreground">
    Email *
  </Label>
  <Input
    id="email"
    type="email"
    placeholder="joao@exemplo.com"
    className={cn("mt-1", errors.email && "border-error focus:ring-error")}
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" className="text-xs text-error mt-1">
      {errors.email.message}
    </p>
  )}
</div>
```

#### **Tokens Semânticos (Já Aplicados):**

- `placeholder:text-text-tertiary` (placeholder com baixa opacidade)
- `border-border-light` (borda padrão)
- `focus:ring-2 focus:ring-border-focus` (focus state WCAG)
- `hover:border-border-focus` (hover)

✅ **Focus state já está correto.** Não precisa modificar.

---

### **4. Badge**

**Localização:** `components/ui/badge.tsx`

#### **Variantes:**

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="default">Primary</Badge>
// Renderiza: bg-primary-100 text-primary-700

<Badge variant="success">Ativo</Badge>
// Renderiza: bg-success-100 text-success-700

<Badge variant="error">Erro</Badge>
// Renderiza: bg-error-100 text-error-700

<Badge variant="warning">Pendente</Badge>
// Renderiza: bg-warning-100 text-warning-700

<Badge variant="outline">Rascunho</Badge>
// Renderiza: border-border-light text-foreground
```

#### **Tamanhos:**

```tsx
<Badge size="sm">Pequeno</Badge>   // px-2 py-0.5 text-xs
<Badge size="default">Médio</Badge> // px-2.5 py-0.5 text-sm
<Badge size="lg">Grande</Badge>    // px-3 py-1 text-sm
```

#### **Uso em Status:**

```tsx
const getStatusBadge = (status: string) => {
  const variants = {
    novo: "default",
    em_progresso: "warning",
    concluido: "success",
    arquivado: "outline",
  } as const;

  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
};
```

✅ **Todas as variantes** usam tokens semânticos. Não use `bg-blue-500` ou cores hardcoded.

---

### **5. EmptyState**

**Localização:** `components/ui/empty-state.tsx` (394 linhas)

#### **Variantes Disponíveis:**

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Search, Users, Bell } from "lucide-react";

// Sem dados
<EmptyState
  variant="no-data"
  title="Nenhum dado disponível"
  description="Os dados aparecerão aqui quando houver registros."
/>

// Sem resultados de busca
<EmptyState
  variant="no-results"
  title="Nenhum resultado encontrado"
  description="Tente ajustar os filtros."
  actionLabel="Limpar Filtros"
  actionHref="/dashboard/feedbacks"
/>

// Sem feedbacks
<EmptyState
  variant="no-feedbacks"
  title="Nenhum feedback recebido"
  description="Compartilhe o link público para começar."
  actionLabel="Ver Link Público"
  actionHref="/dashboard/settings"
  actionExternal
/>

// Custom
<EmptyState
  icon={FileText}
  title="Título customizado"
  description="Descrição customizada"
  action={{
    label: "Ação Principal",
    onClick: () => console.log("Clicou"),
  }}
  secondaryAction={{
    label: "Ação Secundária",
    href: "/outra-pagina",
  }}
/>
```

#### **Props Principais:**

```tsx
interface EmptyStateProps {
  variant?:
    | "default"
    | "no-data"
    | "no-results"
    | "no-feedbacks"
    | "no-users"
    | "no-notifications"
    | "error"
    | "custom";
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string; // Legacy (use 'action')
  actionHref?: string; // Legacy (use 'action')
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    external?: boolean;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  size?: "sm" | "md" | "lg";
}
```

✅ **O componente já existe e funciona perfeitamente.** Use-o em páginas de lista quando não houver dados.

---

## 📐 ESPAÇAMENTO (MÚLTIPLO DE 4)

### **A Regra de Ouro**

**Sempre use múltiplos de 4px** para espaçamento. Isso garante consistência visual e alinhamento perfeito.

| Tailwind | Valor (px) | Quando Usar                         |
| -------- | ---------- | ----------------------------------- |
| `p-0`    | 0          | Reset                               |
| `p-1`    | 4px        | Mínimo (badges, tags)               |
| `p-2`    | 8px        | Compacto (buttons, inputs internos) |
| `p-3`    | 12px       | -                                   |
| `p-4`    | 16px       | **Padrão** (cards, sections)        |
| `p-5`    | 20px       | -                                   |
| `p-6`    | 24px       | **Cards grandes**                   |
| `p-8`    | 32px       | **Seções**                          |
| `p-12`   | 48px       | **Blocos grandes**                  |
| `p-16`   | 64px       | **Margens de página**               |

### **Aplicação Prática**

#### **Padding de Containers:**

```tsx
// ✅ Container responsivo (mobile-first)
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Conteúdo */}
</div>

// Mobile: 16px (px-4) | Tablet: 24px (sm:px-6) | Desktop: 32px (lg:px-8)
```

#### **Gap de Grids:**

```tsx
// ✅ Gap responsivo (Fase 3: UX & Contraste)
<div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <Card /> <Card /> <Card /> <Card />
</div>

// Mobile: 16px (gap-4) | Desktop: 24px (md:gap-6)
```

#### **Spacing Vertical:**

```tsx
// ✅ Space-y (espaçamento vertical consistente)
<div className="space-y-4">
  <Input />
  <Input />
  <Button />
</div>

// 16px entre cada elemento
```

#### **Margin para Seções:**

```tsx
// ✅ Margin bottom para separar seções
<section className="mb-8">
  <h2 className="text-4xl font-bold mb-4">Título</h2>
  <p>Conteúdo</p>
</section>

<section className="mb-8">
  <h2 className="text-4xl font-bold mb-4">Outra Seção</h2>
  <p>Conteúdo</p>
</section>

// 32px entre seções, 16px entre título e conteúdo
```

### **❌ Espaçamento Incorreto**

```tsx
// ❌ NUNCA use valores arbitrários
<div style={{ padding: '13px' }}>...</div>
<div style={{ marginTop: '27px' }}>...</div>

// ❌ NUNCA use classes não-Tailwind para spacing
<div className="custom-spacing-weird">...</div>

// ✅ USE Tailwind com múltiplos de 4
<div className="p-4 mt-8">...</div>
```

---

## ♿ ACESSIBILIDADE

### **1. Contraste de Texto**

**A regra mais importante:** Use `text-foreground` para textos críticos.

| Token                   | Contraste           | Quando Usar                                    |
| ----------------------- | ------------------- | ---------------------------------------------- |
| `text-foreground`       | **21:1** (WCAG AAA) | ✅ Valores de KPIs, títulos, dados importantes |
| `text-muted-foreground` | **7:1** (WCAG AA)   | ✅ Labels secundários, descrições              |
| `text-text-tertiary`    | **5:1** (WCAG AA)   | ✅ Placeholders, hints                         |

#### **Exemplos:**

```tsx
// ✅ Texto crítico (KPI)
<div className="text-3xl font-bold text-foreground">
  R$ 12.450,00
</div>

// ✅ Label secundário
<p className="text-sm font-medium text-muted-foreground">
  Total de Vendas
</p>

// ❌ Contraste insuficiente
<div className="text-3xl font-bold text-gray-400">
  R$ 12.450,00  {/* WCAG FAIL! */}
</div>
```

---

### **2. Focus States**

Todos os elementos interativos **devem** ter focus state visível.

#### **Focus Ring (Já Aplicado):**

Os componentes do Design System já têm focus correto:

```css
/* globals.css - aplicado automaticamente */
*:focus-visible {
  @apply outline-none ring-2 ring-border-focus ring-offset-2 rounded;
}
```

✅ Você **não precisa adicionar** focus manualmente em Button, Input, Select, etc.

#### **Focus em Elementos Customizados:**

```tsx
// ✅ Botão customizado com focus
<button className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
  Clique Aqui
</button>

// ✅ Div clicável com focus (se realmente necessário)
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  className="focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
>
  Ação
</div>
```

---

### **3. Keyboard Navigation**

Garanta que todos os elementos interativos sejam acessíveis via teclado.

```tsx
// ✅ Modal com keyboard trap
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogTitle>Título</DialogTitle>
    <DialogDescription>Descrição</DialogDescription>

    {/* Conteúdo */}

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// O Dialog já gerencia:
// - Focus trap (Tab não sai do modal)
// - ESC fecha o modal
// - Focus retorna ao elemento que abriu
```

---

### **4. Alt Text em Imagens**

Todas as imagens **devem** ter alt text descritivo.

```tsx
// ✅ Alt text descritivo
<Logo size="md" alt="Logo Ouvify - Plataforma de Gestão de Feedbacks" />

// ✅ Imagem decorativa (alt vazio)
<img src="/pattern.png" alt="" aria-hidden="true" />

// ❌ Sem alt text
<img src="/logo.png" />  {/* Screen reader vai ler "logo.png" */}
```

---

### **5. ARIA Labels**

Use ARIA labels quando o contexto visual não é suficiente.

```tsx
// ✅ Botão com ícone + ARIA label
<Button variant="ghost" size="icon" aria-label="Fechar modal">
  <X className="h-4 w-4" />
</Button>

// ✅ Input com label visível (não precisa ARIA label)
<Label htmlFor="name">Nome</Label>
<Input id="name" />

// ✅ Live region (leitores anunciam mudanças)
<div role="status" aria-live="polite" aria-atomic="true">
  {successMessage}
</div>
```

---

### **6. Contraste no Modo Escuro**

O Ouvify tem suporte a Dark Mode nativo. Tokens semânticos se adaptam automaticamente.

```tsx
// ✅ Adapta automaticamente ao tema
<div className="bg-background text-foreground">
  {/* Light: white bg, black text */}
  {/* Dark: black bg, white text */}
</div>

// ❌ NUNCA force cores específicas em dark mode
<div className="dark:bg-gray-900">  {/* Quebra white-label */}
```

---

## 📦 PADRÕES DE CÓDIGO

### **1. Estrutura de Página**

**Template padrão** para criar uma nova página:

```tsx
// apps/frontend/app/dashboard/minha-pagina/page.tsx

import { PageLayout, PageHeader, PageContent } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MinhaPage() {
  return (
    <PageLayout>
      <PageHeader title="Título da Página" description="Descrição opcional">
        <Button>Nova Ação</Button>
      </PageHeader>

      <PageContent>
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card Título</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Conteúdo</p>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageLayout>
  );
}
```

---

### **2. Formulário Padrão**

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
});

type FormData = z.infer<typeof formSchema>;

export function MeuFormulario() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/endpoint", data);
      toast({
        title: "Sucesso!",
        description: "Dados salvos com sucesso.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar dados.",
        variant: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-foreground">
          Nome Completo *
        </Label>
        <Input
          id="name"
          {...register("name")}
          className={errors.name && "border-error"}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-error mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email" className="text-foreground">
          Email *
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          className={errors.email && "border-error"}
        />
        {errors.email && (
          <p className="text-xs text-error mt-1">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          "Salvar"
        )}
      </Button>
    </form>
  );
}
```

---

### **3. Lista com Loading/EmptyState**

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

export function ListaFeedbacks() {
  const { data, isLoading, error } = useFeedbacks();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Carregando feedbacks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        variant="error"
        title="Erro ao carregar feedbacks"
        description={error.message}
        actionLabel="Tentar Novamente"
        actionHref="/dashboard/feedbacks"
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        variant="no-feedbacks"
        title="Nenhum feedback encontrado"
        description="Compartilhe o link público para começar."
        actionLabel="Ver Link Público"
        action
        Href="/dashboard/settings"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {data.map((feedback) => (
        <Card key={feedback.id}>
          <CardContent>
            <h3 className="font-semibold text-foreground">{feedback.titulo}</h3>
            <p className="text-sm text-muted-foreground">
              {feedback.descricao}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## 🔧 TROUBLESHOOTING

### **Problema 1: Contraste parece baixo**

**Sintoma:** Textos difíceis de ler.

**Causa:** Usando `text-secondary-600` ou `text-gray-400` em textos principais.

**Solução:**

```tsx
// ❌ Antes
<p className="text-secondary-600">Importante</p>

// ✅ Depois
<p className="text-foreground">Importante</p>
```

---

### **Problema 2: Spacing inconsistente em mobile**

**Sintoma:** Layout "apertado" em mobile.

**Causa:** Usando valores fixos como `gap-8` sem responsividade.

**Solução:**

```tsx
// ❌ Antes
<div className="grid gap-8 grid-cols-1 md:grid-cols-2">

// ✅ Depois (mobile-first)
<div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2">
```

---

### **Problema 3: Logo não aparece**

**Sintoma:** Logo quebrada ou não carrega.

**Causa:** Usando caminho incorreto ou `<img src="/logo.png">` diretamente.

**Solução:**

```tsx
// ❌ Antes
<img src="/logo.png" alt="Logo" />;

// ✅ Depois
import { Logo } from "@/components/brand/Logo";
<Logo size="md" />;
```

---

### **Problema 4: Focus ring não aparece**

**Sintoma:** Navegação via teclado sem feedback visual.

**Causa:** Usando `outline: none` ou `:focus` ao invés de `:focus-visible`.

**Solução:**

```tsx
// ❌ Antes
<button className="outline-none">Clique</button>

// ✅ Depois
<Button>Clique</Button>  {/* Ou use focus-visible:ring-2 */}
```

---

### **Problema 5 EmptyState não encontrado**

**Sintoma:** Import do EmptyState falha.

**Causa:** Caminho de import incorreto.

**Solução:**

```tsx
// ❌ Antes
import { EmptyState } from "@/components/EmptyState";

// ✅ Depois
import { EmptyState } from "@/components/ui/empty-state";
```

---

### **Problema 6: TypeScript errors em componentes**

**Sintoma:** `Property 'variant' does not exist on type...`

**Causa:** Tipagem incorreta ou props não definidas.

**Solução:**

```tsx
// ✅ Use as props corretas do componente
<Button variant="default" size="lg">
  Clique
</Button>

// Se o erro persiste, verifique o arquivo do componente
// components/ui/button.tsx - e veja quais variants existem
```

---

## ✅ CHECKLIST PRÉ-COMMIT

Antes de commitar mudanças, verifique:

### **Código**

- [ ] Nenhuma cor hardcoded (`#333`, `rgb()`, etc.)
- [ ] Todos os texts críticos usam `text-foreground`
- [ ] Spacing usa múltiplos de 4 (`p-4`, `gap-6`, `mt-8`)
- [ ] Grids são responsivos (`gap-4 md:gap-6`)
- [ ] Logo usa `<Logo />` component

### **Acessibilidade**

- [ ] Focus rings visíveis em elementos interativos
- [ ] Alt text em imagens
- [ ] Labels em formulários (não usar placeholder como label)
- [ ] ARIA labels em botões com só ícone

### **Performance**

- [ ] Não há imports não-utilizados
- [ ] Componentes usam lazy loading quando apropriado
- [ ] Imagens usam `next/image` (não `<img>`)

### **Testing**

- [ ] Testado em mobile (375px)
- [ ] Testado navegação via teclado (Tab, Enter, Esc)
- [ ] Estados de loading/error implementados

---

## 📚 REFERÊNCIAS RÁPIDAS

### **Documentação Oficial**

- [Brand Guidelines](./BRAND_GUIDELINES.md) - Manual de marca (designers)
- [Rebrand Fase 1](./REBRAND_VISUAL_FASE_1.md) - Cores & Tipografia
- [Rebrand Fase 2](./REBRAND_VISUAL_FASE_2.md) - Logo & Layouts
- [Rebrand Fase 3](./REBRAND_VISUAL_FASE_3.md) - UX & Contraste
- [Resumo Executivo](./REBRAND_RESUMO_EXECUTIVO.md) - Visão geral

### **Arquivos de Código**

- [globals.css](../apps/frontend/app/globals.css) - Variáveis CSS
- [Logo Component](../apps/frontend/components/brand/Logo.tsx) - Implementação
- [Button Component](../apps/frontend/components/ui/button.tsx) - Exemplo
- [Design System Showcase](http://localhost:3000/design-system) - Preview interativo

### **Ferramentas Externas**

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn UI Docs](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/icons)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🤝 SUPORTE

**Dúvidas sobre implementação?**

- 📧 Email: dev@ouvify.com
- 💬 Slack: #frontend-dev
- 📝 GitHub Issues: Use label `design-system`
- 📖 Wiki: [Confluence - Design System](http://wiki.ouvify.com/design-system)

---

**Design System Ouvify - v3.0**  
Última atualização: 06 de Fevereiro, 2026  
© 2026 Ouvify. Todos os direitos reservados.
