'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Edit,
  ChevronDown,
  Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

interface ResponseTemplate {
  id: number;
  nome: string;
  categoria: string;
  categoria_display: string;
  assunto: string;
  conteudo: string;
  tipos_aplicaveis: string[];
  ativo: boolean;
  uso_count: number;
  criado_em: string;
}

interface TemplateCategory {
  categoria: string;
  categoria_display: string;
  templates: {
    id: number;
    nome: string;
    uso_count: number;
  }[];
}

interface ResponseTemplateSelectorProps {
  feedbackId: number;
  feedbackProtocolo: string;
  onTemplateApplied: (content: string, assunto?: string) => void;
}

const CATEGORIA_CHOICES = [
  { value: 'agradecimento', label: 'Agradecimento' },
  { value: 'recebimento', label: 'Confirmação de Recebimento' },
  { value: 'analise', label: 'Em Análise' },
  { value: 'resolucao', label: 'Resolução' },
  { value: 'encerramento', label: 'Encerramento' },
  { value: 'esclarecimento', label: 'Pedido de Esclarecimento' },
  { value: 'outro', label: 'Outro' },
];

/**
 * Componente para selecionar e aplicar templates de resposta
 */
export function ResponseTemplateSelector({
  feedbackId,
  feedbackProtocolo,
  onTemplateApplied,
}: ResponseTemplateSelectorProps) {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get<TemplateCategory[]>('/api/response-templates/by-category/');
      setCategories(response);
    } catch (error) {
      toast.error('Erro ao carregar templates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (templateId: number) => {
    try {
      setApplying(true);
      const response = await api.post<{
        rendered_content: string;
        assunto: string;
        template_nome: string;
      }>('/api/response-templates/render/', {
        template_id: templateId,
        feedback_id: feedbackId,
      });

      onTemplateApplied(response.rendered_content, response.assunto);
      toast.success(`Template "${response.template_nome}" aplicado`);
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Erro ao aplicar template');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-warning-500" />
            Templates de Resposta
          </DialogTitle>
          <DialogDescription>
            Selecione um template para aplicar ao feedback {feedbackProtocolo}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum template cadastrado</p>
            <p className="text-sm mt-2">
              Crie templates para agilizar suas respostas
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.categoria}>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  {category.categoria_display}
                </h4>
                <div className="grid gap-2">
                  {category.templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="ghost"
                      className="justify-between h-auto py-3 px-4"
                      onClick={() => applyTemplate(template.id)}
                      disabled={applying}
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {template.nome}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {template.uso_count}x usado
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Componente para gerenciar templates (CRUD)
 */
export function ResponseTemplateManager() {
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ results: ResponseTemplate[] }>('/api/response-templates/');
      setTemplates(response.results || []);
    } catch (error) {
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('Deseja realmente excluir este template?')) return;

    try {
      await api.delete(`/api/response-templates/${id}/`);
      toast.success('Template excluído');
      fetchTemplates();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Erro ao excluir template');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Templates de Resposta</h3>
          <p className="text-sm text-muted-foreground">
            Crie respostas padrão para agilizar o atendimento
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Template</DialogTitle>
            </DialogHeader>
            <TemplateForm
              onSuccess={() => {
                setIsCreateOpen(false);
                fetchTemplates();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum template cadastrado</p>
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Criar primeiro template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id} className={!template.ativo ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {template.nome}
                      {!template.ativo && (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{template.categoria_display}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Usado {template.uso_count}x
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Template</DialogTitle>
                        </DialogHeader>
                        <TemplateForm
                          template={template}
                          onSuccess={() => {
                            setEditingTemplate(null);
                            fetchTemplates();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.conteudo}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Formulário para criar/editar templates
 */
function TemplateForm({
  template,
  onSuccess,
}: {
  template?: ResponseTemplate;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: template?.nome || '',
    categoria: template?.categoria || 'outro',
    assunto: template?.assunto || '',
    conteudo: template?.conteudo || '',
    ativo: template?.ativo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.conteudo.trim()) {
      toast.error('Preencha nome e conteúdo');
      return;
    }

    try {
      setLoading(true);

      if (template) {
        await api.put(`/api/response-templates/${template.id}/`, formData);
        toast.success('Template atualizado');
      } else {
        await api.post('/api/response-templates/', formData);
        toast.success('Template criado');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Erro ao salvar template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Template *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Agradecimento Padrão"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIA_CHOICES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assunto">Assunto do Email (opcional)</Label>
        <Input
          id="assunto"
          value={formData.assunto}
          onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
          placeholder="Ex: Resposta ao seu feedback - {{protocolo}}"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="conteudo">Conteúdo *</Label>
        <Textarea
          id="conteudo"
          value={formData.conteudo}
          onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
          placeholder="Digite o texto do template. Use variáveis como {{protocolo}}, {{nome}}, {{tipo}}, {{status}}"
          rows={8}
          required
        />
        <p className="text-xs text-muted-foreground">
          Variáveis disponíveis: {'{{protocolo}}'}, {'{{nome}}'}, {'{{tipo}}'}, {'{{status}}'}, {'{{titulo}}'}, {'{{email}}'}
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : template ? 'Salvar Alterações' : 'Criar Template'}
        </Button>
      </div>
    </form>
  );
}

export default ResponseTemplateSelector;
