# 🎯 PLANO DE AUDITORIA COMPLETA - OUVIFY

**Data:** 05 de Fevereiro de 2026  
**Framework:** ROMA (Reasoning On Multiple Abstractions)  
**Executor:** GitHub Copilot Agent (Claude Sonnet 4.5)  
**Status ROMA:** ✅ Rodando em http://127.0.0.1:5000 (PID:134315)

---

## 📊 CONTEXTO E OBJETIVOS

### Projeto

**Nome:** Ouvify  
**Tipo:** SaaS White Label - Canal de Feedback/Denúncia/Reclamação  
**Arquitetura:** Monorepo

- **Backend:** Django 5.1, Python 3.13, PostgreSQL, Redis, ElasticSearch
- **Frontend:** Next.js 16, React 19, TypeScript
- **Deploy:** Render (backend) + Vercel (frontend)

### Objetivos da Auditoria

1. **Status Atual:** Mapear completude do projeto (feature-complete?)
2. **Integridade:** Duplicações, dead code, imports quebrados, rotas faltantes
3. **Segurança:** Vulnerabilidades críticas (OWASP Top 10, secrets, auth, IDOR)
4. **Performance:** Gargalos backend/frontend (latência, N+1, bundle)
5. **Conformidade:** LGPD/GDPR (dados sensíveis, direitos do titular)
6. **Documentação:** Técnica + Manuais de usuário (admin empresa + usuário final)
7. **Backlog MVP:** Lista priorizada P0/P1/P2 para finalizar

### Restrições

- ❌ Sem APIs externas (OpenAI, Gemini, Anthropic, OpenRouter)
- ✅ Apenas recursos locais: Docker, Python, Node, curl, Copilot
- ❌ Sem exfiltração de dados
- ✅ Evidências registradas em `/audit/evidence/`

---

## 🧩 FASE A: ATOMIZER - DECOMPOSIÇÃO MECE

### Macrotarefas (Mutuamente Exclusivas, Coletivamente Exaustivas)

| ID      | Macrotarefa       | Script                     | Esforço | Output                             |
| ------- | ----------------- | -------------------------- | ------- | ---------------------------------- |
| **M0**  | Bootstrap ROMA    | `roma_bootstrap.sh`        | 5min    | ROMA rodando + health check        |
| **M1**  | Inventário        | `audit_inventory.sh`       | 15min   | `/audit/INVENTORY.md`              |
| **M2**  | Integridade       | `audit_integrity.sh`       | 20min   | `/audit/DUPLICATION_REDUNDANCY.md` |
| **M3**  | Backend           | `audit_backend.sh`         | 30min   | Testes + lint + validações         |
| **M4**  | Frontend          | `audit_frontend.sh`        | 20min   | Testes + build + rotas             |
| **M5**  | Segurança         | `audit_security.sh`        | 45min   | `/audit/SECURITY_REVIEW.md`        |
| **M6**  | Performance       | `audit_performance.sh`     | 15min   | `/audit/PERFORMANCE_REVIEW.md`     |
| **M7**  | Conformidade LGPD | `audit_compliance_lgpd.sh` | 20min   | `/audit/COMPLIANCE_LGPD.md`        |
| **M8**  | Agregação         | Copilot                    | 30min   | `/audit/AUDIT_REPORT.md` + backlog |
| **M9**  | Verificação       | Re-rodar scripts           | 15min   | Validar P0s corrigidos             |
| **M10** | Documentação      | Copilot                    | 30min   | `/docs/*` completos                |

**Total Estimado:** 4 horas

---

## 📋 FASE B: PLANNER - PLANO DETALHADO

### M0: Bootstrap ROMA ✅ CONCLUÍDO

- [x] Instalar Flask
- [x] Iniciar servidor ROMA local
- [x] Health check: http://127.0.0.1:5000/health
- [x] PID: 134315
- [x] Logs: `/audit/evidence/roma_server.log`

**Status:** ✅ HEALTHY

---

### M1: Inventário do Monorepo

**Script:** `audit_inventory.sh`

**Checklist:**

