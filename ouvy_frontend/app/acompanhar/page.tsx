'use client';

import { useState, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';

type ProtocoloErrorResponse = {
  wait_seconds?: number;
  detail?: string;
  error?: string;
  message?: string;
};

interface FeedbackInteraction {
  id: number;
  tipo: 'MENSAGEM_PUBLICA' | 'NOTA_INTERNA' | 'MUDANCA_STATUS';
  mensagem: string;
  data: string;
  data_formatada?: string;
  autor_nome: string;
}

interface FeedbackStatus {
  protocolo: string;
  tipo: string;
  tipo_display: string;
  status: string;
  status_display: string;
  titulo: string;
  resposta_empresa: string | null;
  data_resposta: string | null;
  data_criacao: string;
  data_atualizacao: string;
  interacoes?: FeedbackInteraction[];
}

export default function AcompanharPage() {
  const [protocolo, setProtocolo] = useState('');
  const [feedback, setFeedback] = useState<FeedbackStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicMsg, setPublicMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const buscarProtocolo = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!protocolo.trim()) {
      setError('Por favor, digite um código de protocolo');
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      // Detectar subdomínio do host atual
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      // URL base da API (ajuste conforme necessário)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://${hostname}:8000`;
      
      const response = await axios.get(`${apiUrl}/api/feedbacks/consultar-protocolo/`, {
        params: { codigo: protocolo.toUpperCase().trim() }
      });

      setFeedback(response.data);
    } catch (err) {
      const error = err as AxiosError<ProtocoloErrorResponse>;

      if (error.response?.status === 429) {
        const waitSeconds = Number(error.response.data?.wait_seconds);
        const waitLabel = Number.isFinite(waitSeconds) && waitSeconds > 0
          ? `${waitSeconds} segundos`
          : 'alguns instantes';
        setError(`🚨 Muitas tentativas. Por favor, aguarde ${waitLabel}.`);
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setError('⚠️ Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8000');
      } else if (error.response?.status === 404) {
        setError('Protocolo não encontrado. Verifique o código digitado.');
      } else if (error.response?.status === 400) {
        setError('Código de protocolo inválido.');
      } else {
        setError('Erro ao consultar protocolo. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEnviarResposta = async () => {
    if (!feedback) return;
    if (!publicMsg.trim()) return;
    
    try {
      setIsSending(true);
      setError(null);
      
      // Detectar host
      const hostname = window.location.hostname;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://${hostname}:8000`;
      
      const res = await axios.post(`${apiUrl}/api/feedbacks/responder-protocolo/`, {
        protocolo: feedback.protocolo,
        mensagem: publicMsg.trim(),
      });
      
      // Adicionar a nova interação à lista local
      setFeedback((prev) => {
        if (!prev) return prev;
        const nova: FeedbackInteraction = res.data;
        const interacoes = prev.interacoes ? [...prev.interacoes] : [];
        interacoes.unshift(nova); // Mais recente primeiro
        return { ...prev, interacoes };
      });
      
      setPublicMsg('');
    } catch (err) {
      const error = err as AxiosError<ProtocoloErrorResponse>;

      if (error.response?.status === 429) {
        const waitSeconds = Number(error.response.data?.wait_seconds);
        const waitLabel = Number.isFinite(waitSeconds) && waitSeconds > 0
          ? `${waitSeconds} segundos`
          : 'alguns instantes';
        setError(`🚨 Muitas tentativas. Por favor, aguarde ${waitLabel}.`);
      } else if (error.response?.status === 404) {
        setError('Protocolo não encontrado.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('⚠️ Não foi possível conectar ao servidor.');
      } else {
        setError('Erro ao enviar mensagem. Tente novamente.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    const cores: Record<string, string> = {
      'pendente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'em_analise': 'bg-primary/10 text-primary border-primary/30',
      'resolvido': 'bg-green-100 text-green-800 border-green-300',
      'fechado': 'bg-neutral-100 text-secondary border-neutral-300'
    };
    return cores[status] || 'bg-neutral-100 text-secondary border-neutral-300';
  };

  const getStatusIcon = (status: string) => {
    const icones: Record<string, string> = {
      'pendente': '⏳',
      'em_analise': '🔍',
      'resolvido': '✅',
      'fechado': '📁'
    };
    return icones[status] || '📋';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background-secondary to-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-2">
            🔍 Acompanhar Feedback
          </h1>
          <p className="text-text-secondary">
            Digite o código do protocolo para consultar o status
          </p>
        </div>

        {/* Formulário de Busca */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={buscarProtocolo} className="space-y-4">
            <div>
              <label 
                htmlFor="protocolo" 
                className="block text-sm font-medium text-secondary mb-2"
              >
                Código do Protocolo
              </label>
              <input
                type="text"
                id="protocolo"
                value={protocolo}
                onChange={(e) => setProtocolo(e.target.value)}
                placeholder="Ex: OUVY-A3B9-K7M2"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-secondary text-lg font-mono uppercase"
                maxLength={17}
              />
              <p className="mt-1 text-xs text-text-secondary">
                O código foi enviado para você após o registro do feedback
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Consultando...
                </span>
              ) : (
                'Consultar Protocolo'
              )}
            </button>
          </form>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Resultado da Consulta */}
        {feedback && (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden animate-fade-in">
            {/* Header do Card */}
            <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Protocolo</p>
                  <p className="text-2xl font-bold font-mono">{feedback.protocolo}</p>
                </div>
                <div className={`px-4 py-2 rounded-full border-2 ${getStatusColor(feedback.status)}`}>
                  <span className="text-lg mr-2">{getStatusIcon(feedback.status)}</span>
                  <span className="font-semibold">{feedback.status_display}</span>
                </div>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-3">
                  Informações do Feedback
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-text-secondary font-medium w-24 flex-shrink-0">Tipo:</span>
                    <span className="text-secondary">{feedback.tipo_display}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-text-secondary font-medium w-24 flex-shrink-0">Título:</span>
                    <span className="text-secondary font-semibold">{feedback.titulo}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-text-secondary font-medium w-24 flex-shrink-0">Enviado em:</span>
                    <span className="text-secondary">{formatarData(feedback.data_criacao)}</span>
                  </div>
                  {feedback.data_atualizacao !== feedback.data_criacao && (
                    <div className="flex items-start">
                      <span className="text-text-secondary font-medium w-24 flex-shrink-0">Atualizado em:</span>
                      <span className="text-secondary">{formatarData(feedback.data_atualizacao)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline de Status */}
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Timeline
                </h3>
                <div className="relative pl-8 space-y-6">
                  {/* Linha vertical */}
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-neutral-200"></div>

                  {/* Evento: Criado */}
                  <div className="relative">
                    <div className="absolute -left-8 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-gray-800">✅ Feedback Registrado</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatarData(feedback.data_criacao)}
                      </p>
                    </div>
                  </div>

                  {/* Evento: Em Análise (se aplicável) */}
                  {(feedback.status === 'em_analise' || feedback.status === 'resolvido' || feedback.status === 'fechado') && (
                    <div className="relative">
                      <div className="absolute -left-8 w-4 h-4 rounded-full bg-primary border-2 border-white"></div>
                      <div className="bg-primary/10 rounded-lg p-4">
                        <p className="font-semibold text-primary">🔍 Em Análise</p>
                        <p className="text-sm text-primary-dark mt-1">
                          Estamos avaliando sua manifestação
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Evento: Resposta da Empresa */}
                  {feedback.resposta_empresa && (
                    <div className="relative">
                      <div className="absolute -left-8 w-4 h-4 rounded-full bg-purple-500 border-2 border-white animate-pulse"></div>
                      <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">💬</span>
                          <p className="font-semibold text-purple-800">Resposta da Empresa</p>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap mt-2">
                          {feedback.resposta_empresa}
                        </p>
                        {feedback.data_resposta && (
                          <p className="text-sm text-purple-600 mt-2">
                            Respondido em: {formatarData(feedback.data_resposta)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Evento: Status Atual */}
                  {feedback.status === 'pendente' && !feedback.resposta_empresa && (
                    <div className="relative">
                      <div className="absolute -left-8 w-4 h-4 rounded-full bg-yellow-500 border-2 border-white animate-pulse"></div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="font-semibold text-yellow-800">⏳ Aguardando Análise</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Sua manifestação será avaliada em breve
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversa Pública (se disponível) */}
              {Array.isArray(feedback?.interacoes) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Conversas Públicas
                  </h3>
                  <div className="space-y-3">
                    {feedback.interacoes
                      .filter((i: FeedbackInteraction) => i.tipo === 'MENSAGEM_PUBLICA' || i.tipo === 'MUDANCA_STATUS')
                      .map((i: FeedbackInteraction) => (
                        <div key={i.id} className="rounded border p-3 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{i.tipo === 'MENSAGEM_PUBLICA' ? i.autor_nome : 'Atualização de Status'}</span>
                            <span className="text-xs text-gray-500">{i.data_formatada || i.data}</span>
                          </div>
                          <p className="mt-1 text-gray-800">{i.mensagem}</p>
                        </div>
                      ))}
                  </div>
                  {/* Entrada de nova mensagem (placeholder até endpoint público) */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Envie uma mensagem para a empresa</p>
                    <textarea className="w-full border rounded p-2" placeholder="Escreva sua mensagem..." rows={3} disabled />
                    <p className="text-xs text-orange-600 mt-2">Em breve: envio de mensagens públicas pelo protocolo.</p>
                  </div>
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
                <p className="text-sm text-primary">
                  <strong>💡 Dica:</strong> Guarde este código de protocolo para consultas futuras. 
                  Você receberá notificações quando houver atualizações sobre seu feedback.
                </p>
              </div>

              {/* Conversa Pública */}
              {feedback && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversa</h3>
                  {feedback.interacoes && feedback.interacoes.length > 0 ? (
                    <div className="space-y-3">
                      {feedback.interacoes
                        .filter((i) => i.tipo === 'MENSAGEM_PUBLICA' || i.tipo === 'MUDANCA_STATUS')
                        .map((i) => (
                          <div key={i.id} className="rounded border p-3 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {i.tipo === 'MENSAGEM_PUBLICA' ? i.autor_nome : 'Atualização de Status'}
                              </span>
                              <span className="text-xs text-gray-500">{i.data_formatada}</span>
                            </div>
                            <p className="mt-1 text-gray-800">{i.mensagem}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Sem mensagens públicas ainda.</p>
                  )}
                  {/* Entrada de nova mensagem */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Envie uma mensagem para a empresa</p>
                    <textarea
                      className="w-full border rounded p-2"
                      placeholder="Escreva sua mensagem..."
                      rows={3}
                      value={publicMsg}
                      onChange={(e) => setPublicMsg(e.target.value)}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleEnviarResposta}
                        disabled={isSending || !publicMsg.trim()}
                        className="bg-primary text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
                      >
                        {isSending ? 'Enviando...' : 'Enviar Mensagem'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer - Link para voltar */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="text-primary hover:underline font-medium inline-flex items-center"
          >
            ← Voltar para página inicial
          </a>
        </div>
      </div>
    </main>
  );
}
