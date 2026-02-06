import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

// 🎨 Ouvify Design System: Unified Color System (NO brand- prefix)
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Default/Primary: Blue 600 - para ações principais
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md focus-visible:ring-primary active:scale-[0.98]",
        // Secundário: Purple 600 - para ações secundárias
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover hover:shadow-md focus-visible:ring-secondary active:scale-[0.98]",
        // Outline: Bordas primárias
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary/10 focus-visible:ring-primary active:scale-[0.98]",
        // Outline secundário
        "outline-secondary":
          "border-2 border-secondary text-secondary bg-transparent hover:bg-secondary/10 focus-visible:ring-secondary active:scale-[0.98]",
        // Ghost: Sem fundo - para ações terciárias
        ghost: 
          "text-muted-foreground hover:bg-muted focus-visible:ring-border-focus",
        "ghost-primary":
          "text-primary hover:bg-primary/10 hover:text-primary focus-visible:ring-primary",
        // Destrutivo - para ações perigosas
        destructive:
          "bg-error text-white shadow-sm hover:bg-error-hover hover:shadow-md focus-visible:ring-error active:scale-[0.98]",
        danger:
          "bg-error text-white shadow-sm hover:bg-error-hover hover:shadow-md focus-visible:ring-error active:scale-[0.98]",
        // Link - para navegação inline
        link: "text-primary underline-offset-4 hover:underline hover:text-primary focus-visible:ring-primary",
        // Success - para ações positivas
        success:
          "bg-success text-white shadow-sm hover:bg-success-hover hover:shadow-md focus-visible:ring-success active:scale-[0.98]",
        // Warning - para ações de aviso
        warning:
          "bg-warning text-foreground shadow-sm hover:bg-warning-hover hover:shadow-md focus-visible:ring-warning active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 py-1.5 text-sm rounded-md touch-target",
        default: "h-10 px-4 py-2 text-base touch-target",
        md: "h-10 px-4 py-2 text-base touch-target",
        lg: "h-11 px-6 py-3 text-lg rounded-lg touch-target",
        xl: "h-12 px-8 py-4 text-xl rounded-xl touch-target",
        icon: "h-10 w-10 touch-target",
        "icon-sm": "h-8 w-8 touch-target",
        "icon-lg": "h-12 w-12 touch-target",
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

/**
 * Button Component - Ouvify Design System
 * 
 * @important PADRÃO CORRETO DE USO COM LINKS:
 * 
 * ✅ CORRETO:
 * <Link href="/path">
 *   <Button variant="default">Text</Button>
 * </Link>
 * 
 * ❌ ERRADO (causa React.Children.only error):
 * <Button asChild>
 *   <Link href="/path">Text</Link>
 * </Button>
 * 
 * @note O prop `asChild` DEVE SER EVITADO com Button components.
 * Use apenas para componentes Radix UI que exigem (DropdownMenuTrigger, etc).
 * Para navegação, sempre envolva o Button com Link/a ao invés de usar asChild.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean  // ⚠️ Use APENAS em casos especiais - veja documentação acima
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          aria-busy={isLoading}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    const showLoader = isLoading
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        ref={ref}
        {...props}
      >
        {showLoader && <Loader2 className="animate-spin" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
