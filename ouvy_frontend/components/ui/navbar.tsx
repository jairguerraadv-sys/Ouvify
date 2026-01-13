'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { Menu, X } from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface NavBarProps {
  links?: NavLink[];
  rightContent?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export function NavBar({
  links = [],
  rightContent,
  sticky = true,
  className,
}: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className={cn(
        'w-full bg-background border-b border-neutral-200', // Fundo branco limpo
        sticky && 'sticky top-0 z-50',
        'shadow-sm',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo variant="full" href="/" size="md" />

          {/* Desktop Links */}
          {links.length > 0 && (
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors py-2 px-1',
                    link.active
                      ? 'text-primary border-b-2 border-primary' // Ciano ativo
                      : 'text-secondary hover:text-primary' // Azul marinho -> ciano no hover
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Right Content (Buttons, etc) */}
          <div className="flex items-center gap-4">
            {rightContent}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-secondary hover:text-primary transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && links.length > 0 && (
          <div className="md:hidden border-t border-neutral-200 py-4 space-y-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  link.active
                    ? 'bg-primary text-white' // Fundo ciano ativo
                    : 'text-secondary hover:bg-neutral-100' // Azul marinho com hover sutil
                )}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
