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

interface AuthContextType {
  user: User | null;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Verificar token ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Configurar header de autenticação
          apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
        } catch (err) {
          // Token inválido ou erro ao parsear, limpar
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('tenant_id');
          setUser(null);
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
      // Django obtém_auth_token espera username e password
      const response = await apiClient.post('/api-token-auth/', {
        username: email, // Django usa email como username
        password,
      });

      const { token } = response.data;

      // Buscar dados do usuário após login
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // Criar objeto user básico (adaptar conforme resposta do backend)
      const userData = {
        id: email,
        name: email.split('@')[0],
        email: email,
      };

      // Salvar no localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      router.push('/dashboard');
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
      // Limpar dados locais
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('tenant_subdominio');
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      // O RegisterData já vem no formato correto do formulário
      const response = await apiClient.post('/api/register-tenant/', data);

      const { token, user: userResponse, tenant } = response.data;

      // Criar objeto user do formato esperado
      const userData = {
        id: userResponse.id?.toString() || userResponse.email,
        name: userResponse.username || userResponse.first_name || data.email.split('@')[0],
        email: userResponse.email,
        tenant_id: tenant?.id?.toString(),
        empresa: tenant?.nome,
      };

      // Salvar no localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (tenant?.id) {
        localStorage.setItem('tenant_id', tenant.id.toString());
      }

      // Configurar header de autenticação
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;

      setUser(userData);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as AxiosError<{detail?: string; errors?: Record<string, string[]>; error?: string}>;
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.errors || 
                          error.response?.data?.error || 
                          'Erro ao registrar';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Dados inválidos');
      throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Dados inválidos');
    } finally {
      setLoading(false);
    }
  }, [router]);

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
