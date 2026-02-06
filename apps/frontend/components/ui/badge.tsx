import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 🎨 Design System: Badges with Ouvify branding
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary",
        primary:
          "bg-primary/10 text-primary",
        secondary:
          "bg-secondary/10 text-secondary",
        success:
          "bg-success/10 text-success",
        warning:
          "bg-warning/10 text-warning",
        error:
          "bg-error/10 text-error",
        destructive:
          "bg-error/10 text-error",
        info:
          "bg-info/10 text-info",
        gray:
          "bg-muted text-muted-foreground",
        outline:
          "border border-border text-muted-foreground bg-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
