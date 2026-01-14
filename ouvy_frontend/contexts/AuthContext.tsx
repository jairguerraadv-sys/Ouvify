'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

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
  name: string;
  email: string;
  password: string;
  empresa?: string;
  cnpj?: string;
  subdominio?: string;
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
          // Validar token com backend
          await apiClient.get('/api/auth/me/');
        } catch (err) {
          // Token inválido, limpar
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
      const response = await apiClient.post('/api/auth/login/', {
        email,
        password,
      });

      const { token, user: userData, tenant_id } = response.data;

      // Salvar no localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (tenant_id) {
        localStorage.setItem('tenant_id', tenant_id);
      }

      setUser(userData);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Erro ao fazer login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    // Limpar dados
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant_id');
    setUser(null);
    router.push('/login');
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/auth/register/', data);

      const { token, user: userData, tenant_id } = response.data;

      // Salvar no localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (tenant_id) {
        localStorage.setItem('tenant_id', tenant_id);
      }

      setUser(userData);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Erro ao registrar';
      setError(errorMessage);
      throw new Error(errorMessage);
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
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao atualizar usuário';
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
