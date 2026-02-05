# 🎯 Integration Audit Plan - Ouvify

**Data:** 2026-02-05  
**Versão:** 1.0  
**Status:** Em Execução

---

## 📋 Sumário Executivo

Este documento detalha o plano completo de auditoria de integração frontend↔backend do monorepo Ouvify, seguindo a metodologia ROMA (Reasoning-Oriented Multi-Agent).

**Objetivo:** Corrigir 100% a integração entre frontend (Vercel/Next.js) e backend (Render/Django) e eliminar rotas/APIs órfãs ou não integradas até o produto ficar funcional ponta-a-ponta.

---

## 🚨 Problemas Identificados (P0 - Críticos)

### P0.1: Manifest 404 ✅ **RESOLVIDO**
- **Status:** ✅ Corrigido  
- **Problema:** `site.webmanifest` e `manifest.json` ausentes em `/apps/frontend/public/`
- **Impacto:** PWA não funciona, erro 404 no console
- **Solução:** Criados ambos os arquivos com configuração completa
- **Evidência:** `audit/evidence/static_assets.log`

### P0.2: CSP Configurado ✅ **RESOLVIDO**
- **Status:** ✅ Corrigido (aguardando deploy)
- **Problema:** Content Security Policy ausente em produção
- **Impacto:** Vulnerabilidade de segurança XSS
- **Solução Implementada:**
  1. ✅ Arquivo `csp-config.js` já existia com configuração completa
  2. ✅ Ativado no `next.config.js` (importação + header CSP)
  3. ✅ Whitelist: Stripe, Sentry, Vercel Analytics, Backend API
  4. ✅ Ambiente-aware: production (restritivo) vs development (permissivo)
- **Evidência:** `audit/P0.2_CSP_FIX.md`
- **DoD:** ✅ Headers CSP configurados localmente, aguardando validação em produção

### P0.3: React Error #418 🔍 **INVESTIGAÇÃO**
- **Status:** 🔍 Aguardando reprodução
- **Problema:** "Minified React error #418" em produção
- **Possíveis Causas:**
  - Hydration mismatch (SSR vs Client)
  - Uso de APIs do browser (`window`, `document`) durante SSR
  - Marcação HTML inválida
- **Próximos Passos:** Executar guia `tools/audit/repro_react418.md`

### P0.4: Endpoints Backend Críticos ✅ **FALSO POSITIVO**
- **Status:** ✅ Endpoints existem
- **Nota:** Script de auditoria gerou falsos positivos ao escanear código compilado do Next.js (.next/)
- **Endpoints Validados:**
  - ✅ `/api/check-subdominio/` - EXISTE (apps/backend/config/urls.py:135)
  - ✅ `/api/tenant-info/` - EXISTE
  - ✅ `/api/token/` - EXISTE (DRF SimpleJWT)
  - ✅ `/api/register-tenant/` - EXISTE
- **Ação:** Melhorar script `audit_contract_frontend.py` para ignorar `.next/`

### P0.5: Rota /enviar 500 🔍 **PENDENTE**
- **Status:** 🔍 Não reproduzido localmente
- **Problema:** Erro 500 na rota `/enviar`
- **Próximos Passos:**
  1. Mapear rota no frontend e backend
  2. Reproduzir localmente com frontend em dev mode
  3. Capturar stack trace completo

---

## 🏗️ Estratégia ROMA

### A. ATOMIZER - Subtarefas MECE

1. **Contract Audit** ✅
   - Extrair endpoints do frontend
   - Extrair endpoints do backend
   - Comparar contratos

2. **Connectivity Tests** ✅
   - Smoke tests em ambientes de produção
   - Verificar CORS, HTTPS, timeouts

3. **Static Assets** ✅
   - Verificar manifest
   - Verificar favicon, robots.txt
   - Validar configuração PWA

4. **Security** ⚠️
   - CSP headers
   - CORS configuration
   - Authentication flows

5. **Stability** 🔍
   - React hydration errors
   - 500 errors
   - Network timeouts

6. **Deploy Config** 📝
   - Vercel configuration
   - Render configuration
   - Environment variables

### B. PLANNER - Checklist

- [x] Criar estrutura `/audit`, `/tools/audit`, `/evidence`
- [x] Clonar e configurar ROMA
- [x] Criar scripts de auditoria (7 scripts)
- [x] Executar auditoria completa
- [x] Gerar CONTRACT_MATRIX.md
- [x] **P0.1:** Corrigir manifest 404 ✅
- [x] **P0.2:** Configurar CSP ✅
- [ ] **P0.3:** Reproduzir e corrigir React #418
- [x] **P0.4:** Validar todos endpoints críticos ✅ (falsos positivos)
- [ ] **P0.5:** Corrigir /enviar 500
- [ ] Deploy e validação CSP em staging
- [ ] Verificação final (smoke tests)
- [ ] Deploy produção

### C. EXECUTOR - Implementação

**Scripts Criados:**

