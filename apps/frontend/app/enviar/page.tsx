'use client';

import { useState, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { validateForm } from '@/lib/validation';
import { stripHtml, sanitizeTextOnly } from '@/lib/sanitize';
import SuccessCard from '@/components/SuccessCard';
import { Logo } from '@/components/ui/logo';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { H2, Paragraph } from '@/components/ui/typography';
import { DecorativeBlob, FlexRow, MutedText } from '@/components/ui';
import { Shield, Lock, AlertCircle, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import type { FeedbackType } from '@/lib/types';

interface FormData {
  tipo: FeedbackType;
  titulo: string;
  descricao: string;
  anonimo: boolean;
  email_contato: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function EnviarFeedbackPage() {
  const [formData, setFormData] = useState<FormData>({
    tipo: 'denuncia',
    titulo: '',
    descricao: '',
    anonimo: false,
    email_contato: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [protocolo, setProtocolo] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validar formulário
    const validation = validateForm(formData, {
      titulo: { required: true, minLength: 5, maxLength: 200 },
      descricao: { required: true, minLength: 10 },
      email_contato: formData.anonimo ? {} : { required: true, type: 'email' },
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      // Sanitizar dados antes de enviar para a API
      const sanitizedData = {
        ...formData,
        titulo: stripHtml(formData.titulo.trim()),
        descricao: sanitizeTextOnly(formData.descricao.trim()),
        email_contato: formData.anonimo ? '' : stripHtml(formData.email_contato.trim().toLowerCase()),
      };
      
      const response = await api.post<{ protocolo: string }>('/api/feedbacks/', sanitizedData);
      
      // Salvar protocolo retornado
      setProtocolo(response.protocolo);
      
      // Limpar formulário
      setFormData({
        tipo: 'denuncia',
        titulo: '',
        descricao: '',
        anonimo: false,
        email_contato: ''
      });
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
      const errorMessage = getErrorMessage(err);
      
      if (errorMessage.includes('Network') || errorMessage.includes('ERR_NETWORK')) {
        setErrors({ submit: '⚠️ Não foi possível conectar ao servidor. Verifique se o backend está rodando.' });
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '', submit: '' }));
  }, []);

  return (
    <>
      <main className="min-h-screen bg-white py-12 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <DecorativeBlob tone="primary" placement="topRightQuarter" />
        <DecorativeBlob tone="secondary" placement="bottomLeftQuarter" />
        
        <div className="max-w-3xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
              <Logo size="xl" />
            </Link>
            <div className="mb-4">
              <Badge variant="primary" size="lg" className="gap-2 border border-primary/20 bg-primary/10">
                <Shield className="w-4 h-4" />
                Canal Seguro e Confidencial
              </Badge>
            </div>
            <H2 className="text-primary mb-3">
              📢 Canal de <span className="text-secondary">Ouvidoria</span>
            </H2>
            <Paragraph>
              <MutedText size="inherit">
                Sua voz importa. Compartilhe sua experiência de forma segura e anônima.
              </MutedText>
            </Paragraph>
          </div>

          {/* Alerta de Backend Offline */}
          {errors.submit && errors.submit.includes('conectar ao servidor') && (
            <Card className="mb-6 border-warning/30 bg-warning/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-secondary mb-2">
                      Backend Offline
                    </p>
                    <MutedText block className="mb-3">
                      O servidor Django não está respondendo. Para testar o envio de feedbacks, inicie o backend:
                    </MutedText>
                    <code className="block bg-muted text-secondary p-3 rounded-lg text-xs font-mono">
                      cd apps/backend && python manage.py runserver
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card Principal */}
          <Card className="shadow-lg border-border">
            <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary">Formulário de Manifestação</h3>
                  <MutedText block>Preencha os campos abaixo</MutedText>
                </div>
              </div>
            </CardHeader>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Tipo de Feedback */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-secondary">
                  Tipo de Manifestação
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value as FeedbackType)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-secondary transition-all"
                  required
                >
                  <option value="denuncia">🚨 Denúncia</option>
                  <option value="sugestao">💡 Sugestão</option>
                  <option value="reclamacao">😞 Reclamação</option>
                  <option value="elogio">⭐ Elogio</option>
                </select>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-secondary">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  placeholder="Resuma sua manifestação em poucas palavras"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-secondary transition-all ${
                    errors.titulo ? 'border-error bg-error/5' : 'border-border'
                  }`}
                  required
                  maxLength={200}
                />
                {errors.titulo && (
                  <p className="text-error text-sm flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 bg-error rounded-full" />
                    {errors.titulo}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-secondary">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleChange('descricao', e.target.value)}
                  placeholder="Descreva sua manifestação com detalhes..."
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-secondary resize-none transition-all ${
                    errors.descricao ? 'border-error bg-error/5' : 'border-border'
                  }`}
                  required
                />
                {errors.descricao && (
                  <p className="text-error text-sm flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 bg-error rounded-full" />
                    {errors.descricao}
                  </p>
                )}
              </div>

              {/* Checkbox Anônimo */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <input
                  type="checkbox"
                  id="anonimo"
                  checked={formData.anonimo}
                  onChange={(e) => handleChange('anonimo', e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="anonimo" className="flex-1 cursor-pointer">
                  <FlexRow className="mb-1">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-secondary text-sm">Enviar anonimamente</span>
                  </FlexRow>
                  <p className="text-sm text-muted-foreground">
                    Sua identidade será completamente protegida. Não será possível responder diretamente.
                  </p>
                </label>
              </div>

              {/* Email (se não for anônimo) */}
              {!formData.anonimo && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-secondary">
                    E-mail para Contato
                  </label>
                  <input
                    type="email"
                    value={formData.email_contato}
                    onChange={(e) => handleChange('email_contato', e.target.value)}
                    placeholder="seu@email.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-secondary transition-all ${
                      errors.email_contato ? 'border-error bg-error/5' : 'border-border'
                    }`}
                    required={!formData.anonimo}
                  />
                  {errors.email_contato && (
                    <p className="text-error text-sm flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-error rounded-full" />
                      {errors.email_contato}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Usaremos apenas para enviar atualizações sobre sua manifestação
                  </p>
                </div>
              )}

              {/* Mensagem de Erro */}
              {errors.submit && !errors.submit.includes('conectar ao servidor') && (
                <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
                  <p className="text-error text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.submit}</span>
                  </p>
                </div>
              )}

              {/* Botão de Envio */}
              <Button
                type="submit"
                size="lg"
                className="w-full group shadow-lg"
                disabled={loading}
                isLoading={loading}
              >
                {!loading && (
                  <>
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Enviar Manifestação
                  </>
                )}
              </Button>

              {/* Link para Acompanhar */}
              <div className="text-center pt-4 border-t border-border">
                <MutedText block className="mb-2">
                  Já enviou uma manifestação?
                </MutedText>
                <Link 
                  href="/acompanhar" 
                  className="text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-2 group transition-colors"
                >
                  <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Acompanhar Status do Protocolo
                </Link>
              </div>
            </form>

            {/* Footer do Card */}
            <div className="bg-muted/30 px-6 py-4 border-t border-border flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                Suas informações são tratadas com total <span className="font-semibold text-secondary">confidencialidade e segurança</span>
              </p>
            </div>
          </Card>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Badge variant="success" className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Criptografia SSL
            </Badge>
            <Badge variant="primary" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              LGPD Compliant
            </Badge>
            <Badge variant="info" className="flex items-center gap-1">
              99.9% Uptime
            </Badge>
          </div>
        </div>
      </main>

      {/* Modal de Sucesso */}
      {protocolo && (
        <SuccessCard 
          protocolo={protocolo} 
          onClose={() => setProtocolo(null)} 
        />
      )}
    </>
  );
}
