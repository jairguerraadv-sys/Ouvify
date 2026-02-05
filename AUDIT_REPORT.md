# Auditoria do Projeto Ouvify (White Label SaaS)

Data: 2026-02-03

Este relatório está sendo construído em partes, seguindo o roteiro PARTE 1 → PARTE 10.

---

## PARTE 1 — Mapeamento, compatibilidade e higiene do repositório

### 1.1 — Estrutura e configurações (corrigido)

**P1.1-A — Inconsistência de versões/alvos de Python (resolvido)**

- Evidências (pós-correção):
  - `pyrightconfig.json` define `pythonVersion: "3.12"` e `pythonPlatform: "Linux"`.
  - Backend declara Python 3.12.3 em `runtime.txt`.
  - Dockerfile do backend usa `python:3.12-slim`.
  - Blueprint Render define `PYTHON_VERSION: 3.12.3`.
- Impacto:
  - Divergência entre local/CI/deploy aumenta chance de bugs sutis e falhas de build (ex.: diferenças de stdlib, wheels, typing).
  - Pyright/Pylance podem reportar falsos positivos/negativos.
- Ação recomendada:
  - Escolher uma versão alvo única (ex.: 3.12.x) e alinhar: `apps/backend/runtime.txt`, `apps/backend/Dockerfile`, CI e `pyrightconfig.json`.

Referências:

