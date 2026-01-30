/**
 * Dashboard Charts with Recharts - Ouvify
 * Sprint 5 - Feature 5.1: Dashboard Melhorado
 * 
 * Gráficos avançados usando Recharts
 */
'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Theme colors
const COLORS = {
  primary: '#FF7F00',
  secondary: '#1E3A5F',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.error];

interface FeedbackTrendData {
  month: string;
  denuncias: number;
  sugestoes: number;
  elogios: number;
  duvidas: number;
}

interface FeedbackTypeData {
  name: string;
  value: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface ResponseTimeData {
  day: string;
  tempo: number;
  meta: number;
}

// Feedback Trend Chart (Area Chart)
export function FeedbackTrendChart({ data }: { data: FeedbackTrendData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de Feedbacks</CardTitle>
        <CardDescription>Evolução mensal por tipo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDenuncias" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.error} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.error} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSugestoes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorElogios" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="denuncias" 
              name="Denúncias"
              stroke={COLORS.error} 
              fillOpacity={1} 
              fill="url(#colorDenuncias)" 
            />
            <Area 
              type="monotone" 
              dataKey="sugestoes" 
              name="Sugestões"
              stroke={COLORS.success} 
              fillOpacity={1} 
              fill="url(#colorSugestoes)" 
            />
            <Area 
              type="monotone" 
              dataKey="elogios" 
              name="Elogios"
              stroke={COLORS.primary} 
              fillOpacity={1} 
              fill="url(#colorElogios)" 
            />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Feedback Type Distribution (Pie Chart)
export function FeedbackTypeChart({ data }: { data: FeedbackTypeData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Tipo</CardTitle>
        <CardDescription>Proporção de feedbacks</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Status Distribution (Bar Chart)
export function StatusBarChart({ data }: { data: StatusData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Feedbacks</CardTitle>
        <CardDescription>Distribuição atual</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              width={80}
            />
            <Tooltip />
            <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Response Time Chart (Line Chart)
export function ResponseTimeChart({ data }: { data: ResponseTimeData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo de Resposta</CardTitle>
        <CardDescription>Média diária vs Meta SLA</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              unit="h"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="tempo" 
              name="Tempo Real"
              stroke={COLORS.primary} 
              strokeWidth={2}
              dot={{ fill: COLORS.primary }}
            />
            <Line 
              type="monotone" 
              dataKey="meta" 
              name="Meta SLA"
              stroke={COLORS.secondary} 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Weekly Activity Heatmap (simplified)
interface HeatmapData {
  day: string;
  hour: string;
  value: number;
}

export function ActivityHeatmap({ data }: { data: HeatmapData[] }) {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const hours = ['00h', '06h', '12h', '18h'];
  
  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value <= 2) return 'bg-primary-100';
    if (value <= 5) return 'bg-primary-300';
    if (value <= 10) return 'bg-primary-500';
    return 'bg-primary-700';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Semanal</CardTitle>
        <CardDescription>Feedbacks por dia/hora</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 text-xs text-gray-500 pr-2">
            {hours.map(h => <span key={h} className="h-6 flex items-center">{h}</span>)}
          </div>
          {days.map(day => (
            <div key={day} className="flex flex-col items-center gap-1">
              {[0, 1, 2, 3].map(hourIdx => {
                const cellData = data.find(d => d.day === day && d.hour === hours[hourIdx]);
                return (
                  <div
                    key={`${day}-${hourIdx}`}
                    className={`w-8 h-6 rounded ${getColor(cellData?.value || 0)}`}
                    title={`${day} ${hours[hourIdx]}: ${cellData?.value || 0} feedbacks`}
                  />
                );
              })}
              <span className="text-xs text-gray-500 mt-1">{day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <span>Menos</span>
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <div className="w-4 h-4 bg-primary-100 rounded" />
          <div className="w-4 h-4 bg-primary-300 rounded" />
          <div className="w-4 h-4 bg-primary-500 rounded" />
          <div className="w-4 h-4 bg-primary-700 rounded" />
          <span>Mais</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Export all
export default {
  FeedbackTrendChart,
  FeedbackTypeChart,
  StatusBarChart,
  ResponseTimeChart,
  ActivityHeatmap,
};
