# 🎨 GUIA RÁPIDO: Componente Logo

**Versão:** 2.0 (Fase 2 - Logo & Layouts)  
**Data:** 06/02/2026  
**Status:** ✅ Produção

---

## 📌 IMPORTAÇÃO RÁPIDA

```tsx
// Opção 1: Componente principal
import { Logo } from "@/components/brand/Logo";

// Opção 2: Através de ui/logo (re-export)
import { Logo } from "@/components/ui/logo";

// Opção 3: Componentes pré-configurados
import {
  LogoHeader,
  LogoAuth,
  LogoSidebar,
  PoweredByOuvify,
} from "@/components/ui/logo";
```

---

## 🎯 USO BÁSICO

### **1. Logo Padrão (Clicável para Home)**

```tsx
<Logo />
// Resultado: Logo médio (40×130px) que leva para "/"
```

### **2. Logo Grande (Páginas de Auth)**

```tsx
<LogoAuth />
// Resultado: Logo 56×180px, NÃO clicável
```

### **3. Logo Header (Sticky Top)**

```tsx
<LogoHeader />
// Resultado: Logo 40×130px, clicável, priority loading
```

### **4. Logo Não Clicável**

```tsx
<Logo href={null} />
// Resultado: Logo estático sem link
```

---

## 🔧 PROPS DISPONÍVEIS

```tsx
interface LogoProps {
  // Variante do logo
  variant?: "full" | "icon" | "text";
  // Esquema de cores
  color?: "default" | "white" | "dark";
  // Tamanho
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  // URL de destino (null para não clicável)
  href?: string | null;
  // Classes CSS adicionais
  className?: string;
  // Prioridade de carregamento (LCP)
  priority?: boolean;
  // Animação de hover
  animated?: boolean;
}
```

---

## 📏 TAMANHOS DISPONÍVEIS

| Size  | Dimensões | Uso Recomendado              |
| ----- | --------- | ---------------------------- |
| `xs`  | 24×80px   | Badges, mini-widgets         |
| `sm`  | 32×100px  | Footer, sidebar colapsada    |
| `md`  | 40×130px  | **Header, sidebar** (padrão) |
| `lg`  | 56×180px  | **Auth, modais**             |
| `xl`  | 80×260px  | **Hero, envio feedback**     |
| `2xl` | 96×320px  | Landing pages, destaque      |

### **Exemplos**

```tsx
<Logo size="xs" />   {/* Pequeno para badges */}
<Logo size="sm" />   {/* Footer */}
<Logo size="md" />   {/* Header (padrão) */}
<Logo size="lg" />   {/* Login/Cadastro */}
<Logo size="xl" />   {/* Página de envio */}
<Logo size="2xl" />  {/* Hero section */}
```

---

## 🎨 CORES & VARIANTES

### **Cores**

```tsx
<Logo color="default" />  {/* Logo normal (padrão) */}
<Logo color="white" />    {/* Logo branca (fundos escuros) */}
<Logo color="dark" />     {/* Logo escura (fundos claros) */}
```

### **Variantes (NOTA: Todas usam /logo.png atualmente)**

```tsx
<Logo variant="full" />  {/* Logo completo (padrão) */}
<Logo variant="icon" />  {/* Apenas ícone (1:1 proporção) */}
<Logo variant="text" />  {/* Apenas texto */}
```

**⚠️ IMPORTANTE:** Atualmente todas as variantes renderizam o mesmo `/logo.png`.  
Para usar variantes diferentes, adicione `/logo-icon.png` e `/logo-text.png` ao `/public/`.

---

## 🚀 COMPONENTES PRÉ-CONFIGURADOS

### **LogoHeader** - Header Público

```tsx
import { LogoHeader } from "@/components/ui/logo";

<header>
  <LogoHeader />
</header>;
```

**Config:** `variant="full"`, `size="md"`, `priority={true}`

