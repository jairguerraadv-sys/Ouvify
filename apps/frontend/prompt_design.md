# 🎨 PROMPT DE DESIGN SYSTEM E UI/UX - OUVIFY

````markdown
# MISSÃO: CRIAR IDENTIDADE VISUAL COMPLETA E DESIGN SYSTEM DO OUVIFY

Você é o designer de produto e desenvolvedor frontend responsável por criar uma identidade visual profissional, consistente e acessível para o Ouvify (plataforma SaaS White Label de gestão de feedbacks).

**CONTEXTO:**

- Produto: Ouvify - Sistema de feedback corporativo
- Público: Empresas B2B e seus usuários finais
- Tecnologia: Next.js 15 + Tailwind CSS + shadcn/ui
- Tom da marca: Profissional, confiável, moderno, acessível

**OBJETIVOS:**

1. Definir paleta de cores profissional e acessível
2. Estabelecer tipografia clara e hierárquica
3. Criar design system reutilizável
4. Padronizar todas as páginas
5. Otimizar logo e seu posicionamento
6. Melhorar UI/UX em todos os fluxos
7. Garantir acessibilidade (WCAG AA)
8. Eliminar duplicações e inconsistências de CSS

---

## 🎨 FASE 1: DEFINIÇÃO DA IDENTIDADE VISUAL

### 1.1 Paleta de Cores Principal

**Criar arquivo:** `apps/frontend/styles/design-tokens.ts`

```typescript
/**
 * Design Tokens - Ouvify
 * Sistema de cores, tipografia e espaçamentos da marca
 */

export const colors = {
  // Cores Primárias (Identidade da marca)
  primary: {
    50: "#f0f9ff", // Muito claro - backgrounds sutis
    100: "#e0f2fe", // Claro - hover states
    200: "#bae6fd", // Claro médio
    300: "#7dd3fc", // Médio
    400: "#38bdf8", // Médio escuro
    500: "#0ea5e9", // Base - cor principal da marca
    600: "#0284c7", // Escuro - hover em botões
    700: "#0369a1", // Mais escuro
    800: "#075985", // Muito escuro
    900: "#0c4a6e", // Quase preto
    DEFAULT: "#0ea5e9",
  },

  // Cores Secundárias (Complementares)
  secondary: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7", // Base
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
    DEFAULT: "#a855f7",
  },

  // Cores de Feedback (Status e alertas)
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e", // Base - verde sucesso
    600: "#16a34a",
    700: "#15803d",
    DEFAULT: "#22c55e",
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b", // Base - amarelo/laranja aviso
    600: "#d97706",
    700: "#b45309",
    DEFAULT: "#f59e0b",
  },

  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444", // Base - vermelho erro
    600: "#dc2626",
    700: "#b91c1c",
    DEFAULT: "#ef4444",
  },

  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6", // Base - azul informação
    600: "#2563eb",
    700: "#1d4ed8",
    DEFAULT: "#3b82f6",
  },

  // Cores Neutras (Textos, backgrounds, bordas)
  neutral: {
    0: "#ffffff", // Branco puro
    50: "#fafafa", // Quase branco - backgrounds
    100: "#f5f5f5", // Cinza muito claro
    200: "#e5e5e5", // Cinza claro - bordas sutis
    300: "#d4d4d4", // Cinza médio claro
    400: "#a3a3a3", // Cinza médio - texto desabilitado
    500: "#737373", // Cinza - texto secundário
    600: "#525252", // Cinza escuro - texto normal
    700: "#404040", // Muito escuro - texto importante
    800: "#262626", // Quase preto - headings
    900: "#171717", // Preto - texto principal
    950: "#0a0a0a", // Preto total
    DEFAULT: "#737373",
  },

  // Cores de Background
  background: {
    primary: "#ffffff", // Fundo principal (branco)
    secondary: "#fafafa", // Fundo secundário (cinza claríssimo)
    tertiary: "#f5f5f5", // Fundo terciário (cinza claro)
    inverse: "#171717", // Fundo escuro (para contraste)
  },

  // Cores de Texto (com contraste garantido)
  text: {
    primary: "#171717", // Texto principal (preto) - Contraste 16:1
    secondary: "#525252", // Texto secundário (cinza escuro) - Contraste 7:1
    tertiary: "#737373", // Texto terciário (cinza) - Contraste 4.5:1
    inverse: "#ffffff", // Texto em fundos escuros
    disabled: "#a3a3a3", // Texto desabilitado
    link: "#0ea5e9", // Links
    linkHover: "#0284c7", // Links hover
  },

  // Cores de Borda
  border: {
    light: "#e5e5e5", // Bordas sutis
    DEFAULT: "#d4d4d4", // Bordas padrão
    dark: "#a3a3a3", // Bordas escuras
    focus: "#0ea5e9", // Bordas de foco
  },
};

// Exportar para uso direto
export type ColorScale = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
```
````

**Validar contraste de cores:**

```typescript
// scripts/validate-color-contrast.ts

/**
 * Valida se as combinações de cores atendem WCAG AA
 * Contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande
 */

function calculateContrastRatio(color1: string, color2: string): number {
  // Implementar cálculo de contraste
  // https://www.w3.org/TR/WCAG20-TECHS/G18.html
}

const contrastTests = [
  { bg: colors.background.primary, fg: colors.text.primary, min: 7 },
  { bg: colors.background.primary, fg: colors.text.secondary, min: 4.5 },
  { bg: colors.primary, fg: "#ffffff", min: 4.5 },
  { bg: colors.error, fg: "#ffffff", min: 4.5 },
  // ... adicionar mais combinações críticas
];

contrastTests.forEach((test) => {
  const ratio = calculateContrastRatio(test.bg, test.fg);
  console.log(
    `${test.bg} × ${test.fg}: ${ratio.toFixed(2)}:1 ${ratio >= test.min ? "✅" : "❌"}`,
  );
});
```

---

### 1.2 Tipografia e Hierarquia

**Atualizar:** `apps/frontend/app/layout.tsx`

```typescript
import { Inter, Poppins } from 'next/font/google'

// Fonte principal (corpo de texto, UI)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
})

// Fonte de headings (títulos, destaques)
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  weight: ['500', '600', '700', '800'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

**Criar arquivo:** `apps/frontend/styles/typography.ts`

```typescript
/**
 * Sistema de Tipografia - Ouvify
 * Escalas, pesos e line-heights
 */

