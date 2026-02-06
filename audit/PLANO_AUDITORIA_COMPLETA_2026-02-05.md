# 🎯 PLANO DE AUDITORIA COMPLETA - OUVIFY

**Data:** 05 de Fevereiro de 2026 (Continuação)  
**Framework:** ROMA (Reasoning On Multiple Abstractions)  
**Executor:** GitHub Copilot Agent (Claude Sonnet 4.5)  
**Modo:** Sentient-AGI com validação contínua

---

## 📋 VISÃO GERAL

### Contexto

- **Auditorias anteriores:** 31/01/2026 e 05/02/2026 (completude ~85%)
- **Vulnerabilidades conhecidas:** 0 críticas, 3 altas, 4 médias, 5 baixas
- **Gap principal:** Finalização MVP, documentação de usuário, validação de correções

### Restrições Obrigatórias

- ❌ Sem APIs externas (OpenAI, Gemini, Anthropic)
- ✅ Apenas recursos locais: Docker, Python, Node, curl, Copilot VS Code
- ❌ Sem exfiltração de dados sensíveis
- ✅ Evidências registradas em arquivos locais

---

## 🧩 FASE A: ATOMIZER - DECOMPOSIÇÃO

### Macrotarefas MECE (Mutuamente Exclusivas, Coletivamente Exaustivas)

| ID     | Macrotarefa               | Esforço | Output                             |
| ------ | ------------------------- | ------- | ---------------------------------- |
| **M0** | Baseline & Validação      | 30min   | `/audit/BASELINE_STATUS.md`        |
| **M1** | Integridade & Duplicações | 45min   | `/audit/DUPLICATION_REDUNDANCY.md` |
| **M2** | Segurança Crítica         | 90min   | `/audit/SECURITY_REVIEW.md`        |
| **M3** | Testes & Qualidade        | 60min   | `/audit/TEST_COVERAGE.md`          |
| **M4** | Performance               | 45min   | `/audit/PERFORMANCE_REVIEW.md`     |
| **M5** | Conformidade LGPD         | 45min   | `/audit/COMPLIANCE_LGPD.md`        |
| **M6** | Deploy & Config           | 30min   | `/audit/DEPLOY_STATUS.md`          |
| **M7** | Documentação              | 60min   | `/docs/` (vários)                  |
| **M8** | Backlog MVP               | 30min   | `/audit/MVP_BACKLOG.md`            |

**Total Estimado:** 6-7 horas

---

## 📋 FASE B: PLANNER - PLANO DETALHADO

### M0: BASELINE & VALIDAÇÃO (30min)

**Objetivo:** Estabelecer linha de base atual e validar status de correções anteriores.

#### Checklist

- [ ] **M0.1** Coletar versões de dependências (backend + frontend)
  - [ ] Rodar `pip list > /audit/evidence/backend_dependencies.txt`
  - [ ] Rodar `npm list --json > /audit/evidence/frontend_dependencies.json`
  - [ ] Verificar CVEs conhecidos via `pip-audit` e `npm audit`

- [ ] **M0.2** Mapear estrutura do monorepo
  - [ ] Gerar árvore de diretórios filtrada (excluir node_modules, **pycache**)
  - [ ] Identificar apps Django: listar `/apps/backend/apps/*`
  - [ ] Identificar páginas Next.js: listar `/apps/frontend/app/*`
  - [ ] Gerar diagrama Mermaid em `/audit/INVENTORY.md`

- [ ] **M0.3** Validar correções de auditorias anteriores
  - [ ] Ler `/docs/AUDIT_COMPLETE_2026-02-05.md` - seção "Vulnerabilidades Altas"
  - [ ] Ler `/AUDITORIA_SEGURANCA_2026-02-05.md` - seção "Problemas Identificados"
  - [ ] Para cada vulnerabilidade ALTA/MÉDIA:
    - [ ] Verificar se o arquivo/código foi corrigido
    - [ ] Registrar status: ✅ Corrigido, ⚠️ Parcial, ❌ Pendente
  - [ ] Documentar em `/audit/BASELINE_STATUS.md`

