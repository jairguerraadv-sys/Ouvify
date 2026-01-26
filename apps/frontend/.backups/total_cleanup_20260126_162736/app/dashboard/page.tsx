'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { OnboardingTour } from '@/components/OnboardingTour';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useDashboardStats, useFeedbacks } from '@/hooks/use-dashboard';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Plus,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { stats, isLoading } = useDashboardStats();
  const { feedbacks, isLoading: feedbacksLoading } = useFeedbacks({}, 1, 5);
  const { user } = useAuth();

  // KPIs - Usando dados reais da API
  const kpis = [
    {
      title: 'Total de Feedbacks',
      value: stats?.total?.toString() || '0',
      change: stats?.hoje ? `+${stats.hoje} hoje` : 'Nenhum hoje',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-primary-600 bg-primary-50'
    },
    {
      title: 'Em Análise',
      value: stats?.pendentes?.toString() || '0',
      change: stats?.total ? `${Math.round((stats.pendentes / stats.total) * 100)}% do total` : '0% do total',
      trend: 'neutral',
      icon: Clock,
      color: 'text-warning bg-warning-light'
    },
    {
      title: 'Resolvidos',
      value: stats?.resolvidos?.toString() || '0',
      change: stats?.total ? `${Math.round((stats.resolvidos / stats.total) * 100)}% taxa de resolução` : '0% taxa',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-success bg-success-light'
    },
    {
      title: 'Média de Tempo',
      value: stats?.tempo_medio_resposta || 'N/A',
      change: stats?.variacao_tempo || 'Sem dados',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-secondary-600 bg-secondary-50'
    }
  ];

  // Formatador de tempo relativo
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
      if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
      return 'há alguns minutos';
    } catch {
      return 'recentemente';
    }
  };

  // Mapear tipo de feedback para cor de atividade
  const getActivityColor = (tipo: string) => {
    const tipoLower = tipo?.toLowerCase() || '';
    if (tipoLower.includes('denúncia') || tipoLower.includes('denuncia')) return 'bg-red-100 text-red-600';
    if (tipoLower.includes('sugestão') || tipoLower.includes('sugestao')) return 'bg-green-100 text-green-600';
    if (tipoLower.includes('elogio')) return 'bg-secondary-100 text-secondary-600';
    if (tipoLower.includes('dúvida') || tipoLower.includes('duvida')) return 'bg-primary-100 text-primary-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar user={user || undefined} />

      {/* Onboarding Components */}
      <OnboardingTour />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-600 mb-2">
                Visão Geral
              </h1>
              <p className="text-slate-600">
                Bem-vindo de volta, {user?.name?.split(' ')[0] || 'Usuário'}!
              </p>
            </div>
            <Button className="bg-primary-500 hover:bg-primary-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Relatório
            </Button>
          </div>
        </div>

        {/* Onboarding Checklist */}
        <OnboardingChecklist />

        {/* KPIs Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Card key={idx} className="hover:shadow-large transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">
                      {kpi.title}
                    </p>
                    <div className={`p-2 rounded-lg ${kpi.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-secondary-600 mb-1">
                        {kpi.value}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        {kpi.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-600" />}
                        {kpi.change}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bento Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-8">
          {/* Chart - 2 colunas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Denúncias por Mês</CardTitle>
              <CardDescription>Histórico dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                <div className="text-center text-slate-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Gráfico Recharts aqui</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividades - 1 coluna */}
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacksLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : feedbacks && feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.slice(0, 4).map((feedback) => (
                    <div key={feedback.id} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getActivityColor(feedback.tipo)}`}>
                        <div className="h-2 w-2 rounded-full bg-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-600 leading-tight">
                          {feedback.tipo}: {feedback.titulo || 'Sem título'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatRelativeTime(feedback.data_criacao)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feedbacks Table */}
        <Card>
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Feedbacks Recentes</CardTitle>
                <CardDescription>Últimas mensagens recebidas</CardDescription>
              </div>
              <Link href="/dashboard/feedbacks">
                <Button variant="outline" size="sm">
                  Ver todos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {feedbacksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg border border-slate-200">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : feedbacks && feedbacks.length > 0 ? (
              <div className="space-y-3">
                {feedbacks.map((feedback) => (
                  <Link
                    key={feedback.id}
                    href={`/dashboard/feedbacks/${feedback.protocolo}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all group cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                            {feedback.protocolo}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {feedback.tipo}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-secondary-600 truncate mb-1">
                          {feedback.titulo || 'Sem título'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatRelativeTime(feedback.data_criacao)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge
                          variant={
                            feedback.status === 'resolvido'
                              ? 'default'
                              : feedback.status === 'em_analise'
                              ? 'secondary'
                              : 'outline'
                          }
                          className={
                            feedback.status === 'resolvido'
                              ? 'bg-green-100 text-green-700'
                              : feedback.status === 'em_analise'
                              ? 'bg-primary-100 text-primary-700'
                              : ''
                          }
                        >
                          {feedback.status === 'resolvido' && '✓ Resolvido'}
                          {feedback.status === 'em_analise' && '⏳ Análise'}
                          {feedback.status === 'pendente' && '○ Pendente'}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum feedback ainda</p>
                <p className="text-sm">Os feedbacks recebidos aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

