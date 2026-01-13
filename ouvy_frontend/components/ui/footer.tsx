'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

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
        'bg-secondary text-white mt-20 py-12',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Branding */}
          {showBranding && (
            <div className="space-y-2">
              <Logo
                variant="full"
                colorScheme="white"
                size="md"
                href="/"
              />
              <p className="text-sm text-neutral-300">
                Plataforma segura para gerenciar feedbacks e denúncias.
              </p>
            </div>
          )}

          {/* Produto */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Produto</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-primary transition-colors">Planos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Recursos</a></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-primary transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">LGPD</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-400">
          <p>&copy; {currentYear} Ouvy. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
