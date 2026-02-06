# 🏗️ Arquitetura do Sistema - Ouvify

## Visão Geral

O Ouvify é construído como uma aplicação SaaS multi-tenant com arquitetura monorepo, separando frontend e backend em aplicações independentes mas coordenadas.

---

## 1. Diagrama de Arquitetura

```
                                    ┌────────────────────┐
                                    │    Cloudflare      │
                                    │   (DNS + CDN)      │
                                    └─────────┬──────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              │                               │                               │
              ▼                               ▼                               ▼
    ┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
    │    Vercel       │           │    Railway      │           │   Cloudinary    │
    │   (Frontend)    │◄─────────►│   (Backend)     │◄─────────►│    (Media)      │
    │   Next.js 16    │   HTTPS   │   Django 5.1    │           │    Images       │
    └─────────────────┘           └────────┬────────┘           └─────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
          ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
          │   PostgreSQL    │    │     Redis       │    │     Stripe      │
          │   (Railway)     │    │   (Railway)     │    │   (Payments)    │
          │   Database      │    │   Cache/Celery  │    │   Webhooks      │
          └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 2. Padrões Arquiteturais

### 2.1 Multi-Tenancy

O sistema implementa **multi-tenancy por banco de dados compartilhado** com isolamento lógico via `client_id`.

```python
# Modelo Base para Multi-Tenancy
class TenantAwareModel(models.Model):
    """Modelo abstrato que automaticamente filtra por tenant."""

    client = models.ForeignKey(
        'tenants.Client',
        on_delete=models.CASCADE,
        related_name='%(class)s_set'
    )

    objects = TenantAwareManager()
    all_tenants = models.Manager()  # Para admin

    class Meta:
        abstract = True
```

**Fluxo de Identificação do Tenant:**

```
Request → Middleware → Extrair tenant_id do header X-Tenant-ID
                     → Ou do subdomínio
                     → Ou do JWT claims
                     → Definir request.tenant
```

### 2.2 Autenticação JWT

```
┌─────────┐   POST /api/token/   ┌─────────┐
│ Cliente │ ─────────────────────► Backend │
└────┬────┘   {username, pass}   └────┬────┘
     │                                │
     │   {access, refresh, user}      │
     ◄────────────────────────────────┘
     │
     │   GET /api/feedbacks/
     │   Authorization: Bearer <access>
     ├────────────────────────────────►
     │                                │
     │   401 Unauthorized             │ Token expirado
     ◄────────────────────────────────┘
     │
     │   POST /api/token/refresh/
     ├────────────────────────────────►
     │   {refresh}                    │
     │                                │
     │   {access}                     │ Novo access token
     ◄────────────────────────────────┘
```

### 2.3 Feature Gating

```python
# Controle de features por plano
class PlanFeatures:
    PLAN_LIMITS = {
        'free': {
            'max_feedbacks_per_month': 50,
            'max_users': 1,
            'allow_internal_notes': False,
            'allow_attachments': False,
            # ...
        },
        'starter': { ... },
        'pro': { ... },
    }
