'use client';

import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function ButtonEnhanced({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:from-primary/90 hover:to-accent/90 active:from-primary/80 active:to-accent/80',
    secondary:
      'bg-neutral-100 text-secondary hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200',
    outline:
      'border-2 border-primary text-primary hover:bg-primary/5 active:bg-primary/10',
    ghost:
      'text-secondary hover:bg-neutral-100 active:bg-neutral-200',
    danger:
      'bg-gradient-to-r from-error to-red-500 text-white hover:shadow-lg active:opacity-90',
    success:
      'bg-gradient-to-r from-success to-green-400 text-white hover:shadow-lg active:opacity-90',
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs font-medium',
    sm: 'px-3 py-1.5 text-sm font-medium',
    md: 'px-4 py-2.5 text-base font-semibold',
    lg: 'px-6 py-3 text-lg font-semibold',
    xl: 'px-8 py-4 text-xl font-bold',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin-slow w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.25"
          />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {icon && iconPosition === 'left' && !isLoading && (
        <span className="flex-shrink-0">{icon}</span>
      )}

      <span>{children}</span>

      {icon && iconPosition === 'right' && !isLoading && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
}

export const Button = ButtonEnhanced;
