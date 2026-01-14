# 🔧 Plano de Ação - Correções e Melhorias

**Data:** 14 de Janeiro de 2026  
**Baseado em:** ANALISE_ROTAS_INTEGRACAO.md  
**Objetivo:** Corrigir problemas críticos e implementar integrações faltantes

---

## 🚨 FASE 1: Correções Críticas (URGENTE)

### Tempo Estimado: 4 horas
### Prioridade: CRÍTICA 🔴

---

### 1.1 Criar Endpoint `/api/auth/me/` (1 hora)

**Problema:** Frontend chama endpoint que não existe  
**Impacto:** Atualização de perfil retorna 404

#### Backend - Criar Serializer
```python
# ouvy_saas/apps/core/serializers.py
from rest_framework import serializers
from apps.core.models import User

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['nome', 'email', 'telefone', 'cargo']
        read_only_fields = ['email']  # Email não deve ser alterado
    
    def validate_telefone(self, value):
        # Validação de telefone brasileiro
        import re
        if value and not re.match(r'^\(\d{2}\)\s\d{4,5}-\d{4}$', value):
            raise serializers.ValidationError(
                "Telefone deve estar no formato (XX) XXXXX-XXXX"
            )
        return value
```

#### Backend - Criar View
```python
# ouvy_saas/apps/core/profile_views.py (CRIAR NOVO ARQUIVO)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserUpdateSerializer
import logging

logger = logging.getLogger(__name__)

class UserProfileUpdateView(APIView):
    """
    Atualiza informações do perfil do usuário autenticado.
    
    PATCH /api/auth/me/
    Body: { "nome": "João Silva", "telefone": "(11) 98765-4321" }
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Retorna dados do usuário atual"""
        serializer = UserUpdateSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        """Atualiza dados do usuário"""
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Perfil atualizado: {request.user.email}")
            return Response(serializer.data)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
```

#### Backend - Registrar Rota
```python
# ouvy_saas/config/urls.py
# Adicionar import
from apps.core.profile_views import UserProfileUpdateView

# Adicionar no urlpatterns (após linha 75):
path('api/auth/me/', UserProfileUpdateView.as_view(), name='user-profile'),
```

#### Testar
```bash
# 1. Iniciar servidor
cd ouvy_saas
python manage.py runserver

# 2. Testar em outro terminal
# Login primeiro
curl -X POST http://localhost:8000/api-token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "senha"}'

# Salvar o token retornado

# 3. Buscar perfil
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Token SEU_TOKEN"

# 4. Atualizar perfil
curl -X PATCH http://localhost:8000/api/auth/me/ \
  -H "Authorization: Token SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome": "João Silva Atualizado", "telefone": "(11) 98765-4321"}'

# Deve retornar os dados atualizados
```

---

### 1.2 Remover Landing Page Duplicada (5 minutos)

**Problema:** `app/landing-example.tsx` não é usada e causa confusão

```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend

# Opção 1: Remover completamente
rm app/landing-example.tsx

# OU Opção 2: Mover para exemplos (para referência futura)
mkdir -p examples
mv app/landing-example.tsx examples/
```

#### Verificar Referências
```bash
# Garantir que nenhum arquivo importa landing-example
grep -r "landing-example" app/ components/
# Não deve retornar nada
```

---

### 1.3 Validação de Subdomínio em Tempo Real (45 minutos)

**Problema:** Cadastro não valida se subdomínio está disponível

