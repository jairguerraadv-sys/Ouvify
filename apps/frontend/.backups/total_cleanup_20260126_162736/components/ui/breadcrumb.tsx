import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb component - Navegação hierárquica
 * 
 * @example
 * <Breadcrumb 
 *   items={[
 *     { label: 'Início', href: '/' },
 *     { label: 'Recursos', href: '/recursos' },
 *     { label: 'Segurança' },
 *   ]}
 * />
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      className={cn("flex items-center gap-2 text-sm", className)} 
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight 
                className="w-4 h-4 text-gray-400" 
                aria-hidden="true" 
              />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className="text-gray-600 font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
