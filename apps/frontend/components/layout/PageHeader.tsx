/**
 * PageHeader Component - Ouvy SaaS
 * Sprint 5 - Feature 5.4: Melhorias UX
 * 
 * Componente de cabeçalho de página com breadcrumbs, título e ações
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  showBackButton,
  backHref,
  onBack,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      window.location.href = backHref;
    } else {
      window.history.back();
    }
  };

  return (
    <div className={cn('space-y-4 pb-4', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-4 w-4" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {badge}
            </div>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Stats Banner para exibir estatísticas rápidas
interface StatItem {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
}

interface StatsBannerProps {
  stats: StatItem[];
  className?: string;
}

export function StatsBanner({ stats, className }: StatsBannerProps) {
  return (
    <div className={cn(
      'grid gap-4 rounded-lg border bg-card p-4',
      stats.length === 2 && 'grid-cols-2',
      stats.length === 3 && 'grid-cols-3',
      stats.length >= 4 && 'grid-cols-2 sm:grid-cols-4',
      className
    )}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p className="text-2xl font-bold">{stat.value}</p>
          {stat.change && (
            <p className={cn(
              'text-xs',
              stat.change.type === 'increase' && 'text-green-600',
              stat.change.type === 'decrease' && 'text-red-600',
              stat.change.type === 'neutral' && 'text-muted-foreground',
            )}>
              {stat.change.type === 'increase' && '+'}
              {stat.change.value}%
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Filter Bar para páginas de listagem
interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div className={cn(
      'flex flex-wrap items-center gap-2 p-4 rounded-lg border bg-card',
      className
    )}>
      {children}
    </div>
  );
}

// Quick Actions para ações rápidas contextuais
interface QuickAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outline'}
          size="sm"
          onClick={action.onClick}
          className="gap-2"
        >
          {action.icon}
          <span className="hidden sm:inline">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}

export default PageHeader;
