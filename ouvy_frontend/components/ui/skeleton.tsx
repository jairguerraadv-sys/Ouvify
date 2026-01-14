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

export { Skeleton }