- [ ] **M0.4** Coletar métricas baseline
  - [ ] Linhas de código: `cloc apps/backend apps/frontend --json > /audit/evidence/cloc.json`
  - [ ] Arquivos por tipo: `find apps -type f | sed 's/.*\.//' | sort | uniq -c > /audit/evidence/file_types.txt`
  - [ ] Tamanho do repositório: `du -sh /workspaces/Ouvify > /audit/evidence/repo_size.txt`

**Definition of Done:**

- Arquivo `/audit/BASELINE_STATUS.md` criado com status de correções anteriores
- Evidências coletadas em `/audit/evidence/`
- Inventário completo do monorepo em `/audit/INVENTORY.md`

---

### M1: INTEGRIDADE & DUPLICAÇÕES (45min)

**Objetivo:** Encontrar código duplicado, dead code, imports quebrados, rotas faltantes.

#### Checklist

- [ ] **M1.1** Detectar dependências duplicadas
  - [ ] Backend: `pip list | sort | uniq -d` (não deve haver duplicatas)
  - [ ] Frontend: verificar `package.json` vs `package-lock.json`
  - [ ] Identificar versões conflitantes entre workspaces

- [ ] **M1.2** Procurar pastas legacy/backup
  - [ ] `find /workspaces/Ouvify -type d -name "*old*" -o -name "*backup*" -o -name "*legacy*" -o -name "*v1*"`
  - [ ] Listar conteúdo e comparar com versão atual
  - [ ] Registrar decisão: manter/remover/mover

- [ ] **M1.3** Encontrar imports quebrados (Python)
  - [ ] Rodar `pylint --disable=all --enable=import-error apps/backend/apps/**/*.py > /audit/evidence/python_imports.txt`
  - [ ] Revisar manualmente arquivos com erro de import
  - [ ] Corrigir top 10 por impacto

- [ ] **M1.4** Encontrar imports quebrados (TypeScript)
  - [ ] Rodar `cd apps/frontend && npm run build 2>&1 | tee /audit/evidence/ts_build.log`
  - [ ] Extrair erros de import (Module not found)
  - [ ] Corrigir ou documentar

- [ ] **M1.5** Encontrar dead code
  - [ ] Backend: buscar funções/classes nunca importadas
  - [ ] Frontend: buscar components não referenciados via `grep -r "import.*ComponentName"`
  - [ ] Rotas não usadas: comparar `config/urls.py` com logs de acesso

- [ ] **M1.6** Verificar assets faltantes
  - [ ] Procurar por `public/`, `static/`, `media/` referenciados mas não existentes
  - [ ] Verificar links em templates Django e componentes React

- [ ] **M1.7** Rodar linters
  - [ ] Backend: `cd apps/backend && pylint apps/ > /audit/evidence/pylint_report.txt`
  - [ ] Frontend: `cd apps/frontend && npm run lint > /audit/evidence/eslint_report.txt`
  - [ ] Extrair top 20 issues e priorizar

**Definition of Done:**

- Arquivo `/audit/DUPLICATION_REDUNDANCY.md` com lista de duplicações e dead code
- Top 10 imports quebrados corrigidos
- Decisão sobre pastas legacy (manter/remover) documentada

---

### M2: SEGURANÇA CRÍTICA (90min)

**Objetivo:** Validar correções anteriores + encontrar novas vulnerabilidades + aplicar fixes críticos.

#### Checklist

- [ ] **M2.1** Validar correções de vulnerabilidades ALTAS (auditoria 05/02)
  - [ ] **ALTA-1:** Verificação 2FA em rotas sensíveis (change password, delete account)
    - [ ] Verificar: `apps/backend/apps/core/views.py` (PasswordResetConfirmView)
    - [ ] Verificar: `apps/backend/apps/core/account_views.py` (DeleteAccountView)
    - [ ] Se não corrigido: implementar decorator `@require_2fa`
  - [ ] **ALTA-2:** Rate limiting em endpoints críticos
    - [ ] Verificar: login, register, password reset
    - [ ] Confirmar: Django-ratelimit configurado ou throttle DRF
  - [ ] **ALTA-3:** [Identificar terceira vulnerabilidade ALTA nos docs]
    - [ ] Ler `/AUDITORIA_SEGURANCA_2026-02-05.md` linha por linha