#### Frontend - Adicionar Validação
```typescript
// ouvy_frontend/app/cadastro/page.tsx

// Adicionar imports
import { useDebounce } from '@/hooks/use-common';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Adicionar estados (depois dos useState existentes)
const [subdominioStatus, setSubdominioStatus] = useState<{
  status: 'disponivel' | 'indisponivel' | 'verificando' | null;
  message: string;
}>({ status: null, message: '' });

// Adicionar função de validação
const debouncedSubdominio = useDebounce(formData.subdominio, 500);

useEffect(() => {
  if (!debouncedSubdominio || debouncedSubdominio.length < 3) {
    setSubdominioStatus({ status: null, message: '' });
    return;
  }

  const checkSubdominio = async () => {
    setSubdominioStatus({ status: 'verificando', message: 'Verificando...' });
    
    try {
      const response = await api.get('/api/check-subdominio/', {
        params: { subdominio: debouncedSubdominio }
      });
      
      if (response.disponivel) {
        setSubdominioStatus({
          status: 'disponivel',
          message: '✓ Subdomínio disponível!'
        });
      } else {
        setSubdominioStatus({
          status: 'indisponivel',
          message: '✗ Este subdomínio já está em uso'
        });
      }
    } catch (err) {
      console.error('Erro ao verificar subdomínio:', err);
      setSubdominioStatus({ status: null, message: '' });
    }
  };

  checkSubdominio();
}, [debouncedSubdominio]);

// No JSX do input de subdomínio, adicionar feedback visual:
<div className="relative">
  <Input
    id="subdominio"
    value={formData.subdominio}
    onChange={(e) => handleChange('subdominio', e.target.value)}
    placeholder="minhaempresa"
    required
    disabled={loading}
    className={
      subdominioStatus.status === 'disponivel' 
        ? 'border-green-500' 
        : subdominioStatus.status === 'indisponivel'
        ? 'border-red-500'
        : ''
    }
  />
  
  {/* Ícone de status */}
  <div className="absolute right-3 top-1/2 -translate-y-1/2">
    {subdominioStatus.status === 'verificando' && (
      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
    )}
    {subdominioStatus.status === 'disponivel' && (
      <CheckCircle className="h-4 w-4 text-green-500" />
    )}
    {subdominioStatus.status === 'indisponivel' && (
      <XCircle className="h-4 w-4 text-red-500" />
    )}
  </div>
</div>

{/* Mensagem de status */}
{subdominioStatus.message && (
  <p className={`text-sm mt-1 ${
    subdominioStatus.status === 'disponivel' 
      ? 'text-green-600' 
      : 'text-red-600'
  }`}>
    {subdominioStatus.message}
  </p>
)}

// Atualizar validação do submit (adicionar verificação):
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Verificar subdomínio antes de enviar
  if (subdominioStatus.status !== 'disponivel') {
    setErrors({ subdominio: 'Aguarde a verificação do subdomínio ou escolha outro' });
    return;
  }
  
  // ... resto do código de submit
};
```

#### Testar
1. Abrir `http://localhost:3000/cadastro`
2. Digitar um subdomínio no campo
3. Aguardar 500ms
4. Deve aparecer ícone verde (disponível) ou vermelho (indisponível)
5. Tentar cadastrar com subdomínio indisponível - deve bloquear

---

### 1.4 Remover Pasta Vazia (2 minutos)

```bash
cd /Users/jairneto/Desktop/ouvy_saas/ouvy_frontend
rm -rf app/\(site\)
```

---

### ✅ Checklist Fase 1
- [ ] Criar `apps/core/serializers.py` com `UserUpdateSerializer`
- [ ] Criar `apps/core/profile_views.py` com `UserProfileUpdateView`
- [ ] Adicionar rota `api/auth/me/` em `config/urls.py`
- [ ] Testar GET e PATCH no endpoint
- [ ] Remover ou mover `app/landing-example.tsx`
- [ ] Implementar validação de subdomínio em tempo real
- [ ] Testar cadastro com validação
- [ ] Remover pasta `(site)` vazia
- [ ] Commitar mudanças

```bash
git add .
git commit -m "fix: correções críticas fase 1

- Criar endpoint PATCH /api/auth/me/ para atualização de perfil
- Adicionar validação de subdomínio em tempo real no cadastro
- Remover landing-example.tsx duplicada
- Limpar estrutura removendo pasta (site) vazia"
```

---

## 💳 FASE 2: Integração de Pagamentos (ALTA PRIORIDADE)

### Tempo Estimado: 5 horas
### Prioridade: ALTA 🟠

---

### 2.1 Integrar Stripe Checkout na Página de Preços (2 horas)

