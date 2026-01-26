'use client';

/**
 * Prompt para solicitar permissão de notificações
 * Aparece após 10 segundos na primeira visita
 */

import { useState, useEffect, useCallback } from 'react';
import { Bell, X } from 'lucide-react';
import { 
  isPushSupported,
  getNotificationPermission,
  registerServiceWorker, 
  requestNotificationPermission, 
  subscribeToPush,
  extractSubscriptionData,
} from '@/lib/push-notifications';
import { apiRequest } from '@/lib/api';

const STORAGE_KEY = 'ouvy-notification-prompt-dismissed';
const SHOW_DELAY_MS = 10000; // 10 segundos

export function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se deve mostrar o prompt
    if (typeof window === 'undefined') return;
    
    // Não mostrar se não suporta push
    if (!isPushSupported()) {
      console.log('[Notifications] Push não suportado neste browser');
      return;
    }

    // Não mostrar se já tem permissão
    const permission = getNotificationPermission();
    if (permission !== 'default') {
      return;
    }

    // Não mostrar se já foi dispensado
    const wasDismissed = localStorage.getItem(STORAGE_KEY);
    if (wasDismissed) {
      return;
    }

    // Mostrar após delay
    const timer = setTimeout(() => {
      setShow(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleAllow = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Registrar Service Worker
      const registration = await registerServiceWorker();
      if (!registration) {
        throw new Error('Não foi possível registrar o Service Worker');
      }

      // 2. Solicitar permissão
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        throw new Error('Permissão negada pelo usuário');
      }

      // 3. Criar subscription
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key não configurada');
      }

      const subscription = await subscribeToPush(vapidPublicKey);
      if (!subscription) {
        throw new Error('Não foi possível criar a subscription');
      }

      // 4. Enviar para o backend
      const subscriptionData = extractSubscriptionData(subscription);
      
      await apiRequest({
        url: '/push/subscriptions/subscribe/',
        method: 'POST',
        data: subscriptionData,
      });

      console.log('[Notifications] Notificações ativadas com sucesso!');
      setShow(false);
    } catch (err) {
      console.error('[Notifications] Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro ao ativar notificações');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 border-2 border-primary-500 z-50 animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-labelledby="notification-prompt-title"
      aria-describedby="notification-prompt-description"
    >
      {/* Botão Fechar */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-4">
        {/* Ícone */}
        <div className="flex-shrink-0 p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
          <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Título */}
          <h3 
            id="notification-prompt-title"
            className="font-semibold text-lg text-gray-900 dark:text-white mb-2"
          >
            Ativar Notificações?
          </h3>
          
          {/* Descrição */}
          <p 
            id="notification-prompt-description"
            className="text-sm text-gray-600 dark:text-gray-400 mb-4"
          >
            Receba alertas em tempo real sobre novos feedbacks, atualizações de status e mensagens importantes.
          </p>
          
          {/* Erro */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {error}
            </p>
          )}
          
          {/* Botões */}
          <div className="flex gap-2">
            <button
              onClick={handleAllow}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ativando...
                </span>
              ) : (
                'Permitir'
              )}
            </button>
            <button
              onClick={handleDismiss}
              disabled={isLoading}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
