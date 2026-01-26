import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 🎨 Design System: Badges with Ouvy branding
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary-100 text-brand-primary-700",
        primary:
          "bg-brand-primary-100 text-brand-primary-700",
        secondary:
          "bg-brand-secondary-100 text-brand-secondary-700",
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
          "bg-gray-100 text-gray-700",
        outline:
          "border border-gray-300 text-gray-700 bg-transparent",
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
