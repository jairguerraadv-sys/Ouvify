'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoEnhancedProps {
  className?: string;
  variant?: 'full' | 'icon-only' | 'text-only' | 'stacked';
  colorScheme?: 'auto' | 'primary' | 'white' | 'dark' | 'gradient';
  href?: string;
  linkTo?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showTagline?: boolean;
}

export function LogoEnhanced({
  className,
  variant = 'full',
  colorScheme = 'auto',
  href = '/',
  linkTo,
  size = 'md',
  animated = false,
  showTagline = false,
}: LogoEnhancedProps) {
  // Mapeamento de tamanhos com escalas responsivas
  const sizeMap = {
    xs: { icon: 'w-4 h-4', text: 'text-sm', container: 'gap-1.5' },
    sm: { icon: 'w-5 h-5', text: 'text-base', container: 'gap-2' },
    md: { icon: 'w-8 h-8', text: 'text-lg', container: 'gap-2' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', container: 'gap-3' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', container: 'gap-4' },
  };

  // Cores baseadas no esquema
  const colorClassMap = {
    auto: { icon: 'text-primary', text: 'text-secondary' },
    primary: { icon: 'text-primary', text: 'text-secondary' },
    white: { icon: 'text-white', text: 'text-white' },
    dark: { icon: 'text-secondary', text: 'text-secondary' },
    gradient: { icon: 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent', text: 'text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary' },
  };

  // Ícone SVG otimizado (Ondas Sonoras)
  const SonicWaveIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        sizeMap[size].icon,
        colorClassMap[colorScheme].icon,
        animated && 'animate-pulse',
      )}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ondas sonoras dinâmicas */}
      <g opacity="0.5">
        <path
          d="M6 15C6 11.686 8.686 9 12 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g opacity="0.3">
        <path
          d="M2 15C2 9.477 6.477 5 12 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M12 21C10.343 21 9 19.657 9 18C9 16.343 10.343 15 12 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );

  // Texto com tipografia elegante
  const LogoText = () => (
    <span className={cn(
      sizeMap[size].text,
      colorClassMap[colorScheme].text,
      'font-bold tracking-tight',
      variant === 'stacked' && 'block'
    )}>
      Ouvy
    </span>
  );

  // Tagline opcional
  const Tagline = () => (
    <span className={cn(
      'text-xs font-medium opacity-70',
      colorClassMap[colorScheme].text,
      'tracking-wide uppercase'
    )}>
      Ética & Conformidade
    </span>
  );

  // Renderizar conteúdo conforme o variant
  const renderContent = () => {
    switch (variant) {
      case 'icon-only':
        return <SonicWaveIcon />;
      case 'text-only':
        return (
          <div className="flex flex-col gap-1">
            <LogoText />
            {showTagline && <Tagline />}
          </div>
        );
      case 'stacked':
        return (
          <div className={cn('flex flex-col items-center', sizeMap[size].container)}>
            <SonicWaveIcon />
            <div className="flex flex-col items-center gap-0.5">
              <LogoText />
              {showTagline && <Tagline />}
            </div>
          </div>
        );
      case 'full':
      default:
        return (
          <div className={cn('flex items-center', sizeMap[size].container)}>
            <SonicWaveIcon />
            <div className="flex flex-col gap-0.5">
              <LogoText />
              {showTagline && <Tagline />}
            </div>
          </div>
        );
    }
  };

  const targetHref = linkTo ?? href;
  const content = renderContent();

  if (targetHref) {
    return (
      <Link
        href={targetHref}
        className={cn(
          'inline-flex items-center transition-all duration-200',
          'hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg',
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={cn('inline-flex items-center', className)}>{content}</div>;
}
