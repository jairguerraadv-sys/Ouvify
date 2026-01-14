import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 🎨 Design System: Ouvy Colors (Cyan + Navy Blue) - Refined
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primário: Cyan vibrante - para ações principais
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary-dark hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:shadow-sm transition-all",
        // Secundário: Azul marinho - para ações secundárias
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:bg-secondary-dark hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:shadow-sm transition-all",
        // Outline: Bordas primárias - para ações alternativas
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all",
        // Outline secundário - para ações alternativas neutras
        "outline-secondary":
          "border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all",
        // Ghost: Sem fundo - para ações terciárias
        ghost: 
          "text-foreground hover:bg-muted hover:text-secondary active:bg-muted/80 transition-colors",
        "ghost-primary":
          "text-primary hover:bg-primary/10 hover:text-primary-dark active:bg-primary/20 transition-colors",
        // Destrutivo - para ações perigosas
        destructive:
          "bg-error text-error-foreground shadow-md hover:bg-error/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:shadow-sm transition-all",
        // Link - para navegação inline
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-dark active:text-primary-dark transition-colors",
        // Success - para ações positivas
        success:
          "bg-success text-success-foreground shadow-md hover:bg-success/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:shadow-sm transition-all",
        // Warning - para ações de aviso
        warning:
          "bg-warning text-warning-foreground shadow-md hover:bg-warning/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:shadow-sm transition-all",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-9 px-4 py-2 text-sm",
        lg: "h-11 rounded-xl px-6 py-3 text-base",
        xl: "h-12 rounded-xl px-8 py-4 text-base font-bold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
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
        aria-busy={isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
