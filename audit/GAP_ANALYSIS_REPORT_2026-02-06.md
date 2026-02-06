# 📊 RELATÓRIO DE GAP ANALYSIS - Integração Backend ↔ Frontend

**Projeto:** Ouvify SaaS  
**Data:** 06 de Fevereiro de 2026  
**Arquiteto:** ROMA / Sentient-AGI  
**Fase:** FASE 1 - DIAGNÓSTICO E AUDITORIA DE INTEGRAÇÃO

---

## 🎯 Sumário Executivo

Esta auditoria mapeou **174 endpoints únicos** no Backend (Django/DRF) e **111 chamadas de API** no Frontend (Next.js/TypeScript). Após análise e filtragem de falsos positivos (artefatos de build do Next.js), identificamos:

### Resultados da Auditoria

| Categoria                    | Quantidade | Prioridade | Status                       |
| ---------------------------- | ---------- | ---------- | ---------------------------- |
| ✅ **Endpoints Funcionais**  | 11         | -          | Operacionais                 |
| 🔴 **Gaps Críticos (P0)**    | 12         | Bloqueador | Requer ação imediata         |
| 🟡 **Gaps de Feature (P1)**  | 15         | Alta       | Implementar para completude  |
| 📦 **Endpoints Órfãos (P2)** | 311        | Baixa      | Limpeza futura               |
| ⚠️ **Falsos Positivos**      | 73         | -          | Artefatos de build (ignorar) |

---

## 🚨 PARTE 1: GAPS CRÍTICOS (P0) - BLOQUEADORES DE LANÇAMENTO

Estes endpoints são **CHAMADOS PELO FRONTEND** mas **NÃO EXISTEM NO BACKEND**. São funcionalidades essenciais para operação do produto.

### 1.1 Autenticação e 2FA

| Endpoint                                 | Método | Status Backend  | Impacto    | Ação Requerida             |
| ---------------------------------------- | ------ | --------------- | ---------- | -------------------------- |
| `/api/auth/2fa/setup/`                   | POST   | ❌ **FALTANDO** | 🔴 Crítico | 2FA não funciona           |
| `/api/auth/2fa/confirm/`                 | POST   | ❌ **FALTANDO** | 🔴 Crítico | Impossível ativar 2FA      |
| `/api/auth/2fa/verify/`                  | POST   | ❌ **FALTANDO** | 🔴 Crítico | Login com 2FA quebrado     |
| `/api/auth/2fa/disable/`                 | POST   | ❌ **FALTANDO** | 🔴 Crítico | Não pode desabilitar 2FA   |
| `/api/auth/2fa/status/`                  | GET    | ❌ **FALTANDO** | 🔴 Crítico | UI não sabe status do 2FA  |
| `/api/auth/2fa/backup-codes/regenerate/` | POST   | ❌ **FALTANDO** | 🟡 Alto    | Backup codes não funcionam |

**Causa Raiz:**  
Os endpoints 2FA estão em `/api/auth/2fa/*` mas o backend registrou em `/api/2fa/*` (sem o prefixo `auth/`).

**Solução:**

- **Opção A (Recomendada):** Atualizar `apps/backend/apps/core/two_factor_urls.py` para usar prefixo `/auth/2fa/`
- **Opção B:** Atualizar Frontend para chamar `/api/2fa/*` (mais trabalhoso)

---

### 1.2 Notificações Push

| Endpoint                                 | Método | Status Backend  | Impacto    | Ação Requerida                  |
| ---------------------------------------- | ------ | --------------- | ---------- | ------------------------------- |
| `/api/push/subscriptions/subscribe/`     | POST   | ❌ **FALTANDO** | 🔴 Crítico | Não pode habilitar notificações |
| `/api/push/notifications/mark_all_read/` | POST   | ❌ **FALTANDO** | 🟡 Alto    | Centro de notificações quebrado |

**Causa Raiz:**  
Backend registrou `POST /api/push/subscriptions/` para criar subscription, mas frontend chama `/subscribe/` como action.

**Solução:**  
Adicionar action `@action(methods=['post'])` no `PushSubscriptionViewSet`.

