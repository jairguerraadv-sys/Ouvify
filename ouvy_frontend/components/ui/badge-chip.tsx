'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
      success: 'bg-success text-white',
      warning: 'bg-warning text-white',
      error: 'bg-error text-white',
      info: 'bg-info text-white',
      outline: 'border border-primary text-primary bg-transparent',
    };

    const sizeStyles = {
      sm: 'px-2 py-1 text-xs font-semibold rounded',
      md: 'px-3 py-1.5 text-sm font-semibold rounded-md',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
  variant?: 'primary' | 'secondary' | 'default';
  icon?: React.ReactNode;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, onRemove, variant = 'default', icon, children, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
      default: 'bg-neutral-100 text-secondary',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
          variantStyles[variant],
          onRemove ? 'pr-1' : '',
          className
        )}
        {...props}
      >
        {icon && <span>{icon}</span>}
        {children}
        {onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 p-0.5 hover:opacity-70 transition-opacity"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';

export { Badge, Chip };
