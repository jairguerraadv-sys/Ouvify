import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 🎨 Design System: Ouvy Colors (Blue Primary + Purple Secondary)
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primário: Azul #3B82F6 - para ações principais
        default:
          "bg-brand-primary-500 text-white shadow-sm hover:bg-brand-primary-600 hover:shadow-md focus-visible:ring-brand-primary-500 active:scale-[0.98]",
        // Usando CSS vars para compatibilidade com shadcn
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-dark hover:shadow-md focus-visible:ring-primary active:scale-[0.98]",
        // Secundário: Roxo #A855F7 - para ações secundárias
        secondary:
          "bg-brand-secondary-500 text-white shadow-sm hover:bg-brand-secondary-600 hover:shadow-md focus-visible:ring-brand-secondary-500 active:scale-[0.98]",
        // Outline: Bordas primárias
        outline:
          "border-2 border-brand-primary-500 text-brand-primary-500 bg-transparent hover:bg-brand-primary-50 focus-visible:ring-brand-primary-500 active:scale-[0.98]",
        // Outline secundário
        "outline-secondary":
          "border-2 border-brand-secondary-500 text-brand-secondary-500 bg-transparent hover:bg-brand-secondary-50 focus-visible:ring-brand-secondary-500 active:scale-[0.98]",
        // Ghost: Sem fundo - para ações terciárias
        ghost: 
          "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
        "ghost-primary":
          "text-brand-primary-500 hover:bg-brand-primary-50 hover:text-brand-primary-600 focus-visible:ring-brand-primary-500",
        // Destrutivo - para ações perigosas
        destructive:
          "bg-error-500 text-white shadow-sm hover:bg-error-600 hover:shadow-md focus-visible:ring-error-500 active:scale-[0.98]",
        danger:
          "bg-error-500 text-white shadow-sm hover:bg-error-600 hover:shadow-md focus-visible:ring-error-500 active:scale-[0.98]",
        // Link - para navegação inline
        link: "text-brand-primary-500 underline-offset-4 hover:underline hover:text-brand-primary-600",
        // Success - para ações positivas
        success:
          "bg-success-500 text-white shadow-sm hover:bg-success-600 hover:shadow-md focus-visible:ring-success-500 active:scale-[0.98]",
        // Warning - para ações de aviso
        warning:
          "bg-warning-500 text-gray-900 shadow-sm hover:bg-warning-600 hover:shadow-md focus-visible:ring-warning-500 active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 py-1.5 text-sm rounded-md",
        default: "h-10 px-4 py-2 text-base",
        md: "h-10 px-4 py-2 text-base",
        lg: "h-11 px-6 py-3 text-lg rounded-lg",
        xl: "h-12 px-8 py-4 text-xl rounded-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
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
