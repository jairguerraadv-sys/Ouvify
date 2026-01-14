import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-base shadow-sm transition-all duration-300 placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:border-primary hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
