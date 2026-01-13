'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge-chip';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks/use-dashboard';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  MoreHorizontal,
  Zap,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface KPI {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: number;
  type: 'denuncia' | 'sugestao' | 'elogio' | 'resposta';
  description: string;
  time: string;
  avatar?: string;
}

export default function DashboardPage() {
  // Buscar dados reais do backend
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  
  const user = {
    name: 'João Silva',
    email: 'joao@empresa.com',
    // Plano defaulta para free até termos campo vindo do backend
    plano: (stats as any)?.plano || 'free'
  };

  // KPIs com dados dinâmicos
  const kpis: KPI[] = [
    {
      title: 'Total de Feedbacks',
      value: stats?.total.toString() || '0',
      change: stats?.hoje ? `+${stats.hoje} hoje` : undefined,
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'Pendentes',
      value: stats?.pendentes.toString() || '0',
      change: stats ? `${Math.round((stats.pendentes / stats.total) * 100)}% do total` : undefined,
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-warning/10 text-warning'
    },
    {
      title: 'Resolvidos',
      value: stats?.resolvidos.toString() || '0',
      change: stats ? `${Math.round((stats.resolvidos / stats.total) * 100)}% do total` : undefined,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-success/10 text-success'
    },
    {
      title: 'Taxa de Resolução',
      value: stats?.taxa_resolucao || '0%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-secondary/10 text-secondary'
    }
  ];

  // Atividades recentes
  const activities: Activity[] = [
    {
      id: 1,
      type: 'denuncia',
      description: 'Nova denúncia anônima: "Comportamento inadequado"',
      time: 'há 2 horas'
    },
    {
      id: 2,
      type: 'resposta',
      description: 'Você respondeu a denúncia OUVY-XGZ6-ZMMV',
      time: 'há 4 horas'
    },
    {
      id: 3,
      type: 'sugestao',
      description: 'Sugestão recebida: "Implementar home office"',
      time: 'há 1 dia'
    },
    {
      id: 4,
      type: 'elogio',
      description: 'Elogio ao suporte: "Excelente atendimento"',
      time: 'há 2 dias'
    }
  ];

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      denuncia: <AlertCircle className="h-5 w-5 text-red-600" />,
      sugestao: <MessageSquare className="h-5 w-5 text-blue-600" />,
      elogio: <CheckCircle className="h-5 w-5 text-green-600" />,
      resposta: <MessageSquare className="h-5 w-5 text-purple-600" />
    };
    return icons[type] || <MessageSquare className="h-5 w-5" />;
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <Header
          title="Visão Geral"
          subtitle={`Bem-vindo de volta, ${user.name.split(' ')[0]}!`}
          action={{
            label: 'Novo Relatório',
            href: '#'
          }}
          user={user}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 space-y-8">
            {/* Subscription Status Banner */}
            {user.plano === 'free' ? (
              <div className="bg-gradient-to-r from-cyan-50 to-primary/10 border border-primary/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Zap className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold text-secondary">Plano Free Ativo</h3>
                      <p className="text-sm text-neutral-600">Você está usando o plano gratuito. Upgrade para acessar mais funcionalidades.</p>
                    </div>
                  </div>
                  <Link href="/planos">
                    <Button variant="default">
                      Fazer Upgrade
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-success/10 to-success/5 border border-success/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-8 w-8 text-success" />
                    <div>
                      <h3 className="text-lg font-semibold text-secondary">
                        Plano {user.plano?.toUpperCase()} Ativo
                      </h3>
                      <p className="text-sm text-neutral-600">Sua assinatura está ativa e funcionando normalmente.</p>
                    </div>
                  </div>
                  <Badge variant="primary">✓ Premium</Badge>
                </div>
              </div>
            )}

            {/* KPI Cards - Grid 2x2 ou 4x1 */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi, idx) => (
                <Card key={idx} variant="elevated">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-neutral-600">
                        {kpi.title}
                      </div>
                      <div className={`p-2 rounded-lg ${kpi.color}`}>
                        {kpi.icon}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <div>
                        <Skeleton className="h-10 w-24 mb-1" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-secondary">{kpi.value}</div>
                        {kpi.change && (
                          <p className="text-xs text-neutral-600 mt-1">{kpi.change}</p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bento Grid - Gráficos e Atividades */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Gráfico - 2/3 da largura */}
              <Card variant="elevated" className="lg:col-span-2">
                <CardHeader>
                  <div>
                    <div className="font-semibold text-secondary">Denúncias por Mês</div>
                    <p className="text-sm text-neutral-600 mt-1">Histórico dos últimos 6 meses</p>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Placeholder para gráfico */}
                  <div className="h-64 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg flex items-center justify-center text-neutral-500 border border-neutral-200">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Gráfico será exibido aqui com Recharts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Atividades - 1/3 */}
              <Card variant="elevated">
                <CardHeader>
                  <div className="font-semibold text-secondary text-lg">Atividades Recentes</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary leading-tight">
                          {activity.description}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Feedbacks Recentes */}
            <Card variant="elevated">
              <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <div className="font-semibold text-secondary">Feedbacks Recentes</div>
                  <p className="text-sm text-neutral-600 mt-1">Últimos feedbacks recebidos</p>
                </div>
                <Button variant="outline" size="md">Ver todos</Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[
                    {
                      protocolo: 'OUVY-XGZ6-ZMMV',
                      tipo: 'Denúncia',
                      titulo: 'Comportamento inadequado',
                      status: 'em_analise',
                      data: '2026-01-11'
                    },
                    {
                      protocolo: 'OUVY-A3B9-K7M2',
                      tipo: 'Sugestão',
                      titulo: 'Home office 2x na semana',
                      status: 'pendente',
                      data: '2026-01-10'
                    },
                    {
                      protocolo: 'OUVY-M5N3-P8Q1',
                      tipo: 'Elogio',
                      titulo: 'Excelente atendimento do suporte',
                      status: 'resolvido',
                      data: '2026-01-09'
                    }
                  ].map((item) => (
                    <div
                      key={item.protocolo}
                      className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-primary/30 hover:bg-cyan-50/30 transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-xs bg-neutral-100 px-2 py-1 rounded font-mono text-neutral-700">
                            {item.protocolo}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {item.tipo}
                          </Badge>
                        </div>
                        <p className="text-sm text-secondary font-medium truncate">{item.titulo}</p>
                        <p className="text-xs text-neutral-600 mt-1">{item.data}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.status === 'resolvido'
                              ? 'success'
                              : item.status === 'em_analise'
                                ? 'primary'
                                : 'outline'
                          }
                        >
                          {item.status === 'resolvido' ? '✓ Resolvido' : item.status === 'em_analise' ? '⏳ Análise' : '○ Pendente'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