### **LogoAuth** - Páginas de Autenticação

```tsx
import { LogoAuth } from "@/components/ui/logo";

<div className="text-center">
  <LogoAuth />
  <h1>Bem-vindo ao Ouvify</h1>
</div>;
```

**Config:** `variant="full"`, `size="lg"`, `href={null}` (não clicável)

### **LogoSidebar** - Sidebar Expandida

```tsx
import { LogoSidebar } from "@/components/ui/logo";

<aside className="sidebar">
  <LogoSidebar />
</aside>;
```

**Config:** `variant="full"`, `size="sm"`, `priority={true}`

### **LogoSidebarCollapsed** - Sidebar Colapsada

```tsx
import { LogoSidebarCollapsed } from "@/components/ui/logo";

<aside className="sidebar-collapsed">
  <LogoSidebarCollapsed />
</aside>;
```

**Config:** `variant="icon"`, `size="md"`, `priority={true}`

### **PoweredByOuvify** - Badge White-Label

```tsx
import { PoweredByOuvify } from "@/components/ui/logo";

<footer>
  <PoweredByOuvify size="sm" />
</footer>;
```

**Resultado:** "Powered by Ouvify" com logo pequeno

---

## 🎭 CASOS DE USO COMUNS

### **1. Header com Logo Clicável**

```tsx
<header className="sticky top-0 bg-background border-b">
  <div className="container flex items-center justify-between h-16">
    <LogoHeader />
    <nav>{/* ... */}</nav>
  </div>
</header>
```

### **2. Sidebar do Dashboard**

```tsx
<aside className="w-64 border-r">
  <div className="flex h-16 items-center justify-center border-b">
    <Logo size="md" />
  </div>
  <nav>{/* ... */}</nav>
</aside>
```

### **3. Página de Login**

```tsx
<main className="min-h-screen flex items-center justify-center">
  <Card className="w-full max-w-md">
    <div className="flex justify-center mb-8">
      <LogoAuth />
    </div>
    <h1>Entre na sua conta</h1>
    <form>{/* ... */}</form>
  </Card>
</main>
```

### **4. Página de Envio (White-Label)**

```tsx
{
  /* Se tenant tem logo customizada, usa ela. Senão, usa logo Ouvify */
}
{
  theme?.logo ? (
    <img src={theme.logo} alt={theme.nome} className="h-16 w-auto mx-auto" />
  ) : (
    <Logo size="xl" />
  );
}
```

### **5. Footer com Badge**

```tsx
<footer className="border-t py-8">
  <div className="container text-center">
    <Logo size="sm" href={null} className="mb-4" />
    <PoweredByOuvify size="sm" />
  </div>
</footer>
```

### **6. Logo Branca em Fundo Escuro**

```tsx
<section className="bg-slate-900 py-20">
  <div className="container text-center">
    <Logo size="xl" color="white" />
    <h2 className="text-white mt-6">...</h2>
  </div>
</section>
```

---

## 🎨 CUSTOMIZAÇÃO AVANÇADA

### **Logo com Classes Tailwind**

```tsx
<Logo size="md" className="opacity-80 hover:opacity-100 transition-opacity" />
```

### **Logo com Animação Customizada**

```tsx
<Logo
  size="lg"
  animated={true}
  className="hover:rotate-6 transition-transform duration-300"
/>
```

### **Logo Não Clicável com Link Wrapper**

```tsx
<Link href="/sobre">
  <Logo href={null} size="md" />
</Link>
```

### **Logo com Link Customizado**

```tsx
<Logo href="/dashboard" size="md" className="ring-2 ring-primary" />
```

---

## ♿ ACESSIBILIDADE

### **Alt Text Automático**

Todas as logos têm `alt="Ouvify"` automaticamente.

### **Focus Ring**

Logos clicáveis têm focus ring para navegação por teclado:

```tsx
<Logo />
// Gera: focus-visible:ring-2 focus-visible:ring-primary
```

