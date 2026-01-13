'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Waves } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'full' | 'icon' | 'text' | 'icon-only';
  linkTo?: string;
  darkMode?: boolean;
  colorScheme?: 'auto' | 'primary' | 'white';
}

export function Logo({
  className,
  width = 180,
  height = 45,
  variant = 'full',
  linkTo = '/',
  darkMode = false,
  colorScheme = 'auto'
}: LogoProps) {
  // Determina as cores baseado no esquema
  const isDark = colorScheme === 'white' ? false : darkMode;
  
  const iconColorClass = {
    auto: isDark ? 'text-cyan-400' : 'text-cyan-500',
    primary: 'text-cyan-500',
    white: 'text-white'
  }[colorScheme];

  const textColorClass = {
    auto: isDark ? 'text-white' : 'text-slate-900',
    primary: 'text-slate-900',
    white: 'text-white'
  }[colorScheme];

  // SVG inline da onda sonora (ícone do Ouvy)
  const SonicWaveIcon = () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className={cn('w-8 h-8', iconColorClass)}
    >
      {/* Ondas sonoras em arco */}
      <path
        d="M8 16C8 12.686 10.686 10 14 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path
        d="M4 16C4 10.477 8.477 6 14 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
      <path
        d="M14 18C12.343 18 11 16.657 11 15C11 13.343 12.343 12 14 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 26C8.477 26 4 21.523 4 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
      <circle cx="14" cy="15" r="2" fill="currentColor" />
    </svg>
  );

  // Componente "Ouvy" com tipografia moderna
  const OuvyText = ({ className: textClass }: { className?: string }) => (
    <span className={cn(
      'text-2xl font-bold tracking-tight',
      textClass
    )}>
      Ouvy
    </span>
  );

  // Variantes de layout
  const LogoContent = () => {
    if (variant === 'icon' || variant === 'icon-only') {
      return (
        <div className={cn('flex items-center', className)}>
          <SonicWaveIcon />
        </div>
      );
    }

    if (variant === 'text') {
      return (
        <div className={cn('flex items-center', className)}>
          <OuvyText className={textColorClass} />
        </div>
      );
    }

    // Full variant: ícone + texto
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <SonicWaveIcon />
        <OuvyText className={textColorClass} />
      </div>
    );
  };

  // Se tiver logo.png em /public, usa ele como fallback
  const LogoImageFallback = () => (
    <Image
      src="/logo.png"
      alt="Ouvy - Canal de Ética Profissional"
      width={width}
      height={height}
      className="w-auto h-auto"
      priority
    />
  );

  // Wrapper com Link se necessário
  const content = (
    <>
      {/* Try usar a imagem PNG primeiro */}
      <div className="hidden">
        <LogoImageFallback />
      </div>
      {/* Fallback: ícone SVG + texto */}
      <LogoContent />
    </>
  );

  if (linkTo) {
    return (
      <Link href={linkTo} className="inline-flex items-center hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return <>{content}</>;
}