- [ ] Estrutura de diretórios (excluir node_modules, **pycache**)
- [ ] Apps Django: `/apps/backend/apps/*`
- [ ] Páginas Next.js: `/apps/frontend/app/*`
- [ ] Dependências: `pip list`, `npm list`
- [ ] Dockerfiles e docker-compose
- [ ] Scripts de build/deploy
- [ ] Variáveis de ambiente esperadas (.env.example)
- [ ] Rotas backend (endpoints Django/DRF)
- [ ] Rotas frontend (pages Next.js)
- [ ] Diagrama Mermaid (arquitetura)

**Output:** `/audit/INVENTORY.md`

**DoD:**

- Mapa completo do monorepo
- Lista de rotas backend e frontend
- Diagrama de arquitetura
- Dependências catalogadas

---

### M2: Integridade e Duplicações

**Script:** `audit_integrity.sh`

**Checklist:**

- [ ] Buscar pastas legacy: `old/`, `backup/`, `v1/`, `v2/`, `tmp/`
- [ ] Dependências duplicadas (Python + Node)
- [ ] Código duplicado (funções/componentes similares)
- [ ] Imports quebrados (Python: import errors)
- [ ] Imports quebrados (TypeScript: Module not found)
- [ ] Assets faltantes (imagens/arquivos referenciados mas inexistentes)
- [ ] Rotas sem handler (backend)
- [ ] Páginas sem rota (frontend)
- [ ] Dead code (funções nunca chamadas, componentes não importados)
- [ ] Linters (pylint backend, eslint frontend)

**Output:** `/audit/DUPLICATION_REDUNDANCY.md`

**DoD:**

- Lista de duplicações com decisão (manter/remover)
- Top 10 imports quebrados identificados
- Dead code catalogado
- Recomendações de limpeza

---

### M3: Auditoria Backend

**Script:** `audit_backend.sh`

**Checklist:**

- [ ] Rodar testes: `pytest --cov`
- [ ] Cobertura mínima: 70%
- [ ] Linter: `pylint apps/`
- [ ] Type checking: `mypy apps/` (se configurado)
- [ ] Validações de entrada (serializers)
- [ ] Multi-tenant isolation (queries filtradas por `client`)
- [ ] RBAC (owner/admin/viewer permissions)
- [ ] Logs não contêm dados sensíveis
- [ ] Migrations íntegras (`makemigrations --check`)
- [ ] Endpoints principais funcionam (smoke tests)

**Output:**

- `/audit/evidence/backend_tests.log`
- `/audit/evidence/backend_lint.log`

**DoD:**

- Testes passam
- Cobertura ≥ 70% ou gaps identificados
- Validação multi-tenant confirmada
- Sem erros críticos de lint

---

### M4: Auditoria Frontend

**Script:** `audit_frontend.sh`

**Checklist:**

- [ ] Rodar testes: `npm run test`
- [ ] Build produção: `npm run build`
- [ ] Linter: `npm run lint`
- [ ] Type checking: `tsc --noEmit`
- [ ] Rotas principais existem (páginas críticas)
- [ ] API calls apontam para URLs corretas
- [ ] Env vars configuradas (NEXT*PUBLIC*\*)
- [ ] Bundle size aceitável (< 200KB gzipped)
- [ ] Lazy loading implementado
- [ ] XSS prevention (sanitização de HTML)

**Output:**

- `/audit/evidence/frontend_tests.log`
- `/audit/evidence/frontend_build.log`
- `/audit/evidence/frontend_lint.log`

**DoD:**

- Build passa sem erros
- Rotas principais mapeadas
- Bundle size documentado
- Sem erros críticos de lint

---

### M5: Segurança (CRÍTICO)

**Script:** `audit_security.sh`

**Checklist:**

- [ ] **Secrets scan:**
  - [ ] `.env` não commitado
  - [ ] Nenhum token/chave hardcoded em código
  - [ ] `.gitignore` atualizado
- [ ] **Dependências vulneráveis:**
  - [ ] `pip-audit` (backend)
  - [ ] `npm audit` (frontend)
  - [ ] CVEs críticas/altas identificadas
- [ ] **SAST local:**
  - [ ] Semgrep via Docker (se disponível)
  - [ ] Ou checklist OWASP manual
