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
        'bg-secondary text-secondary-foreground mt-20 py-16 border-t border-secondary/20',
        className
      )}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Branding */}
          {showBranding && (
            <div className="space-y-4">
              <Logo
                size="lg"
              />
              <p className="text-sm text-secondary-foreground/80 leading-relaxed max-w-xs">
                Plataforma segura para gerenciar feedbacks e denúncias com conformidade LGPD.
              </p>
            </div>
          )}

          {/* Produto */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-secondary-foreground">Produto</h3>
            <ul className="space-y-3 text-sm text-secondary-foreground/80">
              <li>
                <a 
                  href="/precos" 
                  className="hover:text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Preços
                </a>
              </li>
              <li>
                <a 
                  href="/recursos/seguranca" 
                  className="hover:text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Segurança
                </a>
              </li>
              <li>
                <a 
                  href="/recursos" 
                  className="hover:text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Recursos
                </a>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-secondary-foreground">Suporte</h3>
            <ul className="space-y-3 text-sm text-secondary-foreground/80">
              <li>
                <a 
                  href="/recursos/documentacao" 
                  className="hover:text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Documentação
                </a>
              </li>
              <li>
                <a 
                  href="/recursos/faq" 
                  className="hover:text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contato@ouvy.com" 
                  className="hover:text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-secondary-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-secondary-foreground/80">
              <li>
                <a 
                  href="/privacidade" 
                  className="hover:text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Privacidade
                </a>
              </li>
              <li>
                <a 
                  href="/termos" 
                  className="hover:text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Termos
                </a>
              </li>
              <li>
                <a 
                  href="/lgpd" 
                  className="hover:text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  LGPD
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-secondary/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-secondary-foreground/70 gap-4">
          <p>&copy; {currentYear} Ouvy. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a 
              href="https://twitter.com/ouvy" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-label="Twitter"
            >
              Twitter
            </a>
            <a 
              href="https://linkedin.com/company/ouvy" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
            <a 
              href="https://github.com/ouvy" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-label="GitHub"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
