/**
 * 🎨 OUVIFY DESIGN TOKENS
 * Centralized design system constants for consistent UI/UX
 * 
 * Usage:
 * import { colors, spacing, typography } from '@/lib/design-tokens';
 */

// ============================================
// 🎨 COLORS
// ============================================

export const colors = {
  // Brand Colors
  brand: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',  // Main
      600: '#2563EB',  // Hover
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      DEFAULT: '#3B82F6',
    },
    secondary: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',  // Main
      600: '#9333EA',  // Hover
      700: '#7E22CE',
      800: '#6B21A8',
      900: '#581C87',
      DEFAULT: '#A855F7',
    },
  },

  // Semantic Colors
  semantic: {
    success: {
      light: '#DCFCE7',
      main: '#22C55E',
      dark: '#16A34A',
      contrast: '#FFFFFF',
    },
    warning: {
      light: '#FEF3C7',
      main: '#F59E0B',
      dark: '#D97706',
      contrast: '#111827',
    },
    error: {
      light: '#FEE2E2',
      main: '#EF4444',
      dark: '#DC2626',
      contrast: '#FFFFFF',
    },
    info: {
      light: '#CFFAFE',
      main: '#06B6D4',
      dark: '#0891B2',
      contrast: '#FFFFFF',
    },
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
} as const;

// ============================================
// 📐 SPACING
// ============================================

export const spacing = {
  // Base unit: 4px
  px: '1px',
  0: '0',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

// ============================================
// 🔤 TYPOGRAPHY
// ============================================

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  
  fontSize: {
    xs: { size: '12px', lineHeight: '16px' },
    sm: { size: '14px', lineHeight: '20px' },
    base: { size: '16px', lineHeight: '24px' },
    lg: { size: '18px', lineHeight: '28px' },
    xl: { size: '20px', lineHeight: '28px' },
    '2xl': { size: '24px', lineHeight: '32px' },
    '3xl': { size: '30px', lineHeight: '36px' },
    '4xl': { size: '36px', lineHeight: '40px' },
    '5xl': { size: '48px', lineHeight: '1' },
    '6xl': { size: '60px', lineHeight: '1' },
    '7xl': { size: '72px', lineHeight: '1' },
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================
// 📦 BORDER RADIUS
// ============================================

export const borderRadius = {
  none: '0',
  sm: '4px',
  DEFAULT: '6px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

// ============================================
// 🌑 SHADOWS
// ============================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Brand shadows (colored)
  primary: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
  secondary: '0 4px 14px 0 rgba(168, 85, 247, 0.39)',
  success: '0 4px 14px 0 rgba(34, 197, 94, 0.39)',
  error: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
} as const;

// ============================================
// ⏱️ TRANSITIONS
// ============================================

export const transitions = {
  duration: {
    fastest: '75ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// ============================================
// 📱 BREAKPOINTS
// ============================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// 📏 Z-INDEX
// ============================================

export const zIndex = {
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// ============================================
// 🎯 COMPONENT TOKENS
// ============================================

export const componentTokens = {
  // Button sizes
  button: {
    sm: { height: '32px', padding: '0 12px', fontSize: '14px' },
    md: { height: '40px', padding: '0 16px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 24px', fontSize: '16px' },
    xl: { height: '56px', padding: '0 32px', fontSize: '18px' },
  },
  
  // Input sizes
  input: {
    sm: { height: '32px', padding: '0 12px', fontSize: '14px' },
    md: { height: '40px', padding: '0 14px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 16px', fontSize: '16px' },
  },
  
  // Card variants
  card: {
    padding: {
      sm: '12px',
      md: '16px',
      lg: '24px',
    },
    borderRadius: '8px',
  },
  
  // Avatar sizes
  avatar: {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
    '2xl': '96px',
  },
  
  // Badge sizes
  badge: {
    sm: { height: '20px', fontSize: '11px', padding: '0 6px' },
    md: { height: '24px', fontSize: '12px', padding: '0 8px' },
    lg: { height: '28px', fontSize: '13px', padding: '0 10px' },
  },
} as const;

// ============================================
// 🚀 EXPORTS
// ============================================

export const tokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  componentTokens,
} as const;

export default tokens;
