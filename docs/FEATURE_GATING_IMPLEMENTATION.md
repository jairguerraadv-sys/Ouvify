# Relatório de Implementação: Feature Gating (Limites de Plano)

**Sprint:** 4 - FASE 1 (MOTOR SAAS & GATING)  
**Data:** 2026-02-05  
**Objetivo:** Implementar sistema de limites de plano para prevenir uso excessivo no plano Free  
**Status:** ✅ **COMPLETO**

---

## 📋 Sumário Executivo

Sistema de **Feature Gating** implementado com sucesso, criando hard enforcement (backend) e soft enforcement (frontend) para limites de feedbacks por plano:

- **Free Plan:** 50 feedbacks/mês (hard limit)
- **Pro/Enterprise Plans:** Ilimitado

**Escopo Completo:**
- ✅ Backend: Lógica de bloqueio com contagem mensal
- ✅ Backend: Endpoint de status de uso `/api/v1/billing/usage/`
- ✅ Frontend: Hook SWR para monitoramento em tempo real
- ✅ Frontend: Componente de alerta visual e bloqueio de UI

---

## 🎯 Requisitos Atendidos

### TAREFA A: Backend - Lógica de Bloqueio (Hard Enforcement)

**Status:** ✅ Completo

**Arquivos Modificados:**
1. `apps/backend/apps/billing/feature_gating.py` (+85 linhas)
2. `apps/backend/apps/feedbacks/views.py` (~15 linhas modificadas)

**Implementação:**

#### 1. Função `check_feature_limit()` em `feature_gating.py`

```python
def check_feature_limit(client, feature_slug: str) -> bool:
    """
    Verifica limites de uso baseado em planos.
    
    - Free plan: 50 feedbacks/mês
    - Pro/Enterprise: ilimitado
    
    Raises:
        PermissionDenied: Se limite excedido
    """
```

**Características:**
- Conta feedbacks do **mês atual** (não total)
- Usa `timezone.now()` para determinar início do mês
- Busca limite de `Plan.limits['feedbacks_per_month']` ou fallback para slug
- Raise `PermissionDenied` do Django com mensagem clara
- Compatível com expansão futura para outras features

**Query SQL Otimizada:**
```python
month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
feedbacks_count = Feedback.objects.filter(
    client=client,
    data_criacao__gte=month_start
).count()
```

#### 2. Integração em `feedbacks/views.py`

```python
# Import
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from rest_framework.exceptions import PermissionDenied
from apps.billing.feature_gating import check_feature_limit

# No perform_create()
try:
    check_feature_limit(tenant, 'feedbacks')
except DjangoPermissionDenied as e:
    logger.warning(f"⚠️ Limite de feedbacks atingido | Tenant: {tenant.nome}")
    raise PermissionDenied(detail=str(e))
```

**Fluxo de Execução:**
1. Usuário tenta criar feedback via POST `/api/feedbacks/`
2. `perform_create()` valida tenant
3. `check_feature_limit()` conta feedbacks do mês
4. Se limite excedido: HTTP 403 com mensagem
5. Se OK: cria feedback normalmente

**Mensagem de Erro (API):**
```json
{
  "detail": "Limite de 50 feedbacks/mês atingido para o plano Free. Você já possui 50 feedbacks este mês. Faça upgrade para o plano Pro para criar feedbacks ilimitados."
}
```

---

### TAREFA B: Backend - Endpoint de Status de Uso

**Status:** ✅ Completo

**Arquivos Criados/Modificados:**
1. `apps/backend/apps/billing/serializers.py` (+22 linhas)
2. `apps/backend/apps/billing/views.py` (+120 linhas)
3. `apps/backend/apps/billing/urls.py` (+2 linhas)

**Implementação:**

#### 1. Serializer `UsageStatsSerializer`

```python
class UsageStatsSerializer(serializers.Serializer):
    plan = serializers.CharField()
    plan_name = serializers.CharField()
    feedbacks_used = serializers.IntegerField()
    feedbacks_limit = serializers.IntegerField()  # -1 = ilimitado
    usage_percent = serializers.FloatField()
    is_blocked = serializers.BooleanField()
    is_near_limit = serializers.BooleanField()  # >80%
```

#### 2. View `UsageStatsView`

**Endpoint:** `GET /api/v1/billing/usage/`  
**Autenticação:** Requerida (`IsAuthenticated`)  
**Permissões:** Qualquer usuário autenticado pode ver seu próprio uso

