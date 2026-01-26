import * as React from "react"
import { cn } from "@/lib/utils"

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dashed' | 'dotted' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  withLabel?: string;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    orientation = 'horizontal',
    withLabel,
    ...props 
  }, ref) => {
    const variantStyles = {
      default: 'bg-border',
      dashed: 'border-t border-dashed border-border',
      dotted: 'border-t border-dotted border-border',
      gradient: 'bg-gradient-to-r from-transparent via-border to-transparent',
    };

    const sizeStyles = {
      sm: orientation === 'horizontal' ? 'h-px' : 'w-px',
      md: orientation === 'horizontal' ? 'h-[2px]' : 'w-[2px]',
      lg: orientation === 'horizontal' ? 'h-1' : 'w-1',
    };

    if (withLabel) {
      return (
        <div 
          className="flex items-center gap-4 my-6"
          {...props}
        >
          <div className={cn('flex-1', variantStyles[variant], sizeStyles[size])} />
          <span className="text-sm font-medium text-muted-foreground px-2 whitespace-nowrap">
            {withLabel}
          </span>
          <div className={cn('flex-1', variantStyles[variant], sizeStyles[size])} />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          orientation === 'horizontal' ? 'w-full' : 'h-full',
          variantStyles[variant],
          sizeStyles[size],
          'my-4',
          className
        )}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider };
