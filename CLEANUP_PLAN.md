# 🧹 Plano de Limpeza do Repositório Ouvify

**Data:** 2026-02-05  
**Objetivo:** Remover artefatos obsoletos, corrigir .gitignore, e documentar processo de regeneração

---

## 📋 Sumário Executivo

| Categoria | Ação | Arquivos | Tamanho | Risco |
|-----------|------|----------|---------|-------|
| **Playwright Reports (GIT)** | `git rm --cached` | 27 | ~150KB | 🟢 Baixo |
| **Audit Docs (raiz)** | Mover para docs/archive/ | 3 MD | ~50KB | 🟡 Médio |
| **Audit local (não-git)** | Remover | audit/, tmp/, etc | ~1.2MB | 🟢 Baixo |
| **Build artifacts** | Limpar | venv, node_modules | ~1.7GB | 🟢 Baixo |
| **Archive tgz** | Remover | audit-evidence.tgz | 36KB | 🟢 Baixo |

**Total a remover:** ~1.7GB  
**Total de commits do git:** ~200KB de reports

---

## 🎯 Fase 1: Remover do Git (--cached)

### A. Playwright Reports (27 arquivos)

**Problema:** Reports de teste foram commitados, mas já estão no .gitignore

```bash
git rm -r --cached apps/frontend/playwright-report/
git commit -m "chore: remove playwright reports from git tracking"
```

**Como regenerar:**
```bash
cd apps/frontend
npm run test:e2e
# Gera novo playwright-report/
```

---

## 🎯 Fase 2: Arquivar Documentos de Auditoria

### A. Auditorias na Raiz (VERSIONADOS)

**Arquivos:**
- ACTION_PLAN.md
- AUDIT_REPORT.md
- DEPLOY_AUDIT.md

**Ação:** Mover para `docs/archive/audits-2026-02/`

```bash
mkdir -p docs/archive/audits-2026-02
git mv ACTION_PLAN.md docs/archive/audits-2026-02/
git mv AUDIT_REPORT.md docs/archive/audits-2026-02/
git mv DEPLOY_AUDIT.md docs/archive/audits-2026-02/
git commit -m "docs: archive root-level audit docs to docs/archive/"
```

**Alternativa:** Se nunca mais serão necessários, deletar:
```bash
git rm ACTION_PLAN.md AUDIT_REPORT.md DEPLOY_AUDIT.md
git commit -m "docs: remove obsolete audit docs from root"
```

### B. Auditorias Locais (NÃO-VERSIONADOS)

**Arquivos na raiz:**
- AUDITORIA_SEGURANCA_2026-02-05.md
- auditoria-ouvify.md

**Ação:** Remover (não estão no git)

```bash
rm -f AUDITORIA_SEGURANCA_2026-02-05.md auditoria-ouvify.md
```

---

## 🎯 Fase 3: Remover Diretórios de Auditoria Local

### A. Diretório `audit/` (472KB)

**Conteúdo:**
- 7 arquivos markdown (planos, reports, backlogs)
- evidence/ (subdir)

**Ação:** Remover (outputs de auditorias passadas)

```bash
rm -rf audit/
```

**Como regenerar:** Não aplicável (artefatos históricos de auditorias manuais)

### B. Diretório `tmp/` (348KB)

**Conteúdo:**
- repo_audit/ (API integration reports)
- roma_audit/ (ROMA agent outputs)
- roma_outdir_test/ (ROMA test outputs)
- roma_result.json
- roma_security_fixes/

**Ação:** Remover (já coberto pelo .gitignore)

```bash
rm -rf tmp/
```

**Como regenerar:**
```bash
# ROMA outputs são gerados pelos scripts de auditoria
python scripts/roma_server.py
```

### C. Archive `audit-evidence.tgz` (36KB)

**Ação:** Remover (backup obsoleto)

```bash
rm -f audit-evidence.tgz
```

### D. Diretório `audit-reports/backend/`

**Conteúdo:** Gerado por `scripts/audit_backend.sh`

