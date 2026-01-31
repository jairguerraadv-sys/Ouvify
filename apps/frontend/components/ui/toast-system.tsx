'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ============================================
// TYPES
// ============================================

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

// ============================================
// TOAST CONTEXT
// ============================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ============================================
// TOAST PROVIDER
// ============================================

interface ToastProviderProps {
  children: ReactNode;
  /** Position of toast container */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  /** Max number of visible toasts */
  maxToasts?: number;
}

export function ToastProvider({ 
  children, 
  position = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    
    setToasts(prev => {
      const updated = [...prev, newToast];
      return updated.slice(-maxToasts);
    });

    // Auto-remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description, duration: 8000 });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description });
  }, [addToast]);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div 
        className={cn(
          'fixed z-[100] flex flex-col gap-2 pointer-events-none',
          positionClasses[position]
        )}
        role="region"
        aria-label="Notificações"
        aria-live="polite"
      >
        {toasts.map(toast => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ============================================
// TOAST ITEM
// ============================================

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: typeof CheckCircle; iconColor: string }> = {
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    icon: CheckCircle,
    iconColor: 'text-success-600',
  },
  error: {
    bg: 'bg-error-50',
    border: 'border-error-200',
    icon: AlertCircle,
    iconColor: 'text-error-600',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    icon: AlertTriangle,
    iconColor: 'text-warning-600',
  },
  info: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    icon: Info,
    iconColor: 'text-primary-600',
  },
};

function ToastItem({ toast, onClose }: ToastItemProps) {
  const style = toastStyles[toast.type];
  const Icon = style.icon;
  
  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto w-80 p-4 rounded-lg border shadow-lg',
        'animate-in slide-in-from-right-5 fade-in-0 duration-300',
        style.bg,
        style.border
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', style.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-sm text-gray-600">{toast.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// INLINE TOAST (for forms)
// ============================================

interface InlineToastProps {
  type: ToastType;
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export function InlineToast({ type, title, description, onClose, className }: InlineToastProps) {
  const style = toastStyles[type];
  const Icon = style.icon;
  
  return (
    <div
      role="alert"
      className={cn(
        'p-4 rounded-lg border',
        'animate-in fade-in-0 duration-200',
        style.bg,
        style.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', style.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// CONFIRMATION DIALOG
// ============================================

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const variantStyles = {
    danger: 'bg-error-600 hover:bg-error-700 focus:ring-error-500',
    warning: 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500',
    default: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? "confirm-description" : undefined}
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
          'w-full max-w-md bg-white rounded-xl shadow-xl p-6',
          'animate-in zoom-in-95 fade-in-0 duration-200'
        )}
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        {description && (
          <p id="confirm-description" className="mt-2 text-gray-600">
            {description}
          </p>
        )}
        
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              'text-gray-700 bg-white border border-gray-300',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              variantStyles[variant]
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processando...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

export default ToastProvider;
