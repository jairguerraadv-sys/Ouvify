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
          "bg-primary-100 text-primary-700",
        primary:
          "bg-primary-100 text-primary-700",
        secondary:
          "bg-secondary-100 text-secondary-700",
        success:
          "bg-success-100 text-success-700",
        warning:
          "bg-warning-100 text-warning-700",
        error:
          "bg-error-100 text-error-700",
        destructive:
          "bg-error-100 text-error-700",
        info:
          "bg-info-100 text-info-700",
        gray:
          "bg-background-secondary text-text-secondary",
        outline:
          "border border-border-light text-text-secondary bg-transparent",
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
