import useSWR from 'swr';
import { api, apiClient } from '@/lib/api';
import type {
  DashboardStats,
  Feedback,
  FeedbackFilters,
  PaginatedResponse,
} from '@/lib/types';

// Re-exportar para compatibilidade
export { apiClient };

// Fetcher para SWR
export const fetcher = async <T,>(url: string): Promise<T> => {
  return api.get<T>(url);
};

// Hook para estatísticas do dashboard
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    '/api/feedbacks/dashboard-stats/',
    fetcher,
    {
      refreshInterval: 30000, // Atualizar a cada 30 segundos
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Evitar requisições duplicadas em 5s
    }
  );

  return {
    stats: data,
    isLoading,
    error: error?.message,
    refresh: mutate,
  };
}

// Hook para lista de feedbacks com paginação
export function useFeedbacks(filters?: FeedbackFilters, page = 1, pageSize = 10) {
  // Construir query params
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('page_size', pageSize.toString());
  
  if (filters) {
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.tipo) queryParams.append('tipo', filters.tipo);
    if (filters.categoria) queryParams.append('categoria', filters.categoria);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.data_inicio) queryParams.append('data_inicio', filters.data_inicio);
    if (filters.data_fim) queryParams.append('data_fim', filters.data_fim);
  }
  
  const url = `/api/feedbacks/?${queryParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Feedback>>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    feedbacks: data?.results || [],
    total: data?.count || 0,
    hasMore: !!data?.next,
    isLoading,
    error: error?.message,
    refresh: mutate,
  };
}

// Hook para um feedback específico
export function useFeedback(protocolo: string) {
  const { data, error, isLoading, mutate } = useSWR<Feedback>(
    protocolo ? `/api/feedbacks/${protocolo}/` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return {
    feedback: data,
    isLoading,
    error: error?.message,
    refresh: mutate,
  };
}

// Hook para atualizar status de um feedback
export function useUpdateFeedbackStatus() {
  const updateStatus = async (
    protocolo: string,
    status: Feedback['status'],
    resposta?: string
  ): Promise<Feedback> => {
    const data = { status, resposta_empresa: resposta };
    return api.patch<Feedback>(`/api/feedbacks/${protocolo}/`, data);
  };

  return { updateStatus };
}

// Hook para criar novo feedback
export function useCreateFeedback() {
  const createFeedback = async (data: Partial<Feedback>): Promise<Feedback> => {
    return api.post<Feedback>('/api/feedbacks/', data);
  };

  return { createFeedback };
}

/**
 * Hook para atualização completa de feedback (PUT)
 * 
 * Diferença entre PUT e PATCH:
 * - PUT: Atualização COMPLETA - requer todos os campos obrigatórios
 * - PATCH: Atualização PARCIAL - apenas campos fornecidos são atualizados
 * 
 * Use PUT quando precisar garantir que todos os campos sejam definidos.
 * Use PATCH (mais comum) para atualizações parciais.
 */
export function useFullUpdateFeedback() {
  /**
   * Atualização completa do feedback (PUT)
   * Todos os campos obrigatórios devem ser fornecidos
   */
  const fullUpdate = async (
    feedbackId: number,
    data: {
      tipo: string;
      titulo: string;
      descricao: string;
      status: string;
      email_contato?: string;
      anonimo?: boolean;
    }
  ): Promise<Feedback> => {
    return api.put<Feedback>(`/api/feedbacks/${feedbackId}/`, data);
  };

  /**
   * Atualização parcial do feedback (PATCH) - mais comum
   */
  const partialUpdate = async (
    feedbackId: number,
    data: Partial<Feedback>
  ): Promise<Feedback> => {
    return api.patch<Feedback>(`/api/feedbacks/${feedbackId}/`, data);
  };

  return { fullUpdate, partialUpdate };
}

// Função auxiliar para consultar protocolo público
export async function consultarProtocolo(codigo: string): Promise<Feedback> {
  return api.get<Feedback>(`/api/feedbacks/consultar-protocolo/?codigo=${codigo}`);
}

// Função para excluir feedback
export async function deleteFeedback(id: number): Promise<void> {
  return api.delete(`/api/feedbacks/${id}/`);
}
