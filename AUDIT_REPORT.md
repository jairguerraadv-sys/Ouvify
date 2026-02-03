# AUDITORIA COMPLETA DO PROJETO OUVIFY (Em progresso)

Data: 2026-02-03

## Executive Summary (parcial)
Esta auditoria está sendo executada em etapas. Este documento contém **apenas os resultados da Parte 1 (Estrutura e Integridade)** até o momento.

## PARTE 1: ANÁLISE ESTRUTURAL E INTEGRIDADE DO CÓDIGO

### 1.1 Mapeamento da Estrutura do Monorepo

**Pastas principais identificadas**
- apps/backend: Backend Django/DRF (multi-tenancy, billing, consent, webhooks).
- apps/frontend: Frontend Next.js (App Router), testes unitários e E2E.
- packages/types: Pacote interno de tipos TypeScript.
- monitoring: Stack Prometheus + Grafana + Alertmanager.
- nginx: Reverse proxy (nginx.conf).

**Arquivos de configuração e manifests (alto nível)**
- Backend:
  - apps/backend/config/settings.py (settings Django)
  - apps/backend/config/urls.py (rotas/routers DRF)
  - apps/backend/nixpacks.toml (build/start no Railway)
  - apps/backend/runtime.txt (python runtime)
  - apps/backend/requirements.txt (dependências Python)
  - apps/backend/.env.example (env example)
  - apps/backend/Dockerfile, apps/backend/Dockerfile.dev
- Frontend:
  - apps/frontend/next.config.js (config Next + headers + redirects)
  - apps/frontend/middleware.ts (middleware Next)
  - apps/frontend/vercel.json (headers no deploy)
  - apps/frontend/package.json (dependências Node)
  - apps/frontend/playwright.config.ts, apps/frontend/jest.config.ts
- Monorepo:
  - package.json (workspaces + turbo)
  - turbo.json
  - docker-compose.yml, docker-compose.prod.yml
  - .env.example (env example “global”)
  - .github/workflows/*.yml (CI)

**Observações (integridade/consistência)**
- Existe um wrapper de requirements no root apontando para o backend, o que é bom para ferramentas que assumem requirements na raiz: requirements.txt.

### 1.2 Análise de Duplicações e Redundâncias

**Redundância de documentação OpenAPI/Swagger no backend**
- O backend usa drf-spectacular para expor schema e UIs (Swagger/ReDoc) em apps/backend/config/swagger.py.
- Apesar disso, drf-yasg estava listado como dependência e aparentava não ser necessário.
  - Evidência: drf-spectacular é o gerador usado em apps/backend/config/swagger.py: [apps/backend/config/swagger.py](apps/backend/config/swagger.py)
- Impacto: superfície de ataque e custo de manutenção maiores; risco de versões conflitantes (além de confundir o time).
 - Status: corrigido (removido do conjunto base/prod; padronizado em requirements/base.txt).

**Dependências “dev/test” instaladas em produção (backend)**
- nplusone, django-debug-toolbar e locust estavam no mesmo arquivo usado por builds de produção.
- Impacto: aumenta tamanho do build e o número de dependências em produção (o que afeta segurança e confiabilidade).
- Status: corrigido com separação por ambiente:
  - Produção: [apps/backend/requirements/prod.txt](apps/backend/requirements/prod.txt)
  - Base runtime: [apps/backend/requirements/base.txt](apps/backend/requirements/base.txt)
  - Dev: [apps/backend/requirements/dev.txt](apps/backend/requirements/dev.txt)
  - Test: [apps/backend/requirements/test.txt](apps/backend/requirements/test.txt)
  - Railway/Nixpacks atualizado para prod: [apps/backend/nixpacks.toml](apps/backend/nixpacks.toml)

**Duplicação de configuração de headers de segurança (frontend)**
- Headers são declarados em apps/frontend/next.config.js via `async headers()`.
  - Evidência: [apps/frontend/next.config.js](apps/frontend/next.config.js#L33)
- Também havia headers em apps/frontend/vercel.json.
- Impacto: risco de divergência (ex.: um lugar atualiza HSTS e o outro não). Sugere-se escolher uma fonte única (preferencialmente Next config, a menos que haja necessidade específica do Vercel).
 - Status: corrigido (headers removidos do Vercel config; mantidos no Next config): [apps/frontend/vercel.json](apps/frontend/vercel.json)

### 1.3 Comparação de Versões e Código Obsoleto

**Workflows de deploy desabilitados**
- Há um diretório .github/workflows-disabled com arquivos de deploy.
- Impacto: pode indicar que CD está parcialmente desativado; precisa ser validado com o processo atual (Railway/Vercel).

**TODOs que indicam gaps funcionais/integração**
- Testes de integração backend tinham TODOs relacionados a isolamento de tenant e query param incorreto no endpoint público de consulta.
  - Status: corrigido (asserts reabilitados; uso de `protocolo` e `all_tenants()`): [apps/backend/tests/test_integration.py](apps/backend/tests/test_integration.py)
- Frontend: perfil tinha hardcodes (cargo/cadastro/plano) aguardando backend.
  - Status: corrigido (perfil busca `/api/users/me/`; backend passou a retornar `cargo` e `plano`):
    - [apps/frontend/app/dashboard/perfil/page.tsx](apps/frontend/app/dashboard/perfil/page.tsx)
    - [apps/backend/apps/tenants/views.py](apps/backend/apps/tenants/views.py)

**Inconsistência de nomes de variáveis de ambiente (Stripe)**
- Root .env.example usa STRIPE_PUBLIC_KEY.
  - Evidência: [./.env.example](.env.example#L75)
- Backend .env.example usava STRIPE_PUBLISHABLE_KEY.
- Impacto: risco alto de misconfiguração (especialmente em ambientes diferentes). Recomenda-se padronizar nome único e documentar (ex.: STRIPE_PUBLIC_KEY e NEXT_PUBLIC_STRIPE_PUBLIC_KEY no frontend).
 - Status: corrigido (backend padronizado para STRIPE_PUBLIC_KEY): [apps/backend/.env.example](apps/backend/.env.example)

## Próximas etapas
- Parte 1 (continuação): varredura mais sistemática de duplicações >20 linhas e “não referenciados”.
  - Resultados gerados (artefato): [scripts/audit/PART1_CONTINUATION_RESULTS.md](scripts/audit/PART1_CONTINUATION_RESULTS.md)
  - Nota: quando o terminal falhar por ENOPRO, use a alternativa via Python/snippet (ou rode localmente/CI) e anexe as saídas.
  - Scripts:
    - Duplicações >=20 linhas: [scripts/audit/find_duplicates.py](scripts/audit/find_duplicates.py)
    - Não referenciados (heurístico): [scripts/audit/find_unreferenced.py](scripts/audit/find_unreferenced.py)
    - Runner: [scripts/audit/run_part1_continuation.py](scripts/audit/run_part1_continuation.py)
- Parte 2: mapeamento completo de rotas Next.js + endpoints DRF + correspondências FE↔BE.
- Partes 3–10: segurança, performance, DB, infra, testes, gap analysis e documentação.
