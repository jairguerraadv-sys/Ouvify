# AUDIT — PARTE 2 (Rotas & Endpoints) — Ouvify

Data: 2026-01-31

## Escopo

- Frontend: rotas do Next.js (App Router) + navegação interna (links/hrefs).
- Backend: endpoints Django/DRF (URLs + routers + actions de ViewSets).
- Cruzamento: (1) rotas/links do frontend que não existem; (2) endpoints consumidos pelo frontend que não existem no backend; (3) endpoints expostos no backend sem evidência de consumo no frontend.

## Inventário — Frontend (Next.js)

### Páginas detectadas (alto nível)

- Públicas/marketing: `/`, `/precos`, `/recursos/*`, `/privacidade`, `/termos`, `/lgpd`, `/cookies`
- Autenticação/onboarding: `/login`, `/cadastro`, `/recuperar-senha`, `/recuperar-senha/confirmar`, `/convite/[token]`
- Produto público: `/enviar`, `/acompanhar`, `/demo`
- Área logada: `/dashboard/*` (feedbacks, equipe, configurações, assinatura, relatórios, analytics, auditlog, perfil, ajuda)
- Admin: `/admin`, `/admin/tenants/[id]`

### Links/rotas referenciadas que não possuem página no `app/`

- `/notifications` (referência em `apps/frontend/components/notifications/NotificationCenter.tsx`)
- `/contato` (referências em páginas de marketing de recursos)
- `/docs/*` (ex.: `/docs/webhooks`, `/docs/api`, `/docs/sdk/...`, `/docs/videos/...`)
- `/lgpd/solicitacao` (referência em `apps/frontend/app/(marketing)/lgpd/page.tsx`)
- `/settings/privacy` (referência em `apps/frontend/app/(marketing)/lgpd/page.tsx`)

Observação: `/privacidade`, `/termos`, `/lgpd`, `/cookies` existem como rotas (grupo `(marketing)` não afeta a URL final).

## Inventário — Backend (Django/DRF)

Fonte principal: `apps/backend/config/urls.py` + `apps/backend/apps/*/urls.py`.

### Core (saúde, CSP, busca, 2FA, LGPD)

- Health/readiness: `GET /health/`, `GET /ready/`
- CSP reports: `POST /api/csp-report/`
- Busca global (Elastic):
  - `GET /api/search/`
  - `GET /api/search/autocomplete/`
  - `GET /api/search/protocol/<protocolo>/`
- 2FA:
  - `POST /api/auth/2fa/setup/`
  - `POST /api/auth/2fa/confirm/`
  - `POST /api/auth/2fa/verify/`
  - `POST /api/auth/2fa/disable/`
  - `GET  /api/auth/2fa/status/`
  - `POST /api/auth/2fa/backup-codes/regenerate/`
- LGPD/GDPR:
  - `DELETE /api/account/`
  - `GET    /api/export-data/`

### Tenants (tenant-info, branding, signup, billing/stripe “tenants/\*”)

- `GET/PATCH /api/tenant-info/`
- `POST      /api/upload-branding/`
- `POST      /api/register-tenant/`
- `GET       /api/check-subdominio/`
- Stripe (fluxo tenants):
  - `POST /api/tenants/subscribe/`
  - `POST /api/tenants/webhook/`
  - `POST /api/tenants/subscription/`
  - `POST /api/tenants/subscription/reactivate/`

### Auth

- JWT:
  - `POST /api/token/`
  - `POST /api/token/refresh/`
  - `POST /api/token/verify/`
- Logout:
  - `POST /api/logout/`
  - `POST /api/logout/all/`
- Perfil:
  - `PATCH /api/auth/me/`
  - `GET   /api/users/me/`
- Password reset:
  - `POST /api/password-reset/request/`
  - `POST /api/password-reset/confirm/`

### Feedbacks / Tags / Templates (DRF router em `/api/`)

- Feedbacks:
  - CRUD: `/api/feedbacks/`, `/api/feedbacks/<id>/`
  - Público:
    - `GET  /api/feedbacks/consultar-protocolo/?protocolo=OUVY-...`
    - `POST /api/feedbacks/responder-protocolo/`
  - Actions autenticadas (principais):
    - `GET  /api/feedbacks/dashboard-stats/`
    - `POST /api/feedbacks/<id>/adicionar-interacao/`
    - `POST /api/feedbacks/<id>/upload-arquivo/`
    - `GET  /api/feedbacks/export/` (feature gate: `export`)
    - `GET  /api/feedbacks/export-advanced/` (feature gate: `export`)
    - `POST /api/feedbacks/import/` (feature gate: `export`)
- Tags:
  - CRUD: `/api/tags/`, `/api/tags/<id>/`
  - `GET /api/tags/stats/`
- Response templates:
  - CRUD: `/api/response-templates/`, `/api/response-templates/<id>/`
  - `POST /api/response-templates/render/`
  - `GET  /api/response-templates/by-category/`
  - `GET  /api/response-templates/stats/`

### Team (DRF router em `/api/`)

- Members:
  - `GET    /api/team/members/`
  - `GET    /api/team/members/<id>/`
  - `PATCH  /api/team/members/<id>/`
  - `DELETE /api/team/members/<id>/`
  - `POST   /api/team/members/<id>/suspend/`
  - `POST   /api/team/members/<id>/activate/`
  - `GET    /api/team/members/stats/`
