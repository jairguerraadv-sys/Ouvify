'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
}

export function Tooltip({ 
  children, 
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className="bg-background text-text-primary border border-border-light px-3 py-2 rounded-md text-sm max-w-xs shadow-lg z-50 animate-in fade-in-0 zoom-in-95"
            sideOffset={5}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-border-light" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

// Wrapper para campos de formulário com tooltip
export function TooltipFormField({
  label,
  tooltip,
  children,
  required = false,
}: {
  label: string;
  tooltip: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary flex items-center gap-2">
        {label}
        {required && <span className="text-error-500">*</span>}
        <Tooltip content={tooltip}>
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-background-tertiary text-text-secondary text-xs cursor-help hover:bg-background-secondary transition-colors">
            ?
          </span>
        </Tooltip>
      </label>
      {children}
    </div>
  );
}
