/**
 * useConfirm Hook - Ouvy SaaS
 * Sprint 5 - Feature 5.4: Melhorias UX
 * 
 * Hook para gerenciar diálogos de confirmação de forma declarativa
 */

'use client';

import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  isLoading: boolean;
  resolve: ((value: boolean) => void) | null;
}

interface UseConfirmReturn {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  confirmState: ConfirmState;
  handleConfirm: () => void;
  handleCancel: () => void;
  setLoading: (loading: boolean) => void;
}

const defaultState: ConfirmState = {
  isOpen: false,
  isLoading: false,
  title: '',
  description: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'default',
  resolve: null,
};

export function useConfirm(): UseConfirmReturn {
  const [confirmState, setConfirmState] = useState<ConfirmState>(defaultState);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        ...defaultState,
        ...options,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    confirmState.resolve?.(true);
    setConfirmState(defaultState);
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    confirmState.resolve?.(false);
    setConfirmState(defaultState);
  }, [confirmState]);

  const setLoading = useCallback((loading: boolean) => {
    setConfirmState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  return {
    confirm,
    confirmState,
    handleConfirm,
    handleCancel,
    setLoading,
  };
}

// Mensagens padrão de confirmação
export const CONFIRM_MESSAGES = {
  DELETE: {
    title: 'Confirmar exclusão',
    description: 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
    confirmText: 'Excluir',
    cancelText: 'Cancelar',
    variant: 'destructive' as const,
  },
  LOGOUT: {
    title: 'Sair do sistema',
    description: 'Você será desconectado. Deseja continuar?',
    confirmText: 'Sair',
    cancelText: 'Cancelar',
    variant: 'default' as const,
  },
  DISCARD_CHANGES: {
    title: 'Descartar alterações',
    description: 'Você tem alterações não salvas. Deseja descartá-las?',
    confirmText: 'Descartar',
    cancelText: 'Continuar editando',
    variant: 'destructive' as const,
  },
  SUBMIT_FEEDBACK: {
    title: 'Enviar feedback',
    description: 'Deseja enviar este feedback? Você poderá acompanhar o status posteriormente.',
    confirmText: 'Enviar',
    cancelText: 'Revisar',
    variant: 'default' as const,
  },
  ARCHIVE: {
    title: 'Arquivar item',
    description: 'O item será arquivado e não aparecerá mais nas listagens. Você pode restaurá-lo posteriormente.',
    confirmText: 'Arquivar',
    cancelText: 'Cancelar',
    variant: 'default' as const,
  },
};

export default useConfirm;
