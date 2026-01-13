import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 🎨 Design System: Ouvy Colors (Cyan + Navy Blue)
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primário: Cyan vibrante
        default:
          "bg-primary text-white shadow-md hover:opacity-90 hover:shadow-lg active:scale-95 transition-all",
        // Secundário: Azul marinho
        secondary:
          "bg-secondary text-white shadow-md hover:opacity-90 hover:shadow-lg active:scale-95 transition-all",
        // Outline: Bordas primárias
        outline:
          "border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all",
        // Outline secundário
        "outline-secondary":
          "border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all",
        // Ghost: Sem fundo
        ghost: 
          "text-secondary hover:bg-neutral-100 active:bg-neutral-200 transition-colors",
        "ghost-primary":
          "text-primary hover:bg-cyan-50 active:bg-cyan-100 transition-colors",
        // Destrutivo
        destructive:
          "bg-error text-white shadow-md hover:bg-red-600 hover:shadow-lg active:scale-95",
        // Link
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-9 px-4 py-2 text-sm",
        lg: "h-11 rounded-xl px-6 py-3 text-base",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
