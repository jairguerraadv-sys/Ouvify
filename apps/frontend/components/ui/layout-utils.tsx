import React, { ReactNode, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// FLEX COMPONENTS
// Componentes utilitários para layouts flex comuns
// ============================================

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between items */
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8';
  /** Align items */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Flex wrap */
  wrap?: boolean;
  /** Direction */
  direction?: 'row' | 'col';
  /** Children */
  children: ReactNode;
}

const gapClasses = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '5': 'gap-5',
  '6': 'gap-6',
  '8': 'gap-8',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

/**
 * Flex - Base flex container
 * 
 * @example
 * <Flex gap="2" align="center">
 *   <Icon />
 *   <span>Text</span>
 * </Flex>
 */
export const Flex = forwardRef<HTMLDivElement, FlexProps>(({
  gap = '2',
  align = 'start',
  justify = 'start',
  wrap = false,
  direction = 'row',
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex',
      direction === 'col' ? 'flex-col' : 'flex-row',
      gapClasses[gap],
      alignClasses[align],
      justifyClasses[justify],
      wrap && 'flex-wrap',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Flex.displayName = 'Flex';

/**
 * FlexRow - Horizontal flex with centered items
 * Replaces: "flex items-center gap-2"
 * 
 * @example
 * <FlexRow gap="3">
 *   <Icon />
 *   <span>Label</span>
 * </FlexRow>
 */
export const FlexRow = forwardRef<HTMLDivElement, Omit<FlexProps, 'direction'>>(({
  gap = '2',
  align = 'center',
  className,
  children,
  ...props
}, ref) => (
  <Flex
    ref={ref}
    direction="row"
    gap={gap}
    align={align}
    className={className}
    {...props}
  >
    {children}
  </Flex>
));
FlexRow.displayName = 'FlexRow';

/**
 * InlineFlexRow - Inline flex row for semantic-safe wrappers
 * Replaces: "inline-flex items-center gap-2" or "flex items-center gap-2" when you need a <span>
 *
 * @example
 * <h2 className="...">
 *   <InlineFlexRow><Icon />Title</InlineFlexRow>
 * </h2>
 */
interface InlineFlexRowProps extends HTMLAttributes<HTMLSpanElement> {
  /** Gap between items */
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8';
  /** Align items */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Flex wrap */
  wrap?: boolean;
  children: ReactNode;
}

export const InlineFlexRow = forwardRef<HTMLSpanElement, InlineFlexRowProps>(({
  gap = '2',
  align = 'center',
  justify = 'start',
  wrap = false,
  className,
  children,
  ...props
}, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex',
      gapClasses[gap],
      alignClasses[align],
      justifyClasses[justify],
      wrap && 'flex-wrap',
      className
    )}
    {...props}
  >
    {children}
  </span>
));
InlineFlexRow.displayName = 'InlineFlexRow';

/**
 * FlexCol - Vertical flex container
 * 
 * @example
 * <FlexCol gap="4">
 *   <Heading />
 *   <Paragraph />
 * </FlexCol>
 */
export const FlexCol = forwardRef<HTMLDivElement, Omit<FlexProps, 'direction'>>(({
  gap = '4',
  className,
  children,
  ...props
}, ref) => (
  <Flex
    ref={ref}
    direction="col"
    gap={gap}
    className={className}
    {...props}
  >
    {children}
  </Flex>
));
FlexCol.displayName = 'FlexCol';

/**
 * FlexBetween - Flex with space-between
 * Replaces: "flex items-center justify-between"
 * 
 * @example
 * <FlexBetween>
 *   <Title />
 *   <Button />
 * </FlexBetween>
 */
export const FlexBetween = forwardRef<HTMLDivElement, Omit<FlexProps, 'justify'>>(({
  gap = '0',
  align = 'center',
  className,
  children,
  ...props
}, ref) => (
  <Flex
    ref={ref}
    justify="between"
    gap={gap}
    align={align}
    className={className}
    {...props}
  >
    {children}
  </Flex>
));
FlexBetween.displayName = 'FlexBetween';

/**
 * FlexCenter - Fully centered flex container
 * 
 * @example
 * <FlexCenter className="h-screen">
 *   <LoadingSpinner />
 * </FlexCenter>
 */
export const FlexCenter = forwardRef<HTMLDivElement, Omit<FlexProps, 'align' | 'justify'>>(({
  className,
  children,
  ...props
}, ref) => (
  <Flex
    ref={ref}
    align="center"
    justify="center"
    className={className}
    {...props}
  >
    {children}
  </Flex>
));
FlexCenter.displayName = 'FlexCenter';

// ============================================
// CONTAINER COMPONENTS
// ============================================

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Max width */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  /** Center content */
  centered?: boolean;
  /** Padding */
  padding?: boolean;
  children: ReactNode;
}

/**
 * Container - Responsive centered container
 * Replaces: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
 * 
 * @example
 * <Container size="7xl" padding>
 *   <Content />
 * </Container>
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(({
  size = '7xl',
  centered = true,
  padding = true,
  className,
  children,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      ref={ref}
      className={cn(
        sizeClasses[size],
        centered && 'mx-auto',
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Container.displayName = 'Container';

// ============================================
// DECORATIVE UTILITIES
// ============================================

export type DecorativeBlobTone = 'primary' | 'secondary' | 'success';
export type DecorativeBlobSize = 'sm' | 'md';
export type DecorativeBlobPlacement =
  | 'topLeftQuarter'
  | 'topRightQuarter'
  | 'bottomLeftQuarter'
  | 'bottomRightQuarter'
  | 'topLeftEdge'
  | 'topRightEdge'
  | 'bottomLeftEdge'
  | 'bottomRightEdge';

export interface DecorativeBlobProps extends HTMLAttributes<HTMLDivElement> {
  tone?: DecorativeBlobTone;
  size?: DecorativeBlobSize;
  placement?: DecorativeBlobPlacement;
}

/**
 * DecorativeBlob - Background blob (decorativo)
 * Centraliza padrões comuns como: "absolute top-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50".
 */
