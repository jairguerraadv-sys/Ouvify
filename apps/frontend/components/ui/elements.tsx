'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className,
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    error: 'bg-error/10 text-error border border-error/20',
    info: 'bg-info/10 text-info border border-info/20',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs font-semibold',
    md: 'px-3 py-1.5 text-sm font-semibold',
    lg: 'px-4 py-2 text-base font-semibold',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full transition-colors duration-200 hover:opacity-80',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
}

interface AlertProps {
  title?: string;
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  title,
  children,
  variant = 'info',
  icon,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false);

  const variantClasses = {
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    error: 'bg-error/10 border-error/20 text-error',
    info: 'bg-info/10 border-info/20 text-info',
  };

  if (dismissed) return null;

  return (
    <div className={cn(
      'flex items-start gap-4 p-4 rounded-lg border',
      variantClasses[variant],
      className
    )}>
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}

interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Progress({
  value,
  max = 100,
  showLabel = true,
  variant = 'primary',
  size = 'md',
  className,
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-accent',
    success: 'bg-gradient-to-r from-success to-green-400',
    warning: 'bg-gradient-to-r from-warning to-yellow-400',
    error: 'bg-gradient-to-r from-error to-red-400',
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn(
        'w-full bg-neutral-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-sm font-medium text-neutral-600">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

interface PricingCardProps {
  name: string;
  price: string | number;
  currency?: string;
  period?: string;
  description?: string;
  features: (string | { label: string; included: boolean })[];
  highlighted?: boolean;
  cta?: {
    label: string;
    onClick?: () => void;
  };
  badge?: string;
  className?: string;
}

export function PricingCard({
  name,
  price,
  currency = 'R$',
  period = '/mês',
  description,
  features,
  highlighted = false,
  cta,
  badge,
  className,
}: PricingCardProps) {
  return (
    <div className={cn(
      'relative rounded-2xl border transition-all duration-300',
      highlighted
        ? 'border-primary bg-gradient-to-br from-primary/5 to-accent/5 shadow-xl scale-105'
        : 'border-neutral-200 bg-white shadow-subtle hover:shadow-lg'
    )}>
      {/* Badge */}
      {badge && highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-bold">
            {badge}
          </span>
        </div>
      )}

      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold text-secondary">{name}</h3>
          {description && (
            <p className="text-neutral-600 text-sm mt-2">{description}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              {price}
            </span>
            {currency && <span className="text-neutral-600">{currency}</span>}
          </div>
          {period && <p className="text-neutral-600 text-sm">{period}</p>}
        </div>

        {/* CTA */}
        {cta && (
          <button
            onClick={cta.onClick}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200',
              highlighted
                ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg'
                : 'bg-neutral-100 text-secondary hover:bg-neutral-200'
            )}
          >
            {cta.label}
          </button>
        )}

        {/* Features */}
        <div className="space-y-3 border-t border-neutral-200 pt-6">
          {features.map((feature, idx) => {
            const isIncluded = typeof feature === 'string' ? true : feature.included;
            const label = typeof feature === 'string' ? feature : feature.label;

            return (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-3 text-sm',
                  isIncluded ? 'text-neutral-700' : 'text-neutral-400 line-through'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
                  isIncluded
                    ? 'bg-success/10 text-success'
                    : 'bg-neutral-200'
                )}>
                  {isIncluded && '✓'}
                </div>
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
