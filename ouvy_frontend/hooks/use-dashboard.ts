import useSWR from 'swr';
import axios from 'axios';

// Configuração do axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Criar instância do axios com configurações padrão
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use((config) => {
  // Tentar obter token do localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    const tenantId = localStorage.getItem('tenant_id');
    
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Adicionar tenant ID no header para desenvolvimento
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
  }
  
  return config;
});

// Tipos de dados
export interface DashboardStats {
  total: number;
  pendentes: number;
  resolvidos: number;
  hoje: number;
  taxa_resolucao: string;
}

export interface Feedback {
  id: number;
  protocolo: string;
  tipo: 'denuncia' | 'sugestao' | 'elogio' | 'reclamacao';
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_analise' | 'resolvido' | 'fechado';
  categoria: string;
  anonimo: boolean;
  email_contato: string | null;
  data_criacao: string;
  data_atualizacao: string;
  resposta_empresa?: string | null;
  data_resposta?: string | null;
}

export interface FeedbackFilters {
  status?: string;
  tipo?: string;
  categoria?: string;
  search?: string;
}

// Fetcher genérico para SWR
export const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url);
  return response.data;
};

// Hook para estatísticas do dashboard
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    '/api/feedbacks/dashboard-stats/',
    fetcher,
    {
      refreshInterval: 30000, // Atualizar a cada 30 segundos
      revalidateOnFocus: true, // Revalidar quando usuário volta à aba
      revalidateOnReconnect: true, // Revalidar quando reconectar
    }
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

// Hook para lista de feedbacks
export function useFeedbacks(filters?: FeedbackFilters) {
  // Construir query params
  const queryParams = new URLSearchParams();
  
  if (filters) {
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.tipo) queryParams.append('tipo', filters.tipo);
    if (filters.categoria) queryParams.append('categoria', filters.categoria);
    if (filters.search) queryParams.append('search', filters.search);
  }
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `/api/feedbacks/?${queryString}` 
    : '/api/feedbacks/';

  const { data, error, isLoading, mutate } = useSWR<Feedback[]>(
    url,
    fetcher,
    {
      refreshInterval: 10000, // Atualizar a cada 10 segundos
      revalidateOnFocus: true,
    }
  );

  return {
    data: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Função auxiliar para criar feedback
export async function createFeedback(feedback: Partial<Feedback>): Promise<Feedback> {
  const response = await apiClient.post<Feedback>('/api/feedbacks/', feedback);
  return response.data;
}

// Função auxiliar para atualizar feedback
export async function updateFeedback(id: number, updates: Partial<Feedback>): Promise<Feedback> {
  const response = await apiClient.patch<Feedback>(`/api/feedbacks/${id}/`, updates);
  return response.data;
}

// Função auxiliar para deletar feedback
export async function deleteFeedback(id: number): Promise<void> {
  await apiClient.delete(`/api/feedbacks/${id}/`);
}

// Função auxiliar para consultar protocolo público
export async function consultarProtocolo(codigo: string) {
  const response = await apiClient.get(`/api/feedbacks/consultar-protocolo/?codigo=${codigo}`);
  return response.data;
}
