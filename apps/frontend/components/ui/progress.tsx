import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const variantStyles = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    value = 0,
    max = 100,
    variant = 'default',
    size = 'md',
    showLabel = false,
    animated = true,
    className,
    ...props
  }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);
    const widthStyle = { width: `${percentage}%` } as React.CSSProperties;
    
    return (
      <div
        ref={ref}
        className={cn('w-full space-y-2', className)}
        {...props}
      >
        {showLabel && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">
              Progresso
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          className={cn(
            'w-full overflow-hidden rounded-full bg-muted transition-all duration-300',
            sizeStyles[size]
          )}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              variantStyles[variant],
              animated && 'animate-pulse-subtle'
            )}
              style={widthStyle}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