**Lógica:**
```python
# 1. Busca subscription do tenant
subscription = get_client_subscription(client)

# 2. Conta feedbacks do mês
month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
feedbacks_used = Feedback.objects.filter(
    client=client,
    data_criacao__gte=month_start
).count()

# 3. Determina limite
if plan.slug == 'free':
    feedbacks_limit = 50
else:
    feedbacks_limit = -1  # Ilimitado

# 4. Calcula porcentagem e flags
usage_percent = (feedbacks_used / feedbacks_limit) * 100
is_blocked = feedbacks_used >= feedbacks_limit
is_near_limit = usage_percent > 80
```

**Resposta (JSON):**
```json
{
  "plan": "free",
  "plan_name": "Free",
  "feedbacks_used": 45,
  "feedbacks_limit": 50,
  "usage_percent": 90.0,
  "is_blocked": false,
  "is_near_limit": true
}
```

#### 3. Registro de URL

```python
# apps/backend/apps/billing/urls.py
urlpatterns = [
    # ...
    path("usage/", UsageStatsView.as_view(), name="usage-stats"),
]
```

**URL Completa:** `/api/v1/billing/usage/`

---

### TAREFA C: Frontend - Consciência de Limites (Soft Enforcement)

**Status:** ✅ Completo

**Arquivos Criados:**
1. `apps/frontend/hooks/use-usage-limits.ts` (170 linhas)
2. `apps/frontend/components/billing/UpgradeAlert.tsx` (210 linhas)

**Implementação:**

#### 1. Hook `useUsageLimits()`

**Arquivo:** `hooks/use-usage-limits.ts`

**Características:**
- Usa SWR para cache e auto-refresh
- Refresh automático a cada 60 segundos
- Revalida ao focar na janela
- Deduplica requisições (5s)

**Interface:**
```typescript
interface UsageStats {
  plan: string;
  plan_name: string;
  feedbacks_used: number;
  feedbacks_limit: number;
  usage_percent: number;
  is_blocked: boolean;
  is_near_limit: boolean;
}
```

**Retorno do Hook:**
```typescript
{
  usage: UsageStats | undefined;
  isLoading: boolean;
  error: any;
  refetch: () => void;
  
  // Computed helpers
  isNearLimit: boolean;      // >80%
  isAtLimit: boolean;        // 100%
  isFreePlan: boolean;       // plan === 'free'
  canCreateFeedback: boolean; // !is_blocked
  usageText: string;         // "45 de 50 feedbacks (90%)"
  usagePercent: number;      // 0-100
  feedbacksRemaining: number; // 5 ou -1 (ilimitado)
}
```

**Uso:**
```tsx
function MyComponent() {
  const { isAtLimit, canCreateFeedback, usagePercent } = useUsageLimits();
  
  return (
    <>
      <Progress value={usagePercent} />
      <Button disabled={!canCreateFeedback}>Criar Feedback</Button>
    </>
  );
}
```

#### 2. Componente `UpgradeAlert`

**Arquivo:** `components/billing/UpgradeAlert.tsx`

**Características:**
- Exibe alerta apenas para plano Free
- Mostra apenas se `isNearLimit` ou `isAtLimit`
- Alerta amarelo (warning) quando >80%
- Alerta vermelho (destructive) quando 100%
- Barra de progresso visual
- CTA "Fazer Upgrade" para página de planos

**Componentes Exportados:**

1. **`<UpgradeAlert />`** - Alerta completo
   ```tsx
   <UpgradeAlert 
     className="mb-6"
     upgradeUrl="/dashboard/configuracoes/plano"
   />
   ```

2. **`<UsageBadge />`** - Badge compacto para header
   ```tsx
   <UsageBadge className="ml-2" />
   // Output: "45/50 feedbacks" (com ícone)
   ```

3. **`<CreateFeedbackButton />`** - Botão com bloqueio automático
   ```tsx
   <CreateFeedbackButton href="/dashboard/feedbacks/novo">
     Novo Feedback
   </CreateFeedbackButton>
   // Desabilitado se isAtLimit
   ```

**Estados Visuais:**

**Alerta Amarelo (>80%):**
```
⚠️ Próximo ao Limite de Feedbacks
Você usou 45 de 50 feedbacks (90%) este mês no plano Free.
[Barra de progresso amarela: 90%]
45 / 50 feedbacks usados
[Fazer Upgrade]
```

