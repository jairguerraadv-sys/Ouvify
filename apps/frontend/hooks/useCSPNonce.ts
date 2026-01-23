/**
 * Hook para acessar o nonce CSP gerado pelo middleware
 */
'use client';

import { useContext } from 'react';
import { CSPNonceContext, CSPNonceContextType } from '@/components/CSPNonceProvider';

export function useCSPNonce(): string | null {
  const context = useContext(CSPNonceContext) as CSPNonceContextType;
  return context.nonce;
}