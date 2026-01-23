import useSWR from 'swr';
import { api } from '@/lib/api';

/**
 * Interface para dados completos do usuário
 * Retornado pelo endpoint /api/users/me/
 */
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  data_cadastro: string;
  empresa: string | null;
  tenant_id: number | null;
  tenant_subdominio: string | null;
}

/**
 * Interface para atualização de perfil
 */
export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
}

/**
 * Fetcher para SWR
 */
const fetcher = async <T,>(url: string): Promise<T> => {
  return api.get<T>(url);
};

/**
 * Hook para obter e atualizar dados completos do usuário
 * 
 * Usa o endpoint /api/users/me/ que retorna dados completos
 * incluindo informações do tenant associado.
 * 
 * @example
 * ```tsx
 * const { user, isLoading, error, updateProfile, refresh } = useUserProfile();
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error} />;
 * 
 * return <div>Olá, {user?.name}!</div>;
 * ```
 */
export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    '/api/users/me/',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Cache por 10 segundos
    }
  );

  /**
   * Atualiza o perfil do usuário
   */
  const updateProfile = async (profileData: UpdateUserProfileData): Promise<UserProfile> => {
    const updated = await api.patch<UserProfile>('/api/users/me/', profileData);
    // Revalidar cache após atualização
    await mutate(updated, false);
    return updated;
  };

  return {
    user: data,
    isLoading,
    error: error?.message,
    updateProfile,
    refresh: mutate,
  };
}

/**
 * Hook para obter apenas o nome completo do usuário
 * Útil para exibição rápida em headers e sidebars
 */
export function useUserName() {
  const { user, isLoading, error } = useUserProfile();
  
  return {
    name: user?.name || user?.first_name || user?.username || 'Usuário',
    initials: getInitials(user?.name || user?.first_name || 'U'),
    isLoading,
    error,
  };
}

/**
 * Extrai as iniciais de um nome
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
