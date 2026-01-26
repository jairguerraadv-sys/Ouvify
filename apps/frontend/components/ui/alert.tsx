import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

// 🎨 Design System: Alerts with Ouvy colors
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-gray-50 border-gray-200 text-gray-900",
        success:
          "border-success-200 bg-success-50 text-success-900 [&>svg]:text-success-500",
        warning:
          "border-warning-200 bg-warning-50 text-warning-900 [&>svg]:text-warning-500",
        error:
          "border-error-200 bg-error-50 text-error-900 [&>svg]:text-error-500",
        info: 
          "border-info-200 bg-info-50 text-info-900 [&>svg]:text-info-500",
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
