'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, Settings, Shield, BarChart3, Megaphone, X, Check } from 'lucide-react';

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
      const timer = setTimeout(() => setShowBanner(true), 1500);
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
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl animate-in slide-in-from-bottom duration-500"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div className="max-w-7xl mx-auto">
        {!showDetails ? (
          // Visualização simplificada - Design moderno
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Cookie className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 id="cookie-banner-title" className="text-base font-semibold text-gray-900">
                  Sua privacidade importa
                </h3>
                <p id="cookie-banner-description" className="text-sm text-gray-600 leading-relaxed">
                  Utilizamos cookies essenciais e opcionais para melhorar sua experiência. 
                  Você pode escolher quais aceitar. Consulte nossa{' '}
                  <a 
                    href="/privacidade" 
                    className="text-primary-600 hover:text-primary-700 underline font-medium transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Política de Privacidade
                  </a>
                  .
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="justify-center border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <Settings className="w-4 h-4 mr-2" />
                Personalizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptNecessary}
                className="justify-center hover:bg-gray-50 transition-all"
              >
                Apenas Essenciais
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="justify-center bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Check className="w-4 h-4 mr-2" />
                Aceitar Todos
              </Button>
            </div>
          </div>
        ) : (
          // Visualização detalhada - Design aprimorado
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configurações de Cookies
                  </h3>
                  <p className="text-xs text-gray-500">
                    Gerencie suas preferências de privacidade
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar configurações"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Escolha quais tipos de cookies você deseja permitir. Cookies necessários são sempre ativos
              pois são essenciais para o funcionamento e segurança do site.
            </p>
            
            <div className="space-y-3">
              {/* Cookies Necessários */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 transition-all">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">Cookies Necessários</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        Sempre ativo
                      </span>
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="h-4 w-4 rounded border-gray-300 text-gray-600 cursor-not-allowed opacity-50"
                        aria-label="Cookies necessários sempre ativos"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Essenciais para o funcionamento do site. Incluem autenticação, segurança e preferências básicas. 
                    Não podem ser desativados.
                  </p>
                </div>
              </div>
              
              {/* Cookies de Analytics */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl border border-primary-200 hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">Cookies de Análise</h4>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="sr-only peer"
                        aria-label="Habilitar cookies de análise"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Nos ajudam a entender como você usa o site para melhorarmos a experiência e identificar problemas.
                    Dados são anônimos e agregados.
                  </p>
                </div>
              </div>
              
              {/* Cookies de Marketing */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl border border-secondary-200 hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-secondary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">Cookies de Marketing</h4>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="sr-only peer"
                        aria-label="Habilitar cookies de marketing"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-600 shadow-inner"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Usados para exibir anúncios relevantes e medir a eficácia de campanhas publicitárias.
                    Podem rastrear sua navegação entre sites.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center sm:text-left">
                Saiba mais:{' '}
                <a 
                  href="/privacidade" 
                  className="text-primary-600 hover:text-primary-700 underline font-medium transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Política de Privacidade
                </a>
                {' • '}
                <a 
                  href="/termos" 
                  className="text-primary-600 hover:text-primary-700 underline font-medium transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Termos de Uso
                </a>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptNecessary}
                  className="flex-1 sm:flex-none hover:bg-gray-50 transition-all"
                >
                  Recusar Opcionais
                </Button>
                <Button
                  size="sm"
                  onClick={savePreferences}
                  className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Salvar Preferências
                </Button>
              </div>
            </div>
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
