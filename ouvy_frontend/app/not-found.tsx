'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full p-8 text-center bg-card rounded-xl shadow-lg border border-border">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="text-4xl font-bold text-primary">OUVY</div>
        </div>

        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20 mb-2">404</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6 rounded-full" />
        </div>

        {/* Content */}
        <h2 className="text-3xl font-bold text-secondary mb-4">
          Página Não Encontrada
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Ops! A página que você está procurando não existe ou foi movida para outro lugar.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="gap-2 w-full">
              <Home className="w-4 h-4" />
              Ir para Home
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="gap-2 w-full">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">
            Não encontrou o que procurava?
          </p>
          <Link 
            href="/acompanhar" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            Acompanhar um protocolo
          </Link>
        </div>
      </div>
    </div>
  );
}
