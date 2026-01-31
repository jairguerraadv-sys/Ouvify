# PARTE 1 — Análise Estrutural e Integridade do Código (Ouvify)

**Data:** 31/01/2026  
**Escopo:** Mapeamento do monorepo, arquivos de configuração, dependências/versões e riscos estruturais imediatos.

---

## 1.1 Estrutura do monorepo (alto nível)

- Raiz:
  - `apps/backend/` (Django + DRF; deploy Railway)
  - `apps/frontend/` (Next.js; deploy Vercel)
  - `packages/` (`config/`, `types/`, `ui/`)
  - Infra/ops: `docker-compose.yml`, `docker-compose.prod.yml`, `nginx/`, `monitoring/`
  - Qualidade: `pytest.ini`, `pyrightconfig.json`, `.github/workflows/*`

## 1.1 Arquivos de configuração identificados (seleção)

- Ambientes (raiz): `.env.example`, `.env.production`, `.env.staging`, `.env.local`, `.env.example.old`
- Ambientes (backend): `apps/backend/.env`, `apps/backend/.env.local`, `apps/backend/.env.example`
- Deploy:
  - Backend: `apps/backend/Procfile`, `apps/backend/nixpacks.toml`, `apps/backend/runtime.txt`
  - Frontend: `vercel.json`, `apps/frontend/vercel.json`, `apps/frontend/railway.json`
- Contêineres: `docker-compose.yml`, `docker-compose.prod.yml`, `nginx/nginx.conf`, `nginx/conf.d/*`
- Observabilidade: `monitoring/docker-compose.yml`, `monitoring/prometheus/*`, `monitoring/grafana/*`, `monitoring/alertmanager/*`

---

## 1.1 Achado crítico: arquivos `.env.*` versionados

**Impacto:** risco de vazamento de segredos/credenciais (mesmo “placeholders” podem ser preenchidos acidentalmente) e histórico permanente no Git.

**Evidências (linhas com variáveis sensíveis; valores redigidos):**
- `.env.production`: `SECRET_KEY` (linha 9), `DATABASE_URL` (20), `STRIPE_*` (34–36), `EMAIL_HOST_PASSWORD` (47), `REDIS_URL` (54), `SENTRY_DSN` (57)
- `.env.staging`: `SECRET_KEY` (7), `STRIPE_*` (31–33), `SENTRY_DSN` (42), `CLOUDINARY_API_SECRET` (48)

**Correção aplicada nesta auditoria (hardening imediato):**
- Atualizado `.gitignore` para ignorar `.env.*` e permitir apenas exemplos (linhas 52–59).
- Removidos do Git (untracked) `.env.production`, `.env.staging` e `node_modules/.package-lock.json`.

> Observação: isso remove os arquivos do repositório, mas mantém cópias locais; recomenda-se rotacionar credenciais caso algum valor real já tenha sido commitado no passado.

---

## 1.1 Dependências e versões (inventário inicial)

### Node/JS
- Monorepo: `package.json` (raiz) com `workspaces` (`apps/frontend`, `packages/*`) e `turbo`.
- Engines (raiz): Node `>=18` e npm `>=9`.
- Frontend: `apps/frontend/package.json`
  - `next@16.1.5`, `react@19.2.4`, `@sentry/nextjs@^10.36.0`, `axios@^1.13.3`, `isomorphic-dompurify@^2.35.0`.
- Packages: `packages/types/package.json` (build `tsc`).

### Python
- **Manifesto fonte de verdade (backend)**:
  - `apps/backend/requirements.txt` — self-contained (compatível com build contexts que apontam para `apps/backend`).
- **Wrapper no root (monorepo tooling)**:
  - `requirements.txt` (raiz) — wrapper que inclui `apps/backend/requirements.txt` (evita drift).

**Inconsistências relevantes (exemplos):**
- Django: raiz `Django==6.0.1` vs backend `Django==5.1.5`.
- Celery: raiz `5.4.0` vs backend `5.6.2`.
- `django-redis`: raiz `6.0.0` vs backend `5.4.0`.
- `djangorestframework-simplejwt`: raiz `5.3.1` vs backend `5.5.1`.
- `sentry-sdk`: raiz `2.20.0` vs backend `2.50.0`.

**Risco (mitigado):** anteriormente havia drift; agora o root é wrapper e o backend é self-contained, reduzindo divergências entre ambiente local/CI/produção.

---

## 1.1 Compatibilidade de runtime/CI

- Backend runtime declarado: `apps/backend/runtime.txt` = Python **3.11.8**.
- CI backend (`.github/workflows/backend-ci.yml`): lint roda com `PYTHON_VERSION=3.12`; testes rodam em matriz `3.11` e `3.12`.
- CI frontend (`.github/workflows/frontend-ci.yml`): Node `22`.

**Observação:** há uso recorrente de `|| true` em etapas de lint/segurança/testes nos workflows, o que reduz a efetividade do CI (pode “passar” mesmo com falhas). Isso será tratado com mais detalhe nas Partes 3 e 7.

---

## Recomendações imediatas (Parte 1)

1. **Unificar estratégia de dependências Python**: **concluído** — `apps/backend/requirements.txt` é a fonte de verdade (self-contained) e `requirements.txt` na raiz é wrapper, evitando drift.
2. **Rotação de segredos**: se `.env.production`/`.env.staging` já tiveram valores reais em algum commit histórico, rotacionar `SECRET_KEY`, Stripe, Cloudinary, Sentry, SMTP e credenciais DB/Redis.
3. **Governança de configs**: manter apenas `.env.example`/`.env.example.*` no Git; ambientes reais via secrets manager (Railway/Vercel) e `.env.local` fora do versionamento.

---

## Checagens executadas (evidência)

- `npm audit --audit-level=high`:
  - Raiz: **0 vulnerabilidades**
  - `apps/frontend`: **0 vulnerabilidades**
- `pip-audit -r apps/backend/requirements.txt`:
  - Antes: vulnerabilidades em `Django==5.1.5` com fixes disponíveis (ex.: 5.1.7+ / 5.1.15+).
  - Ação: atualizado `apps/backend/requirements.txt` para `Django==5.1.15`.
  - Depois: **No known vulnerabilities found**.
