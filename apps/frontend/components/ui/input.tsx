import * as React from "react"

import { cn } from "@/lib/utils"

// 🎨 Design System: Inputs with Ouvify colors
export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, required, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border px-4 py-2 text-base transition-colors duration-200",
            "bg-background text-text-primary",
            "placeholder:text-text-tertiary",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary",
            "focus:outline-none focus:ring-2",
            "disabled:cursor-not-allowed disabled:bg-background-secondary disabled:opacity-50",
            error 
              ? "border-error-500 focus:ring-error-500 focus:border-error-500" 
              : "border-border-light hover:border-border-focus focus:ring-border-focus focus:border-transparent",
            className
          )}
          required={required}
          ref={ref}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-text-tertiary">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