- [ ] **M2.2** Verificar secrets expostos
  - [ ] Rodar: `grep -r "SECRET_KEY\|API_KEY\|PASSWORD\|TOKEN" --include="*.py" --include="*.js" --include="*.ts" apps/ | grep -v ".env.example" > /audit/evidence/secrets_scan.txt`
  - [ ] Revisar manualmente: nenhum secret hardcoded
  - [ ] Verificar: `.env` não commitado (`git ls-files | grep .env`)
  - [ ] Verificar: `.gitignore` atualizado

- [ ] **M2.3** Dependências vulneráveis (CVEs)
  - [ ] Backend: `pip-audit --format json > /audit/evidence/pip_audit.json`
  - [ ] Frontend: `npm audit --json > /audit/evidence/npm_audit.json`
  - [ ] Priorizar CVEs críticas/altas
  - [ ] Atualizar pacotes ou documentar mitigação

- [ ] **M2.4** SAST (Static Application Security Testing) local
  - [ ] Instalar Semgrep (se disponível): `pip install semgrep`
  - [ ] Rodar: `semgrep --config auto apps/backend --json > /audit/evidence/semgrep_backend.json`
  - [ ] Se semgrep não disponível: revisão manual orientada (OWASP Top 10)

- [ ] **M2.5** Checklist OWASP Top 10 2021
  - [ ] **A01:2021 - Broken Access Control**
    - [ ] Verificar RBAC: `apps/backend/apps/tenants/permissions.py`
    - [ ] Testar IDOR: criar 2 tenants e tentar acessar dados de outro
    - [ ] Verificar: `get_queryset()` filtra por `request.user.client_atual`
  - [ ] **A02:2021 - Cryptographic Failures**
    - [ ] TLS/HTTPS: verificar `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`
    - [ ] Dados sensíveis: verificar se senhas estão com hash (Django usa PBKDF2)
    - [ ] Verificar: dados de feedback anônimos não expõem identificadores
  - [ ] **A03:2021 - Injection**
    - [ ] SQL Injection: Django ORM protege, mas verificar `.raw()` e `.extra()`
    - [ ] XSS: verificar sanitização (bleach) em `apps/backend/apps/feedbacks/serializers.py`
    - [ ] Command Injection: buscar `os.system`, `subprocess.call` sem validação
  - [ ] **A04:2021 - Insecure Design**
    - [ ] Verificar: anonimato preservado (sem IP, sem metadata vazada)
    - [ ] Verificar: protocolo de rastreio não é sequencial/previsível
  - [ ] **A05:2021 - Security Misconfiguration**
    - [ ] `DEBUG = False` em produção (verificar `config/settings.py`)
    - [ ] `ALLOWED_HOSTS` configurado corretamente
    - [ ] Headers de segurança: HSTS, X-Content-Type-Options, X-Frame-Options
  - [ ] **A06:2021 - Vulnerable Components**
    - [ ] Já coberto em M2.3 (pip-audit, npm audit)
  - [ ] **A07:2021 - Auth Failures**
    - [ ] Rate limiting: verificado em M2.1
    - [ ] 2FA: verificado em M2.1
    - [ ] Session management: JWT com blacklist (já implementado)
  - [ ] **A08:2021 - Data Integrity Failures**
    - [ ] Verificar: uploads validados (tipo MIME, tamanho, extensão)
    - [ ] Verificar: Cloudinary upload service sanitiza filenames
  - [ ] **A09:2021 - Logging Failures**
    - [ ] Verificar: `apps/backend/apps/auditlog/` registra ações críticas
    - [ ] Verificar: logs não contêm senhas/tokens (grep em código)
  - [ ] **A10:2021 - SSRF**
    - [ ] Verificar: webhooks validam URLs (não apontam para localhost/IPs privados)
    - [ ] Verificar: upload de imagens não permite URLs arbitrárias

