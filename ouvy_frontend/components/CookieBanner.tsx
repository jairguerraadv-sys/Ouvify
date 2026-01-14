'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  acceptedAt?: string;
}

const COOKIE_CONSENT_KEY = 'ouvy_cookie_consent';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Sempre true, não pode ser desabilitado
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Verificar se já existe consentimento
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Dar um pequeno delay para não aparecer imediatamente
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const consent = {
      ...prefs,
      acceptedAt: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
    
    // Disparar evento customizado para outros scripts reagirem
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: consent }));
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto">
        {!showDetails ? (
          // Visualização simplificada
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                🍪 Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{' '}
                <a href="/privacidade" className="text-primary-600 hover:underline font-medium">
                  Política de Privacidade
                </a>
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
              >
                Personalizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptNecessary}
              >
                Apenas Essenciais
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Aceitar Todos
              </Button>
            </div>
          </div>
        ) : (
          // Visualização detalhada
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                🍪 Configurações de Cookies
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              Escolha quais tipos de cookies você deseja permitir. Cookies necessários são sempre ativos
              pois são essenciais para o funcionamento do site.
            </p>
            
            <div className="space-y-3">
              {/* Cookies Necessários */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Cookies Necessários</h4>
                  <p className="text-xs text-gray-500">
                    Essenciais para o funcionamento do site. Incluem autenticação e preferências básicas.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 cursor-not-allowed"
                  />
                  <span className="ml-2 text-xs text-gray-400">Sempre ativo</span>
                </div>
              </div>
              
              {/* Cookies de Analytics */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Cookies de Análise</h4>
                  <p className="text-xs text-gray-500">
                    Nos ajudam a entender como você usa o site para melhorarmos a experiência.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              {/* Cookies de Marketing */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Cookies de Marketing</h4>
                  <p className="text-xs text-gray-500">
                    Usados para exibir anúncios relevantes e medir eficácia de campanhas.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={acceptNecessary}
              >
                Recusar Opcionais
              </Button>
              <Button
                size="sm"
                onClick={savePreferences}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Salvar Preferências
              </Button>
            </div>
            
            <p className="text-xs text-gray-400 text-center">
              Saiba mais em nossa{' '}
              <a href="/privacidade" className="text-primary-600 hover:underline">
                Política de Privacidade
              </a>
              {' '}e{' '}
              <a href="/termos" className="text-primary-600 hover:underline">
                Termos de Uso
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook para verificar consentimento em outros componentes
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      try {
        setConsent(JSON.parse(savedConsent));
      } catch {
        setConsent(null);
      }
    }

    // Escutar atualizações
    const handleUpdate = (e: CustomEvent<CookiePreferences>) => {
      setConsent(e.detail);
    };

    window.addEventListener('cookieConsentUpdated', handleUpdate as EventListener);
    return () => window.removeEventListener('cookieConsentUpdated', handleUpdate as EventListener);
  }, []);

  return consent;
}