```

---

## 3. Componentes do Backend

### 3.1 Apps Django

```
apps/
├── core/                 # Utilitários compartilhados
│   ├── middleware.py     # TenantMiddleware, SecurityMiddleware
│   ├── models.py         # TenantAwareModel
│   ├── sanitizers.py     # Bleach sanitization
│   ├── two_factor_service.py  # 2FA TOTP
│   └── views/
│       ├── analytics.py
│       ├── csp.py
│       └── two_factor_views.py
│
├── tenants/              # Multi-tenancy e Auth
│   ├── models.py         # Client, TeamMember, TeamInvitation
│   ├── views.py          # Register, Login, Tenant Info
│   ├── jwt_views.py      # Custom JWT with tenant claims
│   ├── logout_views.py   # JWT Blacklist
│   ├── team_views.py     # Team management
│   └── subscription_management.py
│
├── feedbacks/            # Core Business Logic
│   ├── models.py         # Feedback, FeedbackInteracao, Tag, ResponseTemplate
│   ├── views.py          # FeedbackViewSet, TagViewSet
│   ├── serializers.py    # Sanitização de inputs
│   ├── automations.py    # Auto-assignment, SLA
│   ├── export_service.py # CSV/JSON export/import
│   └── signals.py        # Notifications on status change
│
├── billing/              # Stripe Integration
│   ├── models.py         # Plan, Subscription, Invoice
│   ├── stripe_service.py # Stripe API wrapper
│   └── tasks.py          # Billing notifications
│
├── webhooks/             # External Integrations
│   ├── models.py         # WebhookEndpoint, WebhookDelivery
│   └── services.py       # Webhook dispatcher
│
├── notifications/        # Push & Email
│   ├── models.py         # PushSubscription, Notification
│   └── tasks.py          # Celery tasks
│
├── consent/              # LGPD Compliance
│   └── models.py         # ConsentVersion, UserConsent
│
└── auditlog/             # Audit Trail
    └── models.py         # AuditLog
```

### 3.2 Middleware Stack

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',           # CORS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.core.middleware.TenantMiddleware',           # Multi-tenancy
    'apps.core.security_middleware.SecurityHeadersMiddleware',  # CSP
]
```

---

## 4. Componentes do Frontend

### 4.1 Estrutura Next.js (App Router)

```
app/
├── (marketing)/          # Páginas públicas (landing)
│   ├── page.tsx          # Home
│   ├── precos/           # Preços
│   ├── recursos/         # Features
│   ├── termos/           # Termos de uso
│   ├── privacidade/      # Política de privacidade
│   └── lgpd/             # Informações LGPD
│
├── login/                # Autenticação
├── cadastro/             # Registro de tenant
├── recuperar-senha/      # Reset password
├── convite/              # Aceitar convite de equipe
│
├── enviar/               # Formulário público de feedback
├── acompanhar/           # Consulta de protocolo
│
├── dashboard/            # Área autenticada
│   ├── page.tsx          # Dashboard principal
│   ├── feedbacks/        # Listagem e detalhes
│   ├── equipe/           # Gestão de equipe
│   ├── configuracoes/    # Settings
│   ├── assinatura/       # Billing
│   ├── relatorios/       # Analytics
│   ├── auditlog/         # Audit logs
│   └── perfil/           # User profile
│
└── admin/                # Super Admin
    └── tenants/          # Gestão de tenants
```

### 4.2 Componentes Principais

```
components/
├── ui/                   # Design System (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
│
├── layout/               # Layout components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── Footer.tsx
│
├── feedback/             # Feedback-specific
│   ├── FeedbackCard.tsx
│   ├── FeedbackForm.tsx
│   └── FeedbackDetails.tsx
│
├── dashboard/            # Dashboard components
│   ├── StatsCard.tsx
│   └── FeedbackChart.tsx
│
├── ProtectedRoute.tsx    # Auth guard
├── ErrorBoundary.tsx     # Error handling
└── ThemeLoader.tsx       # White label theming
```

### 4.3 State Management

```typescript
// Contexts
contexts/
└── AuthContext.tsx       # Auth state + JWT management

// Hooks
hooks/
├── useAuth.ts            # Auth utilities
├── use-dashboard.ts      # Dashboard data
├── use-billing.ts        # Billing state
├── use-tenant-theme.ts   # White label theming
└── useConfirm.ts         # Confirmation dialogs

// API Client
lib/
├── api.ts                # Axios instance + interceptors
├── auth.ts               # Auth helpers
└── types.ts              # TypeScript types
```

---

## 5. Fluxos de Dados

### 5.1 Criação de Feedback

```
┌──────────┐    POST /api/feedbacks/    ┌──────────┐
│  User    │ ───────────────────────────► Backend  │
│ (anon)   │    {tipo, titulo, desc}    │          │
└──────────┘                            └────┬─────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
            ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
            │  Sanitize   │         │   Gerar     │         │   Notify    │
            │   Input     │         │  Protocolo  │         │   Owner     │
            └─────────────┘         │OUVY-XXXX-YYY│         └─────────────┘
                                    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐
                                    │   Return    │
                                    │  Protocolo  │
                                    └─────────────┘
```