- [ ] **M2.6** CSRF & CORS
  - [ ] CSRF: verificar `SessionAuthentication` ou `CsrfExempt` documentado
  - [ ] CORS: verificar `CORS_ALLOWED_ORIGINS` não usa `*` em produção
  - [ ] Verificar: `CORS_ALLOW_CREDENTIALS = True` apenas se necessário

- [ ] **M2.7** Headers de Segurança
  - [ ] Verificar: `SECURE_HSTS_SECONDS` configurado (31536000 = 1 ano)
  - [ ] Verificar: `X_FRAME_OPTIONS = 'DENY'` ou `SAMEORIGIN`
  - [ ] Verificar: `SECURE_CONTENT_TYPE_NOSNIFF = True`
  - [ ] CSP: verificar `/apps/frontend/csp-config.js` está em uso

- [ ] **M2.8** Logs & Audit Trail
  - [ ] Verificar: ações de admin são registradas (`apps/backend/apps/auditlog/`)
  - [ ] Verificar: logs NÃO contêm PII desmascarado
  - [ ] Testar: criar feedback, mudar status, verificar log gerado

- [ ] **M2.9** Aplicar correções críticas
  - [ ] Priorizar P0/P1 encontrados em M2.1-M2.8
  - [ ] Aplicar fixes diretamente no código
  - [ ] Rodar testes de regressão após cada fix
  - [ ] Documentar cada fix em `/audit/SECURITY_REVIEW.md`

**Definition of Done:**

- Arquivo `/audit/SECURITY_REVIEW.md` com findings + correções aplicadas
- Vulnerabilidades CRÍTICAS = 0
- Vulnerabilidades ALTAS ≤ 1 (e com plano de mitigação)
- Scripts de verificação repetíveis em `/tools/audit/audit_security.sh`

---

### M3: TESTES & QUALIDADE (60min)

**Objetivo:** Rodar suites existentes + criar testes críticos faltantes.

#### Checklist

- [ ] **M3.1** Rodar testes backend existentes
  - [ ] `cd apps/backend && pytest --cov --cov-report=html --cov-report=json > /audit/evidence/pytest_output.txt`
  - [ ] Verificar cobertura: objetivo mínimo 70%
  - [ ] Identificar modules sem cobertura

- [ ] **M3.2** Rodar testes frontend existentes
  - [ ] `cd apps/frontend && npm run test:coverage`
  - [ ] Verificar cobertura: objetivo mínimo 60% (frontend)
  - [ ] Identificar components não testados

- [ ] **M3.3** Rodar testes E2E (se existirem)
  - [ ] `cd apps/frontend && npm run test:e2e`
  - [ ] Verificar fluxos principais funcionam

- [ ] **M3.4** Criar testes críticos faltantes (Backend)
  - [ ] **Auth:**
    - [ ] Login com credenciais corretas
    - [ ] Login com credenciais incorretas (rate limit?)
    - [ ] Refresh token rotation
    - [ ] Blacklist após logout
  - [ ] **Multi-tenancy Isolation:**
    - [ ] Criar 2 tenants (A e B)
    - [ ] Criar feedback em A
    - [ ] Tentar acessar feedback de A via token de B (deve falhar)
  - [ ] **Feedback CRUD:**
    - [ ] Criar feedback anônimo
    - [ ] Criar feedback com contato
    - [ ] Buscar feedback por protocolo
    - [ ] Atualizar status (apenas admin)
    - [ ] Deletar feedback (apenas admin)
  - [ ] **Permissions:**
    - [ ] Owner pode tudo
    - [ ] Admin pode gerenciar feedbacks
    - [ ] Viewer apenas lê (não edita)

