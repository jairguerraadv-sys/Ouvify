'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Timer
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { toast } from 'sonner';

interface AnalyticsData {
  periodo: {
    inicio: string;
    fim: string;
  };
  metricas_gerais: {
    total_feedbacks: number;
    feedbacks_ultimos_30_dias: number;
    taxa_resolucao_percentual: number;
    tempo_medio_resposta_horas: number;
  };
  metricas_por_status: {
    pendente: number;
    em_analise: number;
    resolvido: number;
    fechado: number;
  };
  metricas_por_tipo: {
    reclamacao: number;
    sugestao: number;
    denuncia: number;
    elogio: number;
  };
  top_tenants: Array<{
    client__nome: string;
    total: number;
  }>;
  features_habilitadas: string[];
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <AnalyticsContent />
        </main>
      </div>
    </ProtectedRoute>
  );
}

function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<AnalyticsData>('/api/analytics/');
      setData(response);
    } catch (err: any) {
      console.error('Erro ao carregar analytics:', err);
      if (err?.response?.status === 403) {
        setError('Analytics não está habilitado para este ambiente. Contacte o administrador.');
      } else {
        setError('Erro ao carregar dados de analytics. Tente novamente.');
      }
      toast.error('Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Calcular variações percentuais (mock para demonstração)
  const variations = useMemo(() => {
    if (!data) return { feedbacks: 0, resolucao: 0 };
    // Em produção, comparar com período anterior
    return {
      feedbacks: 12.5, // +12.5%
      resolucao: -2.3, // -2.3%
    };
  }, [data]);

  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Analytics Indisponível
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-4">
          {error}
        </p>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            📊 Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Métricas e insights do período de {new Date(data.periodo.inicio).toLocaleDateString('pt-BR')} a {new Date(data.periodo.fim).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={MessageSquare}
          label="Total de Feedbacks"
          value={data.metricas_gerais.total_feedbacks}
          subValue={`${data.metricas_gerais.feedbacks_ultimos_30_dias} nos últimos 30 dias`}
          trend={variations.feedbacks}
          color="blue"
        />
        <KPICard
          icon={CheckCircle}
          label="Taxa de Resolução"
          value={`${data.metricas_gerais.taxa_resolucao_percentual}%`}
          subValue="Feedbacks resolvidos/fechados"
          trend={variations.resolucao}
          color="green"
        />
        <KPICard
          icon={Timer}
          label="Tempo Médio de Resposta"
          value={`${data.metricas_gerais.tempo_medio_resposta_horas}h`}
          subValue="Da criação até resolução"
          color="orange"
        />
        <KPICard
          icon={Clock}
          label="Pendentes"
          value={data.metricas_por_status.pendente}
          subValue={`${data.metricas_por_status.em_analise} em análise`}
          color="yellow"
        />
      </div>

      {/* Grid de 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Por Status
            </CardTitle>
            <CardDescription>
              Distribuição de feedbacks por status atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <MetricBar 
                label="Pendente" 
                value={data.metricas_por_status.pendente} 
                total={data.metricas_gerais.total_feedbacks}
                color="bg-yellow-500"
              />
              <MetricBar 
                label="Em Análise" 
                value={data.metricas_por_status.em_analise} 
                total={data.metricas_gerais.total_feedbacks}
                color="bg-primary-500"
              />
              <MetricBar 
                label="Resolvido" 
                value={data.metricas_por_status.resolvido} 
                total={data.metricas_gerais.total_feedbacks}
                color="bg-green-500"
              />
              <MetricBar 
                label="Fechado" 
                value={data.metricas_por_status.fechado} 
                total={data.metricas_gerais.total_feedbacks}
                color="bg-slate-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Métricas por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary-500" />
              Por Tipo
            </CardTitle>
            <CardDescription>
              Distribuição de feedbacks por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <MetricBar 
                label="Reclamação" 
                value={data.metricas_por_tipo.reclamacao} 
                total={data.metricas_gerais.total_feedbacks}
                color="bg-red-500"
              />
              <MetricBar 
                label="Sugestão" 
                value={data.metricas_por_tipo.sugestao} 
                total={data.metricas_gerais.total_feedbacks}
                color="bg-primary-500"
              />
              <MetricBar 
                label="Denúncia" 
                value={data.metricas_por_tipo.denuncia} 
                total={data.metricas_gerais.total_feedbacks}
                color="bg-orange-500"
              />
              <MetricBar 
                label="Elogio" 
                value={data.metricas_por_tipo.elogio} 
                total={data.metricas_gerais.total_feedbacks}
                color="bg-green-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Habilitadas */}
      {data.features_habilitadas && data.features_habilitadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🚀 Features Habilitadas</CardTitle>
            <CardDescription>
              Funcionalidades ativas neste ambiente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.features_habilitadas.map((feature) => (
                <Badge key={feature} variant="secondary" className="px-3 py-1">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Tenants (apenas para super admins - pode não estar disponível) */}
      {data.top_tenants && data.top_tenants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top Tenants por Volume</CardTitle>
            <CardDescription>
              Empresas com maior volume de feedbacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.top_tenants.map((tenant, index) => (
                <div 
                  key={tenant.client__nome} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${index === 1 ? 'bg-slate-200 text-slate-700' : ''}
                      ${index === 2 ? 'bg-orange-100 text-orange-700' : ''}
                      ${index > 2 ? 'bg-slate-100 text-slate-600' : ''}
                    `}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {tenant.client__nome}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {tenant.total} feedbacks
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente de KPI Card
interface KPICardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'yellow';
}

function KPICard({ icon: Icon, label, value, subValue, trend, color }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    purple: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
          {subValue && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{subValue}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Barra de Métrica
interface MetricBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function MetricBar({ label, value, total, color }: MetricBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Loading Skeleton
function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="w-12 h-12 rounded-xl mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
