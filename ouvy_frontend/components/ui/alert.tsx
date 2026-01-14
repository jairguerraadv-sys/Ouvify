import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        success:
          "border-success/50 bg-success/10 text-success dark:bg-success/5 [&>svg]:text-success",
        warning:
          "border-warning/50 bg-warning/10 text-warning dark:bg-warning/5 [&>svg]:text-warning",
        error:
          "border-error/50 bg-error/10 text-error dark:bg-error/5 [&>svg]:text-error",
        info: "border-info/50 bg-info/10 text-info dark:bg-info/5 [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-tight tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

interface AlertWithIconProps extends AlertProps {
  title?: string;
  description?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

const AlertWithIcon = React.forwardRef<HTMLDivElement, AlertWithIconProps>(
  ({
    className,
    variant = "default",
    title,
    description,
    onClose,
    icon,
    showIcon = true,
    children,
    ...props
  }, ref) => {
    const defaultIcons = {
      default: <Info className="h-4 w-4" />,
      success: <CheckCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      error: <AlertCircle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />,
    };

    return (
      <Alert
        ref={ref}
        variant={variant}
        className={cn("flex items-start justify-between", className)}
        {...props}
      >
        <div className="flex gap-3 items-start flex-1">
          {showIcon && (icon || defaultIcons[variant as keyof typeof defaultIcons])}
          <div className="flex-1">
            {title && <AlertTitle>{title}</AlertTitle>}
            {description && <AlertDescription>{description}</AlertDescription>}
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-foreground/10"
            aria-label="Fechar alerta"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </Alert>
    );
  }
);

AlertWithIcon.displayName = "AlertWithIcon";

export { Alert, AlertTitle, AlertDescription, AlertWithIcon }
