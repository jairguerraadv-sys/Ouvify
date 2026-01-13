'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { Button } from './button';

interface NavBarProps {
  links?: Array<{ label: string; href: string; active?: boolean }>;
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
  return (
    <nav
      className={cn(
        'w-full bg-white border-b border-neutral-200',
        sticky && 'sticky top-0 z-50',
        'shadow-sm',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo variant="full" linkTo="/" className="flex-shrink-0" />

          {/* Links Centrais */}
          {links.length > 0 && (
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    link.active
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-secondary hover:text-primary'
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Conteúdo à Direita */}
          <div className="flex items-center gap-4">
            {rightContent}
          </div>
        </div>
      </div>
    </nav>
  );
}

interface FooterProps {
  className?: string;
  showBranding?: boolean;
}

export function Footer({
  className,
  showBranding = true,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'bg-secondary text-white mt-16 py-12',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Branding */}
          {showBranding && (
            <div>
              <Logo
                variant="full"
                colorScheme="white"
                linkTo="/"
                className="mb-4"
              />
              <p className="text-sm text-neutral-300">
                Canal seguro de ética e denúncias para sua empresa.
              </p>
            </div>
          )}

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Planos</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Segurança</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">API</a></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Termos</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">LGPD</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-secondary-light pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-300">
          <p>&copy; {currentYear} Ouvy. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
