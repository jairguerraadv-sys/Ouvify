'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-error/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card variant="elevated" className="max-w-2xl w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <Logo size="xl" />
        </div>

        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-error/10 p-6">
            <AlertTriangle className="w-16 h-16 text-error" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-3xl font-bold text-secondary mb-4">
          Algo deu errado!
        </h2>
        <p className="text-muted-foreground text-lg mb-2">
          Ocorreu um erro inesperado ao processar sua solicitação.
        </p>
        {error.message && (
          <p className="text-sm text-error/80 mb-8 font-mono bg-error/5 p-4 rounded-lg max-w-md mx-auto">
            {error.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Tentar Novamente
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Voltar ao Início
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">
            Se o problema persistir, entre em contato conosco
          </p>
          <a 
            href="mailto:support@ouvy.com" 
            className="text-primary hover:text-primary-dark font-medium transition-colors"
          >
            support@ouvy.com
          </a>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-4">
              Código de erro: {error.digest}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
