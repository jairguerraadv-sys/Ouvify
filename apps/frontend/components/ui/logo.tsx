import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Tamanho do logo: sm (32px), md (40px), lg (48px), xl (64px) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Se deve incluir o texto "Ouvify" ao lado */
  showText?: boolean;
  /** Se deve ser clicável (link para homepage) */
  clickable?: boolean;
  /** Prioridade de carregamento (usar true apenas no Header) */
  priority?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Classes CSS para o texto */
  textClassName?: string;
}

const sizeMap = {
  sm: { logo: 32, text: 'text-xl' },     // 32px logo + texto 20px
  md: { logo: 40, text: 'text-2xl' },    // 40px logo + texto 24px (padrão)
  lg: { logo: 48, text: 'text-3xl' },    // 48px logo + texto 28px
  xl: { logo: 64, text: 'text-4xl' },    // 64px logo + texto 32px
};

export function Logo({
  size = 'md',
  showText = true,
  clickable = true,
  priority = false,
  className,
  textClassName,
}: LogoProps) {
  const { logo, text } = sizeMap[size];

  const content = (
    <div 
      className={cn(
        'inline-flex items-center gap-2',
        clickable && 'group cursor-pointer',
        className
      )}
    >
      <div 
        className="relative flex-shrink-0" 
        style={{ width: logo, height: logo }}
      >
        <Image 
          src="/logo.png" 
          alt="Ouvify Logo" 
          width={logo} 
          height={logo}
          className={cn(
            'object-contain',
            clickable && 'transition-transform group-hover:scale-105'
          )}
          priority={priority}
          quality={100}
        />
      </div>
      
      {showText && (
        <span 
          className={cn(
            text,
            'font-bold text-gradient-brand',
            textClassName
          )}
        >
          Ouvify
        </span>
      )}
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

// Export de variantes comuns para facilitar uso
export const LogoHeader = () => (
  <Logo size="md" showText priority />
);

export const LogoFooter = () => (
  <Logo size="md" showText />
);

export const LogoAuth = () => (
  <Logo size="lg" showText clickable className="justify-center" />
);

export const LogoError = () => (
  <Logo size="xl" showText clickable className="justify-center" />
);

export const LogoOnly = ({ size = 'md' }: Pick<LogoProps, 'size'>) => (
  <Logo size={size} showText={false} clickable={false} />
);

export const LogoSidebar = () => (
  <Logo size="md" showText priority className="justify-start" />
);

export const LogoMobile = () => (
  <Logo size="sm" showText priority />
);

export const LogoCompact = () => (
  <Logo size="sm" showText={false} clickable />
);

// Dark variant for dark backgrounds
export const LogoDark = ({ size = 'md' }: Pick<LogoProps, 'size'>) => (
  <Logo size={size} showText textClassName="text-white" />
);
