'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { AxiosError } from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  tenant_id?: string;
  empresa?: string;
  avatar?: string;
}

interface Tenant {
  id: number;
  nome: string;
  subdominio: string;
  plano: string;
  ativo: boolean;
  logo?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  cor_texto?: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  nome_empresa: string;
  subdominio_desejado: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Verificar token ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');
      const storedTenant = localStorage.getItem('tenant');

      if (accessToken && refreshToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          if (storedTenant) {
            setTenant(JSON.parse(storedTenant));
          }
          // Configurar header de autenticação JWT
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (err) {
          // Token inválido ou erro ao parsear, limpar
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('tenant_id');
          localStorage.removeItem('tenant');
          setUser(null);
          setTenant(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // JWT Authentication - novo endpoint
      const response = await apiClient.post<{
        access: string;
        refresh: string;
        user: {
          id: number;
          email: string;
          username: string;
          is_staff: boolean;
          is_superuser: boolean;
        };
        tenant?: {
          id: number;
          nome: string;
          subdominio: string;
          plano: string;
          ativo: boolean;
          logo: string | null;
          cor_primaria: string;
        };
      }>('/api/token/', {
        username: email,
        password,
      });

      const { access, refresh, user: userResponse, tenant: tenantResponse } = response.data;

      // Criar objeto user do formato esperado
      const userData: User = {
        id: userResponse.id.toString(),
        name: userResponse.username || userResponse.email.split('@')[0],
        email: userResponse.email,
        tenant_id: tenantResponse?.id?.toString(),
        empresa: tenantResponse?.nome,
      };

      // Criar objeto tenant do formato esperado
      const tenantData: Tenant | null = tenantResponse ? {
        id: tenantResponse.id,
        nome: tenantResponse.nome,
        subdominio: tenantResponse.subdominio,
        plano: tenantResponse.plano,
        ativo: tenantResponse.ativo,
        logo: tenantResponse.logo || undefined,
        cor_primaria: tenantResponse.cor_primaria || undefined,
        cor_secundaria: undefined,
        cor_texto: undefined,
      } : null;

      // Salvar tokens JWT no localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      if (tenantResponse?.id) {
        localStorage.setItem('tenant_id', tenantResponse.id.toString());
        localStorage.setItem('tenant', JSON.stringify(tenantData));
      }

      // Configurar header de autenticação JWT
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setUser(userData);
      setTenant(tenantData);
    } catch (err: unknown) {
      const error = err as AxiosError<{detail?: string; non_field_errors?: string[]; error?: string}>;
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.non_field_errors?.[0] ||
                          error.response?.data?.error || 
                          'Erro ao fazer login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      // Invalidar token no servidor
      await apiClient.post('/api/logout/');
    } catch (error) {
      console.error('Erro ao invalidar token no servidor:', error);
      // Continua o logout mesmo se houver erro no servidor
    } finally {
      // Limpar dados locais (JWT)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('tenant_subdominio');
      localStorage.removeItem('tenant');
      setUser(null);
      setTenant(null);
      delete apiClient.defaults.headers.common['Authorization'];
      router.push('/login');
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      // O RegisterData já vem no formato correto do formulário
      const response = await apiClient.post<{
        token?: string;
        access?: string;
        refresh?: string;
        user: any;
        tenant?: any;
      }>('/api/register-tenant/', data);

      const { access, refresh, user: userResponse, tenant: tenantResponse } = response.data;

      // Criar objeto user do formato esperado
      const userData = {
        id: userResponse.id?.toString() || userResponse.email,
        name: userResponse.username || userResponse.first_name || data.email.split('@')[0],
        email: userResponse.email,
        tenant_id: tenantResponse?.id?.toString(),
        empresa: tenantResponse?.nome,
      };

      // Criar objeto tenant do formato esperado
      const tenantData: Tenant | null = tenantResponse ? {
        id: tenantResponse.id,
        nome: tenantResponse.nome,
        subdominio: tenantResponse.subdominio,
        plano: tenantResponse.plano || 'FREE',
        ativo: tenantResponse.ativo !== false,
        logo: tenantResponse.logo || undefined,
        cor_primaria: tenantResponse.cor_primaria || undefined,
        cor_secundaria: undefined,
        cor_texto: undefined,
      } : null;

      if (!access || !refresh) {
        throw new Error('Registro concluído, mas JWT não foi emitido (access/refresh ausentes).');
      }

      // Salvar tokens JWT no localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      if (tenantResponse?.id) {
        localStorage.setItem('tenant_id', tenantResponse.id.toString());
        localStorage.setItem('tenant', JSON.stringify(tenantData));
      }

      // Configurar header de autenticação JWT
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setUser(userData);
      setTenant(tenantData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }

      const error = err as AxiosError<{detail?: string; errors?: Record<string, string[]>; error?: string}>;
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'Erro ao registrar';

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.patch('/api/auth/me/', data);
      const updatedUser = response.data;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err: unknown) {
      const error = err as AxiosError<{detail?: string}>;
      const errorMessage = error.response?.data?.detail || 'Erro ao atualizar usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    tenant,
    loading,
    error,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
