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
// PALETA DE CORES (baseada em tokens HSL)
// ============================================

const mixWith = (baseVar: string, target: string, amount: number) =>
  `color-mix(in srgb, hsl(var(${baseVar})) ${100 - amount}%, ${target} ${amount}%)`;

const createScale = (baseVar: string) => ({
  50: mixWith(baseVar, "white", 90),
  100: mixWith(baseVar, "white", 80),
  200: mixWith(baseVar, "white", 65),
  300: mixWith(baseVar, "white", 50),
  400: mixWith(baseVar, "white", 35),
  500: `hsl(var(${baseVar}))`,
  600: mixWith(baseVar, "black", 15),
  700: mixWith(baseVar, "black", 25),
  800: mixWith(baseVar, "black", 35),
  900: mixWith(baseVar, "black", 45),
  DEFAULT: `hsl(var(${baseVar}))`,
});

const createNeutralScale = () => ({
  0: `hsl(var(--background))`,
  50: mixWith("--foreground", "white", 94),
  100: mixWith("--foreground", "white", 88),
  200: mixWith("--foreground", "white", 78),
  300: mixWith("--foreground", "white", 68),
  400: mixWith("--foreground", "white", 50),
  500: `hsl(var(--muted-foreground))`,
  600: mixWith("--foreground", "black", 10),
  700: mixWith("--foreground", "black", 20),
  800: mixWith("--foreground", "black", 30),
  900: `hsl(var(--foreground))`,
  950: mixWith("--foreground", "black", 45),
  DEFAULT: `hsl(var(--muted-foreground))`,
});

export const colors = {
  // Identidade
  primary: createScale("--primary"),
  secondary: createScale("--secondary"),

  // Feedback
  success: createScale("--success"),
  warning: createScale("--warning"),
  error: createScale("--error"),
  info: createScale("--info"),

  // Neutros
  neutral: createNeutralScale(),

  // Backgrounds
  background: {
    primary: `hsl(var(--background))`,
    secondary: mixWith("--background", "white", 4),
    tertiary: mixWith("--background", "white", 8),
    inverse: `hsl(var(--foreground))`,
  },

  // Texto
  text: {
    primary: `hsl(var(--foreground))`,
    secondary: mixWith("--foreground", "white", 15),
    tertiary: mixWith("--foreground", "white", 30),
    inverse: `hsl(var(--background))`,
    disabled: `hsl(var(--muted-foreground))`,
    link: `hsl(var(--primary))`,
    linkHover: mixWith("--primary", "black", 12),
  },

  // Borda
  border: {
    light: `hsl(var(--border))`,
    DEFAULT: `hsl(var(--border))`,
    dark: mixWith("--border", "black", 15),
    focus: `hsl(var(--ring))`,
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
  h1: 'font-heading text-5xl font-bold text-neutral-900 tracking-tight',
  h2: 'font-heading text-4xl font-bold text-neutral-900 tracking-tight',
  h3: 'font-heading text-3xl font-semibold text-neutral-900',
  h4: 'font-heading text-2xl font-semibold text-neutral-900',
  h5: 'font-heading text-xl font-semibold text-neutral-900',
  h6: 'font-heading text-lg font-semibold text-neutral-900',
} as const;

// Classes para textos
export const textStyles = {
  body: 'font-sans text-base text-neutral-900 leading-normal',
  bodySecondary: 'font-sans text-base text-neutral-600 leading-normal',
  small: 'font-sans text-sm text-neutral-600 leading-snug',
  caption: 'font-sans text-xs text-neutral-500 leading-tight',
  label: 'font-sans text-sm font-medium text-neutral-700 leading-snug',
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
const shadowBase = 'hsl(var(--foreground) / 0.08)';
const shadowMid = 'hsl(var(--foreground) / 0.12)';
const shadowStrong = 'hsl(var(--foreground) / 0.2)';

export const shadows = {
  none: 'none',
  sm: `0 1px 2px 0 ${shadowBase}`,
  DEFAULT: `0 1px 3px 0 ${shadowMid}, 0 1px 2px -1px ${shadowMid}`,
  md: `0 4px 6px -1px ${shadowMid}, 0 2px 4px -2px ${shadowMid}`,
  lg: `0 10px 15px -3px ${shadowMid}, 0 4px 6px -4px ${shadowMid}`,
  xl: `0 20px 25px -5px ${shadowStrong}, 0 8px 10px -6px ${shadowMid}`,
  '2xl': `0 25px 50px -12px ${shadowStrong}`,
  inner: `inset 0 2px 4px 0 ${shadowBase}`,
  primary: '0 4px 14px 0 hsl(var(--primary) / 0.35)',
  secondary: '0 4px 14px 0 hsl(var(--secondary) / 0.35)',
  success: '0 4px 14px 0 hsl(var(--success) / 0.35)',
  error: '0 4px 14px 0 hsl(var(--error) / 0.35)',
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
