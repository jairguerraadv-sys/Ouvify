'use client';

import { useTenantTheme, useThemeReady } from '@/hooks/use-tenant-theme';

/**
 * Componente que carrega o tema e aplica a classe .theme-ready
 * quando o tema estiver pronto.
 * 
 * DEVE ser um Client Component pois usa hooks.
 */
export function ThemeLoader() {
  const theme = useTenantTheme();
  const themeReady = useThemeReady();
  
  // Aplicar classe .theme-ready quando o tema estiver carregado
  if (typeof document !== 'undefined' && themeReady) {
    document.documentElement.classList.add('theme-ready');
  }
  
  // Aplicar logo do tenant dinamicamente
  if (typeof document !== 'undefined' && theme?.logo) {
    // Criar uma tag style dinâmica com a logo
    const styleId = 'tenant-logo-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      .logo-tenant {
        background-image: url('${theme.logo}');
      }
    `;
  }
  
  return null; // Não renderiza nada visualmente
}
