'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ConsentGate from '@/components/consent/ConsentGate';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// ============================================
// DASHBOARD PAGE HEADER
// ============================================

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

/**
 * Header padronizado para páginas do dashboard
 */
export function DashboardHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
}: DashboardHeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-2 text-sm text-text-tertiary">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                {crumb.href ? (
                  <a 
                    href={crumb.href} 
                    className="hover:text-primary-600 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-text-primary font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================
// DASHBOARD SECTION
// ============================================

interface DashboardSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Seção padronizada para agrupar conteúdo no dashboard
 */
export function DashboardSection({
  title,
  description,
  actions,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn('mb-8', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// ============================================
// DASHBOARD GRID
// ============================================

interface DashboardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * Grid responsivo para cards e widgets do dashboard
 */
export function DashboardGrid({
  children,
  columns = 4,
  className,
}: DashboardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={cn(
      'grid gap-4',
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
}

// ============================================
// DASHBOARD CARD
// ============================================

interface DashboardCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Card padronizado para o dashboard
 */
export function DashboardCard({
  title,
  description,
  icon,
  actions,
  children,
  className,
  noPadding = false,
}: DashboardCardProps) {
  return (
    <div className={cn(
      'bg-background border border-border-light rounded-xl shadow-sm',
      className
    )}>
      {(title || icon || actions) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-semibold text-text-primary">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-text-secondary">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={cn(!noPadding && 'p-5')}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD STAT
// ============================================

interface DashboardStatProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  className?: string;
}

/**
 * Card de estatística para KPIs
 */
export function DashboardStat({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  className,
}: DashboardStatProps) {
  const trendColors = {
    up: 'text-success-600 bg-success-50',
    down: 'text-error-600 bg-error-50',
    neutral: 'text-text-secondary bg-background-secondary',
  };
  
  return (
    <div className={cn(
      'bg-background border border-border-light rounded-xl p-5 shadow-sm',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-tertiary">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-text-primary">
            {value}
          </p>
        </div>
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            {icon}
          </div>
        )}
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            trendColors[trend]
          )}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// DASHBOARD EMPTY STATE
// ============================================

interface DashboardEmptyProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Estado vazio padronizado para listas/tabelas
 */
export function DashboardEmpty({
  icon,
  title,
  description,
  action,
  className,
}: DashboardEmptyProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 text-center',
      className
    )}>
      {icon && (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-background-secondary text-text-tertiary mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-text-secondary max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ============================================
// DASHBOARD LAYOUT (WRAPPER)
// ============================================

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Layout wrapper para páginas do dashboard
 * Inclui sidebar, área de conteúdo principal e gate de consentimento LGPD
 */
export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <ConsentGate>
        <div className="flex min-h-screen bg-background-secondary">
          <Sidebar user={user || undefined} />
          <main className={cn(
            'flex-1 overflow-auto',
            'px-6 py-8',
            className
          )}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </ConsentGate>
    </ProtectedRoute>
  );
}

export default DashboardLayout;