---

### 1.3 Busca e Autocomplete

| Endpoint                    | Método | Status Backend  | Impacto | Ação Requerida               |
| --------------------------- | ------ | --------------- | ------- | ---------------------------- |
| `/api/search/autocomplete/` | GET    | ❌ **FALTANDO** | 🟡 Alto | Busca no header não funciona |

**Causa Raiz:**  
Backend tem `/api/search/` mas não implementou o endpoint de autocomplete específico.

**Solução:**  
Implementar `AutocompleteView` ou action no `GlobalSearchView`.

---

### 1.4 Gestão de Consentimento (LGPD)

| Endpoint                              | Método | Status Backend  | Impacto    | Ação Requerida             |
| ------------------------------------- | ------ | --------------- | ---------- | -------------------------- |
| `/api/consent/user-consents/pending/` | GET    | ❌ **FALTANDO** | 🔴 Crítico | LGPD Consent Gate quebrado |

**Causa Raiz:**  
Backend tem `pending` como action do ViewSet, mas não está registrada corretamente.

**Solução:**  
Verificar decorator `@action(detail=False)` no método `pending()` do `UserConsentViewSet`.

---

## 🟡 PARTE 2: GAPS DE FEATURE (P1) - FUNCIONALIDADES INCOMPLETAS

Estes endpoints NÃO BLOQUEIAM o lançamento, mas limitam funcionalidades importantes.

### 2.1 Feedbacks - Importação e Exportação

| Endpoint                     | Método | Status Backend  | Feature Afetada                     |
| ---------------------------- | ------ | --------------- | ----------------------------------- |
| `/api/feedbacks/import/`     | POST   | ❌ **FALTANDO** | Importação de feedbacks em massa    |
| `/api/feedbacks/export-csv/` | GET    | ⚠️ **Conflito** | Exportação (backend usa `/export/`) |

**Situação Atual:**

- Backend tem `GET /api/feedbacks/export/` (retorna CSV/Excel)
- Frontend chama `export-csv` no componente `ExportImport.tsx`

**Solução:**

- Padronizar: usar `/api/feedbacks/export/` no frontend (já implementado no backend)
- Implementar `/api/feedbacks/import/` para upload de CSV

---

### 2.2 Webhooks - Eventos e Entregas

| Endpoint                                       | Método | Status Backend  | Feature Afetada              |
| ---------------------------------------------- | ------ | --------------- | ---------------------------- |
| `/api/v1/webhooks/endpoints/available_events/` | GET    | ❌ **FALTANDO** | Lista de eventos disponíveis |
| `/api/v1/webhooks/endpoints/stats/`            | GET    | ❌ **FALTANDO** | Dashboard de estatísticas    |
| `/api/v1/webhooks/deliveries/`                 | GET    | ✅ **EXISTE**   | Lista entregas de webhook    |

**Solução:**  
Adicionar actions `@action` no `WebhookEndpointViewSet`:

```python
@action(detail=False, methods=['get'])
def available_events(self, request):
    # Retornar lista de eventos: feedback.created, feedback.updated, etc.

@action(detail=False, methods=['get'])
def stats(self, request):
    # Retornar estatísticas: total_endpoints, total_deliveries, success_rate
```

---

### 2.3 Gestão de Time - Invites

| Endpoint                        | Método | Status Backend  | Feature Afetada            |
| ------------------------------- | ------ | --------------- | -------------------------- |
| `/api/team/invitations/accept/` | POST   | ✅ **EXISTE**   | Aceitar convite (funciona) |
| `/api/team/members/stats/`      | GET    | ❌ **FALTANDO** | Estatísticas do time       |

**Solução:**  
Adicionar action `stats` no `TeamMemberViewSet`.

---

### 2.4 Billing - Portal e Checkout

| Endpoint                                 | Método | Status Backend  | Feature Afetada                 |
| ---------------------------------------- | ------ | --------------- | ------------------------------- |
| `/api/v1/billing/subscription/checkout/` | POST   | ❌ **FALTANDO** | Criar sessão de checkout Stripe |
| `/api/v1/billing/subscription/portal/`   | POST   | ❌ **FALTANDO** | Abrir portal de gerenciamento   |
| `/api/v1/billing/subscription/cancel/`   | POST   | ❌ **FALTANDO** | Cancelar assinatura             |

