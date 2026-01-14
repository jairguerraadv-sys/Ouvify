'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-primary text-primary-foreground shadow-sm hover:shadow-md',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:shadow-md',
      success: 'bg-success text-success-foreground shadow-sm hover:shadow-md',
      warning: 'bg-warning text-warning-foreground shadow-sm hover:shadow-md',
      error: 'bg-error text-error-foreground shadow-sm hover:shadow-md',
      info: 'bg-info text-info-foreground shadow-sm hover:shadow-md',
      outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5',
      ghost: 'border border-border/50 text-foreground bg-muted/30 hover:bg-muted/50',
    };

    const sizeStyles = {
      sm: 'px-2.5 py-1 text-xs font-semibold rounded-md',
      md: 'px-3 py-1.5 text-sm font-semibold rounded-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap transition-all duration-300',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        role="status"
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default';
  icon?: React.ReactNode;
  disabled?: boolean;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, onRemove, variant = 'default', icon, children, disabled = false, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-primary/90 text-primary-foreground hover:bg-primary shadow-sm',
      secondary: 'bg-secondary/90 text-secondary-foreground hover:bg-secondary shadow-sm',
      success: 'bg-success/90 text-success-foreground hover:bg-success shadow-sm',
      warning: 'bg-warning/90 text-warning-foreground hover:bg-warning shadow-sm',
      error: 'bg-error/90 text-error-foreground hover:bg-error shadow-sm',
      default: 'bg-muted text-foreground hover:bg-muted/80 border border-border/50',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
          variantStyles[variant],
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:scale-105',
          className
        )}
        role="status"
        aria-disabled={disabled}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        {onRemove && !disabled && (
          <button
            onClick={onRemove}
            className="ml-1 p-0.5 hover:opacity-70 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-current rounded-full transition-all duration-200"
            aria-label="Remove"
            type="button"
          >
            <X size={14} className="flex-shrink-0" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';

export { Badge, Chip };
