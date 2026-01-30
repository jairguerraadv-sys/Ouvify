/**
 * LoadingOverlay Component - Ouvify
 * Sprint 5 - Feature 5.4: Melhorias UX
 * 
 * Componente de loading overlay para operações assíncronas
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  blur?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message = 'Carregando...',
  fullScreen = false,
  blur = true,
  children,
  className,
}: LoadingOverlayProps) {
  if (!isLoading && children) {
    return <>{children}</>;
  }

  if (!isLoading) {
    return null;
  }

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-3',
    fullScreen
      ? 'fixed inset-0 z-50 bg-background/80'
      : 'absolute inset-0 z-10 bg-background/60',
    blur && 'backdrop-blur-sm',
    className
  );

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-3 p-4 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// Skeleton loaders para diferentes tipos de conteúdo
interface SkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      <div className="space-y-2">
        <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5, className }: SkeletonProps & { columns?: number }) {
  return (
    <div className={cn('flex gap-4 p-4 border-b', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded animate-pulse"
          style={{ width: `${100 / columns}%` }}
        />
      ))}
    </div>
  );
}

export function ListSkeleton({ items = 5, className }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="space-y-3">
        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
        <div className="h-2 w-2/3 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="space-y-4">
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
        <div className="h-[200px] bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

// Hook para controlar loading com timeout
export function useLoadingState(initialState = false, timeoutMs = 30000) {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
    
    // Auto-cancel after timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      console.warn('Loading timeout reached');
    }, timeoutMs);
  }, [timeoutMs]);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isLoading, startLoading, stopLoading };
}

export default LoadingOverlay;
