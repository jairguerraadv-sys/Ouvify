import * as React from "react"

import { cn } from "@/lib/utils"

// 🎨 Design System: Cards with Ouvy branding - Enhanced
const Card = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'elevated' | 'outlined' | 'ghost' }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantStyles = {
    default: 'rounded-xl border border-border bg-card text-card-foreground shadow-soft hover:shadow-md transition-all duration-300',
    elevated: 'rounded-xl bg-card text-card-foreground shadow-lg hover:shadow-xl transition-all duration-300 border border-border/30 hover:-translate-y-1',
    outlined: 'rounded-xl border-2 border-primary/50 bg-card text-card-foreground hover:border-primary hover:shadow-md transition-all duration-300',
    ghost: 'rounded-xl border border-border/30 bg-transparent text-card-foreground hover:bg-muted/30 hover:border-border transition-all duration-300',
  };

  return (
    <div
      ref={ref}
      className={cn(variantStyles[variant], className)}
      role="region"
      {...props}
    />
  );
}));
Card.displayName = "Card"

const CardHeader = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 border-b border-border/50", className)}
    {...props}
  />
)));
CardHeader.displayName = "CardHeader"

const CardTitle = React.memo(React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-2xl font-bold leading-tight tracking-tight text-secondary", className)}
    {...props}
  />
)));
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
)));
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