### 5.2 Checkout de Assinatura

```
┌──────────┐   POST /api/tenants/subscribe/   ┌──────────┐
│  Tenant  │ ──────────────────────────────────► Backend  │
│  Admin   │   {plan_id}                       │          │
└──────────┘                                   └────┬─────┘
                                                    │
                                                    ▼
                                           ┌───────────────┐
                                           │ Create Stripe │
                                           │   Session     │
                                           └───────┬───────┘
                                                   │
                    ┌──────────────────────────────┘
                    │
                    ▼
           ┌───────────────┐        ┌───────────────┐
           │   Redirect    │ ──────►│    Stripe     │
           │  to Checkout  │        │   Checkout    │
           └───────────────┘        └───────┬───────┘
                                            │
                                            │ webhook
                                            ▼
                                   ┌───────────────┐
                                   │ POST /webhook │
                                   │ Update Plan   │
                                   └───────────────┘
```

---

## 6. Decisões Técnicas

### 6.1 Por que Django + DRF?

- ✅ ORM robusto para multi-tenancy
- ✅ Admin panel pronto
- ✅ Ecossistema maduro (SimpleJWT, Celery)
- ✅ Migrações confiáveis
- ✅ Comunidade grande em português

### 6.2 Por que Next.js App Router?

- ✅ SSR/SSG para SEO nas landing pages
- ✅ Server Components para performance
- ✅ File-based routing
- ✅ Deploy simples na Vercel
- ✅ React 19 com melhorias de performance

### 6.3 Por que PostgreSQL?

- ✅ Suporte a JSON nativo
- ✅ Full-text search
- ✅ Índices avançados
- ✅ Escalabilidade comprovada
- ✅ Integração Railway excelente

### 6.4 Por que Redis?

- ✅ Cache de sessões JWT
- ✅ Broker do Celery
- ✅ Rate limiting
- ✅ Cache de queries pesadas

---

## 7. Segurança

### 7.1 Camadas de Proteção

```
┌─────────────────────────────────────────────────────────────┐
│                        WAF (Cloudflare)                      │
├─────────────────────────────────────────────────────────────┤
│                      TLS 1.3 (HTTPS)                        │
├─────────────────────────────────────────────────────────────┤
│                    Rate Limiting (IP/Tenant)                 │
├─────────────────────────────────────────────────────────────┤
│                    JWT Validation                            │
├─────────────────────────────────────────────────────────────┤
│                    RBAC (Roles)                              │
├─────────────────────────────────────────────────────────────┤
│                    Tenant Isolation                          │
├─────────────────────────────────────────────────────────────┤
│                    Input Sanitization                        │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Headers de Segurança

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-xxx' ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 8. Escalabilidade

### 8.1 Horizontal Scaling

- **Frontend**: Auto-scale via Vercel Edge
- **Backend**: Railway auto-scaling (2+ workers)
- **Database**: Connection pooling (pgbouncer)
- **Cache**: Redis cluster (se necessário)

### 8.2 Performance Optimizations

- Query optimization: `select_related`, `prefetch_related`
- Database indexes em campos filtrados
- Cache em endpoints de analytics
- Lazy loading de componentes pesados
- Image optimization via Cloudinary

---

## 9. Monitoramento

```
┌─────────────────────────────────────────────────────────────┐
│                         Sentry                               │
│              (Errors + Performance Monitoring)               │
├─────────────────────────────────────────────────────────────┤
│                     Health Checks                            │
│                  /health  |  /ready                          │
├─────────────────────────────────────────────────────────────┤
│                      Logging                                 │
│               (Structured JSON logs)                         │
├─────────────────────────────────────────────────────────────┤
│                   Prometheus (opcional)                      │
│                   Grafana (opcional)                         │
└─────────────────────────────────────────────────────────────┘
```

---

_Última atualização: 31/01/2026_