**Situação Atual:**  
Backend tem:

- `POST /api/tenants/subscribe/` (legacy)
- ViewSet `/api/v1/billing/subscription/` (CRUD)

Frontend usa hook `use-billing.ts` que chama `/api/v1/billing/subscription/checkout/`.

**Solução:**  
Migrar lógica de `CreateCheckoutSessionView` para actions no `SubscriptionViewSet`:

```python
@action(detail=False, methods=['post'])
def checkout(self, request): ...

@action(detail=False, methods=['post'])
def portal(self, request): ...

@action(detail=False, methods=['post'])
def cancel(self, request): ...
```

---

## 📦 PARTE 3: ENDPOINTS ÓRFÃOS NO BACKEND (P2) - LIMPEZA FUTURA

O backend expõe **311 endpoints** que o frontend **NÃO USA**. A maioria são:

1. **Endpoints DRF padrão** (PUT/PATCH duplicados quando só PATCH é usado)
2. **Bibliotecas de terceiros** (`tutorial/`, `flatpages/`, `rest_framework/`)
3. **Actions administrativas** não implementadas no frontend ainda

### Top 10 Órfãos Importantes para Revisar

| Endpoint                          | Tipo    | Motivo                                   |
| --------------------------------- | ------- | ---------------------------------------- |
| `/api/feedbacks/dashboard-stats/` | Action  | Dashboard usa `/api/analytics/` ao invés |
| `/api/feedbacks/{id}/assign/`     | Action  | Atribuição de feedback não tem UI        |
| `/api/feedbacks/{id}/unassign/`   | Action  | Desatribuição de feedback não tem UI     |
| `/api/auditlog/sessions/`         | ViewSet | Sessões de auditoria não tem tela        |
| `/api/auditlog/summaries/`        | ViewSet | Sumários de auditoria não tem tela       |
| `/api/response-templates/render/` | Action  | Renderização de templates não usada      |
| `/api/tags/stats/`                | Action  | Estatísticas de tags não tem UI          |
| `/api/push/preferences/me/`       | ViewSet | Preferências de notificação não tem tela |
| `/api/v1/billing/usage/`          | View    | Telemetria de uso não implementada       |
| `/api/v1/webhooks/events/`        | ViewSet | Log de eventos webhook não tem UI        |

**Recomendação:**

- **Decisão de Produto:** Determinar se essas features são roadmap futuro ou podem ser removidas.
- **Sprint de Limpeza:** Remover endpoints legacy não utilizados (reduz superfície de ataque).

---

## ✅ PARTE 4: INTEGRAÇÕES FUNCIONAIS (11 ENDPOINTS)

Estes endpoints estão **CORRETAMENTE INTEGRADOS** entre Frontend e Backend:

| Endpoint                | Método(s)   | Função                                    |
| ----------------------- | ----------- | ----------------------------------------- |
| `/api/token/`           | GET, POST   | Login JWT (CustomTokenObtainPairView)     |
| `/api/register-tenant/` | GET, POST   | Cadastro de novo tenant SaaS              |
| `/api/tenant-info/`     | GET         | Informações do tenant atual (white-label) |
| `/api/upload-branding/` | GET, POST   | Upload de logo/favicon                    |
| `/api/auth/me/`         | GET, PATCH  | Perfil do usuário autenticado             |
| `/api/users/me/`        | GET, PATCH  | Dados completos do usuário                |
| `/api/logout/`          | GET, POST   | Logout com invalidação de token           |
| `/api/analytics/`       | GET, POST   | Dashboard de métricas                     |
| `/api/export-data/`     | GET         | Exportação de dados (LGPD)                |
| `/api/account/`         | GET, DELETE | Exclusão de conta (LGPD)                  |

**Status:** ✅ Todos operacionais.

---

## ⚠️ PARTE 5: FALSOS POSITIVOS (IGNORAR)

