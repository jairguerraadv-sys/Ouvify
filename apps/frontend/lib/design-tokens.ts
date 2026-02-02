import {
  colors as baseColors,
  spacing,
  typography,
  borderRadius,
  shadows as baseShadows,
} from "@/styles/design-tokens";

const colors = {
  brand: {
    primary: baseColors.primary,
    secondary: baseColors.secondary,
  },
  semantic: {
    success: {
      light: baseColors.success[100],
      main: baseColors.success[500],
      dark: baseColors.success[700],
      contrast: `hsl(var(--background))`,
    },
    warning: {
      light: baseColors.warning[100],
      main: baseColors.warning[500],
      dark: baseColors.warning[700],
      contrast: `hsl(var(--foreground))`,
    },
    error: {
      light: baseColors.error[100],
      main: baseColors.error[500],
      dark: baseColors.error[700],
      contrast: `hsl(var(--background))`,
    },
    info: {
      light: baseColors.info[100],
      main: baseColors.info[500],
      dark: baseColors.info[700],
      contrast: `hsl(var(--background))`,
    },
  },
  neutral: {
    white: baseColors.neutral[0],
    black: baseColors.neutral[950],
    gray: baseColors.neutral,
  },
} as const;

const shadows = {
  ...baseShadows,
} as const;

export { colors, spacing, typography, borderRadius, shadows };

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