#### Frontend - Atualizar Página de Preços
```typescript
// ouvy_frontend/app/precos/page.tsx

// Adicionar imports
import { api } from '@/lib/api';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Adicionar estados
const [loading, setLoading] = useState<string | null>(null);
const { user } = useAuth();
const router = useRouter();

// Adicionar função de checkout
const handleSubscribe = async (priceId: string, planName: string) => {
  if (!user) {
    router.push('/login?redirect=/precos');
    return;
  }
  
  setLoading(priceId);
  
  try {
    const response = await api.post('/api/tenants/subscribe/', {
      price_id: priceId,
      success_url: `${window.location.origin}/dashboard?payment=success&plan=${planName}`,
      cancel_url: `${window.location.origin}/precos?payment=cancelled`
    });
    
    // Redirecionar para Stripe Checkout
    window.location.href = response.checkout_url;
  } catch (err) {
    console.error('Erro ao criar checkout:', err);
    alert('Erro ao processar pagamento. Tente novamente.');
  } finally {
    setLoading(null);
  }
};

// Nos botões dos planos:
<Button
  onClick={() => handleSubscribe('price_basico_mensal', 'Básico')}
  disabled={loading === 'price_basico_mensal'}
  className="w-full"
>
  {loading === 'price_basico_mensal' ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Processando...
    </>
  ) : (
    'Assinar Plano Básico'
  )}
</Button>
```

#### Backend - Configurar Price IDs
```python
# ouvy_saas/config/settings.py
# Adicionar configurações Stripe (se não existirem)

STRIPE_PRICE_IDS = {
    'basico_mensal': 'price_1234567890abcdef',  # Substituir pelos IDs reais do Stripe
    'profissional_mensal': 'price_abcdef1234567890',
    'empresarial_mensal': 'price_fedcba0987654321',
}
```

#### Criar Price IDs no Stripe Dashboard
1. Acessar https://dashboard.stripe.com/products
2. Criar 3 produtos:
   - **Básico:** R$ 99/mês
   - **Profissional:** R$ 299/mês
   - **Empresarial:** R$ 799/mês
3. Copiar os Price IDs (começam com `price_`)
4. Adicionar no `.env` do Railway

#### Testar
1. Clicar em "Assinar" na página de preços
2. Deve redirecionar para Stripe Checkout
3. Usar cartão de teste: `4242 4242 4242 4242`
4. Completar pagamento
5. Deve redirecionar para dashboard com mensagem de sucesso

---

### 2.2 Criar Página de Gerenciamento de Assinatura (3 horas)

#### Frontend - Criar Nova Página
```typescript
// ouvy_frontend/app/dashboard/assinatura/page.tsx (CRIAR NOVO)
'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/helpers';
import { CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due';
  plan: string;
  amount: number;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

const fetcher = (url: string) => api.get(url);

export default function AssinaturaPage() {
  return (
    <ProtectedRoute>
      <AssinaturaContent />
    </ProtectedRoute>
  );
}

function AssinaturaContent() {
  const { data: subscription, error, mutate } = useSWR<Subscription>(
    '/api/tenants/subscription/',
    fetcher
  );
  
  const [loading, setLoading] = useState(false);
  const user = { name: 'João Silva', email: 'joao@empresa.com' };

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você terá acesso até o final do período pago.')) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/tenants/subscription/', {});
      await mutate();
      alert('Assinatura cancelada com sucesso. Você terá acesso até o fim do período.');
    } catch (err) {
      console.error(err);
      alert('Erro ao cancelar assinatura.');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setLoading(true);
    try {
      await api.post('/api/tenants/subscription/reactivate/', {});
      await mutate();
      alert('Assinatura reativada com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao reativar assinatura.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar informações da assinatura. Tente novamente.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <Card>
            <CardContent className="pt-6">
              <p>Carregando...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const statusBadge = {
    active: { label: 'Ativa', className: 'bg-green-100 text-green-700' },
    canceled: { label: 'Cancelada', className: 'bg-red-100 text-red-700' },
    past_due: { label: 'Pagamento Pendente', className: 'bg-yellow-100 text-yellow-700' },
  }[subscription.status];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-secondary-600 mb-2">
              Minha Assinatura
            </h1>
            <p className="text-slate-600">
              Gerencie sua assinatura e forma de pagamento
            </p>
          </div>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Status da Assinatura</CardTitle>
                <Badge className={statusBadge.className}>
                  {statusBadge.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Plano Atual</p>
                  <p className="text-lg font-semibold">{subscription.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Valor</p>
                  <p className="text-lg font-semibold">
                    R$ {(subscription.amount / 100).toFixed(2)}/mês
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Próxima Cobrança</p>
                  <p className="text-lg font-semibold">
                    {formatDate(subscription.current_period_end)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Renovação Automática</p>
                  <p className="text-lg font-semibold">
                    {subscription.cancel_at_period_end ? 'Não' : 'Sim'}
                  </p>
                </div>
              </div>

              {subscription.cancel_at_period_end && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Sua assinatura será cancelada em {formatDate(subscription.current_period_end)}.
                    Você pode reativá-la a qualquer momento antes desta data.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Assinatura</CardTitle>
              <CardDescription>
                Altere ou cancele sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Processando...' : 'Cancelar Assinatura'}
                </Button>
              )}

              {subscription.cancel_at_period_end && (
                <Button
                  onClick={handleReactivateSubscription}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Processando...' : 'Reativar Assinatura'}
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Atualizar Forma de Pagamento
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
```

