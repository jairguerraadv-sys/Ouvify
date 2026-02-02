'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// LOADING STATE (Spinner with text)
// ============================================

interface LoadingStateProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional loading text */
  text?: string;
  /** Centered in parent container */
  centered?: boolean;
  /** Full screen overlay */
  fullScreen?: boolean;
  /** Additional classes */
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

/**
 * LoadingState - Spinner com texto opcional
 * 
 * @usage
 * ```tsx
 * // Simple spinner
 * <LoadingState />
 * 
 * // With text
 * <LoadingState text="Carregando feedbacks..." />
 * 
 * // Centered in container
 * <LoadingState centered text="Aguarde..." />
 * 
 * // Full screen overlay
 * <LoadingState fullScreen text="Processando..." />
 * ```
 */
export function LoadingState({ 
  size = 'md', 
  text, 
  centered = false,
  fullScreen = false,
  className 
}: LoadingStateProps) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      centered && 'py-12',
      className
    )}>
      <Loader2 
        className={cn(
          'animate-spin text-primary-500',
          sizeClasses[size]
        )} 
        aria-hidden="true"
      />
      {text && (
        <p className={cn(
          'text-text-secondary font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
      <span className="sr-only">{text || 'Carregando...'}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        {content}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite">
      {content}
    </div>
  );
}

// ============================================
// LOADING SPINNER (Simple inline spinner)
// ============================================

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Custom color class */
  color?: string;
  /** Additional classes */
  className?: string;
}

/**
 * LoadingSpinner - Simple inline spinner for buttons etc
 */
export function LoadingSpinner({ 
  size = 'sm', 
  color = 'text-current',
  className 
}: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        color,
        className
      )}
      aria-hidden="true"
    />
  );
}

// ============================================
// LOADING DOTS (Animated dots)
// ============================================

/**
 * LoadingDots - Animated dots loading indicator
 */
export function LoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn('loading-dots inline-flex items-center gap-1', className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full bg-current',
            'animate-pulse'
          )}
        />
      ))}
    </span>
  );
}

// ============================================
// PAGE LOADING (Full page loading state)
// ============================================

interface PageLoadingProps {
  /** Loading message */
  message?: string;
}

/**
 * PageLoading - Full page loading state with centered spinner
 */
export function PageLoading({ message = 'Carregando...' }: PageLoadingProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <LoadingState size="lg" text={message} centered />
    </div>
  );
}

// ============================================
// BUTTON LOADING STATE
// ============================================

interface ButtonLoadingProps {
  /** Loading state */
  loading?: boolean;
  /** Normal button text */
  children: React.ReactNode;
  /** Loading text (optional, defaults to children) */
  loadingText?: string;
}

/**
 * ButtonLoadingContent - Content for buttons with loading state
 * 
 * @usage
 * ```tsx
 * <Button disabled={isLoading}>
 *   <ButtonLoadingContent loading={isLoading}>
 *     Salvar
 *   </ButtonLoadingContent>
 * </Button>
 * ```
 */
export function ButtonLoadingContent({ 
  loading, 
  children, 
  loadingText 
}: ButtonLoadingProps) {
  if (loading) {
    return (
      <>
        <LoadingSpinner size="sm" className="mr-2" />
        <span>{loadingText || children}</span>
      </>
    );
  }
  
  return <>{children}</>;
}

// ============================================
// EXPORTS
// ============================================

export default LoadingState;
