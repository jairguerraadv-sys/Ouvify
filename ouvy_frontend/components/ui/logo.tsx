'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'icon-only' | 'full';
  linkTo?: string;
  darkMode?: boolean;
}

export function Logo({
  className,
  width = 180,
  height = 45,
  variant = 'full',
  linkTo = '/',
  darkMode = false
}: LogoProps) {
  const LogoContent = () => {
    if (variant === 'full') {
      return (
        <div className={cn('flex items-center', className)}>
          <Image
            src="/logo.png"
            alt="Ouvy - Canal de Ética Profissional"
            width={width}
            height={height}
            className="w-auto h-auto"
            priority
          />
        </div>
      );
    } else {
      // Icon only: usa apenas o favicon
      return (
        <div className={cn('flex items-center', className)}>
          <Image
            src="/favicon-32x32.png"
            alt="Ouvy"
            width={32}
            height={32}
            className="w-8 h-8"
            priority
          />
        </div>
      );
    }
  };

  // Fallback: Logo com ícone + texto
  const FallbackLogo = () => (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Ícone de Ondas Sonoras */}
      <div className="relative">
        <MessageSquare 
          className={cn(
            'w-8 h-8',
            darkMode ? 'text-cyan-400' : 'text-cyan-500'
          )} 
        />
        {/* Decoração: círculos de propagação */}
        <div className={cn(
          'absolute -top-1 -left-1 w-10 h-10 rounded-full border-2 opacity-30 animate-pulse',
          darkMode ? 'border-cyan-400' : 'border-cyan-500'
        )} />
      </div>

      {/* Texto "Ouvy" */}
      {variant === 'full' && (
        <span className={cn(
          'text-2xl font-bold tracking-tight',
          darkMode
            ? 'text-white'
            : 'bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'
        )}>
          Ouvy
        </span>
      )}
    </div>
  );

  // Se tiver link, envolve em <Link>
  if (linkTo) {
    return (
      <Link href={linkTo} className="inline-flex items-center">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
