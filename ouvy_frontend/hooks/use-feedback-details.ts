import useSWR from 'swr';
import { apiClient, fetcher } from './use-dashboard';
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

export function useFeedbackDetails(protocolo?: string) {
  // Primeiro obtém o ID via listagem e filtra pelo protocolo
  const listKey = protocolo ? '/api/feedbacks/' : null;
  const { data: listData, error: listError } = useSWR<Feedback[]>(listKey, fetcher);

  const found = (listData || []).find((f) => f.protocolo === protocolo);
  const detailKey = found ? `/api/feedbacks/${found.id}/` : null;

  const { data, error, isLoading, mutate } = useSWR<FeedbackDetails>(detailKey, fetcher, {
    revalidateOnFocus: true,
  });

  async function enviarMensagem(texto: string, tipo: FeedbackInteraction['tipo'], novoStatus?: Feedback['status']) {
    if (!found) throw new Error('Feedback não encontrado');
    const body: Record<string, any> = { mensagem: texto, tipo };
    if (tipo === 'MUDANCA_STATUS' && novoStatus) {
      body.novo_status = novoStatus;
    }
    await apiClient.post(`/api/feedbacks/${found.id}/adicionar-interacao/`, body);
    await mutate();
  }

  async function atualizarStatus(novoStatus: Feedback['status']) {
    if (!found) throw new Error('Feedback não encontrado');
    await apiClient.post(`/api/feedbacks/${found.id}/adicionar-interacao/`, {
      mensagem: `Status alterado para ${novoStatus}`,
      tipo: 'MUDANCA_STATUS',
      novo_status: novoStatus,
    });
    await mutate();
  }

  return {
    data,
    isLoading,
    error: error || listError,
    enviarMensagem,
    atualizarStatus,
    refresh: mutate,
  };
}
