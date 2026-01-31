'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// SKIP LINK
// ============================================

interface SkipLinkProps {
  href?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Skip link para navegação por teclado
 * Aparece apenas quando recebe foco
 */
export function SkipLink({ 
  href = '#main-content', 
  children = 'Pular para o conteúdo principal',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-4 focus:left-4 focus:z-[9999]',
        'focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white',
        'focus:rounded-lg focus:shadow-lg focus:outline-none',
        'focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  );
}

// ============================================
// VISUALLY HIDDEN
// ============================================

interface VisuallyHiddenProps {
  children: ReactNode;
  /** Se deve ser visível apenas para screen readers */
  asSpan?: boolean;
}

/**
 * Esconde visualmente mas mantém acessível para screen readers
 */
export function VisuallyHidden({ children, asSpan = false }: VisuallyHiddenProps) {
  const Component = asSpan ? 'span' : 'div';
  
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

// ============================================
// LIVE REGION
// ============================================

interface LiveRegionProps {
  children: ReactNode;
  /** Politeness setting */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** Also announce when content changes */
  'aria-atomic'?: boolean;
  className?: string;
}

/**
 * Região live para anúncios de screen reader
 */
export function LiveRegion({ 
  children, 
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
}

// ============================================
// FOCUS TRAP
// ============================================

interface FocusTrapProps {
  children: ReactNode;
  /** Se o trap está ativo */
  active?: boolean;
  /** Retornar foco ao elemento original ao desativar */
  returnFocus?: boolean;
  /** Elemento a focar inicialmente */
  initialFocus?: React.RefObject<HTMLElement>;
  className?: string;
}

/**
 * Trap de foco para modais e dialogs
 */
export function FocusTrap({
  children,
  active = true,
  returnFocus = true,
  initialFocus,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Salvar elemento ativo atual
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focar elemento inicial ou primeiro focável
    const focusFirst = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else if (containerRef.current) {
        const focusable = getFocusableElements(containerRef.current);
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    };

    // Pequeno delay para garantir que o DOM está pronto
    const timeoutId = setTimeout(focusFirst, 10);

    return () => {
      clearTimeout(timeoutId);
      
      // Retornar foco ao elemento original
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, returnFocus, initialFocus]);

  // Handler para trap de foco
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!active || e.key !== 'Tab' || !containerRef.current) return;

    const focusable = getFocusableElements(containerRef.current);
    if (focusable.length === 0) return;

    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    // Tab + Shift: volta para o último
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    }
    // Tab: vai para o primeiro
    else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={className}
    >
      {children}
    </div>
  );
}

// ============================================
// FOCUS INDICATOR
// ============================================

interface FocusIndicatorProps {
  children: ReactNode;
  /** Estilo do indicador de foco */
  variant?: 'ring' | 'outline' | 'underline';
  /** Cor do indicador */
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

/**
 * Adiciona indicador de foco visível e customizável
 */
export function FocusIndicator({
  children,
  variant = 'ring',
  color = 'primary',
  className,
}: FocusIndicatorProps) {
  const focusStyles = {
    ring: {
      primary: 'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      secondary: 'focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2',
      white: 'focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800',
    },
    outline: {
      primary: 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2',
      secondary: 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary-500 focus-visible:outline-offset-2',
      white: 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2',
    },
    underline: {
      primary: 'focus-visible:underline focus-visible:decoration-primary-500 focus-visible:decoration-2 focus-visible:underline-offset-4',
      secondary: 'focus-visible:underline focus-visible:decoration-secondary-500 focus-visible:decoration-2 focus-visible:underline-offset-4',
      white: 'focus-visible:underline focus-visible:decoration-white focus-visible:decoration-2 focus-visible:underline-offset-4',
    },
  };

  return (
    <span className={cn(focusStyles[variant][color], className)}>
      {children}
    </span>
  );
}

// ============================================
// ANNOUNCE
// ============================================

interface AnnounceProps {
  message: string;
  /** Politeness */
  politeness?: 'polite' | 'assertive';
}

/**
 * Hook para anunciar mensagens para screen readers
 */
export function useAnnounce() {
  const announce = React.useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', politeness);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('class', 'sr-only');
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remover após anúncio
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, []);

  return announce;
}

/**
 * Componente para anúncios de screen reader
 */
export function Announce({ message, politeness = 'polite' }: AnnounceProps) {
  const announceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={announceRef}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

// ============================================
// HELPERS
// ============================================

/**
 * Retorna todos os elementos focáveis dentro de um container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
    .filter(el => el.offsetParent !== null); // Filtrar elementos ocultos
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

interface KeyboardNavProps {
  children: ReactNode;
  /** Orientação da navegação */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Callback quando item recebe foco */
  onFocus?: (index: number) => void;
  /** Loop ao chegar no final */
  loop?: boolean;
  className?: string;
}

/**
 * Wrapper para navegação por teclado (arrow keys)
 */
export function KeyboardNav({
  children,
  orientation = 'vertical',
  onFocus,
  loop = true,
  className,
}: KeyboardNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!containerRef.current) return;

    const focusable = getFocusableElements(containerRef.current);
    if (focusable.length === 0) return;

    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    let nextIndex = currentIndex;

    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    if ((e.key === 'ArrowDown' && isVertical) || (e.key === 'ArrowRight' && isHorizontal)) {
      e.preventDefault();
      nextIndex = currentIndex + 1;
      if (nextIndex >= focusable.length) {
        nextIndex = loop ? 0 : focusable.length - 1;
      }
    } else if ((e.key === 'ArrowUp' && isVertical) || (e.key === 'ArrowLeft' && isHorizontal)) {
      e.preventDefault();
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) {
        nextIndex = loop ? focusable.length - 1 : 0;
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = focusable.length - 1;
    }

    if (nextIndex !== currentIndex) {
      focusable[nextIndex].focus();
      onFocus?.(nextIndex);
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={className}
    >
      {children}
    </div>
  );
}