- [ ] **M3.5** Criar testes críticos faltantes (Frontend)
  - [ ] Renderização de páginas principais (Home, Login, Dashboard)
  - [ ] Formulário de criação de feedback (validação)
  - [ ] Consulta de protocolo (sucesso e erro)

- [ ] **M3.6** Configurar CI local (scripts)
  - [ ] Criar `/tools/audit/run_tests.sh`
  - [ ] Script deve:
    - [ ] Rodar testes backend
    - [ ] Rodar testes frontend
    - [ ] Falhar se cobertura < threshold
    - [ ] Gerar relatório consolidado

**Definition of Done:**

- Cobertura de testes: Backend ≥ 70%, Frontend ≥ 60%
- Testes críticos implementados (auth, multi-tenancy, CRUD)
- Script CI local funcionando: `/tools/audit/run_tests.sh`
- Relatório em `/audit/TEST_COVERAGE.md`

---

### M4: PERFORMANCE (45min)

**Objetivo:** Identificar gargalos e implementar quick wins.

#### Checklist

- [ ] **M4.1** Performance Backend
  - [ ] **Queries N+1:**
    - [ ] Instalar `django-debug-toolbar` (se não instalado)
    - [ ] Rodar endpoint `/api/v1/feedbacks/` e inspecionar queries
    - [ ] Procurar por `select_related()`, `prefetch_related()` faltantes
    - [ ] Corrigir top 3 endpoints com mais queries
  - [ ] **Latência de endpoints críticos:**
    - [ ] Medir: Login, ListFeedbacks, CreateFeedback, Analytics
    - [ ] Usar: `curl -w "@curl-format.txt" -o /dev/null -s https://ouvify-backend.onrender.com/api/v1/feedbacks/`
    - [ ] Objetivo: < 500ms (p95)
  - [ ] **Caching:**
    - [ ] Verificar: analytics usa cache (já implementado?)
    - [ ] Verificar: dashboards stats em cache
    - [ ] Adicionar cache em endpoints de leitura pesada
  - [ ] **Paginação:**
    - [ ] Verificar: todos os list endpoints têm paginação
    - [ ] Default: 20-50 itens por página

- [ ] **M4.2** Performance Frontend
  - [ ] **Bundle size:**
    - [ ] Rodar: `cd apps/frontend && npm run build`
    - [ ] Verificar: `.next/analyze/` (se ANALYZE=true)
    - [ ] Objetivo: bundle inicial < 200KB gzipped
  - [ ] **Lazy loading:**
    - [ ] Verificar: componentes pesados usam `dynamic()` do Next.js
    - [ ] Verificar: imagens usam `next/image` com lazy loading
  - [ ] **Requests redundantes:**
    - [ ] Usar: `useSWR` para caching automático (já usado?)
    - [ ] Verificar: não há re-fetches desnecessários
  - [ ] **Assets:**
    - [ ] Verificar: imagens estão otimizadas (webp/avif)
    - [ ] Verificar: fonts em `next/font` (já implementado?)

- [ ] **M4.3** Quick Wins
  - [ ] Adicionar índices de DB faltantes (se encontrados em M4.1)
  - [ ] Adicionar `select_related()` em top 3 endpoints lentos
  - [ ] Adicionar cache em analytics (se não existir)
  - [ ] Implementar: 2-3 quick wins de baixo risco

- [ ] **M4.4** Registrar baseline vs after
  - [ ] Antes/depois de cada otimização
  - [ ] Métricas: latência, queries, bundle size

**Definition of Done:**

- Endpoints críticos: latência < 500ms (p95)
- N+1 queries eliminados (top 3)
- Quick wins implementados (2-3)
- Relatório em `/audit/PERFORMANCE_REVIEW.md` (antes/depois)

---

### M5: CONFORMIDADE LGPD/GDPR (45min)

**Objetivo:** Mapear dados, políticas, retenção, direitos do titular.

#### Checklist