**Alerta Vermelho (100%):**
```
🚫 Limite de Feedbacks Atingido
Você atingiu o limite de 50 feedbacks/mês do plano Free.
Não será possível criar novos feedbacks até o próximo mês ou fazer upgrade.

[Barra de progresso vermelha: 100%]
50 / 50 feedbacks usados

⚡ Plano Pro: Feedbacks Ilimitados
Crie quantos feedbacks precisar, sem limites mensais.

[Fazer Upgrade]
```

---

## 🏗️ Arquitetura

### Fluxo Completo (End-to-End)

```
1. Usuário clica "Criar Feedback"
   ↓
2. POST /api/feedbacks/
   ↓
3. FeedbackViewSet.perform_create()
   ↓
4. check_feature_limit(tenant, 'feedbacks')
   ↓
5a. SE limite OK:
    - Cria feedback
    - Retorna 201 Created
    - Frontend exibe sucesso
   
5b. SE limite excedido:
    - Raise PermissionDenied
    - Retorna 403 Forbidden
    - Frontend exibe erro
   ↓
6. Frontend refaz GET /api/v1/billing/usage/
   ↓
7. Hook atualiza isAtLimit = true
   ↓
8. <UpgradeAlert /> exibe alerta vermelho
9. Botão "Criar" desabilitado
```

### Camadas de Proteção

**CAMADA 1: Frontend (Soft Enforcement)**
- Hook detecta limite via polling
- Alerta visual quando >80%
- Desabilita botão quando 100%
- **Objetivo:** UX proativa, prevenir tentativas

**CAMADA 2: Backend (Hard Enforcement)**
- Validação obrigatória em `perform_create()`
- Contagem precisa do banco de dados
- HTTP 403 se limite excedido
- **Objetivo:** Garantia absoluta, segurança

### Dados e Modelos

**Banco de Dados:**
```sql
-- Plan.limits (JSONField)
{
  "feedbacks_per_month": 50,  -- Free
  "team_members": 1,
  "storage_gb": 5
}

-- Query de contagem (mês atual)
SELECT COUNT(*) 
FROM feedbacks_feedback 
WHERE client_id = ? 
  AND data_criacao >= '2026-02-01 00:00:00';
```

**Subscription:**
```python
subscription.plan.slug  # 'free', 'pro', 'enterprise'
subscription.plan.get_limit('feedbacks_per_month')  # 50 or None
subscription.can_access_features  # True se active/trialing
```

---

## 📊 Testes Recomendados

### Backend Tests

**1. Test `check_feature_limit()` - Free Plan**
```python
def test_free_plan_blocks_at_50_feedbacks(self):
    # Cria 50 feedbacks
    for _ in range(50):
        Feedback.objects.create(client=tenant, ...)
    
    # 51º deve falhar
    with pytest.raises(PermissionDenied):
        check_feature_limit(tenant, 'feedbacks')
```

**2. Test Monthly Reset**
```python
def test_limit_resets_next_month(self):
    # Cria 50 feedbacks em janeiro
    # Avança para fevereiro
    # Deve permitir criar novamente
```

**3. Test Pro Plan Unlimited**
```python
def test_pro_plan_unlimited(self):
    tenant.subscription.plan.slug = 'pro'
    # Cria 1000 feedbacks
    # Deve permitir todos
```

### Frontend Tests

**1. Test Hook Loading State**
```tsx
test('useUsageLimits returns loading state', () => {
  const { result } = renderHook(() => useUsageLimits());
  expect(result.current.isLoading).toBe(true);
});
```

**2. Test UpgradeAlert Shows at 80%**
```tsx
test('UpgradeAlert shows when near limit', () => {
  mockUsageStats({ usage_percent: 85, is_near_limit: true });
  render(<UpgradeAlert />);
  expect(screen.getByText(/próximo ao limite/i)).toBeInTheDocument();
});
```

**3. Test Button Disabled at 100%**
```tsx
test('CreateFeedbackButton is disabled at limit', () => {
  mockUsageStats({ is_blocked: true });
  render(<CreateFeedbackButton href="/novo" />);
  expect(screen.getByRole('button')).toBeDisabled();
});
```

### Manual Tests

