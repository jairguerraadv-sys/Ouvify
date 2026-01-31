# AUDIT — Parte 4 (2026-01-31)

## Escopo
Multi-tenancy (isolamento por tenant), prevenção de cross-tenant access e superfícies de spoofing (subdomínio / `X-Tenant-ID`).

## Mudanças aplicadas (hardening)
- Backend
  - `apps/backend/config/settings.py`: ativado `apps.core.middleware.TenantIsolationMiddleware` logo após `TenantMiddleware`.
  - `apps/backend/apps/core/middleware.py`:
    - `TenantIsolationMiddleware`: reforço de isolamento para requisições autenticadas, exigindo `request.tenant` e validando membership (owner ou `TeamMember` ativo); superuser bypass.
    - `TenantMiddleware`: suporte controlado a `X-Tenant-ID`:
      - permitido em `localhost`/IP (dev) e em rotas allowlist (`HEADER_TENANT_URLS`).
      - adicionado `request.tenant_source` (`subdomain`/`header`/`fallback`) para auditoria/debug.
    - `TenantMiddleware.EXEMPT_URLS`: incluído `/api/v1/billing/webhook/` para não quebrar Stripe Billing webhook (rota AllowAny sem tenant no host).
    - `TenantMiddleware.EXEMPT_URLS` (AllowAny sem tenant no host):
      - `/api/team/invitations/accept/` (aceite de convite via token)
      - `/api/consent/versions/` e `/api/consent/user-consents/accept_anonymous/` (consentimento público)
      - `/api/v1/billing/plans/` (planos públicos)

## Validações executadas
- `pytest`:
  - `apps/backend/tests/test_tenant_isolation.py`
  - `apps/backend/tests/test_api_tenant_isolation.py`
  - Resultado: **5 passed**

## Achados (riscos e observações)
- **Risco mitigado:** `TenantIsolationMiddleware` existia, mas não estava ativo no `MIDDLEWARE`; isso permitia requests autenticadas sem enforcement consistente de tenant/membership.
- **Superfície de spoofing:** `X-Tenant-ID` existe e é usado em endpoints públicos/exempt (`feedbacks/consultar-protocolo`), então o uso precisa ser **restrito por allowlist** e sempre combinado com validação/filtragem por tenant (já aplicado no endpoint público).
- **Webhooks externos:** endpoints AllowAny chamados por terceiros (ex.: Stripe) normalmente **não têm subdomínio/tenant no host**; precisam estar em `EXEMPT_URLS` e fazer validação própria (signature + lookup de tenant via payload/metadata).

## Classificação de `AllowAny` (tenant-bound vs global)
- **Globais (devem funcionar sem tenant):**
  - Billing plans: `GET /api/v1/billing/plans/` (e detail) — listagem pública.
  - Consent versions: `GET /api/consent/versions/` — leitura pública.
- **Públicos por token (não dependem de tenant no host):**
  - Team invite accept: `POST /api/team/invitations/accept/` — identifica o tenant via `TeamInvitation.token`.
- **Públicos *tenant-bound* (exigem tenant):**
  - `GET /api/feedbacks/consultar-protocolo/` e correlatos — exigem tenant via subdomínio/header e filtram explicitamente por `client`.

## Pendências recomendadas (próximos passos)
- Revisar todos os endpoints `AllowAny` fora da allowlist/exempt para confirmar se:
  - (a) devem exigir tenant via subdomínio/header, ou
  - (b) devem ser adicionados a `EXEMPT_URLS` por serem globais/públicos/terceiros.
- Revisar uso de `APIKeyAuthentication` (`apps/backend/apps/core/api_keys.py`) caso seja utilizado: hoje define `request.tenant` no nível DRF (tarde para o middleware), o que pode conflitar com `TenantIsolationMiddleware`.
- (Opcional) Centralizar a lógica “set tenant from request” usada em endpoints exempt (ex.: `feedbacks/views.py::_set_tenant_from_request`) para evitar drift.
