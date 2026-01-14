import * as React from 'react';
import { cn } from '@/lib/utils';

// Headings - H1 to H6
const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      'text-5xl md:text-6xl font-bold leading-tight tracking-tighter text-secondary mb-4',
      className
    )}
    {...props}
  />
));
H1.displayName = 'H1';

const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-4xl md:text-5xl font-bold leading-tight tracking-tight text-secondary mb-3',
      className
    )}
    {...props}
  />
));
H2.displayName = 'H2';

const H3 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl md:text-3xl font-bold leading-snug text-secondary mb-2',
      className
    )}
    {...props}
  />
));
H3.displayName = 'H3';

const H4 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn(
      'text-xl md:text-2xl font-bold leading-snug text-secondary mb-2',
      className
    )}
    {...props}
  />
));
H4.displayName = 'H4';

const H5 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'text-lg font-bold leading-normal text-secondary mb-1',
      className
    )}
    {...props}
  />
));
H5.displayName = 'H5';

const H6 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h6
    ref={ref}
    className={cn(
      'text-base font-bold leading-normal text-secondary mb-1',
      className
    )}
    {...props}
  />
));
H6.displayName = 'H6';

// Paragraph with variants
interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'sm' | 'base' | 'lg' | 'xl';
  muted?: boolean;
}

const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, size = 'base', muted = false, ...props }, ref) => {
    const sizeStyles = {
      sm: 'text-sm leading-relaxed',
      base: 'text-base leading-relaxed',
      lg: 'text-lg leading-relaxed',
      xl: 'text-xl leading-loose',
    };

    return (
      <p
        ref={ref}
        className={cn(
          sizeStyles[size],
          muted ? 'text-muted-foreground' : 'text-foreground',
          'mb-4 max-w-prose',
          className
        )}
        {...props}
      />
    );
  }
);
Paragraph.displayName = 'Paragraph';

// Small text
const Small = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <small
    ref={ref}
    className={cn(
      'text-sm font-medium leading-normal text-muted-foreground',
      className
    )}
    {...props}
  />
));
Small.displayName = 'Small';

// Lead - Large introductory text
const Lead = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-xl text-muted-foreground leading-relaxed max-w-prose',
      className
    )}
    {...props}
  />
));
Lead.displayName = 'Lead';

// Muted - Subtle text
const Muted = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('text-sm text-muted-foreground leading-normal', className)}
    {...props}
  />
));
Muted.displayName = 'Muted';

export {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Paragraph,
  Small,
  Lead,
  Muted,
};
