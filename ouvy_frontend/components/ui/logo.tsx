'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon-only';
  colorScheme?: 'auto' | 'primary' | 'white';
  href?: string;
  linkTo?: string; // backward-compatible alias
  width?: number;  // optional explicit icon width (px)
  height?: number; // optional explicit icon height (px)
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({
  className,
  variant = 'full',
  colorScheme = 'auto',
  href = '/',
  linkTo,
  width,
  height,
  size = 'md'
}: LogoProps) {
  // Mapeamento de tamanhos
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
  };

  // Cores baseadas no esquema
  const colorMap = {
    auto: 'text-primary',
    primary: 'text-primary',
    white: 'text-white',
  };

  const textColorMap = {
    auto: 'text-secondary',
    primary: 'text-secondary',
    white: 'text-white',
  };

  // SVG Inline - Ondas Sonoras (Ícone da Logo)
  const SonicWaveIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn(sizeMap[size].icon, colorMap[colorScheme])}
      style={{
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ondas sonoras em arco */}
      <path
        d="M6 15C6 11.686 8.686 9 12 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path
        d="M2 15C2 9.477 6.477 5 12 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
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

  // Texto "Ouvy" com tipografia moderna
  const LogoText = () => (
    <span className={cn(
      sizeMap[size].text,
      textColorMap[colorScheme],
      'font-bold tracking-tight'
    )}>
      Ouvy
    </span>
  );

  // Conteúdo baseado em variant
  const content = (
    <>
      {variant === 'full' ? (
        <div className={cn('flex items-center gap-2', className)}>
          <SonicWaveIcon />
          <LogoText />
        </div>
      ) : (
        <div className={cn('flex items-center', className)}>
          <SonicWaveIcon />
        </div>
      )}
    </>
  );

  // Com ou sem Link
  const targetHref = linkTo ?? href;

  if (targetHref) {
    return (
      <Link 
        href={targetHref}
        className="inline-flex items-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        {content}
      </Link>
    );
  }

  return <>{content}</>;
}
