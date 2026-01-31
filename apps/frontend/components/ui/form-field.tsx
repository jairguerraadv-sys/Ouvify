'use client';

import React, { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { AlertCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';

// ============================================
// FORM FIELD
// ============================================

interface FormFieldProps {
  /** Label text */
  label: string;
  /** Field name (for id/htmlFor) */
  name: string;
  /** Error message */
  error?: string;
  /** Is field required */
  required?: boolean;
  /** Helper text below field */
  helper?: string;
  /** Tooltip help text */
  tooltip?: string;
  /** The input/textarea/select element */
  children: ReactNode;
  /** Additional classes */
  className?: string;
  /** Label position */
  labelPosition?: 'top' | 'left';
  /** Hide label visually (still accessible) */
  hideLabel?: boolean;
}

/**
 * FormField - Wrapper padronizado para campos de formulário
 * 
 * @usage
 * ```tsx
 * <FormField
 *   label="Nome"
 *   name="nome"
 *   required
 *   error={errors.nome?.message}
 *   helper="Digite seu nome completo"
 * >
 *   <Input id="nome" {...register('nome')} />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  name,
  error,
  required,
  helper,
  tooltip,
  children,
  className,
  labelPosition = 'top',
  hideLabel = false,
}: FormFieldProps) {
  const isHorizontal = labelPosition === 'left';
  
  return (
    <div className={cn(
      'space-y-2',
      isHorizontal && 'sm:flex sm:items-start sm:gap-4 sm:space-y-0',
      className
    )}>
      <Label 
        htmlFor={name} 
        className={cn(
          'flex items-center gap-1.5',
          isHorizontal && 'sm:w-1/3 sm:pt-2',
          hideLabel && 'sr-only'
        )}
      >
        <span>{label}</span>
        {required && (
          <span className="text-error-500" aria-hidden="true">*</span>
        )}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  className="text-gray-400 hover:text-gray-500"
                  aria-label={`Ajuda: ${tooltip}`}
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Label>
      
      <div className={cn(isHorizontal && 'sm:flex-1')}>
        {children}
        
        {/* Helper text */}
        {helper && !error && (
          <p className="mt-1.5 text-xs text-gray-500">
            {helper}
          </p>
        )}
        
        {/* Error message */}
        {error && (
          <p 
            className="mt-1.5 text-xs text-error-600 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// FORM
// ============================================

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Form submit handler */
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Form children */
  children: ReactNode;
  /** Spacing between fields */
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * Form - Wrapper de formulário com espaçamento padrão
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(({ 
  onSubmit, 
  children, 
  className,
  spacing = 'md',
  ...props 
}, ref) => {
  const spacingClass = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
  };

  return (
    <form 
      ref={ref}
      onSubmit={onSubmit} 
      className={cn(spacingClass[spacing], className)} 
      noValidate
      {...props}
    >
      {children}
    </form>
  );
});

Form.displayName = 'Form';

// ============================================
// FORM SECTION
// ============================================

interface FormSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Section children (form fields) */
  children: ReactNode;
  /** Additional classes */
  className?: string;
}

/**
 * FormSection - Agrupa campos relacionados com título
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <fieldset className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <legend className="text-lg font-semibold text-gray-900">
              {title}
            </legend>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </fieldset>
  );
}

// ============================================
// FORM ACTIONS
// ============================================

interface FormActionsProps {
  /** Action buttons */
  children: ReactNode;
  /** Alignment */
  align?: 'left' | 'right' | 'center' | 'between';
  /** Additional classes */
  className?: string;
  /** Show border top */
  bordered?: boolean;
}

/**
 * FormActions - Container para botões de ação do formulário
 */
export function FormActions({
  children,
  align = 'right',
  className,
  bordered = false,
}: FormActionsProps) {
  const alignClass = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
  };

  return (
    <div className={cn(
      'flex flex-wrap items-center gap-3 pt-4',
      alignClass[align],
      bordered && 'border-t border-gray-200 mt-6',
      className
    )}>
      {children}
    </div>
  );
}

// ============================================
// FORM ROW (for inline fields)
// ============================================

interface FormRowProps {
  /** Row children (usually 2-3 FormFields) */
  children: ReactNode;
  /** Number of columns */
  cols?: 2 | 3 | 4;
  /** Additional classes */
  className?: string;
}

/**
 * FormRow - Layout em colunas para campos side-by-side
 */
export function FormRow({
  children,
  cols = 2,
  className,
}: FormRowProps) {
  const colsClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid grid-cols-1 gap-4',
      colsClass[cols],
      className
    )}>
      {children}
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export {
  FormField as default,
};