1. ✅ `tools/audit/roma_bootstrap.sh` - Bootstrap ROMA framework
2. ✅ `tools/audit/audit_contract_frontend.py` - Extrai endpoints do frontend
3. ✅ `tools/audit/audit_contract_backend.py` - Extrai rotas do backend (Django)
4. ✅ `tools/audit/contract_diff.py` - Compara contratos e gera matriz
5. ✅ `tools/audit/smoke_env.sh` - Smoke tests em produção
6. ✅ `tools/audit/check_static_assets.sh` - Valida assets estáticos
7. ✅ `tools/audit/check_csp.sh` - Analisa CSP headers
8. ✅ `tools/audit/repro_react418.md` - Guia de reprodução React #418
9. ✅ `tools/audit/run_integration_audit.sh` - Master script

**Execução Master:**
```bash
cd /workspaces/Ouvify
bash tools/audit/run_integration_audit.sh
```

### D. AGGREGATOR - Consolidação

**Evidências Geradas:** (em `audit/evidence/`)
- `frontend_endpoints.json` - 94 endpoints únicos do frontend
- `backend_endpoints.json` - 174 endpoints únicos do backend (Django/DRF)
- `CONTRACT_MATRIX.md` - Matriz de contrato FE↔BE
- `smoke_env.log` - Resultado dos smoke tests
- `static_assets.log` - Validação de assets estáticos
- `csp_headers.log` - Análise de headers CSP
- `roma_*.log` - Logs de bootstrap do ROMA

**Relatórios:**
- `audit/CONTRACT_MATRIX.md` ✅
- `audit/INTEGRATION_AUDIT_PLAN.md` ✅ (este documento)
- `audit/INTEGRATION_AUDIT_REPORT.md` 🔄 (em construção)

### E. VERIFIER - Validação

**Pre-Deploy Checklist:**
- [ ] Todos os P0s resolvidos
- [ ] Smoke tests passando (100%)
- [ ] CSP configurado sem violações
- [ ] React #418 não ocorre no fluxo básico
- [ ] Login/Cadastro funcionando ponta-a-ponta
- [ ] Manifest servido corretamente

---

## 📊 Métricas de Qualidade

### Antes da Auditoria
- ❌ Manifest: 404
- ❌ CSP: Não configurado
- ❌ React Error: #418 em produção
- ❌ Smoke Tests: 8/8 falhas (ambiente down)
- ⚠️  Contract Coverage: Desconhecida

### Após Correções (Target)
- ✅ Manifest: 200 OK
- ✅ CSP: Configurado + nonces
- ✅ React Error: Nenhum erro
- ✅ Smoke Tests: 8/8 passando
- ✅ Contract Coverage: >95%

---

## 🔄 Iterações

### Iteração 1 (2026-02-05) ✅
- ✅ Setup completo da infraestrutura de auditoria
- ✅ Scripts de extração e comparação de contratos
- ✅ Identificação de P0s
- ✅ Correção: Manifest 404

### Iteração 2 (2026-02-05) ✅
- ✅ Configuração CSP (P0.2)
  - Ativado csp-config.js no next.config.js
  - Whitelist: Stripe, Sentry, Vercel Analytics, Backend API
  - Validação local: PASS
- ✅ Validação endpoints críticos (P0.4)
  - check-subdominio, tenant-info, token, register-tenant: todos EXISTEM
  - Falsos positivos do scanner confirmados
- 📄 Documentação completa gerada
  - INTEGRATION_AUDIT_REPORT.md
  - P0.2_CSP_FIX.md

### Iteração 3 (Próxima) 📅
- Deploy CSP em staging/produção
- Reprodução React #418 (P0.3)
- Validação /enviar (P0.5)
- Smoke tests completos
- Validação ponta-a-ponta

---

## 📝 Notas e Observações

### Falsos Positivos no Contract Audit
O script `audit_contract_frontend.py` inicialmente gerou muitos falsos positivos ao escanear código compilado do Next.js (`.next/` directory). Endpoints como `/a`, `/b`, `/token`, `/set-cookie`, etc. não são chamadas de API reais, mas artefatos de build/runtime do Next.js.

**Melhoria Necessária:** Adicionar filtro para excluir `.next/`, `node_modules/`, e outros diretórios de build.

### Ambientes de Produção Inacessíveis
Durante os smoke tests, tanto frontend (Vercel) quanto backend (Render) retornaram 404 ou connection errors. Isso pode indicar:
- Ambientes temporariamente down
- URLs incorretas
- Necessidade de autenticação

**Ação:** Validar URLs e credenciais dos ambientes de produção/staging.

---

## 🔗 Referências

- [CONTRACT_MATRIX.md](CONTRACT_MATRIX.md) - Matriz completa de contratos FE↔BE
- [ROMA Framework](https://github.com/sentient-agi/ROMA) - Metodologia de auditoria
- [React Error Decoder #418](https://reactjs.org/docs/error-decoder.html/?invariant=418)
- [Next.js Hydration Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [CSP Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Última atualização:** 2026-02-05 21:30  
**Próxima revisão:** Após completar P0.2 e P0.3