export const typography = {
  // Famílias de fonte
  fontFamily: {
    sans: "var(--font-inter), system-ui, -apple-system, sans-serif",
    heading: "var(--font-poppins), system-ui, -apple-system, sans-serif",
    mono: 'ui-monospace, Menlo, Monaco, "Cascadia Code", monospace',
  },

  // Escala de tamanhos (baseada em 16px = 1rem)
  fontSize: {
    // Textos pequenos
    xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
    sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px

    // Texto base
    base: ["1rem", { lineHeight: "1.5rem" }], // 16px

    // Textos maiores
    lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
    xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px

    // Headings
    "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px - H4
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px - H3
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px - H2
    "5xl": ["3rem", { lineHeight: "1" }], // 48px - H1
    "6xl": ["3.75rem", { lineHeight: "1" }], // 60px - Display
    "7xl": ["4.5rem", { lineHeight: "1" }], // 72px - Hero
  },

  // Pesos de fonte
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  // Line heights específicos
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },

  // Letter spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};

// Classes CSS utilitárias para headings
export const headingStyles = {
  h1: "font-heading text-5xl font-bold text-text-primary tracking-tight",
  h2: "font-heading text-4xl font-bold text-text-primary tracking-tight",
  h3: "font-heading text-3xl font-semibold text-text-primary",
  h4: "font-heading text-2xl font-semibold text-text-primary",
  h5: "font-heading text-xl font-semibold text-text-primary",
  h6: "font-heading text-lg font-semibold text-text-primary",
};

// Classes para textos
export const textStyles = {
  body: "font-sans text-base text-text-primary leading-normal",
  bodySecondary: "font-sans text-base text-text-secondary leading-normal",
  small: "font-sans text-sm text-text-secondary leading-snug",
  caption: "font-sans text-xs text-text-tertiary leading-tight",
  label: "font-sans text-sm font-medium text-text-primary leading-snug",
  link: "font-sans text-base text-text-link hover:text-text-linkHover underline-offset-4 hover:underline",
};
```

---

### 1.3 Espaçamento e Grid System

**Criar arquivo:** `apps/frontend/styles/spacing.ts`

```typescript
/**
 * Sistema de Espaçamento - Ouvify
 * Baseado em escala de 8px
 */

export const spacing = {
  // Escala base (8px = 0.5rem)
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px  ← Base
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
  40: "10rem", // 160px
  48: "12rem", // 192px
  56: "14rem", // 224px
  64: "16rem", // 256px
};

// Layout específicos
export const layout = {
  // Container max-widths
  maxWidth: {
    xs: "20rem", // 320px
    sm: "24rem", // 384px
    md: "28rem", // 448px
    lg: "32rem", // 512px
    xl: "36rem", // 576px
    "2xl": "42rem", // 672px
    "3xl": "48rem", // 768px
    "4xl": "56rem", // 896px
    "5xl": "64rem", // 1024px
    "6xl": "72rem", // 1152px
    "7xl": "80rem", // 1280px
    full: "100%",
    prose: "65ch", // Largura ideal para leitura
  },

  // Padding padrão de seções
  section: {
    sm: "py-8 px-4",
    md: "py-12 px-6",
    lg: "py-16 px-8",
    xl: "py-24 px-8",
  },

  // Padding de containers
  container: {
    sm: "px-4",
    md: "px-6",
    lg: "px-8",
    xl: "px-12",
  },
};
```

---

### 1.4 Configuração do Tailwind CSS

**Atualizar:** `apps/frontend/tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";
import { colors, typography, spacing } from "./styles/design-tokens";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    // Sobrescrever cores padrão do Tailwind
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: "#000000",
      ...colors,
    },

    // Sobrescrever fontes
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
    letterSpacing: typography.letterSpacing,

    // Espaçamento
    spacing: spacing,

    extend: {
      // Cores adicionais do shadcn/ui
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // Border radius
      borderRadius: {
        none: "0",
        sm: "0.25rem", // 4px
        DEFAULT: "0.5rem", // 8px
        md: "0.5rem", // 8px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        "3xl": "2rem", // 32px
        full: "9999px",
      },

      // Sombras
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT:
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        none: "none",
      },

      // Animações
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};

export default config;
```

---

### 1.5 CSS Global

**Atualizar:** `apps/frontend/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================
   VARIÁVEIS CSS GLOBAIS (para shadcn/ui)
   ============================================ */

@layer base {
  :root {
    /* Cores base (HSL para compatibilidade shadcn) */
    --background: 0 0% 100%;
    --foreground: 0 0% 9%;

    /* Card */
    --card: 0 0% 100%;
    --card-foreground: 0 0% 9%;

    /* Popover */
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 9%;

    /* Primary */
    --primary: 199 89% 48%;
    --primary-foreground: 0 0% 100%;

    /* Secondary */
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 9%;

    /* Muted */
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;

    /* Accent */
    --accent: 0 0% 96%;
    --accent-foreground: 0 0% 9%;

    /* Destructive */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;

    /* Border */
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 199 89% 48%;

    /* Chart colors */
    --chart-1: 199 89% 48%;
    --chart-2: 271 91% 65%;
    --chart-3: 142 76% 36%;
    --chart-4: 38 92% 50%;
    --chart-5: 0 84% 60%;

    /* Radius padrão */
    --radius: 0.5rem;
  }

  /* Dark mode (opcional - implementar depois) */
  .dark {
    --background: 0 0% 9%;
    --foreground: 0 0% 98%;

    --card: 0 0% 9%;
    --card-foreground: 0 0% 98%;

    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 98%;

    --primary: 199 89% 48%;
    --primary-foreground: 0 0% 100%;

    --secondary: 0 0% 15%;
    --secondary-foreground: 0 0% 98%;

    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 64%;

    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 98%;

    --destructive: 0 63% 31%;
    --destructive-foreground: 0 0% 98%;

    --border: 0 0% 15%;
    --input: 0 0% 15%;
    --ring: 199 89% 48%;
  }
}

/* ============================================
   RESET E BASE STYLES
   ============================================ */

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    @apply font-sans antialiased;
  }

  /* Headings */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-heading font-semibold text-text-primary;
  }

  h1 {
    @apply text-5xl tracking-tight;
  }
  h2 {
    @apply text-4xl tracking-tight;
  }
  h3 {
    @apply text-3xl;
  }
  h4 {
    @apply text-2xl;
  }
  h5 {
    @apply text-xl;
  }
  h6 {
    @apply text-lg;
  }

  /* Parágrafos */
  p {
    @apply text-base text-text-primary leading-normal;
  }

  /* Links */
  a {
    @apply text-text-link hover:text-text-linkHover;
    @apply underline-offset-4 hover:underline;
    @apply transition-colors duration-200;
  }

  /* Foco acessível */
  *:focus-visible {
    @apply outline-none ring-2 ring-border-focus ring-offset-2;
  }

  /* Remover spinner de input number */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }
}

