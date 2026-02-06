import * as React from "react"

import { cn } from "@/lib/utils"

// 🎨 Design System: Cards with Ouvify branding - Blue/Purple theme
const Card = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
    hover?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
  }
>(({ className, variant = 'default', hover = false, padding, ...props }, ref) => {
  const variantStyles = {
    default: 'rounded-xl border border-border bg-background text-foreground shadow-md',
    elevated: 'rounded-xl bg-background text-foreground shadow-lg border border-border',
    outlined: 'rounded-xl border-2 border-primary/20 bg-background text-foreground',
    ghost: 'rounded-xl border border-border bg-transparent text-foreground',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'hover:shadow-xl transition-shadow duration-300' : '';

  return (
    <div
      ref={ref}
      className={cn(
        variantStyles[variant],
        hoverStyles,
        padding ? paddingStyles[padding] : '',
        className
      )}
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
    className={cn("flex flex-col space-y-2 p-6", className)}
    {...props}
  />
)));
CardHeader.displayName = "CardHeader"

const CardTitle = React.memo(React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-bold font-heading text-foreground", className)}
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
    className={cn("text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
)));
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 p-6 pt-4 border-t border-border", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
