'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import logger from '@/lib/logger';

/**
 * Interface para os dados de tema do tenant
 */
interface TenantTheme {
  nome: string;
  subdominio: string;
  cor_primaria: string;
  cor_secundaria?: string | null;
  cor_texto?: string | null;
  logo: string | null;
  favicon?: string | null;
  fonte_customizada?: string | null;
}

/**
 * Hook para carregar e aplicar o tema (White Label) do tenant atual.
 * 
 * Funcionalidades:
 * - Busca dados do tenant via API (/api/tenant-info/)
 * - Aplica cores customizadas nas CSS variables (--primary, --secondary)
 * - Retorna logo e nome da empresa para uso nos componentes
 * - Cache automático com SWR (5 minutos)
 * 
 * @returns {TenantTheme | undefined} Dados do tema do tenant ou undefined se ainda carregando
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const theme = useTenantTheme();
 *   
 *   return (
 *     <div>
 *       {theme?.logo && <img src={theme.logo} alt={theme.nome} />}
 *       <h1>{theme?.nome}</h1>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTenantTheme() {
  // Buscar dados do tenant via SWR
  const { data: theme, error } = useSWR<TenantTheme>(
    '/api/tenant-info/',
    async (url: string) => {
      try {
        return await api.get<TenantTheme>(url);
      } catch (err) {
        // Se não houver tenant identificado, retornar tema padrão
        logger.warn('Não foi possível carregar tema do tenant, usando padrão');
        return {
          nome: 'Ouvy',
          subdominio: 'default',
          cor_primaria: '#00BCD4', // Cyan padrão
          logo: null,
        };
      }
    },
    {
      // Configurações de cache
      revalidateOnFocus: false, // Não revalidar ao focar na aba
      revalidateOnReconnect: false, // Não revalidar ao reconectar
      dedupingInterval: 300000, // 5 minutos de cache (300.000ms)
      shouldRetryOnError: false, // Não retry em erro (usar tema padrão)
    }
  );

  // Aplicar cores do tema nas CSS variables quando os dados mudarem
  useEffect(() => {
    if (!theme) return;

    // Validar que cor_primaria é um hex válido
    const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(theme.cor_primaria);
    
    if (!isValidHex) {
      logger.error(`Cor primária inválida: ${theme.cor_primaria}, usando padrão #00BCD4`);
      theme.cor_primaria = '#00BCD4';
    }

    // Converter hex para HSL para uso nas CSS variables do Tailwind
    const hexToHSL = (hex: string): string => {
      // Remover # se presente
      hex = hex.replace('#', '');
      
      // Converter para RGB
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      
      // Encontrar min e max
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }
      
      // Converter para graus, porcentagem
      h = Math.round(h * 360);
      s = Math.round(s * 100);
      const lum = Math.round(l * 100);
      
      return `${h} ${s}% ${lum}%`;
    };

    try {
      const hslColor = hexToHSL(theme.cor_primaria);
      
      // Aplicar cor primária
      document.documentElement.style.setProperty('--primary', hslColor);
      
      // Gerar variações da cor primária
      const [h, s, l] = hslColor.split(' ');
      const luminosity = parseInt(l);
      const lightLum = Math.min(luminosity + 20, 95);
      const darkLum = Math.max(luminosity - 20, 10);
      
      document.documentElement.style.setProperty('--primary-light', `${h} ${s} ${lightLum}%`);
      document.documentElement.style.setProperty('--primary-dark', `${h} ${s} ${darkLum}%`);
      
      // Aplicar cor secundária (se fornecida pelo backend)
      if (theme.cor_secundaria) {
        const isValidSecondary = /^#[0-9A-Fa-f]{6}$/.test(theme.cor_secundaria);
        if (isValidSecondary) {
          const hslSecondary = hexToHSL(theme.cor_secundaria);
          document.documentElement.style.setProperty('--secondary', hslSecondary);
        } else {
          logger.warn('Cor secundária inválida, usando padrão');
        }
      } else {
        // Cor secundária derivada (complementar)
        const secondaryHue = (parseInt(h) + 180) % 360;
        document.documentElement.style.setProperty('--secondary', `${secondaryHue} ${s} ${darkLum}%`);
      }
      
      // Aplicar cor de texto (se fornecida)
      if (theme.cor_texto) {
        const isValidText = /^#[0-9A-Fa-f]{6}$/.test(theme.cor_texto);
        if (isValidText) {
          const hslText = hexToHSL(theme.cor_texto);
          document.documentElement.style.setProperty('--foreground', hslText);
        }
      }
      
      // Aplicar fonte customizada (se fornecida)
      if (theme.fonte_customizada) {
        // Carregar fonte do Google Fonts dinamicamente
        const fontLink = document.getElementById('tenant-font');
        if (!fontLink) {
          const link = document.createElement('link');
          link.id = 'tenant-font';
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${theme.fonte_customizada.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
          document.head.appendChild(link);
        }
        
        document.documentElement.style.setProperty('--font-family', `'${theme.fonte_customizada}', sans-serif`);
      }
      
      // Aplicar favicon (se fornecido)
      if (theme.favicon) {
        const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (faviconLink) {
          faviconLink.href = theme.favicon;
        } else {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.href = theme.favicon;
          document.head.appendChild(link);
        }
      }
      
      logger.log(`✅ Tema aplicado: ${theme.nome} (${theme.cor_primaria})`);
      
      // Armazenar no localStorage para persistência
      if (typeof window !== 'undefined') {
        localStorage.setItem('tenant_theme', JSON.stringify(theme));
      }
    } catch (err) {
      logger.error('Erro ao aplicar tema:', err);
    }
  }, [theme]);

  // Log de erro se houver
  useEffect(() => {
    if (error) {
      logger.error('Erro ao carregar tema do tenant:', error);
    }
  }, [error]);

  return theme;
}

/**
 * Hook para verificar se o tema já foi carregado
 * Útil para evitar flash de conteúdo sem estilo (FOUC)
 */
export function useThemeReady(): boolean {
  const theme = useTenantTheme();
  return theme !== undefined;
}

/**
 * Hook para obter apenas a logo do tenant
 */
export function useTenantLogo(): string | null {
  const theme = useTenantTheme();
  return theme?.logo || null;
}

/**
 * Hook para obter apenas o nome da empresa
 */
export function useTenantName(): string {
  const theme = useTenantTheme();
  return theme?.nome || 'Ouvy';
}