#### Adicionar Link na Sidebar
```typescript
// ouvy_frontend/components/dashboard/sidebar.tsx
// Adicionar item no menu:
{
  icon: CreditCard,
  label: 'Assinatura',
  href: '/dashboard/assinatura',
  badge: user.subscription_status === 'past_due' ? 'Pendente' : undefined
}
```

#### Testar
1. Acessar `/dashboard/assinatura`
2. Verificar informações da assinatura
3. Testar cancelamento
4. Testar reativação

---

### ✅ Checklist Fase 2
- [ ] Configurar Price IDs no Stripe Dashboard
- [ ] Adicionar variáveis de ambiente no Railway
- [ ] Implementar botões de checkout na página de preços
- [ ] Criar página `app/dashboard/assinatura/page.tsx`
- [ ] Adicionar link na sidebar
- [ ] Testar fluxo completo de pagamento
- [ ] Testar cancelamento de assinatura
- [ ] Testar reativação de assinatura
- [ ] Commitar mudanças

```bash
git add .
git commit -m "feat: integração completa de pagamentos Stripe

- Adicionar botões de checkout na página de preços
- Criar página de gerenciamento de assinatura
- Implementar cancelamento e reativação
- Integrar com endpoints Stripe do backend"
```

---

## 🔐 FASE 3: Compliance LGPD (ALTA PRIORIDADE)

### Tempo Estimado: 2 horas
### Prioridade: ALTA 🟠

---

### 3.1 Adicionar Exportação de Dados (1 hora)

#### Frontend - Atualizar Página de Perfil
```typescript
// ouvy_frontend/app/dashboard/perfil/page.tsx
// Adicionar na seção de "Privacidade e Dados"

const handleExportData = async () => {
  try {
    const response = await api.get('/api/export-data/');
    
    // Criar blob e fazer download
    const blob = new Blob([JSON.stringify(response, null, 2)], {
      type: 'application/json'
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus_dados_ouvy_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert('Seus dados foram exportados com sucesso!');
  } catch (err) {
    console.error('Erro ao exportar dados:', err);
    alert('Erro ao exportar dados. Tente novamente.');
  }
};

// JSX:
<Card>
  <CardHeader>
    <CardTitle>Privacidade e Dados (LGPD)</CardTitle>
    <CardDescription>
      Conforme a Lei Geral de Proteção de Dados, você pode exportar ou excluir seus dados
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Button onClick={handleExportData} variant="outline" className="w-full">
      <Download className="mr-2 h-4 w-4" />
      Exportar Meus Dados
    </Button>
    
    <p className="text-sm text-slate-600">
      Seus dados serão exportados em formato JSON
    </p>
  </CardContent>
</Card>
```

---

### 3.2 Adicionar Exclusão de Conta (1 hora)

