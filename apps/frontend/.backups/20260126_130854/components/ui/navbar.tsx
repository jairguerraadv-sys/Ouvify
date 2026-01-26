'use client';

import React, { useState, useCallback } from 'react';
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

export const NavBar = React.memo(function NavBar({
  links = [],
  rightContent,
  sticky = true,
  className,
}: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <nav
      className={cn(
        'w-full bg-background/95 backdrop-blur-md border-b border-border',
        sticky && 'sticky top-0 z-50',
        'shadow-sm transition-all duration-300',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo href="/" size="sm" />

          {/* Desktop Links */}
          {links.length > 0 && (
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-semibold transition-all duration-300 py-2 px-1 border-b-2 relative group',
                    link.active
                      ? 'text-primary border-primary' 
                      : 'text-gray-700 border-transparent hover:text-primary hover:border-primary/50'
                  )}
                  aria-current={link.active ? 'page' : undefined}
                >
                  {link.label}
                  <span className={cn(
                    'absolute inset-x-0 -bottom-px h-0.5 bg-primary transform origin-left transition-transform duration-300',
                    link.active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  )} />
                </a>
              ))}
            </div>
          )}

          {/* Right Content (Buttons, etc) */}
          <div className="flex items-center gap-4">
            {rightContent}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobile}
              className={cn(
                'md:hidden text-gray-700 hover:text-primary transition-colors duration-200 p-2 hover:bg-muted rounded-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && links.length > 0 && (
          <div 
            id="mobile-menu"
            className="md:hidden border-t border-border py-4 space-y-2 animate-slide-down"
            role="region"
            aria-label="Mobile navigation"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'block text-sm font-medium transition-all duration-200 py-2 px-4 rounded-md',
                  link.active
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-700 hover:text-primary hover:bg-muted'
                )}
                onClick={closeMobile}
                aria-current={link.active ? 'page' : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
});
