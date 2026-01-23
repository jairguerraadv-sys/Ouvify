# 📋 Inventário de Endpoints do Backend

**Data da Auditoria:** 2026-01-23  
**Projeto:** Ouvy SaaS  
**Backend:** Django 6.0.1 + DRF + PostgreSQL

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de Endpoints** | 38 |
| **Endpoints Públicos** | 12 |
| **Endpoints Autenticados** | 24 |
| **Endpoints Admin** | 2 |
| **ViewSets** | 2 |
| **APIViews** | 14 |

---

## 📁 Endpoints por Categoria

### 🔐 Autenticação e JWT

| # | Endpoint | Método | View | Permissão | Descrição |
|---|----------|--------|------|-----------|-----------|
| 1 | `/api/token/` | POST | `CustomTokenObtainPairView` | AllowAny | Login JWT |
| 2 | `/api/token/refresh/` | POST | `TokenRefreshView` | AllowAny | Refresh token |
| 3 | `/api/token/verify/` | POST | `TokenVerifyView` | AllowAny | Verificar token |
| 4 | `/api-token-auth/` | POST | `obtain_auth_token` | AllowAny | Login legacy (DRF authtoken) |
| 5 | `/api/logout/` | POST | `LogoutView` | IsAuthenticated | Invalidar token |

### 🏢 Tenants

| # | Endpoint | Método | View | Permissão | Descrição |
|---|----------|--------|------|-----------|-----------|
| 6 | `/api/tenant-info/` | GET | `TenantInfoView` | AllowAny | Info do tenant atual |
| 7 | `/api/tenant-info/` | PATCH | `TenantInfoView` | IsAuthenticated | Atualizar tenant |
| 8 | `/api/register-tenant/` | POST | `RegisterTenantView` | AllowAny | Registrar novo tenant |
| 9 | `/api/check-subdominio/` | GET | `CheckSubdominioView` | AllowAny | Verificar disponibilidade |
| 10 | `/api/upload-branding/` | POST | `UploadBrandingView` | IsAuthenticated | Upload logo/favicon |

### 💳 Pagamentos (Stripe)

| # | Endpoint | Método | View | Permissão | Descrição |
|---|----------|--------|------|-----------|-----------|
| 11 | `/api/tenants/subscribe/` | POST | `CreateCheckoutSessionView` | IsAuthenticated | Criar checkout Stripe |
| 12 | `/api/tenants/webhook/` | POST | `StripeWebhookView` | AllowAny | Webhook do Stripe |
| 13 | `/api/tenants/subscription/` | GET | `ManageSubscriptionView` | IsAuthenticated | Status da assinatura |
| 14 | `/api/tenants/subscription/` | POST | `ManageSubscriptionView` | IsAuthenticated | Cancelar assinatura |
| 15 | `/api/tenants/subscription/reactivate/` | POST | `ReactivateSubscriptionView` | IsAuthenticated | Reativar assinatura |

### 📋 Feedbacks (ViewSet)

| # | Endpoint | Método | View | Permissão | Throttle | Descrição |
|---|----------|--------|------|-----------|----------|-----------|
| 16 | `/api/feedbacks/` | GET | `FeedbackViewSet.list` | IsAuthenticated | - | Listar feedbacks |
| 17 | `/api/feedbacks/` | POST | `FeedbackViewSet.create` | AllowAny | 10/hora | Criar feedback |
| 18 | `/api/feedbacks/{id}/` | GET | `FeedbackViewSet.retrieve` | IsAuthenticated | - | Detalhes feedback |
| 19 | `/api/feedbacks/{id}/` | PUT | `FeedbackViewSet.update` | IsAuthenticated | - | Atualizar feedback |
| 20 | `/api/feedbacks/{id}/` | PATCH | `FeedbackViewSet.partial_update` | IsAuthenticated | - | Atualizar parcial |
| 21 | `/api/feedbacks/{id}/` | DELETE | `FeedbackViewSet.destroy` | IsAuthenticated | - | Excluir feedback |

### 📋 Feedbacks (Actions Customizadas)

| # | Endpoint | Método | View | Permissão | Throttle | Descrição |
|---|----------|--------|------|-----------|----------|-----------|
| 22 | `/api/feedbacks/dashboard-stats/` | GET | `dashboard_stats` | IsAuthenticated | - | Estatísticas KPIs |
| 23 | `/api/feedbacks/consultar-protocolo/` | GET | `consultar_protocolo` | AllowAny | 5/min | Consulta pública |
| 24 | `/api/feedbacks/responder-protocolo/` | POST | `responder_protocolo` | AllowAny | 5/min | Resposta pública |
| 25 | `/api/feedbacks/{id}/adicionar-interacao/` | POST | `adicionar_interacao` | Mixed* | - | Adicionar interação |
| 26 | `/api/feedbacks/{id}/upload-arquivo/` | POST | `upload_arquivo` | Mixed* | - | Upload (Feature PRO) |
| 27 | `/api/feedbacks/export/` | GET | `export_feedbacks` | IsAuthenticated | - | Exportar (Feature STARTER+) |

