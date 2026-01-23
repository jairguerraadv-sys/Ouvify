# 🔨 Implementação de Gaps - Sprint 1 (Alta Prioridade)

**Data:** 22 de janeiro de 2026  
**Tempo Estimado:** 4 horas  
**Status:** 🚀 Iniciando Implementação

---

## 📋 GAPS A IMPLEMENTAR

### 1. ✅ Logout Explícito (30 minutos)
**Endpoint Backend:** `POST /api/logout/`  
**Status Atual:** UI existe mas não chama endpoint  
**Prioridade:** 🔴 ALTA

### 2. ✅ Exclusão/Arquivamento de Feedback (1 hora)
**Endpoint Backend:** `DELETE /api/feedbacks/{id}/`  
**Status Atual:** Não existe UI  
**Prioridade:** 🔴 ALTA

### 3. ✅ Edição de Feedback (2.5 horas)
**Endpoint Backend:** `PUT/PATCH /api/feedbacks/{id}/`  
**Status Atual:** Não existe página  
**Prioridade:** 🔴 ALTA

---

## 🛠️ IMPLEMENTAÇÃO 1: LOGOUT EXPLÍCITO

### Arquivos a Modificar
1. `/ouvy_frontend/components/dashboard/header.tsx`
2. `/ouvy_frontend/components/dashboard/sidebar.tsx`
3. `/ouvy_frontend/lib/auth.ts` (novo arquivo)

### Passo 1: Criar função de logout em `lib/auth.ts`

```typescript
// ouvy_frontend/lib/auth.ts
import { api } from './api';
import { useRouter } from 'next/navigation';

export interface LogoutOptions {
  redirect?: boolean;
  redirectTo?: string;
}

export async function logout(options: LogoutOptions = {}): Promise<void> {
  const { redirect = true, redirectTo = '/login' } = options;

  try {
    // Chamar endpoint de logout no backend para invalidar token
    await api.post('/api/logout/');
  } catch (error) {
    console.error('Erro ao fazer logout no servidor:', error);
    // Continuar mesmo se falhar (logout local)
  } finally {
    // Limpar storage local
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant_id');
    }

    // Redirecionar se solicitado
    if (redirect && typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }
}

export function useLogout() {
  const router = useRouter();

  return async (options?: LogoutOptions) => {
    await logout({
      redirect: false,
      ...options
    });
    router.push(options?.redirectTo || '/login');
  };
}
```

### Passo 2: Atualizar `components/dashboard/header.tsx`

**Localização da mudança:** Linha 90-93

```typescript
// ANTES:
<DropdownMenuItem className="text-red-600 cursor-pointer">
  <LogOut className="h-4 w-4 mr-2" />
  Sair
</DropdownMenuItem>

// DEPOIS:
<DropdownMenuItem 
  className="text-red-600 cursor-pointer"
  onClick={async () => {
    if (confirm('Deseja realmente sair?')) {
      await logout();
    }
  }}
>
  <LogOut className="h-4 w-4 mr-2" />
  Sair
</DropdownMenuItem>
```

**Adicionar import no topo:**
```typescript
import { logout } from '@/lib/auth';
```

### Passo 3: Atualizar `components/dashboard/sidebar.tsx`

**Localização da mudança:** Linha 133-135

```typescript
// ANTES:
<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
  <LogOut className="h-4 w-4" />
</Button>

// DEPOIS:
<Button 
  variant="ghost" 
  size="icon" 
  className="h-8 w-8 text-slate-400 hover:text-slate-600"
  onClick={async () => {
    if (confirm('Deseja realmente sair?')) {
      await logout();
    }
  }}
  aria-label="Sair da conta"
>
  <LogOut className="h-4 w-4" />
</Button>
```

**Adicionar import no topo:**
```typescript
import { logout } from '@/lib/auth';
```

---

## 🛠️ IMPLEMENTAÇÃO 2: EXCLUSÃO DE FEEDBACK

### Arquivos a Modificar
1. `/ouvy_frontend/app/dashboard/feedbacks/[protocolo]/page.tsx`
2. `/ouvy_frontend/hooks/use-dashboard.ts` (adicionar função)

### Passo 1: Adicionar função de exclusão em `hooks/use-dashboard.ts`

```typescript
// Adicionar após updateFeedback
export function deleteFeedback(id: number): Promise<void> {
  return api.delete(`/api/feedbacks/${id}/`);
}
```

### Passo 2: Adicionar botão de exclusão na página de detalhes

**Arquivo:** `app/dashboard/feedbacks/[protocolo]/page.tsx`

**Localização:** Adicionar no cabeçalho da página, ao lado do título (linha ~60-80)