### **Aria Label**

Logos clicáveis têm `aria-label="Ouvify - Ir para página inicial"`.

---

## 🔧 TROUBLESHOOTING

### **Logo Não Aparece**

**Problema:** Componente renderiza mas imagem não carrega

**Soluções:**

1. Verificar se `/public/logo.png` existe:
   ```bash
   ls -lah apps/frontend/public/logo.png
   ```
2. Verificar se Next.js está servindo arquivos estáticos:
   ```bash
   curl http://localhost:3000/logo.png
   ```
3. Limpar cache do Next.js:
   ```bash
   rm -rf apps/frontend/.next
   npm run dev
   ```

### **Logo Muito Grande/Pequena**

**Problema:** Tamanho não adequado ao contexto

**Solução:** Use os tamanhos padrão recomendados:

```tsx
// Headers
<Logo size="md" />  // 40×130px

// Auth
<Logo size="lg" />  // 56×180px

// Hero
<Logo size="xl" />  // 80×260px
```

### **Logo Não Clicável**

**Problema:** Logo não redireciona ao clicar

**Solução 1:** Verificar se `href` está definido (padrão é `"/"`)

```tsx
<Logo /> // Clicável para "/"
```

**Solução 2:** Se quiser não clicável, use `href={null}`

```tsx
<Logo href={null} />
```

### **Logo Fora de Proporção**

**Problema:** Logo esticada ou distorcida

**Solução:** Componente usa `object-contain` automaticamente:

```tsx
// ✅ Correto (mantém proporção)
<Logo size="md" />

// ❌ Evitar (pode distorcer)
<img src="/logo.png" style={{ width: '100%', height: '100%' }} />
```

---

## 📊 PERFORMANCE

### **Priority Loading**

Use `priority={true}` em logos acima da dobra (LCP):

```tsx
// ✅ Logo no header (first paint)
<Logo priority={true} />

// ❌ Logo no footer (não crítico)
<Logo priority={false} />
```

### **Lazy Loading Automático**

Next.js faz lazy loading automático de logos não-priority.

### **Image Optimization**

Logo é otimizada automaticamente:

- **Formato:** WebP (quando suportado)
- **Quality:** 90 (configurado)
- **Responsive:** Next.js gera múltiplos tamanhos

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

Ao adicionar logo em uma nova página:

- [ ] Importar componente correto (`LogoHeader`, `LogoAuth`, etc.)
- [ ] Escolher tamanho adequado ao contexto
- [ ] Definir se deve ser clicável (`href` ou `href={null}`)
- [ ] Usar `priority={true}` se logo for LCP (acima da dobra)
- [ ] Adicionar margem/padding adequado para "respirar"
- [ ] Testar em mobile (responsividade)
- [ ] Verificar contraste (logo visível no fundo)

---

## 📚 EXEMPLOS DE CÓDIGO COMPLETO

### **Header Completo**

```tsx
"use client";

import { LogoHeader } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <LogoHeader />

          <nav className="hidden md:flex gap-6">
            <Link href="/recursos">Recursos</Link>
            <Link href="/precos">Preços</Link>
          </nav>

          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### **Página de Login Completa**

```tsx
"use client";

import { LogoAuth } from "@/components/ui/logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <LogoAuth />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">
          Bem-vindo de volta
        </h1>

        <form className="space-y-4">
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Senha" />
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </Card>
    </main>
  );
}
```

---

## 🔗 REFERÊNCIAS

- **Componente:** `/apps/frontend/components/brand/Logo.tsx`
- **Re-export:** `/apps/frontend/components/ui/logo.tsx`
- **Logo PNG:** `/apps/frontend/public/logo.png`
- **Documentação Fase 2:** `/docs/REBRAND_VISUAL_FASE_2.md`

---

**Dúvidas?** Consulte a documentação completa em `docs/REBRAND_VISUAL_FASE_2.md`
