# 🎨 OUVIFY - MANUAL DE MARCA

**Versão:** 2.0 (Pós-Rebrand)  
**Data:** 06 de Fevereiro, 2026  
**Status:** ✅ Oficial

---

## 📖 ÍNDICE

1. [Nossa Identidade](#-nossa-identidade)
2. [Paleta de Cores](#-paleta-de-cores)
3. [Tipografia](#-tipografia)
4. [Logo & Identidade Visual](#-logo--identidade-visual)
5. [Princípios de Design](#-princípios-de-design)
6. [Guia de Uso Visual](#-guia-de-uso-visual)

---

## 🌟 NOSSA IDENTIDADE

### **Conceito: Modern SaaS**

O Ouvify adota o estilo **Modern SaaS** - uma abordagem visual profissional, limpa e confiável, inspirada por produtos de referência como **Vercel**, **Linear** e **Notion**.

### **Os 3 Pilares da Nossa Identidade**

#### 1. **🛡️ CONFIANÇA**

- Cores sóbrias e profissionais (Azul + Cinza)
- Contraste WCAG AAA (21:1) em textos críticos
- Mensagens de segurança visíveis (Lock icons, criptografia)

**Por quê?** Clientes confiam dados sensíveis ao Ouvify. Nossa interface precisa transmitir seriedade e segurança.

---

#### 2. **🔍 CLAREZA**

- Hierarquia visual forte (headings grandes, spacing generoso)
- Textos diretos e objetivos
- Empty states com instruções claras

**Por quê?** Usuários de SaaS B2B valorizam eficiência. Cada pixel deve ter um propósito.

---

#### 3. **♿ ACESSIBILIDADE**

- WCAG AAA em textos importantes
- Focus states visíveis (ring-2)
- Cores nunca são a única forma de comunicação (usamos ícones também)

**Por quê?** Inclusão não é opcional. É um valor core do Ouvify.

---

## 🎨 PALETA DE CORES

### **Tokens Semânticos (Uso Recomendado)**

Nossa paleta usa **tokens semânticos** - nomes que descrevem a função, não a cor. Isso permite temas dinâmicos (white-label) e manutenção simples.

#### **Cores de Ação**

| Token                  | Cor (Modo Claro) | Hex                                                                          | Quando Usar                    |
| ---------------------- | ---------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| `--primary`            | Blue 600         | ![#3B82F6](https://via.placeholder.com/40x20/3B82F6/FFFFFF?text=+) `#3B82F6` | Botões principais, links, CTAs |
| `--primary-hover`      | Blue 700         | ![#2563EB](https://via.placeholder.com/40x20/2563EB/FFFFFF?text=+) `#2563EB` | Hover state do primary         |
| `--primary-foreground` | White            | ![#FFFFFF](https://via.placeholder.com/40x20/FFFFFF/000000?text=+) `#FFFFFF` | Texto em botões primary        |

**Exemplo:**

```tsx
<Button variant="default">Enviar Feedback</Button>
// Renderiza: bg-primary hover:bg-primary-hover text-primary-foreground
```

---

#### **Cores de Feedback**

| Token       | Cor       | Hex                                                                          | Quando Usar                             |
| ----------- | --------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| `--success` | Green 600 | ![#16A34A](https://via.placeholder.com/40x20/16A34A/FFFFFF?text=+) `#16A34A` | Sucesso, confirmações, badges positivos |
| `--warning` | Amber 500 | ![#F59E0B](https://via.placeholder.com/40x20/F59E0B/000000?text=+) `#F59E0B` | Alertas, atenção, estados pendentes     |
| `--error`   | Red 500   | ![#EF4444](https://via.placeholder.com/40x20/EF4444/FFFFFF?text=+) `#EF4444` | Erros, exclusões, validações falhas     |
| `--info`    | Blue 500  | ![#3B82F6](https://via.placeholder.com/40x20/3B82F6/FFFFFF?text=+) `#3B82F6` | Informações, dicas, tooltips            |

**Exemplo:**

```tsx
<Badge variant="success">Ativo</Badge>
<Alert variant="error">Erro ao salvar</Alert>
```

---

#### **Cores de Texto**

| Token                   | Contraste           | Quando Usar                                            |
| ----------------------- | ------------------- | ------------------------------------------------------ |
| `text-foreground`       | **21:1** (WCAG AAA) | ✅ Valores de KPIs, títulos principais, dados críticos |
| `text-muted-foreground` | **7:1** (WCAG AA)   | ✅ Labels secundários, descrições, meta info           |
| `text-text-tertiary`    | **5:1** (WCAG AA)   | ✅ Placeholders, hints, timestamps                     |

**⚠️ NUNCA USE:**

- ❌ `text-gray-600` ou `text-slate-500` (hardcoded)
- ❌ `text-secondary-600` para textos críticos (contraste insuficiente)

**✅ USE SEMPRE:**

- ✅ `text-foreground` para conteúdo importante (21:1)
- ✅ `text-muted-foreground` para labels (7:1)

---

#### **Cores de Fundo**

| Token           | Quando Usar                 |
| --------------- | --------------------------- |
| `bg-background` | Fundo principal de páginas  |
| `bg-muted`      | Cards, seções diferenciadas |
| `bg-card`       | Cards, modais, dropdowns    |
| `bg-accent`     | Hover em itens de lista     |

---

### **Modo Escuro**

O Ouvify suporta **Dark Mode** nativo. Todos os tokens semânticos se adaptam automaticamente.

**Como funciona:**

```css
:root {
  --background: 0 0% 100%; /* Branco */
  --foreground: 222.2 84% 4.9%; /* Slate 950 */
}

.dark {
  --background: 222.2 84% 4.9%; /* Slate 950 */
  --foreground: 210 40% 98%; /* Slate 50 */
}
```

**Você não precisa fazer nada.** Use `bg-background` e `text-foreground` - o sistema cuida do resto.

---

## 🔤 TIPOGRAFIA

### **Fontes Oficiais**

O Ouvify usa **2 fontes** carregadas do Google Fonts:

#### **1. Inter** (Body Text & UI)

- **Uso:** Parágrafos, labels, botões, navegação
- **Pesos:** 400 (Normal), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Características:** Legível, profissional, otimizada para telas

#### **2. Poppins** (Headings)

- **Uso:** Títulos (H1-H6), destaques, hero sections
- **Pesos:** 500 (Medium), 600 (Semibold), 700 (Bold), 800 (ExtraBold)
- **Características:** Moderna, geométrica, impacto visual

---

### **Hierarquia Tipográfica**

| Elemento    | Fonte   | Peso | Tamanho                | Quando Usar                  |
| ----------- | ------- | ---- | ---------------------- | ---------------------------- |
| **H1**      | Poppins | 700  | `text-5xl md:text-6xl` | Hero sections, landing pages |
| **H2**      | Poppins | 700  | `text-4xl md:text-5xl` | Títulos de página            |
| **H3**      | Poppins | 700  | `text-3xl md:text-4xl` | Seções principais            |
| **H4**      | Poppins | 700  | `text-2xl md:text-3xl` | Subtítulos, cards grandes    |
| **H5**      | Poppins | 700  | `text-xl md:text-2xl`  | Labels de seção              |
| **H6**      | Poppins | 700  | `text-lg md:text-xl`   | Pequenos títulos             |
| **Body**    | Inter   | 400  | `text-base`            | Parágrafos, descrições       |
| **Button**  | Inter   | 500  | `text-sm`              | Botões, links                |
| **Label**   | Inter   | 500  | `text-sm`              | Labels de formulário         |
| **Caption** | Inter   | 400  | `text-xs`              | Meta info, timestamps        |

---

### **Regras de Uso**

#### ✅ **FAÇA:**

```tsx
// H1 com Poppins (automático via globals.css)
<h1 className="text-5xl font-bold text-foreground">
  Bem-vindo ao Ouvify
</h1>

// Body com Inter (automático)
<p className="text-base text-muted-foreground">
  Gerencie feedbacks de clientes com facilidade.
</p>
```

#### ❌ **NÃO FAÇA:**

```tsx
// ❌ Usar font-mono em headings
<h1 className="font-mono">Título</h1>

// ❌ Usar pesos não definidos
<p className="font-thin">Texto</p>

// ❌ Misturar Poppins em body text
<p className="font-heading">Texto longo...</p>
```

---

### **Letter Spacing**

| Elemento         | Classe Tailwind  | Valor   |
| ---------------- | ---------------- | ------- |
| Headings (H1-H6) | `tracking-tight` | -0.02em |
| Body Text        | (default)        | 0       |
| Uppercase Text   | `tracking-wide`  | 0.05em  |

**Exemplo:**

```tsx
<h2 className="tracking-tight">Título com Espaçamento Apertado</h2>
```

---

## 🏷️ LOGO & IDENTIDADE VISUAL

### **Arquivo Oficial**

**Localização:** `/public/logo.png` (1.3MB, PNG com transparência)

- ✅ Formato: PNG com alpha channel
- ✅ Dimensões: Escalável (use `<Logo />` component)
- ✅ Fundo: Transparente

---

### **Componente `<Logo />`**

**Nunca use `<img src="/logo.png">` diretamente.** Use o componente oficial:

```tsx
import { Logo } from "@/components/brand/Logo";

// Tamanhos pré-configurados
<Logo size="sm" />   // 32×104px (Sidebar collapsed)
<Logo size="md" />   // 40×130px (Header, Sidebar)
<Logo size="lg" />   // 56×180px (Auth pages)
<Logo size="xl" />   // 80×260px (Landing hero)

// Com link
<Logo size="md" href="/dashboard" priority />

// White-label support
{theme?.logo ? (
  <img src={theme.logo} alt={theme.nome} />
) : (
  <Logo size="xl" />
)}
```

---

### **Componentes Pré-Configurados**

Se você está editando um layout específico, use estes atalhos:

```tsx
import { LogoHeader, LogoAuth, LogoSidebar } from "@/components/brand/Logo";

// Header público
<LogoHeader />

// Páginas de autenticação
<LogoAuth />

// Sidebar do dashboard
<LogoSidebar />
```

---

### **Regras de Uso**

#### ✅ **PERMITIDO:**

- ✅ Usar em headers, footers, auth pages
- ✅ Colocar em fundo branco ou escuro (PNG tem transparência)
- ✅ Redimensionar proporcionalmente com `<Logo size="..." />`

#### ❌ **NÃO PERMITIDO:**

- ❌ Esticar ou distorcer (sempre manter aspect ratio)
- ❌ Alterar cores (use o PNG original)
- ❌ Adicionar sombras ou efeitos (componente já cuida disso)
- ❌ Usar versões não-oficiais (SVG inexistentes, logos desatualizados)

---

### **Espaçamento Mínimo**

Mantenha **24px de margem** ao redor da logo em todos os lados:

```tsx
// ✅ Bom spacing
<div className="p-6">
  <Logo size="md" />
</div>

// ❌ Muito apertado
<div className="p-1">
  <Logo size="md" />
</div>
```

---

## 🎯 PRINCÍPIOS DE DESIGN

### **1. Hierarquia Visual**

**Regra:** Elementos mais importantes devem ser visualmente dominantes.

```tsx
// ✅ Hierarquia clara
<div>
  <h1 className="text-5xl font-bold text-foreground">Título Principal</h1>
  <p className="text-base text-muted-foreground mt-2">Descrição secundária</p>
</div>

// ❌ Hierarquia fraca
<div>
  <h1 className="text-lg">Título</h1>
  <p className="text-xl font-bold">Descrição</p>
</div>
```

---

### **2. Espaçamento Consistente**

**Regra:** Use a escala do Tailwind (múltiplos de 4px: 4, 8, 12, 16, 24, 32...).

```tsx
// ✅ Espaçamento correto
<div className="space-y-4">      {/* 16px entre itens */}
  <Card className="p-6">          {/* 24px padding interno */}
    <h3 className="mb-2">Título</h3>  {/* 8px abaixo do título */}
    <p>Conteúdo</p>
  </Card>
</div>

// ❌ Espaçamento arbitrário
<div style={{ marginTop: '13px' }}>
  <Card style={{ padding: '19px' }}>
    ...
  </Card>
</div>
```

---

### **3. Contraste Sempre**

**Regra:** Texto importante = `text-foreground` (21:1). Texto secundário = `text-muted-foreground` (7:1).

```tsx
// ✅ Contraste WCAG AAA
<div className="text-3xl font-bold text-foreground">
  R$ 12.450,00
</div>

// ❌ Contraste insuficiente
<div className="text-3xl font-bold text-gray-400">
  R$ 12.450,00
</div>
```

---

### **4. Estados Interativos**

**Regra:** Todo elemento clicável precisa de estados hover/focus/active.

```tsx
// ✅ Estados completos
<Button className="
  bg-primary hover:bg-primary-hover
  focus-visible:ring-2 focus-visible:ring-primary
  active:scale-95
  transition-all
">
  Clique Aqui
</Button>

// ❌ Sem feedback visual
<div onClick={...}>Clique Aqui</div>
```

---

### **5. Mobile-First**

**Regra:** Design para mobile (375px) primeiro, depois expanda para desktop.

```tsx
// ✅ Mobile-first
<div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 col mobile, 2 tablet, 4 desktop */}
</div>

// ❌ Desktop-only
<div className="grid gap-8 grid-cols-4">
  {/* Quebra em mobile */}
</div>
```

---

## 📐 GUIA DE USO VISUAL

### **Layout Padrão de Página**

```tsx
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
              <p className="text-muted-foreground">Conteúdo do card.</p>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageLayout>
  );
}
```

---

### **Formulário Padrão**

```tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

<form className="space-y-4">
  <div>
    <Label htmlFor="name" className="text-foreground">
      Nome Completo *
    </Label>
    <Input id="name" type="text" placeholder="João Silva" className="mt-1" />
  </div>

  <Button type="submit" className="w-full">
    Salvar
  </Button>
</form>;
```

---

### **Card de KPI (Dashboard)**

```tsx
<Card>
  <CardContent className="pt-6">
    <p className="text-sm font-medium text-muted-foreground">
      Total de Feedbacks
    </p>
    <div className="text-3xl font-bold text-foreground mt-2 mb-1">1,234</div>
    <p className="text-xs text-success flex items-center gap-1">
      <TrendingUp className="h-3 w-3" />
      +12% este mês
    </p>
  </CardContent>
</Card>
```

---

### **Empty State**

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

<EmptyState
  icon={FileText}
  title="Nenhum feedback recebido"
  description="Compartilhe o link público para começar a receber feedbacks."
  actionLabel="Ver Link Público"
  actionHref="/dashboard/settings/public-page"
/>;
```

---

## ✅ CHECKLIST DE APROVAÇÃO

Antes de finalizar qualquer design, verifique:

### **Cores**

- [ ] Nenhuma cor hardcoded (gray-600, blue-500, etc.)
- [ ] Textos críticos usam `text-foreground` (21:1)
- [ ] Labels secundários usam `text-muted-foreground`

### **Tipografia**

- [ ] Headings usam Poppins (automático com `<h1>-<h6>`)
- [ ] Body text usa Inter (default)
- [ ] Tamanhos respondem a breakpoints (`text-5xl md:text-6xl`)

### **Espaçamento**

- [ ] Usa escala Tailwind (múltiplos de 4: `p-4`, `m-8`, `gap-6`)
- [ ] Grids são responsivos (`gap-4 md:gap-6`)
- [ ] Padding de containers é consistente (`px-4 sm:px-6 lg:px-8`)

### **Acessibilidade**

- [ ] Contraste WCAG AA em todos os textos (mínimo 4.5:1)
- [ ] Focus rings visíveis (`focus-visible:ring-2`)
- [ ] Alt text em todas as imagens

### **Logo**

- [ ] Usa `<Logo />` component (nunca `<img src="/logo.png">`)
- [ ] Mantém spacing mínimo de 24px
- [ ] Não está distorcida

---

## 📚 REFERÊNCIAS

### **Documentação Técnica**

- [Design System (Developers)](./DESIGN_SYSTEM.md) - Guia técnico de implementação
- [Rebrand Fase 1](./REBRAND_VISUAL_FASE_1.md) - Fundação (Cores & Tipografia)
- [Rebrand Fase 2](./REBRAND_VISUAL_FASE_2.md) - Logo & Layouts
- [Rebrand Fase 3](./REBRAND_VISUAL_FASE_3.md) - UX & Contraste
- [Resumo Executivo](./REBRAND_RESUMO_EXECUTIVO.md) - Visão geral

### **Arquivos de Referência**

- [globals.css](../apps/frontend/app/globals.css) - Variáveis CSS e estilos base
- [Logo Component](../apps/frontend/components/brand/Logo.tsx) - Implementação oficial
- [Design System Showcase](http://localhost:3000/design-system) - Preview interativo

### **Ferramentas Úteis**

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Validar contraste
- [Coolors](https://coolors.co/) - Explorar paletas
- [Google Fonts](https://fonts.google.com/) - Inter & Poppins

---

## 🤝 SUPORTE

**Dúvidas sobre o Manual de Marca?**

- 📧 Email: design@ouvify.com
- 💬 Slack: #design-system
- 📝 GitHub Issues: Use label `design`

---

**Manual de Marca Ouvify - v2.0**  
Última atualização: 06 de Fevereiro, 2026  
© 2026 Ouvify. Todos os direitos reservados.
