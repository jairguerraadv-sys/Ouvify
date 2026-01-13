'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  hover?: 'none' | 'lift' | 'glow' | 'subtle';
  className?: string;
}

export function CardEnhanced({
  children,
  variant = 'default',
  size = 'md',
  interactive = false,
  hover = 'subtle',
  className,
}: CardProps) {
  const variants = {
    default: 'bg-white border border-neutral-200',
    elevated: 'bg-white border border-neutral-200 shadow-lg',
    bordered: 'bg-transparent border-2 border-primary/30',
    ghost: 'bg-neutral-50/50 border border-transparent hover:border-neutral-200',
    gradient: 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200/50',
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const hoverEffects = {
    none: '',
    lift: 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
    glow: 'hover:shadow-neon hover:border-primary transition-all duration-300',
    subtle: 'hover:shadow-md transition-all duration-300',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        variants[variant],
        sizes[size],
        interactive && 'cursor-pointer',
        hover !== 'none' && hoverEffects[hover],
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeaderEnhanced({
  children,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn('pb-6 border-b border-neutral-200/50', className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContentEnhanced({
  children,
  className,
}: CardContentProps) {
  return (
    <div className={cn('pt-6', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooterEnhanced({
  children,
  className,
}: CardFooterProps) {
  return (
    <div className={cn('pt-6 border-t border-neutral-200/50', className)}>
      {children}
    </div>
  );
}

// Compound export
export const Card = Object.assign(CardEnhanced, {
  Header: CardHeaderEnhanced,
  Content: CardContentEnhanced,
  Footer: CardFooterEnhanced,
});

// For backward compatibility
export const CardHeader = CardHeaderEnhanced;
export const CardContent = CardContentEnhanced;
export const CardFooter = CardFooterEnhanced;
