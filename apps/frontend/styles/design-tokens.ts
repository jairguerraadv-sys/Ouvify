/**
 * Design Tokens - Ouvify
 * Sistema unificado de cores, tipografia e espaçamentos da marca
 * 
 * @description Este arquivo define todos os tokens de design do Ouvify,
 * garantindo consistência visual em toda a aplicação.
 * 
 * @usage Importar tokens onde necessário:
 * import { colors, typography, spacing } from '@/styles/design-tokens'
 */

// ============================================
// PALETA DE CORES
// ============================================

export const colors = {
  // Cores Primárias (Identidade da marca - Azul Profissional)
  primary: {
    50: '#EFF6FF',   // Muito claro - backgrounds sutis
    100: '#DBEAFE',  // Claro - hover states
    200: '#BFDBFE',  // Claro médio
    300: '#93C5FD',  // Médio
    400: '#60A5FA',  // Médio escuro
    500: '#3B82F6',  // Base - cor principal da marca
    600: '#2563EB',  // Escuro - hover em botões
    700: '#1D4ED8',  // Mais escuro
    800: '#1E40AF',  // Muito escuro
    900: '#1E3A8A',  // Quase preto
    DEFAULT: '#3B82F6',
  },
  
  // Cores Secundárias (Roxo Criativo)
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',  // Base
    600: '#9333EA',  // Hover
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
    DEFAULT: '#A855F7',
  },
  
  // Cores de Feedback (Status e alertas)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',  // Base - verde sucesso
    600: '#16A34A',  // Hover
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    DEFAULT: '#22C55E',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Base - amarelo/laranja aviso
    600: '#D97706',  // Hover
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    DEFAULT: '#F59E0B',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Base - vermelho erro
    600: '#DC2626',  // Hover
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    DEFAULT: '#EF4444',
  },
  
  info: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',  // Base - ciano informação
    600: '#0891B2',  // Hover
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
    DEFAULT: '#06B6D4',
  },
  
  // Cores Neutras (Textos, backgrounds, bordas)
  neutral: {
    0: '#FFFFFF',     // Branco puro
    50: '#F9FAFB',    // Quase branco - backgrounds
    100: '#F3F4F6',   // Cinza muito claro
    200: '#E5E7EB',   // Cinza claro - bordas sutis
    300: '#D1D5DB',   // Cinza médio claro
    400: '#9CA3AF',   // Cinza médio - texto desabilitado
    500: '#6B7280',   // Cinza - texto secundário
    600: '#4B5563',   // Cinza escuro - texto normal
    700: '#374151',   // Muito escuro - texto importante
    800: '#1F2937',   // Quase preto - headings
    900: '#111827',   // Preto - texto principal
    950: '#030712',   // Preto total
    DEFAULT: '#6B7280',
  },
  
  // Cores de Background
  background: {
    primary: '#FFFFFF',      // Fundo principal (branco)
    secondary: '#F9FAFB',    // Fundo secundário (cinza claríssimo)
    tertiary: '#F3F4F6',     // Fundo terciário (cinza claro)
    inverse: '#111827',      // Fundo escuro (para contraste)
  },
  
  // Cores de Texto (com contraste garantido WCAG AA)
  text: {
    primary: '#111827',      // Texto principal (preto) - Contraste 16:1
    secondary: '#4B5563',    // Texto secundário (cinza escuro) - Contraste 7:1
    tertiary: '#6B7280',     // Texto terciário (cinza) - Contraste 4.5:1
    inverse: '#FFFFFF',      // Texto em fundos escuros
    disabled: '#9CA3AF',     // Texto desabilitado
    link: '#3B82F6',         // Links
    linkHover: '#2563EB',    // Links hover
  },
  
  // Cores de Borda
  border: {
    light: '#E5E7EB',        // Bordas sutis
    DEFAULT: '#D1D5DB',      // Bordas padrão
    dark: '#9CA3AF',         // Bordas escuras
    focus: '#3B82F6',        // Bordas de foco
  },
} as const;

// ============================================
// TIPOGRAFIA
// ============================================

export const typography = {
  // Famílias de fonte
  fontFamily: {
    sans: 'var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    heading: 'var(--font-poppins), system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, "JetBrains Mono", Menlo, Monaco, "Cascadia Code", monospace',
  },
  
  // Escala de tamanhos (baseada em 16px = 1rem)
  fontSize: {
    // Textos pequenos
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    
    // Texto base
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    
    // Textos maiores
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    
    // Headings
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px - H4
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - H3
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px - H2
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px - H1
    '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px - Display
    '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px - Hero
  },
  
  // Pesos de fonte
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line heights específicos
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Classes CSS utilitárias para headings
export const headingStyles = {
  h1: 'font-heading text-5xl font-bold text-gray-900 tracking-tight',
  h2: 'font-heading text-4xl font-bold text-gray-900 tracking-tight',
  h3: 'font-heading text-3xl font-semibold text-gray-900',
  h4: 'font-heading text-2xl font-semibold text-gray-900',
  h5: 'font-heading text-xl font-semibold text-gray-900',
  h6: 'font-heading text-lg font-semibold text-gray-900',
} as const;

// Classes para textos
export const textStyles = {
  body: 'font-sans text-base text-gray-900 leading-normal',
  bodySecondary: 'font-sans text-base text-gray-600 leading-normal',
  small: 'font-sans text-sm text-gray-600 leading-snug',
  caption: 'font-sans text-xs text-gray-500 leading-tight',
  label: 'font-sans text-sm font-medium text-gray-700 leading-snug',
  link: 'font-sans text-base text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline transition-colors',
} as const;

// ============================================
// ESPAÇAMENTO
// ============================================

export const spacing = {
  // Escala base (8px = 0.5rem)
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px  ← Base
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const;

// ============================================
// LAYOUT
// ============================================

export const layout = {
  // Container max-widths
  maxWidth: {
    xs: '20rem',      // 320px
    sm: '24rem',      // 384px
    md: '28rem',      // 448px
    lg: '32rem',      // 512px
    xl: '36rem',      // 576px
    '2xl': '42rem',   // 672px
    '3xl': '48rem',   // 768px
    '4xl': '56rem',   // 896px
    '5xl': '64rem',   // 1024px
    '6xl': '72rem',   // 1152px
    '7xl': '80rem',   // 1280px
    full: '100%',
    prose: '65ch',    // Largura ideal para leitura
  },
  
  // Padding padrão de seções
  section: {
    sm: 'py-8 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8',
    xl: 'py-24 px-8',
  },
  
  // Padding de containers
  container: {
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
    xl: 'px-12',
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  DEFAULT: '0.375rem', // 6px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============================================
// TRANSITIONS
// ============================================

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ============================================
// EXPORTS TIPADOS
// ============================================

export type ColorScale = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type Spacing = keyof typeof spacing;
export type Shadow = keyof typeof shadows;
export type BorderRadius = keyof typeof borderRadius;