- [ ] **M5.1** Mapear dados pessoais coletados
  - [ ] **Feedbacks:**
    - [ ] `nome` (opcional)
    - [ ] `email_contato` (opcional)
    - [ ] `telefone` (opcional)
    - [ ] `descricao` (texto livre - pode conter dados)
    - [ ] `arquivos` (uploads - podem conter dados)
  - [ ] **Usuários (Staff):**
    - [ ] `email`, `nome`, `telefone`, `cargo`
  - [ ] **Tenants:**
    - [ ] `razao_social`, `cnpj`, `email_contato`
  - [ ] **Logs:**
    - [ ] IP, User-Agent (verificar se coletado)

- [ ] **M5.2** Verificar base legal
  - [ ] **Consentimento:** formulário de feedback deve ter checkbox?
  - [ ] **Legítimo interesse:** canal de denúncia (compliance)
  - [ ] **Cumprimento de obrigação legal:** algumas empresas têm obrigação legal de ter canal

- [ ] **M5.3** Minimização de dados
  - [ ] Verificar: campos obrigatórios vs opcionais
  - [ ] Verificar: feedback anônimo não coleta dados desnecessários
  - [ ] Verificar: logs não contêm PII além do necessário

- [ ] **M5.4** Retenção e exclusão
  - [ ] Verificar: política de retenção definida (quanto tempo guardar?)
  - [ ] Verificar: soft delete vs hard delete
  - [ ] Verificar: comando de limpeza automática (Celery task?)
  - [ ] Implementar (se não existir): management command `delete_old_feedbacks`

- [ ] **M5.5** Direitos do titular
  - [ ] **Acesso:** usuário pode exportar seus dados? (`/api/v1/lgpd/export/`)
  - [ ] **Retificação:** usuário pode corrigir dados?
  - [ ] **Exclusão:** usuário pode deletar conta? (`DeleteAccountView`)
  - [ ] **Portabilidade:** exportação em formato estruturado (JSON/CSV)?
  - [ ] Verificar implementação em `apps/backend/apps/core/lgpd_views.py`

- [ ] **M5.6** Segurança de dados
  - [ ] **Criptografia em trânsito:** HTTPS (verificar HSTS)
  - [ ] **Criptografia em repouso:** banco de dados (PostgreSQL padrão não criptografa - documentar)
  - [ ] **Segregação:** multi-tenant impede acesso cruzado (já verificado em M2)

- [ ] **M5.7** Políticas e documentos
  - [ ] Verificar: `/docs/COMPLIANCE_LGPD.md` existe e está atualizado
  - [ ] Criar (se não existir): Política de Privacidade (template)
  - [ ] Criar (se não existir): Termo de Consentimento (template)
  - [ ] Criar (se não existir): DPO/Encarregado de Dados (template)

**Definition of Done:**

- Mapa completo de dados pessoais em `/audit/COMPLIANCE_LGPD.md`
- Direitos do titular implementados e testados
- Política de retenção definida
- Templates de documentos legais criados

---

### M6: DEPLOY & CONFIGURAÇÃO (30min)

**Objetivo:** Validar env vars, health checks, pipelines de deploy.

#### Checklist

- [ ] **M6.1** Variáveis de ambiente (Backend - Render)
  - [ ] Listar vars obrigatórias: `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, etc.
  - [ ] Verificar: arquivo `.env.example` está completo
  - [ ] Verificar: README explica como configurar cada var
  - [ ] Verificar: defaults seguros para vars opcionais

- [ ] **M6.2** Variáveis de ambiente (Frontend - Vercel)
  - [ ] Listar vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`
  - [ ] Verificar: `vercel.json` configurado corretamente
  - [ ] Verificar: CSP headers estão em produção

- [ ] **M6.3** Health checks
  - [ ] Backend: endpoint `/health/` ou `/api/health/`
  - [ ] Verificar retorna: status, version, DB connection, Redis connection
  - [ ] Render: configurar health check path

