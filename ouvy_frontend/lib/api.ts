import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiError } from './types';
import logger from './logger';

// Configuração da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://ouvy-saas-production.up.railway.app' 
                  : 'http://127.0.0.1:8000');

// Criar instância do axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos
});

// Interceptor de request - adicionar auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const tenantId = localStorage.getItem('tenant_id');
      
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      
      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response - tratar erros globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log detalhado apenas em desenvolvimento
    logger.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token inválido ou expirado
      localStorage.removeItem('auth_token');
      localStorage.removeItem('tenant_id');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Helper para extrair mensagem de erro
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    
    if (apiError?.detail) return apiError.detail;
    if (apiError?.error) return apiError.error;
    if (apiError?.message) return apiError.message;
    
    if (apiError?.errors) {
      // Erros de validação do Django (formato: { field: ["error message"] })
      if (typeof apiError.errors === 'object') {
        const errors = Object.entries(apiError.errors)
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgArray.join(', ')}`;
          })
          .join('; ');
        return errors || 'Dados inválidos';
      }
      const firstError = Object.values(apiError.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : String(firstError || 'Dados inválidos');
    }
    
    // Fallback para status code
    if (error.response?.status === 400) return 'Dados inválidos. Verifique os campos.';
    if (error.response?.status === 500) return 'Erro no servidor. Tente novamente.';
    
    if (error.message) return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Erro desconhecido. Tente novamente.';
}

// Helper para fazer requisições com tratamento de erro
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// Métodos convenientes
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),
    
  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),
    
  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
    
  patch: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
    
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

export default api;
