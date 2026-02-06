import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'text' | 'avatar';
}

function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  const variantStyles = {
    default: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
    avatar: 'rounded-full h-10 w-10',
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted",
        variantStyles[variant],
        className
      )}
      aria-busy="true"
      aria-label="Loading"
      role="status"
      {...props}
    />
  )
}

/**
 * Skeleton para cards de estatística do dashboard
 */
function StatCardSkeleton() {
  return (
    <div className="bg-background rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton para lista de feedbacks
 */
function FeedbackListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-background rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para página inteira do dashboard
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content */}
      <div className="bg-background rounded-xl p-6 border border-border">
        <Skeleton className="h-6 w-40 mb-4" />
        <FeedbackListSkeleton count={3} />
      </div>
    </div>
  );
}

export { Skeleton, StatCardSkeleton, FeedbackListSkeleton, DashboardSkeleton }