**Cenário 1: Criar 50 feedbacks no Free plan**
1. Login como tenant Free
2. Criar 45 feedbacks → OK
3. Alerta amarelo aparece
4. Criar 5 feedbacks → OK
5. Alerta vermelho aparece
6. Botão desabilitado
7. Tentativa de criar → HTTP 403

**Cenário 2: Upgrade para Pro**
1. Com limite atingido
2. Fazer upgrade para Pro
3. Alerta desaparece
4. Botão habilitado
5. Criar feedback → OK

**Cenário 3: Virada de mês**
1. Free plan com 50/50 feedbacks
2. Aguardar virada de mês (ou simular no banco)
3. Contador reseta para 0/50
4. Alerta desaparece
5. Criar feedback → OK

---

## 🔧 Configuração e Uso

### Backend

**Adicionar limite a um plano:**
```python
# Via Django Admin ou shell
plan = Plan.objects.get(slug='free')
plan.limits = {
    'feedbacks_per_month': 50,
    'team_members': 1,
    'storage_gb': 5,
}
plan.save()
```

**Verificar uso atual de um tenant:**
```python
from apps.billing.views import UsageStatsView
# GET /api/v1/billing/usage/
# Retorna JSON com estatísticas
```

### Frontend

**Adicionar alerta em qualquer página:**
```tsx
// app/dashboard/page.tsx
import { UpgradeAlert } from '@/components/billing/UpgradeAlert';

export default function DashboardPage() {
  return (
    <div>
      <UpgradeAlert />
      {/* resto do conteúdo */}
    </div>
  );
}
```

**Bloquear botão de criação:**
```tsx
import { CreateFeedbackButton } from '@/components/billing/UpgradeAlert';

// Em vez de:
<Button asChild>
  <Link href="/novo">Criar Feedback</Link>
</Button>

// Use:
<CreateFeedbackButton href="/novo">
  Criar Feedback
</CreateFeedbackButton>
```

**Verificar se pode criar:**
```tsx
import { useUsageLimits } from '@/hooks/use-usage-limits';

function MyComponent() {
  const { canCreateFeedback, isAtLimit } = useUsageLimits();
  
  if (isAtLimit) {
    return <UpgradeAlert />;
  }
  
  return <CreateFeedbackForm />;
}
```

---

## 📁 Arquivos Modificados/Criados

### Backend (5 arquivos)

| Arquivo | Linhas | Tipo | Descrição |
|---------|--------|------|-----------|
| `apps/backend/apps/billing/feature_gating.py` | +85 | Modificado | Função `check_feature_limit()` |
| `apps/backend/apps/billing/serializers.py` | +22 | Modificado | `UsageStatsSerializer` |
| `apps/backend/apps/billing/views.py` | +120 | Modificado | `UsageStatsView` |
| `apps/backend/apps/billing/urls.py` | +2 | Modificado | Registro da rota `/usage/` |
| `apps/backend/apps/feedbacks/views.py` | ~15 | Modificado | Integração em `perform_create()` |

**Total Backend:** ~244 linhas

### Frontend (2 arquivos)

| Arquivo | Linhas | Tipo | Descrição |
|---------|--------|------|-----------|
| `apps/frontend/hooks/use-usage-limits.ts` | 170 | Criado | Hook SWR com helpers |
| `apps/frontend/components/billing/UpgradeAlert.tsx` | 210 | Criado | Alerta + Badge + Botão |

**Total Frontend:** ~380 linhas

### Documentação (1 arquivo)

| Arquivo | Linhas | Tipo | Descrição |
|---------|--------|------|-----------|
| `docs/FEATURE_GATING_IMPLEMENTATION.md` | 600+ | Criado | Este relatório |

**Total Geral:** ~1,200 linhas de código + documentação

---

## 🎨 Decisões de Design

### 1. Contagem Mensal vs. Total
**Escolha:** Mensal (mês civil)  
**Motivo:** Alinhado com billing mensal do Stripe. Reset natural no dia 1.

### 2. Limite 50 para Free
**Escolha:** 50 feedbacks/mês  
**Motivo:** Balanceia uso razoável com incentivo ao upgrade. Pode ser ajustado via `Plan.limits`.

### 3. Soft + Hard Enforcement
**Escolha:** Dupla camada (frontend + backend)  
**Motivo:** 
- Frontend: UX proativa, evita frustrações
- Backend: Segurança absoluta, previne bypass