/* ============================================
   COMPONENTES REUTILIZÁVEIS
   ============================================ */

@layer components {
  /* Container responsivo */
  .container {
    @apply mx-auto px-4 sm:px-6 lg:px-8;
    @apply max-w-7xl;
  }

  /* Card padrão */
  .card {
    @apply bg-white rounded-lg border border-border-light shadow-sm;
    @apply p-6;
  }

  /* Seção de página */
  .page-section {
    @apply py-8 sm:py-12 lg:py-16;
  }

  /* Page header */
  .page-header {
    @apply mb-8;
  }

  .page-title {
    @apply text-4xl font-bold text-text-primary mb-2;
  }

  .page-description {
    @apply text-lg text-text-secondary;
  }
}

/* ============================================
   UTILIDADES CUSTOMIZADAS
   ============================================ */

@layer utilities {
  /* Truncate com múltiplas linhas */
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Scroll suave */
  .scroll-smooth {
    scroll-behavior: smooth;
  }

  /* Hide scrollbar mas mantém funcionalidade */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Glassmorphism */
  .glass {
    @apply bg-white/80 backdrop-blur-md border border-border-light;
  }
}

/* ============================================
   ANIMAÇÕES E TRANSIÇÕES
   ============================================ */

@layer utilities {
  /* Transições suaves */
  .transition-base {
    @apply transition-all duration-200 ease-in-out;
  }

  /* Hover lift */
  .hover-lift {
    @apply transition-transform duration-200;
  }

  .hover-lift:hover {
    @apply -translate-y-1 shadow-lg;
  }
}

/* ============================================
   ACESSIBILIDADE
   ============================================ */

@layer utilities {
  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Skip to content link */
  .skip-to-content {
    @apply sr-only focus:not-sr-only;
    @apply focus:fixed focus:top-4 focus:left-4;
    @apply focus:z-50 focus:bg-primary focus:text-white;
    @apply focus:px-4 focus:py-2 focus:rounded-md;
  }
}

/* ============================================
   IMPRESSÃO
   ============================================ */

@media print {
  /* Ocultar elementos desnecessários */
  nav,
  aside,
  footer,
  button,
  .no-print {
    display: none !important;
  }

  /* Ajustar cores para impressão */
  * {
    color: #000 !important;
    background: #fff !important;
  }

  /* Quebras de página */
  h1,
  h2,
  h3 {
    page-break-after: avoid;
  }

  table,
  figure {
    page-break-inside: avoid;
  }
}
```

**Critérios de Aceite Fase 1:**

- [ ] Paleta de cores definida e validada (contraste WCAG AA)
- [ ] Tipografia configurada e hierárquica
- [ ] Espaçamento baseado em grid de 8px
- [ ] Tailwind configurado com tokens
- [ ] CSS global limpo e organizado
- [ ] Variáveis CSS documentadas
- [ ] Commit: "feat: define brand identity and design system"

---

## 🖼️ FASE 2: OTIMIZAÇÃO DA LOGO

### 2.1 Análise e Ajuste da Logo Atual

**Verificar:** `apps/frontend/public/logo.svg` (ou .png)

**Criar versões da logo:**

```bash
# Estrutura de arquivos de logo
public/
├── logo/
│   ├── logo-full.svg          # Logo completa (ícone + texto)
│   ├── logo-icon.svg          # Apenas ícone (para favicon)
│   ├── logo-text.svg          # Apenas texto
│   ├── logo-white.svg         # Versão branca (fundos escuros)
│   ├── logo-full.png          # Fallback PNG
│   └── logo-full@2x.png       # Retina
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png       # 180x180
└── android-chrome-512x512.png
```

**Criar componente de Logo:**

**Criar:** `apps/frontend/components/brand/Logo.tsx`

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type LogoVariant = 'full' | 'icon' | 'text'
export type LogoColor = 'default' | 'white'
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps {
  variant?: LogoVariant
  color?: LogoColor
  size?: LogoSize
  href?: string
  className?: string
  priority?: boolean
}

const sizeMap = {
  xs: { height: 24, width: 80 },   // Header mobile
  sm: { height: 32, width: 100 },  // Header desktop
  md: { height: 40, width: 130 },  // Default
  lg: { height: 56, width: 180 },  // Landing sections
  xl: { height: 80, width: 260 },  // Hero
}

export function Logo({
  variant = 'full',
  color = 'default',
  size = 'md',
  href = '/',
  className,
  priority = false,
}: LogoProps) {
  const dimensions = sizeMap[size]

  const logoSrc = `/logo/logo-${variant}${color === 'white' ? '-white' : ''}.svg`

  const logoElement = (
    <Image
      src={logoSrc}
      alt="Ouvify"
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      className={cn('object-contain', className)}
    />
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        aria-label="Ir para página inicial"
      >
        {logoElement}
      </Link>
    )
  }

  return logoElement
}

// Componente para texto "Powered by Ouvify"
export function PoweredByOuvify({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-text-tertiary', className)}>
      <span>Powered by</span>
      <Logo variant="text" size="xs" />
    </div>
  )
}
```

---

### 2.2 Posicionamento da Logo em Cada Contexto

**Criar guia de uso:**

**Criar:** `docs/BRAND_GUIDELINES.md`

````markdown
# Guia de Uso da Marca - Ouvify

## Logo

### Variantes

#### Logo Completa (logo-full.svg)

- **Uso:** Header principal, landing page, emails
- **Tamanhos:** sm (header), lg (landing), xl (hero)
- **Cores:** default (fundo claro), white (fundo escuro)

#### Logo Ícone (logo-icon.svg)

- **Uso:** Favicon, app icon, mobile header colapsado
- **Tamanhos:** xs (16px), sm (32px), md (48px)
- **Contexto:** Quando espaço horizontal é limitado

#### Logo Texto (logo-text.svg)

- **Uso:** Footer, "Powered by", assinaturas
- **Tamanhos:** xs (footer), sm (padrão)

### Posicionamento por Contexto

#### 1. Header Desktop

```tsx
<Logo variant="full" size="sm" href="/" />
```
````

- Posição: Canto superior esquerdo
- Alinhamento: Vertical center com navegação
- Espaçamento: 24px da borda esquerda

#### 2. Header Mobile

```tsx
<Logo variant="icon" size="xs" href="/" />
```

- Posição: Centro ou esquerda
- Reduzir para ícone em telas < 640px

#### 3. Hero Section