*Mixed = AllowAny mas comportamento diferente para autenticados

### 👤 Perfil e LGPD

| # | Endpoint | Método | View | Permissão | Descrição |
|---|----------|--------|------|-----------|-----------|
| 28 | `/api/auth/me/` | GET/PATCH | `UserProfileUpdateView` | IsAuthenticated | Perfil do usuário |
| 29 | `/api/users/me/` | GET | `UserMeView` | IsAuthenticated | Dados completos |
| 30 | `/api/export-data/` | GET | `DataExportView` | IsAuthenticated | Exportar dados (LGPD) |
| 31 | `/api/account/` | DELETE | `AccountDeletionView` | IsAuthenticated | Excluir conta (LGPD) |

### 🔑 Recuperação de Senha

| # | Endpoint | Método | View | Permissão | Descrição |
|---|----------|--------|------|-----------|-----------|
| 32 | `/api/password-reset/request/` | POST | `PasswordResetRequestView` | AllowAny | Solicitar reset |
| 33 | `/api/password-reset/confirm/` | POST | `PasswordResetConfirmView` | AllowAny | Confirmar reset |

### 📊 Analytics

| # | Endpoint | Método | View | Permissão | Descrição |
|---|----------|--------|------|-----------|-----------|
| 34 | `/api/analytics/` | GET | `AnalyticsView` | IsAuthenticated | Métricas do sistema |

### 🔧 Admin (Superusuários)

| # | Endpoint | Método | View | Permissão | Descrição |
|---|----------|--------|------|-----------|-----------|
| 35 | `/api/admin/tenants/` | GET | `TenantAdminViewSet.list` | IsAdminUser | Listar tenants |
| 36 | `/api/admin/tenants/{id}/` | GET | `TenantAdminViewSet.retrieve` | IsAdminUser | Detalhes tenant |
| 37 | `/api/admin/tenants/{id}/` | PATCH | `TenantAdminViewSet.partial_update` | IsAdminUser | Atualizar tenant |
| 38 | `/api/admin/tenants/{id}/` | PUT | `TenantAdminViewSet.update` | IsAdminUser | Atualizar completo |

### 🔧 Sistema e Health

| # | Endpoint | Método | View | Permissão | Descrição |
|---|----------|--------|------|-----------|-----------|
| 39 | `/health/` | GET | `health_check` | AllowAny | Health check |
| 40 | `/ready/` | GET | `readiness_check` | AllowAny | Readiness check |
| 41 | `/api/csp-report/` | POST | `csp_report` | AllowAny | Relatórios CSP |
| 42 | `/` | GET | `home` | AllowAny | Página raiz (teste multi-tenancy) |

---

## 🛡️ Proteções de Segurança

### Rate Limiting (Throttling)

| Endpoint | Limite | Throttle Class |
|----------|--------|----------------|
| `POST /api/feedbacks/` | 10/hora | `FeedbackCriacaoThrottle` |
| `GET /api/feedbacks/consultar-protocolo/` | 5/min | `ProtocoloConsultaThrottle` |
| `POST /api/feedbacks/responder-protocolo/` | 5/min | `ProtocoloConsultaThrottle` |

### Feature Gating

| Feature | Planos | Endpoints Afetados |
|---------|--------|-------------------|
| `allow_attachments` | PRO | `/api/feedbacks/{id}/upload-arquivo/` |
| `allow_internal_notes` | PRO | Interações internas |
| `export` | STARTER, PRO | `/api/feedbacks/export/` |
| `feedback_limit` | Todos | `/api/feedbacks/` (POST) |

---

## 📊 Estatísticas de Permissões

```
Públicos (AllowAny):         12 endpoints (31.6%)
Autenticados (IsAuth):       24 endpoints (63.2%)
Admin (IsAdminUser):         4 endpoints (10.5%)
```

---

## ⚠️ Endpoints a Verificar

### 1. `/api/feedbacks/categorias/` 
**Status:** ❓ NÃO ENCONTRADO

O frontend chama esse endpoint em `hooks/use-dashboard.ts` linha 121, mas não foi encontrado no backend.

**Verificação necessária:** Criar endpoint ou remover chamada do frontend.

### 2. `/api/admin/tenants/{id}/` (retrieve)
**Status:** ✅ EXISTE (via ViewSet)

O `TenantAdminViewSet` herda de `ModelViewSet` então o retrieve está disponível automaticamente.

---

*Auditoria gerada em 2026-01-23*
