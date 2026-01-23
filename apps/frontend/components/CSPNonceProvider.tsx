"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CSPNonceContextType {
  nonce: string | null;
}

const CSPNonceContext = createContext<CSPNonceContextType>({ nonce: null });

export { CSPNonceContext };
export type { CSPNonceContextType };

interface CSPNonceProviderProps {
  children: React.ReactNode;
  nonce?: string;
}

export const CSPNonceProvider: React.FC<CSPNonceProviderProps> = ({ children, nonce: serverNonce }) => {
  const [nonce, setNonce] = useState<string | null>(serverNonce || null);

  useEffect(() => {
    if (serverNonce) {
      setNonce(serverNonce);
    } else {
      // Fallback for development - try to get from meta tag or generate
      const metaTag = document.querySelector('meta[name="csp-nonce"]') as HTMLMetaElement;
      if (metaTag && metaTag.content) {
        setNonce(metaTag.content);
      } else {
        const fallbackNonce = btoa(Math.random().toString()).slice(0, 16);
        setNonce(fallbackNonce);
        console.warn('CSP nonce not found, using fallback for development');
      }
    }
  }, [serverNonce]);

  return (
    <CSPNonceContext.Provider value={{ nonce }}>
      {children}
    </CSPNonceContext.Provider>
  );
};