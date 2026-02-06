'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { OnboardingTour } from '@/components/OnboardingTour';
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { FlexBetween, PageContent, PageLayout } from '@/components/ui';
import { useDashboardStats, useFeedbacks, useAnalytics } from '@/hooks/use-dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FeedbackTrendChart, 
  FeedbackTypeChart, 
  ResponseTimeChart 
} from '@/components/dashboard/RechartsComponents';
import { SLAComplianceWidget } from '@/components/dashboard/Widgets';
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
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}

function DashboardContent() {
  const { stats, isLoading } = useDashboardStats();
  const { feedbacks, isLoading: feedbacksLoading } = useFeedbacks({}, 1, 5);
  const { trend, byType, responseTime, summary } = useAnalytics();
  const { user } = useAuth();

  // KPIs - Usando dados reais da API
  const kpis = [
    {
      title: 'Total de Feedbacks',
      value: stats?.total?.toString() || '0',
      change: stats?.hoje ? `+${stats.hoje} hoje` : 'Nenhum hoje',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-primary bg-primary/10'
    },
    {
      title: 'Em Análise',
      value: stats?.pendentes?.toString() || '0',
      change: stats?.total ? `${Math.round((stats.pendentes / stats.total) * 100)}% do total` : '0% do total',
      trend: 'neutral',
      icon: Clock,
      color: 'text-warning bg-warning/10'
    },
    {
      title: 'Resolvidos',
      value: stats?.resolvidos?.toString() || '0',
      change: stats?.total ? `${Math.round((stats.resolvidos / stats.total) * 100)}% taxa de resolução` : '0% taxa',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-success bg-success/10'
    },
    {
      title: 'Média de Tempo',
      value: stats?.tempo_medio_resposta || 'N/A',
      change: stats?.variacao_tempo || 'Sem dados',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-secondary bg-secondary/10'
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
    if (tipoLower.includes('denúncia') || tipoLower.includes('denuncia')) return 'bg-error/10 text-error';
    if (tipoLower.includes('sugestão') || tipoLower.includes('sugestao')) return 'bg-success/10 text-success';
    if (tipoLower.includes('elogio')) return 'bg-secondary/10 text-secondary';
    if (tipoLower.includes('dúvida') || tipoLower.includes('duvida')) return 'bg-primary/10 text-primary';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <PageLayout variant="secondary" className="min-h-0">
      <PageContent padding="none" maxWidth="full">
        <div>
          <OnboardingTour />
          <PageHeader
            title="Viso Geral"
            description={`Bem-vindo de volta, ${user?.name?.split(' ')[0] || 'Usurio'}!`}
            action={{
              label: 'Novo Relatrio',
              icon: Plus,
            }}
          />

          {/* Onboarding Checklist */}
          <OnboardingChecklist />

        {/* KPIs Grid */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Card key={idx} className="hover:shadow-large transition-shadow">
                <CardHeader className="pb-2">
                  <FlexBetween>
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <div className={`p-2 rounded-lg ${kpi.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </FlexBetween>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {kpi.value}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {kpi.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-success" />}
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
          <div className="lg:col-span-2">
            <FeedbackTrendChart data={trend} />
          </div>

          {/* SLA Compliance Widget */}
          <div>
            <SLAComplianceWidget 
              compliance={summary.slaCompliance} 
              target={80}
              trend="up"
              details={{
                onTime: Math.round(summary.totalFeedbacks * 0.85),
                late: Math.round(summary.totalFeedbacks * 0.10),
                pending: Math.round(summary.totalFeedbacks * 0.05),
              }}
            />
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-8">
          {/* Response Time Chart */}
          <div className="lg:col-span-2">
            <ResponseTimeChart data={responseTime} />
          </div>

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
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {feedback.tipo}: {feedback.titulo || 'Sem título'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatRelativeTime(feedback.data_criacao)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feedbacks Table */}
        <Card>
          <CardHeader className="border-b border-border">
            <FlexBetween>
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
            </FlexBetween>
          </CardHeader>
          <CardContent className="pt-6">
            {feedbacksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg border border-border">
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
                    <FlexBetween className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-all group cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                            {feedback.protocolo}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {feedback.tipo}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate mb-1">
                          {feedback.titulo || 'Sem título'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(feedback.data_criacao)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge
                          variant={
                            feedback.status === 'resolvido'
                              ? 'success'
                              : feedback.status === 'em_analise'
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {feedback.status === 'resolvido' && '✓ Resolvido'}
                          {feedback.status === 'em_analise' && '⏳ Análise'}
                          {feedback.status === 'pendente' && '○ Pendente'}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </FlexBetween>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum feedback ainda</p>
                <p className="text-sm">Os feedbacks recebidos aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </PageContent>
    </PageLayout>
  );
}