- [ ] **M6.4** CORS e URLs permitidas
  - [ ] Verificar: `CORS_ALLOWED_ORIGINS` em produção (não usar `*`)
  - [ ] Verificar: `ALLOWED_HOSTS` inclui domínio de produção
  - [ ] Verificar: `CSRF_TRUSTED_ORIGINS` configurado

- [ ] **M6.5** Build e start commands
  - [ ] Backend: verificar `Procfile` ou `render.yaml`
  - [ ] Frontend: verificar `package.json` scripts (build, start)
  - [ ] Verificar: migrations rodam antes do start

- [ ] **M6.6** Rollback e CI/CD
  - [ ] Verificar: Render mantém histórico de deploys (rollback manual)
  - [ ] Verificar: GitHub Actions (se existir) roda testes antes de deploy
  - [ ] Criar: checklist de deploy em `/docs/DEPLOYMENT.md`

- [ ] **M6.7** Observabilidade mínima
  - [ ] Verificar: Sentry configurado (já está em `settings.py`)
  - [ ] Verificar: logs estruturados (JSON logging?)
  - [ ] Verificar: métricas de infraestrutura (Render dashboard)

**Definition of Done:**

- Arquivo `/docs/DEPLOYMENT.md` atualizado com checklist completo
- Health checks funcionando
- Variáveis de ambiente documentadas
- Status de observabilidade registrado em `/audit/DEPLOY_STATUS.md`

---

### M7: DOCUMENTAÇÃO COMPLETA (60min)

**Objetivo:** Gerar/atualizar documentação técnica e manuais de usuário.

#### Checklist

- [ ] **M7.1** Documentação Técnica
  - [ ] **`/docs/README.md`**: Overview do produto (features, stack, links)
  - [ ] **`/docs/ARCHITECTURE.md`**: Diagrama de arquitetura (Mermaid), decisões, fluxos
  - [ ] **`/docs/SETUP.md`**: Como rodar localmente (Docker, env vars, troubleshooting)
  - [ ] **`/docs/API.md`**: Contratos principais, autenticação, exemplos curl
  - [ ] **`/docs/DATABASE.md`**: Schema, migrations, backups
  - [ ] **`/docs/SECURITY.md`**: Políticas, headers, rotação de chaves, resposta a incidentes
  - [ ] **`/docs/DEPLOYMENT.md`**: Render/Vercel, variáveis, build, rollbacks
  - [ ] **`/docs/RUNBOOK.md`**: Operação, incidentes, backups, logs, monitoramento

- [ ] **M7.2** ADRs (Architecture Decision Records)
  - [ ] Criar `/docs/ADR/` se não existir
  - [ ] Documentar 2-5 decisões relevantes:
    - [ ] ADR-001: Multi-tenancy por subdomínio
    - [ ] ADR-002: JWT com blacklist vs sessões
    - [ ] ADR-003: Cloudinary para uploads
    - [ ] ADR-004: ElasticSearch para busca
    - [ ] ADR-005: [outra decisão relevante]

- [ ] **M7.3** Documentação de Usuário (Admin Empresa)
  - [ ] **`/docs/USER_GUIDE_COMPANY_ADMIN.md`**:
    - [ ] Como criar conta da empresa
    - [ ] Como configurar white label (logo, cores)
    - [ ] Como convidar membros da equipe
    - [ ] Como gerenciar feedbacks (triage, responder, arquivar)
    - [ ] Como visualizar analytics
    - [ ] Como configurar webhooks
    - [ ] Como exportar relatórios
  - [ ] Usar screenshots conceituais ou placeholders `[Imagem: Dashboard principal]`

- [ ] **M7.4** Documentação de Usuário (Usuário Final)
  - [ ] **`/docs/USER_GUIDE_END_USER.md`**:
    - [ ] Como acessar canal de feedback da empresa
    - [ ] Como criar feedback (anônimo vs identificado)
    - [ ] Como acompanhar protocolo (código de rastreio)
    - [ ] O que cada status significa
    - [ ] Como responder a solicitações de informação
    - [ ] Política de privacidade resumida