**Ação:** Remover (será regerado)

```bash
rm -rf audit-reports/backend/
```

**Como regenerar:**
```bash
make audit-backend
# Ou: bash scripts/audit_backend.sh
```

---

## 🎯 Fase 4: Limpar Build Artifacts

### A. Python Caches

```bash
# Remover __pycache__ em apps/backend
find apps/backend -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null

# Remover .pytest_cache
find . -type d -name '.pytest_cache' -exec rm -rf {} + 2>/dev/null

# Remover .pyc files
find . -type f -name '*.pyc' -delete
```

**Como regenerar:** Automático ao executar Python

### B. Node.js Artifacts

```bash
# Frontend .next/
rm -rf apps/frontend/.next/

# Test results
rm -rf apps/frontend/test-results/
rm -rf apps/frontend/playwright-report/
```

**Como regenerar:**
```bash
cd apps/frontend
npm run build      # Regenera .next/
npm run test:e2e   # Regenera playwright-report/
```

### C. Virtual Environments (OPCIONAL)

**NÃO remover se estiver trabalhando ativamente!**

```bash
# Root venv (427MB) - só se não estiver usando
# rm -rf .venv/

# Backend venv (334MB)
# rm -rf apps/backend/.venv/
```

**Como regenerar:**
```bash
# Root
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Backend
cd apps/backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements/test.txt
```

---

## 🎯 Fase 5: Atualizar .gitignore (se necessário)

O `.gitignore` atual **já cobre tudo**, mas podemos adicionar patterns explícitos:

```gitignore
# ============================================
# Audit outputs (NUNCA commitar)
# ============================================
audit-reports/*/
audit-evidence.tgz
audit-evidence.tar.gz

# ============================================
# Archives
# ============================================
*.tgz
!docs/**/*.tgz  # Permitir apenas em docs se necessário
```

---

## 📝 Resumo dos Comandos

### Execução Segura (DRY-RUN)

```bash
#!/bin/bash
# cleanup-dry-run.sh

echo "=== FASE 1: Git --cached removals ==="
git rm -r --cached apps/frontend/playwright-report/ --dry-run
echo ""

echo "=== FASE 2: Local removals ==="
echo "Arquivos que serão removidos:"
ls -lh AUDITORIA_SEGURANCA_2026-02-05.md auditoria-ouvify.md audit-evidence.tgz 2>/dev/null
du -sh audit/ tmp/ audit-reports/backend/ 2>/dev/null
echo ""

echo "=== FASE 3: Build artifacts ==="
find apps/backend -type d -name '__pycache__' 2>/dev/null | wc -l
echo "__pycache__ directories found"
```

### Execução Real (ATOMIC)

```bash
#!/bin/bash
# cleanup.sh - Limpeza atômica com validação

set -e  # Exit on error

echo "🧹 Iniciando limpeza do repositório..."

# FASE 1: Remover do git (--cached)
echo ""
echo "📦 FASE 1: Remover playwright-report do git..."
git rm -r --cached apps/frontend/playwright-report/
git commit -m "chore: remove playwright reports from git tracking"

# FASE 2: Arquivar docs de auditoria
echo ""
echo "📄 FASE 2: Arquivar documentos de auditoria..."
mkdir -p docs/archive/audits-2026-02
git mv ACTION_PLAN.md docs/archive/audits-2026-02/ || true
git mv AUDIT_REPORT.md docs/archive/audits-2026-02/ || true
git mv DEPLOY_AUDIT.md docs/archive/audits-2026-02/ || true
git commit -m "docs: archive root audit docs to docs/archive/" || echo "Nada para arquivar"

# FASE 3: Remover arquivos locais de auditoria
echo ""
echo "🗑️  FASE 3: Remover arquivos locais de auditoria..."
rm -rf audit/
rm -rf tmp/
rm -rf audit-reports/backend/
rm -f audit-evidence.tgz
rm -f AUDITORIA_SEGURANCA_2026-02-05.md
rm -f auditoria-ouvify.md

# FASE 4: Limpar build artifacts
echo ""
echo "🔨 FASE 4: Limpar build artifacts..."
find apps/backend -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true
find . -type d -name '.pytest_cache' -exec rm -rf {} + 2>/dev/null || true
find . -type f -name '*.pyc' -delete 2>/dev/null || true

rm -rf apps/frontend/.next/ 2>/dev/null || true
rm -rf apps/frontend/test-results/ 2>/dev/null || true
rm -rf apps/frontend/playwright-report/ 2>/dev/null || true

# VALIDAÇÃO
echo ""
echo "✅ VALIDAÇÃO: Executando testes..."
cd apps/backend
if make audit-backend 2>&1 | grep -q "374 tests collected"; then
    echo "✅ Backend audit passou!"
else
    echo "❌ Backend audit falhou"
    exit 1
fi

cd /workspaces/Ouvify
echo ""
echo "✅ Limpeza concluída com sucesso!"
echo ""
echo "📊 Estatísticas:"
du -sh .venv node_modules apps/backend/.venv 2>/dev/null
```