- Invitations:
  - `GET/POST /api/team/invitations/`
  - `DELETE   /api/team/invitations/<id>/`
  - `POST     /api/team/invitations/accept/` (público)
  - `POST     /api/team/invitations/<id>/resend/`

### Auditlog

Base: `/api/auditlog/`

- Logs:
  - `GET /api/auditlog/logs/`
  - `GET /api/auditlog/logs/<id>/`
  - `GET /api/auditlog/logs/analytics/`
  - `GET /api/auditlog/logs/actions/`
  - `GET /api/auditlog/logs/export/`
  - `GET /api/auditlog/logs/recent_security/`
- Summaries:
  - `GET /api/auditlog/summaries/`
  - `GET /api/auditlog/summaries/by_date/`
- Sessions:
  - `GET /api/auditlog/sessions/`
  - `GET /api/auditlog/sessions/active/`
  - `GET /api/auditlog/sessions/stats/`

### Push notifications

Base: `/api/push/`

- Subscriptions:
  - `GET    /api/push/subscriptions/`
  - `POST   /api/push/subscriptions/subscribe/`
  - `POST   /api/push/subscriptions/unsubscribe/`
  - `GET    /api/push/subscriptions/status/`
  - `DELETE /api/push/subscriptions/<id>/`
- Notifications:
  - `GET  /api/push/notifications/`
  - `GET  /api/push/notifications/<id>/`
  - `GET  /api/push/notifications/unread_count/`
  - `POST /api/push/notifications/<id>/mark_read/`
  - `POST /api/push/notifications/<id>/mark_clicked/`
  - `POST /api/push/notifications/mark_all_read/`
  - `POST /api/push/notifications/send/` (admin)

### Billing v1 (Stripe)

Base: `/api/v1/billing/`

- Plans:
  - `GET /api/v1/billing/plans/`
- Subscription:
  - `GET  /api/v1/billing/subscription/status/`
  - `POST /api/v1/billing/subscription/checkout/`
  - `POST /api/v1/billing/subscription/portal/`
  - `POST /api/v1/billing/subscription/cancel/`
- Invoices:
  - `GET /api/v1/billing/invoices/`
- Webhook:
  - `POST /api/v1/billing/webhook/`

### Webhooks v1

Base: `/api/v1/webhooks/`

- Endpoints: CRUD + actions
  - `POST /api/v1/webhooks/endpoints/<id>/regenerate_secret/`
  - `POST /api/v1/webhooks/endpoints/<id>/test/`
  - `GET  /api/v1/webhooks/endpoints/<id>/deliveries/`
  - `GET  /api/v1/webhooks/endpoints/stats/`
  - `GET  /api/v1/webhooks/endpoints/available_events/`
- Events: `GET /api/v1/webhooks/events/`
- Deliveries: `GET /api/v1/webhooks/deliveries/` + `POST /api/v1/webhooks/deliveries/<id>/retry/`

### Admin tenants (superuser)

Base: `/api/admin/tenants/`

- `GET/PATCH /api/admin/tenants/`
- `GET       /api/admin/tenants/metrics/`
- `POST      /api/admin/tenants/<id>/impersonate/`

## Cruzamento (Frontend ↔ Backend)

### Inconsistências confirmadas

1. **CSP report-uri sem barra final**

- Frontend (antes): `report-uri /api/csp-report`.
- Backend: `POST /api/csp-report/`.
- Impacto provável: reports podem falhar se houver redirect/APPEND_SLASH.
- Correção aplicada: `apps/frontend/middleware.ts` agora usa `report-uri /api/csp-report/`.

2. **Query param divergente no helper de “consultar protocolo”**

- Backend espera `?protocolo=...`.
- Frontend tinha helper usando `?codigo=...`.
- Correção aplicada: `apps/frontend/hooks/use-dashboard.ts` agora usa `?protocolo=...`.

3. **Link quebrado para “Política de Privacidade” no perfil**

- Frontend referenciava `/politica-privacidade` (não existe).
- Correção aplicada: `apps/frontend/app/dashboard/perfil/page.tsx` agora aponta para `/privacidade`.

### Gaps (precisam decisão de produto/UX)

- Links para páginas ausentes (`/docs/*`, `/contato`, `/notifications`, `/lgpd/solicitacao`, `/settings/privacy`): ou criar rotas, ou redirecionar para rotas existentes, ou apontar para URL externa.

### Endpoint consumido no frontend sem evidência no backend

- `GET /api/v1/analytics/dashboard/?period=...` (referência em `apps/frontend/hooks/use-dashboard.ts`).
  - Não foi encontrado handler correspondente no backend (`config/urls.py` só expõe `GET /api/analytics/`).

## Recomendações (prioridade)

1. Definir estratégia para `/docs/*` e `/contato` (rotas internas vs links externos).
2. Alinhar analytics: ou criar `/api/v1/analytics/dashboard/` no backend, ou ajustar frontend para consumir `/api/analytics/`.
3. Se `/notifications` for um “Inbox” de notificações, decidir rota/página (ex.: `/dashboard/notificacoes`) ou remover o link.

---

### Notas de rastreabilidade

- Backend routes: `apps/backend/config/urls.py`, `apps/backend/apps/{feedbacks,tenants,auditlog,notifications,consent,billing,webhooks,core}/**`.
- Frontend routes: `apps/frontend/app/**/page.tsx`, `apps/frontend/middleware.ts`, `apps/frontend/hooks/**`, `apps/frontend/lib/**`.
