/**
 * useNotification Hook - Ouvy SaaS
 * Sprint 5 - Feature 5.4: Melhorias UX
 * 
 * Hook para gerenciar notificações toast de forma centralizada
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
}

interface UseNotificationReturn {
  notify: (type: NotificationType, message: string, options?: NotificationOptions) => void;
  success: (message: string, options?: NotificationOptions) => void;
  error: (message: string, options?: NotificationOptions) => void;
  warning: (message: string, options?: NotificationOptions) => void;
  info: (message: string, options?: NotificationOptions) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => Promise<T>;
  dismiss: (id?: string | number) => void;
}

export function useNotification(): UseNotificationReturn {
  const notify = useCallback((
    type: NotificationType, 
    message: string, 
    options?: NotificationOptions
  ) => {
    const toastOptions = {
      duration: options?.duration ?? 4000,
      description: options?.description,
      action: options?.action,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, { ...toastOptions, duration: options?.duration ?? 6000 });
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
    }
  }, []);

  const success = useCallback((message: string, options?: NotificationOptions) => {
    notify('success', message, options);
  }, [notify]);

  const error = useCallback((message: string, options?: NotificationOptions) => {
    notify('error', message, options);
  }, [notify]);

  const warning = useCallback((message: string, options?: NotificationOptions) => {
    notify('warning', message, options);
  }, [notify]);

  const info = useCallback((message: string, options?: NotificationOptions) => {
    notify('info', message, options);
  }, [notify]);

  const promiseToast = useCallback(<T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ): Promise<T> => {
    return toast.promise(promise, messages) as unknown as Promise<T>;
  }, []);

  const dismiss = useCallback((id?: string | number) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }, []);

  return {
    notify,
    success,
    error,
    warning,
    info,
    promise: promiseToast,
    dismiss,
  };
}

// Mensagens padrão em português
export const DEFAULT_MESSAGES = {
  // Operações CRUD
  CREATE_SUCCESS: 'Item criado com sucesso!',
  CREATE_ERROR: 'Erro ao criar item. Tente novamente.',
  UPDATE_SUCCESS: 'Alterações salvas com sucesso!',
  UPDATE_ERROR: 'Erro ao salvar alterações. Tente novamente.',
  DELETE_SUCCESS: 'Item excluído com sucesso!',
  DELETE_ERROR: 'Erro ao excluir item. Tente novamente.',
  
  // Autenticação
  LOGIN_SUCCESS: 'Login realizado com sucesso!',
  LOGIN_ERROR: 'Credenciais inválidas. Verifique e tente novamente.',
  LOGOUT_SUCCESS: 'Você foi desconectado com sucesso.',
  SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente.',
  
  // Validação
  VALIDATION_ERROR: 'Por favor, corrija os campos destacados.',
  REQUIRED_FIELD: 'Este campo é obrigatório.',
  INVALID_EMAIL: 'Digite um email válido.',
  
  // Rede
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  TIMEOUT_ERROR: 'A operação demorou muito. Tente novamente.',
  
  // Feedback
  FEEDBACK_CREATED: 'Feedback enviado com sucesso! Obrigado pela sua contribuição.',
  FEEDBACK_UPDATED: 'Feedback atualizado com sucesso!',
  
  // Export/Import
  EXPORT_SUCCESS: 'Dados exportados com sucesso!',
  EXPORT_ERROR: 'Erro ao exportar dados.',
  IMPORT_SUCCESS: 'Dados importados com sucesso!',
  IMPORT_ERROR: 'Erro ao importar dados. Verifique o formato do arquivo.',
  
  // Geral
  COPIED_TO_CLIPBOARD: 'Copiado para a área de transferência!',
  LOADING: 'Carregando...',
  SAVING: 'Salvando...',
  DELETING: 'Excluindo...',
};

export default useNotification;
