'use client';

import { LucideIcon, FileQuestion, Plus, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionExternal?: boolean;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  copyText?: string; // Texto para copiar (ex: link público)
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  actionLabel,
  actionHref,
  actionExternal,
  secondaryActionLabel,
  secondaryActionHref,
  copyText,
}: EmptyStateProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyText) return;
    
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 max-w-md">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Primary Action */}
        {actionLabel && actionHref && (
          actionExternal ? (
            <a
              href={actionHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="default" size="md" className="gap-2">
                <Plus className="w-4 h-4" aria-hidden="true" />
                {actionLabel}
              </Button>
            </a>
          ) : (
            <Link href={actionHref}>
              <Button variant="default" size="md" className="gap-2">
                <Plus className="w-4 h-4" aria-hidden="true" />
                {actionLabel}
              </Button>
            </Link>
          )
        )}

        {/* Copy Button */}
        {copyText && (
          <Button 
            variant="ghost" 
            size="md"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                Copiar Link
              </>
            )}
          </Button>
        )}

        {/* Secondary Action */}
        {secondaryActionLabel && secondaryActionHref && (
          <Link href={secondaryActionHref}>
            <Button variant="ghost" size="md">
              {secondaryActionLabel}
            </Button>
          </Link>
        )}
      </div>

      {/* Copy text display */}
      {copyText && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <code className="text-sm text-gray-700 break-all">
            {copyText}
          </code>
        </div>
      )}
    </div>
  );
}
