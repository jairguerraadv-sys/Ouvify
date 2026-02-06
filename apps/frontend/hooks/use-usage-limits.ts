/**
 * Hook para gerenciar limites de uso de features (Feature Gating).
 * 
 * Busca estatísticas de uso do endpoint /api/v1/billing/usage/ e fornece
 * helpers para verificar se o tenant está próximo ou no limite.
 * 
 * Sprint 4 - FASE 1 (MOTOR SAAS & GATING)
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { usage, isNearLimit, isAtLimit, canCreateFeedback } = useUsageLimits();
 *   
 *   if (isAtLimit) {
 *     return <UpgradeAlert />;
 *   }
 *   
 *   return <Button disabled={!canCreateFeedback}>Criar Feedback</Button>;
 * }
 * ```
 */

import useSWR from 'swr';
import { api } from '@/lib/api';

/**
 * Interface para estatísticas de uso retornadas pela API.
 */
export interface UsageStats {
  /** Slug do plano atual (free, starter, pro, enterprise) */
  plan: string;
  
  /** Nome do plano para exibição */
  plan_name: string;
  
  /** Número de feedbacks criados este mês */
  feedbacks_used: number;
  
  /** Limite de feedbacks/mês (-1 = ilimitado) */
  feedbacks_limit: number;
  
  /** Porcentagem de uso (0-100) */
  usage_percent: number;
  
  /** Se atingiu o limite e está bloqueado */
  is_blocked: boolean;
  
  /** Se está próximo do limite (>80%) */
  is_near_limit: boolean;
}

/**
 * Hook para acessar estatísticas de uso e limites do plano.
 * 
 * Features:
 * - Auto-refresh a cada 60 segundos
 * - Revalida ao focar na janela
 * - Cache local SWR
 * - Helpers computados para checks comuns
 * 
 * @returns Objeto com dados de uso e helpers
 */
export function useUsageLimits() {
  const { data, error, mutate, isLoading } = useSWR<UsageStats>(
    '/api/v1/billing/usage/',
    {
      refreshInterval: 60000, // Atualiza a cada 1 minuto
      revalidateOnFocus: true, // Revalida ao voltar para a aba
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Evita múltiplas requisições em 5s
    }
  );

  return {
    /** Dados de uso (undefined enquanto carrega) */
    usage: data,
    
    /** Se está carregando dados */
    isLoading,
    
    /** Erro ao buscar dados */
    error,
    
    /** Função para forçar atualização dos dados */
    refetch: mutate,
    
    // ========================================
    // COMPUTED HELPERS
    // ========================================
    
    /**
     * Se está próximo do limite (>80%).
     * Usado para exibir avisos de alerta.
     */
    isNearLimit: data?.is_near_limit ?? false,
    
    /**
     * Se atingiu o limite (100%).
     * Usado para bloquear ações.
     */
    isAtLimit: data?.is_blocked ?? false,
    
    /**
     * Se está no plano Free.
     * Usado para exibir CTAs de upgrade.
     */
    isFreePlan: data?.plan === 'free',
    
    /**
     * Se pode criar novo feedback.
     * false = bloqueado (limite atingido)
     */
    canCreateFeedback: data ? !data.is_blocked : true,
    
    /**
     * Texto descritivo do uso atual.
     * Ex: "45 de 50 feedbacks usados (90%)"
     */
    usageText: data
      ? data.feedbacks_limit > 0
        ? `${data.feedbacks_used} de ${data.feedbacks_limit} feedbacks (${Math.round(data.usage_percent)}%)`
        : `${data.feedbacks_used} feedbacks (ilimitado)`
      : '',
    
    /**
     * Porcentagem de uso (0-100).
     * Útil para barras de progresso.
     */
    usagePercent: data?.usage_percent ?? 0,
    
    /**
     * Feedbacks restantes no mês.
     * -1 = ilimitado
     */
    feedbacksRemaining: data
      ? data.feedbacks_limit > 0
        ? Math.max(0, data.feedbacks_limit - data.feedbacks_used)
        : -1
      : 0,
  };
}

/**
 * Hook simplificado para apenas verificar se pode criar feedback.
 * 
 * @returns true se pode criar, false se está bloqueado
 * 
 * @example
 * ```tsx
 * const canCreate = useCanCreateFeedback();
 * return <Button disabled={!canCreate}>Criar</Button>;
 * ```
 */
export function useCanCreateFeedback(): boolean {
  const { canCreateFeedback } = useUsageLimits();
  return canCreateFeedback;
}
