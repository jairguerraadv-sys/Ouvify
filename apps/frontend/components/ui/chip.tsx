'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/**
 * Chip Component - Ouvify Design System
 * 
 * Chips são elementos interativos usados para:
 * - Tags removíveis
 * - Filtros selecionáveis  
 * - Badges com ações
 * 
 * @example
 * ```tsx
 * <Chip icon={<Tag />} variant="primary">Tag Name</Chip>
 * <Chip onRemove={() => remove()}>Removable</Chip>
 * ```
 */

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default';
  icon?: React.ReactNode;
  disabled?: boolean;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, onRemove, variant = 'default', icon, children, disabled = false, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
      secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
      success: 'bg-success-100 text-success-700 hover:bg-success-200',
      warning: 'bg-warning-100 text-warning-700 hover:bg-warning-200',
      error: 'bg-error-100 text-error-700 hover:bg-error-200',
      default: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
          variantStyles[variant],
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:scale-[1.02]',
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
            className="ml-1 p-0.5 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500 rounded-full transition-all duration-200"
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

export { Chip };
export type { ChipProps };
