'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useDashboardStats } from '@/hooks/use-dashboard';
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
  const { stats, isLoading } = useDashboardStats();

  const user = {
    name: 'João Silva',
    email: 'joao@empresa.com',
    avatar: undefined
  };

  // KPIs
  const kpis = [
    {
      title: 'Total de Feedbacks',
      value: stats?.total?.toString() || '0',
      change: stats?.hoje ? `+${stats.hoje} hoje` : '+12 esta semana',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-primary-600 bg-primary-50'
    },
    {
      title: 'Em Análise',
      value: stats?.pendentes?.toString() || '0',
      change: '23% do total',
      trend: 'neutral',
      icon: Clock,
      color: 'text-warning bg-warning-light'
    },
    {
      title: 'Resolvidos',
      value: stats?.resolvidos?.toString() || '0',
      change: '76% taxa de resolução',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-success bg-success-light'
    },
    {
      title: 'Tempo Médio',
      value: '2.4h',
      change: '-18% vs mês passado',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-secondary-600 bg-secondary-50'
    }
  ];

  // Atividades recentes
  const activities = [
    {
      type: 'denuncia',
      title: 'Nova denúncia anônima recebida',
      time: 'há 2 horas',
      color: 'bg-red-100 text-red-600'
    },
    {
      type: 'resposta',
      title: 'Você respondeu OUVY-XGZ6-ZMMV',
      time: 'há 4 horas',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      type: 'sugestao',
      title: 'Sugestão: "Home office 2x semana"',
      time: 'há 1 dia',
      color: 'bg-green-100 text-green-600'
    },
    {
      type: 'elogio',
      title: 'Elogio ao time de suporte',
      time: 'há 2 dias',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  // Feedbacks recentes
  const recentFeedbacks = [
    {
      protocolo: 'OUVY-XGZ6-ZMMV',
      tipo: 'Denúncia',
      titulo: 'Comportamento inadequado no escritório',
      status: 'em_analise',
      data: 'há 2 horas'
    },
    {
      protocolo: 'OUVY-A3B9-K7M2',
      tipo: 'Sugestão',
      titulo: 'Implementar home office híbrido',
      status: 'pendente',
      data: 'há 5 horas'
    },
    {
      protocolo: 'OUVY-M5N3-P8Q1',
      tipo: 'Elogio',
      titulo: 'Excelente atendimento do suporte',
      status: 'resolvido',
      data: 'há 1 dia'
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar user={user} />

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
                Bem-vindo de volta, {user.name.split(' ')[0]}!
              </p>
            </div>
            <Button className="bg-primary-500 hover:bg-primary-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Relatório
            </Button>
          </div>
        </div>

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
              <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
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
              <div className="space-y-4">
                {activities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${activity.color}`}>
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-600 leading-tight">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
            <div className="space-y-3">
              {recentFeedbacks.map((feedback) => (
                <div
                  key={feedback.protocolo}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all group cursor-pointer"
                >
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
                      {feedback.titulo}
                    </p>
                    <p className="text-xs text-slate-500">{feedback.data}</p>
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
                          ? 'bg-blue-100 text-blue-700'
                          : ''
                      }
                    >
                      {feedback.status === 'resolvido' && '✓ Resolvido'}
                      {feedback.status === 'em_analise' && '⏳ Análise'}
                      {feedback.status === 'pendente' && '○ Pendente'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
