'use client';

import { LucideIcon, FileQuestion, Plus, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              {actionLabel}
            </a>
          ) : (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              {actionLabel}
            </Link>
          )
        )}

        {/* Copy Button */}
        {copyText && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Link
              </>
            )}
          </button>
        )}

        {/* Secondary Action */}
        {secondaryActionLabel && secondaryActionHref && (
          <Link
            href={secondaryActionHref}
            className="inline-flex items-center gap-2 text-gray-700 px-5 py-2.5 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            {secondaryActionLabel}
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
