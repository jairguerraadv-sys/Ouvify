/**
 * Utilitários para Web Push Notifications
 * Gerencia Service Worker, permissões e subscriptions
 */

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Verifica se Web Push é suportado no browser
 */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Verifica status atual da permissão de notificações
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Registra o Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('[Push] Service Worker não suportado');
    return null;
  }

  try {
    // Verificar se já existe um SW registrado
    const existingRegistration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (existingRegistration) {
      swRegistration = existingRegistration;
      console.log('[Push] Service Worker já registrado:', existingRegistration);
      return existingRegistration;
    }

    // Registrar novo SW
    swRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    
    console.log('[Push] Service Worker registrado:', swRegistration);
    return swRegistration;
  } catch (error) {
    console.error('[Push] Erro ao registrar Service Worker:', error);
    return null;
  }
}

/**
 * Solicita permissão para notificações
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('[Push] Notifications não suportadas');
    return 'denied';
  }

  // Se já tem permissão, retornar
  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Push] Permissão de notificação:', permission);
    return permission;
  } catch (error) {
    console.error('[Push] Erro ao solicitar permissão:', error);
    return 'denied';
  }
}

/**
 * Cria subscription de Web Push
 */
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!swRegistration) {
    swRegistration = await registerServiceWorker();
  }

  if (!swRegistration) {
    console.error('[Push] Service Worker não disponível');
    return null;
  }

  try {
    // Verificar se já existe subscription
    const existingSubscription = await swRegistration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('[Push] Subscription existente encontrada');
      return existingSubscription;
    }

    // Criar nova subscription
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('[Push] Nova subscription criada:', subscription);
    return subscription;
  } catch (error) {
    console.error('[Push] Erro ao criar subscription:', error);
    return null;
  }
}

/**
 * Cancela subscription de Web Push
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!swRegistration) {
    swRegistration = await navigator.serviceWorker.getRegistration('/sw.js') || null;
  }

  if (!swRegistration) {
    return false;
  }

  try {
    const subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('[Push] Subscription cancelada');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Push] Erro ao cancelar subscription:', error);
    return false;
  }
}

/**
 * Obtém subscription existente (se houver)
 */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!swRegistration) {
    swRegistration = await navigator.serviceWorker.getRegistration('/sw.js') || null;
  }

  if (!swRegistration) {
    return null;
  }

  try {
    return await swRegistration.pushManager.getSubscription();
  } catch (error) {
    console.error('[Push] Erro ao obter subscription:', error);
    return null;
  }
}

/**
 * Extrai dados da subscription para enviar ao backend
 */
export function extractSubscriptionData(subscription: PushSubscription): {
  endpoint: string;
  p256dh: string;
  auth: string;
} {
  const p256dhKey = subscription.getKey('p256dh');
  const authKey = subscription.getKey('auth');

  if (!p256dhKey || !authKey) {
    throw new Error('Keys não disponíveis na subscription');
  }

  return {
    endpoint: subscription.endpoint,
    p256dh: arrayBufferToBase64(p256dhKey),
    auth: arrayBufferToBase64(authKey),
  };
}

/**
 * Converte ArrayBuffer para Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converte URL-safe Base64 para Uint8Array
 * Necessário para applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}

/**
 * Verifica se as notificações estão totalmente ativas
 * (permissão concedida + subscription ativa)
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  if (getNotificationPermission() !== 'granted') {
    return false;
  }

  const subscription = await getExistingSubscription();
  return subscription !== null;
}
