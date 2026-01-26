'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoError } from '@/components/ui/logo';
import { Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-white min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        
        {/* ✅ Logo grande */}
        <div className="mb-8">
          <LogoError />
        </div>

        <h1 className="text-6xl font-bold text-gradient-brand mb-4">
          Algo deu errado
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Desculpe pelo inconveniente. Nossa equipe já foi notificada.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="default" 
            size="lg"
            onClick={reset}
            className="gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar Novamente
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              Voltar para Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