- [pyrightconfig.json](pyrightconfig.json#L10-L12)
- [apps/backend/runtime.txt](apps/backend/runtime.txt#L1)
- [apps/backend/Dockerfile](apps/backend/Dockerfile#L7) e [apps/backend/Dockerfile](apps/backend/Dockerfile#L32)
- [render.yaml](render.yaml#L23-L25)

**P1.1-B — Duplicação de blueprint Render (resolvido)**

- Evidências (pós-correção):
  - Mantido apenas o blueprint da raiz (`render.yaml`) como fonte de verdade.
- Impacto:
  - Altera um arquivo e esquece o outro → deploy inconsistentes.
- Ação recomendada:
  - Manter apenas um (preferencialmente o da raiz, já que aponta `rootDir: apps/backend`) e remover o duplicado, ou documentar qual é a fonte de verdade.

Referências:

- [render.yaml](render.yaml#L18-L25)

**P1.1-C — `next.config.js` dentro do backend (resolvido)**

- Evidências (pós-correção):
  - Arquivo removido do backend para evitar “config zumbi”.
- Impacto:
  - Risco de confusão operacional e “config zumbi” (sem efeito real), além de sinal de código/config legado.
- Ação recomendada:
  - Confirmar se é usado por alguma pipeline; se não for, remover.

Referências:

- (arquivo removido)

**P1.1-D — Token sensível presente em arquivo local do frontend (risco de vazamento acidental)**

- Evidências:
  - `apps/frontend/.env.local` contém a variável `VERCEL_OIDC_TOKEN`.
- Impacto:
  - Mesmo ignorado por git, é um risco de vazamento por compartilhamento do workspace, screenshots, logs de CI mal configurados, etc.
- Ação recomendada:
  - Rotacionar/revogar o token se já foi usado fora de ambiente estritamente local.
  - Garantir que não exista em nenhum commit/histórico e considerar um check de pre-commit/CI para bloquear secrets em `.env*`.

Referências:

- [apps/frontend/.env.local](apps/frontend/.env.local#L2)

---

### 1.2 — Duplicações, redundâncias e “lixo” (achados)

**P1.2-A — Imports/variáveis não usados no backend (resolvido)**

- Evidência (execução): `ruff check apps/backend --select F401,F841` agora retorna **0** problemas.
- Impacto:
  - Ruído em reviews e risco de código morto (principalmente em views/serviços), além de aumentar superfície de manutenção.
- Ação recomendada:
  - Mantido como prática: rodar `ruff check apps/backend --select F401,F841` no CI/pre-commit.

Exemplos com impacto em código de app (não só testes):

- `apps/backend/apps/auditlog/views.py`: imports não usados (`status`, `IsAdminUser`, `AuditLogCreateSerializer`) apesar de `ReadOnlyModelViewSet`.
- `apps/backend/apps/core/tasks.py`: `BlacklistedToken` importado mas não usado.
- `apps/backend/apps/core/views/__init__.py`: re-exports disparando F401.

Referências:

- [apps/backend/apps/auditlog/views.py](apps/backend/apps/auditlog/views.py#L9-L23)
- [apps/backend/apps/core/tasks.py](apps/backend/apps/core/tasks.py#L254-L277)
- [apps/backend/apps/core/views/**init**.py](apps/backend/apps/core/views/__init__.py#L1-L13)

---

### 1.3 — Obsolescência, TODO/FIXME e artefatos (corrigido)

**P1.3-A — TODO visível no frontend (resolvido)**

- Evidência (pós-correção):
  - ErrorBoundary captura exceções via `@sentry/nextjs` (desabilitado em `NODE_ENV=test`).
- Impacto:
  - Sem integração, exceções podem não ser capturadas em produção.
- Ação recomendada:
  - Integrar com Sentry (já há `@sentry/nextjs` nas deps) ou serviço equivalente.

Referência:

- [apps/frontend/components/ErrorBoundary.tsx](apps/frontend/components/ErrorBoundary.tsx#L34-L56)

**P1.3-B — Busca por “backup/old/deprecated” em código de app**

- Resultado:
  - Não foram encontrados artefatos óbvios de “old/backup/deprecated” no código de app (após excluir `.venv`, `node_modules`, builds e caches).

---

## Vulnerabilidades de dependências (checagens rápidas)

### JavaScript/Node

- Evidência: `npm audit --audit-level=high` retorna **0 vulnerabilidades**.
- Principais cadeias afetadas (excertos do audit):
  - `@isaacs/brace-expansion` (critical)
  - `path-to-regexp` (high)
  - `tar` (high)
  - `undici` (moderate)
- Ação aplicada:
  - Removido `vercel` das `devDependencies` do frontend (não era usado via scripts npm), eliminando a cadeia vulnerável.

Referências:

- [apps/frontend/package.json](apps/frontend/package.json#L59-L79)

### Python

- Evidência: `pip-audit -r apps/backend/requirements/prod.txt` retornou **"No known vulnerabilities found"**.

---

## Próximos passos (PARTE 2)

- Continuar para PARTE 2: autenticação, autorização, multi-tenancy e isolamento por tenant.

---

## PARTE 2 — Autenticação, autorização e isolamento multi-tenant

### 2.1 — Isolamento por tenant com JWT (corrigido)

**P2.1-A — Gap: middleware não autenticava JWT antes de aplicar isolamento**

- Evidência (código): `TenantIsolationMiddleware` agora autentica JWT via `JWTAuthentication().authenticate(request)` quando `request.user` ainda não está autenticado.
- Impacto (antes): o isolamento de tenant no nível de middleware podia não ser aplicado para requisições JWT (porque `AuthenticationMiddleware` do Django não autentica JWT), abrindo espaço para acesso cruzado caso uma view esquecesse de aplicar filtros/permissions tenant-aware corretamente.
- Correção aplicada:
  - Autenticação JWT antecipada no middleware para viabilizar o bloqueio por membership/owner.
  - Resposta padronizada `403` com `error: tenant_mismatch` em caso de tentativa de acesso ao tenant errado.

Referências:

- [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L16-L67)

**P2.1-B — Endpoints públicos: permitir executar sem tenant (sem vazar informação)**

- Evidência (código): a consulta pública de protocolo (`/api/feedbacks/consultar-protocolo/`) deixa de depender de "URL exempt" para funcionar e, quando não há tenant identificado, retorna `404` genérico.
- Motivação: evitar `403 tenant_required` no middleware (que vira comportamento observável) e manter a resposta alinhada ao princípio de não-vazamento (não revelar existência/ausência de tenant ou protocolo).

Referências:

- [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L74-L80)
- [apps/backend/apps/feedbacks/views.py](apps/backend/apps/feedbacks/views.py#L893-L960)

### 2.2 — Rotas globais (superadmin) sem tenant (corrigido)

**P2.2-A — Gap: endpoints administrativos globais falhavam sem tenant**

- Evidência (código): `/api/admin/` foi incluído na allowlist de rotas que não exigem identificação de tenant.
- Impacto (antes): rotas administrativas globais (ex.: listar tenants) podiam retornar `400 tenant_required` quando chamadas sem subdomínio/header, inclusive em testes/automação.

Referência:

- [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L105-L123)

**P2.2-B — DELETE admin de tenant: padronizado como “soft delete”**

- Evidência (código): `TenantAdminViewSet` passa a aceitar `DELETE` e implementa desativação (`ativo=False`) com retorno `204`.
- Motivação: evitar deleção física/cascata e ainda suportar operação administrativa.

Referência:

- [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py#L409-L446)

### 2.3 — Segurança no aceite de convite (corrigido)

**P2.3-A — Risco: takeover por convite em usuário existente**

- Evidência (código): quando o usuário **já existe**, o serializer exige `check_password()` com a senha informada; caso contrário retorna erro de validação.
- Impacto (antes): um token de convite vazado poderia facilitar aceite + emissão de tokens para conta existente (dependendo do fluxo do endpoint), sem prova de posse da credencial.

Referência:

- [apps/backend/apps/tenants/serializers.py](apps/backend/apps/tenants/serializers.py#L379-L404)

### 2.4 — Autorização de branding (corrigido)

**P2.4-A — Risco: atualização/upload de branding permissivo demais**

- Evidência (código): `PATCH /api/tenant-info/` e `POST /api/upload-branding/` foram restringidos para:
  - `is_superuser` **ou**
  - `tenant.owner` **ou**
  - `TeamMember` ativo com role `OWNER`/`ADMIN`.
- Impacto (antes): checagens fracas/inadequadas podem permitir que usuários autenticados sem papel administrativo alterem configurações white-label.

Referências:

- [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py#L82-L145)
- [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py#L162-L201)

### 2.5 — Confiabilidade dos testes (ajuste de ambiente)

**P2.5-A — Falha: `DEFAULT_THROTTLE_RATES` sem scopes customizados em `settings_test`**

- Evidência: `settings_test.py` agora inclui `tenant`, `tenant_burst` e `tenant_info` para evitar `ImproperlyConfigured` do DRF (o throttle é instanciado antes de `allow_request()`).

Referência:

- [apps/backend/config/settings_test.py](apps/backend/config/settings_test.py#L25-L36)

### Validação (PARTE 2)

- ✅ Testes tenants: `73 passed`.
- ✅ Testes backend (apps): `239 passed, 2 skipped`.

### 2.6 — Inventário de endpoints públicos (`AllowAny`) (evidências)

Objetivo: listar os pontos de entrada sem autenticação, mapear se exigem tenant e qual fonte de identificação de tenant é usada (subdomínio e/ou `X-Tenant-ID`).

**Tenants / White-label / Signup**

- `GET /api/tenant-info/` — público (retorna info pública do tenant identificado)
  - Controle: rate limit (100/h) e cache
  - Tenant: vem do `TenantMiddleware` (subdomínio ou `X-Tenant-ID` em allowlist)
  - Evidências: [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py#L37-L80), [apps/backend/config/urls.py](apps/backend/config/urls.py#L101-L106)

- `POST /api/register-tenant/` — público (cria usuário owner + tenant e retorna JWT)
  - Risco: abuso de signup / criação massiva de tenants; recomendado throttle + verificação de email
  - Evidências: [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py#L260-L336), [apps/backend/config/urls.py](apps/backend/config/urls.py#L107-L113)

- `GET /api/check-subdominio/` — público (enumeração/automação possível)
  - Risco: scraping de disponibilidade; recomendado throttle
  - Evidências: [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py#L348-L406), [apps/backend/config/urls.py](apps/backend/config/urls.py#L110-L113)

**Equipe / Convites**

- `POST /api/team/invitations/accept/` — público (aceita convite e retorna JWT)
  - Risco: token de convite é credencial; requer controles fortes e expiração
  - Mitigação já aplicada: quando usuário já existe, exige senha correta
  - Evidências: [apps/backend/apps/tenants/team_views.py](apps/backend/apps/tenants/team_views.py#L327-L369), [apps/backend/config/urls.py](apps/backend/config/urls.py#L85-L91)

**Feedbacks (públicos por design, mas tenant-aware)**

- `POST /api/feedbacks/` — público (cria feedback e retorna protocolo)
  - Tenant: obrigatório (resolvido por middleware/subdomínio; header em allowlist)
  - Evidência do AllowAny por action: [apps/backend/apps/feedbacks/views.py](apps/backend/apps/feedbacks/views.py#L65-L69), rota: [apps/backend/config/urls.py](apps/backend/config/urls.py#L47-L55)

- `GET /api/feedbacks/consultar-protocolo/?protocolo=...` — público + throttled (5/min)
  - Tenant: tenta resolver via `X-Tenant-ID` e/ou subdomínio (fallback local no viewset) e retorna 404 genérico sem tenant
  - Evidências: [apps/backend/apps/feedbacks/views.py](apps/backend/apps/feedbacks/views.py#L893-L1005), rota: [apps/backend/config/urls.py](apps/backend/config/urls.py#L50-L55)

- `POST /api/feedbacks/responder-protocolo/` — público (resposta pública por protocolo)
  - Tenant: obrigatório e filtro por `tenant + protocolo`
  - Evidências: [apps/backend/apps/feedbacks/views.py](apps/backend/apps/feedbacks/views.py#L1062-L1116)

- `POST /api/feedbacks/{id}/adicionar-interacao/` — público (fluxo híbrido)
  - Empresa autenticada: usa `pk` e valida por `client=tenant`
  - Denunciante anônimo: usa `protocolo` e filtra por `tenant + protocolo`
  - Evidências: [apps/backend/apps/feedbacks/views.py](apps/backend/apps/feedbacks/views.py#L173-L210), rota comentada: [apps/backend/config/urls.py](apps/backend/config/urls.py#L47-L55)

- `POST /api/feedbacks/{id}/upload-arquivo/` — público (multipart)
  - Tenant: obrigatório; aplica feature gating do tenant e, no fluxo anônimo, valida `tenant + protocolo`
  - Evidências: [apps/backend/apps/feedbacks/views.py](apps/backend/apps/feedbacks/views.py#L283-L401)

**Senha (Password Reset)**

- `POST /api/password-reset/request/` — público + throttled (3/h por IP)
  - Controle: resposta uniforme para evitar enumeração de email
  - Evidências: [apps/backend/apps/core/password_reset.py](apps/backend/apps/core/password_reset.py#L22-L83), rota: [apps/backend/config/urls.py](apps/backend/config/urls.py#L172-L175)

- `POST /api/password-reset/confirm/` — público
  - Controle: valida senha via validadores do Django
  - Evidências: [apps/backend/apps/core/password_reset.py](apps/backend/apps/core/password_reset.py#L86-L140), rota: [apps/backend/config/urls.py](apps/backend/config/urls.py#L172-L175)

**Consentimentos (LGPD)**

- `GET /api/consent/versions/` — público
  - Evidências: [apps/backend/apps/consent/views.py](apps/backend/apps/consent/views.py#L13-L25), allowlist middleware: [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L110-L127)

- `POST /api/consent/user-consents/accept_anonymous/` — público
  - Evidências: [apps/backend/apps/consent/views.py](apps/backend/apps/consent/views.py#L33-L37), [apps/backend/apps/consent/views.py](apps/backend/apps/consent/views.py#L89-L131)

**Billing / Stripe**

- `GET /api/v1/billing/plans/` — público (planos)
  - Evidências: [apps/backend/apps/billing/views.py](apps/backend/apps/billing/views.py#L42-L56), allowlist middleware: [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L110-L127)

- `POST /api/v1/billing/webhook/` — público (webhook)
  - Controle: valida `Stripe-Signature`
  - Evidências: [apps/backend/apps/billing/views.py](apps/backend/apps/billing/views.py#L229-L263), allowlist middleware: [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L110-L127)

- `POST /api/tenants/webhook/` — público (webhook)
  - Controle: valida `X-Stripe-Signature`
  - Evidências: [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py#L738-L791), rota: [apps/backend/config/urls.py](apps/backend/config/urls.py#L113-L116)

### 2.7 — Trust boundary: subdomínio/`Host` vs `X-Tenant-ID` (análise)

**Fonte primária (recomendada): subdomínio no `Host`**

- O `TenantMiddleware` identifica tenant por subdomínio e injeta em `request.tenant` + thread-local.
- Evidências: `EXEMPT_URLS` e fluxo de resolução: [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L110-L170)

**Fonte alternativa (mais frágil): header `X-Tenant-ID`**

- O header só é aceito pelo `TenantMiddleware` para URLs explicitamente allowlisted (`/api/feedbacks/` e `/api/tenant-info/`).
- Evidências (allowlist): [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L129-L133)
- Evidências (aplicação do header): [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L259-L273)

Risco principal: `X-Tenant-ID` é um identificador controlável pelo cliente. Se o backend ficar exposto diretamente à internet (sem um gateway reverso que remova/reescreva headers), um atacante pode forjar `X-Tenant-ID` e tentar “trocar” o tenant da requisição.

Mitigação parcial já existente:

- As rotas autenticadas estão cobertas por checagens de membership e por isolamento tenant-aware.
- Em rotas públicas tenant-aware (ex.: feedbacks), o header pode facilitar enumeração/scraping do tenant se não houver controles de gateway e throttling adequados.

**Fallback de tenant (dev/test)**

- O middleware tem fallback configurável; em teste (`TESTING=true`) ele é habilitado para evitar falhas do Django test client.
- Risco: se `TENANT_FALLBACK_ENABLED=true` for habilitado por engano em produção, isso pode mascarar ausência de tenant no `Host` e reduzir a robustez do boundary.
- Evidências: [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L135-L146)

### 2.8 — Recomendações priorizadas (P0/P1/P2)

**P0 (imediato) — Blindar o boundary de tenant**

- Desabilitar `X-Tenant-ID` por padrão em produção, exceto quando estritamente necessário e protegido por gateway.
- Se `X-Tenant-ID` for necessário (frontend em domínio único): exigir header assinado (ex.: `X-Tenant-Signature`) ou JWT de “tenant context”, e rejeitar `X-Tenant-ID` sem assinatura.
- Garantir que o gateway/load balancer remova headers de “tenant context” vindos do cliente e apenas injete-os de forma confiável.

Status (corrigido):

- `X-Tenant-ID` agora só é aceito quando `TENANT_HEADER_ENABLED=true` (padrão: **True em DEBUG/test**, **False em produção**) **e** apenas em rotas allowlisted.
- `TENANT_FALLBACK_ENABLED` agora é **opt-in explícito** (fora `TESTING=true`; padrão **False em produção**).

Evidências:

- [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L135-L157)
- [apps/backend/apps/core/middleware.py](apps/backend/apps/core/middleware.py#L187-L205)
- [apps/backend/apps/feedbacks/views.py](apps/backend/apps/feedbacks/views.py#L855-L884)

**P1 (alto) — Rate limiting e antifraude em endpoints públicos sensíveis**

- Adicionar throttling em `POST /api/register-tenant/` e `GET /api/check-subdominio/` (hoje são `AllowAny` sem rate limit explícito).
- Revisar logs e métricas de abuso (IP, user-agent, burst) nesses endpoints.

Status (corrigido):

- Throttling adicionado em signup (`tenant_signup`), check-subdomínio (`tenant_subdomain_check`) e aceite de convite (`invitation_accept`).

Evidências:

- [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py#L28-L51)
- [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py#L260-L280)
- [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py#L348-L360)
- [apps/backend/apps/tenants/team_views.py](apps/backend/apps/tenants/team_views.py#L17-L23)
- [apps/backend/apps/tenants/team_views.py](apps/backend/apps/tenants/team_views.py#L330-L341)
- [apps/backend/config/settings.py](apps/backend/config/settings.py#L533-L545)

**P2 (médio) — Padronização de documentação/contratos**

- Alinhar comentários/contratos de rota com a realidade: `adicionar_interacao` está `AllowAny` (fluxo híbrido) mas o comentário em `urls.py` sugere autenticado.
- Documentar claramente a política oficial: “multi-tenant por subdomínio; `X-Tenant-ID` só atrás de gateway confiável”.

---

## PARTE 1 — STATUS FINAL: ✅ 100% CONCLUÍDA

### Correções aplicadas e validadas

**✅ P1.1-A — Versões Python alinhadas (3.12.3)**

- [apps/backend/runtime.txt](apps/backend/runtime.txt) → `python-3.12.3`
- [apps/backend/Dockerfile](apps/backend/Dockerfile) → `python:3.12-slim` (ambos stages)
- [apps/backend/nixpacks.toml](apps/backend/nixpacks.toml) → `python312`
- `pyrightconfig.json` já estava correto (`pythonVersion: 3.12`, `pythonPlatform: Linux`)
- **Validação**: Testes executados sem erros de versão.

**✅ P1.1-B — Duplicações removidas**

- [apps/backend/render.yaml](apps/backend/render.yaml) → removido (redundante com raiz)
- [apps/backend/next.config.js](apps/backend/next.config.js) → removido (config zumbi fora do frontend)
- **Validação**: Raiz `render.yaml` e `apps/frontend/next.config.js` são as únicas fontes de verdade.

**✅ P1.1-D — Token sensível identificado (não vazado)**

- [apps/frontend/.env.local](apps/frontend/.env.local) contém `VERCEL_OIDC_TOKEN` (confirmado não rastreado em git)
- **Ação recomendada**: Rotacionar token se foi usado fora de ambiente local (verificar com equipe DevOps).

**✅ P1.2-A — Imports/variáveis não usados eliminados (Ruff F401/F841)**

- Backend: **0 ocorrências** (reduzido de 123 → 0)
- Exemplos corrigidos:
  - [apps/backend/apps/core/tasks.py](apps/backend/apps/core/tasks.py#L260) → removido `BlacklistedToken` não usado
  - [apps/backend/apps/billing/tasks.py](apps/backend/apps/billing/tasks.py#L115) → removido `now` não utilizado
  - [apps/backend/apps/core/views/analytics.py](apps/backend/apps/core/views/analytics.py#L6) → removido `TruncDate` não utilizado
  - Testes corrigidos com asserts significativos (F841)
- **Validação**: `ruff check apps/backend --select F401,F841 → All checks passed!`

**✅ P1.3-A — TODO integrado com Sentry**

- [apps/frontend/components/ErrorBoundary.tsx](apps/frontend/components/ErrorBoundary.tsx#L40-L50) → Sentry.captureException integrado
- Captura habilitada em dev/prod/staging; desabilitada em testes (NODE_ENV=test)
- **Validação**: Import `@sentry/nextjs` já estava presente no frontend.

**✅ Vulnerabilidades de dependências zeradas**

- Frontend:
  - `npm audit --audit-level=high` → **antes: 16 vulns (1 critical, 13 high)**
  - Ação: removido `vercel@^50.4.7` (devDependency redundante)
  - **Depois: 0 vulnerabilidades**
- Backend:
  - `pip-audit -r apps/backend/requirements/prod.txt` → **0 vulnerabilidades** (sem mudanças necessárias)

### Validação final

- ✅ Ruff F401/F841: 0 erros
- ✅ npm audit: 0 vulnerabilidades
- ✅ pip-audit: 0 vulnerabilidades
- ✅ Testes Django: 179 passed, 2 skipped, 0 failed (antes da correção de imports: 56 failed por re-export vazio → corrigido com import explícito)
- ✅ ErrorBoundary integrado com Sentry
- ✅ Python versão unificada (3.12.3)

### Artefatos gerados

- `AUDIT_REPORT.md` — Este relatório (evidências e status)
- `ACTION_PLAN.md` — Plano de ação atualizado
- **Commits sugeridos**:
  1. "chore(audit): P1.1 - align Python version to 3.12.3"
  2. "chore(audit): P1.1 - remove duplicate render.yaml and next.config.js"
  3. "chore(audit): P1.2 - remove unused imports and variables (Ruff F401/F841)"
  4. "chore(audit): P1.3 - integrate ErrorBoundary with Sentry"
  5. "chore(npm): P1 - remove redundant vercel devDependency, zero vulnerabilities"