### 4. Auto-refresh 60s
**Escolha:** Hook atualiza a cada 1 minuto  
**Motivo:** Balanceia atualização em tempo real com carga no servidor. 60s é suficiente para uso típico.

### 5. SWR over React Query
**Escolha:** SWR (já usado no projeto)  
**Motivo:** Consistência com stack existente (2FA, LGPD, Audit Log usam SWR).

---

## 🚀 Próximos Passos (Futuro)

### Melhorias Potenciais

**1. Dashboard de Analytics**
- Gráfico de uso ao longo do mês
- Projeção de quando atingirá limite
- Histórico de uso mensal

**2. Notificações Proativas**
- Email quando atingir 80%
- Push notification quando atingir 90%
- Notificação no dashboard

**3. Outros Limites**
- `team_members`: limite de usuários
- `storage_gb`: limite de armazenamento
- `api_calls_per_day`: limite de API

**4. Grace Period (Pro)**
- Permitir exceder limite temporariamente
- Cobrar overage fees
- "Soft limit" vs "Hard limit"

**5. Billing Dashboard**
- Página dedicada `/dashboard/configuracoes/uso`
- Detalhamento por feature
- Histórico de upgrade

---

## ✅ Checklist de Deployment

### Pre-Deploy

- [ ] **Database:** Adicionar limites aos planos via Admin:
  ```python
  Plan.objects.filter(slug='free').update(
      limits={'feedbacks_per_month': 50}
  )
  ```

- [ ] **Migrações:** Rodar `python manage.py migrate` (não há novas migrações)

- [ ] **Tests:** Rodar testes backend e frontend

- [ ] **Code Review:** Revisar arquivos modificados

### Deploy

- [ ] **Backend:** Deploy do código Django
- [ ] **Frontend:** Build e deploy Next.js
- [ ] **Teste Smoke:** Criar 50 feedbacks em staging e verificar bloqueio

### Post-Deploy

- [ ] **Monitoramento:** Adicionar métricas:
  - contador de HTTP 403 por limite
  - uso médio por plano
  - taxa de conversão Free→Pro

- [ ] **Documentação:** Atualizar docs de usuário

- [ ] **Communication:** Notificar usuários Free sobre limites (email, changelog)

---

## 📞 Suporte e Troubleshooting

### Problema: Alerta não aparece

**Diagnóstico:**
1. Verificar se usuário está no plano Free
2. Verificar se uso > 80%
3. Verificar console do navegador (erro na API?)

**Solução:**
```typescript
// Em console do navegador
const { usage, isNearLimit } = useUsageLimits();
console.log({ usage, isNearLimit });
```

### Problema: Backend não bloqueia

**Diagnóstico:**
1. Verificar se `check_feature_limit` está sendo chamado
2. Verificar logs do Django
3. Verificar subscription do tenant

**Solução:**
```python
# Django shell
from apps.billing.feature_gating import check_feature_limit
check_feature_limit(client, 'feedbacks')
```

### Problema: Contador não reseta no mês novo

**Diagnóstico:**
1. Verificar timezone do servidor
2. Verificar query SQL do `month_start`

**Solução:**
```python
# Django shell
from django.utils import timezone
now = timezone.now()
month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
print(month_start)  # Deve ser 2026-02-01 00:00:00
```

---

## 🎉 Conclusão

Sistema de **Feature Gating** implementado com sucesso! 

**Entregas:**
- ✅ Hard enforcement: Backend bloqueia criação no limite
- ✅ Endpoint de status: API retorna uso atual
- ✅ Soft enforcement: Frontend exibe alertas e bloqueia UI
- ✅ UX profissional: Alertas visuais, barras de progresso, CTAs
- ✅ Arquitetura escalável: Suporta expansão para outras features
- ✅ Documentação completa: Este relatório + comentários inline

**Impacto Comercial:**
- Proteção de recursos: Free plan limitado a 50 feedbacks/mês
- Incentivo ao upgrade: CTAs estratégicos quando próximo do limite
- Monetização clara: Path definido Free → Pro

**Próximos Passos:**
- Adicionar outros limites (team_members, storage)
- Criar dashboard de analytics de uso
- Implementar notificações proativas

---

**Desenvolvido em:** Sprint 4 - FASE 1 (MOTOR SAAS & GATING)  
**Autor:** GitHub Copilot (Claude Sonnet 4.5)  
**Data:** 2026-02-05