- [ ] **M7.5** CHANGELOG
  - [ ] Verificar: `/docs/CHANGELOG.md` existe
  - [ ] Se não existir: criar template
  - [ ] Adicionar entradas principais (versão 0.1, 0.2, etc.)

- [ ] **M7.6** README Principal
  - [ ] Atualizar `/README.md` se estiver desatualizado
  - [ ] Garantir: badges, links, setup rápido, documentação

**Definition of Done:**

- Todos os arquivos `/docs/*.md` criados/atualizados
- Manuais de usuário completos com instruções passo a passo
- ADRs documentados (mínimo 3)
- README principal atualizado

---

### M8: BACKLOG MVP & PRIORIZAÇÃO (30min)

**Objetivo:** Gerar lista priorizada do que falta para MVP.

#### Checklist

- [ ] **M8.1** Consolidar findings de M0-M7
  - [ ] Bugs encontrados
  - [ ] Funcionalidades faltantes
  - [ ] Melhorias de segurança (P1/P2)
  - [ ] Melhorias de performance (P1/P2)
  - [ ] Dívida técnica

- [ ] **M8.2** Priorizar itens
  - [ ] **P0 (Bloqueia lançamento)**: ex: vulnerabilidades críticas, funcionalidades core quebradas
  - [ ] **P1 (Alta prioridade)**: ex: funcionalidades importantes, UX ruim, segurança alta
  - [ ] **P2 (Média prioridade)**: ex: melhorias, nice-to-have

- [ ] **M8.3** Estimar esforço
  - [ ] Para cada item: S (< 4h), M (1-2 dias), L (3-5 dias), XL (> 1 semana)

- [ ] **M8.4** Criar backlog acionável
  - [ ] Template para cada item:
    ```
    ### [ID] Título
    - **Prioridade:** P0/P1/P2
    - **Esforço:** S/M/L/XL
    - **Descrição:** [o que fazer]
    - **Impacto:** [qual o problema que resolve]
    - **Arquivos afetados:** [lista de arquivos]
    - **Critério de aceite:** [como validar que foi feito]
    ```

- [ ] **M8.5** Gerar relatório MVP
  - [ ] **`/audit/MVP_BACKLOG.md`**:
    - [ ] Resumo de completude (% atual)
    - [ ] Lista P0 (bloqueadores)
    - [ ] Lista P1 (essencial)
    - [ ] Lista P2 (desejável)
    - [ ] Estimativa total de esforço para MVP

**Definition of Done:**

- Arquivo `/audit/MVP_BACKLOG.md` com backlog priorizado e acionável
- Estimativa de esforço para MVP completo
- Itens P0 claramente identificados

---

## 📊 FASE C: EXECUTOR (Será executada após confirmação)

A fase de execução seguirá o plano acima, executando cada checklist item por item, registrando evidências em tempo real, e consolidando achados nos arquivos de saída.

---

## 🔍 FASE D: AGGREGATOR

Ao final de cada macrotarefa (M0-M8), consolidar:

- Findings em relatórios estruturados
- Evidências em `/audit/evidence/`
- Decisões e recomendações

---

## ✅ FASE E: VERIFIER

Ao final da auditoria, validar:

- Todos os itens críticos foram resolvidos ou têm plano de mitigação
- Documentação está completa e consistente
- Scripts de auditoria são repetíveis
- Backlog MVP é acionável

---

## 📝 DEFINITION OF DONE GERAL

Não finalizar antes de cumprir:

- [ ] Relatórios em `/audit/` completos e consistentes
- [ ] Sem vulnerabilidades críticas sem mitigação
- [ ] Scripts de auditoria repetíveis em `/tools/audit/`
- [ ] Setup local e docs de deploy prontos e testados
- [ ] Backlog MVP priorizado e acionável
- [ ] Todos os comandos e decisões registrados

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Revisar este plano
2. ⏸️ Aguardar confirmação do usuário
3. 🔄 Executar M0-M8 sequencialmente
4. 📊 Gerar relatório final consolidado
