'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { api, getErrorMessage } from '@/lib/api';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validação básica
    if (!email || !email.includes('@')) {
      setError('Por favor, insira um e-mail válido');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/password-reset/request/', { email });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao enviar e-mail de recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </Link>

        <Card variant="elevated" className="animate-scale-in">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <Logo size="xl" />
            </div>
            <CardTitle className="text-2xl text-center mb-2">
              {success ? 'E-mail Enviado!' : 'Recuperar Senha'}
            </CardTitle>
            <p className="text-center text-muted-foreground text-sm">
              {success 
                ? 'Verifique sua caixa de entrada'
                : 'Insira seu e-mail para receber as instruções'
              }
            </p>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-full bg-success/10 p-4">
                    <CheckCircle className="w-12 h-12 text-success" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Enviamos um link de recuperação para:
                  </p>
                  <p className="font-semibold text-secondary">{email}</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Não recebeu? Verifique sua pasta de spam ou tente novamente em alguns minutos.
                  </p>
                </div>
                <Button 
                  asChild
                  className="w-full"
                  variant="default"
                >
                  <Link href="/login">
                    Voltar para o Login
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-secondary">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Lembrou sua senha?{' '}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                      Fazer login
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Problemas com recuperação?{' '}
          <a href="mailto:support@ouvy.com" className="text-primary hover:underline">
            Entre em contato
          </a>
        </p>
      </div>
    </main>
  );
}
