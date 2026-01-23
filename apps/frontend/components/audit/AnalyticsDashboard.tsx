'use client';

/**
 * Dashboard de Analytics com gráficos Recharts
 */

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, Activity, Users, Shield, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getAuditAnalytics,
  getSessionStats,
  AuditAnalytics,
  SessionStats,
} from '@/lib/audit-log';

interface AnalyticsDashboardProps {
  className?: string;
}

// Cores para gráficos
const COLORS = {
  primary: '#00BCD4',
  secondary: '#0A1E3B',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const SEVERITY_COLORS: Record<string, string> = {
  INFO: COLORS.info,
  WARNING: COLORS.warning,
  ERROR: COLORS.error,
  CRITICAL: '#DC2626',
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.error];

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AuditAnalytics | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, statsData] = await Promise.all([
        getAuditAnalytics(parseInt(period)),
        getSessionStats(),
      ]);
      setAnalytics(analyticsData);
      setSessionStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Não foi possível carregar os dados de analytics.
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header com seletor de período */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Auditoria</h2>
          <p className="text-muted-foreground">
            Visão geral das atividades do sistema
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Total de Eventos"
          value={analytics.total_logs.toLocaleString()}
          icon={<Activity className="h-4 w-4" />}
          description={`nos últimos ${period} dias`}
        />
        <MetricCard
          title="Usuários Ativos"
          value={analytics.total_users_active.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          description="com atividade registrada"
        />
        <MetricCard
          title="Alertas de Segurança"
          value={analytics.security_alerts.toLocaleString()}
          icon={<Shield className="h-4 w-4" />}
          description="eventos críticos"
          variant={analytics.security_alerts > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          title="Sessões Ativas"
          value={sessionStats?.active_sessions.toLocaleString() || '0'}
          icon={<Clock className="h-4 w-4" />}
          description={`Média: ${sessionStats?.avg_session_duration_minutes || 0} min`}
        />
      </div>

      {/* Gráficos principais */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Gráfico de área - Atividade ao longo do tempo */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Atividade ao Longo do Tempo
            </CardTitle>
            <CardDescription>Eventos registrados por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.time_series}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value) => [String(value ?? 0), 'Eventos']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de barras - Ações mais frequentes */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Mais Frequentes</CardTitle>
            <CardDescription>Top 10 tipos de eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.action_breakdown.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis
                  type="category"
                  dataKey="action_display"
                  width={120}
                  className="text-xs"
                />
                <Tooltip
                  formatter={(value) => [String(value ?? 0), 'Eventos']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Bar dataKey="count" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de pizza - Severidade */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Severidade</CardTitle>
            <CardDescription>Classificação dos eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.severity_breakdown}
                  dataKey="count"
                  nameKey="severity_display"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {analytics.severity_breakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEVERITY_COLORS[entry.severity] || PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [String(value ?? 0), '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cards secundários */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Mais Ativos</CardTitle>
            <CardDescription>Por número de eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_users.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.user_nome || user.user_email}</p>
                      <p className="text-xs text-muted-foreground">{user.user_email}</p>
                    </div>
                  </div>
                  <span className="font-medium">{user.action_count.toLocaleString()}</span>
                </div>
              ))}
              {analytics.top_users.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum dado disponível
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dispositivos e navegadores */}
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos & Navegadores</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionStats && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Por Dispositivo</h4>
                  <div className="space-y-2">
                    {sessionStats.device_breakdown.map((item) => (
                      <div key={item.device_type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {item.device_type || 'Desconhecido'}
                        </span>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-3">Por Navegador</h4>
                  <div className="space-y-2">
                    {sessionStats.browser_breakdown.map((item) => (
                      <div key={item.browser} className="flex items-center justify-between">
                        <span className="text-sm">{item.browser || 'Desconhecido'}</span>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===== COMPONENTES AUXILIARES =====

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  variant?: 'default' | 'warning';
}

function MetricCard({ title, value, icon, description, variant = 'default' }: MetricCardProps) {
  return (
    <Card className={variant === 'warning' ? 'border-yellow-500' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={variant === 'warning' ? 'text-yellow-500' : 'text-muted-foreground'}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variant === 'warning' ? 'text-yellow-600' : ''}`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="col-span-2 h-[350px]" />
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
