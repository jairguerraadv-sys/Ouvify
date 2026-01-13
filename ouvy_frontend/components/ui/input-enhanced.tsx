'use client';

import React, { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
}

export function InputEnhanced({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  size = 'md',
  className,
  containerClassName,
  disabled,
  ...props
}: InputProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const paddingClasses = {
    sm: icon ? (iconPosition === 'left' ? 'pl-9' : 'pr-9') : '',
    md: icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '',
    lg: icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : '',
  };

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-semibold text-secondary">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className={cn(
            'absolute top-1/2 left-0 -translate-y-1/2 flex items-center justify-center',
            size === 'sm' ? 'pl-3' : size === 'md' ? 'pl-4' : 'pl-4',
            'text-neutral-400 pointer-events-none'
          )}>
            {icon}
          </div>
        )}

        <input
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-error/50 bg-error/5 focus:ring-error'
              : 'border-neutral-200 bg-white hover:border-neutral-300',
            sizeClasses[size],
            paddingClasses[size],
            className
          )}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className={cn(
            'absolute top-1/2 right-0 -translate-y-1/2 flex items-center justify-center',
            size === 'sm' ? 'pr-3' : size === 'md' ? 'pr-4' : 'pr-4',
            'text-neutral-400 pointer-events-none'
          )}>
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm font-medium text-error flex items-center gap-1">
          ✕ {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-sm text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export const Input = InputEnhanced;

// Textarea Component
interface TextareaProps extends Omit<InputHTMLAttributes<HTMLTextAreaElement>, 'type' | 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  rows?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
}

export function TextareaEnhanced({
  label,
  error,
  hint,
  rows = 4,
  size = 'md',
  className,
  containerClassName,
  disabled,
  ...props
}: TextareaProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-semibold text-secondary">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <textarea
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full rounded-lg border transition-all duration-200 resize-vertical',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-error/50 bg-error/5 focus:ring-error'
            : 'border-neutral-200 bg-white hover:border-neutral-300',
          sizeClasses[size],
          className
        )}
        {...props}
      />

      {error && (
        <p className="text-sm font-medium text-error flex items-center gap-1">
          ✕ {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-sm text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export const Textarea = TextareaEnhanced;
