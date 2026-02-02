'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// PAGE LAYOUT
// ============================================

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  /** Background variant */
  variant?: 'default' | 'secondary' | 'tertiary';
}

/**
 * PageLayout - Container principal da página
 * 
 * @usage
 * ```tsx
 * <PageLayout variant="secondary">
 *   <PageHeader title="Feedbacks" />
 *   <PageContent>...</PageContent>
 * </PageLayout>
 * ```
 */
export function PageLayout({ 
  children, 
  className,
  variant = 'secondary' 
}: PageLayoutProps) {
  const bgClass = {
    default: 'bg-background',
    secondary: 'bg-background-secondary',
    tertiary: 'bg-background-tertiary',
  };

  return (
    <div className={cn('min-h-screen', bgClass[variant], className)}>
      {children}
    </div>
  );
}

// ============================================
// PAGE CONTENT
// ============================================

interface PageContentProps {
  children: ReactNode;
  className?: string;
  /** Max width variant */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  /** Padding variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * PageContent - Container de conteúdo com espaçamento padrão
 */
export function PageContent({ 
  children, 
  className,
  maxWidth = '7xl',
  padding = 'md'
}: PageContentProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClass = {
    none: '',
    sm: 'py-4 px-4 sm:px-6',
    md: 'py-6 px-4 sm:px-6 lg:px-8',
    lg: 'py-8 px-4 sm:px-6 lg:px-8',
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClass[maxWidth],
      paddingClass[padding],
      className
    )}>
      {children}
    </div>
  );
}

// ============================================
// PAGE SECTION
// ============================================

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Background variant */
  variant?: 'default' | 'muted' | 'card';
}

/**
 * PageSection - Seção dentro de uma página com título opcional
 */
export function PageSection({ 
  children, 
  className,
  title,
  description,
  variant = 'default'
}: PageSectionProps) {
  const variantClass = {
    default: '',
    muted: 'bg-background-secondary rounded-lg p-6',
    card: 'bg-background rounded-lg border border-border-light p-6 shadow-sm',
  };

  return (
    <section className={cn('mb-8', variantClass[variant], className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// ============================================
// PAGE GRID
// ============================================

interface PageGridProps {
  children: ReactNode;
  className?: string;
  /** Number of columns */
  cols?: 1 | 2 | 3 | 4;
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * PageGrid - Grid responsivo para cards e itens
 */
export function PageGrid({ 
  children, 
  className,
  cols = 3,
  gap = 'md'
}: PageGridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapClass = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={cn(
      'grid',
      colsClass[cols],
      gapClass[gap],
      className
    )}>
      {children}
    </div>
  );
}

// ============================================
// PAGE DIVIDER
// ============================================

interface PageDividerProps {
  className?: string;
  /** Spacing around divider */
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * PageDivider - Divisor horizontal entre seções
 */
export function PageDivider({ className, spacing = 'md' }: PageDividerProps) {
  const spacingClass = {
    sm: 'my-4',
    md: 'my-6',
    lg: 'my-8',
  };

  return (
    <hr className={cn(
      'border-t border-border-light',
      spacingClass[spacing],
      className
    )} />
  );
}

// ============================================
// EXPORTS
// ============================================

export {
  PageLayout as default,
};
