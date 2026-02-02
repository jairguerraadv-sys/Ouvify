'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { MutedText } from '@/components/ui';
import { ArrowLeft, CheckCircle, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api, getErrorMessage } from '@/lib/api';

function ConfirmarRecuperacaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!uid || !token) {
      setError('Link inválido ou expirado');
    }
  }, [uid, token]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/password-reset/confirm/', {
        uid,
        token,
        new_password: password,
      });

      setSuccess(true);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao redefinir senha. O link pode estar expirado.');
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, uid, token, router]);

  if (!uid || !token) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-error/10 p-4">
                  <AlertCircle className="w-12 h-12 text-error" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Link Inválido</h2>
                  <MutedText block className="mb-6">
                    Este link de recuperação é inválido ou expirou.
                  </MutedText>
                </div>
                <Link href="/recuperar-senha">
                  <Button className="w-full">
                    Solicitar Novo Link
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
              {success ? 'Senha Redefinida!' : 'Nova Senha'}
            </CardTitle>
            <MutedText block className="text-center">
              {success 
                ? 'Sua senha foi alterada com sucesso'
                : 'Crie uma nova senha para sua conta'
              }
            </MutedText>
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
                  <MutedText block>
                    Você será redirecionado para o login em instantes...
                  </MutedText>
                </div>
                <Link href="/login">
                  <Button
                    className="w-full"
                    variant="default"
                  >
                    Ir para o Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-secondary">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-secondary">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite a senha novamente"
                      className="pl-10"
                      required
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
                  isLoading={loading}
                  disabled={loading}
                >
                  {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </main>
  );
}

export default function ConfirmarRecuperacaoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmarRecuperacaoContent />
    </Suspense>
  );
}
