'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [router]);

  // Verificar token
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  if (!token) {
    return null; // Não renderizar nada enquanto redireciona
  }

  return <>{children}</>;
}
