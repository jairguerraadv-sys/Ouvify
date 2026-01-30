# 🎨 OUVIFY BRAND GUIDELINES

**Versão:** 1.0  
**Data:** 30 de Janeiro de 2026  

---

## 📌 VISÃO GERAL DA MARCA

### Nome
- **Nome Completo:** Ouvify
- **Descrição:** Canal de Ética Profissional - Plataforma SaaS para gestão de feedbacks e denúncias
- **Tagline:** "Seu Canal de Ética Profissional"

### Logo

O logo Ouvify está localizado em `apps/frontend/public/logo.png`.

#### Uso do Logo
- ✅ Usar sempre o arquivo oficial `logo.png`
- ✅ Manter proporções originais
- ✅ Fundo branco ou claro
- ❌ Não distorcer
- ❌ Não adicionar efeitos
- ❌ Não alterar cores

#### Tamanhos Recomendados

| Contexto | Altura | Componente |
|----------|--------|------------|
| Header (Marketing) | 40px | `<LogoHeader />` |
| Sidebar (Dashboard) | 40px | `<LogoSidebar />` |
| Autenticação (Login/Cadastro) | 48px | `<LogoAuth />` |
| Páginas de Erro | 64px | `<LogoError />` |
| Footer | 40px | `<LogoFooter />` |
| Mobile | 32px | `<LogoMobile />` |

---

## 🎨 PALETA DE CORES

### Cores Primárias

#### Primary (Azul Profissional)
```css
--primary-50: #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;  /* Principal */
--primary-600: #2563EB;  /* Hover */
--primary-700: #1D4ED8;
--primary-800: #1E40AF;
--primary-900: #1E3A8A;
```

#### Secondary (Roxo Criativo)
```css
--secondary-50: #FAF5FF;
--secondary-100: #F3E8FF;
--secondary-200: #E9D5FF;
--secondary-300: #D8B4FE;
--secondary-400: #C084FC;
--secondary-500: #A855F7;  /* Principal */
--secondary-600: #9333EA;  /* Hover */
--secondary-700: #7E22CE;
--secondary-800: #6B21A8;
--secondary-900: #581C87;
```

### Cores Semânticas

#### Success (Verde)
```css
--success-500: #22C55E;
--success-600: #16A34A;
```

#### Warning (Amarelo)
```css
--warning-500: #F59E0B;
--warning-600: #D97706;
```

#### Error (Vermelho)
```css
--error-500: #EF4444;
--error-600: #DC2626;
```

#### Info (Ciano)
```css
--info-500: #06B6D4;
--info-600: #0891B2;
```

### Cores Neutras

```css
--gray-50: #F9FAFB;   /* Backgrounds sutis */
--gray-100: #F3F4F6;  /* Inputs */
--gray-200: #E5E7EB;  /* Borders */
--gray-300: #D1D5DB;  /* Borders hover */
--gray-400: #9CA3AF;  /* Placeholders */
--gray-500: #6B7280;  /* Muted text */
--gray-600: #4B5563;  /* Secondary text */
--gray-700: #374151;  /* Body text */
--gray-800: #1F2937;  /* Headings */
--gray-900: #111827;  /* Main text */
```

### Uso de Cores

| Elemento | Cor | Classe Tailwind |
|----------|-----|-----------------|
| Texto principal | Gray-900 | `text-gray-900` |
| Texto secundário | Gray-600 | `text-gray-600` |
| Texto muted | Gray-500 | `text-muted-foreground` |
| Links | Primary-600 | `text-primary-600` |
| CTAs primários | Primary-500 | `bg-primary-500` |
| CTAs secundários | Secondary-500 | `bg-secondary-500` |
| Bordas | Gray-200 | `border-gray-200` |
| Backgrounds | White/Gray-50 | `bg-white` / `bg-gray-50` |

---

## 📝 TIPOGRAFIA

### Fontes

| Tipo | Fonte | Fallback |
|------|-------|----------|
| Body | Inter | system-ui, sans-serif |
| Headings | Poppins | Inter, system-ui, sans-serif |
| Monospace | JetBrains Mono | Fira Code, monospace |

### Escala de Tamanhos

| Token | Size | Line Height | Uso |
|-------|------|-------------|-----|
| xs | 12px | 16px | Labels pequenos |
| sm | 14px | 20px | Texto pequeno, badges |
| base | 16px | 24px | Corpo de texto |
| lg | 18px | 28px | Texto maior |
| xl | 20px | 28px | Títulos pequenos |
| 2xl | 24px | 32px | H4 |
| 3xl | 30px | 36px | H3 |
| 4xl | 36px | 40px | H2 |
| 5xl | 48px | 1 | H1 |
| 6xl | 60px | 1 | Hero |

