import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiError } from './types';

// Configuração da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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
export interface ApiResponse<T = any> {
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
      const firstError = Object.values(apiError.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
    
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
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

export default api;