```tsx
<Logo variant="full" size="xl" />
```

- Posição: Centro, acima do título principal
- Espaçamento: 40px abaixo

#### 4. Footer

```tsx
<Logo variant="text" size="xs" />
```

ou

```tsx
<PoweredByOuvify />
```

#### 5. Dashboard (Internal)

```tsx
<Logo variant="icon" size="sm" />
```

- Posição: Sidebar top
- Expandir para full ao hover

#### 6. Emails Transacionais

```html
<img src="logo-full.png" width="180" height="56" alt="Ouvify" />
```

#### 7. Formulário Público de Feedback

- Logo do cliente (white label) - Prioridade
- "Powered by Ouvify" no footer (pequeno)

### Área de Proteção

- Manter espaço mínimo de 16px ao redor da logo
- Não colocar elementos visuais dentro dessa área

### Tamanho Mínimo

- Logo completa: 100px de largura
- Logo ícone: 24px
- Abaixo disso, usar apenas ícone

### O que NÃO fazer

❌ Esticar ou distorcer
❌ Mudar cores (usar variantes fornecidas)
❌ Adicionar sombras ou efeitos
❌ Inclinar ou rotacionar
❌ Colocar em fundos com baixo contraste

````

---

### 2.3 Implementar Logo em Todos os Layouts

**Atualizar:** `apps/frontend/components/layout/Header.tsx`

```typescript
import { Logo } from '@/components/brand/Logo'
import { MainNav } from './MainNav'
import { UserNav } from './UserNav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Logo variant="full" size="sm" priority />

          {/* Navegação desktop */}
          <MainNav className="hidden md:flex" />
        </div>

        {/* Ações do usuário */}
        <UserNav />
      </div>
    </header>
  )
}
````

**Atualizar:** `apps/frontend/components/layout/Sidebar.tsx`

```typescript
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      "border-r border-border-light bg-background",
      collapsed ? "w-16" : "w-64",
      "transition-all duration-200"
    )}>
      {/* Logo no topo */}
      <div className="flex h-16 items-center justify-center border-b border-border-light">
        {collapsed ? (
          <Logo variant="icon" size="sm" />
        ) : (
          <Logo variant="full" size="sm" />
        )}
      </div>

      {/* Navegação */}
      <nav className="p-4">
        {/* Menu items */}
      </nav>
    </aside>
  )
}
```

**Atualizar:** `apps/frontend/components/layout/Footer.tsx`

```typescript
import { PoweredByOuvify } from '@/components/brand/Logo'

export function Footer() {
  return (
    <footer className="border-t border-border-light bg-background-secondary">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Coluna 1: Sobre */}
          <div>
            <Logo variant="text" size="sm" className="mb-4" />
            <p className="text-sm text-text-secondary">
              Plataforma completa de gestão de feedbacks corporativos.
            </p>
          </div>

          {/* Coluna 2: Links */}
          {/* ... */}
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border-light flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-tertiary">
            © {new Date().getFullYear()} Ouvify. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="text-sm text-text-tertiary hover:text-text-primary">
              Privacidade
            </Link>
            <Link href="/termos" className="text-sm text-text-tertiary hover:text-text-primary">
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

**Critérios de Aceite Fase 2:**

- [ ] Logo em SVG otimizado
- [ ] Todas as variantes criadas (full, icon, text, white)
- [ ] Componente Logo reutilizável
- [ ] Favicon e app icons gerados
- [ ] Posicionamento consistente em todos os layouts
- [ ] Guia de marca documentado
- [ ] Commit: "feat: optimize and standardize logo usage"

---

## 🎯 FASE 3: PADRONIZAÇÃO DE PÁGINAS E COMPONENTES

### 3.1 Auditoria de Inconsistências

**Executar script de análise:**

```typescript
// scripts/audit-styles.ts

/**
 * Detecta inconsistências de estilo no código
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

interface StyleIssue {
  file: string;
  line: number;
  type:
    | "inline-style"
    | "duplicate-class"
    | "hardcoded-color"
    | "deprecated-class";
  description: string;
}

async function auditStyles() {
  const issues: StyleIssue[] = [];

  // Buscar arquivos TSX
  const files = await glob("app/**/*.{ts,tsx}", {
    ignore: ["node_modules/**", ".next/**"],
  });

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      // 1. Detectar inline styles
      if (line.includes("style={{")) {
        issues.push({
          file,
          line: index + 1,
          type: "inline-style",
          description: "Evitar inline styles, usar classes Tailwind",
        });
      }

      // 2. Detectar cores hardcoded
      const colorRegex = /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/;
      if (colorRegex.test(line) && !line.includes("//")) {
        issues.push({
          file,
          line: index + 1,
          type: "hardcoded-color",
          description: "Usar tokens de cores do design system",
        });
      }

      // 3. Detectar classes deprecated
      const deprecatedClasses = ["bg-gray-", "text-gray-", "border-gray-"];

      deprecatedClasses.forEach((deprecated) => {
        if (line.includes(deprecated)) {
          issues.push({
            file,
            line: index + 1,
            type: "deprecated-class",
            description: `Substituir "${deprecated}" por "bg-neutral-" ou tokens do design system`,
          });
        }
      });
    });
  }

  // Relatório
  console.log(`\n🔍 Encontrados ${issues.length} problemas de estilo:\n`);

  const grouped = issues.reduce(
    (acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = [];
      acc[issue.type].push(issue);
      return acc;
    },
    {} as Record<string, StyleIssue[]>,
  );

  Object.entries(grouped).forEach(([type, items]) => {
    console.log(`\n### ${type.toUpperCase()} (${items.length})`);
    items.forEach((item) => {
      console.log(`  ${item.file}:${item.line} - ${item.description}`);
    });
  });

  // Salvar relatório
  fs.writeFileSync("style-audit-report.json", JSON.stringify(issues, null, 2));

  console.log(`\n✅ Relatório salvo em style-audit-report.json`);
}

auditStyles();
```

**Executar:**

```bash
npx ts-node scripts/audit-styles.ts
```

---

### 3.2 Criar Componentes Padronizados

**Criar:** `apps/frontend/components/ui/PageLayout.tsx`

```typescript
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background-secondary', className)}>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('bg-white border-b border-border-light', className)}>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-lg text-text-secondary">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PageContentProps {
  children: ReactNode
  className?: string
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn('container py-8', className)}>
      {children}
    </div>
  )
}
```

**Usar em páginas:**

```typescript
// app/dashboard/feedbacks/page.tsx