### Pesos

| Peso | Uso |
|------|-----|
| 400 (Regular) | Corpo de texto |
| 500 (Medium) | Labels, buttons |
| 600 (Semibold) | Subtítulos, ênfase |
| 700 (Bold) | Títulos |

### Componentes de Typography

```tsx
import { H1, H2, H3, H4, H5, H6, Paragraph, Lead } from '@/components/ui/typography';

// Títulos
<H1>Título Principal</H1>
<H2>Seção</H2>
<H3>Subseção</H3>

// Parágrafos
<Paragraph>Texto normal</Paragraph>
<Lead>Texto de destaque para introduções</Lead>
```

---

## 📐 ESPAÇAMENTO

### Escala Base

Baseado em múltiplos de 4px:

| Token | Valor | Uso |
|-------|-------|-----|
| 1 | 4px | Micro gaps |
| 2 | 8px | Small gaps |
| 3 | 12px | Medium-small gaps |
| 4 | 16px | Default gaps |
| 5 | 20px | - |
| 6 | 24px | Section padding |
| 8 | 32px | Large gaps |
| 10 | 40px | - |
| 12 | 48px | Section margins |
| 16 | 64px | Large margins |

### Container

```css
max-width: 1400px;
padding: 2rem; /* 32px */
```

### Breakpoints

| Nome | Valor | Uso |
|------|-------|-----|
| sm | 640px | Mobile landscape |
| md | 768px | Tablets |
| lg | 1024px | Desktop small |
| xl | 1280px | Desktop |
| 2xl | 1536px | Desktop large |

---

## 🔲 BORDER RADIUS

| Token | Valor | Uso |
|-------|-------|-----|
| none | 0 | Sharp corners |
| sm | 4px | Badges, chips |
| DEFAULT/md | 6px | Buttons, inputs |
| lg | 8px | Cards |
| xl | 12px | Modals, large cards |
| 2xl | 16px | - |
| full | 9999px | Pills, avatars |

---

## 🌑 SOMBRAS

| Token | Valor | Uso |
|-------|-------|-----|
| subtle | 0 1px 2px rgba(0,0,0,0.05) | Hover states |
| sm | 0 1px 2px rgba(0,0,0,0.05) | Buttons |
| DEFAULT | 0 1px 3px rgba(0,0,0,0.1) | Cards |
| md | 0 4px 6px rgba(0,0,0,0.1) | Dropdowns |
| lg | 0 10px 15px rgba(0,0,0,0.1) | Modals |
| xl | 0 20px 25px rgba(0,0,0,0.1) | Popovers |

---

## 🔄 ESTADOS

### Interativos

| Estado | Transformação |
|--------|---------------|
| Hover | `bg-*-600` (1 shade darker) |
| Active | `scale-[0.98]` |
| Focus | `ring-2 ring-primary-500 ring-offset-2` |
| Disabled | `opacity-50 cursor-not-allowed` |

### Feedback

| Estado | Cor | Uso |
|--------|-----|-----|
| Success | Green-500 | Confirmações |
| Warning | Yellow-500 | Alertas |
| Error | Red-500 | Erros |
| Info | Cyan-500 | Informações |

---

## ✅ DO's & DON'Ts

### ✅ DO's
- Use componentes padronizados do design system
- Siga a escala de cores e tipografia
- Mantenha contraste mínimo AA (4.5:1)
- Use tokens em vez de valores hardcoded
- Teste em diferentes tamanhos de tela

### ❌ DON'Ts
- Não use cores fora da paleta oficial
- Não crie variantes de componentes sem necessidade
- Não use estilos inline para cores/spacing
- Não ignore estados de acessibilidade
- Não omita focus states

---

## 📂 RECURSOS

### Arquivos de Referência
- `tailwind.config.ts` - Configuração de tokens
- `globals.css` - CSS variables
- `lib/design-tokens.ts` - Tokens em TypeScript
- `components/ui/` - Componentes base

### Importações

```tsx
// Cores e tokens
import { colors, spacing, typography } from '@/lib/design-tokens';

// Componentes
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// etc...
```

---

*Ouvify Brand Guidelines v1.0 - Janeiro 2026*
