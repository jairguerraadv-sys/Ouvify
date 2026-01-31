import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiError } from './types';
import logger from './logger';

// Configuração da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://ouvify.up.railway.app' 
                  : 'http://127.0.0.1:8000');

// Criar instância do axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos (aumentado para evitar timeouts em cold starts)
});

// Interceptor de request - adicionar auth token JWT
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      const tenantId = localStorage.getItem('tenant_id');

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      if (tenantId && !config.url?.includes('consultar-protocolo')) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response - tratar erros globalmente e auto-refresh JWT
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Log detalhado apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      logger.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        requestId: error.config?.headers?.['X-Request-ID'] || 'unknown',
        data: error.response?.data,
      });
    } else {
      // Em produção, log apenas informações essenciais
      logger.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        requestId: error.config?.headers?.['X-Request-ID'] || 'unknown',
      });
    }

    // Auto-refresh JWT em caso de 401 (token expirado)
    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Tentar renovar o access token
        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Retry da requisição original com novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh falhou - limpar tudo e redirecionar para login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant_id');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 403 não redireciona - apenas lança erro
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

    // Tratamento específico por status code
    if (error.response?.status === 403) {
      return 'Sem permissão para acessar este recurso.';
    }

    if (error.response?.status === 404) {
      return 'Recurso não encontrado (verifique se a rota existe e se você está no tenant correto).';
    }

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
    // Preserve Axios error metadata (status, response) so callers can branch on it
    if (axios.isAxiosError(error)) {
      const enrichedError = error;
      enrichedError.message = getErrorMessage(error);
      throw enrichedError;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Erro desconhecido. Tente novamente.');
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
