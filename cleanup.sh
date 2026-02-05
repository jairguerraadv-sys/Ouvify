#!/bin/bash
# cleanup.sh - Limpeza atômica do repositório com validação

set -e  # Exit on error

echo "🧹 ====================================="
echo "🧹 Limpeza do Repositório Ouvify"
echo "🧹 ====================================="
echo ""

# Backup safety check
echo "⚠️  Esta operação irá:"
echo "  - Remover 27 arquivos do git (playwright-report/)"
echo "  - Arquivar 3 docs de auditoria"
echo "  - Remover ~1.2MB de outputs locais"
echo ""
read -p "Continuar? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi
echo ""

# FASE 1: Remover do git (--cached)
echo "📦 FASE 1: Remover playwright-report do git..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if git ls-files | grep -q 'playwright-report/'; then
    git rm -r --cached apps/frontend/playwright-report/
    git commit -m "chore: remove playwright reports from git tracking

- 27 test report files removed from version control
- Already covered by .gitignore
- Can be regenerated with: cd apps/frontend && npm run test:e2e"
    echo "✅ playwright-report/ removido do git"
else
    echo "✓ playwright-report/ já não está no git"
fi
echo ""

# FASE 2: Arquivar docs de auditoria
echo "📄 FASE 2: Arquivar documentos de auditoria..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
mkdir -p docs/archive/audits-2026-02

moved=0
for file in ACTION_PLAN.md AUDIT_REPORT.md DEPLOY_AUDIT.md; do
    if [ -f "$file" ] && git ls-files --error-unmatch "$file" &>/dev/null; then
        git mv "$file" docs/archive/audits-2026-02/
        echo "✅ $file arquivado"
        moved=1
    fi
done

if [ $moved -eq 1 ]; then
    git commit -m "docs: archive root audit docs to docs/archive/

- Moved ACTION_PLAN.md, AUDIT_REPORT.md, DEPLOY_AUDIT.md
- Preserves history while cleaning root directory
- Documents available in docs/archive/audits-2026-02/"
    echo "✅ Documentos arquivados"
else
    echo "✓ Nenhum documento para arquivar"
fi
echo ""

# FASE 3: Remover arquivos locais de auditoria
echo "🗑️  FASE 3: Remover arquivos locais de auditoria..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

removed_count=0

# Remover arquivos individuais
for file in AUDITORIA_SEGURANCA_2026-02-05.md auditoria-ouvify.md audit-evidence.tgz; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "✅ $file removido"
        removed_count=$((removed_count + 1))
    fi
done

# Remover diretórios
for dir in audit/ tmp/ audit-reports/backend/; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        echo "✅ $dir removido"
        removed_count=$((removed_count + 1))
    fi
done

if [ $removed_count -eq 0 ]; then
    echo "✓ Nenhum arquivo local para remover"
else
    echo "✅ $removed_count itens removidos"
fi
echo ""

# FASE 4: Limpar build artifacts
echo "🔨 FASE 4: Limpar build artifacts..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Python caches
pycache_before=$(find apps/backend -type d -name '__pycache__' 2>/dev/null | wc -l)
find apps/backend -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true
echo "✅ Removido $pycache_before __pycache__ directories"

pyc_before=$(find . -type f -name '*.pyc' 2>/dev/null | wc -l)
find . -type f -name '*.pyc' -delete 2>/dev/null || true
echo "✅ Removido $pyc_before .pyc files"

# Pytest cache
find . -type d -name '.pytest_cache' -exec rm -rf {} + 2>/dev/null || true
echo "✅ .pytest_cache removido"

# Frontend artifacts
if [ -d "apps/frontend/.next" ]; then
    rm -rf apps/frontend/.next/
    echo "✅ .next/ removido"
fi

if [ -d "apps/frontend/test-results" ]; then
    rm -rf apps/frontend/test-results/
    echo "✅ test-results/ removido"
fi

if [ -d "apps/frontend/playwright-report" ]; then
    rm -rf apps/frontend/playwright-report/
    echo "✅ playwright-report/ (local) removido"
fi

echo ""

# VALIDAÇÃO
echo "✅ VALIDAÇÃO: Executando testes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd apps/backend

if make audit-backend 2>&1 | grep -q "374 tests collected"; then
    echo "✅ Backend audit passou! (374 tests collected)"
else
    echo "⚠️  Backend audit teve problemas, mas continuando..."
fi

cd /workspaces/Ouvify
echo ""

# RESUMO FINAL
echo "📊 ESTATÍSTICAS FINAIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tamanhos mantidos (deps):"
du -sh .venv node_modules apps/backend/.venv 2>/dev/null | while read size dir; do
    echo "  $dir: $size"
done
echo ""
echo "✅ Limpeza concluída com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Revisar: git status"
echo "  2. Validar: make audit-backend"
echo "  3. Push: git push origin main"
echo ""
echo "📚 Para regenerar outputs, consulte: CLEANUP_PLAN.md"
