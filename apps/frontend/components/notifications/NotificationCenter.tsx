'use client';

/**
 * Central de Notificações
 * Dropdown com lista de notificações e contador de não lidas
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import useSWR from 'swr';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  tipo: string;
  tipo_display: string;
  title: string;
  body: string;
  icon: string;
  url: string;
  sent_at: string;
  is_read: boolean;
  is_clicked: boolean;
  time_ago: string;
}

interface NotificationsResponse {
  results: Notification[];
  count: number;
}

interface UnreadCountResponse {
  unread_count: number;
}

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await apiRequest<T>({ url, method: 'GET' });
  return response;
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar notificações
  const { data: notificationsData, mutate: mutateNotifications } = useSWR<NotificationsResponse>(
    '/push/notifications/?page_size=10',
    fetcher,
    { 
      refreshInterval: 30000, // Auto-refresh a cada 30s
      revalidateOnFocus: true,
    }
  );

  // Buscar contagem de não lidas
  const { data: unreadData, mutate: mutateUnread } = useSWR<UnreadCountResponse>(
    '/push/notifications/unread_count/',
    fetcher,
    { 
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  const notifications = notificationsData?.results || [];
  const unreadCount = unreadData?.unread_count || 0;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Escutar mensagens do Service Worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        // Revalidar dados quando usuário clica em notificação
        mutateNotifications();
        mutateUnread();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, [mutateNotifications, mutateUnread]);

  const handleMarkAsRead = useCallback(async (id: number) => {
    try {
      await apiRequest({ url: `/push/notifications/${id}/mark_read/`, method: 'POST' });
      mutateNotifications();
      mutateUnread();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }, [mutateNotifications, mutateUnread]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await apiRequest({ url: '/push/notifications/mark_all_read/', method: 'POST' });
      mutateNotifications();
      mutateUnread();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, [mutateNotifications, mutateUnread]);

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    // Marcar como lida
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
    
    // Navegar se tiver URL
    if (notification.url) {
      window.location.href = notification.url;
    }
    
    setIsOpen(false);
  }, [handleMarkAsRead]);

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'FEEDBACK_NOVO':
        return '📨';
      case 'FEEDBACK_ATUALIZADO':
        return '🔄';
      case 'FEEDBACK_RESOLVIDO':
        return '✅';
      case 'FEEDBACK_COMENTARIO':
        return '💬';
      case 'ALERTA':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "hover:bg-gray-100 dark:hover:bg-white",
          isOpen && "bg-gray-100 dark:bg-white"
        )}
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        
        {/* Badge de não lidas */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-gray-900 bg-error-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[32rem] bg-white dark:bg-white rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-gray-900">
              Notificações
            </h2>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma notificação ainda
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Você será notificado sobre novos feedbacks e atualizações
                </p>
              </div>
            ) : (
              <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/50 transition-colors",
                        !notification.is_read && "bg-primary-50/50 dark:bg-white/10"
                      )}
                    >
                      <div className="flex gap-3">
                        {/* Ícone */}
                        <span className="flex-shrink-0 text-xl" role="img" aria-hidden="true">
                          {getNotificationIcon(notification.tipo)}
                        </span>
                        
                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "text-sm",
                              !notification.is_read 
                                ? "font-semibold text-gray-900 dark:text-gray-900" 
                                : "font-medium text-gray-700 dark:text-gray-300"
                            )}>
                              {notification.title}
                            </p>
                            
                            {/* Indicador de não lida */}
                            {!notification.is_read && (
                              <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-primary-600 rounded-full" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                            {notification.body}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {notification.time_ago}
                            </span>
                            
                            {notification.url && (
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <a
                href="/notifications"
                className="block w-full py-2 text-sm text-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-white rounded-lg transition-colors"
              >
                Ver todas as notificações
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
