import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"

interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  period?: string;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({
    title,
    value,
    change,
    icon,
    trend,
    period,
    className,
    ...props
  }, ref) => {
    const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground';
    const trendIcon = trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-border bg-card p-6 transition-all duration-200',
          'hover:shadow-md hover:border-primary/50',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {title}
          </h3>
          {icon && (
            <div className="text-primary opacity-60">
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-2xl md:text-3xl font-bold text-secondary">
            {value}
          </p>

          {/* Change / Trend */}
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 text-sm font-semibold', trendColor)}>
              {trend && trendIcon}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>

        {/* Period */}
        {period && (
          <p className="text-xs text-muted-foreground mt-2">
            {period}
          </p>
        )}
      </div>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export { StatsCard };
