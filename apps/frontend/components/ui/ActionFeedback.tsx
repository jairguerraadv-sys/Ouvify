/**
 * ActionFeedback Component - Ouvify
 * Sprint 5 - Feature 5.4: Melhorias UX
 * 
 * Componentes de feedback visual para ações do usuário
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Inline notification que aparece após uma ação
interface InlineNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  visible: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

export function InlineNotification({
  type,
  message,
  visible,
  onClose,
  autoClose = true,
  duration = 5000,
  className,
}: InlineNotificationProps) {
  useEffect(() => {
    if (visible && autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, duration, onClose]);

  if (!visible) return null;

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-error-50 border-error-200 text-error-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800',
  };

  const Icon = icons[type];

  return (
    <div 
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300',
        colors[type],
        className
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="text-sm flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Fechar"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Status indicator com animação
interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning' | 'loading' | 'idle';
  label?: string;
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  showPulse = true,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const colors = {
    success: 'bg-success-500',
    error: 'bg-error-500',
    warning: 'bg-warning-500',
    loading: 'bg-primary-500',
    idle: 'bg-gray-400',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex">
        {status === 'loading' ? (
          <Loader2 className={cn('animate-spin text-primary-500', sizes[size])} />
        ) : (
          <>
            <span className={cn('rounded-full', sizes[size], colors[status])} />
            {showPulse && status !== 'idle' && (
              <span 
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                  colors[status]
                )} 
              />
            )}
          </>
        )}
      </span>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

// Progress steps indicator
interface ProgressStep {
  label: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: ProgressStep[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={index} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'border-primary text-primary',
                  isPending && 'border-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 h-8 mt-1',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Copy button with feedback
interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn('gap-2', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-success-500" />
          <span>Copiado!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>{label || 'Copiar'}</span>
        </>
      )}
    </Button>
  );
}

// Action result card
interface ActionResultProps {
  type: 'success' | 'error';
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ActionResult({
  type,
  title,
  description,
  actions,
  className,
}: ActionResultProps) {
  const Icon = type === 'success' ? CheckCircle2 : XCircle;
  const iconColor = type === 'success' ? 'text-success-500' : 'text-error-500';
  const bgColor = type === 'success' ? 'bg-success-50' : 'bg-error-50';

  return (
    <div className={cn('text-center py-8', className)}>
      <div className={cn('mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4', bgColor)}>
        <Icon className={cn('h-8 w-8', iconColor)} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">{description}</p>
      )}
      {actions && (
        <div className="flex items-center justify-center gap-2">{actions}</div>
      )}
    </div>
  );
}

// Countdown timer
interface CountdownProps {
  seconds: number;
  onComplete?: () => void;
  label?: string;
  className?: string;
}

export function Countdown({ seconds, onComplete, label, className }: CountdownProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  return (
    <div className={cn('text-sm text-muted-foreground', className)}>
      {label && <span>{label} </span>}
      <span className="font-mono">{remaining}s</span>
    </div>
  );
}

export default InlineNotification;
