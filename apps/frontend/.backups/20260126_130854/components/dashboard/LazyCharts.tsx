'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Componentes de gráficos com lazy loading para otimização de bundle
 * Carrega apenas quando necessário, reduzindo o tamanho inicial do bundle
 */

// Loading placeholder
const ChartSkeleton = () => (
  <div className="w-full h-full bg-muted/50 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-sm text-muted-foreground">Carregando gráfico...</div>
  </div>
);

// Lazy load dos componentes de charts
export const LazyBarChart = dynamic(
  () => import('./charts').then(mod => ({ default: mod.BarChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Não renderizar no servidor (melhor performance)
  }
) as ComponentType<any>;

export const LazyDonutChart = dynamic(
  () => import('./charts').then(mod => ({ default: mod.DonutChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as ComponentType<any>;

export const LazyLineChart = dynamic(
  () => import('./charts').then(mod => ({ default: mod.LineChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as ComponentType<any>;

export const LazyStatCard = dynamic(
  () => import('./charts').then(mod => ({ default: mod.StatCard })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as ComponentType<any>;