- [ ] **OWASP Top 10 2021:**
  - [ ] A01: Broken Access Control (IDOR, multi-tenant)
  - [ ] A02: Cryptographic Failures (TLS, hashing)
  - [ ] A03: Injection (SQL, XSS, Command)
  - [ ] A04: Insecure Design (anonimato, protocolo)
  - [ ] A05: Security Misconfiguration (DEBUG, ALLOWED_HOSTS)
  - [ ] A06: Vulnerable Components (já em dependências)
  - [ ] A07: Auth Failures (rate limit, 2FA, JWT)
  - [ ] A08: Data Integrity (upload validation)
  - [ ] A09: Logging Failures (audit log, sem PII)
  - [ ] A10: SSRF (webhooks, URLs externas)
- [ ] **CSRF & CORS:**
  - [ ] CSRF protection ativo
  - [ ] CORS não usa `*` em produção
- [ ] **Headers de Segurança:**
  - [ ] HSTS, X-Frame-Options, CSP
- [ ] **Rate Limiting:**
  - [ ] Login, register, password reset

**Output:** `/audit/SECURITY_REVIEW.md`

**DoD:**

- Vulnerabilidades CRÍTICAS = 0 (ou mitigadas)
- Vulnerabilidades ALTAS ≤ 2 (com plano)
- Secrets não expostos
- OWASP Top 10 verificado

---

### M6: Performance

**Script:** `audit_performance.sh`

**Checklist:**

- [ ] **Backend:**
  - [ ] Endpoints críticos: latência < 500ms (p95)
  - [ ] N+1 queries (verificar `select_related`, `prefetch_related`)
  - [ ] Paginação implementada
  - [ ] Caching em analytics
- [ ] **Frontend:**
  - [ ] Bundle size (First Load JS)
  - [ ] Lazy loading de componentes
  - [ ] Imagens otimizadas (next/image)
  - [ ] SWR para caching de API calls
- [ ] **Quick wins:**
  - [ ] Adicionar índices de DB faltantes
  - [ ] Implementar `select_related` onde necessário
  - [ ] Adicionar cache em endpoints lentos

**Output:** `/audit/PERFORMANCE_REVIEW.md`

**DoD:**

- Latência de endpoints críticos medida
- N+1 identificados (top 3)
- Bundle size documentado
- 2-3 quick wins implementados

---

### M7: Conformidade LGPD ✅ SCRIPT CRIADO

**Script:** `audit_compliance_lgpd.sh`

**Checklist:**

- [x] Mapear dados pessoais coletados
- [x] Verificar direitos do titular (Art. 18)
- [x] Base legal (consentimento, legítimo interesse)
- [x] Minimização de dados
- [x] Retenção e eliminação
- [x] Segurança dos dados
- [x] DPO/Encarregado
- [x] Política de Privacidade (template)
- [x] Contrato de Processamento (DPA)

**Output:** `/audit/COMPLIANCE_LGPD.md` (30KB, template completo)

**DoD:**

- Mapa completo de dados pessoais
- Direitos do titular verificados
- Gaps P0/P1/P2 identificados
- Templates legais criados

---

### M8: Agregação e Relatório Final

**Executor:** Copilot (após todos os scripts)

**Checklist:**

- [ ] Consolidar todos os logs de evidência
- [ ] Criar `/audit/AUDIT_REPORT.md` com:
  - [ ] Status geral do projeto (% completude)
  - [ ] Resumo de vulnerabilidades
  - [ ] Findings por categoria
  - [ ] O que falta para MVP (feature-complete)
- [ ] Criar backlog priorizado em `/audit/MVP_BACKLOG.md`:
  - [ ] P0 (bloqueadores)
  - [ ] P1 (alta prioridade)
  - [ ] P2 (melhorias)
  - [ ] Para cada item: descrição, impacto, esforço, arquivos, critério de aceite

**Output:**

- `/audit/AUDIT_REPORT.md`
- `/audit/MVP_BACKLOG.md`

**DoD:**

- Relatório consolidado completo
- Backlog acionável
- Decisões documentadas

---

### M9: Verificação (Re-run)

**Executor:** Copilot + scripts

**Checklist:**

- [ ] Re-rodar scripts para validar correções
- [ ] Verificar que P0s foram resolvidos ou mitigados
- [ ] Documentar antes/depois

**Output:** `/audit/evidence/verifier_rerun.log`

**DoD:**

- P0s comprovadamente corrigidos
- Evidências registradas

---

### M10: Documentação Completa

**Executor:** Copilot

**Checklist:**

