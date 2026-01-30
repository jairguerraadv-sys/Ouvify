'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

// ============================================
// TYPES
// ============================================

interface PageHeaderAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
}

interface PageHeaderProps {
  /** Main title */
  title: string;
  /** Optional subtitle/description */
  description?: string;
  /** Back button link */
  backHref?: string;
  /** Back button label (default: "Voltar") */
  backLabel?: string;
  /** Primary action button */
  action?: PageHeaderAction;
  /** Secondary actions */
  secondaryActions?: PageHeaderAction[];
  /** Breadcrumb items */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Badge/status next to title */
  badge?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Children for custom content */
  children?: React.ReactNode;
}

// ============================================
// COMPONENT
// ============================================

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = 'Voltar',
  action,
  secondaryActions,
  breadcrumbs,
  badge,
  className,
  children,
}: PageHeaderProps) {
  const renderAction = (actionConfig: PageHeaderAction, index?: number) => {
    const buttonVariant = actionConfig.variant || 'default';
    const Icon = actionConfig.icon;
    
    const buttonContent = (
      <>
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {actionConfig.label}
      </>
    );

    if (actionConfig.href) {
      return (
        <Button 
          key={index}
          variant={buttonVariant} 
          asChild
          disabled={actionConfig.disabled}
        >
          <Link href={actionConfig.href}>{buttonContent}</Link>
        </Button>
      );
    }
    
    return (
      <Button 
        key={index}
        variant={buttonVariant} 
        onClick={actionConfig.onClick}
        disabled={actionConfig.disabled || actionConfig.loading}
      >
        {actionConfig.loading ? (
          <>
            <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {actionConfig.label}
          </>
        ) : buttonContent}
      </Button>
    );
  };

  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav 
          className="flex items-center gap-2 text-sm text-gray-500 mb-3"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-300">/</span>}
              {crumb.href ? (
                <Link 
                  href={crumb.href}
                  className="hover:text-primary-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Back button */}
      {backHref && (
        <Link 
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
      )}

      {/* Main content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-gray-900">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-gray-500 text-sm sm:text-base">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {(action || secondaryActions) && (
          <div className="flex flex-wrap items-center gap-2">
            {secondaryActions?.map((act, index) => renderAction(act, index))}
            {action && renderAction(action)}
          </div>
        )}
      </div>

      {/* Custom children */}
      {children}
    </div>
  );
}

// ============================================
// VARIANTS
// ============================================

export function DashboardPageHeader({
  title,
  description,
  action,
  children,
}: Pick<PageHeaderProps, 'title' | 'description' | 'action' | 'children'>) {
  return (
    <PageHeader
      title={title}
      description={description}
      action={action}
      className="border-b border-gray-200 pb-6"
    >
      {children}
    </PageHeader>
  );
}

export function SettingsPageHeader({
  title,
  description,
}: Pick<PageHeaderProps, 'title' | 'description'>) {
  return (
    <PageHeader
      title={title}
      description={description}
      backHref="/dashboard"
      backLabel="Voltar ao Dashboard"
    />
  );
}

export default PageHeader;