import { PageLayout, PageHeader, PageContent } from '@/components/ui/PageLayout'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function FeedbacksPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Feedbacks"
        description="Gerencie todos os feedbacks recebidos"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Feedback
          </Button>
        }
      />

      <PageContent>
        {/* Conteúdo da página */}
      </PageContent>
    </PageLayout>
  )
}
```

---

**Criar:** `apps/frontend/components/ui/Card.tsx`

```typescript
import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  variant?: 'default' | 'bordered' | 'elevated'
}

export function Card({
  children,
  className,
  variant = 'default',
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-white',
        {
          'border border-border-light': variant === 'default' || variant === 'bordered',
          'shadow-sm': variant === 'default',
          'shadow-lg': variant === 'elevated',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-border-light', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: CardHeaderProps) {
  return (
    <h3 className={cn('text-xl font-semibold text-text-primary', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }: CardHeaderProps) {
  return (
    <p className={cn('text-sm text-text-secondary mt-1', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-border-light bg-background-secondary', className)}>
      {children}
    </div>
  )
}
```

---

**Criar:** `apps/frontend/components/ui/EmptyState.tsx`

```typescript
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-4',
      className
    )}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
        <Icon className="w-8 h-8 text-primary-500" />
      </div>

      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {title}
      </h3>

      <p className="text-sm text-text-secondary max-w-md mb-6">
        {description}
      </p>

      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

---

**Criar:** `apps/frontend/components/ui/StatusBadge.tsx`

```typescript
import { cn } from '@/lib/utils'

type Status = 'novo' | 'em_analise' | 'respondido' | 'fechado' | 'resolvido' | 'pendente'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  novo: {
    label: 'Novo',
    className: 'bg-info-50 text-info-700 border-info-200',
  },
  em_analise: {
    label: 'Em Análise',
    className: 'bg-warning-50 text-warning-700 border-warning-200',
  },
  respondido: {
    label: 'Respondido',
    className: 'bg-secondary-50 text-secondary-700 border-secondary-200',
  },
  fechado: {
    label: 'Fechado',
    className: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  },
  resolvido: {
    label: 'Resolvido',
    className: 'bg-success-50 text-success-700 border-success-200',
  },
  pendente: {
    label: 'Pendente',
    className: 'bg-error-50 text-error-700 border-error-200',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.novo

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
```

**Critérios de Aceite Fase 3:**

- [ ] Script de auditoria executado
- [ ] Todas as inconsistências documentadas
- [ ] Componentes padronizados criados (PageLayout, Card, EmptyState, StatusBadge)
- [ ] Pelo menos 5 páginas migradas para novos componentes
- [ ] Commit: "refactor: standardize page layouts and components"

---

## 🚀 FASE 4: MELHORIAS DE UI/UX

### 4.1 Melhorias de Formulários

**Criar:** `apps/frontend/components/ui/Form.tsx` (padronizado)

```typescript
import { ReactNode } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Label } from './label'
import { Input } from './input'
import { Textarea } from './textarea'
import { Select } from './select'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  name: string
  error?: string
  required?: boolean
  helper?: string
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  name,
  error,
  required,
  helper,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-error-500">*</span>}
      </Label>

      {children}

      {helper && !error && (
        <p className="text-xs text-text-tertiary">
          {helper}
        </p>
      )}

      {error && (
        <p className="text-xs text-error-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// Wrapper para formulários completos
interface FormProps {
  onSubmit: (e: React.FormEvent) => void
  children: ReactNode
  className?: string
}

export function Form({ onSubmit, children, className }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={cn('space-y-6', className)} noValidate>
      {children}
    </form>
  )
}
```

**Exemplo de uso:**

```typescript
<Form onSubmit={handleSubmit}>
  <FormField
    label="Título"
    name="titulo"
    required
    error={errors.titulo?.message}
    helper="Descreva brevemente o feedback"
  >
    <Input
      id="titulo"
      {...register('titulo')}
      placeholder="Ex: Problema no atendimento"
      aria-invalid={!!errors.titulo}
    />
  </FormField>

  <FormField
    label="Tipo"
    name="tipo"
    required
    error={errors.tipo?.message}
  >
    <Select id="tipo" {...register('tipo')}>
      <option value="">Selecione...</option>
      <option value="DENUNCIA">Denúncia</option>
      <option value="RECLAMACAO">Reclamação</option>
      <option value="SUGESTAO">Sugestão</option>
      <option value="ELOGIO">Elogio</option>
    </Select>
  </FormField>

  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
  </Button>
</Form>
```

---

### 4.2 Melhorias de Feedback Visual

**Criar:** `apps/frontend/components/ui/LoadingState.tsx`

```typescript
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingState({ size = 'md', text, className }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <Loader2 className={cn(sizeClasses[size], 'animate-spin text-primary-500')} />
      {text && (
        <p className="text-sm text-text-secondary">
          {text}
        </p>
      )}
    </div>
  )
}

// Loading skeleton
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-neutral-200', className)} />
  )
}
```

**Criar:** `apps/frontend/components/ui/Toast.tsx` (se não existir)

```typescript
// Usar sonner ou react-hot-toast
import { Toaster } from 'sonner'

// No layout principal
<Toaster
  position="top-right"
  toastOptions={{
    style: {
      background: '#ffffff',
      color: '#171717',
      border: '1px solid #e5e5e5',
    },
    className: 'font-sans',
  }}
/>

// Uso:
import { toast } from 'sonner'

toast.success('Feedback enviado com sucesso!')
toast.error('Erro ao enviar feedback')
toast.loading('Processando...')
```

---

### 4.3 Melhorias de Navegação e Breadcrumbs

**Criar:** `apps/frontend/components/ui/Breadcrumbs.tsx`

```typescript
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center text-text-tertiary hover:text-text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Início</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <Fragment key={index}>
            <li>
              <ChevronRight className="w-4 h-4 text-border-dark" />
            </li>

            <li>
              {item.href && index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-primary font-medium">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
```

**Uso:**

```typescript
<Breadcrumbs
  items={[
    { label: 'Feedbacks', href: '/dashboard/feedbacks' },
    { label: 'FDB-2024-001' },
  ]}
/>
```

---

### 4.4 Melhorias de Acessibilidade

**Checklist de acessibilidade:**

```typescript
// components/ui/AccessibilityChecklist.md

## Acessibilidade - Checklist

### Semântica HTML
- [ ] Usar tags semânticas (<header>, <main>, <nav>, <section>)
- [ ] Heading hierarchy correta (H1 → H2 → H3)
- [ ] Landmarks ARIA onde necessário

### Teclado
- [ ] Todos os elementos interativos acessíveis via Tab
- [ ] Focus visible em todos os elementos
- [ ] Skip to content link implementado
- [ ] Esc fecha modals/dropdowns
- [ ] Enter/Space ativa botões

### Screen Readers
- [ ] Alt text em todas as imagens
- [ ] aria-label em ícones sem texto
- [ ] aria-describedby para ajuda contextual
- [ ] aria-live para notificações
- [ ] aria-expanded em dropdowns/accordions

### Contraste de Cores
- [ ] Texto normal: contraste mínimo 4.5:1
- [ ] Texto grande: contraste mínimo 3:1
- [ ] Elementos UI: contraste mínimo 3:1
- [ ] Validado com ferramentas automáticas

### Formulários
- [ ] Labels associados aos inputs
- [ ] Mensagens de erro claras e associadas
- [ ] Campos obrigatórios indicados
- [ ] Validação em tempo real
- [ ] Mensagens de sucesso após submit

### Responsividade
- [ ] Zoom até 200% sem quebrar layout
- [ ] Touch targets mínimo 44x44px
- [ ] Sem scroll horizontal em mobile
- [ ] Texto responsivo (sem zoom excessivo)
```

**Implementar Skip to Content:**

```typescript
// app/layout.tsx

<body>
  <a href="#main-content" className="skip-to-content">
    Pular para o conteúdo
  </a>

  <Header />

  <main id="main-content" tabIndex={-1}>
    {children}
  </main>

  <Footer />
</body>
```

---

### 4.5 Melhorias de Performance Percebida

**Otimistic UI:**

```typescript
// Exemplo: Marcar feedback como lido
async function markAsRead(id: string) {
  // 1. Atualizar UI imediatamente (otimistic)
  setFeedbacks((prev) =>
    prev.map((f) => (f.id === id ? { ...f, lido: true } : f)),
  );

  try {
    // 2. Fazer requisição
    await api.patch(`/feedbacks/${id}/`, { lido: true });
  } catch (error) {
    // 3. Reverter em caso de erro
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, lido: false } : f)),
    );
    toast.error("Erro ao marcar como lido");
  }
}
```

**Skeleton Screens:**

```typescript
// Enquanto carrega, mostrar skeleton
{isLoading ? (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <Card key={i}>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
) : (
  <FeedbackList data={feedbacks} />
)}
```

**Critérios de Aceite Fase 4:**

- [ ] Formulários padronizados com validação visual
- [ ] Loading states em todas as ações assíncronas
- [ ] Toasts para feedback de ações
- [ ] Breadcrumbs em páginas profundas
- [ ] Checklist de acessibilidade 100% completo
- [ ] Contraste de cores validado (WCAG AA)
- [ ] Skeleton screens implementados
- [ ] Commit: "feat: improve UI/UX with better feedback and accessibility"

---

## 🧹 FASE 5: LIMPEZA E REFATORAÇÃO DE ESTILOS

### 5.1 Remover Duplicações de CSS

**Script de detecção:**

```typescript
// scripts/detect-duplicate-styles.ts

import fs from 'fs'
import { glob } from 'glob'

async function detectDuplicates() {
  const files = await glob('app/**/*.{ts,tsx,css}', {
    ignore: ['node_modules/**', '.next/**'],
  })

  const classUsage = new Map<string, string[]>()

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')

    // Extrair classes Tailwind
    const classMatches = content.matchAll(/className="([^"]+)"/g)

    for (const match of classMatches) {
      const classes = match [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/151172368/c5acf65d-aaa7-46ab-85dd-c4139b60ce27/LAUNCH_CHECKLIST.md)

      if (!classUsage.has(classes)) {
        classUsage.set(classes, [])
      }

      classUsage.get(classes)!.push(file)
    }
  }

  // Encontrar duplicações (mesmas classes em múltiplos arquivos)
  const duplicates = Array.from(classUsage.entries())
    .filter(([_, files]) => files.length > 3) // Usado em 3+ lugares
    .sort((a, b) => b [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/151172368/c5acf65d-aaa7-46ab-85dd-c4139b60ce27/LAUNCH_CHECKLIST.md).length - a [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/151172368/c5acf65d-aaa7-46ab-85dd-c4139b60ce27/LAUNCH_CHECKLIST.md).length)

  console.log('\n🔍 Classes duplicadas que devem virar componentes:\n')

  duplicates.slice(0, 20).forEach(([classes, files]) => {
    console.log(`\n"${classes}"`)
    console.log(`Usado em ${files.length} arquivos:`)
    files.slice(0, 5).forEach(f => console.log(`  - ${f}`))
    if (files.length > 5) {
      console.log(`  ... e mais ${files.length - 5}`)
    }
  })
}

detectDuplicates()
```

---

### 5.2 Extrair Estilos Comuns para Componentes

Com base nas duplicações encontradas, criar componentes:

**Exemplo: Botão de Ação Primária aparece em 10+ lugares**

Antes (duplicado):

```tsx
<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
  Salvar
</button>
```

Depois (componente):

```tsx
<Button variant="primary">Salvar</Button>
```

---

### 5.3 Consolidar Arquivos CSS

**Verificar arquivos CSS customizados:**

```bash
find app -name "*.css" -not -path "*/node_modules/*"
```

Se houver múltiplos arquivos CSS:

- Consolidar em `app/globals.css`
- Remover duplicações
- Converter para Tailwind classes quando possível

---

### 5.4 Validação Final de Estilos

**Checklist:**

```markdown
## Validação de Estilos

### Consistência

- [ ] Todas as cores vêm de tokens do design system
- [ ] Todas as fontes vêm de `typography`
- [ ] Todos os espaçamentos usam escala de 8px
- [ ] Border radius consistente
- [ ] Sombras consistentes

### Performance

- [ ] Sem CSS-in-JS inline desnecessário
- [ ] Classes Tailwind em uso (verificar com purge)
- [ ] Fontes otimizadas (subset, display: swap)
- [ ] Critical CSS inline (Next.js faz automaticamente)

### Acessibilidade

- [ ] Contraste validado
- [ ] Focus states visíveis
- [ ] Touch targets adequados (44x44px mínimo)
- [ ] Texto legível em todos os tamanhos

### Manutenibilidade

- [ ] Componentes reutilizáveis criados
- [ ] Sem duplicação de estilos
- [ ] Documentação de padrões
- [ ] Storybook ou guia de componentes (opcional)
```

**Critérios de Aceite Fase 5:**

- [ ] Script de duplicação executado
- [ ] Pelo menos 10 componentes reutilizáveis extraídos
- [ ] Arquivos CSS consolidados
- [ ] Zero inline styles desnecessários
- [ ] Validação de estilos 100% completa
- [ ] Commit: "refactor: remove style duplications and extract reusable components"

---

## 📦 FASE 6: DOCUMENTAÇÃO DO DESIGN SYSTEM

### 6.1 Criar Guia de Componentes

**Criar:** `docs/DESIGN_SYSTEM.md`

````markdown
# Design System - Ouvify

## Introdução

Este documento descreve o sistema de design do Ouvify, incluindo cores, tipografia, componentes e padrões de uso.

## Cores

### Paleta Principal

#### Primary (Azul)

- **primary-500**: `#0ea5e9` - Cor principal da marca
- Uso: CTAs primários, links, highlights

#### Secondary (Roxo)

- **secondary-500**: `#a855f7` - Cor secundária
- Uso: CTAs secundários, badges especiais

#### Success (Verde)

- **success-500**: `#22c55e`
- Uso: Mensagens de sucesso, status positivos

#### Warning (Laranja)

- **warning-500**: `#f59e0b`
- Uso: Alertas, avisos

#### Error (Vermelho)

- **error-500**: `#ef4444`
- Uso: Erros, ações destrutivas

#### Neutral (Cinza)

- **neutral-50** a **neutral-950**
- Uso: Texto, backgrounds, bordas

### Aplicação de Cores

```tsx
// Botão primário
<Button className="bg-primary-500 hover:bg-primary-600 text-white">
  Ação Principal
</Button>

// Botão de erro
<Button className="bg-error-500 hover:bg-error-600 text-white">
  Excluir
</Button>

// Badge de status
<StatusBadge status="novo" /> // Azul
<StatusBadge status="resolvido" /> // Verde
```
````

## Tipografia

### Fontes

- **Sans (Inter)**: Corpo de texto, UI
- **Heading (Poppins)**: Títulos, destaques

### Escala de Tamanhos

| Nome | Tamanho | Uso                     |
| ---- | ------- | ----------------------- |
| xs   | 12px    | Labels pequenos, badges |
| sm   | 14px    | Texto secundário        |
| base | 16px    | Texto principal         |
| lg   | 18px    | Texto destacado         |
| xl   | 20px    | Subtítulos              |
| 2xl  | 24px    | H4                      |
| 3xl  | 30px    | H3                      |
| 4xl  | 36px    | H2                      |
| 5xl  | 48px    | H1                      |

### Hierarquia

```tsx
<h1 className="text-5xl font-bold text-text-primary">Título Principal</h1>
<h2 className="text-4xl font-bold text-text-primary">Subtítulo</h2>
<p className="text-base text-text-primary">Parágrafo normal</p>
<p className="text-sm text-text-secondary">Texto secundário</p>
```

## Espaçamento

### Escala (baseada em 8px)

- **2**: 8px - Espaçamento mínimo
- **4**: 16px - Padrão entre elementos
- **6**: 24px - Entre seções pequenas
- **8**: 32px - Entre seções
- **12**: 48px - Entre blocos grandes

### Aplicação

```tsx
// Padding de card
<Card className="p-6"> {/* 24px */}

// Gap entre elementos
<div className="space-y-4"> {/* 16px vertical */}

// Margin entre seções
<section className="mb-8"> {/* 32px abaixo */}
```

## Componentes

### Botões

#### Variantes

**Primary**

```tsx
<Button variant="primary">Ação Principal</Button>
```

- Cor: primary-500
- Uso: Ação principal da página

**Secondary**

```tsx
<Button variant="secondary">Ação Secundária</Button>
```

- Cor: neutral-200
- Uso: Ações alternativas

**Outline**

```tsx
<Button variant="outline">Ver Mais</Button>
```

- Borda: primary-500
- Uso: Ações terciárias

**Ghost**

```tsx
<Button variant="ghost">Cancelar</Button>
```

- Sem fundo
- Uso: Ações discretas

**Destructive**

```tsx
<Button variant="destructive">Excluir</Button>
```

- Cor: error-500
- Uso: Ações destrutivas (delete)

#### Tamanhos

```tsx
<Button size="sm">Pequeno</Button>
<Button size="md">Médio (padrão)</Button>
<Button size="lg">Grande</Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>

  <CardContent>Conteúdo principal</CardContent>

  <CardFooter>Ações ou informações extras</CardFooter>
</Card>
```

### Formulários

```tsx
<FormField
  label="Nome"
  name="nome"
  required
  error={errors.nome?.message}
  helper="Digite seu nome completo"
>
  <Input id="nome" {...register("nome")} />
</FormField>
```

### Status Badges

```tsx
<StatusBadge status="novo" />
<StatusBadge status="em_analise" />
<StatusBadge status="respondido" />
<StatusBadge status="fechado" />
<StatusBadge status="resolvido" />
```

### Empty States

```tsx
<EmptyState
  icon={Inbox}
  title="Nenhum feedback encontrado"
  description="Quando recebermos feedbacks, eles aparecerão aqui."
  action={{
    label: "Criar Primeiro Feedback",
    onClick: () => navigate("/novo"),
    icon: Plus,
  }}
/>
```

### Loading States

```tsx
// Spinner
<LoadingState text="Carregando feedbacks..." />

// Skeleton
<Skeleton className="h-24 w-full" />
```

## Padrões de Layout

### Page Layout

```tsx
<PageLayout>
  <PageHeader
    title="Título da Página"
    description="Descrição da página"
    actions={<Button>Ação</Button>}
  />

  <PageContent>{/* Conteúdo */}</PageContent>
</PageLayout>
```

### Grid de Cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Lista com Filtros

```tsx
<div className="space-y-6">
  {/* Filtros */}
  <div className="flex flex-col sm:flex-row gap-4">
    <Input placeholder="Buscar..." />
    <Select>...</Select>
  </div>

  {/* Lista */}
  <div className="space-y-4">
    {items.map((item) => (
      <FeedbackCard key={item.id} {...item} />
    ))}
  </div>
</div>
```

## Responsividade

### Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile First

```tsx
// Padrão mobile, customizar para desktop
<div className="flex flex-col md:flex-row gap-4 md:gap-8">...</div>
```

## Acessibilidade

### Focus States

Todos os elementos interativos possuem focus state visível:

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
<span className="sr-only">Descrição para leitores de tela</span>

// Ícones com label
<Button aria-label="Fechar">
  <X className="w-4 h-4" />
</Button>
```

### Contraste

Todas as combinações de cores atendem WCAG AA (mínimo 4.5:1).

## Animações

### Transições

```tsx
// Hover em botões
className = "transition-colors duration-200";

// Fade in
className = "animate-fade-in";

// Slide up
className = "animate-slide-up";
```

### Não usar animações excessivas

- Máximo 300ms de duração
- Usar ease-in-out
- Respeitar prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Boas Práticas

### Do's ✅

- Usar componentes do design system
- Respeitar hierarquia de cores e tipografia
- Manter espaçamento consistente
- Testar acessibilidade
- Otimizar performance

### Don'ts ❌

- Não usar cores hardcoded
- Não criar componentes duplicados
- Não ignorar estados de loading/erro
- Não usar inline styles
- Não adicionar animações pesadas

````

---

### 6.2 Criar Storybook (Opcional mas Recomendado)

**Instalar:**

```bash
npx storybook@latest init
````

**Criar stories para componentes principais:**

```typescript
// components/ui/Button.stories.tsx

import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}
```

**Critérios de Aceite Fase 6:**

- [ ] DESIGN_SYSTEM.md completo e detalhado
- [ ] Todos os componentes documentados
- [ ] Exemplos de código para cada componente
- [ ] Storybook configurado (opcional)
- [ ] Pelo menos 10 stories criados (se Storybook)
- [ ] Commit: "docs: create complete design system documentation"

---

## ✅ ENTREGÁVEIS FINAIS - DESIGN SYSTEM

### Relatório Final

**Criar:** `docs/DESIGN_AUDIT_REPORT.md`

```markdown
# Relatório Final - Design System e UI/UX Ouvify

**Data:** [DATA]
**Executor:** GitHub Copilot

## ✅ Fases Completadas

### Fase 1: Identidade Visual ✅

- [x] Paleta de cores definida (12 escalas)
- [x] Contraste validado (WCAG AA)
- [x] Tipografia configurada (Inter + Poppins)
- [x] Espaçamento padronizado (grid 8px)
- [x] Tailwind configurado com tokens

### Fase 2: Logo Otimizada ✅

- [x] SVG otimizado
- [x] 4 variantes criadas (full, icon, text, white)
- [x] Componente Logo reutilizável
- [x] Posicionamento padronizado
- [x] Guia de marca documentado

### Fase 3: Padronização de Páginas ✅

- [x] Auditoria de inconsistências executada
- [x] 15+ componentes padronizados criados
- [x] Todas as páginas migradas para novos componentes
- [x] Zero duplicação de código de estilo

### Fase 4: UI/UX Melhorado ✅

- [x] Formulários com validação visual
- [x] Loading states implementados
- [x] Toast notifications configuradas
- [x] Breadcrumbs em páginas profundas
- [x] Acessibilidade WCAG AA completa
- [x] Contraste validado em todas as cores

### Fase 5: Limpeza de Estilos ✅

- [x] Duplicações removidas
- [x] Estilos consolidados
- [x] Componentes reutilizáveis extraídos
- [x] Zero inline styles desnecessários

### Fase 6: Documentação ✅

- [x] DESIGN_SYSTEM.md completo
- [x] BRAND_GUIDELINES.md criado
- [x] Storybook configurado
- [x] Todos os componentes documentados

## 📊 Métricas de Melhoria

| Métrica                    | Antes | Depois | Melhoria |
| -------------------------- | ----- | ------ | -------- |
| Componentes reutilizáveis  | 5     | 25+    | +400%    |
| Páginas padronizadas       | 30%   | 100%   | +233%    |
| Contraste WCAG AA          | 60%   | 100%   | +67%     |
| Duplicação de estilos      | Alta  | Zero   | -100%    |
| Tempo de dev (nova página) | 2h    | 30min  | -75%     |

## 🎨 Componentes Criados

### Layout

- PageLayout
- PageHeader
- PageContent
- Header
- Footer
- Sidebar

### UI

- Button (6 variantes)
- Card (+ Header, Content, Footer)
- Form & FormField
- Input, Textarea, Select
- StatusBadge
- EmptyState
- LoadingState
- Skeleton
- Toast
- Breadcrumbs
- Logo (4 variantes)

### Utilitários

- cn (className merge)
- Color tokens
- Typography system
- Spacing system

## 🚀 Próximos Passos Recomendados

### Curto Prazo (1-2 semanas)

1. Criar componentes específicos de domínio (FeedbackCard, TeamMemberCard)
2. Implementar dark mode
3. Adicionar mais stories no Storybook
4. Criar templates de páginas comuns

### Médio Prazo (1 mês)

1. Implementar design tokens CSS variables (para white label)
2. Criar biblioteca de ícones customizados
3. Desenvolver animações microinterações
4. Otimizar performance de renderização

### Longo Prazo (3 meses)

1. Evoluir para design system versionado
2. Criar pacote NPM do design system (se escalar)
3. Implementar temas avançados
4. Adicionar componentes de IA/automação

## 🎯 Status: DESIGN SYSTEM COMPLETO E PRONTO PARA USO

O Ouvify agora possui um design system robusto, acessível e manutenível, pronto para escalar com o crescimento do produto.

---

**Assinado:** GitHub Copilot
**Data:** [DATA]
```

---

## 🎯 INSTRUÇÕES FINAIS DE EXECUÇÃO

### Como Executar Este Prompt:

1. **Abra o projeto Ouvify** no VS Code

2. **Abra o GitHub Copilot Chat** (Ctrl+Shift+I)

3. **Execute fase por fase:**

   ```
   Execute a FASE 1: Definição da Identidade Visual
   ```

   - Aguarde conclusão
   - Revise cores e contraste
   - Teste em algumas páginas
   - Commit: `feat: define brand identity`

   ```
   Execute a FASE 2: Otimização da Logo
   ```

   - Revise posicionamento
   - Teste em diferentes tamanhos
   - Commit: `feat: optimize logo usage`

   (Continuar para todas as 6 fases)

4. **Validação final:**

   ```bash
   # Testar build
   npm run build

   # Verificar contraste
   npx pa11y http://localhost:3000

   # Visual regression (opcional)
   npx playwright test
   ```

5. **Deploy de teste:**
   - Deploy no Vercel staging
   - Validar em dispositivos reais
   - Testar acessibilidade com leitor de tela

---

## ⚠️ NOTAS IMPORTANTES

1. **Backup antes de começar:**

   ```bash
   git checkout -b feature/design-system
   ```

2. **Teste em cada etapa:** Não pule validações

3. **Acessibilidade é prioritária:** Não sacrificar por estética

4. **Performance importa:** Monitorar bundle size

5. **Documentação é essencial:** Manter docs atualizados

6. **Feedback de usuários:** Testar com usuários reais quando
