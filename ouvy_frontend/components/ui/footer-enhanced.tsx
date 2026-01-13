'use client';

import React from 'react';
import Link from 'next/link';
import { LogoEnhanced } from './logo-enhanced';
import { cn } from '@/lib/utils';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  sections?: FooterSection[];
  socials?: Array<{ icon: string; href: string; label: string }>;
  copyright?: string;
  className?: string;
}

export function FooterEnhanced({
  sections = [],
  socials = [],
  copyright = `© ${new Date().getFullYear()} Ouvy. Todos os direitos reservados.`,
  className,
}: FooterProps) {
  const defaultSections: FooterSection[] = [
    {
      title: 'Produto',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Preços', href: '#pricing' },
        { label: 'Documentação', href: '/docs' },
        { label: 'Status', href: 'https://status.ouvy.com', external: true },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Carreiras', href: '/careers' },
        { label: 'Contato', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacidade', href: '/privacy' },
        { label: 'Termos', href: '/terms' },
        { label: 'Conformidade', href: '/compliance' },
        { label: 'Segurança', href: '/security' },
      ],
    },
  ];

  const footerSections = sections.length > 0 ? sections : defaultSections;

  return (
    <footer
      className={cn(
        'relative border-t border-neutral-200 bg-gradient-to-b from-white to-neutral-50',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 md:pb-16 border-b border-neutral-200">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <LogoEnhanced
              variant="stacked"
              size="lg"
              colorScheme="auto"
              href="/"
              showTagline={true}
            />
            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
              Plataforma completa de canal de ética e conformidade para empresas modernas.
            </p>

            {/* Social Links */}
            {socials.length > 0 && (
              <div className="flex gap-4 mt-6">
                {socials.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
                      'bg-neutral-100 text-neutral-600 hover:bg-primary hover:text-white',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                    )}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'text-sm text-neutral-600 hover:text-primary transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded'
                        )}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className={cn(
                          'text-sm text-neutral-600 hover:text-primary transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded'
                        )}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-sm text-neutral-600">
            {copyright}
          </p>

          {/* Additional Links */}
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-neutral-600 hover:text-primary transition-colors"
            >
              Preferências de Cookie
            </a>
            <a
              href="#"
              className="text-neutral-600 hover:text-primary transition-colors"
            >
              Relatórios de Segurança
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
