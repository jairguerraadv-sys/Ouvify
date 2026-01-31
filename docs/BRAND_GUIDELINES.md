# Ouvify - Diretrizes de Marca (Brand Guidelines)

Este documento estabelece as diretrizes de uso da marca Ouvify, incluindo logotipo, cores, tipografia e elementos visuais.

## 🎨 Identidade Visual

### Nome da Marca
- **Nome**: Ouvify
- **Tagline**: "Transformando feedbacks em resultados"
- **Pronúncia**: /o͞o-vi-fī/

### Valores da Marca
- **Confiança**: Segurança e privacidade dos dados
- **Simplicidade**: Interface intuitiva e fácil de usar
- **Inovação**: Tecnologia de ponta para gestão de feedbacks
- **Humanização**: Conexão real entre empresas e clientes

---

## 📐 Logotipo

### Variantes Disponíveis

| Variante | Uso Recomendado | Arquivo |
|----------|-----------------|---------|
| **Full** | Headers, materiais impressos, apresentações | `logo-full.png` |
| **Icon** | Favicon, app icon, espaços reduzidos | `logo-icon.png` |
| **Text** | Quando o ícone já está visível | `logo-text.png` |

### Versões de Cor

| Versão | Uso | Background Recomendado |
|--------|-----|------------------------|
| **Default** | Uso geral | Fundos claros (#FFFFFF, #F8FAFC) |
| **White** | Fundos escuros | Fundos escuros (#1E293B, #0F172A) |
| **Gradient** | Destaque, hero sections | Fundos neutros |

### Tamanhos Padrão

```tsx
import { Logo } from '@/components/brand';

// Tamanhos disponíveis
<Logo size="xs" />   // 24px - Badges, tooltips
<Logo size="sm" />   // 32px - Inline, tags
<Logo size="md" />   // 48px - Default, navegação
<Logo size="lg" />   // 64px - Headers, cards
<Logo size="xl" />   // 96px - Hero sections
<Logo size="2xl" />  // 128px - Páginas de destaque
```

### Componentes Pré-configurados

```tsx
import { 
  LogoHeader,        // Header principal
  LogoHeaderMobile,  // Header mobile
  LogoFooter,        // Rodapé
  LogoAuth,          // Páginas de login/cadastro
  LogoSidebar,       // Sidebar expandida
  LogoSidebarCollapsed, // Sidebar colapsada
  LogoError,         // Páginas de erro
  LogoHero,          // Hero sections
  LogoWhite,         // Versão branca
  PoweredByOuvify,   // Selo "Powered by"
} from '@/components/brand';
```

### Área de Proteção

O logotipo deve ter uma área de proteção mínima equivalente a 50% da altura do logo em todos os lados.

```
     ┌─────────────────────────────────┐
     │                                 │
     │    ┌─────────────────────┐      │
     │    │                     │      │
     │    │      OUVIFY         │      │
     │    │                     │      │
     │    └─────────────────────┘      │
     │                                 │
     └─────────────────────────────────┘
           ↑ Área de proteção (50% altura)
```

### Uso Incorreto

❌ **NÃO fazer:**
- Distorcer ou esticar o logotipo
- Alterar as cores do logotipo
- Adicionar efeitos como sombras ou bordas
- Usar versão colorida em fundos escuros
- Usar versão branca em fundos claros
- Rotacionar o logotipo
- Aplicar opacidade menor que 100%

---

## 🎨 Paleta de Cores

### Cores Primárias

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Primary** | `#3B82F6` | 59, 130, 246 | CTAs, links, elementos interativos |
| **Primary Dark** | `#2563EB` | 37, 99, 235 | Hover states, ênfase |
| **Primary Light** | `#60A5FA` | 96, 165, 250 | Backgrounds sutis, badges |

### Cores Secundárias

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Secondary** | `#A855F7` | 168, 85, 247 | Destaques, elementos premium |
| **Secondary Dark** | `#9333EA` | 147, 51, 234 | Hover states |
| **Secondary Light** | `#C084FC` | 192, 132, 252 | Backgrounds |

### Cores Semânticas

| Cor | Hex | Uso |
|-----|-----|-----|
| **Success** | `#22C55E` | Confirmações, status positivo |
| **Warning** | `#F59E0B` | Alertas, atenção |
| **Error** | `#EF4444` | Erros, ações destrutivas |
| **Info** | `#3B82F6` | Informações, dicas |

### Cores Neutras

| Cor | Hex | Uso |
|-----|-----|-----|
| **Background** | `#FFFFFF` | Fundo principal (light mode) |
| **Surface** | `#F8FAFC` | Cards, modais |
| **Border** | `#E2E8F0` | Bordas, divisores |
| **Text Primary** | `#0F172A` | Texto principal |
| **Text Secondary** | `#64748B` | Texto secundário |
| **Text Muted** | `#94A3B8` | Texto desabilitado |

### Gradiente da Marca

```css
/* Gradiente principal */
background: linear-gradient(135deg, #3B82F6 0%, #A855F7 100%);

/* Gradiente suave para backgrounds */
background: linear-gradient(180deg, #F0F9FF 0%, #FAF5FF 100%);
```

---

## 📝 Tipografia

### Fontes

| Fonte | Uso | Fallback |
|-------|-----|----------|
| **Poppins** | Títulos, headings | `system-ui, sans-serif` |
| **Inter** | Body text, UI | `system-ui, sans-serif` |

### Hierarquia de Títulos

```css
/* Display - Hero sections */
.display {
  font-family: 'Poppins', sans-serif;
  font-size: 3.75rem; /* 60px */
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
}

/* H1 - Títulos de página */
h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
  line-height: 1.2;
}

/* H2 - Seções principais */
h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.875rem; /* 30px */
  font-weight: 600;
  line-height: 1.3;
}

/* H3 - Subseções */
h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  line-height: 1.4;
}

/* H4 - Cards, grupos */
h4 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  line-height: 1.4;
}
```

### Texto do Corpo

```css
/* Body large */
.body-lg {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem; /* 18px */
  line-height: 1.7;
}

/* Body default */
.body {
  font-family: 'Inter', sans-serif;
  font-size: 1rem; /* 16px */
  line-height: 1.6;
}

/* Body small */
.body-sm {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem; /* 14px */
  line-height: 1.5;
}

/* Caption */
.caption {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem; /* 12px */
  line-height: 1.4;
}
```

---

## 📐 Espaçamento

Baseado em múltiplos de 8px:

| Token | Valor | Uso |
|-------|-------|-----|
| `space-0` | 0 | Reset |
| `space-1` | 4px | Gaps mínimos |
| `space-2` | 8px | Padding interno compacto |
| `space-3` | 12px | Espaçamento entre itens relacionados |
| `space-4` | 16px | Padding padrão |
| `space-5` | 20px | - |
| `space-6` | 24px | Espaçamento entre seções |
| `space-8` | 32px | Margens de cards |
| `space-10` | 40px | - |
| `space-12` | 48px | Separação de seções |
| `space-16` | 64px | Margens de página |

---

## 🖼️ Iconografia

### Biblioteca Padrão
- **Lucide React** - Ícones de interface
- Tamanho padrão: 20px
- Stroke width: 2px

### Tamanhos de Ícones

| Size | Valor | Uso |
|------|-------|-----|
| `xs` | 14px | Badges, tags |
| `sm` | 16px | Botões pequenos, inline |
| `md` | 20px | Padrão, botões |
| `lg` | 24px | Cards, destaque |
| `xl` | 32px | Empty states |
| `2xl` | 48px | Hero sections |

---

## 🔲 Bordas e Sombras

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `rounded-none` | 0 | - |
| `rounded-sm` | 4px | Tags, badges |
| `rounded` | 8px | Inputs, botões |
| `rounded-md` | 12px | Cards |
| `rounded-lg` | 16px | Modais |
| `rounded-xl` | 24px | Cards destacados |
| `rounded-full` | 9999px | Avatares, pills |

### Sombras

```css
/* Sombra sutil - hover states */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* Sombra padrão - cards */
.shadow {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 
              0 1px 2px -1px rgb(0 0 0 / 0.1);
}

/* Sombra média - dropdowns */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 
              0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* Sombra grande - modais */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 
              0 4px 6px -4px rgb(0 0 0 / 0.1);
}

/* Sombra extra - tooltips flutuantes */
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 
              0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

---

## ✅ Checklist de Conformidade

Ao criar novos materiais ou componentes, verifique:

- [ ] Logo está usando variante correta para o contexto
- [ ] Área de proteção do logo está respeitada
- [ ] Cores estão dentro da paleta aprovada
- [ ] Contraste de texto atende WCAG AA (4.5:1)
- [ ] Tipografia segue a hierarquia definida
- [ ] Espaçamento usa múltiplos de 8px
- [ ] Ícones são da biblioteca Lucide
- [ ] Bordas e sombras seguem os tokens

---

## 📦 Recursos

### Download de Assets
- `/public/logo/logo-full.png` - Logo completo
- `/public/logo/logo-icon.png` - Ícone
- `/public/logo/logo-text.png` - Texto

### Componentes React
```tsx
import { Logo, LogoHeader, PoweredByOuvify } from '@/components/brand';
import { colors, typography, spacing } from '@/styles/design-tokens';
```

### Documentação Relacionada
- [Design System](./DESIGN_SYSTEM.md)
- [Componentes UI](../apps/frontend/components/ui/README.md)

---

*Última atualização: Janeiro 2026*
*Versão: 1.0.0*
