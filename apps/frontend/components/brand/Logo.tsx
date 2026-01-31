'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type LogoVariant = 'full' | 'icon' | 'text';
export type LogoColor = 'default' | 'white' | 'dark';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface LogoProps {
  /** Variante do logo */
  variant?: LogoVariant;
  /** Esquema de cores */
  color?: LogoColor;
  /** Tamanho do logo */
  size?: LogoSize;
  /** URL de destino (null para não ser clicável) */
  href?: string | null;
  /** Classes CSS adicionais */
  className?: string;
  /** Prioridade de carregamento (LCP) */
  priority?: boolean;
  /** Mostrar animação de hover */
  animated?: boolean;
}

// ============================================
// SIZE CONFIGURATIONS
// ============================================

// Dimensões para logo completo (proporção ~2:1)
const fullSizeMap = {
  xs: { height: 24, width: 48 },     // Mobile menu, badges
  sm: { height: 32, width: 64 },     // Header mobile
  md: { height: 40, width: 80 },     // Header desktop
  lg: { height: 48, width: 96 },     // Auth pages
  xl: { height: 64, width: 128 },    // Error pages
  '2xl': { height: 80, width: 160 }, // Hero sections
};

// Dimensões para apenas ícone (proporção 1:1)
const iconSizeMap = {
  xs: { height: 20, width: 20 },
  sm: { height: 24, width: 24 },
  md: { height: 32, width: 32 },
  lg: { height: 40, width: 40 },
  xl: { height: 48, width: 48 },
  '2xl': { height: 64, width: 64 },
};

// Dimensões para apenas texto (proporção ~4:1)
const textSizeMap = {
  xs: { height: 16, width: 64 },
  sm: { height: 20, width: 80 },
  md: { height: 24, width: 96 },
  lg: { height: 32, width: 128 },
  xl: { height: 40, width: 160 },
  '2xl': { height: 48, width: 192 },
};

// ============================================
// LOGO COMPONENT
// ============================================

/**
 * Logo - Componente de marca Ouvify
 * 
 * @example
 * ```tsx
 * // Logo completo no header
 * <Logo variant="full" size="md" priority />
 * 
 * // Apenas ícone na sidebar colapsada
 * <Logo variant="icon" size="sm" />
 * 
 * // Logo branco em fundo escuro
 * <Logo variant="full" color="white" />
 * 
 * // Logo não clicável
 * <Logo variant="full" href={null} />
 * ```
 */
export function Logo({
  variant = 'full',
  color = 'default',
  size = 'md',
  href = '/',
  className,
  priority = false,
  animated = true,
}: LogoProps) {
  // Selecionar mapa de tamanhos baseado na variante
  const sizeMap = variant === 'icon' 
    ? iconSizeMap 
    : variant === 'text' 
      ? textSizeMap 
      : fullSizeMap;
  
  const { height, width } = sizeMap[size];
  
  // Determinar arquivo de imagem
  // Por enquanto usa logo.png, mas estrutura permite variantes futuras
  const getLogoSrc = () => {
    // Estrutura preparada para múltiplos arquivos:
    // /logo/logo-full.svg, /logo/logo-icon.svg, /logo/logo-text.svg
    // /logo/logo-full-white.svg, etc.
    
    // Fallback para logo atual enquanto não há variantes
    if (variant === 'full') {
      return color === 'white' ? '/logo/logo-white.png' : '/logo.png';
    }
    if (variant === 'icon') {
      return color === 'white' ? '/logo/icon-white.png' : '/logo/icon.png';
    }
    if (variant === 'text') {
      return color === 'white' ? '/logo/text-white.png' : '/logo/text.png';
    }
    return '/logo.png';
  };

  const logoContent = (
    <div 
      className={cn(
        'inline-flex items-center',
        href && animated && 'group cursor-pointer',
        className
      )}
    >
      <Image 
        src={getLogoSrc()}
        alt="Ouvify"
        width={width}
        height={height}
        className={cn(
          'object-contain',
          href && animated && 'transition-transform duration-200 group-hover:scale-105'
        )}
        priority={priority}
        quality={90}
        // Fallback se imagem não existir
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== '/logo.png') {
            target.src = '/logo.png';
          }
        }}
      />
    </div>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        aria-label="Ouvify - Ir para página inicial"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

// ============================================
// PRE-CONFIGURED VARIANTS
// ============================================

/** Logo para Header principal (marketing) */
export function LogoHeader({ className }: { className?: string }) {
  return (
    <Logo 
      variant="full" 
      size="md" 
      priority 
      className={className}
    />
  );
}

/** Logo para Header mobile */
export function LogoHeaderMobile({ className }: { className?: string }) {
  return (
    <Logo 
      variant="full" 
      size="sm" 
      priority 
      className={className}
    />
  );
}

/** Logo para Footer */
export function LogoFooter({ className }: { className?: string }) {
  return (
    <Logo 
      variant="full" 
      size="sm" 
      href={null}
      className={className}
    />
  );
}

/** Logo para páginas de autenticação */
export function LogoAuth({ className }: { className?: string }) {
  return (
    <Logo 
      variant="full" 
      size="lg" 
      href={null}
      className={cn('justify-center', className)}
    />
  );
}

/** Logo para Sidebar expandida */
export function LogoSidebar({ className }: { className?: string }) {
  return (
    <Logo 
      variant="full" 
      size="sm" 
      priority 
      className={className}
    />
  );
}

/** Logo ícone para Sidebar colapsada */
export function LogoSidebarCollapsed({ className }: { className?: string }) {
  return (
    <Logo 
      variant="icon" 
      size="md" 
      priority 
      className={className}
    />
  );
}

/** Logo para páginas de erro (404, 500) */
export function LogoError({ className }: { className?: string }) {
  return (
    <Logo 
      variant="full" 
      size="xl" 
      href={null}
      className={cn('justify-center', className)}
    />
  );
}

/** Logo grande para hero sections */
export function LogoHero({ className }: { className?: string }) {
  return (
    <Logo 
      variant="full" 
      size="2xl" 
      href={null}
      animated={false}
      className={cn('justify-center', className)}
    />
  );
}

/** Logo branco para fundos escuros */
export function LogoWhite({ 
  size = 'md',
  className 
}: { 
  size?: LogoSize;
  className?: string;
}) {
  return (
    <Logo 
      variant="full" 
      color="white"
      size={size}
      className={className}
    />
  );
}

// ============================================
// POWERED BY OUVIFY
// ============================================

interface PoweredByOuvifyProps {
  className?: string;
  /** Tamanho do texto */
  size?: 'sm' | 'md';
}

/**
 * PoweredByOuvify - Badge "Powered by Ouvify" para white label
 * 
 * @example
 * ```tsx
 * <PoweredByOuvify />
 * ```
 */
export function PoweredByOuvify({ 
  className,
  size = 'sm' 
}: PoweredByOuvifyProps) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const logoSize = size === 'sm' ? 'xs' : 'sm';
  
  return (
    <div className={cn(
      'flex items-center gap-1.5',
      textSize,
      'text-gray-400',
      className
    )}>
      <span>Powered by</span>
      <Logo 
        variant="text" 
        size={logoSize} 
        href="https://ouvify.com.br"
        animated={false}
      />
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export default Logo;
