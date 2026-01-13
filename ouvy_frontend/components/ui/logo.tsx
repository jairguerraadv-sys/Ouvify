'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon-only';
  colorScheme?: 'default' | 'white' | 'dark';
  href?: string;
  linkTo?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({
  className,
  variant = 'full',
  colorScheme = 'default',
  href = '/',
  linkTo,
  size = 'md'
}: LogoProps) {
  // Mapeamento de tamanhos proporcionais
  const sizeMap = {
    xs: { icon: 'w-5 h-5', text: 'text-base', gap: 'gap-1.5' },
    sm: { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-2' },
    md: { icon: 'w-8 h-8', text: 'text-2xl', gap: 'gap-2.5' },
    lg: { icon: 'w-10 h-10', text: 'text-3xl', gap: 'gap-3' },
    xl: { icon: 'w-12 h-12', text: 'text-4xl', gap: 'gap-3.5' },
  };

  // Cores baseadas no esquema (usando cores da logo)
  const colorClasses = {
    default: {
      icon: 'text-primary-500',  // Ciano da logo
      text: 'text-secondary-900', // Azul escuro da logo
    },
    white: {
      icon: 'text-white',
      text: 'text-white',
    },
    dark: {
      icon: 'text-primary-500',
      text: 'text-secondary-900',
    },
  };

  // Logo Icon - Ondas sonoras estilizadas (baseado na logo Ouvy)
  const LogoIcon = () => (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn(
        sizeMap[size].icon,
        colorClasses[colorScheme].icon,
        'transition-transform duration-300 hover:scale-105'
      )}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Onda 1 - Externa */}
      <path
        d="M10 20C10 13.37 15.37 8 22 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      {/* Onda 2 - Média */}
      <path
        d="M14 20C14 15.58 17.58 12 22 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Onda 3 - Interna */}
      <path
        d="M18 20C18 17.79 19.79 16 22 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* Ponto central */}
      <circle 
        cx="22" 
        cy="20" 
        r="2.5" 
        fill="currentColor"
      />
    </svg>
  );

  // Texto "ouvy" com tipografia moderna
  const LogoText = () => (
    <span 
      className={cn(
        sizeMap[size].text,
        colorClasses[colorScheme].text,
        'font-bold tracking-tight leading-none'
      )}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      ouvy
    </span>
  );

  // Conteúdo baseado em variant
  const content = (
    <>
      {variant === 'full' ? (
        <div className={cn('inline-flex items-center', sizeMap[size].gap, className)}>
          <LogoIcon />
          <LogoText />
        </div>
      ) : (
        <div className={cn('inline-flex items-center', className)}>
          <LogoIcon />
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
        className="inline-flex items-center hover:opacity-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
        aria-label="Ouvy - Canal de Ética"
      >
        {content}
      </Link>
    );
  }

  return <div className="inline-flex">{content}</div>;
}

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