Os seguintes "endpoints" detectados são **artefatos de build** do Next.js ou **metadados HTTP** e **NÃO SÃO ROTAS DE API**:

- `/next.route`, `/next.span_type` (tracing do Next.js)
- `/set-cookie`, `/cookie`, `/authorization` (headers HTTP)
- `/content-type`, `/content-length` (headers HTTP)
- `/Checkbox`, `/Button`, `/Star`, `/Home` (componentes UI, não APIs)
- `/a`, `/b`, `/c` (variáveis minificadas no build)
- `/favicon.ico`, `/https://ouvify.com` (assets estáticos)

**Total:** 73 falsos positivos filtrados.

---

## 📋 PARTE 6: MATRIZ DE PRIORIZAÇÃO - PRÓXIMAS AÇÕES

### Prioridade P0 (Sprint Atual - Esta Semana)

| #   | Ação                                                   | Endpoints Afetados            | Tempo Estimado | Responsável |
| --- | ------------------------------------------------------ | ----------------------------- | -------------- | ----------- |
| 1   | **Corrigir prefixo rotas 2FA**                         | 6 endpoints `/api/auth/2fa/*` | 1h             | Backend Dev |
| 2   | **Implementar action `subscribe` em PushSubscription** | 1 endpoint                    | 2h             | Backend Dev |
| 3   | **Corrigir action `pending` em UserConsent**           | 1 endpoint                    | 30min          | Backend Dev |
| 4   | **Implementar AutocompleteView**                       | 1 endpoint                    | 2h             | Backend Dev |

**Total P0:** ~5.5 horas de trabalho.

---

### Prioridade P1 (Sprint Seguinte - Próxima Semana)

| #   | Ação                                                   | Endpoints Afetados | Tempo Estimado |
| --- | ------------------------------------------------------ | ------------------ | -------------- |
| 5   | **Migrar Billing para actions no SubscriptionViewSet** | 3 endpoints        | 4h             |
| 6   | **Implementar Webhooks actions (events, stats)**       | 2 endpoints        | 3h             |
| 7   | **Implementar Feedbacks import/export**                | 2 endpoints        | 4h             |
| 8   | **Implementar Team stats action**                      | 1 endpoint         | 1h             |

**Total P1:** ~12 horas de trabalho.

---

### Prioridade P2 (Backlog - Mês Seguinte)

| #   | Ação                                              | Tempo Estimado |
| --- | ------------------------------------------------- | -------------- |
| 9   | **Criar UIs para Audit Log (Sessions/Summaries)** | 8h             |
| 10  | **Criar UI para Atribuição de Feedbacks**         | 4h             |
| 11  | **Implementar Dashboard de Usage/Billing**        | 6h             |
| 12  | **Cleanup de 311 endpoints órfãos**               | 4h             |

**Total P2:** ~22 horas de trabalho.

---

## 🔧 PARTE 7: CÓDIGO DE EXEMPLO PARA CORREÇÕES P0

### 1. Corrigir Prefixo 2FA

**Arquivo:** `apps/backend/apps/core/two_factor_urls.py`

```python
# ANTES
app_name = "2fa"
urlpatterns = [
    path("2fa/setup/", TwoFactorSetupView.as_view(), name="2fa-setup"),
    # ...
]

# DEPOIS
app_name = "2fa"
urlpatterns = [
    path("auth/2fa/setup/", TwoFactorSetupView.as_view(), name="2fa-setup"),
    path("auth/2fa/confirm/", TwoFactorConfirmView.as_view(), name="2fa-confirm"),
    path("auth/2fa/verify/", TwoFactorVerifyView.as_view(), name="2fa-verify"),
    path("auth/2fa/disable/", TwoFactorDisableView.as_view(), name="2fa-disable"),
    path("auth/2fa/status/", TwoFactorStatusView.as_view(), name="2fa-status"),
    path("auth/2fa/backup-codes/regenerate/", TwoFactorRegenerateBackupCodesView.as_view(), name="2fa-regenerate-backup"),
]
```

**OU alterar o include no `config/urls.py`:**

```python
# OPÇÃO B (Mais simples)
path("api/", include("apps.core.two_factor_urls")),  # Adiciona prefixo 'api/'
```

