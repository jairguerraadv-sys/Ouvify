import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoError } from '@/components/ui/logo';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        
        {/* ✅ Logo grande */}
        <div className="mb-8">
          <LogoError />
        </div>

        {/* Erro 404 */}
        <h1 className="text-9xl font-bold text-gradient-brand mb-4">
          404
        </h1>
        
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          Página não encontrada
        </h2>
        
        <p className="text-lg text-text-secondary mb-8">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="default" size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              Voltar para Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