```typescript
// Continuar na página de perfil

const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
const [deleteConfirmText, setDeleteConfirmText] = useState('');

const handleDeleteAccount = async () => {
  if (deleteConfirmText !== 'EXCLUIR MINHA CONTA') {
    alert('Digite exatamente "EXCLUIR MINHA CONTA" para confirmar');
    return;
  }

  try {
    await api.delete('/api/account/');
    
    // Fazer logout
    logout();
    
    router.push('/');
    alert('Sua conta foi excluída com sucesso.');
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    alert('Erro ao excluir conta. Tente novamente.');
  }
};

// JSX (continuação):
<Card className="border-red-200">
  <CardHeader>
    <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
    <CardDescription>
      Ações irreversíveis
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Button
      onClick={() => setShowDeleteConfirmation(true)}
      variant="destructive"
      className="w-full"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Excluir Minha Conta
    </Button>
    
    {showDeleteConfirmation && (
      <div className="space-y-4 p-4 border-2 border-red-500 rounded-lg bg-red-50">
        <p className="text-sm font-semibold text-red-700">
          ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
        </p>
        <p className="text-sm text-red-600">
          Todos os seus dados serão permanentemente excluídos, incluindo:
        </p>
        <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
          <li>Seu perfil e informações pessoais</li>
          <li>Todos os feedbacks enviados</li>
          <li>Histórico de interações</li>
          <li>Configurações da empresa</li>
        </ul>
        
        <div>
          <Label htmlFor="deleteConfirm">
            Digite <strong>"EXCLUIR MINHA CONTA"</strong> para confirmar:
          </Label>
          <Input
            id="deleteConfirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="EXCLUIR MINHA CONTA"
            className="mt-2"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            disabled={deleteConfirmText !== 'EXCLUIR MINHA CONTA'}
            className="flex-1"
          >
            Confirmar Exclusão
          </Button>
          <Button
            onClick={() => {
              setShowDeleteConfirmation(false);
              setDeleteConfirmText('');
            }}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

---

### ✅ Checklist Fase 3
- [ ] Adicionar seção "Privacidade e Dados" no perfil
- [ ] Implementar exportação de dados
- [ ] Implementar exclusão de conta com confirmação
- [ ] Testar exportação (verificar JSON)
- [ ] Testar exclusão (verificar logout automático)
- [ ] Commitar mudanças

```bash
git add .
git commit -m "feat: implementar funcionalidades LGPD

- Adicionar exportação de dados pessoais
- Adicionar exclusão de conta com confirmação dupla
- Integrar com endpoints LGPD do backend
- Adicionar seção de privacidade no perfil"
```

---

## 📊 Resumo do Plano

| Fase | Tarefas | Tempo | Prioridade | Status |
|------|---------|-------|------------|--------|
| 1 - Crítico | 4 tarefas | 4h | 🔴 Crítica | Pendente |
| 2 - Pagamentos | 2 tarefas | 5h | 🟠 Alta | Pendente |
| 3 - LGPD | 2 tarefas | 2h | 🟠 Alta | Pendente |
| **TOTAL** | **8 tarefas** | **11h** | - | - |

---

## 🚀 Execução Recomendada

### Dia 1 (4 horas)
- [ ] Executar Fase 1 completa
- [ ] Testar todas as correções
- [ ] Commitar

### Dia 2 (5 horas)
- [ ] Executar Fase 2 completa
- [ ] Testar fluxo de pagamento
- [ ] Commitar

### Dia 3 (2 horas)
- [ ] Executar Fase 3 completa
- [ ] Testar LGPD
- [ ] Commitar

### Dia 4 (2 horas)
- [ ] Testes de regressão
- [ ] Atualizar documentação
- [ ] Deploy em produção

---

**Próximos Passos:**
1. Revisar este plano com o time
2. Alocar desenvolvedor(es)
3. Executar fase por fase
4. Testar cada fase antes de avançar
5. Deploy após conclusão das 3 fases

**Data de Criação:** 14/01/2026  
**Baseado em:** ANALISE_ROTAS_INTEGRACAO.md  
**Próxima Revisão:** Após conclusão da Fase 1