```typescript
// Adicionar import
import { Trash2, Edit } from 'lucide-react';
import { deleteFeedback } from '@/hooks/use-dashboard';

// Dentro do componente FeedbackTicketContent, adicionar state
const [isDeleting, setIsDeleting] = useState(false);

// Adicionar função de exclusão
const handleDelete = async () => {
  if (!feedback) return;

  const confirmText = `Tem certeza que deseja excluir o feedback #${feedback.protocolo}?\n\nEsta ação não pode ser desfeita.`;
  
  if (!confirm(confirmText)) return;

  setIsDeleting(true);

  try {
    await deleteFeedback(feedback.id);
    toast.success('Feedback excluído com sucesso');
    router.push('/dashboard/feedbacks');
  } catch (error) {
    console.error('Erro ao excluir feedback:', error);
    toast.error('Erro ao excluir feedback. Tente novamente.');
  } finally {
    setIsDeleting(false);
  }
};

// Adicionar botões no header (após o título do feedback)
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-slate-900">
      Feedback #{feedback.protocolo}
    </h1>
    <p className="text-sm text-slate-600 mt-1">
      Criado em {new Date(feedback.data_criacao).toLocaleDateString('pt-BR')}
    </p>
  </div>
  
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push(`/dashboard/feedbacks/${feedback.protocolo}/edit`)}
      aria-label="Editar feedback"
    >
      <Edit className="h-4 w-4 mr-2" />
      Editar
    </Button>
    
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label="Excluir feedback"
    >
      {isDeleting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Excluindo...
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </>
      )}
    </Button>
  </div>
</div>
```

---

## 🛠️ IMPLEMENTAÇÃO 3: EDIÇÃO DE FEEDBACK

### Arquivos a Criar
1. `/ouvy_frontend/app/dashboard/feedbacks/[protocolo]/edit/page.tsx`

### Código Completo da Página de Edição

```typescript
"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, X } from "lucide-react";
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

      const data = response.data;
      setFeedback(data);
      
      // Preencher form
      setTipo(data.tipo);
      setTitulo(data.titulo);
      setDescricao(data.descricao);
      setStatus(data.status);
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
                  <span className="animate-spin mr-2">⏳</span>
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
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Logout Explícito
- [ ] Botão no header chama `/api/logout/`
- [ ] Botão na sidebar chama `/api/logout/`
- [ ] localStorage é limpo após logout
- [ ] Usuário é redirecionado para `/login`
- [ ] Confirmação antes de fazer logout

### Exclusão de Feedback
- [ ] Botão "Excluir" aparece na página de detalhes
- [ ] Confirmação antes de excluir
- [ ] Chamada DELETE `/api/feedbacks/{id}/` funciona
- [ ] Usuário é redirecionado após exclusão
- [ ] Loading state durante exclusão
- [ ] Toast de sucesso/erro

### Edição de Feedback
- [ ] Página `/dashboard/feedbacks/[protocolo]/edit` existe
- [ ] Form pré-preenchido com dados atuais
- [ ] Validação de campos (mínimo de caracteres)
- [ ] Chamada PATCH `/api/feedbacks/{id}/` funciona
- [ ] Usuário é redirecionado após salvar
- [ ] Loading state durante salvamento
- [ ] Toast de sucesso/erro
- [ ] Botão "Cancelar" volta para página anterior

---

## 🧪 TESTES MANUAIS

### Testar Logout
```bash
1. Fazer login na aplicação
2. Clicar no dropdown do usuário (header)
3. Clicar em "Sair"
4. Confirmar no dialog
5. Validar que foi redirecionado para /login
6. Validar que localStorage foi limpo
7. Tentar acessar /dashboard (deve redirecionar para /login)
```

### Testar Exclusão
```bash
1. Fazer login
2. Ir para /dashboard/feedbacks
3. Clicar em um feedback
4. Clicar no botão "Excluir"
5. Confirmar no dialog
6. Validar que foi redirecionado para /dashboard/feedbacks
7. Validar que feedback não aparece mais na lista
```

### Testar Edição
```bash
1. Fazer login
2. Ir para /dashboard/feedbacks
3. Clicar em um feedback
4. Clicar no botão "Editar"
5. Modificar título, descrição e status
6. Clicar em "Salvar Alterações"
7. Validar que foi redirecionado de volta
8. Validar que alterações foram salvas (recarregar página)
9. Testar cancelar sem salvar
```

---

## 📊 TEMPO ESTIMADO vs REAL

| Implementação | Estimado | Real | Status |
|---------------|----------|------|--------|
| Logout | 30min | - | 🚀 Iniciando |
| Exclusão | 1h | - | ⏳ Pendente |
| Edição | 2.5h | - | ⏳ Pendente |
| **TOTAL** | **4h** | **-** | **0% Concluído** |

---

**Próximo Passo:** Executar implementações na ordem definida
