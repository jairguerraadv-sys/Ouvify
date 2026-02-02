import * as React from "react"
import { cn } from "@/lib/utils"
import { Circle } from "lucide-react"

type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline' | 'soft';
}

const statusConfig = {
  active: { color: 'text-success', bg: 'bg-success', light: 'bg-success/10', border: 'border-success' },
  inactive: { color: 'text-muted-foreground', bg: 'bg-muted', light: 'bg-muted/50', border: 'border-muted' },
  pending: { color: 'text-warning', bg: 'bg-warning', light: 'bg-warning/10', border: 'border-warning' },
  success: { color: 'text-success', bg: 'bg-success', light: 'bg-success/10', border: 'border-success' },
  warning: { color: 'text-warning', bg: 'bg-warning', light: 'bg-warning/10', border: 'border-warning' },
  error: { color: 'text-error', bg: 'bg-error', light: 'bg-error/10', border: 'border-error' },
  info: { color: 'text-info', bg: 'bg-info', light: 'bg-info/10', border: 'border-info' },
};

const sizeConfig = {
  sm: { badge: 'px-2 py-1 text-xs', icon: 'h-1.5 w-1.5' },
  md: { badge: 'px-3 py-1.5 text-sm', icon: 'h-2 w-2' },
  lg: { badge: 'px-4 py-2 text-base', icon: 'h-2.5 w-2.5' },
};

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ 
    status, 
    label, 
    size = 'md', 
    variant = 'filled',
    className,
    ...props 
  }, ref) => {
    const config = statusConfig[status];
    const sizeStyles = sizeConfig[size];
    
    const variantStyles = {
      filled: `${config.bg} text-text-inverse`,
      outline: `border ${config.border} ${config.color} bg-transparent`,
      soft: `${config.light} ${config.color}`,
    };

    const statusLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
          sizeStyles.badge,
          variantStyles[variant],
          className
        )}
        role="status"
        aria-label={`Status: ${statusLabel}`}
        {...props}
      >
        <Circle 
          className={cn('flex-shrink-0 fill-current', sizeStyles.icon)}
          aria-hidden="true"
        />
        <span>{statusLabel}</span>
      </div>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export { StatusBadge };
export type { StatusType };
