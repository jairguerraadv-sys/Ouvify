import { api } from './api';

export interface LogoutOptions {
  redirect?: boolean;
  redirectTo?: string;
}

/**
 * Realiza logout do usuário.
 * 
 * 1. Chama endpoint /api/logout/ no backend para invalidar token
 * 2. Limpa localStorage
 * 3. Redireciona para página de login (opcional)
 * 
 * @param options - Opções de logout
 */
export async function logout(options: LogoutOptions = {}): Promise<void> {
  const { redirect = true, redirectTo = '/login' } = options;

  try {
    // Chamar endpoint de logout no backend para invalidar token
    await api.post('/api/logout/');
  } catch (error) {
    console.error('Erro ao fazer logout no servidor:', error);
    // Continuar mesmo se falhar (logout local sempre funciona)
  } finally {
    // Limpar storage local
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant_id');
    }

    // Redirecionar se solicitado
    if (redirect && typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }
}