export const DecorativeBlob = forwardRef<HTMLDivElement, DecorativeBlobProps>(({
  tone = 'primary',
  size = 'md',
  placement = 'topRightQuarter',
  className,
  ...props
}, ref) => {
  const toneClasses: Record<DecorativeBlobTone, string> = {
    primary: 'bg-primary/10 opacity-50',
    secondary: 'bg-secondary/10 opacity-30',
    success: 'bg-success/10 opacity-30',
  };

  const sizeClasses: Record<DecorativeBlobSize, string> = {
    sm: 'w-72 h-72',
    md: 'w-96 h-96',
  };

  const placementClasses: Record<DecorativeBlobPlacement, string> = {
    topLeftQuarter: 'top-20 left-1/4',
    topRightQuarter: 'top-20 right-1/4',
    bottomLeftQuarter: 'bottom-20 left-1/4',
    bottomRightQuarter: 'bottom-20 right-1/4',
    topLeftEdge: 'top-0 left-0',
    topRightEdge: 'top-0 right-0',
    bottomLeftEdge: 'bottom-0 left-0',
    bottomRightEdge: 'bottom-0 right-0',
  };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'absolute rounded-full blur-3xl',
        placementClasses[placement],
        sizeClasses[size],
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
});
DecorativeBlob.displayName = 'DecorativeBlob';

// ============================================
// STACK COMPONENTS
// ============================================

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between items */
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8';
  children: ReactNode;
}

const stackGapClasses = {
  '0': 'space-y-0',
  '1': 'space-y-1',
  '2': 'space-y-2',
  '3': 'space-y-3',
  '4': 'space-y-4',
  '5': 'space-y-5',
  '6': 'space-y-6',
  '8': 'space-y-8',
};

/**
 * Stack - Vertical stack with spacing
 * 
 * @example
 * <Stack gap="4">
 *   <Card />
 *   <Card />
 *   <Card />
 * </Stack>
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(({
  gap = '4',
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(stackGapClasses[gap], className)}
    {...props}
  >
    {children}
  </div>
));
Stack.displayName = 'Stack';

// ============================================
// TEXT UTILITY COMPONENTS
// ============================================

interface MutedTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Text size */
  size?: 'xs' | 'sm' | 'base' | 'inherit';
  /** As block element */
  block?: boolean;
  children: ReactNode;
}

/**
 * MutedText - Muted text helper
 * Replaces: "text-muted-foreground text-sm" (24 files)
 * 
 * @example
 * <MutedText>Descrição secundária</MutedText>
 * <MutedText size="xs">Texto pequeno</MutedText>
 */
export const MutedText = forwardRef<HTMLSpanElement, MutedTextProps>(({
  size = 'sm',
  block = false,
  className,
  children,
  ...props
}, ref) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    inherit: '',
  };

  if (block) {
    return (
      <p
        className={cn(
          'text-muted-foreground',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }

  return (
    <span
      ref={ref}
      className={cn(
        'text-muted-foreground',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});
MutedText.displayName = 'MutedText';

// ============================================
// ICON WRAPPER
// ============================================

interface IconWrapperProps extends HTMLAttributes<HTMLSpanElement> {
  /** Icon size */
  size?: 'sm' | 'md' | 'lg';
  /** Icon color */
  color?: 'primary' | 'muted' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

/**
 * IconWrapper - Consistent icon sizing and coloring
 * Replaces: "h-4 w-4 text-primary" (8+ files)
 * 
 * @example
 * <IconWrapper size="md" color="primary">
 *   <CheckIcon />
 * </IconWrapper>
 */
export const IconWrapper = forwardRef<HTMLSpanElement, IconWrapperProps>(({
  size = 'md',
  color = 'primary',
  className,
  children,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: '[&>svg]:w-3 [&>svg]:h-3',
    md: '[&>svg]:w-4 [&>svg]:h-4',
    lg: '[&>svg]:w-6 [&>svg]:h-6',
  };

  const colorClasses = {
    primary: 'text-primary',
    muted: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});
IconWrapper.displayName = 'IconWrapper';

// ============================================
// SPINNER COMPONENT
// ============================================

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Spinner - Loading spinner
 * Replaces: "animate-spin h-4 w-4 mr-2" (9 files)
 * 
 * @example
 * <Button disabled>
 *   <Spinner size="sm" />
 *   Loading...
 * </Button>
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(({
  size = 'sm',
  className,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
});
Spinner.displayName = 'Spinner';

// ============================================
// SECTION COMPONENT
// ============================================

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

/**
 * Section - Page section with consistent padding
 * 
 * @example
 * <Section padding="lg">
 *   <Container>
 *     <Content />
 *   </Container>
 * </Section>
 */
export const Section = forwardRef<HTMLElement, SectionProps>(({
  padding = 'lg',
  className,
  children,
  ...props
}, ref) => {
  const paddingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16 md:py-20',
    xl: 'py-20 md:py-32',
  };

  return (
    <section
      ref={ref}
      className={cn(paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </section>
  );
});
Section.displayName = 'Section';

// ============================================
// EXPORTS
// ============================================

export type {
  FlexProps,
  ContainerProps,
  StackProps,
  MutedTextProps,
  IconWrapperProps,
  SpinnerProps,
  SectionProps,
};
