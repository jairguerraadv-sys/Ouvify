"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, X, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

interface Feedback {
  id: number;
  protocolo: string;
  tipo: string;
  titulo: string;
  descricao: string;
  status: string;
  email_contato?: string;
  anonimo: boolean;
  data_criacao: string;
}

const FEEDBACK_TIPOS = [
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'bug', label: 'Bug' },
  { value: 'elogio', label: 'Elogio' },
  { value: 'reclamacao', label: 'Reclamação' },
  { value: 'duvida', label: 'Dúvida' },
];

const FEEDBACK_STATUS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'fechado', label: 'Fechado' },
];

export default function EditFeedbackPage() {
  return (
    <ProtectedRoute>
      <EditFeedbackContent />
    </ProtectedRoute>
  );
}

function EditFeedbackContent() {
  const router = useRouter();
  const params = useParams();
  const protocolo = params.protocolo as string;

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [tipo, setTipo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, [protocolo]);

  const fetchFeedback = async () => {
    try {
      const response = await api.get<Feedback>(`/api/feedbacks/consultar-protocolo/`, {
        params: { protocolo }
      });

      const feedbackData = response.data;
      setFeedback(feedbackData);
      
      // Preencher form
      setTipo(feedbackData.tipo);
      setTitulo(feedbackData.titulo);
      setDescricao(feedbackData.descricao);
      setStatus(feedbackData.status);
    } catch (error) {
      console.error('Erro ao carregar feedback:', error);
      toast.error('Erro ao carregar feedback');
      router.push('/dashboard/feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback) return;

    // Validações
    if (titulo.trim().length < 10) {
      toast.error('O título deve ter pelo menos 10 caracteres');
      return;
    }

    if (descricao.trim().length < 20) {
      toast.error('A descrição deve ter pelo menos 20 caracteres');
      return;
    }

    setSaving(true);

    try {
      await api.patch(`/api/feedbacks/${feedback.id}/`, {
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        status,
      });

      toast.success('Feedback atualizado com sucesso!');
      router.push(`/dashboard/feedbacks/${protocolo}`);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(getErrorMessage(error) || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </Card>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="p-6 text-center">
          <p className="text-slate-600">Feedback não encontrado</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/feedbacks')}>
            Voltar para Feedbacks
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/feedbacks/${protocolo}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Feedback</h1>
          <p className="text-sm text-slate-600">
            Protocolo: {feedback.protocolo}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Feedback
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              {FEEDBACK_TIPOS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <Input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do feedback (mínimo 10 caracteres)"
              required
              minLength={10}
              maxLength={200}
            />
            <p className="text-xs text-slate-500 mt-1">
              {titulo.length}/200 caracteres
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-slate-700 mb-2">
              Descrição <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição detalhada (mínimo 20 caracteres)"
              required
              minLength={20}
              rows={6}
            />
            <p className="text-xs text-slate-500 mt-1">
              {descricao.length} caracteres
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              {FEEDBACK_STATUS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Email de Contato (read-only) */}
          {feedback.email_contato && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email de Contato
              </label>
              <Input
                type="email"
                value={feedback.email_contato}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">
                Este campo não pode ser editado
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Card */}
      <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Ao editar um feedback, todas as interações e histórico serão mantidos.
          Apenas os campos acima serão atualizados.
        </p>
      </Card>
    </div>
  );
}
