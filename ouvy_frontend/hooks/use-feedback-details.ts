import useSWR from 'swr';
import { apiClient, fetcher } from './use-dashboard';
import { api } from '@/lib/api';
import { Feedback, FeedbackAnexo } from '@/lib/types';

export interface FeedbackInteraction {
  id: number;
  tipo: 'MENSAGEM_PUBLICA' | 'PERGUNTA_EMPRESA' | 'RESPOSTA_USUARIO' | 'NOTA_INTERNA' | 'MUDANCA_STATUS' | 'MENSAGEM_AUTOMATICA';
  mensagem: string;
  data: string;
  data_formatada: string;
  autor_nome: string;
}

export interface FeedbackDetails extends Feedback {
  interacoes: FeedbackInteraction[];
  arquivos: FeedbackAnexo[];
}

/**
 * Hook para obter detalhes de um feedback pelo protocolo
 * 
 * Estratégia otimizada:
 * 1. Usa /api/feedbacks/consultar-protocolo/ para obter o ID
 * 2. Depois usa /api/feedbacks/{id}/ (retrieve) para detalhes completos
 * 
 * Isso evita carregar toda a lista de feedbacks.
 */
export function useFeedbackDetails(protocolo?: string) {
  // Buscar feedback pelo protocolo para obter o ID
  const protocoloKey = protocolo 
    ? `/api/feedbacks/consultar-protocolo/?protocolo=${protocolo}` 
    : null;
  
  const { data: feedbackBase, error: protocoloError } = useSWR<Feedback>(
    protocoloKey, 
    fetcher,
    { revalidateOnFocus: false }
  );

  // Usar retrieve direto por ID para obter detalhes completos com interações
  const detailKey = feedbackBase?.id ? `/api/feedbacks/${feedbackBase.id}/` : null;

  const { data, error, isLoading, mutate } = useSWR<FeedbackDetails>(
    detailKey, 
    fetcher, 
    { revalidateOnFocus: true }
  );

  async function enviarMensagem(texto: string, tipo: FeedbackInteraction['tipo'], novoStatus?: Feedback['status']) {
    if (!feedbackBase?.id) throw new Error('Feedback não encontrado');
    const body: Record<string, any> = { mensagem: texto, tipo };
    if (tipo === 'MUDANCA_STATUS' && novoStatus) {
      body.novo_status = novoStatus;
    }
    await apiClient.post(`/api/feedbacks/${feedbackBase.id}/adicionar-interacao/`, body);
    await mutate();
  }

  async function atualizarStatus(novoStatus: Feedback['status']) {
    if (!feedbackBase?.id) throw new Error('Feedback não encontrado');
    await apiClient.post(`/api/feedbacks/${feedbackBase.id}/adicionar-interacao/`, {
      mensagem: `Status alterado para ${novoStatus}`,
      tipo: 'MUDANCA_STATUS',
      novo_status: novoStatus,
    });
    await mutate();
  }

  return {
    data,
    isLoading: isLoading || (!feedbackBase && !protocoloError),
    error: error || protocoloError,
    enviarMensagem,
    atualizarStatus,
    refresh: mutate,
  };
}

/**
 * Hook para obter detalhes de um feedback diretamente pelo ID
 * 
 * Usa o endpoint /api/feedbacks/{id}/ (retrieve) diretamente.
 * Ideal quando já se tem o ID do feedback.
 */
export function useFeedbackById(feedbackId?: number) {
  const detailKey = feedbackId ? `/api/feedbacks/${feedbackId}/` : null;

  const { data, error, isLoading, mutate } = useSWR<FeedbackDetails>(
    detailKey, 
    fetcher, 
    { revalidateOnFocus: true }
  );

  async function enviarMensagem(texto: string, tipo: FeedbackInteraction['tipo'], novoStatus?: Feedback['status']) {
    if (!feedbackId) throw new Error('Feedback ID não fornecido');
    const body: Record<string, any> = { mensagem: texto, tipo };
    if (tipo === 'MUDANCA_STATUS' && novoStatus) {
      body.novo_status = novoStatus;
    }
    await apiClient.post(`/api/feedbacks/${feedbackId}/adicionar-interacao/`, body);
    await mutate();
  }

  async function atualizarFeedback(updates: Partial<Feedback>) {
    if (!feedbackId) throw new Error('Feedback ID não fornecido');
    const updated = await api.patch<FeedbackDetails>(`/api/feedbacks/${feedbackId}/`, updates);
    await mutate(updated, false);
    return updated;
  }

  async function atualizarStatus(novoStatus: Feedback['status']) {
    if (!feedbackId) throw new Error('Feedback ID não fornecido');
    await apiClient.post(`/api/feedbacks/${feedbackId}/adicionar-interacao/`, {
      mensagem: `Status alterado para ${novoStatus}`,
      tipo: 'MUDANCA_STATUS',
      novo_status: novoStatus,
    });
    await mutate();
  }

  return {
    data,
    isLoading,
    error: error?.message,
    enviarMensagem,
    atualizarFeedback,
    atualizarStatus,
    refresh: mutate,
  };
}
