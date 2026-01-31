/* eslint-disable no-undef */
/**
 * Service Worker para Web Push Notifications
 * Ouvify - Notificações em tempo real
 */

const CACHE_NAME = 'ouvify-push-v1';

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalando...');
  // Ativar imediatamente sem esperar outros SWs
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  // Tomar controle imediatamente
  event.waitUntil(clients.claim());
});

// Recebimento de Push Notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido:', event);

  let data = {
    title: 'Ouvify',
    body: 'Você tem uma nova notificação',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    url: '/',
    data: {},
  };

  // Tentar parsear dados do push
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      // Se não for JSON, usar como texto
      data.body = event.data.text();
    }
  }

  const title = data.title;
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    tag: data.tag || `ouvify-notification-${Date.now()}`,
    data: {
      url: data.url || '/',
      notification_id: data.data?.notification_id,
      ...data.data,
    },
    // Configurações de comportamento
    requireInteraction: data.requireInteraction || false,
    silent: false,
    vibrate: [100, 50, 100],
    // Actions (botões na notificação)
    actions: [
      {
        action: 'open',
        title: 'Abrir',
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Click na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event);

  const notification = event.notification;
  const action = event.action;
  const url = notification.data?.url || '/';

  // Fechar notificação
  notification.close();

  // Se clicou em "dismiss", apenas fechar
  if (action === 'dismiss') {
    return;
  }

  // Abrir ou focar na URL
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Verificar se já tem uma aba aberta
      for (const client of clientList) {
        // Se a aba já está na URL ou no mesmo domínio
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navegar para a URL da notificação
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: url,
            notification_id: notification.data?.notification_id,
          });
          return client.focus();
        }
      }
      // Se não tem aba aberta, abrir nova
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );

  // Registrar click no backend (opcional)
  if (notification.data?.notification_id) {
    fetch(`/api/push/notifications/${notification.data.notification_id}/mark_clicked/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }).catch((err) => {
      console.log('[SW] Erro ao registrar click:', err);
    });
  }
});

// Notificação fechada sem click
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificação fechada:', event);
});

// Mensagens do cliente (página)
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push subscription change (renovação automática)
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Subscription mudou:', event);

  event.waitUntil(
    // Re-subscribe automaticamente
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
    }).then((subscription) => {
      // Enviar nova subscription para o backend
      return fetch('/api/push/subscriptions/subscribe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth')),
        }),
        credentials: 'include',
      });
    }).catch((err) => {
      console.error('[SW] Erro ao re-subscribe:', err);
    })
  );
});

// Helper: ArrayBuffer para Base64
function arrayBufferToBase64(buffer) {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