- [ ] `/docs/README.md` - Overview do produto
- [ ] `/docs/SETUP_LOCAL.md` - Como rodar local (ROMA + Ouvify)
- [ ] `/docs/DEPLOYMENT.md` - Render/Vercel deploy
- [ ] `/docs/API.md` - Endpoints, autenticação, exemplos curl
- [ ] `/docs/USER_GUIDE_COMPANY_ADMIN.md` - Manual admin empresa
- [ ] `/docs/USER_GUIDE_END_USER.md` - Manual usuário final
- [ ] `/docs/RUNBOOK.md` - Operação, incidentes, backups
- [ ] `/docs/SECURITY.md` - Hardening, headers, resposta a incidentes
- [ ] `/docs/CHANGELOG.md` - Versões e mudanças
- [ ] `/docs/ADR/` - 3-5 decisões arquiteturais

**DoD:**

- Todos os documentos criados/atualizados
- Setup local funcional (30min para rodar)
- Manuais claros e objetivos

---

## 🔄 FASE C: EXECUTOR - EXECUÇÃO

### Ordem de Execução

```bash
# 1. Bootstrap ROMA (já feito ✅)
./tools/audit/roma_bootstrap.sh

# 2. Auditoria completa
./tools/audit/run_all.sh --full

# Ou individual:
./tools/audit/run_all.sh --only audit_inventory
./tools/audit/run_all.sh --only audit_integrity
./tools/audit/run_all.sh --only audit_backend
./tools/audit/run_all.sh --only audit_frontend
./tools/audit/run_all.sh --only audit_security
./tools/audit/run_all.sh --only audit_performance
./tools/audit/run_all.sh --only audit_compliance_lgpd
```

### Critérios de Parada (Exit on Failure)

- **P0 detectado em segurança:** parar, corrigir, re-rodar
- **Testes críticos falhando:** parar, corrigir, re-rodar
- **Build quebrado:** parar, corrigir, re-rodar

---

## 📊 FASE D: AGGREGATOR - CONSOLIDAÇÃO

Após execução de todos os scripts:

1. Ler todos os logs em `/audit/evidence/`
2. Consolidar findings em categorias (P0/P1/P2)
3. Gerar relatório final `/audit/AUDIT_REPORT.md`
4. Gerar backlog acionável `/audit/MVP_BACKLOG.md`
5. Atualizar documentação

---

## ✅ FASE E: VERIFIER - VERIFICAÇÃO

1. Re-rodar scripts para itens corrigidos
2. Validar que P0s estão resolvidos
3. Documentar antes/depois com evidências
4. Registrar em `/audit/evidence/verifier_rerun.log`

---

## 🎯 DEFINITION OF DONE GERAL

Não finalizar antes de:

- [ ] ROMA rodando e saudável
- [ ] Todos os scripts executados
- [ ] Relatório `/audit/AUDIT_REPORT.md` completo
- [ ] Backlog `/audit/MVP_BACKLOG.md` priorizado
- [ ] Vulnerabilidades P0 = 0 (ou mitigadas)
- [ ] Documentação em `/docs/` completa
- [ ] Setup local testado (< 30min para rodar)
- [ ] Evidências em `/audit/evidence/` completas

---

## 📈 MÉTRICAS DE SUCESSO

| Métrica                      | Baseline | Objetivo | Atual |
| ---------------------------- | -------- | -------- | ----- |
| Vulnerabilidades Críticas    | ?        | 0        | ?     |
| Cobertura de Testes Backend  | ?        | ≥70%     | ?     |
| Cobertura de Testes Frontend | ?        | ≥60%     | ?     |
| Bundle Size (First Load)     | ?        | <200KB   | ?     |
| Latência p95 (endpoints)     | ?        | <500ms   | ?     |
| Documentação Completa        | ?        | 100%     | ?     |
| Completude MVP               | ~85%     | 95%      | ?     |

---

## 🔧 PRÓXIMOS PASSOS

1. ✅ ROMA bootstrapped
2. 🔄 Executar `./tools/audit/run_all.sh --full`
3. 📊 Analisar evidências
4. 🔨 Corrigir P0s encontrados
5. ✅ Re-rodar verificação
6. 📝 Gerar documentação
7. 🎯 Backlog MVP priorizado

---

**Status:** 🟢 PRONTO PARA EXECUÇÃO  
**ROMA:** ✅ http://127.0.0.1:5000  
**Próximo comando:** `./tools/audit/run_all.sh --full`