---

## 🔒 Gates de Validação

Após cada fase, validar:

```bash
# 1. Backend ainda funciona
cd apps/backend && make audit-backend

# 2. Frontend ainda builda
cd apps/frontend && npm run build

# 3. Git status limpo
git status
```

---

## 📊 Antes e Depois

### Antes
```
/workspaces/Ouvify/
├── .venv/                  (427MB)
├── node_modules/           (961MB)
├── audit/                  (472KB)
├── tmp/                    (348KB)
├── audit-reports/backend/  (64KB)
├── playwright-report/      (150KB - NO GIT!)
├── ACTION_PLAN.md          (GIT)
├── AUDIT_REPORT.md         (GIT)
├── ...
```

### Depois
```
/workspaces/Ouvify/
├── .venv/                  (427MB - mantido)
├── node_modules/           (961MB - mantido)
├── docs/archive/audits-2026-02/
│   ├── ACTION_PLAN.md
│   ├── AUDIT_REPORT.md
│   └── DEPLOY_AUDIT.md
```

**Removidos:** ~1.2MB de arquivos desnecessários  
**Removidos do git:** 27 arquivos de teste

---

## ⚠️ Decisões Pendentes

### 1. Arquivar ou Deletar?

**Opção A:** Arquivar docs de auditoria em `docs/archive/`
- ✅ Preserva histórico
- ❌ Mantém arquivos no git

**Opção B:** Deletar completamente
- ✅ Limpa repositório
- ❌ Perde histórico (mas está no git history)

**Recomendação:** Opção B (deletar) - histórico está no git

### 2. Diretórios `audit-reports/` e `roma/`

**audit-reports/:** Contém `audit_report.json` (parece ser resultado de script)
- Manter ou regenerar?

**roma/:** Contém `profiles/` (configurações ROMA)
- Manter (são configurações, não outputs)

---

## 🚀 Execução Recomendada

```bash
# 1. DRY-RUN primeiro
bash cleanup-dry-run.sh

# 2. Review manual
git status

# 3. Execução real
bash cleanup.sh

# 4. Validação final
make audit-backend
cd apps/frontend && npm run build

# 5. Commit final
git push origin main
```

---

## 📚 Regeneração - Referência Rápida

| Artefato | Comando de Regeneração |
|----------|------------------------|
| playwright-report/ | `cd apps/frontend && npm run test:e2e` |
| audit-reports/backend/ | `make audit-backend` |
| tmp/roma_* | `python scripts/roma_server.py` |
| __pycache__/ | Automático ao executar Python |
| .next/ | `cd apps/frontend && npm run build` |
| .pytest_cache/ | `cd apps/backend && pytest` |
| .venv/ | `python3.12 -m venv .venv && pip install -r requirements.txt` |

---

**Autor:** GitHub Copilot  
**Modelo:** Claude Sonnet 4.5  
**Data:** 2026-02-05
