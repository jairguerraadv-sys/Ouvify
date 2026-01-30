'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/helpers';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  plan_name: string;
  amount: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
}

const fetcher = async (url: string): Promise<Subscription> => {
  return api.get(url) as Promise<Subscription>;
};

export default function AssinaturaPage() {
  return (
    <ProtectedRoute>
      <AssinaturaContent />
    </ProtectedRoute>
  );
}

function AssinaturaContent() {
  const { data: subscription, error, mutate, isLoading } = useSWR<Subscription>(
    '/api/tenants/subscription/',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );
  
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCancelSubscription = async () => {
    const confirmMsg = 
      'Tem certeza que deseja cancelar sua assinatura?\n\n' +
      'Você ainda terá acesso a todos os recursos até o final do período pago.\n' +
      'Você pode reativar sua assinatura a qualquer momento.';
      
    if (!confirm(confirmMsg)) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/tenants/subscription/', {});
      await mutate(); // Recarregar dados
      alert('✅ Assinatura cancelada com sucesso!\n\nVocê terá acesso até ' + 
            (subscription?.current_period_end ? formatDate(subscription.current_period_end) : 'o fim do período'));
    } catch (err) {
      console.error('Erro ao cancelar assinatura:', err);
      alert('❌ Erro ao cancelar assinatura.\n\nTente novamente ou entre em contato com o suporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setLoading(true);
    try {
      await api.post('/api/tenants/subscription/reactivate/', {});
      await mutate(); // Recarregar dados
      alert('✅ Assinatura reativada com sucesso!\n\nSua cobrança será retomada normalmente.');
    } catch (err) {
      console.error('Erro ao reativar assinatura:', err);
      alert('❌ Erro ao reativar assinatura.\n\nTente novamente ou entre em contato com o suporte.');
    } finally {
      setLoading(false);
    }
  };

  // Estado de erro
  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar user={user || undefined} />
        <main className="flex-1 p-8">
          <Alert variant="error">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar informações da assinatura. Tente novamente ou entre em contato com o suporte.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // Estado de loading
  if (isLoading || !subscription) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar user={user || undefined} />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Mapear status para badges
  const statusConfig = {
    active: { 
      label: 'Ativa', 
      className: 'bg-success-100 text-success-700',
      icon: CheckCircle
    },
    canceled: { 
      label: 'Cancelada', 
      className: 'bg-error-100 text-error-700',
      icon: XCircle
    },
    past_due: { 
      label: 'Pagamento Pendente', 
      className: 'bg-warning-100 text-warning-700',
      icon: AlertTriangle
    },
    trialing: { 
      label: 'Período de Teste', 
      className: 'bg-primary-100 text-primary-700',
      icon: Clock
    },
    incomplete: { 
      label: 'Incompleta', 
      className: 'bg-gray-100 text-gray-700',
      icon: AlertTriangle
    },
  };

  const status = statusConfig[subscription.status] || statusConfig.incomplete;
  const StatusIcon = status.icon;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user || undefined} />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-secondary-600 mb-2">
              Minha Assinatura
            </h1>
            <p className="text-slate-600">
              Gerencie sua assinatura e forma de pagamento
            </p>
          </div>

          {/* Alert para pagamento pendente */}
          {subscription.status === 'past_due' && (
            <Alert variant="error">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Pagamento Pendente!</strong> Atualize sua forma de pagamento para manter o acesso.
              </AlertDescription>
            </Alert>
          )}

          {/* Alert para cancelamento agendado */}
          {subscription.cancel_at_period_end && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Sua assinatura será cancelada em <strong>{formatDate(subscription.current_period_end)}</strong>.
                Você pode reativá-la a qualquer momento antes desta data.
              </AlertDescription>
            </Alert>
          )}

          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Status da Assinatura</CardTitle>
                <Badge className={status.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Plano Atual</p>
                  <p className="text-xl font-semibold">{subscription.plan_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Valor</p>
                  <p className="text-xl font-semibold">
                    {subscription.currency.toUpperCase()} {(subscription.amount / 100).toFixed(2)}/mês
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Período Atual</p>
                  <p className="text-base font-medium">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Próxima Cobrança</p>
                  <p className="text-base font-medium">
                    {subscription.cancel_at_period_end 
                      ? 'Nenhuma (cancelada)' 
                      : formatDate(subscription.current_period_end)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Assinatura</CardTitle>
              <CardDescription>
                Altere ou cancele sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Botão de cancelar (se assinatura ativa) */}
              {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancelar Assinatura
                    </>
                  )}
                </Button>
              )}

              {/* Botão de reativar (se cancelamento agendado) */}
              {subscription.cancel_at_period_end && (
                <Button
                  onClick={handleReactivateSubscription}
                  disabled={loading}
                  className="w-full bg-success-600 hover:bg-success-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Reativar Assinatura
                    </>
                  )}
                </Button>
              )}

              {/* Botão de atualizar forma de pagamento */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => alert('Funcionalidade em desenvolvimento.\n\nEm breve você poderá atualizar sua forma de pagamento diretamente aqui.')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Atualizar Forma de Pagamento
              </Button>

              {/* Link para Stripe Customer Portal (futuro) */}
              <Button 
                variant="ghost" 
                className="w-full text-sm"
                onClick={() => window.open('https://billing.stripe.com/p/login/test_xxx', '_blank')}
                disabled
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Gerenciar no Stripe (Em breve)
              </Button>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>
                • Ao cancelar, você mantém acesso até o final do período pago.
              </p>
              <p>
                • Não há taxas de cancelamento.
              </p>
              <p>
                • Você pode reativar sua assinatura a qualquer momento.
              </p>
              <p>
                • Dúvidas? Entre em contato: <a href="mailto:suporte@ouvify.com.br" className="text-primary-600 hover:underline">suporte@ouvify.com.br</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
