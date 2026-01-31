import { api } from './api';
import { invalidateVerificationCache } from '@/components/ProtectedRoute';

export interface LogoutOptions {
  redirect?: boolean;
  redirectTo?: string;
  /** Se true, invalida tokens em todos os dispositivos */
  invalidateAll?: boolean;
}

/**
 * Realiza logout do usuário.
 * 
 * ATUALIZADO: Auditoria 30/01/2026
 * - Adicionado envio do refresh token para blacklist JWT
 * - Opção para invalidar todos os dispositivos
 * - Invalidação do cache de verificação do ProtectedRoute
 * 
 * 1. Chama endpoint /api/logout/ no backend para invalidar token + blacklist JWT
 * 2. Limpa localStorage
 * 3. Invalida cache de verificação
 * 4. Redireciona para página de login (opcional)
 * 
 * @param options - Opções de logout
 */
export async function logout(options: LogoutOptions = {}): Promise<void> {
  const { redirect = true, redirectTo = '/login', invalidateAll = false } = options;

  try {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refresh_token') 
      : null;

    // Chamar endpoint de logout no backend
    if (invalidateAll) {
      // Logout de todos os dispositivos
      await api.post('/api/logout/all/');
    } else {
      // Logout normal com blacklist do JWT
      await api.post('/api/logout/', {
        refresh: refreshToken,
        invalidate_all: false
      });
    }
  } catch (error) {
    console.error('Erro ao fazer logout no servidor:', error);
    // Continuar mesmo se falhar (logout local sempre funciona)
  } finally {
    // Limpar storage local
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant_id');
    }

    // Invalidar cache de verificação do ProtectedRoute
    invalidateVerificationCache();

    // Redirecionar se solicitado
    if (redirect && typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }
}

/**
 * Logout de todos os dispositivos.
 * Invalida todos os tokens JWT ativos do usuário.
 */
export async function logoutAllDevices(): Promise<void> {
  return logout({ invalidateAll: true });
}
