# AUDIT — Parte 3 (Auth/Autorização) — 2026-01-31

Escopo: autenticação/autorização (frontend Next.js + backend Django/DRF), consistência de tokens, validação de sessão e controles de acesso básicos.

## Resumo executivo

- Situação encontrada: coexistência de **JWT (SimpleJWT)** e **DRF Token legacy** no frontend, com **chaves e esquemas inconsistentes** (`auth_token` vs `access_token` vs `accessToken`) e uma verificação de sessão que **falhava aberto** em caso de erro.
- Impacto: risco de bypass de proteção client-side, 401 intermitentes e comportamento não-determinístico por drift de storage.
- Correções aplicadas nesta rodada:
  - Padronização do frontend para **JWT** com `access_token`/`refresh_token`.
  - `ProtectedRoute` agora valida `access_token` e **falha fechado** (sem “graceful degradation” autenticado).
  - Registro (`/api/register-tenant/`) agora também emite **JWT** (`access`/`refresh`) para alinhar com o fluxo de login.

## Arquitetura atual (observada)

### Backend
- DRF default: `IsAuthenticated` por padrão.
- Auth classes habilitadas (ordem): JWT (`JWTAuthentication`), Token legacy (`TokenAuthentication`), Session (`SessionAuthentication`).
- SimpleJWT: `ROTATE_REFRESH_TOKENS=True`, `BLACKLIST_AFTER_ROTATION=True`, access lifetime 15min, refresh lifetime 7d.

Arquivos-chave:
- `apps/backend/config/settings.py`
- `apps/backend/apps/tenants/jwt_views.py`
- `apps/backend/apps/tenants/logout_views.py`
- `apps/backend/apps/tenants/views.py`

### Frontend
- `apiClient` injeta `Authorization: Bearer <access_token>` e faz refresh em 401.
- Proteção de rotas via componente client-side `ProtectedRoute`.

Arquivos-chave:
- `apps/frontend/lib/api.ts`
- `apps/frontend/contexts/AuthContext.tsx`
- `apps/frontend/components/ProtectedRoute.tsx`

## Achados

### CRÍTICO — Validação de sessão “falha aberto” no `ProtectedRoute`
- Evidência: `apps/frontend/components/ProtectedRoute.tsx` (antes)
  - Em erro de rede ou status inesperado na verificação, o código marcava `isAuthenticated=true`.
- Impacto:
  - Qualquer indisponibilidade/intermitência no endpoint de verificação podia liberar acesso indevido à UI protegida.
- Status: **corrigido** (agora falha fechado e redireciona).

### ALTO — Drift de chaves de token no frontend
- Evidência (antes):
  - `apps/frontend/contexts/AuthContext.tsx`: `access_token`/`refresh_token` no login, mas `auth_token` no register.
  - `apps/frontend/components/ProtectedRoute.tsx`: lia `auth_token`.
  - `apps/frontend/components/data/ExportImport.tsx`: lia `accessToken`.
- Impacto:
  - Sessões inconsistentes, refresh quebrado, 401 em features específicas e bugs difíceis de reproduzir.
- Status: **corrigido** para `access_token`/`refresh_token`.

### ALTO — `storage.set()` serializa tokens como JSON
- Evidência (antes):
  - `apps/frontend/lib/helpers.ts` define `storage.set()` como `JSON.stringify(value)`.
  - `apps/frontend/app/login/page.tsx` e `apps/frontend/app/cadastro/page.tsx` armazenavam token via `storage.set('auth_token', token)`.
- Impacto:
  - `localStorage.getItem()` retornava o token com aspas (string JSON), quebrando validações e headers quando lidos “crus”.
- Status: **mitigado** nas rotas de login/cadastro (agora usam `localStorage.setItem()` e JWT).

### MÉDIO — Backend ainda expõe TokenAuth legacy
- Evidência:
  - `apps/backend/config/settings.py` inclui `TokenAuthentication`.
  - `apps/backend/apps/tenants/views.py:RegisterTenantView` cria `Token` DRF.
- Impacto:
  - Superfície de ataque maior e caminhos alternativos de autenticação.
- Status: **parcialmente mitigado** (frontend migrou para JWT; backend mantém compat).

### MÉDIO — Tokens em `localStorage`
- Evidência:
  - `apps/frontend/lib/api.ts` e `apps/frontend/contexts/AuthContext.tsx`.
- Impacto:
  - Se ocorrer XSS, tokens podem ser exfiltrados.
- Status: **não alterado** nesta rodada (recomendação abaixo).

## Correções aplicadas (diffs)

### Backend
- `apps/backend/apps/tenants/views.py`
  - `RegisterTenantView` agora emite `access` e `refresh` (SimpleJWT) além do `token` legacy.

### Frontend
- `apps/frontend/contexts/AuthContext.tsx`
  - `register()` agora usa JWT (`access_token`/`refresh_token`) e não grava mais `auth_token`.
  - `login()` deixa o caller decidir o redirect (removeu `router.push('/dashboard')`).
- `apps/frontend/components/ProtectedRoute.tsx`
  - Passou a validar `access_token` em `/api/token/verify/`.
  - Em erro inesperado ou rede: **falha fechado** (redireciona para login).
- `apps/frontend/components/data/ExportImport.tsx`
  - Corrigido `accessToken` → `access_token`.
- `apps/frontend/app/login/page.tsx`
  - Migrou `/api-token-auth/` (TokenAuth) → `useAuth().login()` (JWT `/api/token/`).
- `apps/frontend/app/cadastro/page.tsx`
  - Passou a armazenar `access_token`/`refresh_token` e objetos `user`/`tenant` compatíveis com `AuthContext`.

### Testes
- `apps/frontend/tests/e2e/auth-login.spec.ts`
- `apps/frontend/tests/e2e/fixtures.ts`
  - Atualizados para validar `access_token` (JWT).

## Recomendações (próximos passos)

1. Migrar tokens para **cookies HttpOnly** (idealmente com `SameSite` adequado) e reduzir dependência de `localStorage`.
2. Definir um único “modo oficial” de auth:
   - se JWT é o padrão, descontinuar `TokenAuthentication` e endpoints legacy (com janela de migração).
3. Normalizar/verificar comportamento multi-tenant na autenticação:
   - confirmar como `tenant_id`/`X-Tenant-ID` deve ser derivado (servidor vs client) para evitar spoofing por header.
4. Garantir que endpoints `AllowAny` (ex.: planos/consent/tenant-info) estejam com rate limit e sem leakage de dados sensíveis.

## Como validar

- Frontend:
  - Login e navegação para rotas protegidas (deve redirecionar ao login se token inválido).
  - Registro → tela de sucesso → dashboard (com `access_token` e `refresh_token` presentes).
  - Export/Import deve enviar `Authorization: Bearer <access_token>`.
- Backend:
  - `POST /api/register-tenant/` deve retornar `access` e `refresh`.
  - `POST /api/logout/` deve blacklist refresh quando enviado.
