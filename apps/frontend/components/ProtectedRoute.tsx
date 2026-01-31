'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ProtectedRoute - Componente de proteção de rotas
 * 
 * ATUALIZADO: Auditoria 30/01/2026
 * - Adicionada validação server-side do JWT
 * - Loading state durante verificação
 * - Refresh automático de token se necessário
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Cache de verificação para evitar chamadas excessivas
let lastVerification: { time: number; valid: boolean } | null = null;
const VERIFICATION_CACHE_MS = 60000; // 1 minuto

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    
    // Se não tem token, redireciona imediatamente
    if (!token) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    // Verificar cache
    const now = Date.now();
    if (lastVerification && (now - lastVerification.time) < VERIFICATION_CACHE_MS) {
      setIsAuthenticated(lastVerification.valid);
      setIsVerifying(false);
      if (!lastVerification.valid) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      }
      return;
    }

    try {
      // Validação server-side do JWT
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/token/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        // Token válido
        lastVerification = { time: now, valid: true };
        setIsAuthenticated(true);
        setIsVerifying(false);
      } else if (response.status === 401) {
        // Token inválido, tentar refresh
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          const refreshResponse = await fetch(`${apiUrl}/api/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('auth_token', data.access);
            if (data.refresh) {
              localStorage.setItem('refresh_token', data.refresh);
            }
            lastVerification = { time: now, valid: true };
            setIsAuthenticated(true);
            setIsVerifying(false);
            return;
          }
        }
        
        // Refresh falhou, limpar tokens e redirecionar
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        lastVerification = { time: now, valid: false };
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      } else {
        // Erro inesperado, manter autenticado (graceful degradation)
        console.warn('Token verification failed with status:', response.status);
        setIsAuthenticated(true);
        setIsVerifying(false);
      }
    } catch (error) {
      // Erro de rede, verificar apenas client-side (graceful degradation)
      console.warn('Token verification error:', error);
      // Em caso de erro de rede, confiar no token local
      setIsAuthenticated(true);
      setIsVerifying(false);
    }
  }, [router]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // Estado de loading
  if (isVerifying) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook para invalidar cache de verificação
 * Útil após logout ou mudança de sessão
 */
export function invalidateVerificationCache() {
  lastVerification = null;
}

export default ProtectedRoute;