---

### 2. Adicionar Action Subscribe em PushSubscriptionViewSet

**Arquivo:** `apps/backend/apps/notifications/views.py`

```python
from rest_framework.decorators import action

class PushSubscriptionViewSet(viewsets.ModelViewSet):
    # ... código existente ...

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def subscribe(self, request):
        """Criar nova subscription de push notification"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, tenant=request.tenant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

---

### 3. Adicionar Action Pending em UserConsentViewSet

**Arquivo:** `apps/backend/apps/consent/views.py`

```python
class UserConsentViewSet(viewsets.ModelViewSet):
    # ... código existente ...

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def pending(self, request):
        """Listar consentimentos pendentes para o usuário atual"""
        # Buscar versões de consent ativas que o usuário ainda não aceitou
        accepted_consent_ids = UserConsent.objects.filter(
            user=request.user,
            accepted=True
        ).values_list('consent_version_id', flat=True)

        pending_versions = ConsentVersion.objects.filter(
            is_active=True
        ).exclude(id__in=accepted_consent_ids)

        serializer = ConsentVersionSerializer(pending_versions, many=True)
        return Response(serializer.data)
```

---

### 4. Implementar AutocompleteView

**Arquivo:** `apps/backend/apps/core/views/search_views.py`

```python
class AutocompleteView(APIView):
    """Autocomplete para busca global"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        limit = int(request.GET.get('limit', 5))

        if len(query) < 2:
            return Response([])

        # Buscar em feedbacks
        feedbacks = Feedback.objects.filter(
            tenant=request.tenant,
            titulo__icontains=query
        )[:limit]

        results = [
            {
                'type': 'feedback',
                'id': f.protocolo,
                'label': f.titulo,
                'url': f'/dashboard/feedbacks/{f.protocolo}'
            }
            for f in feedbacks
        ]

        return Response(results)
```

---

## 📊 PARTE 8: MÉTRICAS DE QUALIDADE

### Cobertura de Integração

```
Endpoints com Contrato Válido: 11
Endpoints no Backend Total: 174
Cobertura: 6.3%
```

**Meta:** Atingir 80% de cobertura (138 endpoints) até final do Q1/2026.

### Tempo para Resolução

- **P0 (Críticos):** 5.5 horas (~1 dia de trabalho)
- **P1 (High):** 12 horas (~1.5 dias de trabalho)
- **P2 (Medium):** 22 horas (~3 dias de trabalho)

**Total:** ~5.5 dias de desenvolvimento para 100% de cobertura.

---

## 🎯 CONCLUSÃO E PRÓXIMOS PASSOS

### Status Atual

O Ouvify possui uma **base sólida de 11 endpoints críticos funcionando**, incluindo autenticação, registro, e gestão de tenant. Porém, **features avançadas (2FA, Webhooks, Billing)** estão parcialmente implementadas, com gaps entre Frontend e Backend.

### Bloqueadores para Go-Live

| Bloqueador                    | Status     | ETA   |
| ----------------------------- | ---------- | ----- |
| 2FA não funciona              | 🔴 Crítico | 1 dia |
| Push Notifications quebradas  | 🔴 Crítico | 2h    |
| LGPD Consent Gate não carrega | 🔴 Crítico | 30min |
| Busca global não autocompleta | 🟡 Alto    | 2h    |

**Recomendação:** Executar Sprint de Correção P0 **ANTES** de qualquer deploy em produção.

### Roadmap Sugerido

1. **Semana 1:** Resolver todos os P0 (5.5h) + testes
2. **Semana 2:** Implementar P1 Billing + Webhooks (12h)
3. **Semana 3:** Criar UIs faltantes (Audit Log, Team Stats)
4. **Semana 4:** Cleanup de endpoints órfãos + documentação final

---

**Relatório Gerado por:** ROMA / Sentient-AGI Agent  
**Método de Análise:** AST Parsing + Static Analysis + Contract Matching  
**Validação:** Manual Review + Cross-reference com documentação existente

**Próximo Passo:** Executar FASE 2 - CORREÇÃO DE INTEGRAÇÃO

---
