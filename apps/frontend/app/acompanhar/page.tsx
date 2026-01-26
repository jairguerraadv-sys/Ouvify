'use client';

import { useState, useCallback, useMemo, FormEvent, useEffect } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { Logo } from '@/components/ui/logo';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge-chip';
import { H2, Paragraph } from '@/components/ui/typography';
import { formatDate } from '@/lib/helpers';
import { stripHtml, sanitizeTextOnly } from '@/lib/sanitize';
import { Search, Shield, Clock, CheckCircle, AlertCircle, Send, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { Feedback, FeedbackStatus, FeedbackType } from '@/lib/types';
import { useDebounce } from '@/hooks/use-common';

interface FeedbackInteraction {
  id: number;
  tipo: 'MENSAGEM_PUBLICA' | 'NOTA_INTERNA' | 'MUDANCA_STATUS';
  mensagem: string;
  data: string;
  data_formatada?: string;
  autor_nome: string;
}

interface FeedbackStatusResponse extends Feedback {
  interacoes?: FeedbackInteraction[];
  tipo_display: string;
  status_display: string;
}

export default function AcompanharPage() {
  const [protocolo, setProtocolo] = useState('');
  const debouncedProtocolo = useDebounce(protocolo, 300);
  const [feedback, setFeedback] = useState<FeedbackStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicMsg, setPublicMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);

  const MAX_MESSAGE_LENGTH = 1000;

  // Cooldown timer to respect rate limiting feedback from API
  useEffect(() => {
    if (!cooldownMs) return;
    const timer = setInterval(() => {
      setCooldownMs((prev) => (prev - 1000 > 0 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownMs]);

  const buscarProtocolo = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    if (cooldownMs > 0) {
      setError('Aguarde alguns segundos antes de tentar novamente.');
      return;
    }
    
    if (!debouncedProtocolo.trim()) {
      setError('Por favor, digite um código de protocolo');
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await api.get<FeedbackStatusResponse>('/api/feedbacks/consultar-protocolo/', {
        params: { protocolo: debouncedProtocolo.toUpperCase().trim() }
      });

      setFeedback(response);
    } catch (err) {
      const status = (err as any)?.response?.status as number | undefined;
      const waitSeconds = (err as any)?.response?.data?.wait_seconds as number | undefined;
      const errorMessage = getErrorMessage(err);
      
      if (status === 429 || errorMessage.includes('429') || errorMessage.includes('tentativas')) {
        const ms = Math.max((waitSeconds ?? 60) * 1000, 0);
        setCooldownMs(ms);
        setError(`🚨 Muitas tentativas. Aguarde ${Math.ceil(ms / 1000)} segundos antes de tentar de novo.`);
      } else if (status === 404 || errorMessage.includes('não encontrado')) {
        setError('Protocolo não encontrado. Verifique o código digitado.');
      } else if (status === 400 || errorMessage.includes('inválido')) {
        setError('Código de protocolo inválido.');
      } else if (errorMessage.includes('Network') || errorMessage.includes('ERR_NETWORK')) {
        setError('⚠️ Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      } else {
        setError(errorMessage || 'Erro ao consultar protocolo. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedProtocolo, cooldownMs]);

  const handleEnviarResposta = useCallback(async () => {
    if (!feedback) return;
    if (!publicMsg.trim()) return;
    if (publicMsg.trim().length > MAX_MESSAGE_LENGTH) {
      setError(`Mensagem excede o limite de ${MAX_MESSAGE_LENGTH} caracteres.`);
      return;
    }
    
    try {
      setIsSending(true);
      setError(null);
      
      // Sanitizar mensagem antes de enviar
      const sanitizedMessage = sanitizeTextOnly(publicMsg.trim());
      
      const res = await api.post<FeedbackInteraction>('/api/feedbacks/responder-protocolo/', {
        protocolo: feedback.protocolo,
        mensagem: sanitizedMessage,
      });
      
      // Adicionar a nova interação à lista local
      setFeedback((prev) => {
        if (!prev) return prev;
        const interacoes = prev.interacoes ? [...prev.interacoes] : [];
        interacoes.unshift(res); // Mais recente primeiro
        return { ...prev, interacoes };
      });
      
      setPublicMsg('');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      if (errorMessage.includes('excede o limite') || errorMessage.includes('limite')) {
        setError(errorMessage);
      } else {
        setError(errorMessage || 'Erro ao enviar mensagem. Tente novamente.');
      }
    } finally {
      setIsSending(false);
    }
  }, [feedback, publicMsg]);

  const getStatusColor = useCallback((status: string) => {
    const cores: Record<string, string> = {
      'pendente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'em_analise': 'bg-primary/10 text-primary border-primary/30',
      'resolvido': 'bg-green-100 text-green-800 border-green-300',
      'fechado': 'bg-neutral-100 text-secondary border-neutral-300'
    };
    return cores[status] || 'bg-neutral-100 text-secondary border-neutral-300';
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const icones: Record<string, string> = {
      'pendente': '⏳',
      'em_analise': '🔍',
      'resolvido': '✅',
      'fechado': '📁'
    };
    return icones[status] || '📋';
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
            <Logo size="xl" />
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <Search className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Consulta de Protocolo
            </span>
          </div>
          <H2 className="text-primary mb-3">
            🔍 Acompanhar <span className="text-secondary">Feedback</span>
          </H2>
          <Paragraph className="text-muted-foreground">
            Digite o código do protocolo para consultar o status da sua manifestação
          </Paragraph>
        </div>

        {/* Card de Busca */}
        <Card className="mb-8 shadow-lg border-border">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary">Buscar Protocolo</h3>
                <p className="text-sm text-muted-foreground">Informe o código recebido</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={buscarProtocolo} className="space-y-4">
              <div className="space-y-2">
                <label 
                  htmlFor="protocolo" 
                  className="block text-sm font-semibold text-secondary"
                >
                  Código do Protocolo
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    id="protocolo"
                    value={protocolo}
                    onChange={(e) => setProtocolo(e.target.value)}
                    placeholder="Ex: OUVY-A3B9-K7M2"
                    className="w-full pl-11 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-secondary text-lg font-mono uppercase transition-all"
                    maxLength={17}
                  />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  O código foi enviado para você após o registro do feedback
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full group shadow-md"
                disabled={loading || cooldownMs > 0}
                isLoading={loading}
              >
                {!loading && (
                  <>
                    <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Consultar Protocolo
                  </>
                )}
              </Button>
            </form>

            {/* Mensagem de Erro */}
            {error && (
              <div className="mt-4 p-4 bg-error/10 border border-error/30 rounded-lg">
                <p className="text-error text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </p>
              </div>
            )}
            
            {cooldownMs > 0 && (
              <div className="mt-3 flex items-center gap-2 text-warning text-sm">
                <Clock className="w-4 h-4" />
                <span>Aguarde {Math.ceil(cooldownMs / 1000)}s para nova consulta</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resultado da Consulta */}
        {feedback && (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden animate-fade-in">
            {/* Header do Card */}
            <div className="bg-gradient-to-r from-primary to-primary-600 p-6 text-white">
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
                    <span className="text-secondary">{formatDate(feedback.data_criacao, 'long')}</span>
                  </div>
                  {feedback.data_atualizacao !== feedback.data_criacao && (
                    <div className="flex items-start">
                      <span className="text-text-secondary font-medium w-24 flex-shrink-0">Atualizado em:</span>
                      <span className="text-secondary">{formatDate(feedback.data_atualizacao, 'long')}</span>
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
                        {formatDate(feedback.data_criacao, 'long')}
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
                      <div className="absolute -left-8 w-4 h-4 rounded-full bg-secondary-500 border-2 border-white animate-pulse"></div>
                      <div className="bg-secondary-50 rounded-lg p-4 border-l-4 border-secondary-500">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">💬</span>
                          <p className="font-semibold text-secondary-800">Resposta da Empresa</p>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap mt-2">
                          {feedback.resposta_empresa}
                        </p>
                        {feedback.data_resposta && (
                          <p className="text-sm text-secondary-600 mt-2">
                            Respondido em: {formatDate(feedback.data_resposta, 'long')}
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
                      placeholder={`Escreva sua mensagem (máx. ${MAX_MESSAGE_LENGTH} caracteres)...`}
                      rows={3}
                      value={publicMsg}
                      onChange={(e) => setPublicMsg(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    />
                    <div className="mt-1 text-xs text-gray-500 text-right">
                      {publicMsg.length}/{MAX_MESSAGE_LENGTH}
                    </div>
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
