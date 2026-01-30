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
        // Default/Primary: Azul #3B82F6 - para ações principais
        default:
          "bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:shadow-md focus-visible:ring-primary-500 active:scale-[0.98]",
        // Secundário: Roxo #A855F7 - para ações secundárias
        secondary:
          "bg-secondary-500 text-white shadow-sm hover:bg-secondary-600 hover:shadow-md focus-visible:ring-secondary-500 active:scale-[0.98]",
        // Outline: Bordas primárias
        outline:
          "border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus-visible:ring-primary-500 active:scale-[0.98]",
        // Outline secundário
        "outline-secondary":
          "border-2 border-secondary-500 text-secondary-500 bg-transparent hover:bg-secondary-50 focus-visible:ring-secondary-500 active:scale-[0.98]",
        // Ghost: Sem fundo - para ações terciárias
        ghost: 
          "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
        "ghost-primary":
          "text-primary-500 hover:bg-primary-50 hover:text-primary-600 focus-visible:ring-primary-500",
        // Destrutivo - para ações perigosas
        destructive:
          "bg-error-500 text-white shadow-sm hover:bg-error-600 hover:shadow-md focus-visible:ring-error-500 active:scale-[0.98]",
        danger:
          "bg-error-500 text-white shadow-sm hover:bg-error-600 hover:shadow-md focus-visible:ring-error-500 active:scale-[0.98]",
        // Link - para navegação inline
        link: "text-primary-500 underline-offset-4 hover:underline hover:text-primary-600",
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
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" aria-hidden="true" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
