'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogoEnhanced } from './logo-enhanced';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
  badge?: string;
}

interface NavBarProps {
  links?: NavLink[];
  rightContent?: React.ReactNode;
  sticky?: boolean;
  transparent?: boolean;
  className?: string;
}

export function NavBarEnhanced({
  links = [],
  rightContent,
  sticky = false,
  transparent = false,
  className,
}: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    if (sticky) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [sticky]);

  return (
    <nav
      className={cn(
        'w-full z-50 transition-all duration-300',
        sticky && 'fixed top-0 left-0 right-0',
        sticky && isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-md border-b border-neutral-200/50'
          : 'bg-transparent',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <LogoEnhanced
              variant="full"
              size="md"
              colorScheme="auto"
              href="/"
            />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative text-sm font-medium transition-colors group',
                  'text-neutral-700 hover:text-primary',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1'
                )}
              >
                {link.label}
                {link.badge && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {link.badge}
                  </span>
                )}
                {/* Animated underline */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right Content */}
          {rightContent && (
            <div className="hidden md:flex items-center gap-4">
              {rightContent}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-neutral-200">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 hover:text-primary rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="font-medium">{link.label}</span>
                {link.badge && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            {rightContent && (
              <div className="px-4 py-2 border-t border-neutral-200 mt-4 pt-4 space-y-2">
                {rightContent}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
