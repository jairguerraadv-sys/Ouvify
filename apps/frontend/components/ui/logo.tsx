import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Altura do logo: sm (32px), md (40px), lg (48px), xl (64px), 2xl (80px) */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Se deve ser clicável (link para homepage) */
  clickable?: boolean;
  /** Prioridade de carregamento (usar true apenas no Header) */
  priority?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

// Logo completo (ícone + texto) tem proporção ~1.87:1
// Altura -> Largura calculada automaticamente
const sizeMap = {
  sm: { height: 32, width: 60 },      // Pequeno - mobile, compacto
  md: { height: 40, width: 75 },      // Padrão - header, sidebar
  lg: { height: 48, width: 90 },      // Grande - auth pages
  xl: { height: 64, width: 120 },     // Extra grande - error pages
  '2xl': { height: 80, width: 150 },  // Hero sections
};

// Usar versões otimizadas do logo
const LOGO_SRC = '/logo/logo-full.png';

export function Logo({
  size = 'md',
  clickable = true,
  priority = false,
  className,
}: LogoProps) {
  const { height, width } = sizeMap[size];

  const content = (
    <div 
      className={cn(
        'inline-flex items-center',
        clickable && 'group cursor-pointer',
        className
      )}
    >
      <Image 
        src={LOGO_SRC}
        alt="Ouvify - Canal de Ética Profissional" 
        width={width} 
        height={height}
        className={cn(
          'object-contain',
          clickable && 'transition-transform group-hover:scale-105'
        )}
        priority={priority}
        quality={90}
      />
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" aria-label="Ouvify - Voltar para página inicial">
        {content}
      </Link>
    );
  }

  return content;
}

// ============================================
// VARIANTES PRÉ-CONFIGURADAS
// ============================================

/** Logo para o Header principal (marketing) */
export const LogoHeader = () => (
  <Logo size="md" priority />
);

/** Logo para o Footer */
export const LogoFooter = () => (
  <Logo size="md" />
);

/** Logo para páginas de autenticação (login, cadastro) */
export const LogoAuth = () => (
  <Logo size="lg" className="justify-center" />
);

/** Logo para páginas de erro (404, 500) */
export const LogoError = () => (
  <Logo size="xl" className="justify-center" />
);

/** Logo para a Sidebar do dashboard */
export const LogoSidebar = () => (
  <Logo size="md" priority className="justify-start" />
);

/** Logo compacto para mobile */
export const LogoMobile = () => (
  <Logo size="sm" priority />
);

/** Logo grande para hero sections */
export const LogoHero = () => (
  <Logo size="2xl" clickable={false} className="justify-center" />
);

/** Logo não clicável (decorativo) */
export const LogoStatic = ({ size = 'md' }: Pick<LogoProps, 'size'>) => (
  <Logo size={size} clickable={false} />
);

export default Logo;
